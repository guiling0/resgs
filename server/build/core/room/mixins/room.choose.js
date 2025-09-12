"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomChooseMixin = void 0;
const choose_types_1 = require("../../choose/choose.types");
class RoomChooseMixin {
    constructor() {
        this.globalLock = false;
    }
    /** 发起一个询问
     * @returns 返回发起的询问
     */
    async doRequest(options) {
        if (!options || !options.player)
            return;
        const req = Object.assign({}, {
            id: this.requestids++,
            room: this,
        }, options);
        if (this.gameState !== 1 /* GameState.Gaming */)
            return;
        await new Promise((reslove, reject) => {
            req.resolve = reslove;
            req.complete = false;
            req.timeout = false;
            this.fillRequest(req);
            let maxms = req.options.ms;
            const selectors = Object.assign({}, req.selectors);
            req.result = req.result ?? {};
            req.result.results = {};
            Object.keys(selectors).forEach((k) => {
                const v = selectors[k];
                // if (!v) {
                //     delete selectors[k];
                //     return;
                // }
                req.result.results[k] = {
                    type: v.type,
                    result: [],
                    windowResult: [],
                };
                // if (
                //     v.type !== 'player' &&
                //     (!v.selectable || v.selectable.length === 0)
                // ) {
                //     delete selectors[k];
                // }
            });
            this.requests.push(req);
            // if (
            //     Object.keys(selectors).length === 0 &&
            //     !req.options.cac &&
            //     !req.options.isPlayPhase
            // ) {
            //     req.result.cancle = true;
            //     reslove(void 0);
            //     return;
            // }
            const { selectorId, context } = req.get_selectors;
            this.broadcast({
                type: 'MsgRequest',
                id: req.id,
                player: req.player.playerId,
                get_selectors: {
                    selectorId,
                    context: this.toJson_Context(context),
                },
            });
            if (req.player.hasMark('__offline') ||
                req.player.hasMark('__escape') ||
                req.player.hasMark('__leave'))
                maxms = 0.1;
            else if (req.player.hasMark('__trustship'))
                maxms = 1;
            setTimeout(() => {
                if (!req.complete) {
                    this.response({
                        id: req.id,
                        timeout: true,
                        cancle: true,
                        results: {},
                    });
                }
            }, (maxms + 1) * 1000);
        }).then(() => {
            req.resolve = undefined;
            req.complete = true;
            this.broadcast({
                type: 'MsgRequest',
                id: req.id,
                complete: true,
            });
            lodash.remove(this.requests, (c) => c === req);
        });
        return req;
    }
    /** 发起一堆询问，并等待所有结果返回
     * @returns 返回发起的所有询问
     */
    async doRequestAll(options) {
        return await Promise.all(options.map((v) => this.doRequest(v)));
    }
    /** 发起一堆询问，并等待第一个非取消结果返回
     * @returns 返回第一个完成的询问
     */
    async doRequestRace(options) {
        let result;
        await Promise.all(options.map((v) => this.doRequest(v).then((req) => {
            if (req && !result && !req.result?.cancle) {
                result = req;
                this.requests.forEach((r) => {
                    if (!r.complete) {
                        r.resolve(void 0);
                    }
                });
            }
        })));
        return result;
    }
    /** 询问结果返回 */
    response(result) {
        const req = this.requests.find((v) => v.id === result.id);
        if (req && !req.complete) {
            req.timeout = result.timeout;
            if (req.timeout) {
                this.defaultRequest(req);
            }
            else {
                req.result = {
                    cancle: result.cancle,
                    use_or_play_card: result.use_or_play_card,
                    selected_skill: result.selected_skill,
                    playphase: result.playphase,
                    results: this.toData_SelectorResult(result.results),
                    sort_result: result.sort_result?.map((v) => {
                        return {
                            title: v.title,
                            items: this.getCards(v.items),
                        };
                    }) ?? [],
                };
            }
            if (req.resolve)
                req.resolve(void 0);
        }
    }
    /**
     * 询问玩家发动技能并按照技能的cost进行选择
     * @param player 询问的玩家
     * @param skill 要发动的技能
     */
    async askForSkillInvoke(player, skills) {
        const selectors = [];
        skills.forEach((v, k) => {
            selectors.push({
                selectorId: k.getSelectorName('skill_cost'),
                context: this.toJson_Context(v),
            });
        });
        if (selectors.length === 0)
            return;
        if (selectors.length === 1) {
            const { selectorId, context } = selectors[0];
            const effect = this.getEffect(context.effect);
            if (effect && effect.data.forced !== 'cost') {
                const e = this.getSelectors(selectorId, this.toData_Context(context));
                if ((effect.isOpen() || effect.hasTag(9 /* SkillTag.Secret */)) &&
                    (!e || !e.options?.canCancle)) {
                    return effect;
                }
            }
        }
        return await this.doRequest({
            player,
            get_selectors: {
                selectorId: this.base_selectors.getSelectorName('use_skill'),
                context: {
                    can_use_skills: selectors,
                },
            },
        });
    }
    /** 填充request数据 */
    fillRequest(req) {
        const { selectorId, context } = req.get_selectors;
        context.req = req;
        const sp = selectorId.split('.');
        const name = sp.at(-1) ?? 'choose';
        if (name === 'skill_cost') {
            this.globalLock = true;
        }
        const selectors = this.getSelectors(selectorId, context);
        this.globalLock = false;
        if (selectors) {
            req.selectors = selectors.selectors;
            req.options = selectors.options;
        }
        if (!req.selectors) {
            req.selectors = {};
        }
        if (!req.options) {
            req.options = {};
        }
        if (!req.options.ms) {
            req.options.ms = this.responseTime;
        }
        return req;
    }
    /** 获取选择数据 */
    getSelectors(selectorId, context = {}) {
        const sp = selectorId.split('.');
        const name = sp.at(-1) ?? 'choose';
        const effectId = selectorId.slice(0, selectorId.length - name.length - 1);
        const effect = sgs.getEffect(effectId);
        return (effect &&
            effect.getSelectors?.call(context.effect, this, context)?.[name]?.());
    }
    /** 默认选择结果 */
    defaultRequest(req) {
        req.result = {};
        if (req.options.canCancle) {
            req.result.cancle = true;
        }
        else {
            Object.keys(req.selectors)
                .sort((a, b) => {
                return req.selectors[a]?.step - req.selectors[b]?.step;
            })
                .forEach((v) => {
                const selector = req.selectors[v];
                if (selector.type === 'player' && !selector.selectable) {
                    selector.selectable = selector.excluesDeath
                        ? this.players
                        : this.playerAlives;
                }
                if (selector.type === 'option') {
                    selector.selectable = selector.selectable.map((v) => sgs.utils.getString(v));
                }
                if (Array.isArray(selector.count)) {
                    selector.count[0] =
                        selector.count[0] < 0 ? 0 : selector.count[0];
                    selector.count[1] < 0
                        ? selector.selectable.length
                        : selector.count[1];
                }
                else {
                    selector.count =
                        selector.count < 0 ? 0 : selector.count;
                }
                selector.result = [];
                selector.windowResult = [];
                sgs.utils.shuffle(selector.selectable);
                while (true) {
                    const length = selector.result.length;
                    const s_length = selector.selectable.length;
                    for (let i = 0; i < s_length; i++) {
                        const item = selector.selectable[i];
                        if (selector.result.includes(item))
                            continue;
                        if (selector.type === 'option' &&
                            item.at(0) === '!')
                            continue;
                        if (!(selector.filter?.call(req, item, selector.result) ?? true))
                            continue;
                        selector.result.push(item);
                        selector.onChange?.call(req, 'add', item, selector.result);
                        break;
                    }
                    let testCount = false;
                    const count = selector.count;
                    const number = selector.result.length;
                    if (typeof count === 'number') {
                        testCount = number === count;
                    }
                    else if (Array.isArray(count)) {
                        testCount = number == count[1];
                    }
                    if (testCount)
                        break;
                    if (selector.result.length === length)
                        break;
                }
            });
            req.result.cancle = false;
        }
        req.result = {
            cancle: req.result.cancle,
            use_or_play_card: req._use_or_play_vcard?.vdata,
            selected_skill: undefined, //TODO 如果技能中有必须发动的则返回必须发动的
            playphase: choose_types_1.PlayPhaseResule.End,
            results: this.toData_SelectorResult(this.toJson_SelectorResult(req.selectors)),
        };
    }
    /** 构建一个选择选项的数据 */
    createChooseOptions(data) {
        return Object.assign(data, { type: 'option' });
    }
    /** 构建一个选择玩家的数据 */
    createChoosePlayer(data) {
        return Object.assign(data, { type: 'player' });
    }
    /** 构建一个弃牌选择
     * @param player 弃牌的玩家，用于检测哪些牌是该玩家不能弃置的
     * @param data 弃牌选择的数据
     * @param lock 如果可选数量不足，是否可以全部弃置（这种情况下，选择数量的最大要求会被改为可以弃置的牌数）
     */
    createDropCards(player, data, lock = true) {
        if (lock && !this.globalLock) {
            data.selectable = data.selectable.filter((v) => player.canDropCard(v));
            data.count = data.count ?? 1;
            if (Array.isArray(data.count)) {
                if (data.selectable.length < data.count[0]) {
                    data.count[0] = data.selectable.length;
                }
            }
            else {
                if (data.selectable.length < data.count) {
                    data.count = data.selectable.length;
                }
            }
        }
        return Object.assign(data, { type: 'card' });
    }
    /** 构建一个选择牌的数据 */
    createChooseCard(data, lock = true) {
        data.count = data.count ?? 1;
        if (lock && !this.globalLock) {
            if (Array.isArray(data.count)) {
                if (data.selectable.length < data.count[0]) {
                    data.count[0] = data.selectable.length;
                }
            }
            else {
                if (data.selectable.length < data.count) {
                    data.count = data.selectable.length;
                }
            }
        }
        return Object.assign(data, { type: 'card' });
    }
    /** 构建一个选择虚拟牌牌的数据 */
    createChooseVCard(data) {
        return Object.assign(data, { type: 'vcard' });
    }
    /** 构建一个选择武将牌牌的数据 */
    createChooseGeneral(data) {
        data.count = data.count ?? 1;
        if (Array.isArray(data.count)) {
            if (data.selectable.length < data.count[0]) {
                data.count[0] = data.selectable.length;
            }
        }
        else {
            if (data.selectable.length < data.count) {
                data.count = data.selectable.length;
            }
        }
        return Object.assign(data, { type: 'general' });
    }
    /** 构建一个选择军令的数据 */
    createChooseCommand(data) {
        return Object.assign(data, { type: 'command' });
    }
    /** 构建一个确定/取消询问 */
    createCac(options = {}) {
        options.cac = true;
        options.showMainButtons = true;
        options.canCancle = options.canCancle ?? true;
        return {
            selectors: {},
            options,
        };
    }
    /** 直接发起一个是否询问，若选择是执行一些操作 */
    async chooseYesOrNo(player, prompt, handle) {
        const req = await this.doRequest({
            player: player,
            get_selectors: {
                selectorId: this.base_selectors.getSelectorName('yesorno'),
                context: prompt,
            },
        });
        const result = this.getResult(req, 'option').result;
        if (result.includes('yes')) {
            if (handle)
                await handle();
            return true;
        }
        return false;
    }
    /** 通过选择数据名获取选择结果 */
    getResult(req, name) {
        return (req.result?.results?.[name] ?? {
            type: 'card',
            result: [],
            windowResult: [],
        });
    }
    /** 获取选择结果中所有的游戏牌 */
    getResultCards(req) {
        const cards = [];
        if (req.result && req.result.results) {
            Object.keys(req.result.results).forEach((k) => {
                const v = req.result.results[k];
                if (v.type === 'card') {
                    cards.push(...v.result.filter((c) => c));
                }
            });
        }
        return cards;
    }
    /** 获取选择结果中所有的角色 */
    getResultPlayers(req) {
        const players = [];
        if (req.result && req.result.results) {
            Object.keys(req.result.results).forEach((k) => {
                const v = req.result.results[k];
                if (v.type === 'player') {
                    players.push(...v.result.filter((c) => c));
                }
            });
        }
        return players;
    }
}
exports.RoomChooseMixin = RoomChooseMixin;
