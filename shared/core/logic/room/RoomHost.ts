import { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { Skill } from '../../entity/Skill';
import type { General } from '../../entity/General';
import type { Effect } from '../../entity/Effect';
import { GameCard } from '../../entity/GameCard';
import type { VirtualCard } from '../../entity/VirtualCard';
import type { VirtualCardOverrides } from '../../entity/VirtualCard';
import type { VirtualCardData, EquipSubType } from '../../types/CardTypes';
import type { GameModeData } from '../../types/ModeTypes';
import { VirtualCardHost } from './VirtualCardHost';
import type { VirtualCardAbility } from './VirtualCardHost';
import { EventManager } from '../event/EventManager';
import type { EventProcess } from '../event/EventProcess';
import { TurnEvent } from '../event/TurnEvent';
import type { PhaseEvent } from '../event/TurnEvent';
import type { MoveCardEvent } from '../event/MoveCardEvent';
import { UseCardEvent } from '../event/UseCardEvent';
import { DropCardEvent } from '../event/DropCardEvent';
import type { DamageEvent, LoseHpEvent, ReduceHpEvent } from '../event/DamageEvent';
import type { DyingEvent, DeathEvent } from '../event/DyingEvent';
import type { RecoverHpEvent, ChangeMaxHpEvent } from '../event/HpEvent';
import type { JudgeEvent } from '../event/JudgeEvent';
import type { ChangeStateEvent } from '../event/ChangeStateEvent';
import type { PindianEvent } from '../event/PindianEvent';
import type { AreaId } from '../../types/AreaTypes';
import { AreaType } from '../../types/AreaTypes';
import { parseAreaId } from '../../utils/AreaUtils';
import { DamageType, TimingName } from '../../types/EventTypes';
import type { EventType, MoveCardData, MoveCardOpts } from '../../types/EventTypes';
import type { CardUseData } from '../../types/EventTypes';
import type { DamageEventData, LoseHpEventData, ReduceHpEventData, RecoverHpEventData, ChangeMaxHpEventData, DyingEventData, DeathEventData, JudgeEventData, PindianEventData, ChangeStateData, EventOpts } from '../../types/EventTypes';
import type { RichString } from '../../types/RichText';
import { sgs } from '../../sgs';
import { shuffle } from '../../utils/Random';

/**
 * 房间主机——权威端房间业务逻辑聚合（仅权威端运行时存在）。
 * 能力经 mixin 组合注入：vcard（虚拟牌）+ event（事件系统：管理器 + 事件栈 + 历史 + 移动族）。
 */
export class RoomHost implements VirtualCardAbility {
    /** vCard 能力（mixin 注入） */
    readonly vcard: VirtualCardHost;
    /** 事件管理器（触发调度/事件创建/refreshs） */
    readonly event: EventManager;
    /** 当前事件栈（执行中的事件链，不含 Turn/Phase） */
    readonly eventStack: EventProcess[] = [];
    /** 回合栈 */
    readonly turnStack: TurnEvent[] = [];
    /** 阶段栈 */
    readonly phaseStack: PhaseEvent[] = [];
    /** 延迟明置队列（事件栈排空后按序触发 Open 时机） */
    readonly deferredOpens: EventProcess<EventType.Open>[] = [];
    /** 复活回调队列（伤害/失去体力结束后排空） */
    readonly fuhuos: Array<() => Promise<void>> = [];
    /** 事件历史（insertHistory/getLastOneHistory） */
    private readonly _history: EventProcess[] = [];

    /** 游戏模式（startGame 时从 sgs.modes 获取） */
    mode?: GameModeData;

    /** 当前回合（栈顶） */
    get currentTurn(): TurnEvent | undefined {
        return this.turnStack[this.turnStack.length - 1];
    }

    /** 当前阶段（栈顶） */
    get currentPhase(): PhaseEvent | undefined {
        return this.phaseStack[this.phaseStack.length - 1];
    }

    constructor(readonly room: Room) {
        this.vcard = new VirtualCardHost(room);
        this.event = new EventManager(room);
    }

    // ===== 事件快捷方法（薄转发 event） =====

    /**
     * 造成伤害
     * @rules terms/description-terms/damage
     * @description 造成伤害是令目标角色扣减体力的操作；若来源已死亡或未指定来源，则目标受到无来源的伤害
     * @param player 伤害来源（无来源伤害传 undefined）
     * @param target 受伤角色
     * @param number 伤害点数
     * @param damageType 伤害类型
     * @param opts 附加选项（渠道/连环/事件元数据/自由扩展字段）
     * @returns 伤害事件
     */
    damage(
        player: Player | undefined,
        target: Player,
        number: number,
        damageType: DamageType,
        opts?: EventOpts & Partial<Omit<DamageEventData, 'player' | 'target' | 'number' | 'damageType'>>,
    ): Promise<DamageEvent> {
        return this.event.damage({ player, target, number, damageType, ...opts });
    }

    /** 失去体力 */
    loseHp(player: Player, number: number, opts?: EventOpts): Promise<LoseHpEvent> {
        return this.event.loseHp({ player, number, ...opts });
    }

    /**
     * 扣减体力
     * @rules terms/description-terms/reduce_hp
     * @description 扣减体力是角色的体力被扣除的操作，失去体力和受到伤害均会导致扣减体力
     * @param player 扣减体力的角色
     * @param number 扣减点数
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 扣减体力事件
     */
    reduceHp(player: Player, number: number, opts?: EventOpts): Promise<ReduceHpEvent> {
        return this.event.reduceHp({ player, number, ...opts });
    }

    /**
     * 回复体力
     * @rules terms/description-terms/recover
     * @description 回复体力是角色回复X点体力的操作，回复量不会超过已损失体力
     * @param player 回复体力的角色
     * @param number 回复点数
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 回复体力事件
     */
    recover(player: Player, number: number, opts?: EventOpts): Promise<RecoverHpEvent> {
        return this.event.recover({ player, number, ...opts });
    }

    /**
     * 将体力回复至X点
     * @rules terms/description-terms/recover_to
     * @description 将体力回复至X点是回复(min{X,体力上限}-体力)点体力的操作；体力不小于X或已达体力上限时不能执行
     * @param player 回复体力的角色
     * @param toHp 回复至的体力值 X
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 回复体力事件（不能执行时为 undefined）
     */
    async recoverTo(player: Player, toHp: number, opts?: EventOpts): Promise<RecoverHpEvent | undefined> {
        const hp = player.hp;
        const maxhp = player.maxhp;
        if (hp >= maxhp || hp >= toHp) return undefined;
        const number = Math.min(toHp, maxhp) - hp;
        return this.recover(player, number, opts);
    }

    /** 改变体力上限 */
    changeMaxHp(player: Player, number: number, opts?: EventOpts): Promise<ChangeMaxHpEvent> {
        return this.event.changeMaxHp({ player, number, ...opts });
    }

    /** 进入濒死 */
    dying(player: Player, opts?: EventOpts): Promise<DyingEvent> {
        return this.event.dying({ player, ...opts });
    }

    /** 死亡 */
    die(player: Player, opts?: EventOpts & Partial<Omit<DeathEventData, 'player'>>): Promise<DeathEvent> {
        return this.event.die({ player, ...opts });
    }

    /**
     * 判定：触发一个判定事件
     * @rules terms/card-op-terms/judge
     * @description 判定是「触发一个判定事件」的操作，创建判定事件进入事件栈
     * @param player 判定角色
     * @param opts 判定事件数据（自由扩展字段）
     * @returns 判定事件
     */
    judge(player: Player, opts?: EventOpts & Partial<Omit<JudgeEventData, 'player'>>): Promise<JudgeEvent> {
        return this.event.judge({ player, ...opts });
    }

    /**
     * 拼点：触发一个拼点事件
     * @rules terms/card-op-terms/pindian
     * @description 拼点是「触发一个拼点事件」的操作，创建拼点事件进入事件栈
     * @param player 拼点发起者
     * @param targets 拼点目标
     * @param opts 拼点事件数据（自由扩展字段）
     * @returns 拼点事件
     */
    pindian(
        player: Player,
        targets: Player[],
        opts?: EventOpts & Partial<Omit<PindianEventData, 'player' | 'targets'>>,
    ): Promise<PindianEvent> {
        const { cards, reqOptions, ...rest } = opts ?? {};
        return this.event.pindian({
            player,
            targets,
            cards: cards ?? new Map(),
            reqOptions: reqOptions ?? {},
            ...rest,
        });
    }

    /** 状态改变（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） */
    changeState(opts: ChangeStateData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<ChangeStateEvent> {
        return this.event.changeState(opts);
    }

    // ===== 游戏流程 =====

    /**
     * 开始游戏：获取模式 → beforeStart → 主流程
     * @rules terms/game-flow-terms/turn
     * @description 开始游戏是「获取游戏模式并执行主流程」的操作
     */
    async startGame(): Promise<void> {
        this.room.logger.info('startGame', { roomId: this.room.roomId, event: 'startGame' });
        const mode = this.room.options.mode ? sgs.modes.get(this.room.options.mode) : undefined;
        if (!mode) {
            await this.room.gameOver();
            return;
        }
        this.mode = mode;
        this.room.setGameState('gaming');
        // 初始化军令牌堆（1~6）与妙计牌堆（80~91）
        this.room.commands.clear();
        for (let i = 1; i <= 6; i++) this.room.commands.push(i);
        this.room.miaojis.clear();
        for (let i = 80; i <= 91; i++) this.room.miaojis.push(i);
        if (mode.beforeStart) {
            await mode.beforeStart(this.room);
        }
        await this.mainProcess();
    }

    /**
     * 游戏主流程：按额定回合与额外回合交替创建并执行回合事件
     * @rules terms/game-flow-terms/turn
     * @description 游戏主流程，额定回合由模式主流程或默认下家顺序确定，额外回合优先执行；重新轮到首座位时轮数 +1
     */
    async mainProcess(): Promise<void> {
        let last: TurnEvent | undefined;
        const MAX_ROUNDS = 302;
        while (this.room.isGaming) {
            if (this.room.roundCount >= MAX_ROUNDS) {
                await this.room.gameOver();
                break;
            }
            const survivors = [...this.room.players.values()].filter((p) => p.alive || p.rest > 0);
            if (survivors.length <= 1) {
                await this.room.gameOver(survivors);
                break;
            }
            let turn: TurnEvent;
            if (this.room.extraTurns.length > 0) {
                turn = this.room.extraTurns.shift()!;
            } else {
                this.room.turnCount++;
                turn = new TurnEvent(this.room, {
                    turnId: this.room.turnCount,
                    player: undefined!,
                    isExtraTurn: false,
                    isSkipped: false,
                    phases: Room.getRatedPhases().map((p) => ({ phase: p, isExtraPhase: false })),
                    skippedPhases: [],
                    isRoundStart: false,
                    isRoundEnd: false,
                });
                if (this.mode?.mainProcess) {
                    await this.mode.mainProcess(this.room, turn, last);
                } else {
                    turn.player = this._getNextPlayer(last);
                    turn.isRoundStart = !last || turn.player.seat <= (last.player?.seat ?? 0);
                }
            }
            if (turn.isRoundStart) {
                if (last) {
                    last.isRoundEnd = true;
                    await this.room.event.trigger(TimingName.RoundEnd, { round: this.room.roundCount, turn: last });
                }
                this.room.roundCount++;
                this.room.roundStartTurn = turn;
                await this.room.event.trigger(TimingName.RoundStart, { round: this.room.roundCount, turn });
            }
            this.room.currentPlayerId = turn.player.playerId;
            try {
                await turn.exec();
            } catch (e) {
                this.room.logger.error(
                    `turn error id=${turn.id}: ${(e as Error).message}`,
                    { roomId: this.room.roomId, event: 'mainProcess' },
                );
            }
            last = turn;
        }
    }

    /** 确定下一名执行回合的玩家（跳过死亡；休整玩家由回合事件处理） */
    private _getNextPlayer(last: TurnEvent | undefined): Player {
        if (!last) {
            const first = [...this.room.players.values()].find((p) => p.seat === 1 && p.alive);
            if (first) return first;
            return this.room.alives[0];
        }
        let next = last.player.right;
        let safety = 0;
        while (next && next.death && next.rest <= 0 && safety < this.room.players.size) {
            next = next.right;
            safety++;
        }
        return next ?? last.player;
    }

    // ===== 依次/各执行操作 =====

    /**
     * 依次操作：重复执行操作 X 次
     * @rules terms/description-terms/repeat
     * @description 依次操作是操作一次后重复（X-1）次此流程
     * @param times 重复次数 X
     * @param fn 每次执行的操作
     */
    async repeat(times: number, fn: () => Promise<unknown>): Promise<void> {
        for (let i = 0; i < times; i++) {
            await fn();
        }
    }

    /**
     * 各执行操作：玩家数组按响应顺序依次执行操作
     * @rules terms/description-terms/for_each
     * @description 各执行操作是先选择所有符合条件的角色，然后这些角色依次执行此操作
     * @param players 参与执行的角色数组
     * @param fn 每个角色执行的操作（参数为当前执行角色）
     * @param clockwise 是否按顺时针排序（默认 false 逆时针）
     */
    async forEachPlayer(
        players: Player[],
        fn: (player: Player) => Promise<unknown>,
        clockwise: boolean = false,
    ): Promise<void> {
        const sorted = clockwise ? this.room.sortClockwise(players) : this.room.sortResponse(players);
        for (const player of sorted) {
            await fn(player);
        }
    }

    // ===== 失去技能 =====

    /**
     * 失去所有武将技能：移除该玩家所有非规则、非装备来源的技能
     * @rules terms/description-terms/shiqujineng
     * @description 失去所有武将技能即移除该角色除规则技能与装备技能外的所有技能
     * @param player 失去技能的角色
     */
    async loseGeneralSkills(player: Player): Promise<void> {
        for (const skill of [...this.room.skills.values()]) {
            if (skill.player !== player) continue;
            if (skill.sourceData.is_rule || skill.sourceData.attached_equip) continue;
            await skill.removeSelf();
        }
    }

    /**
     * 失去所有技能：移除该玩家所有技能
     * @rules terms/description-terms/shiqujineng
     * @description 失去所有技能即移除该角色拥有的全部技能（含规则技能与装备技能）
     * @param player 失去技能的角色
     */
    async loseAllSkills(player: Player): Promise<void> {
        for (const skill of [...this.room.skills.values()]) {
            if (skill.player !== player) continue;
            await skill.removeSelf();
        }
    }

    /**
     * 失去所有武将牌上的技能：移除该玩家指定武将牌来源的所有技能
     * @rules terms/description-terms/shiqujineng
     * @description 失去所有武将牌上的技能即移除该角色由指定武将牌获得的全部技能
     * @param player 失去技能的角色
     * @param general 来源武将牌
     */
    async loseSkillsOfGeneral(player: Player, general: General): Promise<void> {
        for (const skill of [...this.room.skills.values()]) {
            if (skill.player !== player) continue;
            if (skill.sourceGeneral !== general) continue;
            await skill.removeSelf();
        }
    }

    // ===== 选择 =====

    /**
     * 选择：从多个选项中任选其一执行
     * @rules terms/description-terms/choose
     * @description 选择是拥有选择权的角色从多个选项中选择其中任意一项执行；选项可标记不可选，全部选项均不可选时直接返回 false
     * @param player 拥有选择权的角色
     * @param options 询问选项（提示/能否取消等）
     * @param handles 选项列表或选项键映射（值含是否可选与执行回调）
     * @returns 选中的选项（键名或文本），取消/无可选时返回 false
     */
    async choose(
        player: Player,
        options: {
            canCancle?: boolean;
            prompt?: RichString;
            thinkPrompt?: RichString;
            toast?: boolean;
        },
        handles:
            | RichString[]
            | {
                  [key: string]: {
                      chooseable?: boolean;
                      handle?: () => Promise<void>;
                  };
              },
    ): Promise<false | string> {
        // 构建选项数组：对象形式展开为选项文本，不可选前缀 ! 标记
        const handles_arr: RichString[] = [];
        if (Array.isArray(handles)) {
            handles_arr.push(...handles);
        } else {
            for (const [key, h] of Object.entries(handles)) {
                handles_arr.push(h?.chooseable === false ? `!${key}` : key);
            }
        }
        // 全部选项均不可选（含不可执行的消耗选项）时不能选择任何一项，直接返回 false
        if (
            handles_arr.every((v) =>
                typeof v === 'string' ? v.startsWith('!') : v.text.startsWith('!'),
            )
        ) {
            return false;
        }
        // TODO(R11): 构建选项类选择会话并发送，等待 player 选择结果；若选择可取消返回 false，否则返回选中选项并执行对应 handle
        return false;
    }

    // ===== 军令 =====

    /**
     * 军令：发起者确定军令，执行者选择是否执行并结算
     * @rules terms/description-terms/junling
     * @description 军令是角色 A 从两项随机操作中选择一项作为军令，令角色 B 选择是否执行；执行完毕将军令放回军令牌堆
     * @param from 发起者（A）
     * @param to 执行者（B）
     * @param command 指定的军令（不传则随机抽取两张由 A 二选一）
     */
    async command(from: Player, to: Player, command?: number): Promise<void> {
        // ① 未提供军令：随机抽取两张，发起者二选一确定军令
        if (!command) {
            const selectable = this.getCommands(2);
            if (selectable.length === 0) return;
            // TODO(R11): 选择会话发送未实现——令 from 从 selectable 中二选一
            command = selectable[0];
            // 未选择的军令放回军令牌堆
            for (const c of selectable) {
                if (c !== command) this.returnCommand(c);
            }
        }
        // ② 执行者选择是否执行
        // TODO(R11): 选择会话发送未实现——令 to 选择是否执行军令
        let yes = true;
        // ③ 根据军令执行对应分支
        if (yes) {
            await this._executeCommand(from, to, command);
        }
        // 执行完毕，将军令放回军令牌堆
        this.returnCommand(command);
    }

    /** 军令分支结算（军令 1~6） */
    private async _executeCommand(from: Player, to: Player, command: number): Promise<void> {
        if (command === 1) {
            // 对 from 选择的除 to 外的一名角色造成 1 点普通伤害
            // TODO(R11): 选择会话发送未实现——令 from 选择一名除 to 外的角色
            const target: Player | undefined = undefined;
            if (target) await to.damage(target, 1, DamageType.None, { reason: 'junling' });
        } else if (command === 2) {
            // 摸一张牌，交给 from 两张牌
            await to.draw(1);
            // TODO(R11): 选择会话发送未实现——令 to 选择两张牌交给 from
            const cards: GameCard[] = [];
            if (cards.length > 0) await to.give(from, cards, { reason: 'junling' });
        } else if (command === 3) {
            // 失去 1 点体力
            await to.loseHp(1, { reason: 'junling' });
        } else if (command === 4) {
            // 当前回合内不能使用/打出手牌，非锁定技失效（状态效果）
            // TODO(R10): 状态效果未实现（禁止使用/打出手牌 + 非锁定技失效）
        } else if (command === 5) {
            // 叠置，当前回合内不能回复体力（状态效果）
            await to.stack(true);
            // TODO(R10): 状态效果未实现（当前回合内不能回复体力）
        } else if (command === 6) {
            // 选择一张手牌和一张装备牌保留，弃置其余
            // TODO(R11): 选择会话发送未实现——令 to 选择保留一张手牌和一张装备牌
            const keep: GameCard[] = [];
            const drop = to.getSelfCards().filter((c) => !keep.includes(c));
            if (drop.length > 0) await to.discard(drop, { reason: 'junling' });
        }
    }

    /**
     * 随机获取军令：从军令牌堆随机获取不重复的军令并移除
     * @param count 获取数量（默认 2）
     * @returns 获取的军令数组
     */
    getCommands(count: number = 2): number[] {
        const all = this.room.commands.toArray();
        if (count > all.length) count = all.length;
        shuffle(all, this.room.randomSeed);
        const got = all.slice(0, count);
        for (const c of got) {
            const idx = this.room.commands.toArray().indexOf(c);
            if (idx !== -1) this.room.commands.remove(idx);
        }
        return got;
    }

    /** 将军令放回军令牌堆（含去重） */
    returnCommand(command: number): void {
        if (this.room.commands.toArray().includes(command)) return;
        this.room.commands.push(command);
    }

    // ===== 献策 =====

    /**
     * 献策：发起者给执行者献计，执行者选择是否执行并结算
     * @description 献策分为两步：将妙计加入执行者的持有妙计牌堆；执行者选择是否执行，执行完毕将妙计放回妙计牌堆
     * @param from 发起者
     * @param to 执行者
     * @param miaoji 指定的妙计（不传则随机抽取一张）
     */
    async xiance(from: Player, to: Player, miaoji?: number): Promise<void> {
        // ① 未提供妙计：随机抽取一张，加入执行者的持有妙计牌堆
        if (!miaoji) {
            const got = this.getMiaoji(1);
            if (got.length === 0) return;
            miaoji = got[0];
        }
        if (!to.miaojis.toArray().includes(miaoji)) {
            to.miaojis.push(miaoji);
        }
        // ② 执行者选择是否执行
        // TODO(R11): 选择会话发送未实现——令 to 选择是否执行妙计
        let yes = true;
        // ③ 根据妙计执行对应分支
        if (yes) {
            await this._executeMiaoji(from, to, miaoji);
        }
        // 执行完毕，将妙计放回妙计牌堆
        this.returnMiaoji(miaoji);
    }

    /** 妙计分支结算（妙计 80~91） */
    private async _executeMiaoji(from: Player, to: Player, miaoji: number): Promise<void> {
        if (miaoji === 80) {
            // 对 from 选择的一名角色造成 1 点伤害
            // TODO(R11): 选择会话发送未实现——令 from 选择一名角色
            const target: Player | undefined = undefined;
            if (target) await to.damage(target, 1, DamageType.None, { reason: 'miaoji' });
        } else if (miaoji === 81) {
            // 摸一张牌，交给 from 两张牌
            await to.draw(1);
            // TODO(R11): 选择会话发送未实现——令 to 选择两张牌交给 from
            const cards: GameCard[] = [];
            if (cards.length > 0) await to.give(from, cards, { reason: 'miaoji' });
        } else if (miaoji === 82) {
            // 失去 1 点体力
            await to.loseHp(1, { reason: 'miaoji' });
        } else if (miaoji === 83) {
            // 不能使用/打出手牌；受到属性伤害 +1（状态效果）
            // TODO(R10): 状态效果未实现（禁止使用/打出手牌 + 受到属性伤害 +1）
        } else if (miaoji === 84) {
            // 非锁定技失效；回复体力时弃置两张牌（状态效果）
            // TODO(R10): 状态效果未实现（非锁定技失效 + 回复体力时弃置两张牌）
        } else if (miaoji === 85) {
            // 弃置一张牌并横置；若已横置则改为弃置两张
            // TODO(R11): 选择会话发送未实现——令 to 选择弃置的牌
            const count = to.chained ? 2 : 1;
            const cards: GameCard[] = [];
            if (cards.length > 0) await to.discard(cards, { reason: 'miaoji' });
            if (!to.chained) await to.chain();
        } else if (miaoji === 86) {
            // 保留一张手牌和一张装备牌，弃置其余
            // TODO(R11): 选择会话发送未实现——令 to 选择保留一张手牌和一张装备牌
            const keep: GameCard[] = [];
            const drop = to.getSelfCards().filter((c) => !keep.includes(c));
            if (drop.length > 0) await to.discard(drop, { reason: 'miaoji' });
        } else if (miaoji === 87) {
            // 弃置一张锦囊牌或两张牌
            // TODO(R11): 选择会话发送未实现——令 to 选择弃置的牌
            const cards: GameCard[] = [];
            if (cards.length > 0) await to.discard(cards, { reason: 'miaoji' });
        } else if (miaoji === 88) {
            // 受到 from 造成的 1 点伤害
            await to.bedamage(from, 1, DamageType.None, { reason: 'miaoji' });
        } else if (miaoji === 89) {
            // 展示手牌；弃置一张牌
            await to.showCards(to.getHandCards());
            // TODO(R11): 选择会话发送未实现——令 from 选择弃置 to 的一张手牌
            const cards: GameCard[] = [];
            if (cards.length > 0) await to.discard(cards, { reason: 'miaoji' });
        } else if (miaoji === 90) {
            // 重铸所有手牌；弃置一张手牌
            const hands = to.getHandCards();
            if (hands.length > 0) await to.recast(hands);
            // TODO(R11): 选择会话发送未实现——令 to 弃置一张手牌
            const cards: GameCard[] = [];
            if (cards.length > 0) await to.discard(cards, { reason: 'miaoji' });
        } else if (miaoji === 91) {
            // 收回装备牌；弃置一张牌
            const equips = to.getEquipCards();
            if (equips.length > 0) await to.obtain(equips, { reason: 'miaoji' });
            // TODO(R11): 选择会话发送未实现——令 to 弃置一张牌
            const cards: GameCard[] = [];
            if (cards.length > 0) await to.discard(cards, { reason: 'miaoji' });
        }
    }

    /**
     * 随机获取妙计：从妙计牌堆随机获取不重复的妙计并移除
     * @param count 获取数量（默认 1）
     * @returns 获取的妙计数组
     */
    getMiaoji(count: number = 1): number[] {
        const all = this.room.miaojis.toArray();
        if (count > all.length) count = all.length;
        shuffle(all, this.room.randomSeed);
        const got = all.slice(0, count);
        for (const m of got) {
            const idx = this.room.miaojis.toArray().indexOf(m);
            if (idx !== -1) this.room.miaojis.remove(idx);
        }
        return got;
    }

    /** 将妙计放回妙计牌堆（含去重） */
    returnMiaoji(miaoji: number): void {
        if (this.room.miaojis.toArray().includes(miaoji)) return;
        this.room.miaojis.push(miaoji);
    }

    // ===== 阵法召唤 =====

    /**
     * 阵法召唤
     * @rules terms/description-terms/arraycall
     * @description 阵法召唤是满足五个条件的角色发动的获得同伴明置响应的操作，依据阵法技类型（队列/围攻）执行对应流程
     * @param player 发动阵法召唤的角色
     * @param type 阵法技类型（'queue' 队列 / 'siege' 围攻）
     */
    async arraycall(player: Player, type: 'queue' | 'siege'): Promise<void> {
        if (!this._canArrayCall(player, type)) return;
        if (type === 'queue') {
            await this._arraycallQueue(player);
        } else {
            await this._arraycallSiege(player);
        }
    }

    /** 阵法召唤前置条件（1-5） */
    private _canArrayCall(player: Player, type: 'queue' | 'siege'): boolean {
        // 1. 有势力且不为野心家
        if (!player.kingdom || player.kingdom === 'wild') return false;
        // 2. 有明置武将牌且此武将牌有阵法技
        // TODO(R10): 待 Player 主/副将字段与明置状态实现后补充
        // 3. 除 A 外存在没有势力的角色
        if (!this.room.alives.some((p) => p !== player && !p.kingdom)) return false;
        // 4. 与 A 势力相同的所有角色数小于玩家数的一半
        if (this.room.getKingdomCount(player.kingdom) >= this.room.alives.length / 2) return false;
        // 5. 阵法技发动条件（队列/围攻不同）
        return type === 'siege' ? this._siegeCondition5(player) : this._queueCondition5(player);
    }

    /** 围攻条件5：A 的上家的上家或下家的下家无势力，且中间角色与 A 势力不同 */
    private _siegeCondition5(player: Player): boolean {
        const upUp = player.prev?.prev;
        const downDown = player.next?.next;
        return (
            (!!player.prev && !!upUp && player.prev.kingdom !== player.kingdom && !upUp.kingdom) ||
            (!!player.next && !!downDown && player.next.kingdom !== player.kingdom && !downDown.kingdom)
        );
    }

    /** 队列条件5：A 按顺时针或逆时针路径至无势力角色，路径上无与 A 势力不同的角色 */
    private _queueCondition5(player: Player): boolean {
        return (
            this._findQueueTarget(player, 'anticlockwise') !== undefined ||
            this._findQueueTarget(player, 'clockwise') !== undefined
        );
    }

    /** 沿方向查找路径上第一个无势力角色（路径上出现不同势力角色即失败） */
    private _findQueueTarget(player: Player, direction: 'clockwise' | 'anticlockwise'): Player | undefined {
        let p = direction === 'clockwise' ? player.left : player.right;
        while (p !== player) {
            if (p.death) {
                p = direction === 'clockwise' ? p.left : p.right;
                continue;
            }
            if (!p.kingdom) return p;
            if (p.kingdom !== player.kingdom) return undefined;
            p = direction === 'clockwise' ? p.left : p.right;
        }
        return undefined;
    }

    /** 队列阵法召唤流程：a、b 均满足时先逆时针后顺时针，已明置过的角色不再参与 */
    private async _arraycallQueue(player: Player): Promise<void> {
        const opened = new Set<Player>();
        await this._arraycallQueueDir(player, 'anticlockwise', opened);
        await this._arraycallQueueDir(player, 'clockwise', opened);
    }

    /** 沿单一方向执行队列阵法召唤检测：响应者明置后继续检测下一名，否则终止 */
    private async _arraycallQueueDir(
        player: Player,
        direction: 'clockwise' | 'anticlockwise',
        opened: Set<Player>,
    ): Promise<void> {
        let current = this._findQueueTarget(player, direction);
        while (current) {
            if (opened.has(current)) break;
            opened.add(current);
            const accepted = await this._askArrayCallResponse(current, player);
            if (!accepted) break;
            current = this._findQueueTarget(player, direction);
        }
    }

    /** 围攻阵法召唤流程：下家的下家先、上家的上家后，各询问一次 */
    private async _arraycallSiege(player: Player): Promise<void> {
        const upUp = player.prev?.prev;
        const downDown = player.next?.next;
        const canDown = !!player.next && !!downDown && player.next.kingdom !== player.kingdom && !downDown.kingdom;
        const canUp = !!player.prev && !!upUp && player.prev.kingdom !== player.kingdom && !upUp.kingdom;
        if (canDown) {
            await this._askArrayCallResponse(downDown!, player);
        }
        if (canUp) {
            await this._askArrayCallResponse(upUp!, player);
        }
    }

    /** 询问响应者是否明置武将牌响应阵法召唤（明置后势力与发动者相同才可选择） */
    private async _askArrayCallResponse(_responder: Player, _caller: Player): Promise<boolean> {
        // TODO(R10): 响应阵法召唤为一次询问（选择是否明置一张/同时明置两张武将牌），需处理明置事件
        return false;
    }

    /**
     * 明置武将
     * @rules terms/general-op-terms/open
     * @description 明置是「将其武将牌翻转至正面朝上」的操作
     * @param player 明置角色
     * @param generals 被明置的武将牌
     * @returns 状态改变事件
     */
    open(player: Player, generals: General[]): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, generals, toState: true });
    }

    /**
     * 暗置武将
     * @rules terms/general-op-terms/close
     * @description 暗置是「将其武将牌翻转至背面朝上」的操作
     * @param player 暗置角色
     * @param generals 被暗置的武将牌
     * @returns 状态改变事件
     */
    close(player: Player, generals: General[]): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, generals, toState: false });
    }

    /**
     * 横置：武将牌竖放的角色将其武将牌横放（进入连环状态）
     * @rules terms/general-op-terms/chain
     * @description 横置是「武将牌竖放的角色将其武将牌横放」的操作，进入连环状态
     * @param player 横置角色
     * @returns 状态改变事件
     */
    chain(player: Player): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, toState: true, damageType: DamageType.None });
    }

    /**
     * 重置：武将牌横放的角色将其武将牌竖放（脱离连环状态）
     * @rules terms/general-op-terms/reset
     * @description 重置是「武将牌横放的角色将其武将牌竖放」的操作，脱离连环状态
     * @param player 重置角色
     * @param damageType 连环伤害类型（默认 None）
     * @returns 状态改变事件
     */
    reset(player: Player, damageType: DamageType = DamageType.None): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, toState: false, damageType });
    }

    /** 横置/重置：按当前连环状态取反（便捷方法） */
    chainOrReset(player: Player, damageType: DamageType = DamageType.None): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, toState: !player.chained, damageType });
    }

    /**
     * 翻面
     * @rules terms/general-op-terms/skip
     * @description 翻面是「将其正/背面朝上的武将牌翻转至背/正面朝上」的操作
     * @param player 翻面角色
     * @param toState 目标状态（缺省取当前状态取反）
     * @returns 状态改变事件
     */
    skip(player: Player, toState?: boolean): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, toState: toState ?? !player.skip });
    }

    /**
     * 叠置：与翻面同一逻辑
     * @rules terms/general-op-terms/stack
     * @description 叠置是「平/叠置状态互转」的操作，与翻面同一实现
     * @param player 叠置角色
     * @param toState 目标状态（缺省取当前状态取反）
     * @returns 状态改变事件
     */
    stack(player: Player, toState?: boolean): Promise<ChangeStateEvent> {
        return this.skip(player, toState);
    }

    /**
     * 变更武将
     * @rules terms/general-op-terms/change
     * @description 变更武将——TODO(R8): 主副将数据就绪后生效
     * @param player 变更角色
     * @param general 被变更的武将牌（'head'/'deputy' 表示主/副将）
     * @param toGeneral 变更后的武将牌
     * @returns 状态改变事件
     */
    change(player: Player, general: General | 'head' | 'deputy', toGeneral: General): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, general, toGeneral });
    }

    /**
     * 移除武将
     * @rules terms/general-op-terms/remove
     * @description 移除武将——TODO(R8): 主副将数据就绪后生效
     * @param player 移除角色
     * @param general 被移除的武将牌
     * @returns 状态改变事件
     */
    remove(player: Player, general: General): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, general });
    }

    /**
     * 复原：按武将牌状态组合重置/翻面
     * @rules terms/general-op-terms/restore
     * @description 复原是「若武将牌背面朝上（或处于叠置状态）则翻面（或叠置），若处于连环状态则重置」的操作；正面朝上（或处于平置状态）且未处于连环状态时不可执行
     * @param player 复原角色
     */
    async restore(player: Player): Promise<void> {
        if (!player.skip && !player.chained) return;
        if (player.chained) {
            await this.reset(player);
        }
        if (player.skip) {
            await this.skip(player);
        }
    }

    /**
     * 无视：source 无视 target 的满足 filter 的技能
     * @rules terms/resolution-terms/ignore
     * @description 无视是「在 source 对 target 的结算过程中 target 的相关技能无效」的操作
     * @param source 无视者
     * @param target 被无视技能的角色
     * @param filter 技能筛选（缺省无视全部技能）
     */
    addIgnore(source: Player, target: Player, filter?: (skill: Skill) => boolean): void {
        this.room.ignoreRecords.push({ source, target, filter });
        // TODO: 同步无视记录到客户端（消息体）
    }

    /**
     * 移除无视
     * @rules terms/resolution-terms/ignore
     * @description 移除 source 对 target 的无视记录
     * @param source 无视者
     * @param target 被无视技能的角色
     * @param filter 匹配的筛选（缺省移除全部）
     */
    removeIgnore(source: Player, target: Player, filter?: (skill: Skill) => boolean): void {
        const records = this.room.ignoreRecords;
        for (let i = records.length - 1; i >= 0; i--) {
            const r = records[i];
            if (r.source !== source || r.target !== target) continue;
            if (filter && r.filter !== filter) continue;
            records.splice(i, 1);
        }
        // TODO: 同步无视记录到客户端（消息体）
    }

    // ===== 历史记录 =====

    /** 记录事件到历史 */
    insertHistory(event: EventProcess): void {
        this._history.push(event);
    }

    /** 查询最后一个指定类型的历史事件 */
    getLastOneHistory<T extends EventProcess>(type: string, filter?: (event: T) => boolean): T | undefined {
        for (let i = this._history.length - 1; i >= 0; i--) {
            const e = this._history[i];
            if (e.type === type && (!filter || filter(e as T))) return e as T;
        }
        return undefined;
    }

    // ===== 牌堆/移动族（事件结算支撑；区域同步语义 TODO(R1)） =====

    /**
     * 移至：将牌从另一区域移动到此区域
     * @rules terms/card-op-terms/moveCards
     * @description 移至是「将牌从另一个区域移动到此区域」的操作，预检过滤已在目标区域的牌后创建移动事件
     * @param cards 被移动的牌
     * @param toArea 目标区域
     * @param opts 移动附加选项
     * @returns 移动事件
     */
    async moveCards(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        // 预检：牌须在移动前不在目标区域内（原区域不能是目标区域）
        const valid = cards.filter((c) => c.area && c.area.areaId !== toArea);
        return this.event.moveCards([{ cards: valid, toArea, ...opts }]);
    }

    /**
     * 移至：将牌从另一区域移动到此区域（完整数据数组）
     * @rules terms/card-op-terms/moveCards
     * @description 移至是「将牌从另一个区域移动到此区域」的操作，预检过滤已在目标区域的牌后创建移动事件
     * @param datas 移动数据数组（每条含目标区域）
     * @param opts 移动标签/战报生成选项
     * @returns 移动事件
     */
    async moveCardsRaw(datas: MoveCardData[], opts?: { getMoveLabel?: (data: MoveCardData) => RichString; log?: (data: MoveCardData) => RichString }): Promise<MoveCardEvent> {
        // 预检：牌须在移动前不在目标区域内（原区域不能是目标区域）
        const valid = datas
            .map((d) => ({ ...d, cards: d.cards.filter((c) => c.area && c.area.areaId !== d.toArea) }))
            .filter((d) => d.cards.length > 0);
        return this.event.moveCards(valid, opts);
    }

    /**
     * 从牌堆获取 N 张牌。不足时自动洗牌（弃牌堆→牌堆），洗牌后仍不足则平局结束游戏并返回空。
     */
    async getNCards(count: number, pos: 'top' | 'bottom' = 'top'): Promise<GameCard[]> {
        const drawArea = this.room.drawArea;

        if (!drawArea || drawArea.count < count) {
            await this.shuffleDiscardToDraw();
        }

        const current = this.room.drawArea;
        if (!current || current.count < count) {
            this.room.logger.warn(
                `getNCards: not enough cards need=${count} have=${current?.count ?? 0}`,
                { roomId: this.room.roomId, event: 'getNCards' },
            );
            // 洗牌后仍不足：牌堆耗尽，平局结束游戏
            await this.room.gameOver();
            return [];
        }

        return current.get(count, GameCard, pos);
    }

    /**
     * 洗牌：系统将弃牌堆里的所有牌洗混后置入牌堆
     * @rules terms/card-op-terms/shuffleDiscardToDraw
     * @description 洗牌是「系统将弃牌堆里的所有牌洗混，然后置入牌堆」的操作，先将弃牌堆洗混，再经移动事件置入牌堆底部
     */
    async shuffleDiscardToDraw(): Promise<void> {
        const discard = this.room.discardArea;
        if (!discard || discard.count === 0) return;

        discard.shuffle('cards');

        const cards = discard.cards;
        await this.event.moveCards([
            { cards, toArea: AreaType.Draw, reason: 'shuffle', pos: 'bottom' },
        ]);
    }

    /**
     * 置于/入：将牌按目标区域默认放置方式移至目标区域
     * @rules terms/card-op-terms/putTo
     * @description 置于/入是「将牌按目标区域里牌的放置方式移至目标区域并按该区域默认放置方式放置」的操作，经移动事件完成；装备区/判定区为目标时含封印与判定区规则限制
     * @param cards 被置于的牌
     * @param toArea 目标区域
     * @param opts 移动附加选项
     * @returns 置于移动事件
     */
    async putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        const targetType = this.room.areas.get(toArea)?.type ?? parseAreaId(toArea).type;

        // 置于/入装备区/判定区：目标区域不能处于封印状态
        if (targetType === AreaType.Equip || targetType === AreaType.Judge) {
            // TODO(封印): 区域封印状态（sealedSlots）未实现，暂不校验，封印规则落地后补全
        }

        // 置于/入判定区：合法性检测 + 判定区不能有同名牌
        if (targetType === AreaType.Judge) {
            // TODO(判定): 判定区判定牌记录（虚拟牌）未实现，暂不校验，落地后需：
            //   1. 通过系统对其使用此延时锦囊牌的合法性检测（使用目标规则不影响）
            //   2. 判定区里不能有同名牌
        }

        return this.event.moveCards([{ cards, toArea, reason: 'put', ...opts }]);
    }

    /**
     * 扣置于/入：将牌移至目标区域且背面朝上放置
     * @rules terms/card-op-terms/putFaceDown
     * @description 扣置于/入是「将牌移至目标区域且背面朝上放置」的操作，经置于实现并强制背面朝上放置（不可提供 putType）
     * @param cards 被扣置于的牌
     * @param toArea 目标区域
     * @param opts 移动附加选项（putType 强制为 false）
     * @returns 扣置于移动事件
     */
    async putFaceDown(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        return this.putTo(cards, toArea, { ...opts, putType: false });
    }

    /**
     * 摸牌：从牌堆摸 count 张到玩家手牌
     * @rules terms/card-op-terms/draw
     * @description 摸牌是获得牌堆顶的牌的操作，经 getNCards 取牌后移动至手牌区
     * @param player 摸牌角色
     * @param count 摸牌数量（默认 1）
     * @param pos 从牌堆顶部/底部摸取（默认顶部）
     * @param opts 移动附加选项
     */
    async draw(player: Player, count: number = 1, pos: 'top' | 'bottom' = 'top', opts?: MoveCardOpts): Promise<void> {
        const cards = await this.getNCards(count, pos);
        if (cards.length === 0) return;
        await this.event.moveCards([
            {
                player,
                cards,
                toArea: player.getAreaId(AreaType.Hand),
                reason: 'draw',
                pos: 'bottom',
                ...opts,
            },
        ]);
    }

    /**
     * 将牌补至X张：手牌数不足 X 时摸（X－手牌数）张牌
     * @rules terms/card-op-terms/drawTo
     * @description 将牌补至X张是「若这些牌数小于X，摸（X－这些牌数）张牌；不小于X，没有事发生」的操作，以手牌作为这些牌
     * @param player 补牌角色
     * @param count 补至的牌数 X
     */
    async drawTo(player: Player, count: number): Promise<void> {
        const handCount = player.getHandCards().length;
        if (handCount >= count) return;
        await this.draw(player, count - handCount);
    }

    /**
     * 弃牌：将牌移动到弃牌堆
     * @rules terms/card-op-terms/discard
     * @description 弃置是「将牌移至弃牌堆」的操作，经移动事件完成
     * @param player 弃牌角色
     * @param cards 被弃置的牌
     * @param opts 移动附加选项
     * @returns 弃牌移动事件
     */
    async discard(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent> {
        return this.event.moveCards([
            { player, cards, toArea: AreaType.Discard, reason: 'discard', ...opts },
        ]);
    }

    /**
     * 废除区域：将对应区域（或对应已有装备）里的所有牌置入弃牌堆，并记录废除状态
     * @rules terms/zone-terms/area
     * @description 废除装备栏（按副类别匹配）或判定区：区域内所有牌置入弃牌堆，记录到 abolishAreas
     * @param player 被废除区域的角色
     * @param target 被废除的装备栏（EquipSubType）或判定区（AreaType.Judge）
     */
    async abolishArea(player: Player, target: EquipSubType | AreaType.Judge): Promise<void> {
        // 按类型寻找对应虚拟牌记录，收集其实体牌列表中位于目标区域的牌
        const cards: GameCard[] = [];
        if (target === AreaType.Judge) {
            // 判定区：延时锦囊虚拟牌记录
            for (const record of player.judgeCards) {
                for (const card of this.room.getCards(record.subcards)) {
                    if (card.area?.type === AreaType.Judge) cards.push(card);
                }
            }
        } else {
            // 装备栏：装备虚拟牌记录中副类别匹配的
            for (const record of player.equips) {
                const subtype = sgs.carddatas.get(record.name)?.subtype;
                if ((subtype as unknown as EquipSubType) !== target) continue;
                for (const card of this.room.getCards(record.subcards)) {
                    if (card.area?.type === AreaType.Equip) cards.push(card);
                }
            }
        }
        if (cards.length > 0) {
            await this.event.moveCards([{ player, cards, toArea: AreaType.Discard, reason: 'abolish' }]);
        }
        player.abolishAreas.push(target);
    }

    /**
     * 恢复区域：删除废除记录
     * @rules terms/zone-terms/area
     * @description 从 abolishAreas 删除对应废除记录，该区域恢复可放置牌
     * @param player 恢复区域的角色
     * @param target 恢复的装备栏（EquipSubType）或判定区（AreaType.Judge）
     */
    restoreArea(player: Player, target: EquipSubType | AreaType.Judge): void {
        const idx = player.abolishAreas.toArray().indexOf(target);
        if (idx !== -1) player.abolishAreas.remove(idx);
    }

    /**
     * 将牌弃置至X张：牌数大于 X 时弃置（牌数－X）张牌
     * @rules terms/card-op-terms/discardTo
     * @description 将牌弃置至X张是「若这些牌数大于X，弃置（这些牌数－X）张牌；不大于X，没有事发生」的操作；被弃置的牌由该角色选择，选择完成后经弃置完成
     * @param player 弃牌角色
     * @param cards 需要操作的牌数组
     * @param count 弃置至的牌数 X
     */
    async discardTo(player: Player, cards: GameCard[], count: number): Promise<void> {
        const need = cards.length - count;
        if (need <= 0) return;

        // TODO(R9): 发送选择牌询问，令 player 从 cards 中选择 need 张弃置（发送询问未实现）
        const selected: GameCard[] = [];
        await this.discard(player, selected);
    }

    /**
     * 获得牌：将牌移动到操作者手牌区
     * @rules terms/card-op-terms/obtain
     * @description 获得是「一名角色将牌移至其手牌区」的操作；仅移动仍在其原区域的有效牌
     * @param player 获得牌的角色
     * @param cards 被获得的牌
     * @param opts 移动附加选项
     * @returns 获得移动事件（无可获得牌时为 undefined）
     */
    async obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!player.alive) return undefined;
        const toArea = player.getAreaId(AreaType.Hand);
        const valid = cards.filter((c) => c.area?.areaId !== toArea);
        if (valid.length === 0) return undefined;
        return this.event.moveCards([
            { player, cards: valid, toArea, reason: 'obtain', ...opts },
        ]);
    }

    /**
     * 交给牌：将 fromPlayer 的牌移动到 toPlayer 手牌区
     * @rules terms/card-op-terms/give
     * @description 交给是「A将牌交给B」的操作（B获得这些牌）；排除接收者手牌区/装备区已拥有的牌
     * @param fromPlayer 交出的角色
     * @param toPlayer 接收的角色
     * @param cards 被交给的牌
     * @param opts 移动附加选项
     * @returns 交给移动事件（无可交给牌时为 undefined）
     */
    async give(fromPlayer: Player, toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!fromPlayer.alive || !toPlayer.alive) return undefined;
        const toArea = toPlayer.getAreaId(AreaType.Hand);
        const valid = cards.filter((c) => {
            const area = c.area;
            if (!area) return false;
            // 接收者手牌区/装备区的牌不能交出（A 与 B 为同一角色时即不能交自己的手牌/装备给自己）
            if (area.player === toPlayer && (area.type === AreaType.Hand || area.type === AreaType.Equip)) return false;
            return true;
        });
        if (valid.length === 0) return undefined;
        return this.event.moveCards([
            { player: fromPlayer, cards: valid, toArea, reason: 'give', ...opts },
        ]);
    }

    /**
     * 交换牌：两批牌同时置入处理区后分别移动到对方区域
     * @rules terms/card-op-terms/swap
     * @description 交换是「两名角色同时将各自的牌经处理区移至对方区域」的操作，经两次移动事件完成
     * @param cards1 第一批牌
     * @param toArea1 第一批牌的目标区域
     * @param cards2 第二批牌
     * @param toArea2 第二批牌的目标区域
     * @param opts 移动附加选项
     * @returns 交换移动事件（无有效牌时为 undefined）
     */
    async swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        const processing = AreaType.Processing;

        await this.event.moveCards([
            { cards: [...cards1, ...cards2], toArea: processing, reason: 'swap.put' },
        ]);

        const datas: MoveCardData[] = [];
        if (cards1.length > 0) {
            datas.push({ cards: cards1, toArea: toArea1, reason: 'swap', ...opts });
        }
        if (cards2.length > 0) {
            datas.push({ cards: cards2, toArea: toArea2, reason: 'swap', ...opts });
        }
        if (datas.length > 0) {
            return this.event.moveCards(datas);
        }
        return undefined;
    }

    /**
     * 重铸：将牌置入弃牌堆后摸等量牌
     * @rules terms/card-op-terms/recast
     * @description 重铸是「角色将此牌置入弃牌堆，然后摸一张牌」的操作，先移动至弃牌堆再摸牌
     * @param player 重铸角色
     * @param cards 被重铸的牌（须为角色拥有的牌）
     * @param drawOneAlways 是否无论张数始终摸一张（默认 false）
     * @param opts 移动附加选项
     */
    async recast(player: Player, cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts): Promise<void> {
        if (!player.alive) return;
        const owned = cards.filter((c) => c.area?.player === player);
        if (owned.length === 0) return;

        await this.event.moveCards([
            { cards: owned, toArea: AreaType.Discard, reason: 'recast.put' },
        ]);

        const drawCount = drawOneAlways ? 1 : owned.length;
        await this.draw(player, drawCount, 'top', { reason: 'recast.draw' });
    }

    /**
     * 观看：查看相应牌（卡牌或武将牌）的牌面信息的操作
     * @rules terms/card-op-terms/watch
     * @description 观看是「查看相应牌的牌面信息」的操作；观看前将观看对象对观看者可见，观看结束后可见性消失
     * @param player 观看角色
     * @param cards 被观看的牌（卡牌或武将牌）
     */
    async watch(player: Player, cards: (GameCard | General)[]): Promise<void> {
        // TODO(R9): 观看流程：向观看者发送选择牌询问（选择数量为 0，点击确定即表示观看完毕）；
        //           发送询问前将 cards 对 player 可见，观看结束后可见性消失
        //           （发送询问、卡牌可见性均未实现）
        void player;
        void cards;
    }

    /**
     * 展示牌：将牌翻转至正面朝上展示（无实际区域移动）
     * @rules terms/card-op-terms/showCards
     * @description 展示是「将背面朝上的牌翻转至正面朝上」的过程（牌不移动）
     * @param player 展示者（公共展示为 undefined）
     * @param cards 被展示的牌
     */
    async showCards(_player: Player | undefined, _cards: GameCard[]): Promise<void> {
        // TODO(R9): 广播展示动画（card.show）
    }

    /**
     * 亮出牌：牌堆牌置入处理区，其他牌等同展示
     * @rules terms/card-op-terms/flashCards
     * @description 亮出牌堆的牌即置入处理区；亮出其他区域的牌即等同展示（翻面显示）
     * @param player 亮出者（公共亮出为 undefined）
     * @param cards 被亮出的牌
     * @param opts 移动附加选项
     */
    async flashCards(player: Player | undefined, cards: GameCard[], opts?: MoveCardOpts): Promise<void> {
        const toProcess: GameCard[] = [];
        const toShow: GameCard[] = [];

        for (const card of cards) {
            if (!card) continue;
            const area = card.area;
            const areaType = area?.type;
            if (areaType === AreaType.Draw) {
                toProcess.push(card);
            } else if (areaType !== AreaType.Processing) {
                toShow.push(card);
            }
        }

        if (toProcess.length > 0) {
            await this.event.moveCards([
                { cards: toProcess, toArea: AreaType.Processing, reason: 'put', ...opts },
            ]);
        }
        if (toShow.length > 0) {
            await this.showCards(player, toShow);
        }
    }

    /** 移存牌：将牌移动到后备区 */
    async removeToReserve(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (cards.length === 0) return undefined;
        return this.event.moveCards([
            { cards, toArea: AreaType.Reserve, reason: 'remove', ...opts },
        ]);
    }

    // ===== 使用/打出牌 =====

    /**
     * 注册牌的使用方式定义（从 sgs.carduses 拷贝到房间索引）。
     * 按时机索引 cardusesByTiming：timing → CardUseData[]；
     * 按牌名索引 carduses：同名首个用 name，后续用 name.timing。
     */
    initCardUses(): void {
        // 先按 name 分组，确定各组首个
        const byName = new Map<string, CardUseData[]>();
        for (const data of sgs.carduses) {
            let list = byName.get(data.name);
            if (!list) {
                list = [];
                byName.set(data.name, list);
            }
            list.push(data);
        }

        for (const data of sgs.carduses) {
            // 按时机注册
            let timingList = this.room.cardusesByTiming.get(data.timing);
            if (!timingList) {
                timingList = [];
                this.room.cardusesByTiming.set(data.timing, timingList);
            }
            timingList.push({ ...data });

            // 按牌名注册（同名首个用 name，后续用 name.timing）
            const sameName = byName.get(data.name)!;
            if (sameName[0] === data) {
                this.room.carduses.set(data.name, { ...data });
            } else {
                this.room.carduses.set(`${data.name}.${data.timing}`, { ...data });
            }
        }
        this.room.logger.info(
            `initCardUses total=${this.room.carduses.size}`,
            { roomId: this.room.roomId, event: 'initCardUses' },
        );
    }

    /**
     * 使用牌：触发牌的使用事件
     * @rules terms/card-op-terms/useCard
     * @description 使用是「触发预使用牌事件，然后触发使用事件」的操作，创建使用事件并进入事件栈
     * @param player 使用者
     * @param card 使用的虚拟牌
     * @param targets 使用目标（缺省为空）
     * @returns 使用事件
     */
    async useCard(player: Player, card: VirtualCard, targets: Player[] = []): Promise<UseCardEvent> {
        return this.event.create(UseCardEvent, { player, targets, card, reason: 'use' });
    }

    /**
     * 打出牌：触发牌的打出事件
     * @rules terms/card-op-terms/dropCard
     * @description 打出是「触发一个打出事件」的操作，创建打出事件并进入事件栈
     * @param player 打出者
     * @param card 打出的虚拟牌
     * @returns 打出事件
     */
    async dropCard(player: Player, card: VirtualCard): Promise<DropCardEvent> {
        return this.event.create(DropCardEvent, { player, card, reason: 'drop' });
    }

    // ===== vCard 能力（mixin 转发） =====

    createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(data: VirtualCardData): VirtualCard;
    createVirtualCard(
        nameOrCardOrData: string | GameCard | VirtualCardData,
        subcardsOrOverrides?: GameCard[] | VirtualCardOverrides,
        overrides?: VirtualCardOverrides,
    ): VirtualCard {
        if (typeof nameOrCardOrData === 'string') {
            if (Array.isArray(subcardsOrOverrides)) {
                return this.vcard.create(nameOrCardOrData, subcardsOrOverrides, overrides);
            }
            return this.vcard.createByNone(nameOrCardOrData, subcardsOrOverrides as VirtualCardOverrides | undefined);
        }
        if ('subcards' in nameOrCardOrData) {
            return this.vcard.createFromData(nameOrCardOrData);
        }
        return this.vcard.createFromCard(nameOrCardOrData, subcardsOrOverrides as VirtualCardOverrides | undefined);
    }

    destroyVirtualCard(vc: VirtualCard): void {
        this.vcard.destroyVirtualCard(vc);
    }
}
