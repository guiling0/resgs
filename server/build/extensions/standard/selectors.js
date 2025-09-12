"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base_selectors = void 0;
const skill_types_1 = require("../../core/skill/skill.types");
function usecard(room, context) {
    const from = context.from;
    const req = context.req;
    if (!from)
        return { selectors: {}, options: {} };
    if (!context.options)
        context.options = {};
    let base_prompt = context.options.prompt;
    if (!context.options.prompt && context.can_use_cards?.length > 0) {
        //获取需要使用的第一张牌
        const use = context.can_use_cards.at(0);
        const skill = room.getCardUse(use.name, use.method);
        if (skill) {
            const prompt = skill.prompt.call(skill, room, from, undefined, context);
            base_prompt = prompt?.prompt;
            context.options.prompt = prompt?.prompt;
            context.options.thinkPrompt = prompt?.thinkPrompt;
        }
    }
    if (context.can_use_cards.find((v) => v.name === 'wuxiekeji')) {
        req.isWuxie = true;
    }
    const selectors = {};
    const can_use_cards = context.can_use_cards ?? [];
    const _card = context.card_selector &&
        room.getSelectors(context.card_selector.selectorId, context.card_selector.context.json
            ? room.toData_Context(context.card_selector.context)
            : context.card_selector.context);
    const _card_key = _card?.selectors &&
        Object.keys(_card.selectors).find((v) => _card.selectors[v].type === 'card');
    const cardSelector = _card_key && _card.selectors[_card_key];
    if (cardSelector) {
        context.options.prompt = _card.options?.prompt;
    }
    const _vcard = context.card_selector &&
        room.getSelectors(context.card_selector.selectorId, context.card_selector.context.json
            ? room.toData_Context(context.card_selector.context)
            : context.card_selector.context);
    const _vcard_key = _card?.selectors &&
        Object.keys(_vcard.selectors).find((v) => _vcard.selectors[v].type === 'vcard');
    const vcardSelector = _vcard_key && _card.selectors[_vcard_key];
    const _target = context.target_selector &&
        room.getSelectors(context.target_selector.selectorId, context.target_selector.context.json
            ? room.toData_Context(context.target_selector.context)
            : context.target_selector.context);
    const _target_key = _target?.selectors &&
        Object.keys(_target.selectors).find((v) => _target.selectors[v].type === 'player');
    const targetSelector = _target_key && _target.selectors[_target_key];
    if (context.skip_card) {
        context.skip_card.custom.method = context.skip_card.custom.method ?? 1;
        req._use_or_play_vcard = room.createVirtualCardByData(context.skip_card, true, false);
        req._carduse_skill = room.getCardUse(req._use_or_play_vcard.vdata);
        if (req._carduse_skill) {
            if (req._carduse_skill.target) {
                selectors.target = usecard_target(room, req, context, targetSelector);
            }
            else {
                const canuse = from.canUseCard(req._use_or_play_vcard.vdata, undefined, '', targetSelector);
                if (canuse) {
                    delete selectors.target;
                }
            }
        }
        if (context.skip_target) {
            delete selectors.target;
        }
        if (selectors.target.auto) {
            context.options.showMainButtons = false;
        }
        return {
            selectors,
            options: context.options,
        };
    }
    if (!req._use_or_play_vcard) {
        req._use_or_play_vcard = room.createVirtualCardByNone('sha', undefined, false);
        req._use_or_play_vcard.custom.base = true;
    }
    //定义卡牌选择方法
    if ((!cardSelector && !vcardSelector) || cardSelector) {
        const card = { type: 'card' };
        card.step = 1;
        card.count = cardSelector?.count ?? 1;
        card.selectable = cardSelector?.selectable ?? from.getHandCards();
        if (lodash.isEmpty(lodash.difference(card.selectable, from.getHandCards()))) {
            //加入如手牌般使用的卡牌
            const cards = room.cards.filter((v) => room
                .getStates(skill_types_1.StateEffectType.LikeHandToUse, [from, v])
                .some((s) => s));
            card.selectable.push(...cards);
        }
        card.filter = function (item, selected) {
            if (cardSelector) {
                return cardSelector.filter?.call(this, item, selected) ?? true;
            }
            else {
                return !!can_use_cards.find((v) => {
                    const name = v.name;
                    const method = v.method;
                    if (this.player.hasMark('wars.aozhan') &&
                        (name === 'sha' || name === 'shan')) {
                        this['__aozhan'] = name;
                        return item.name === name || item.name === 'aozhan';
                    }
                    this['__aozhan'] = undefined;
                    return item.name === name;
                });
            }
        };
        card.onChange = function (type, item, selected) {
            if (!item)
                return;
            if (cardSelector) {
                cardSelector.onChange?.call(this, type, item);
            }
            else if (!vcardSelector) {
                this._use_or_play_vcard.clearSubCard();
                this._use_or_play_vcard.addSubCard(selected);
                this._use_or_play_vcard.set();
                let name = item.name;
                let method = 1;
                if (name === 'aozhan') {
                    const canuse = can_use_cards.find((v) => v.name === 'sha' || v.name === 'shan');
                    name = canuse?.name ?? 'sha';
                    method = canuse?.method ?? 1;
                }
                else {
                    method =
                        can_use_cards.find((v) => v.name === name)?.method ?? 1;
                }
                this._use_or_play_vcard.sourceData.name = name;
                this._use_or_play_vcard.custom.method = method;
            }
            this.options.prompt = base_prompt;
            delete this.selectors.target;
            if (context.skip_target) {
                return;
            }
            this._carduse_skill = room.getCardUse(this._use_or_play_vcard.vdata);
            if (this._carduse_skill) {
                const newprompt = this._carduse_skill.prompt.call(this._carduse_skill, room, from, this._use_or_play_vcard, context);
                if (newprompt && this.options.isPlayPhase)
                    this.options.prompt = newprompt?.prompt;
                if (this._carduse_skill.target) {
                    this.selectors.target = usecard_target(room, this, context, targetSelector);
                }
                else {
                    const canuse = from.canUseCard(this._use_or_play_vcard, undefined, context.reason, targetSelector);
                    if (!canuse) {
                        this.selectors.target = {
                            type: 'player',
                            step: 9,
                            count: 1,
                            filter() {
                                return false;
                            },
                        };
                        this.selectors.target.result = [];
                    }
                }
            }
        };
        selectors.card = card;
    }
    if (vcardSelector) {
        vcardSelector.step = 2;
        const origin_onchange = vcardSelector.onChange;
        const origin_canconfirm = vcardSelector.canConfirm;
        vcardSelector.onChange = function (type, item, selected) {
            if (!item)
                return;
            if (origin_onchange) {
                origin_onchange?.call(this, type, item);
            }
            this.options.prompt = base_prompt;
            delete this.selectors.target;
            if (context.skip_target) {
                return;
            }
            this._carduse_skill = room.getCardUse(this._use_or_play_vcard.vdata);
            if (this._carduse_skill) {
                const newprompt = this._carduse_skill.prompt.call(this._carduse_skill, room, from, this._use_or_play_vcard, context);
                if (newprompt && this.options.isPlayPhase)
                    this.options.prompt = newprompt?.prompt;
                if (this._carduse_skill.target) {
                    this.selectors.target = usecard_target(room, this, context, targetSelector);
                }
                else {
                    const canuse = from.canUseCard(this._use_or_play_vcard, undefined, context.reason, targetSelector);
                    if (!canuse) {
                        this.selectors.target = {
                            type: 'player',
                            step: 9,
                            count: 1,
                            filter() {
                                return false;
                            },
                        };
                        this.selectors.target.result = [];
                    }
                }
            }
        };
        selectors.vcard = vcardSelector;
    }
    return {
        selectors,
        options: context.options ?? {},
    };
}
function usecard_target(room, req, context, targetSelector) {
    const selector = req._carduse_skill.target.call(req._carduse_skill, room, context.from, req._use_or_play_vcard);
    const target = {
        type: 'player',
    };
    target.step = 9;
    target.excluesDeath =
        targetSelector?.excluesDeath ?? selector.excluesDeath ?? true;
    target.count = targetSelector?.count ?? selector.count;
    target.auto = targetSelector?.auto ?? selector.auto;
    if (targetSelector) {
        target.excluesCardDistanceLimit =
            targetSelector.excluesCardDistanceLimit;
        target.excluesCardLimit = targetSelector.excluesCardLimit;
        target.excluesCardTimesLimit = targetSelector.excluesCardTimesLimit;
        target.excluesToCard = targetSelector.excluesToCard;
    }
    target.canConfirm = function (selected) {
        if (targetSelector &&
            !(targetSelector.canConfirm?.call(this, selected) ?? true))
            return false;
        if (!(selector.canConfirm?.call(this, selected) ?? true))
            return false;
        return true;
    };
    target.filter = function (item, selected) {
        return context.from.canUseCard(this._use_or_play_vcard, [item], '', targetSelector, selected);
    };
    target.onChange = function (type, item, selected) {
        selector.onChange?.call(this, type, item, selected);
        targetSelector?.onChange?.call(this, type, item, selected);
    };
    return target;
}
function playcard(room, context) {
    const from = context.from;
    const req = context.req;
    if (!from)
        return { selectors: {}, options: {} };
    if (!context.options)
        context.options = {};
    const selectors = {};
    const can_play_cards = context.can_play_cards ?? [];
    const _card = context.card_selector &&
        room.getSelectors(context.card_selector.selectorId, context.card_selector.context.json
            ? room.toData_Context(context.card_selector.context)
            : context.card_selector.context);
    const _card_key = _card?.selectors &&
        Object.keys(_card.selectors).find((v) => _card.selectors[v].type === 'card' ||
            _card.selectors[v].type === 'vcard');
    const cardSelector = _card_key && _card.selectors[_card_key];
    if (!req._use_or_play_vcard) {
        req._use_or_play_vcard = room.createVirtualCardByNone('sha', undefined, false);
        req._use_or_play_vcard.custom.base = true;
    }
    //定义卡牌选择方法
    const card = { type: 'card' };
    if (cardSelector)
        card.type = cardSelector.type;
    card.step = 1;
    card.count = cardSelector?.count ?? 1;
    card.selectable = cardSelector?.selectable ?? from.getHandCards();
    if (lodash.isEmpty(lodash.difference(card.selectable, from.getHandCards()))) {
        //加入如手牌般使用的卡牌
        const cards = room.cards.filter((v) => room
            .getStates(skill_types_1.StateEffectType.LikeHandToPlay, [from, v])
            .some((s) => s));
        card.selectable.push(...cards);
    }
    card.filter = function (item, selected) {
        if (cardSelector) {
            return cardSelector.filter?.call(this, item, selected) ?? true;
        }
        else {
            return !!can_play_cards.find((v) => {
                if (this.player.hasMark('wars.aozhan') &&
                    (v === 'sha' || v === 'shan')) {
                    this['__aozhan'] = v;
                    return item.name === v || item.name === 'aozhan';
                }
                this['__aozhan'] = undefined;
                return item.name === v;
            });
        }
    };
    card.onChange = function (type, item, selected) {
        if (!item)
            return;
        if (cardSelector) {
            cardSelector.onChange?.call(this, type, item, selected);
        }
        else {
            this._use_or_play_vcard.clearSubCard();
            this._use_or_play_vcard.addSubCard(selected);
            this._use_or_play_vcard.set();
            let name = item.name;
            if (name === 'aozhan') {
                const canuse = can_play_cards.find((v) => v === 'sha' || v === 'shan');
                name = canuse ?? 'sha';
            }
            this._use_or_play_vcard.sourceData.name = name;
        }
        delete this.selectors.target;
        const canuse = from.canPlayCard(this._use_or_play_vcard, context.reason);
        if (!canuse) {
            this.selectors.target = {
                type: 'player',
                step: 9,
                count: 1,
                filter() {
                    return false;
                },
            };
            this.selectors.target.result = [];
        }
    };
    // card.canConfirm = function (selected) {
    //     if (
    //         cardSelector &&
    //         (cardSelector.canConfirm?.call(this, selected) ?? true)
    //     )
    //         return false;
    //     return from.canPlayCard(this._use_or_play_vcard, context.reason);
    // };
    selectors.card = card;
    return {
        selectors,
        options: context.options ?? {},
    };
}
function pindian(room, context) {
    const from = context.from;
    if (!from)
        return { selectors: {}, options: {} };
    if (!context.options)
        context.options = {};
    const selectors = {};
    //定义卡牌选择方法
    const card = { type: 'card' };
    card.step = 1;
    card.count = 1;
    card.selectable = from.getHandCards();
    card.filter = function (item, selected) {
        return true;
    };
    selectors.card = card;
    return {
        selectors,
        options: context.options ?? {},
    };
}
exports.base_selectors = sgs.TriggerEffect({
    name: 'base_selectors',
    priorityType: 0 /* PriorityType.None */,
    getSelectors(room, context) {
        return {
            use_card: () => {
                return usecard(room, context);
            },
            play_card: () => {
                return playcard(room, context);
            },
            watch_hand: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 0,
                            selectable: context.cards,
                            selecte_type: 'rows',
                            data_rows: [
                                {
                                    title: 'handArea',
                                    cards: context.cards,
                                },
                            ],
                            windowOptions: {
                                title: {
                                    text: 'watch_hand_title',
                                    values: [
                                        {
                                            type: 'player',
                                            value: target?.playerId,
                                        },
                                    ],
                                },
                                timebar: 8,
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        ms: 8,
                    },
                };
            },
            watch_general: () => {
                const target = context.targets.at(0);
                const pos = context.pos;
                const generals = room.getGenerals(context.generals);
                if (context.req.isSelf) {
                    const his_generals = room.getData('watch_generals');
                    if (!his_generals) {
                        const set = new Set();
                        generals.forEach((v) => set.add(v));
                        room.setData('watch_generals', set);
                    }
                    else {
                        generals.forEach((v) => his_generals.add(v));
                        room.setData('watch_generals', his_generals);
                    }
                }
                return {
                    selectors: {
                        general: room.createChooseGeneral({
                            step: 1,
                            count: 0,
                            selecte_type: 'win',
                            selectable: room.getGenerals(context.generals),
                            windowOptions: {
                                title: {
                                    text: `watch_general_title${!!target ? 2 : 1}`,
                                    values: [
                                        {
                                            type: 'player',
                                            value: target?.playerId,
                                        },
                                        { type: 'string', value: pos },
                                    ],
                                },
                                timebar: 8,
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        ms: 8,
                    },
                };
            },
            yesorno: () => {
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: ['yes', 'no'],
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: context.prompt ?? '',
                        thinkPrompt: context.thinkPrompt ?? '',
                    },
                };
            },
            use_skill: () => {
                return room.createCac(context.options);
            },
            choose_pindian: () => {
                return pindian(room, context);
            },
            move_filed: () => {
                const pos = context.pos;
                const cards = context.cards;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 2,
                            filter(item, selected) {
                                if (selected.length === 0)
                                    return true;
                                const sel = selected[0];
                                let e_bool = false;
                                let j_bool = false;
                                if (pos.includes('e')) {
                                    const selfequips = sel.getEquipCards();
                                    const itemequips = item.getEquipCards();
                                    if (cards &&
                                        cards.length &&
                                        !selfequips.some((v) => cards.includes(v)) &&
                                        !itemequips.some((v) => cards.includes(v))) {
                                        e_bool = false;
                                    }
                                    else {
                                        if (selfequips.length === 0 &&
                                            itemequips.length > 0) {
                                            e_bool = true;
                                        }
                                        if (selfequips.length > 0 &&
                                            itemequips.length === 0) {
                                            e_bool = true;
                                        }
                                        if (!e_bool) {
                                            e_bool =
                                                itemequips.some((v1) => selfequips.every((v2) => v1.subtype !==
                                                    v2.subtype)) ||
                                                    selfequips.some((v1) => itemequips.every((v2) => v1.subtype !==
                                                        v2.subtype));
                                        }
                                    }
                                }
                                if (pos.includes('j')) {
                                    const selfejudges = sel.judgeCards;
                                    const itemjudges = item.judgeCards;
                                    if (cards &&
                                        cards.length &&
                                        !selfejudges.some((v) => v.subcards.find((s) => cards.includes(s))) &&
                                        !itemjudges.some((v) => v.subcards.find((s) => cards.includes(s)))) {
                                        j_bool = false;
                                    }
                                    else {
                                        if (selfejudges.length === 0 &&
                                            itemjudges.length > 0) {
                                            j_bool = true;
                                        }
                                        if (selfejudges.length > 0 &&
                                            itemjudges.length === 0) {
                                            j_bool = true;
                                        }
                                        if (!j_bool) {
                                            j_bool =
                                                itemjudges.some((v1) => selfejudges.every((v2) => v1.name !== v2.name)) ||
                                                    selfejudges.some((v1) => itemjudges.every((v2) => v1.name !== v2.name));
                                        }
                                    }
                                }
                                return e_bool || j_bool;
                            },
                        }),
                    },
                    options: context.options,
                };
            },
            move_filed_card: () => {
                const targets = context.targets;
                const pos = context.pos;
                const cards = context.cards;
                const selectable = [];
                const datas = [];
                datas.push({
                    title: targets.at(0)?.gameName,
                    items: [],
                });
                datas.push({
                    title: targets.at(1)?.gameName,
                    items: [],
                });
                if (pos.includes('e')) {
                    const equips1 = targets[0]
                        ?.getEquipCards()
                        ?.filter((v) => !targets[1]
                        ?.getEquipCards()
                        ?.find((v2) => v2.subtype === v.subtype));
                    const equips2 = targets[1]
                        ?.getEquipCards()
                        ?.filter((v) => !targets[0]
                        ?.getEquipCards()
                        ?.find((v2) => v2.subtype === v.subtype));
                    selectable.push(...equips1, ...equips2);
                    //武器
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '武器',
                            card: targets
                                .at(i)
                                ?.equipCards.find((c) => c.subtype === 31 /* CardSubType.Weapon */),
                        });
                    });
                    //防具
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '防具',
                            card: targets
                                .at(i)
                                ?.equipCards.find((c) => c.subtype === 32 /* CardSubType.Armor */),
                        });
                    });
                    //sp
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '特殊坐骑',
                            card: targets
                                .at(i)
                                ?.equipCards.find((c) => c.subtype === 35 /* CardSubType.SpecialMount */),
                        });
                    });
                    //+1
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '防御坐骑',
                            card: targets
                                .at(i)
                                ?.equipCards.find((c) => c.subtype === 33 /* CardSubType.DefensiveMount */),
                        });
                    });
                    //-1
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '进攻坐骑',
                            card: targets
                                .at(i)
                                ?.equipCards.find((c) => c.subtype === 34 /* CardSubType.OffensiveMount */),
                        });
                    });
                    //宝物
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '宝物',
                            card: targets
                                .at(i)
                                ?.equipCards.find((c) => c.subtype === 36 /* CardSubType.Treasure */),
                        });
                    });
                }
                if (pos.includes('j')) {
                    const judges1 = targets[0]?.judgeCards?.filter((v) => !targets[1]?.judgeCards?.find((v2) => v2.name === v.name));
                    const judges2 = targets[1]?.judgeCards?.filter((v) => !targets[0]?.judgeCards?.find((v2) => v2.name === v.name));
                    judges1.forEach((v) => {
                        selectable.push(...v.subcards);
                    });
                    judges2.forEach((v) => {
                        selectable.push(...v.subcards);
                    });
                    //乐不思蜀
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '乐不思蜀',
                            card: targets
                                .at(i)
                                ?.judgeCards.find((c) => c.name === 'lebusishu')
                                ?.subcards[0],
                        });
                    });
                    //兵粮寸断
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '兵粮寸断',
                            card: targets
                                .at(i)
                                ?.judgeCards.find((c) => c.name === 'bingliangcunduan')?.subcards[0],
                        });
                    });
                    //闪电
                    datas.forEach((v, i) => {
                        v.items.push({
                            title: '闪电',
                            card: targets
                                .at(i)
                                ?.judgeCards.find((c) => c.name === 'shandian')
                                ?.subcards[0],
                        });
                    });
                }
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable,
                            filter(item, selected) {
                                if (cards && cards.length) {
                                    return cards.includes(item);
                                }
                                else {
                                    return true;
                                }
                            },
                            selecte_type: 'items',
                            data_items: datas,
                            windowOptions: {
                                title: context.options?.prompt,
                                timebar: room.responseTime,
                                prompt: '选择一张牌移动到另一名角色对应的位置',
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: context.options?.prompt,
                        thinkPrompt: context.options?.thinkPrompt,
                    },
                };
            },
            sort_cards: () => {
                const cards = context.cards;
                const areas = context.areas;
                const datas = [];
                const _cards = cards.slice();
                areas.forEach((v) => {
                    const d = {
                        title: v.title,
                        items: [],
                        condition: v.condition,
                    };
                    for (let i = 0; i < v.max; i++) {
                        d.items.push({ title: v.title, card: _cards.shift() });
                    }
                    datas.push(d);
                });
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 0,
                            selectable: cards,
                            selecte_type: 'drags',
                            data_items: datas,
                            windowOptions: {
                                title: context.options?.prompt,
                                timebar: room.responseTime,
                                prompt: '请拖动卡牌调整顺序',
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: context.options,
                };
            },
            choose_command: () => {
                const commands = context.commands;
                return {
                    selectors: {
                        command: room.createChooseCommand({
                            step: 1,
                            count: 1,
                            selectable: commands,
                        }),
                    },
                    options: context.options,
                };
            },
            choose_command_yon: () => {
                const command = context.command;
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: ['yes', 'no'],
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: `@junling${command}`,
                        thinkPrompt: '@@junling',
                    },
                };
            },
            choose_command_1: () => {
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `@junling1.res`,
                        thinkPrompt: '@@junling',
                    },
                };
            },
            choose_command_2: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: Math.min(2, from.getSelfCards().length),
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `@junling2.res`,
                        thinkPrompt: '@@junling',
                    },
                };
            },
            choose_command_6: () => {
                const from = context.from;
                const hands = from.getHandCards();
                const equips = from.getEquipCards();
                let count = 0;
                if (hands.length > 0)
                    count++;
                if (equips.length > 0)
                    count++;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                if (selected.length === 0)
                                    return true;
                                if (selected.length === 1) {
                                    if (hands.includes(selected[0]))
                                        return equips.includes(item);
                                    if (equips.includes(selected[0]))
                                        return hands.includes(item);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `@junling6.res`,
                        thinkPrompt: '@@junling',
                    },
                };
            },
            remove_handle: () => {
                const count = context.count;
                const cards = room.reserveArea.cards.filter((v) => v.put === 1 /* CardPut.Up */);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count,
                            selecte_type: 'rows',
                            selectable: cards,
                            data_rows: [
                                {
                                    title: '明区',
                                    cards,
                                },
                            ],
                            windowOptions: {
                                title: '后备区',
                                timebar: room.responseTime,
                                prompt: `请将${count}张后备区中明区的牌置入弃牌堆`,
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: ``,
                        thinkPrompt: '后备区',
                    },
                };
            },
            choose_command_80: () => {
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `@junling80.res`,
                        thinkPrompt: '@@miaoji',
                    },
                };
            },
            choose_command_85: () => {
                const from = context.from;
                const count = from.chained ? 2 : 1;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: count,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `妙计6：请弃置${count}张牌`,
                        thinkPrompt: '@@miaoji',
                    },
                };
            },
            choose_command_86: () => {
                const from = context.from;
                const hands = from.getHandCards();
                const equips = from.getEquipCards();
                let count = 0;
                if (hands.length > 0)
                    count++;
                if (equips.length > 0)
                    count++;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                if (selected.length === 0)
                                    return true;
                                if (selected.length === 1) {
                                    if (hands.includes(selected[0]))
                                        return equips.includes(item);
                                    if (equips.includes(selected[0]))
                                        return hands.includes(item);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `@junling86.res`,
                        thinkPrompt: '@@miaoji',
                    },
                };
            },
            choose_command_87: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: [1, 2],
                            selectable: from.getSelfCards(),
                            canConfirm(selected) {
                                return (!!selected.find((v) => v.type === 2 /* CardType.Scroll */) || selected.length === 2);
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `@junling87.res`,
                        thinkPrompt: '@@miaoji',
                    },
                };
            },
            choose_command_89: () => {
                const from = context.from;
                const to = context.to;
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: to.getHandCards(),
                            data_rows: to.getCardsToArea('h'),
                            windowOptions: {
                                title: '妙计10',
                                timebar: room.responseTime,
                                prompt: '妙计10：请弃置1张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: '@@miaoji',
                    },
                };
            },
            choose_command_90: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 3,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `妙计11：请重铸三张牌`,
                        thinkPrompt: '@@miaoji',
                    },
                };
            },
            choose_command_90_1: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `妙计11：请弃置一张手牌`,
                        thinkPrompt: '@@miaoji',
                    },
                };
            },
            choose_command_91: () => {
                const from = context.from;
                const to = context.to;
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: to.getSelfCards(),
                            data_rows: to.getCardsToArea('he'),
                            windowOptions: {
                                title: '妙计12',
                                timebar: room.responseTime,
                                prompt: '妙计12：请选择1张牌弃置',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: '@@miaoji',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return false;
    },
});
sgs.loadTranslation({
    ['@playphase']: '出牌阶段，请选择一张牌',
    ['@@playphase']: '出牌阶段',
    ['watch_hand_title']: '观看{0}的手牌',
    ['@watch_hand']: '',
    ['@@watch_hand']: '观看手牌',
    ['watch_general_title1']: '观看武将牌',
    ['watch_general_title2']: '观看{0}的{1}',
    ['@watch_general']: '',
    ['@@watch_general']: '观看武将牌',
});
