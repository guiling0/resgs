"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePlayer = void 0;
const skill_types_1 = require("../skill/skill.types");
const vcard_1 = require("../card/vcard");
class GamePlayer {
    constructor() {
        this.__self = false;
        this.broadcastCustom = (data) => {
            this.room.markChanges.push({
                objType: 'player',
                objId: this.playerId,
                key: data.key,
                value: data.value,
                options: data.options,
            });
        };
        /** 预选武将 */
        this.prechooses = [];
        /** mvp分 */
        this.mvp_score = {
            kill: 0,
            damage: 0,
            recover: 0,
            assistant: 0,
            kill_count: 0,
            damage_count: 0,
            recover_count: 0,
        };
        /** 跳过无懈询问 */
        this.skipWuxie = false;
        /** 座次 */
        this.seat = 0;
        /** 阶段 */
        this.phase = 0 /* Phase.None */;
        /** 身份 */
        this.role = 'none';
        /** 势力 */
        this._kingdom = 'none';
        /** 连环状态 */
        this.chained = false;
        /** 翻面状态 */
        this.skip = false;
        /** 是否死亡 */
        this.death = false;
        /** 休整剩余轮次 */
        this.rest = 0;
        /** 是否处于回合内 */
        this.inturn = false;
        /** 是否处于出牌阶段 */
        this.inplayphase = false;
        /** 是否处于响应中 */
        this.inresponse = false;
        /** 是否为子目标 @description 仅用于显示UI框 */
        this.insubtarget = false;
        /** 是否处于掉虎离山状态 */
        this.indiaohu = false;
        /** 酒状态 */
        this.jiuState = 0;
        /** 是否处于濒死状态 */
        this._indying = [];
        /** 体力上限 */
        this.maxhp = 0;
        /** 体力值 */
        this.inthp = 0;
        /** 体力 */
        this.hp = 0;
        /** 护甲值 */
        this.shield = 0;
        /** 阵营模式 */
        this.camp_mode = 'kingdom';
        /** 武将模式 */
        this.general_mode = 'dual';
        /** 主将武将ID */
        this._head = '09';
        /** 副将武将ID */
        this._deputy = '09';
        /** 主将是否明置 */
        this.headOpen = false;
        /** 主将是否明置 */
        this.deputyOpen = false;
        /** 判定区里的牌 */
        this.judgeCards = [];
        /** 装备区里的牌 */
        this.equipCards = [];
        /** 被废除的装备栏 */
        this.disableEquips = [];
    }
    /** 设置并广播一个属性 */
    setProperty(key, value) {
        this[key] = value;
        this.room.propertyChanges.push(['player', this.playerId, key, value]);
    }
    /** 游戏名字 */
    get gameName() {
        let name = '';
        if (this.hasHead() && this.headOpen) {
            name += sgs.getTranslation(this.head.trueName);
        }
        else if (this.hasDeputy() && this.deputyOpen) {
            name += sgs.getTranslation(this.deputy.trueName);
        }
        else if (this.seat > 0) {
            name += `${this.seat}号位`;
        }
        if (this.__self) {
            name += '(你)';
        }
        return name;
    }
    set kingdom(value) {
        if (value.includes('ye')) {
            this._kingdom = `${value}_${this.room.yeids++}`;
        }
        else {
            this._kingdom = value;
        }
    }
    get kingdom() {
        return (this.room
            .getStates(skill_types_1.StateEffectType.Regard_Kingdom, [this])
            .at(-1) ?? this._kingdom);
    }
    /** 是否是大势力 */
    isBigKingdom() {
        const bigs = this.room.getBigKingdom();
        return bigs.length > 0 && bigs.includes(this.kingdom);
    }
    /** 是否是小势力 */
    isSmallKingdom() {
        const bigs = this.room.getBigKingdom();
        return bigs.length > 0 && !bigs.includes(this.kingdom);
    }
    /** 性别 */
    get gender() {
        if (this.head && this.headOpen) {
            return this.head.gender;
        }
        else if (this.deputy && this.deputyOpen) {
            return this.deputy.gender;
        }
        return 0 /* Gender.None */;
    }
    /** 是否存活 */
    get alive() {
        return !this.death;
    }
    get indying() {
        return lodash.max(this._indying) ?? 0;
    }
    set indying(value) {
        if (value < 0) {
            lodash.remove(this._indying, (c) => c === (value *= -1));
        }
        else {
            this._indying.push(value);
        }
    }
    /** 已损失体力值 */
    get losshp() {
        return this.maxhp - this.hp;
    }
    /** 手牌上限 */
    get maxhand() {
        //终值状态技 会直接返回手牌上限状态技中对终值修改的最大值
        const fixeds = this.room.getStates(skill_types_1.StateEffectType.MaxHand_Fixed, [
            this,
        ]);
        if (fixeds.length > 0) {
            return Math.max(...fixeds);
        }
        //初值 对初值修改的最大值
        const inits = this.room.getStates(skill_types_1.StateEffectType.MaxHand_Initial, [
            this,
        ]);
        let value = inits.length > 0 ? Math.max(...inits) : this.inthp;
        //修正值
        this.room
            .getStates(skill_types_1.StateEffectType.MaxHand_Correct, [this])
            .forEach((v) => {
            value += v;
        });
        return Math.max(0, value);
    }
    /** 攻击范围 */
    get range() {
        //终值状态技 会直接返回手牌上限状态技中对终值修改的最大值
        const fixeds = this.room.getStates(skill_types_1.StateEffectType.Range_Fixed, [this]);
        if (fixeds.length > 0) {
            return Math.max(...fixeds);
        }
        //初值 对初值修改的最大值
        const inits = this.room.getStates(skill_types_1.StateEffectType.Range_Initial, [
            this,
        ]);
        let value = inits.length > 0 ? Math.max(...inits) : 1;
        //修正值
        this.room
            .getStates(skill_types_1.StateEffectType.Range_Correct, [this])
            .forEach((v) => {
            value += v;
        });
        return Math.max(0, value);
    }
    /** 主将武将牌 */
    get head() {
        return this.room.getGeneral(this._head);
    }
    /** 副将武将牌 */
    get deputy() {
        return this.room.getGeneral(this._deputy);
    }
    /** 是否有未明置的武将牌 */
    hasNoneOpen() {
        let open_head = false;
        if (this.headOpen)
            open_head = true;
        else if (!this.hasHead())
            open_head = true;
        let open_deputy = false;
        if (this.deputyOpen)
            open_deputy = true;
        else if (!this.hasDeputy())
            open_deputy = true;
        return !open_head || !open_deputy;
    }
    /** 是否有主将 */
    hasHead() {
        return this.head && !this.head.name.includes('shibing');
    }
    /** 是否有副将 */
    hasDeputy() {
        return this.deputy && !this.deputy.name.includes('shibing');
    }
    /** 指定的武将牌是否明置。如果提供的武将牌不是自己的武将牌则返回false */
    isOpen(general) {
        if (general === 'head')
            return this.headOpen;
        if (general === 'deputy')
            return this.deputyOpen;
        if (this.head === general)
            return this.headOpen;
        if (this.deputy === general)
            return this.deputyOpen;
        return false;
    }
    /** 获取所有武将牌 */
    getGenerls() {
        if (this.hasHead() && this.hasDeputy()) {
            return [this.head, this.deputy];
        }
        else if (this.hasHead()) {
            return [this.head];
        }
        else if (this.hasDeputy()) {
            return [this.deputy];
        }
        else {
            return [];
        }
    }
    /** 获取已明置的所有武将牌 */
    getOpenGenerls() {
        const generals = [];
        if (this.hasHead() && this.headOpen) {
            generals.push(this.head);
        }
        if (this.hasDeputy() && this.deputyOpen) {
            generals.push(this.deputy);
        }
        return generals;
    }
    /** 获取暗置的所有武将牌 */
    getCloseGenerls() {
        const generals = [];
        if (this.hasHead() && !this.headOpen) {
            generals.push(this.head);
        }
        if (this.hasDeputy() && !this.deputyOpen) {
            generals.push(this.deputy);
        }
        return generals;
    }
    /**
     * 获取所有可以明置的武将牌 @description 未明置且未受状态影响
     */
    getCanOpenGenerals() {
        const generals = this.getCloseGenerls();
        return generals.filter((v) => !this.room
            .getStates(skill_types_1.StateEffectType.Prohibit_Open, [
            this,
            [v],
            'test',
        ])
            .some((v) => v));
    }
    /**
     * 获取所有可以暗置的武将牌 @description 已明置，不是士兵或君主，未受状态影响
     */
    getCanCloseGenerals() {
        const generals = this.getOpenGenerls();
        return generals.filter((v) => !v.isLord() &&
            !v.isShibing() &&
            !this.room
                .getStates(skill_types_1.StateEffectType.Prohibit_Close, [
                this,
                [v],
                'test',
            ])
                .some((v) => v));
    }
    /** 手牌区 */
    get handArea() {
        return this.room.areas.get(`${this.playerId}.${91 /* AreaType.Hand */.toString()}`);
    }
    /** 装备区 */
    get equipArea() {
        return this.room.areas.get(`${this.playerId}.${92 /* AreaType.Equip */.toString()}`);
    }
    /** 判定区 */
    get judgeArea() {
        return this.room.areas.get(`${this.playerId}.${93 /* AreaType.Judge */.toString()}`);
    }
    /** 武将牌上 */
    get upArea() {
        return this.room.areas.get(`${this.playerId}.${94 /* AreaType.Up */.toString()}`);
    }
    /** 武将牌旁 */
    get sideArea() {
        return this.room.areas.get(`${this.playerId}.${95 /* AreaType.Side */.toString()}`);
    }
    /** 不计入座次的计算 */
    get notSeatCalc() {
        if (this.room
            .getStates(skill_types_1.StateEffectType.NotCalcSeat, [this])
            .some((v) => v)) {
            return true;
        }
        return this.death;
    }
    /** 不计入距离的计算 */
    get notDistanceCalc() {
        if (this.room
            .getStates(skill_types_1.StateEffectType.NotCalcDistance, [this])
            .some((v) => v)) {
            return true;
        }
        return this.death;
    }
    /** 右边的玩家 */
    get right() {
        const seat = this.seat === this.room.players.length ? 1 : this.seat + 1;
        return this.room.players.find((v) => v.seat === seat);
    }
    /** 左边的玩家 */
    get left() {
        const seat = this.seat === 1 ? this.room.players.length : this.seat - 1;
        return this.room.players.find((v) => v.seat === seat);
    }
    /** 下家 */
    get next() {
        if (this.notSeatCalc) {
            return undefined;
        }
        const players = this.room.sortPlayers(this.room.players, this, true);
        const next = players.find((v) => v !== this && !v.notSeatCalc);
        return next === this ? undefined : next;
    }
    /** 上家 */
    get prev() {
        if (this.notSeatCalc) {
            return undefined;
        }
        const players = this.room.sortPlayers(this.room.players, this, true);
        const prev = players.findLast((v) => !v.notSeatCalc);
        return prev === this ? undefined : prev;
    }
    /** 与其他角色的距离 */
    distanceTo(to) {
        return this.room.distance(this, to);
    }
    /** 其他角色与你的距离 */
    distanceFrom(from) {
        return this.room.distance(from, this);
    }
    /** 攻击范围内是否包含 */
    rangeOf(to) {
        if (to === this)
            return false;
        //视为不在攻击范围内
        if (this.room
            .getStates(skill_types_1.StateEffectType.Range_Without, [this, to])
            .some((v) => v))
            return false;
        //视为在攻击范围内
        if (this.room
            .getStates(skill_types_1.StateEffectType.Range_Within, [this, to])
            .some((v) => v))
            return true;
        return this.range >= this.distanceTo(to);
    }
    /** 设置装备牌
     * @description 如果这张牌已经在等待判定，则删除
     */
    async setEquip(card) {
        if (card.type !== 3 /* CardType.Equip */)
            return;
        if (!this.equipCards.includes(card)) {
            this.room.propertyChanges.push([
                'player',
                this.playerId,
                'setEquip',
                card.id,
            ]);
            this.equipCards.push(card);
            const skill = await this.room.addSkill(card.name, this, {
                source: `equip:${card.id}`,
                showui: 'none',
            });
            if (skill) {
                skill.sourceEquip = card;
            }
        }
    }
    /** 设置装备牌
     * @description 如果这张牌已经在等待判定，则删除
     */
    async removeEquip(card) {
        if (card.type !== 3 /* CardType.Equip */)
            return;
        if (this.equipCards.includes(card)) {
            this.room.propertyChanges.push([
                'player',
                this.playerId,
                'removeEquip',
                card.id,
            ]);
            await this.room.getSkillByEquip(card)?.removeSelf();
            lodash.remove(this.equipCards, (c) => c === card);
        }
    }
    /**
     * 获取玩家已装备的指定类型的装备
     * @param type 装备类型
     * @returns 对应的装备牌。若没有对应类型的装备，返回undefined
     */
    getEquip(type) {
        return this.equipCards.find((v) => v.subtype === type);
    }
    /** 设置一张等待判定的判定牌
     * @description 如果这张牌已经在等待判定，则删除
     */
    setDelayedScroll(card) {
        if (card.subtype === 22 /* CardSubType.DelayedScroll */) {
            if (!this.judgeCards.includes(card)) {
                this.judgeCards.push(card);
                this.room.propertyChanges.push([
                    'player',
                    this.playerId,
                    'setDelayedScroll',
                    card.vdata,
                ]);
            }
        }
    }
    /** 设置一张等待判定的判定牌
     * @description 如果这张牌已经在等待判定，则删除
     */
    delDelayedScroll(card) {
        if (card.subtype === 22 /* CardSubType.DelayedScroll */) {
            if (this.judgeCards.includes(card)) {
                lodash.remove(this.judgeCards, (c) => c === card);
                this.room.propertyChanges.push([
                    'player',
                    this.playerId,
                    'delDelayedScroll',
                    card.vdata,
                ]);
            }
        }
    }
    /** 判断是否已有等待判定的判定牌 */
    hasJudgeCard(card) {
        return this.judgeCards.find((v) => v.name === card);
    }
    /** 判断一张装备牌是否是该角色的 */
    hasEquip(card) {
        return this.equipArea.cards.includes(card);
    }
    /** 是否与一名角色相邻 */
    isAdjacent(player) {
        return this.next === player || this.prev === player;
    }
    /** 是否为野心家 */
    isYexinjia() {
        return this.kingdom.includes('ye');
    }
    /** 合法的修改体力值
     * @description 这个方法用于直接修改体力值，且不会超过体力上限。该方法一般不会被直接调用，因为他不会触发有关于体力改变事件（如伤害事件，扣减体力事件等）的相关时机。体力值修改时inthp会被一并修改。
     */
    changeHp(value) {
        let newhp = value;
        if (newhp > this.maxhp)
            newhp = this.maxhp;
        this.setProperty('hp', newhp);
        this.setProperty('inthp', Math.max(0, newhp));
    }
    /** 获取明置后的势力
     * @description 仅获取，不会更改势力
     */
    getKingdomAfterOpen() {
        //TODO 双势力武将未处理
        let kindom = this.kingdom;
        if (this.head && !this.head.isShibing()) {
            kindom = this.head.kingdom;
        }
        else if (this.deputy && !this.deputy.isShibing()) {
            kindom = this.deputy.kingdom;
        }
        else {
            kindom = 'none';
        }
        if (this.kingdom !== 'none') {
            kindom = this.kingdom;
        }
        if (kindom === 'none')
            return 'none';
        if (this.room.getData(`lord_${kindom}`)) {
        }
        else if (this.room.getData(`lord_${kindom}_die`)) {
            kindom = `ye_${kindom}`;
        }
        else if (this.room.kingdomIsGreaterThenHalf(kindom, this.kingdom !== kindom)) {
            kindom = `ye_${kindom}`;
        }
        return kindom;
    }
    /** 国战模式下赋予玩家势力 */
    definWarsKindom() {
        let kindom = this.getKingdomAfterOpen();
        if (this.kingdom !== kindom) {
            this.setProperty('kingdom', kindom);
        }
    }
    /** 获取主要武将 */
    getMainGeneral() {
        if (this.head && !this.head.isShibing()) {
            return this.head;
        }
        else if (this.deputy && !this.deputy.isShibing()) {
            return this.deputy;
        }
        else {
            return undefined;
        }
    }
    /** 获取所有手牌 */
    getHandCards() {
        return sgs.utils.shuffle(this.handArea.cards);
    }
    /** 获取所有装备区里的牌 */
    getEquipCards() {
        return this.equipArea.cards;
    }
    /** 获取所有判定区里的牌 */
    getJudgeCards() {
        return this.judgeArea.cards;
    }
    /** 获取所有角色的牌 */
    getSelfCards() {
        return [...this.getHandCards(), ...this.getEquipCards()];
    }
    /** 获取角色区域里的所有 */
    getAreaCards() {
        return [
            ...this.getHandCards(),
            ...this.getEquipCards(),
            ...this.getJudgeCards(),
        ];
    }
    /** 获取角色的区域里的所有牌，按照区域划分 */
    getCardsToArea(pos = 'he') {
        const cards = [];
        if (this.handArea.count > 0 && pos.includes('h')) {
            cards.push({
                title: 'handArea',
                cards: this.getHandCards(),
            });
        }
        if (this.equipArea.count > 0 && pos.includes('e')) {
            cards.push({
                title: 'equipArea',
                cards: this.getEquipCards(),
            });
        }
        if (this.judgeArea.count > 0 && pos.includes('j')) {
            cards.push({
                title: 'judgeArea',
                cards: this.getJudgeCards(),
            });
        }
        return cards;
    }
    /** 获取已装备的所有马 */
    getHorses() {
        return [
            this.getEquip(35 /* EquipSubType.SpecialMount */),
            this.getEquip(33 /* EquipSubType.DefensiveMount */),
            this.getEquip(34 /* EquipSubType.OffensiveMount */),
        ].filter((v) => v);
    }
    /** 是否有手牌 */
    hasHandCards() {
        return this.handArea.count > 0;
    }
    /** 从武将牌上或武将牌旁获取有指定mark的牌 */
    getUpOrSideCards(markKey) {
        return [...this.upArea.cards, ...this.sideArea.cards].filter((v) => markKey ? v.hasMark(markKey) : true);
    }
    /** 检测武将牌上或武将牌旁获取有指定mark的牌 */
    hasUpOrSideCards(markKey) {
        return !![...this.upArea.cards, ...this.sideArea.cards].find((v) => markKey ? v.hasMark(markKey) : true);
    }
    /**
     * 区域里是否有牌
     * @param includeJudge 是否包含判定区
     * @returns
     */
    hasCardsInArea(includeJudge = false) {
        return (this.handArea.count > 0 ||
            this.equipArea.count > 0 ||
            (includeJudge ? this.judgeArea.count > 0 : false));
    }
    /** 能弃置的牌的数量是否大于指定数值 */
    hasCanDropCards(pos, player, number = 1, reason) {
        const cards = [];
        if (pos.includes('h'))
            cards.push(...this.getHandCards());
        if (pos.includes('e'))
            cards.push(...this.getEquipCards());
        return (cards.filter((v) => player.canDropCard(v, reason)).length >= number);
    }
    /** 获取一张牌的使用动画和语音 */
    getCardUseAniAndAudio(card) {
        let ani_name = card.name;
        let audio_url = card.name;
        if (card.name === 'sha') {
            ani_name = card.color === 1 /* CardColor.Red */ ? 'hongsha' : 'heisha';
            if (card.attr.includes(2 /* CardAttr.Thunder */)) {
                ani_name = 'leisha';
                audio_url = 'sha_thunder';
            }
            if (card.attr.includes(1 /* CardAttr.Fire */)) {
                ani_name = 'huosha';
                audio_url = 'sha_fire';
            }
        }
        //audio
        if (sgs.utils.getCardType(card.name) === 3 /* CardType.Equip */) {
            let audio = 'weapon', subtype = sgs.utils.getCardSubtype(card.name);
            if (subtype === 31 /* CardSubType.Weapon */) {
                audio = 'weapon';
            }
            if (subtype === 32 /* CardSubType.Armor */ ||
                subtype === 36 /* CardSubType.Treasure */) {
                audio = 'armor';
            }
            if (subtype === 33 /* CardSubType.DefensiveMount */ ||
                subtype === 34 /* CardSubType.OffensiveMount */ ||
                subtype === 35 /* CardSubType.SpecialMount */) {
                audio = 'horse';
            }
            audio_url = `./audio/equip/${audio}.mp3`;
        }
        else {
            audio_url = `./audio/card/${this.gender === 1 /* Gender.Male */ ? 'male' : 'female'}/${audio_url}.mp3`;
        }
        return {
            ani_name,
            audio_url,
        };
    }
    /** 检测是否能打出某牌 */
    canPlayCard(card, reason) {
        let _card;
        if (typeof card === 'string') {
            _card = this.room.createVirtualCardByNone(card, undefined, false);
        }
        else {
            _card = card;
        }
        //会导致一名角色不能打出牌的原因为其受到技能的效果的影响。
        return !this.room
            .getStates(skill_types_1.StateEffectType.Prohibit_PlayCard, [this, _card, reason])
            .some((v) => v);
    }
    /** 检测能否使用某牌
     * @param card 要使用的牌
     * @param targets 对特定目标进行检测
     * @param reason 使用原因
     * @param targetSelector 选择目标的规则
     * @param selecteds 已提前选择的目标
     * @description 更新以targetSelector作为解除次数或距离限制。其中跳过次数检测默认为true，也就是说只要提供了targetSelector就会跳过次数检测。除非显示的提供false值。
     * 原本在虚拟牌数据下的跳过次数或距离的检测暂时不作修改，用于兼容之前的代码
     */
    canUseCard(card, targets, reason, targetSelector, selecteds = []) {
        let _card;
        if (!(card instanceof vcard_1.VirtualCard)) {
            const name = card.name;
            const method = card.method ?? 1;
            _card = this.room.createVirtualCardByNone(name, undefined, false);
            _card.custom.method = method;
        }
        else {
            _card = card;
        }
        let skipTimes = false;
        if (targetSelector && (targetSelector.excluesCardTimesLimit ?? true)) {
            skipTimes = true;
        }
        let skipDistances = false;
        if (targetSelector && targetSelector.excluesCardDistanceLimit) {
            skipDistances = true;
        }
        //1、其受到技能的效果的影响。
        if (this.room
            .getStates(skill_types_1.StateEffectType.Prohibit_UseCard, [
            this,
            _card,
            undefined,
            reason,
        ])
            .some((v) => v))
            return false;
        const use_skill = this.room.getCardUse(_card.name, _card.custom.method ?? 1);
        if (!use_skill)
            return false;
        // 2、其使用过与此牌牌名相同的牌的次数不小于其使用与此牌牌名相同的牌的次数上限。
        if (!skipTimes) {
            const pass = this.room
                .getStates(skill_types_1.StateEffectType.TargetMod_PassTimeCheck, [
                this,
                _card,
                undefined,
            ])
                .some((v) => v);
            if (!pass) {
                let times = 0;
                times = use_skill.timeCondition.call(use_skill, this.room, this, _card);
                this.room
                    .getStates(skill_types_1.StateEffectType.TargetMod_CorrectTime, [
                    this,
                    _card,
                    undefined,
                ])
                    .forEach((v) => (times += v));
                const uses = this.getMark(`__${card.name}_times`) ?? 0;
                if (uses >= times)
                    return false;
            }
        }
        //3、此牌的合法目标数小于额定目标数下限或等于0。
        //目标为角色
        if (use_skill.target) {
            const selector = use_skill.target.call(use_skill, this.room, this, _card);
            const checks = targets && Array.isArray(targets)
                ? targets
                : selector.excluesDeath ?? true
                    ? this.room.playerAlives
                    : this.room.players;
            const legels = checks.slice().filter((target) => {
                //状态技检测
                const state_check = this.room
                    .getStates(skill_types_1.StateEffectType.Prohibit_UseCard, [
                    this,
                    _card,
                    target,
                    reason,
                ])
                    .some((v) => v);
                if (state_check)
                    return false;
                const limit = !targetSelector ||
                    !(targetSelector.excluesCardLimit ?? false);
                //牌本身的目标检测
                const card_check = selector.filter?.call(undefined, target, selecteds) ?? true;
                if (limit && !card_check)
                    return false;
                //次数检测
                if (!skipTimes) {
                    const pass = this.room
                        .getStates(skill_types_1.StateEffectType.TargetMod_PassTimeCheck, [
                        this,
                        _card,
                        target,
                    ])
                        .some((v) => v);
                    if (!pass) {
                        let times = 0;
                        times = use_skill.timeCondition.call(use_skill, this.room, this, _card);
                        this.room
                            .getStates(skill_types_1.StateEffectType.TargetMod_CorrectTime, [
                            this,
                            _card,
                            target,
                        ])
                            .forEach((v) => (times += v));
                        const uses = this.getMark(`__${card.name}_times`) ?? 0;
                        if (uses >= times)
                            return false;
                    }
                }
                //距离检测
                if (!skipDistances) {
                    const pass = this.room
                        .getStates(skill_types_1.StateEffectType.TargetMod_PassDistanceCheck, [this, _card, target])
                        .some((v) => v);
                    if (!pass) {
                        const check = use_skill.distanceCondition.call(use_skill, this.room, this, target, _card);
                        if (!check)
                            return false;
                    }
                }
                //额外限制
                if (targetSelector) {
                    const extra_check = targetSelector.filter?.call(undefined, target, []) ??
                        true;
                    if (!extra_check)
                        return false;
                }
                return true;
            });
            return legels.length > 0;
        }
        //目标为牌
        if (targetSelector && (targetSelector.excluesToCard ?? false)) {
            return false;
        }
        const check_tocard = this.room
            .getStates(skill_types_1.StateEffectType.Prohibit_UseCard, [
            this,
            _card,
            Array.isArray(targets) ? undefined : targets,
            reason,
        ])
            .some((v) => v);
        return !check_tocard;
    }
    /** 角色能否弃置某张牌 */
    canDropCard(card, reason) {
        return !this.room
            .getStates(skill_types_1.StateEffectType.Prohibit_DropCards, [this, card, reason])
            .some((v) => v);
    }
    /** 角色能否发起拼点 */
    canPindian(targets, reason) {
        if (!this.hasHandCards())
            return false;
        if (targets.some((v) => !v.hasHandCards()))
            return false;
        return !this.room
            .getStates(skill_types_1.StateEffectType.Prohibit_Pindian, [
            this,
            targets,
            reason,
        ])
            .some((v) => v);
    }
    /** 是否拥有技能 */
    hasSkill(skill) {
        return typeof skill === 'number'
            ? this.room.skills.find((v) => v.id === skill)?.player === this
            : skill.player === this;
    }
    /** 是否未确定势力 */
    isNoneKingdom() {
        return this.kingdom === 'none';
    }
    /** 区域是否属于自己的牌的区域 */
    isOnwerCardArea(area) {
        return ((area.type === 91 /* AreaType.Hand */ || area.type === 92 /* AreaType.Equip */) &&
            area.player === this);
    }
    /** 刷新脸上的标记 */
    set refreshMark(value) {
        this.room.propertyChanges.push([
            'player',
            this.playerId,
            'refreshMark',
            value,
        ]);
    }
}
exports.GamePlayer = GamePlayer;
