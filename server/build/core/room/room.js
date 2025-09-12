"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const player_1 = require("../player/player");
const area_1 = require("../area/area");
const card_1 = require("../card/card");
const general_1 = require("../general/general");
const vcard_1 = require("../card/vcard");
const effect_1 = require("../skill/effect");
const skill_types_1 = require("../skill/skill.types");
const choose_types_1 = require("../choose/choose.types");
const event_turn_1 = require("../event/types/event.turn");
const event_ready_1 = require("../event/types/event.ready");
const event_use_1 = require("../event/types/event.use");
class GameRoom {
    constructor(roomId, options, broadCastMethod = () => { }, _gameOver = async () => { }) {
        this.broadCastMethod = broadCastMethod;
        this._gameOver = _gameOver;
        /** 机器人自增ID */
        this.robotids = 0;
        /** 虚拟牌牌自增ID */
        this.vcardids = 0;
        /** 消息自增ID */
        this.msgids = 0;
        /** 询问自增ID */
        this.requestids = 0;
        /** 窗口自增ID */
        this.windowids = 1;
        /** 数据ID */
        this.eventids = 0;
        /** 野心家ID */
        this.yeids = 0;
        this.skillids = 0;
        this.effectids = 0;
        this.broadcastCustom = (data) => {
            this.markChanges.push({
                objType: 'room',
                objId: this.roomId,
                key: data.key,
                value: data.value,
                options: data.options,
            });
        };
        /** 游戏状态 */
        this.gameState = 0 /* GameState.Wating */;
        /** 记录所有发送过的消息 */
        this.messages = [];
        /** 记录所有属性变化 */
        this.propertyChanges = [];
        this.markChanges = [];
        /** 等待发送的消息 */
        this.waitMessages = [];
        /** 所有进行中的询问 */
        this.requests = [];
        /** 回合数 */
        this.turnCount = 0;
        /** 轮数 */
        this.circleCount = 0;
        /** 洗牌次数 */
        this.shuffleCount = 0;
        /** 修改该值通知客户端清空UI处理区 */
        this.clearUiProcessArea = 0;
        /** 修改该值通知客户端刷新座次信息 */
        this.updateSeat = 0;
        /** 房间所有玩家 */
        this._players = [];
        /** 所有区域 */
        this.areas = new Map();
        /** 所有卡牌 */
        this.cards = [];
        /** 所有卡牌名 */
        this.cardNames = [];
        /** 按类型的所有卡牌名 */
        this.cardNamesToType = new Map();
        /** 按子类型的所有卡牌名 */
        this.cardNamesToSubType = new Map();
        /** 所有武将牌 */
        this.generals = new Map();
        /** 记录所有武将牌的用途 */
        this.generalsRecords = {};
        /** 所有武将名 */
        this.generalNames = [];
        /** 所有虚拟牌 */
        this.vcards = [];
        this.miaojis = [
            80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91,
        ];
        /** 所有进行中的事件 */
        this.events = [];
        /** 明置武将记录 */
        this.opens = [];
        /** 所有历史记录 */
        this.historys = [];
        /** 待执行的额外回合
         * @description 这个属性被用于记录哪些角色获得了额外回合
         */
        this.extraTurns = [];
        /** 所有牌使用技能 */
        this.card_uses = [];
        /** 所有技能 */
        this.skills = [];
        /** 所有效果 */
        this.effects = [];
        /** 所有触发效果 */
        this.trigger_effects = [];
        /** 按优先级分类 */
        this.trigger_effects_priority = new Map();
        /** 所有状态效果 */
        this.state_effects = [];
        /** 有“视为拥有技能”效果的效果 */
        this.hasregard_effects = [];
        /** 所有技能生命周期 */
        this.lifes = new Map();
        this.roomId = roomId;
        this.options = options;
        this.trigger_effects_priority.set(0 /* PriorityType.None */, []);
        this.trigger_effects_priority.set(1 /* PriorityType.General */, []);
        this.trigger_effects_priority.set(2 /* PriorityType.Equip */, []);
        this.trigger_effects_priority.set(3 /* PriorityType.Card */, []);
        this.trigger_effects_priority.set(4 /* PriorityType.Rule */, []);
        this.trigger_effects_priority.set(5 /* PriorityType.GlobalRule */, []);
        this.trigger_effects_priority.set(6 /* PriorityType.Refresh */, []);
    }
    /** 响应时间 */
    get responseTime() {
        return this.options.responseTime;
    }
    /** 房间所有玩家 */
    get players() {
        return this._players.slice();
    }
    /** 所有存活玩家 */
    get playerAlives() {
        return this.players.filter((v) => v.alive);
    }
    /** 所有死亡玩家 */
    get playerDeads() {
        return this.players.filter((v) => v.death);
    }
    /** 玩家数量 */
    get playerCount() {
        return this._players.length;
    }
    /** 存活玩家数量 */
    get aliveCount() {
        return this.playerAlives.length;
    }
    /** 存活玩家数量 */
    get deadCount() {
        return this.playerDeads.length;
    }
    /** 武将牌堆 */
    get generalArea() {
        return this.areas.get(99 /* AreaType.General */.toString());
    }
    /** 牌堆 */
    get drawArea() {
        return this.areas.get(1 /* AreaType.Draw */.toString());
    }
    /** 弃牌堆 */
    get discardArea() {
        return this.areas.get(2 /* AreaType.Discard */.toString());
    }
    /** 处理区 */
    get processingArea() {
        return this.areas.get(3 /* AreaType.Processing */.toString());
    }
    /** 仓廪 */
    get granaryArea() {
        return this.areas.get(4 /* AreaType.Granary */.toString());
    }
    /** 府库 */
    get treasuryArea() {
        return this.areas.get(5 /* AreaType.Treasury */.toString());
    }
    /** 后备区 */
    get reserveArea() {
        return this.areas.get(6 /* AreaType.Reserve */.toString());
    }
    /** 初始化游戏 */
    initStart(players = []) {
        //init area
        new area_1.Area().init(99 /* AreaType.General */, this, undefined, 2 /* CardPut.Down */);
        new area_1.Area().init(1 /* AreaType.Draw */, this, undefined, 2 /* CardPut.Down */);
        new area_1.Area().init(2 /* AreaType.Discard */, this, undefined, 1 /* CardPut.Up */);
        new area_1.Area().init(3 /* AreaType.Processing */, this, undefined, 1 /* CardPut.Up */);
        new area_1.Area().init(4 /* AreaType.Granary */, this, undefined, 2 /* CardPut.Down */);
        new area_1.Area().init(5 /* AreaType.Treasury */, this, undefined, 1 /* CardPut.Up */);
        new area_1.Area().init(6 /* AreaType.Reserve */, this, undefined, 1 /* CardPut.Up */);
        //init player
        players.forEach((v) => {
            const player = new player_1.GamePlayer();
            player.playerId = v.playerId;
            player.sessionId = v.playerId;
            player.prechooses = v.prechooses;
            player.controlId = v.playerId;
            player.username = v.username;
            player.room = this;
            this._players.push(player);
            new area_1.Area().init(91 /* AreaType.Hand */, this, player, 2 /* CardPut.Down */, [
                player,
            ]);
            new area_1.Area().init(92 /* AreaType.Equip */, this, player, 1 /* CardPut.Up */);
            new area_1.Area().init(93 /* AreaType.Judge */, this, player, 1 /* CardPut.Up */);
            new area_1.Area().init(94 /* AreaType.Up */, this, player, 1 /* CardPut.Up */);
            new area_1.Area().init(95 /* AreaType.Side */, this, player, 1 /* CardPut.Up */);
        });
        //init mode
        this.mode = sgs.getGameMode(this.options.mode);
        this.options.extensions.forEach((v) => {
            const pack = sgs.getPackage(v);
            if (!pack)
                return;
            //构建卡牌
            pack.cards.forEach((data) => {
                this.createGameCard(data);
            });
        });
        //构建武将牌
        this.options.generals.forEach((id) => {
            const data = sgs.generals.get(id);
            if (!data)
                return;
            const general = new general_1.General(this, data);
            this.generals.set(data.id, general);
            if (data.enable) {
                this.generalArea.add([general]);
                if (!this.generalNames.includes(general.trueName)) {
                    this.generalNames.push(general.trueName);
                }
            }
            else {
                this.granaryArea.add([general]);
            }
        });
        this.gameState = 1 /* GameState.Gaming */;
    }
    async createGameCard(data, initArea, broadcast = false) {
        if (!data)
            return;
        const card = new card_1.GameCard(this, data);
        card.put = 2 /* CardPut.Down */;
        if (initArea) {
            initArea.add([card]);
        }
        else {
            if (data.derived) {
                this.treasuryArea.add([card]);
            }
            else {
                this.drawArea.add([card]);
            }
        }
        this.buildCard(card);
        if (broadcast) {
            this.broadcast({
                type: 'MsgBuildGameCard',
                data,
                initArea: initArea?.areaId,
            });
        }
        if (this.gameState === 1 /* GameState.Gaming */) {
            const skills = sgs.getCardUseFromName(card.name);
            for (const card_use of skills) {
                if (!this.card_uses.includes(card_use)) {
                    this.card_uses.push(card_use);
                    if (card_use.effects && card_use.effects.length > 0) {
                        for (const skill_name of card_use.effects) {
                            const effect = await this.addEffect(skill_name);
                            this.setData(effect.name, effect);
                        }
                    }
                }
            }
        }
        else {
            const skills = sgs.getCardUseFromName(card.name);
            for (const card_use of skills) {
                if (!this.card_uses.includes(card_use)) {
                    this.card_uses.push(card_use);
                }
            }
        }
    }
    buildCard(card) {
        if (!card)
            return;
        this.cards.push(card);
        if (!this.cardNames.includes(card.name) && !card.derived) {
            const name = card.name;
            this.cardNames.push(name);
            const type = sgs.utils.getCardType(name);
            if (this.cardNamesToType.has(type)) {
                this.cardNamesToType.get(type).push(name);
            }
            else {
                this.cardNamesToType.set(type, [name]);
            }
            const subtype = sgs.utils.getCardSubtype(name);
            if (this.cardNamesToSubType.has(subtype)) {
                this.cardNamesToSubType.get(subtype).push(name);
            }
            else {
                this.cardNamesToSubType.set(subtype, [name]);
            }
        }
    }
    deleteCardName(name) {
        const index = this.cardNames.indexOf(name);
        if (index !== -1) {
            this.cardNames.splice(index, 1);
        }
        const type = sgs.utils.getCardType(name);
        if (this.cardNamesToType.has(type)) {
            const names = this.cardNamesToType.get(type);
            const index_type = names.indexOf(name);
            if (index_type !== -1) {
                names.splice(index_type, 1);
            }
        }
        const subtype = sgs.utils.getCardSubtype(name);
        if (this.cardNamesToSubType.has(subtype)) {
            const names = this.cardNamesToSubType.get(subtype);
            const index_type = names.indexOf(name);
            if (index_type !== -1) {
                names.splice(index_type, 1);
            }
        }
    }
    /** Ban掉一个势力 */
    banCountry() {
        const kindoms = [];
        this.generals.forEach((v) => {
            if (!v.isDual() &&
                !kindoms.includes(v.kingdom) &&
                v.kingdom !== 'none') {
                kindoms.push(v.kingdom);
            }
        });
        if (kindoms.length < 2)
            return;
        if (this.options.settings.test) {
            lodash.remove(kindoms, (v) => v === 'jin');
        }
        const random = sgs.utils.randomInt(0, kindoms.length - 1);
        const result = kindoms[random];
        this.setData('ban_country', result);
        const generals = [];
        this.generals.forEach((v) => {
            if (!v.isDual() && v.kingdom === result) {
                generals.push(v);
                lodash.remove(this.generalNames, (c) => c == v.trueName);
            }
        });
        this.generalArea.remove(generals);
        this.treasuryArea.add(generals);
        this.broadcast({
            type: 'MsgPlayGlobalAni',
            ani: 'bancountry',
            data: { result },
            log: {
                text: '#BanCountry',
                values: [{ type: 'string', value: result }],
            },
        });
    }
    /** 开始游戏 */
    async startGame(spectate) {
        if (!this.options.settings) {
            this.options.settings = {};
        }
        //随机座位
        if (this.options.settings.randomSeat) {
            this._players = lodash.shuffle(this.players);
        }
        this._players.forEach((v, i) => {
            v.seat = i + 1;
        });
        this.broadcast({
            type: 'MsgGameStart',
            options: this.options,
            players: this.players.map((v) => {
                return {
                    playerId: v.playerId,
                    username: v.username,
                };
            }),
            spectate,
        });
        this.players.forEach((v) => {
            if (v.playerId.includes('robot')) {
                v.setMark('__offline', true, { visible: true });
            }
        });
        //添加所有规则技能
        const rule = await this.addSkill(this.mode.rules);
        rule.preshow = true;
        //添加所有卡牌附带技能
        for (const card_use of this.card_uses) {
            if (card_use.effects && card_use.effects.length > 0) {
                for (const skill_name of card_use.effects) {
                    const effect = await this.addEffect(skill_name);
                    this.setData(effect.name, effect);
                }
            }
        }
        this.sendLog('#GameStart');
        await this.delay(1);
        //ban势力
        if (this.options.settings.banCountry === 'true') {
            this.banCountry();
            await this.delay(7, false);
        }
        do {
            try {
                const last = this.getLastOneHistory(event_turn_1.TurnEvent, (v) => !v.isExtra);
                if (this.extraTurns.length > 0) {
                    this.currentTurn = this.extraTurns.pop();
                }
                else {
                    const turn = this.createEventData(event_turn_1.TurnEvent, {
                        player: undefined,
                        isExtra: false,
                        phases: [
                            { phase: 1 /* Phase.Ready */, isExtra: false },
                            { phase: 2 /* Phase.Judge */, isExtra: false },
                            { phase: 3 /* Phase.Draw */, isExtra: false },
                            { phase: 4 /* Phase.Play */, isExtra: false },
                            { phase: 5 /* Phase.Drop */, isExtra: false },
                            { phase: 6 /* Phase.End */, isExtra: false },
                        ],
                        skipPhases: [],
                        source: undefined,
                        reason: 'rated_turn',
                    });
                    if (this.mode.mainProcess) {
                        await this.mode.mainProcess(this, turn);
                    }
                    else {
                        //默认流程
                        if (!last) {
                            turn.player = this.getPlayerByFilter((v) => v.seat === 1).at(0);
                        }
                        else {
                            let start = (turn.player = last.player.right);
                            while (turn.player &&
                                turn.player.death &&
                                turn.player.rest === 0) {
                                turn.player = turn.player.right;
                                if (turn.player === start)
                                    break;
                            }
                        }
                        if (!turn.player) {
                            //找不到下一个执行回合的角色
                            this.currentTurn = turn;
                            await this.gameOver([], 'MainProcessError');
                            break;
                        }
                    }
                    this.currentTurn = turn;
                }
                const turn = this.currentTurn;
                //回合数+1
                this.setProperty('turnCount', this.turnCount + 1);
                this.currentTurn.turnId = this.turnCount;
                if (this.turnCount === 1) {
                    await this.createEventData(event_ready_1.GameReadyEvent, {
                        source: undefined,
                        reason: 'gameready',
                    }).exec();
                    this.broadcast({
                        type: 'MsgPlayGlobalAni',
                        ani: 'gamestart',
                    });
                }
                //轮数
                if (!turn.isExtra) {
                    if (!last || last.player.seat > turn.player.seat) {
                        if (last) {
                            await this.trigger("CircleEnd" /* EventTriggers.CircleEnd */, last);
                            last.isCircleEnd = true;
                        }
                        this.setProperty('circleCount', this.circleCount + 1);
                        await this.trigger("CircleStarted" /* EventTriggers.CircleStarted */, turn);
                        turn.isCircleStart = true;
                    }
                }
                await this.currentTurn.exec();
            }
            catch (e) {
                console.log(e);
            }
            finally {
                await this.delay(1, false);
            }
        } while (this.gameState === 1 /* GameState.Gaming */);
    }
    /**
     * 结束游戏
     * @param wins 获胜的玩家
     */
    async gameOver(wins, reason) {
        await this.trigger("GameEnd" /* EventTriggers.GameEnd */, this.currentTurn);
        this.broadcast({
            type: 'MsgGameOver',
            wins: this.getPlayerIds(wins),
            scores: this.players.map((v) => {
                return {
                    player: v.playerId,
                    score: v.mvp_score,
                };
            }),
            reason,
        });
        this.gameState = 2 /* GameState.Ending */;
        this.players.forEach((v) => {
            if (v.hasHead()) {
                this.recordGeneral(v.head.id, ['isHead']);
                if (wins.includes(v)) {
                    this.recordGeneral(v.head.id, ['isWin']);
                }
            }
            if (v.hasDeputy()) {
                this.recordGeneral(v.deputy.id, ['isDeputy']);
                if (wins.includes(v)) {
                    this.recordGeneral(v.deputy.id, ['isWin']);
                }
            }
        });
        this._gameOver && (await this._gameOver(wins, reason));
    }
    /**
     * 触发一个时机
     * @param trigger 触发的时机
     * @param data 事件数据
     * @param players [可选]触发该时机的角色。如果一名角色不在这个列表里，则本次时机触发会忽略他
     * @param check [可选]返回false以在特定的条件下终止时机
     */
    async trigger(trigger, data, players = this.playerAlives, check = () => true) {
        if (this.gameState !== 1 /* GameState.Gaming */)
            return;
        if (!data)
            return;
        data.triggerable = true;
        data.trigger = trigger;
        players = this.sortResponse(players);
        const alls = players.slice();
        let order = 0;
        const times = {};
        //lifes
        const lifes = this.lifes.get(trigger);
        if (lifes && lifes.before && lifes.before.length) {
            const befores = lifes.before.slice();
            for (let i = 0; i < befores.length; i++) {
                const life = befores[i];
                if (!life.life.on_exec)
                    continue;
                await life.life.on_exec.call(life.effect, this, data);
            }
        }
        //处理视为拥有
        if (trigger !== "onObtainTrigger" /* EventTriggers.onObtainTrigger */) {
            await this.handleRegardSkill(data);
        }
        //none
        for (const effect of this.trigger_effects_priority.get(0 /* PriorityType.None */)) {
            if (effect.check(data)) {
                const context = effect.getContext(data);
                await this.useskill({
                    use_skill: effect,
                    context,
                    source: data,
                    reason: 'none_trigger',
                });
            }
        }
        let contexts = new Map();
        //出牌阶段
        if (data.is(event_turn_1.PhaseEvent) &&
            trigger === "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */) {
            data.triggerCurrent = data.executor;
            const current = data.triggerCurrent;
            let effects = this.trigger_effects.slice();
            effects = effects.filter((v) => v.check(data));
            effects.forEach((v) => {
                const context = v.getContext(data);
                const time = data.times[current.playerId]?.[v.id] ?? 0;
                if (time < context.maxTimes || context.maxTimes === -1) {
                    contexts.set(v, context);
                }
            });
            await this.needUseCard({
                from: current,
                source: data,
                reason: 'playphase',
                playphase_skills: contexts,
            });
            return;
        }
        let effects;
        const playerSetPool = new Set();
        const skillsMapPool = new Map();
        let exec, req;
        //触发时机
        while (this.gameState === 1 /* GameState.Gaming */ &&
            players.length > 0 &&
            check() &&
            data.triggerable) {
            const current = players.shift();
            const currentId = current.playerId;
            data.triggerCurrent = current;
            order = 1;
            while (this.gameState === 1 /* GameState.Gaming */ &&
                check() &&
                data.triggerable) {
                effects = undefined;
                switch (order) {
                    case 0:
                        // effects = effects.filter(
                        //     (v) =>
                        //         v.data.priorityType === PriorityType.None &&
                        //         v.check(data)
                        // );
                        break;
                    case 1:
                        //武将技能
                        effects = this.trigger_effects_priority.get(1 /* PriorityType.General */);
                        break;
                    case 2:
                        //装备技能
                        effects = this.trigger_effects_priority.get(2 /* PriorityType.Equip */);
                        break;
                    case 3:
                        //卡牌技能
                        effects = this.trigger_effects_priority.get(3 /* PriorityType.Card */);
                        break;
                    case 6:
                        //规则技能
                        effects = this.trigger_effects_priority.get(4 /* PriorityType.Rule */);
                        break;
                    case 4:
                        //同时使用的卡牌;
                        if (current === alls.at(0)) {
                            await this.needUseCardSame({
                                from: current,
                                source: data,
                                reason: 'default_use',
                                reqOptions: {
                                    canCancle: true,
                                },
                            });
                        }
                        order++;
                        continue;
                    case 5:
                        const use = await this.needUseCard({
                            from: current,
                            source: data,
                            reason: 'default_use',
                            reqOptions: {
                                canCancle: true,
                            },
                        });
                        if (trigger === "Dying" /* EventTriggers.Dying */ && use) {
                        }
                        else {
                            order++;
                        }
                        continue;
                }
                if (effects) {
                    contexts.clear();
                    effects.forEach((v) => {
                        if (v.check(data)) {
                            const context = v.getContext(data);
                            const time = times[currentId]?.[v.id] ?? 0;
                            if (time < context.maxTimes) {
                                contexts.set(v, context);
                            }
                        }
                    });
                    exec = undefined;
                    req = undefined;
                    playerSetPool.clear();
                    skillsMapPool.clear();
                    if (contexts.size > 0) {
                        contexts.forEach((v) => {
                            if (v.from)
                                playerSetPool.add(v.from);
                        });
                        const sortedPlayers = this.sortResponse(Array.from(playerSetPool));
                        const primaryPlayer = sortedPlayers[0]; // 获取排序后的第一个玩家
                        contexts.forEach((v, k) => {
                            if (v.from === primaryPlayer) {
                                skillsMapPool.set(k, v);
                            }
                        });
                        if (skillsMapPool.size > 0) {
                            const result = await this.askForSkillInvoke(primaryPlayer, skillsMapPool);
                            exec =
                                result instanceof effect_1.TriggerEffect
                                    ? result
                                    : this.getEffect(result.result.selected_skill);
                            req =
                                result instanceof effect_1.TriggerEffect
                                    ? undefined
                                    : result;
                        }
                    }
                    //确定发动的技能后开始发动技能
                    if (exec) {
                        if (!req || !req.result.cancle) {
                            await this.useskill({
                                use_skill: exec,
                                context: contexts.get(exec),
                                req,
                                source: data,
                                reason: 'useskill',
                            });
                        }
                        if (times[currentId]) {
                            const time = times[currentId][exec.id] ?? 0;
                            times[currentId][exec.id] = time + 1;
                        }
                        else {
                            times[currentId] = {};
                            times[currentId][exec.id] = 1;
                        }
                        continue;
                    }
                    if (!exec) {
                        skillsMapPool.forEach((v, k) => {
                            if (times[currentId]) {
                                const time = times[currentId][k.id] ?? 0;
                                times[currentId][k.id] = time + 1;
                            }
                            else {
                                times[currentId] = {};
                                times[currentId][k.id] = 1;
                            }
                        });
                        order++;
                    }
                }
                if (order === 7)
                    break;
            }
        }
        //globalrule
        for (const effect of this.trigger_effects_priority.get(5 /* PriorityType.GlobalRule */)) {
            if (effect.check(data)) {
                const context = effect.getContext(data);
                await this.useskill({
                    use_skill: effect,
                    context,
                    source: data,
                    reason: 'globalrule',
                });
            }
        }
        if (lifes && lifes.after && lifes.after.length) {
            const after = lifes.after.slice();
            for (let i = 0; i < after.length; i++) {
                const life = after[i];
                if (!life.life.on_exec)
                    continue;
                await life.life.on_exec.call(life.effect, this, data);
            }
        }
    }
    async playphase(req, data) {
        const phase = this.getCurrentPhase();
        if (req.result.playphase === choose_types_1.PlayPhaseResule.OpenHead) {
            await this.open({
                player: data.from,
                generals: [data.from.head],
                source: data.source,
                reason: 'playphase',
            });
        }
        if (req.result.playphase === choose_types_1.PlayPhaseResule.OpenDeputy) {
            await this.open({
                player: data.from,
                generals: [data.from.deputy],
                source: data.source,
                reason: 'playphase',
            });
        }
        if (req.result.playphase === choose_types_1.PlayPhaseResule.Recast) {
            const cards = this.getResultCards(req);
            await this.recastCards({
                player: data.from,
                cards,
                source: data.source,
                reason: 'playphase',
            });
        }
        if (req.result.playphase === choose_types_1.PlayPhaseResule.UseCard) {
            data.card = this.createVirtualCardByData(req.result.use_or_play_card);
            data.targets = req.result.results.target?.result;
            const useskill = this.getEffect(req.result.selected_skill);
            if (data.card) {
                const vdata = data.card.vdata;
                const skill = this.getCardUse(vdata);
                const condition = skill.condition.call(skill, this, data.from, data.card, data.source);
                if (typeof condition === 'boolean' &&
                    Array.isArray(data.targets)) {
                    data.used = this.createEventData(event_use_1.UseCardEvent, Object.assign({
                        from: data.from,
                        targets: data.targets,
                        card: data.card,
                        noPlayDirectLine: data.noPlayDirectLine,
                        effectTimes: data.effectTimes,
                    }, data.copy()));
                }
                if (condition instanceof vcard_1.VirtualCard) {
                    data.used = this.createEventData(event_use_1.UseCardToCardEvent, Object.assign({
                        from: data.from,
                        card: data.card,
                        targets: data.targets ?? condition,
                    }, data.copy()));
                }
            }
            if (useskill && useskill.inTrigger("NeedUseCard2" /* EventTriggers.NeedUseCard2 */)) {
                data.skill = useskill;
                await this.useskill({
                    use_skill: useskill,
                    context: data.can_use_skills.get(useskill),
                    req,
                    source: data,
                    reason: data.reason,
                });
            }
            if (useskill && useskill.inTrigger("NeedUseCard3" /* EventTriggers.NeedUseCard3 */)) {
                data.used.skill = useskill;
                data.card.transform = useskill;
                await this.useskill({
                    use_skill: useskill,
                    context: data.can_use_skills.get(useskill),
                    req,
                    source: data.used,
                    reason: data.reason,
                });
            }
            if (data.used && !data.used.isComplete) {
                await data.used.exec();
            }
        }
        if (req.result.playphase === choose_types_1.PlayPhaseResule.UseSkill) {
            const skill = this.getEffect(req.result.selected_skill);
            await this.useskill({
                use_skill: skill,
                context: data.can_use_skills.get(skill),
                req,
                source: data,
                reason: 'playphase',
            });
            if (phase.times[data.from.playerId]) {
                const time = phase.times[data.from.playerId][skill.id] ?? 0;
                phase.times[data.from.playerId][skill.id] = time + 1;
            }
            else {
                phase.times[data.from.playerId] = {};
                phase.times[data.from.playerId][skill.id] = 1;
            }
        }
        if (!req.result.playphase ||
            req.result.playphase === choose_types_1.PlayPhaseResule.End) {
            const skills = [
                ...data.playphase_skills
                    .keys()
                    .filter((v) => v.data.forced === 'cost'),
            ];
            if (skills.length > 1) {
                //TODO 多张军令
            }
            else if (skills.length > 0) {
                const skill = skills[0];
                await this.useskill({
                    use_skill: skill,
                    context: data.playphase_skills.get(skill),
                    req,
                    source: data,
                    reason: 'playphase',
                });
                if (phase.times[data.from.playerId]) {
                    const time = phase.times[data.from.playerId][skill.id] ?? 0;
                    phase.times[data.from.playerId][skill.id] = time + 1;
                }
                else {
                    phase.times[data.from.playerId] = {};
                    phase.times[data.from.playerId][skill.id] = 1;
                }
                req.result.playphase = choose_types_1.PlayPhaseResule.UseSkill;
            }
        }
        if (req.result.playphase &&
            req.result.playphase !== choose_types_1.PlayPhaseResule.End &&
            phase &&
            phase.phase === 4 /* Phase.Play */) {
            phase.insert(["PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */]);
        }
    }
    /** 创建一个事件数据 */
    createEventData(cotr, data) {
        return Object.assign(new cotr(this.eventids++, this), data || {});
    }
    /**
     * 操作类函数的参数可以提供一组数据由函数内部创建，或提供一个已经创建好的数据。该方法用于将参数转化成可以直接执行的数据或事件类
     * @param cotr 数据或事件的类型
     * @param data 提供的数据
     * @returns
     */
    cast(cotr, data) {
        return data instanceof cotr
            ? data
            : this.createEventData(cotr, data);
    }
    /** 获取一个状态函数的所有返回值 */
    getStates(type, args) {
        if (type === skill_types_1.StateEffectType.Skill_Invalidity) {
            const to = args[0];
            if (to instanceof effect_1.StateEffect &&
                (to.data[skill_types_1.StateEffectType.Skill_Invalidity] ||
                    to.data[skill_types_1.StateEffectType.Skill_Invalidity])) {
                return [];
            }
            return this.state_effects
                .filter((v) => v.data[type] && v !== args[0] && v.check())
                .map((v) => v.data[type].call(v, ...args))
                .filter((v) => v !== undefined);
        }
        if (type === skill_types_1.StateEffectType.IgnoreHeadAndDeputy) {
            const to = args[0];
            if (to instanceof effect_1.StateEffect &&
                (to.data[skill_types_1.StateEffectType.Skill_Invalidity] ||
                    to.data[skill_types_1.StateEffectType.Skill_Invalidity])) {
                return [];
            }
            return this.state_effects
                .filter((v) => v.data[type] && v !== args[0] && v.check())
                .map((v) => v.data[type].call(v, ...args))
                .filter((v) => v !== undefined);
        }
        return this.state_effects
            .filter((v) => v.data[type] && v.check())
            .map((v) => v.data[type].call(v, ...args))
            .filter((v) => v !== undefined);
    }
    /**
     * 检测一个数字是否满足一张牌的目标限制条件
     * @param result 需要检测的数字
     * @param count 牌的目标数量限制条件
     * @description 本方法检测{result}是否大于等于count的最小值
     * 如果count是一个数字，则会进行比较
     * 如果count是一个数组，则会与[0]进行比较
     * 无论如何result必须要大于0才可以
     */
    testUseCardCount(result, count) {
        if (result <= 0)
            return false;
        if (typeof count === 'number')
            return result >= count;
        if (Array.isArray(count) && count.length > 0)
            return result >= count[0];
    }
    /** 获取距离 */
    distance(from, to) {
        if (from.notDistanceCalc || to.notDistanceCalc)
            return Infinity;
        if (from === to)
            return 0;
        //终值状态技 会直接返回距离状态技中对终值修改的最小值
        const fixeds = this.getStates(skill_types_1.StateEffectType.Distance_Fixed, [
            from,
            to,
        ]).filter((v) => v !== undefined);
        if (fixeds.length > 0) {
            return Math.min(...fixeds);
        }
        let value = 0;
        let initright = 0;
        for (let next = from.right;; next = next.right) {
            if (next.notDistanceCalc)
                continue;
            initright++;
            if (next === to)
                break;
        }
        let initleft = 0;
        for (let next = from.left;; next = next.left) {
            if (next.notDistanceCalc)
                continue;
            initleft++;
            if (next === to)
                break;
        }
        value += Math.min(initleft, initright);
        //距离修正值状态技
        this.getStates(skill_types_1.StateEffectType.Distance_Correct, [from, to]).forEach((v) => {
            if (v !== undefined)
                value += v;
        });
        return Math.max(1, value);
    }
    /** 比较两个势力是否相同
     * @returns true 相同
     * @returns false 不同或无法比较
     * @param pre 是否比较明置后的势力
     * 0-不比较明置后的势力；
     * 1-用from的明置后势力与to现在的势力比较；
     * 2-用from现在的势力与to明置后的势力比较；
     * 3-用双方明置后的势力比较
     */
    sameAsKingdom(from, to, pre = 0) {
        if (!from || !to)
            return false;
        if (from === to)
            return true;
        if ((pre === 1 || pre === 3) && from instanceof player_1.GamePlayer) {
            from = { kingdom: from.getKingdomAfterOpen() };
        }
        if ((pre === 2 || pre === 3) && to instanceof player_1.GamePlayer) {
            to = { kingdom: to.getKingdomAfterOpen() };
        }
        return from.kingdom !== 'none' && from.kingdom === to.kingdom;
    }
    /** 比较两个势力是否不同
     * @returns true 不同
     * @returns false 相同或无法比较
     * @param pre 是否比较明置后的势力
     * 0-不比较明置后的势力；
     * 1-用from的明置后势力与to现在的势力比较；
     * 2-用from现在的势力与to明置后的势力比较；
     * 3-用双方明置后的势力比较
     */
    differentAsKingdom(from, to, pre = 0) {
        if (!from || !to)
            return false;
        if (from === to)
            return false;
        if ((pre === 1 || pre === 3) && from instanceof player_1.GamePlayer) {
            from = { kingdom: from.getKingdomAfterOpen() };
        }
        if ((pre === 2 || pre === 3) && to instanceof player_1.GamePlayer) {
            to = { kingdom: to.getKingdomAfterOpen() };
        }
        return (from.kingdom !== 'none' &&
            to.kingdom !== 'none' &&
            from.kingdom !== to.kingdom);
    }
    /** 是否为其他势力 */
    isOtherKingdom(from, to) {
        if (from === to)
            return false;
        if (from.kingdom === 'none' || to.kingdom === 'none')
            return true;
        return from.kingdom !== to.kingdom;
    }
    /** 获取两名角色的性别是否相同
     * @returns true 相同
     * @returns false 不同或无法比较
     */
    sameAsGender(from, to) {
        if (!from || !to)
            return false;
        if (from === to)
            return true;
        return from.gender !== 0 /* Gender.None */ && from.gender === to.gender;
    }
    /** 获取两名角色的性别是否不同
     * @returns true 不同
     * @returns false 相同或无法比较
     */
    differentAsGender(from, to) {
        if (!from || !to)
            return false;
        if (from === to)
            return false;
        return (from.gender !== 0 /* Gender.None */ &&
            to.gender !== 0 /* Gender.None */ &&
            from.gender !== to.gender);
    }
    /** 获取场上有的势力 */
    getKingdoms(includeDead = false) {
        const kingdoms = [];
        (includeDead ? this.players : this.playerAlives).forEach((v) => {
            if (v.kingdom !== 'none' && !kingdoms.includes(v.kingdom)) {
                kingdoms.push(v.kingdom);
            }
        });
        return kingdoms;
    }
    /** 获取场上的势力数
     * @param includeYe 是否包含野心家 默认为true
     * @param includeDead 是否包含死亡玩家 默认为false
     */
    getKingdomCount(includeYe = true, includeDead = false) {
        const ks = this.getKingdoms(includeDead);
        if (!includeYe) {
            return ks.filter((v) => !v.includes('ye')).length;
        }
        return ks.length;
    }
    /** 获取一个势力的人数 */
    getPlayerCountByKingdom(kingdom, includeDead = false, checkHuanjin = false) {
        if (kingdom === 'none')
            return 1;
        let count = (includeDead ? this.players : this.playerAlives).filter((v) => v.kingdom === kingdom).length;
        if (checkHuanjin && kingdom === 'qun') {
            const state = this.getMark('#huangjintianbingfu_state');
            const huangjin = this.effects.find((v) => v.id === state);
            if (huangjin && huangjin.check()) {
                count +=
                    huangjin.player.getUpOrSideCards('mark.tianbing').length;
            }
        }
        return count;
    }
    /** 获取一名角色所在的所有围攻关系 */
    getSiege(from) {
        if (!from)
            return [];
        const sieges = [];
        //A的上家和下家势力相同，且与A的势力不同。
        if (this.sameAsKingdom(from.next, from.prev) &&
            this.differentAsKingdom(from, from.next)) {
            sieges.push({ from: [from.next, from.prev], target: from });
        }
        //A的下家与A的势力不同，且A的下家的下家与A势力相同且不为A
        if (this.differentAsKingdom(from, from.next) &&
            from.next.next !== from &&
            this.sameAsKingdom(from.next.next, from)) {
            sieges.push({ from: [from.next.next, from], target: from.next });
        }
        //A的上家与A的势力不同，且A的上家的上家与A势力相同且不为A
        if (this.differentAsKingdom(from, from.prev) &&
            from.prev.prev !== from &&
            this.sameAsKingdom(from.prev.prev, from)) {
            sieges.push({ from: [from.prev.prev, from], target: from.prev });
        }
        return sieges;
    }
    /** 获取以一名角色为起点的所有队列角色（包含他自己） */
    getQueue(from) {
        if (!from)
            return [];
        const players = new Set();
        players.add(from);
        //视为在队列里
        let view = false;
        this.playerAlives.forEach((v) => {
            if (this.getStates(skill_types_1.StateEffectType.Regard_ArrayCondition, [
                from,
                v,
                'quene',
            ]).some((v) => v)) {
                players.add(v);
                view = true;
            }
        });
        for (let next = from.right;; next = next.right) {
            if (!next)
                break;
            if (next.notSeatCalc)
                continue;
            if (this.sameAsKingdom(from, next)) {
                players.add(next);
            }
            else {
                break;
            }
            if (next === from)
                break;
        }
        for (let next = from.left;; next = next.left) {
            if (!next)
                break;
            if (next.notSeatCalc)
                continue;
            if (this.sameAsKingdom(from, next)) {
                players.add(next);
            }
            else {
                break;
            }
            if (next === from)
                break;
        }
        if (players.size > 1 || view) {
            return [...new Set(players)];
        }
        else {
            return [];
        }
    }
    getReconnectData(selfId) {
        return {
            roomId: this.roomId,
            selfId,
            options: this.options,
            turnCount: this.turnCount,
            circleCount: this.circleCount,
            shuffleCount: this.shuffleCount,
            players: this.sortPlayers(this.players).map((v) => {
                return {
                    camp_mode: v.camp_mode,
                    general_mode: v.general_mode,
                    playerId: v.playerId,
                    controlId: v.controlId,
                    username: v.username,
                    skipWuxie: v.skipWuxie,
                    seat: v.seat,
                    phase: v.phase,
                    kingdom: v.kingdom,
                    chained: v.chained,
                    skip: v.skip,
                    death: v.death,
                    inturn: v.inturn,
                    inplayphase: v.inplayphase,
                    inresponse: v.inresponse,
                    insubtarget: v.insubtarget,
                    _indying: v._indying,
                    maxhp: v.maxhp,
                    inthp: v.inthp,
                    hp: v.hp,
                    shield: v.shield,
                    _head: v._head,
                    _deputy: v._deputy,
                    headOpen: v.headOpen,
                    deputyOpen: v.deputyOpen,
                    judgeCards: v.judgeCards.map((j) => j.vdata),
                    equipCards: v.equipCards.map((e) => e.id),
                    disableEquips: v.disableEquips,
                    _mark: v._mark,
                };
            }),
            cards: this.cards.map((v) => {
                return {
                    id: v.id,
                    area: v.area.areaId,
                    put: v.put,
                    visibles: v.visibles,
                    _mark: v._mark,
                    sourceData: {
                        id: v.id,
                        name: v.sourceData.name,
                        suit: v.sourceData.suit,
                        number: v.sourceData.number,
                        attr: v.sourceData.attr,
                        derived: false,
                        package: '',
                    },
                };
            }),
            generals: [...this.generals.values()].map((v) => {
                return {
                    id: v.id,
                    area: v.area?.areaId,
                    put: v.put,
                    visibles: v.visibles,
                    _mark: v._mark,
                };
            }),
            skills: this.skills.map((v) => {
                return {
                    id: v.id,
                    player: v.player?.playerId,
                    name: v.name,
                    options: v.options,
                    _mark: v._mark,
                };
            }),
            effects: this.effects.map((v) => {
                return {
                    id: v.id,
                    player: v.player?.playerId,
                    name: v.data.name,
                    skill: v.skill?.id,
                    _mark: v._mark,
                };
            }),
            _mark: this._mark,
        };
    }
    /** 获取默认所有额定阶段 */
    getRatedPhases() {
        return [
            { phase: 1 /* Phase.Ready */, isExtra: false },
            { phase: 2 /* Phase.Judge */, isExtra: false },
            { phase: 3 /* Phase.Draw */, isExtra: false },
            { phase: 4 /* Phase.Play */, isExtra: false },
            { phase: 5 /* Phase.Drop */, isExtra: false },
            { phase: 6 /* Phase.End */, isExtra: false },
        ];
    }
    isCardReason(reason) {
        return this.cardNames.includes(reason);
    }
}
exports.GameRoom = GameRoom;
