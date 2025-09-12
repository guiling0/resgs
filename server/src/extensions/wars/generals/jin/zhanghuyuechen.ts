import { CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import { MoveCardReason } from '../../../../core/room/room.types';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';

export const zhanghuyuechen = sgs.General({
    name: 'wars.zhanghuyuechen',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isDualImage: true,
    isWars: true,
});

export const xijue = sgs.Skill({
    name: 'wars.zhanghuyuechen.xijue',
});

xijue.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        audio: ['zhanghuyuechen/tuxi1', 'zhanghuyuechen/tuxi2'],
        priorityType: PriorityType.General,
        trigger: EventTriggers.DrawPhaseProceeding,
        auto_directline: 1,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const count = context.count;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                            target: room.createChoosePlayer({
                                step: 2,
                                count: [1, count],
                                filter(item, selected) {
                                    return item !== from && item.hasHandCards();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `突袭（袭爵），你可以弃置一张牌并选择至多${count}名其他角色，获得他们各一张手牌`,
                            thinkPrompt: '突袭（袭爵）',
                        },
                    };
                },
                choose: () => {
                    const target = room.getPlayer(context.player);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '突袭（袭爵）',
                                    timebar: room.responseTime,
                                    prompt: `突袭（袭爵）：请选择一张牌`,
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: '突袭',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Draw &&
                data.executor === player &&
                data.ratedDrawnum > 0
            );
        },
        context(room, player, data: PhaseEvent) {
            return {
                count: data.ratedDrawnum,
            };
        },
        async cost(room, data: PhaseEvent, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: PhaseEvent, context) {
            const { from, targets } = context;
            data.ratedDrawnum -= targets.length;
            while (targets.length > 0) {
                const to = targets.shift();
                context.player = to.playerId;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

xijue.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        audio: ['zhanghuyuechen/xiaoguo1', 'zhanghuyuechen/xiaoguo3'],
        priorityType: PriorityType.General,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                !data.isOwner(player, Phase.End) &&
                player.hasCanDropCards('h', player, 1, this.name)
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const effct = context.effect;
                    const from = context.from;
                    const target = context.targets.at(0);
                    const basics = from
                        .getHandCards()
                        .filter(
                            (item) =>
                                item.type === CardType.Basic &&
                                from.canDropCard(item, effct.name)
                        );
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    if (basics.length === 0) return false;
                                    if (basics.length === 1) {
                                        return item.type !== CardType.Basic;
                                    } else {
                                        return true;
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `袭爵，你可以弃置一张${
                                basics.length === 1 ? '非基本牌' : '牌'
                            }，发动骁果`,
                            thinkPrompt: '骁果',
                        },
                    };
                },
                skill_cost2: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Basic;
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `骁果（袭爵），你可以弃置一张基本牌，令${target.gameName}弃置装备牌或受到伤害`,
                            thinkPrompt: '骁果',
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: target.getSelfCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Equip;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `骁果（袭爵），你需要弃置一张装备牌，否则受到1点伤害`,
                            thinkPrompt: '骁果',
                        },
                    };
                },
            };
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const req_cost = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('skill_cost2'),
                    context,
                },
            });
            const cost_cards = room.getResultCards(req_cost);
            const cost_drop = await room.dropCards({
                player: from,
                cards: cost_cards,
                source: data,
                reason: this.name,
            });
            if (!cost_drop) return;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            const drop = await room.dropCards({
                player: target,
                cards,
                source: data,
                reason: this.name,
            });
            if (!drop) {
                await room.damage({
                    from,
                    to: target,
                    source: data,
                    reason: this.name,
                });
            } else {
                await room.drawCards({
                    player: from,
                    count: 1,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const lvxian = sgs.Skill({
    name: 'wars.zhanghuyuechen.lvxian',
});

lvxian.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Head],
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            //未发动过此技能，上一个回合为不为你的回合，上一个回合失去的牌数大于0
            if (
                this.isOwner(player) &&
                data.to &&
                player === data.to &&
                !this.getData(this.name)
            ) {
                const turn = room.getHistorys(
                    sgs.DataType.TurnEvent,
                    (v) =>
                        v.turnId === room.turnCount - 1 && v.player !== player
                );
                if (turn.length) {
                    const lose = room.getHistorys(
                        sgs.DataType.MoveCardEvent,
                        (v) => v.has_lose(player, 'he'),
                        turn.at(0)
                    );
                    return lose.length > 0;
                }
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            const turn = room.getHistorys(
                sgs.DataType.TurnEvent,
                (v) => v.turnId === room.turnCount - 1
            );
            if (turn.length) {
                let count = 0;
                room.getHistorys(
                    sgs.DataType.MoveCardEvent,
                    (v) => v.has_lose(from, 'he'),
                    turn.at(0)
                ).forEach((v) => {
                    v.getLoseDatas(from, 'he').forEach(
                        (d) => (count += d.cards.length)
                    );
                });
                this.setData(this.name, true);
                return await room.drawCards({
                    player: from,
                    count,
                    source: data,
                    reason: this.name,
                });
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data) {
                    this.removeData(this.name);
                    this.player.removeMark('mark.lvxian');
                },
            },
            {
                trigger: EventTriggers.TurnStart,
                async on_exec(room, data) {
                    if (this.check() && this.isOpen()) {
                        const turn = room.getHistorys(
                            sgs.DataType.TurnEvent,
                            (v) =>
                                v.turnId === room.turnCount - 1 &&
                                v.player !== this.player
                        );
                        if (turn.length) {
                            let count = 0;
                            room.getHistorys(
                                sgs.DataType.MoveCardEvent,
                                (v) => v.has_lose(this.player, 'he'),
                                turn.at(0)
                            ).forEach((v) => {
                                v.getLoseDatas(this.player, 'he').forEach(
                                    (d) => (count += d.cards.length)
                                );
                            });
                            if (count > 0) {
                                this.player.setMark('mark.lvxian', count, {
                                    visible: true,
                                });
                            }
                        }
                    }
                },
            },
        ],
    })
);

