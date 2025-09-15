import { GameRoom } from '../room/room';
import { Phase } from './player.types';
import { SkillId, StateEffectType } from '../skill/skill.types';
import { Custom, SetMark } from '../custom/custom';
import { Gender, GeneralId } from '../general/general.type';
import {
    CardAttr,
    CardColor,
    CardPut,
    CardSubType,
    CardType,
    EquipSubType,
    GameCardId,
    SourceData,
    VirtualCardData,
} from '../card/card.types';
import { VirtualCard } from '../card/vcard';
import { GameCard } from '../card/card';
import { AreaType } from '../area/area.type';
import { Skill } from '../skill/skill';
import { Area } from '../area/area';
import { ChoosePlayerData } from '../choose/types/choose.player';
import { CustomString, MarkOptions, MarkValue } from '../custom/custom.type';
import { General } from '../general/general';

export class GamePlayer {
    public __self: boolean = false;

    public broadcastCustom: (
        data: Omit<SetMark, 'type' | 'objType' | 'objId'>
    ) => void = (data) => {
        this.room.markChanges.push({
            objType: 'player',
            objId: this.playerId,
            key: data.key,
            value: data.value,
            options: data.options,
        });
    };

    public sessionId: string;

    /** 预选武将 */
    public prechooses: string[] = [];

    /** mvp分 */
    public mvp_score = {
        kill: 0,
        damage: 0,
        recover: 0,
        assistant: 0,
        kill_count: 0,
        damage_count: 0,
        recover_count: 0,
    };

    /** 唯一id */
    public playerId: string;

    /** 控制该玩家的id */
    public controlId: string;

    /** 玩家名字 */
    public username: string;

    /** 所属房间 */
    public room: GameRoom;

    /** 跳过无懈询问 */
    public skipWuxie: boolean = false;

    /** 设置并广播一个属性 */
    public setProperty<T extends keyof GamePlayer>(
        this: GamePlayer,
        key: T,
        value: GamePlayer[T]
    ) {
        this[key] = value;
        this.room.propertyChanges.push(['player', this.playerId, key, value]);
    }

    /** 游戏名字 */
    public get gameName(): string {
        let name = '';
        if (this.hasHead() && this.headOpen) {
            name += sgs.getTranslation(this.head.trueName);
        } else if (this.hasDeputy() && this.deputyOpen) {
            name += sgs.getTranslation(this.deputy.trueName);
        } else if (this.seat > 0) {
            name += `${this.seat}号位`;
        }
        if (this.__self) {
            name += '(你)';
        }
        return name;
    }
    /** 座次 */
    public seat: number = 0;
    /** 阶段 */
    public phase: Phase = Phase.None;
    /** 身份 */
    public role: string = 'none';
    /** 势力 */
    public _kingdom: string = 'none';
    public set kingdom(value: string) {
        if (value.includes('ye')) {
            this._kingdom = `${value}_${this.room.yeids++}`;
        } else {
            this._kingdom = value;
        }
    }
    public get kingdom() {
        return (
            this.room
                .getStates(StateEffectType.Regard_Kingdom, [this])
                .at(-1) ?? this._kingdom
        );
    }
    /** 是否是大势力 */
    public isBigKingdom() {
        const bigs = this.room.getBigKingdom();
        return bigs.length > 0 && bigs.includes(this.kingdom);
    }
    /** 是否是小势力 */
    public isSmallKingdom() {
        const bigs = this.room.getBigKingdom();
        return bigs.length > 0 && !bigs.includes(this.kingdom);
    }
    /** 性别 */
    public get gender(): Gender {
        if (this.head && this.headOpen) {
            return this.head.gender;
        } else if (this.deputy && this.deputyOpen) {
            return this.deputy.gender;
        }
        return Gender.None;
    }
    /** 连环状态 */
    public chained: boolean = false;
    /** 翻面状态 */
    public skip: boolean = false;
    /** 是否死亡 */
    public death: boolean = false;
    /** 休整剩余轮次 */
    public rest: number = 0;
    /** 是否存活 */
    public get alive() {
        return !this.death;
    }
    /** 是否处于回合内 */
    public inturn: boolean = false;
    /** 是否处于出牌阶段 */
    public inplayphase: boolean = false;
    /** 是否处于响应中 */
    public inresponse: boolean = false;
    /** 是否为子目标 @description 仅用于显示UI框 */
    public insubtarget: boolean = false;
    /** 是否处于掉虎离山状态 */
    public indiaohu: boolean = false;
    /** 酒状态 */
    public jiuState: number = 0;
    /** 是否处于濒死状态 */
    public _indying: number[] = [];
    public get indying() {
        return lodash.max(this._indying) ?? 0;
    }
    public set indying(value: number) {
        if (value < 0) {
            lodash.remove(this._indying, (c) => c === (value *= -1));
        } else {
            this._indying.push(value);
        }
    }
    /** 体力上限 */
    public maxhp: number = 0;
    /** 体力值 */
    public inthp: number = 0;
    /** 已损失体力值 */
    public get losshp() {
        return this.maxhp - this.hp;
    }
    /** 体力 */
    public hp: number = 0;
    /** 护甲值 */
    public shield: number = 0;
    /** 手牌上限 */
    public get maxhand() {
        //终值状态技 会直接返回手牌上限状态技中对终值修改的最大值
        const fixeds = this.room.getStates(StateEffectType.MaxHand_Fixed, [
            this,
        ]);
        if (fixeds.length > 0) {
            return Math.max(...fixeds);
        }
        //初值 对初值修改的最大值
        const inits = this.room.getStates(StateEffectType.MaxHand_Initial, [
            this,
        ]);
        let value = inits.length > 0 ? Math.max(...inits) : this.inthp;
        //修正值
        this.room
            .getStates(StateEffectType.MaxHand_Correct, [this])
            .forEach((v) => {
                value += v;
            });
        return Math.max(0, value);
    }