export const yingwei = sgs.Skill({
    name: 'wars.zhanghuyuechen.yingwei',
});

yingwei.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Deputy],
        auto_log: 1,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                // const mark = this.player.getMark<number[]>(`mark.yingwei`) ?? [
                //     0, 0,
                // ];
                // return mark[0] === mark[1];
                let draws_count = 0,
                    damages_count = 0;
                room.getHistorys(
                    sgs.DataType.MoveCardEvent,
                    (v) =>
                        v.has_filter(
                            (d, c) =>
                                d.reason === MoveCardReason.Draw &&
                                d.toArea === player.handArea
                        ),
                    room.currentTurn
                ).forEach((v) => {
                    v.getObtainDatas(player).forEach((d) => {
                        if (d.reason === MoveCardReason.Draw) {
                            draws_count += d.cards.length;
                        }
                    });
                });
                room.getHistorys(
                    sgs.DataType.DamageEvent,
                    (v) => v.from === player,
                    room.currentTurn
                ).forEach((v) => {
                    damages_count += v.number;
                });
                return draws_count === damages_count;
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, 2],
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `盈威：你可以重铸至多2张牌`,
                            thinkPrompt: '盈威',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.recastCards({
                player: from,
                cards,
                defaultDraw: false,
                source: data,
                reason: this.name,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.InflictDamaged,
                async on_exec(room, data: DamageEvent) {
                    if (this.check() && data.from === this.player) {
                        const d = this.player.getMark<number[]>(
                            `mark.yingwei`
                        ) ?? [0, 0];
                        this.player.setMark(
                            `mark.yingwei`,
                            [d[0], d[1] + data.number],
                            {
                                visible: true,
                            }
                        );
                    }
                },
            },
            {
                trigger: EventTriggers.MoveCardAfter1,
                async on_exec(room, data: MoveCardEvent) {
                    if (
                        room.currentTurn.player === this.player &&
                        this.check() &&
                        this.isOpen()
                    ) {
                        let count = 0;
                        data.getObtainDatas(this.player).forEach((d) => {
                            if (d.reason === MoveCardReason.Draw) {
                                count += d.cards.length;
                            }
                        });
                        if (count > 0) {
                            const d = this.player.getMark<number[]>(
                                `mark.yingwei`
                            ) ?? [0, 0];
                            this.player.setMark(
                                `mark.yingwei`,
                                [d[0] + count, d[1]],
                                {
                                    visible: true,
                                }
                            );
                        }
                    }
                },
            },
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data) {
                    this.player.removeMark('mark.yingwei');
                },
            },
        ],
    })
);

zhanghuyuechen.addSkill(xijue);
zhanghuyuechen.addSkill('#wars.zhanghuyuechen.tuxi');
zhanghuyuechen.addSkill('#wars.zhanghuyuechen.xiaoguo');
zhanghuyuechen.addSkill(lvxian);
zhanghuyuechen.addSkill(yingwei);

sgs.loadTranslation({
    ['mark.lvxian']: '履险',
    ['mark.yingwei']: '盈威',
});