    /** 攻击范围 */
    public get range() {
        //终值状态技 会直接返回手牌上限状态技中对终值修改的最大值
        const fixeds = this.room.getStates(StateEffectType.Range_Fixed, [this]);
        if (fixeds.length > 0) {
            return Math.max(...fixeds);
        }
        //初值 对初值修改的最大值
        const inits = this.room.getStates(StateEffectType.Range_Initial, [
            this,
        ]);
        let value = inits.length > 0 ? Math.max(...inits) : 1;
        //修正值
        this.room
            .getStates(StateEffectType.Range_Correct, [this])
            .forEach((v) => {
                value += v;
            });
        return Math.max(0, value);
    }

    /** 阵营模式 */
    public camp_mode: 'role' | 'kingdom' = 'kingdom';
    /** 武将模式 */
    public general_mode: 'single' | 'dual' = 'dual';

    /** 主将武将ID */
    public _head: GeneralId = '09';
    /** 副将武将ID */
    public _deputy: GeneralId = '09';
    /** 主将武将牌 */
    public get head() {
        return this.room.getGeneral(this._head);
    }
    /** 副将武将牌 */
    public get deputy() {
        return this.room.getGeneral(this._deputy);
    }
    /** 主将是否明置 */
    public headOpen: boolean = false;
    /** 主将是否明置 */
    public deputyOpen: boolean = false;
    /** 是否有未明置的武将牌 */
    public hasNoneOpen() {
        return this.getCloseGenerls().length > 0;
    }
    /** 是否有主将 */
    public hasHead() {
        return this.head && !this.head.name.includes('shibing');
    }
    /** 是否有副将 */
    public hasDeputy() {
        return this.deputy && !this.deputy.name.includes('shibing');
    }
    /** 指定的武将牌是否明置。如果提供的武将牌不是自己的武将牌则返回false */
    public isOpen(general: General | 'head' | 'deputy') {
        if (general === 'head') return this.headOpen;
        if (general === 'deputy') return this.deputyOpen;
        if (this.head === general) return this.headOpen;
        if (this.deputy === general) return this.deputyOpen;
        return false;
    }
    /** 获取所有武将牌 */
    public getGenerls() {
        if (this.hasHead() && this.hasDeputy()) {
            return [this.head, this.deputy];
        } else if (this.hasHead()) {
            return [this.head];
        } else if (this.hasDeputy()) {
            return [this.deputy];
        } else {
            return [];
        }
    }
    /** 获取已明置的所有武将牌 */
    public getOpenGenerls() {
        const generals: General[] = [];
        if (this.hasHead() && this.headOpen) {
            generals.push(this.head);
        }
        if (this.hasDeputy() && this.deputyOpen) {
            generals.push(this.deputy);
        }
        return generals;
    }
    /** 获取暗置的所有武将牌 */
    public getCloseGenerls() {
        const generals: General[] = [];
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
    public getCanOpenGenerals() {
        const generals = this.getCloseGenerls();
        return generals.filter(
            (v) =>
                !this.room
                    .getStates(StateEffectType.Prohibit_Open, [
                        this,
                        [v],
                        'test',
                    ])
                    .some((v) => v)
        );
    }
    /**
     * 获取所有可以暗置的武将牌 @description 已明置，不是士兵或君主，未受状态影响
     */
    public getCanCloseGenerals() {
        const generals = this.getOpenGenerls();
        return generals.filter(
            (v) =>
                !v.isLord() &&
                !v.isShibing() &&
                !this.room
                    .getStates(StateEffectType.Prohibit_Close, [
                        this,
                        [v],
                        'test',
                    ])
                    .some((v) => v)
        );
    }

    /** 判定区里的牌 */
    public judgeCards: VirtualCard[] = [];
    /** 装备区里的牌 */
    public equipCards: GameCard[] = [];
    /** 被废除的装备栏 */
    public disableEquips: EquipSubType[] = [];

    /** 手牌区 */
    public get handArea() {
        return this.room.areas.get(
            `${this.playerId}.${AreaType.Hand.toString()}`
        );
    }
    /** 装备区 */
    public get equipArea() {
        return this.room.areas.get(
            `${this.playerId}.${AreaType.Equip.toString()}`
        );
    }
    /** 判定区 */
    public get judgeArea() {
        return this.room.areas.get(
            `${this.playerId}.${AreaType.Judge.toString()}`
        );
    }
    /** 武将牌上 */
    public get upArea() {
        return this.room.areas.get(
            `${this.playerId}.${AreaType.Up.toString()}`
        );
    }
    /** 武将牌旁 */
    public get sideArea() {
        return this.room.areas.get(
            `${this.playerId}.${AreaType.Side.toString()}`
        );
    }

    /** 不计入座次的计算 */
    public get notSeatCalc() {
        if (
            this.room
                .getStates(StateEffectType.NotCalcSeat, [this])
                .some((v) => v)
        ) {
            return true;
        }
        return this.death;
    }

    /** 不计入距离的计算 */
    public get notDistanceCalc() {
        if (
            this.room
                .getStates(StateEffectType.NotCalcDistance, [this])
                .some((v) => v)
        ) {
            return true;
        }
        return this.death;
    }

    /** 右边的玩家 */
    public get right() {
        const seat = this.seat === this.room.players.length ? 1 : this.seat + 1;
        return this.room.players.find((v) => v.seat === seat);
    }
    /** 左边的玩家 */
    public get left() {
        const seat = this.seat === 1 ? this.room.players.length : this.seat - 1;
        return this.room.players.find((v) => v.seat === seat);
    }
    /** 下家 */
    public get next(): GamePlayer {
        if (this.notSeatCalc) {
            return undefined;
        }
        const players = this.room.sortPlayers(this.room.players, this, true);
        const next = players.find((v) => v !== this && !v.notSeatCalc);
        return next === this ? undefined : next;
    }
    /** 上家 */
    public get prev(): GamePlayer {
        if (this.notSeatCalc) {
            return undefined;
        }
        const players = this.room.sortPlayers(this.room.players, this, true);
        const prev = players.findLast((v) => !v.notSeatCalc);
        return prev === this ? undefined : prev;
    }

    /** 与其他角色的距离 */
    public distanceTo(to: GamePlayer) {
        return this.room.distance(this, to);
    }

    /** 其他角色与你的距离 */
    public distanceFrom(from: GamePlayer) {
        return this.room.distance(from, this);
    }

    /** 攻击范围内是否包含 */
    public rangeOf(to: GamePlayer) {
        if (to === this) return false;
        //视为不在攻击范围内
        if (
            this.room
                .getStates(StateEffectType.Range_Without, [this, to])
                .some((v) => v)
        )
            return false;
        //视为在攻击范围内
        if (
            this.room
                .getStates(StateEffectType.Range_Within, [this, to])
                .some((v) => v)
        )
            return true;
        return this.range >= this.distanceTo(to);
    }

    /** 设置装备牌
     * @description 如果这张牌已经在等待判定，则删除
     */
    public async setEquip(card: GameCard) {
        if (card.type !== CardType.Equip) return;
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
    public async removeEquip(card: GameCard) {
        if (card.type !== CardType.Equip) return;
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
    public getEquip(type: EquipSubType): GameCard {
        return this.equipCards.find(
            (v) => (v.subtype as number) === (type as number)
        );
    }

    /** 设置一张等待判定的判定牌
     * @description 如果这张牌已经在等待判定，则删除
     */
    public setDelayedScroll(card: VirtualCard) {
        if (card.subtype === CardSubType.DelayedScroll) {
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
    public delDelayedScroll(card: VirtualCard) {
        if (card.subtype === CardSubType.DelayedScroll) {
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
    public hasJudgeCard(card: string) {
        return this.judgeCards.find((v) => v.name === card);
    }

    /** 判断一张装备牌是否是该角色的 */
    public hasEquip(card: GameCard) {
        return this.equipArea.cards.includes(card);
    }

    /** 是否与一名角色相邻 */
    public isAdjacent(player: GamePlayer) {
        return this.next === player || this.prev === player;
    }

    /** 是否为野心家 */
    public isYexinjia() {
        return this.kingdom.includes('ye');
    }

    /** 合法的修改体力值
     * @description 这个方法用于直接修改体力值，且不会超过体力上限。该方法一般不会被直接调用，因为他不会触发有关于体力改变事件（如伤害事件，扣减体力事件等）的相关时机。体力值修改时inthp会被一并修改。
     */
    public changeHp(value: number) {
        let newhp = value;
        if (newhp > this.maxhp) newhp = this.maxhp;
        this.setProperty('hp', newhp);
        this.setProperty('inthp', Math.max(0, newhp));
    }

    /** 获取明置后的势力
     * @description 仅获取，不会更改势力
     */
    public getKingdomAfterOpen() {
        //TODO 双势力武将未处理
        let kindom: string = this.kingdom;
        if (this.head && !this.head.isShibing()) {
            kindom = this.head.kingdom;
        } else if (this.deputy && !this.deputy.isShibing()) {
            kindom = this.deputy.kingdom;
        } else {
            kindom = 'none';
        }
        if (this.kingdom !== 'none') {
            kindom = this.kingdom;
        }
        if (kindom === 'none') return 'none';
        if (this.room.getData(`lord_${kindom}`)) {
        } else if (this.room.getData(`lord_${kindom}_die`)) {
            kindom = `ye_${kindom}`;
        } else if (
            this.room.kingdomIsGreaterThenHalf(kindom, this.kingdom !== kindom)
        ) {
            kindom = `ye_${kindom}`;
        }
        return kindom;
    }

    /** 国战模式下赋予玩家势力 */
    public definWarsKindom() {
        let kindom = this.getKingdomAfterOpen();
        if (this.kingdom !== kindom) {
            this.setProperty('kingdom', kindom);
        }
    }

    /** 获取主要武将 */
    public getMainGeneral() {
        if (this.head && !this.head.isShibing()) {
            return this.head;
        } else if (this.deputy && !this.deputy.isShibing()) {
            return this.deputy;
        } else {
            return undefined;
        }
    }

    /** 获取所有手牌 */
    public getHandCards() {
        return sgs.utils.shuffle(this.handArea.cards);
    }

    /** 获取所有装备区里的牌 */
    public getEquipCards() {
        return this.equipArea.cards;
    }

    /** 获取所有判定区里的牌 */
    public getJudgeCards() {
        return this.judgeArea.cards;
    }

    /** 获取所有角色的牌 */
    public getSelfCards() {
        return [...this.getHandCards(), ...this.getEquipCards()];
    }

    /** 获取角色区域里的所有 */
    public getAreaCards() {
        return [
            ...this.getHandCards(),
            ...this.getEquipCards(),
            ...this.getJudgeCards(),
        ];
    }

    /** 获取角色的区域里的所有牌，按照区域划分 */
    getCardsToArea(pos: string = 'he') {
        const cards: { title: CustomString; cards: GameCard[] }[] = [];
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
            this.getEquip(EquipSubType.SpecialMount),
            this.getEquip(EquipSubType.DefensiveMount),
            this.getEquip(EquipSubType.OffensiveMount),
        ].filter((v) => v);
    }

    /** 是否有手牌 */
    public hasHandCards() {
        return this.handArea.count > 0;
    }

    /** 从武将牌上或武将牌旁获取有指定mark的牌 */
    public getUpOrSideCards(markKey?: string) {
        return [...this.upArea.cards, ...this.sideArea.cards].filter((v) =>
            markKey ? v.hasMark(markKey) : true
        );
    }

    /** 检测武将牌上或武将牌旁获取有指定mark的牌 */
    public hasUpOrSideCards(markKey?: string) {
        return !![...this.upArea.cards, ...this.sideArea.cards].find((v) =>
            markKey ? v.hasMark(markKey) : true
        );
    }

    /**
     * 区域里是否有牌
     * @param includeJudge 是否包含判定区
     * @returns
     */
    public hasCardsInArea(includeJudge: boolean = false) {
        return (
            this.handArea.count > 0 ||
            this.equipArea.count > 0 ||
            (includeJudge ? this.judgeArea.count > 0 : false)
        );
    }

    /** 能弃置的牌的数量是否大于指定数值 */
    public hasCanDropCards(
        pos: string,
        player: GamePlayer,
        number: number = 1,
        reason?: string
    ) {
        const cards: GameCard[] = [];
        if (pos.includes('h')) cards.push(...this.getHandCards());
        if (pos.includes('e')) cards.push(...this.getEquipCards());
        return (
            cards.filter((v) => player.canDropCard(v, reason)).length >= number
        );
    }

    /** 获取一张牌的使用动画和语音 */
    public getCardUseAniAndAudio(card: SourceData) {
        let ani_name = card.name;
        let audio_url = card.name;
        if (card.name === 'sha') {
            ani_name = card.color === CardColor.Red ? 'hongsha' : 'heisha';
            if (card.attr.includes(CardAttr.Thunder)) {
                ani_name = 'leisha';
                audio_url = 'sha_thunder';
            }
            if (card.attr.includes(CardAttr.Fire)) {
                ani_name = 'huosha';
                audio_url = 'sha_fire';
            }
        }
        //audio
        if (sgs.utils.getCardType(card.name) === CardType.Equip) {
            let audio = 'weapon',
                subtype = sgs.utils.getCardSubtype(card.name);
            if (subtype === CardSubType.Weapon) {
                audio = 'weapon';
            }
            if (
                subtype === CardSubType.Armor ||
                subtype === CardSubType.Treasure
            ) {
                audio = 'armor';
            }
            if (
                subtype === CardSubType.DefensiveMount ||
                subtype === CardSubType.OffensiveMount ||
                subtype === CardSubType.SpecialMount
            ) {
                audio = 'horse';
            }
            audio_url = `./audio/equip/${audio}.mp3`;
        } else {
            audio_url = `./audio/card/${
                this.gender === Gender.Male ? 'male' : 'female'
            }/${audio_url}.mp3`;
        }
        return {
            ani_name,
            audio_url,
        };
    }

    /** 检测是否能打出某牌 */
    public canPlayCard(card: VirtualCard | string, reason?: string) {
        let _card: VirtualCard;
        if (typeof card === 'string') {
            _card = this.room.createVirtualCardByNone(card, undefined, false);
        } else {
            _card = card;
        }
        //会导致一名角色不能打出牌的原因为其受到技能的效果的影响。
        return !this.room
            .getStates(StateEffectType.Prohibit_PlayCard, [this, _card, reason])
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
    public canUseCard(
        card: VirtualCard | { name: string; method?: number },
        targets?: GamePlayer[] | VirtualCard,
        reason?: string,
        targetSelector?: Partial<ChoosePlayerData>,
        selecteds: GamePlayer[] = []
    ) {
        let _card: VirtualCard;
        if (!(card instanceof VirtualCard)) {
            const name = card.name;
            const method = card.method ?? 1;
            _card = this.room.createVirtualCardByNone(name, undefined, false);
            _card.custom.method = method;
        } else {
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
        if (
            this.room
                .getStates(StateEffectType.Prohibit_UseCard, [
                    this,
                    _card,
                    undefined,
                    reason,
                ])
                .some((v) => v)
        )
            return false;
        const use_skill = this.room.getCardUse(
            _card.name,
            _card.custom.method ?? 1
        );
        if (!use_skill) return false;
        // 2、其使用过与此牌牌名相同的牌的次数不小于其使用与此牌牌名相同的牌的次数上限。
        if (!skipTimes) {
            const pass = this.room
                .getStates(StateEffectType.TargetMod_PassTimeCheck, [
                    this,
                    _card,
                    undefined,
                ])
                .some((v) => v);
            if (!pass) {
                let times = 0;
                times = use_skill.timeCondition.call(
                    use_skill,
                    this.room,
                    this,
                    _card
                );
                this.room
                    .getStates(StateEffectType.TargetMod_CorrectTime, [
                        this,
                        _card,
                        undefined,
                    ])
                    .forEach((v) => (times += v));
                const uses = this.getMark<number>(`__${card.name}_times`) ?? 0;
                if (uses >= times) return false;
            }
        }
        //3、此牌的合法目标数小于额定目标数下限或等于0。
        //目标为角色
        if (use_skill.target) {
            const selector = use_skill.target.call(
                use_skill,
                this.room,
                this,
                _card
            );
            const checks =
                targets && Array.isArray(targets)
                    ? targets
                    : selector.excluesDeath ?? true
                    ? this.room.playerAlives
                    : this.room.players;
            const legels: GamePlayer[] = checks.slice().filter((target) => {
                //状态技检测
                const state_check = this.room
                    .getStates(StateEffectType.Prohibit_UseCard, [
                        this,
                        _card,
                        target,
                        reason,
                    ])
                    .some((v) => v);
                if (state_check) return false;
                const limit =
                    !targetSelector ||
                    !(targetSelector.excluesCardLimit ?? false);
                //牌本身的目标检测
                const card_check =
                    selector.filter?.call(undefined, target, selecteds) ?? true;
                if (limit && !card_check) return false;
                //次数检测
                if (!skipTimes) {
                    const pass = this.room
                        .getStates(StateEffectType.TargetMod_PassTimeCheck, [
                            this,
                            _card,
                            target,
                        ])
                        .some((v) => v);
                    if (!pass) {
                        let times = 0;
                        times = use_skill.timeCondition.call(
                            use_skill,
                            this.room,
                            this,
                            _card
                        );
                        this.room
                            .getStates(StateEffectType.TargetMod_CorrectTime, [
                                this,
                                _card,
                                target,
                            ])
                            .forEach((v) => (times += v));
                        const uses =
                            this.getMark<number>(`__${card.name}_times`) ?? 0;
                        if (uses >= times) return false;
                    }
                }
                //距离检测
                if (!skipDistances) {
                    const pass = this.room
                        .getStates(
                            StateEffectType.TargetMod_PassDistanceCheck,
                            [this, _card, target]
                        )
                        .some((v) => v);
                    if (!pass) {
                        const check = use_skill.distanceCondition.call(
                            use_skill,
                            this.room,
                            this,
                            target,
                            _card
                        );
                        if (!check) return false;
                    }
                }
                //额外限制
                if (targetSelector) {
                    const extra_check =
                        targetSelector.filter?.call(undefined, target, []) ??
                        true;
                    if (!extra_check) return false;
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
            .getStates(StateEffectType.Prohibit_UseCard, [
                this,
                _card,
                Array.isArray(targets) ? undefined : targets,
                reason,
            ])
            .some((v) => v);
        return !check_tocard;
    }

    /** 角色能否弃置某张牌 */
    public canDropCard(card: GameCard, reason?: string) {
        return !this.room
            .getStates(StateEffectType.Prohibit_DropCards, [this, card, reason])
            .some((v) => v);
    }

    /** 角色能否发起拼点 */
    public canPindian(targets: GamePlayer[], reason?: string) {
        if (!this.hasHandCards()) return false;
        if (targets.some((v) => !v.hasHandCards())) return false;
        return !this.room
            .getStates(StateEffectType.Prohibit_Pindian, [
                this,
                targets,
                reason,
            ])
            .some((v) => v);
    }

    /** 是否拥有技能 */
    public hasSkill(skill: Skill | number) {
        return typeof skill === 'number'
            ? this.room.skills.find((v) => v.id === skill)?.player === this
            : skill.player === this;
    }

    /** 是否未确定势力 */
    public isNoneKingdom() {
        return this.kingdom === 'none';
    }

    /** 区域是否属于自己的牌的区域 */
    isOnwerCardArea(area: Area) {
        return (
            (area.type === AreaType.Hand || area.type === AreaType.Equip) &&
            area.player === this
        );
    }

    /** 刷新脸上的标记 */
    public set refreshMark(value: string) {
        this.room.propertyChanges.push([
            'player',
            this.playerId,
            'refreshMark',
            value,
        ]);
    }
}

export interface GamePlayer extends Custom {}
