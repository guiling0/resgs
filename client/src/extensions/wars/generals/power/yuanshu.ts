import { AreaType } from '../../../../core/area/area.type';
import { EventTriggers } from '../../../../core/event/triggers';
import { CommandData } from '../../../../core/event/types/event.command';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';

export const yuanshu = sgs.General({
    name: 'wars.yuanshu',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const yongsi = sgs.Skill({
    name: 'wars.yuanshu.yongsi',
});

yongsi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        audio: ['yuanshu/yongsi1'],
        priorityType: PriorityType.None,
        trigger: EventTriggers.DrawPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOpen() && data.isOwner(this.player);
        },
        regard_skill(room, player, data) {
            if (this.isOwner(player)) {
                return 'yuxi';
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.MoveCardAfter2,
                priority: 'after',
                async on_exec(room, data) {
                    const has = room.playerAlives.find((v) =>
                        v.getEquipCards().find((c) => c.name === 'yuxi')
                    );
                    this.setInvalids(this.name, !!has);
                },
            },
        ],
    })
);

yongsi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        audio: ['yuanshu/yongsi2'],
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.current.target === player &&
                data.card.name === 'zhijizhibi' &&
                player.hasHandCards()
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.showCards({
                player: from,
                cards: from.getHandCards(),
                source: data,
                reason: this.name,
            });
        },
    })
);

export const weidi = sgs.Skill({
    name: 'wars.yuanshu.weidi',
});

weidi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        context(room, player, data: PhaseEvent) {
            const targets: GamePlayer[] = [];
            room.getPeriodHistory(room.currentTurn).forEach((v) => {
                if (v.data.is(sgs.DataType.MoveCardEvent)) {
                    v.data
                        .filter(
                            (d) =>
                                d.toArea.type === AreaType.Hand &&
                                d.fromArea === room.drawArea
                        )
                        .forEach((d) => {
                            if (
                                d.toArea.player &&
                                !targets.includes(d.toArea.player)
                            ) {
                                targets.push(d.toArea.player);
                            }
                        });
                }
            });
            return {
                targets,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const targets = context.targets;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item !== from && targets.includes(item)
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '伪帝：你可以令一名本回合获得过牌堆里的牌的其他角色执行军令',
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const count = context.count;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: count,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `伪帝：请将${count}张牌交给${target.gameName}`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            return await room.command({
                from,
                to,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            const command = context.cost as CommandData;

            if (command && !command.execute) {
                const count = to.getHandCards().length;
                if (count > 0) {
                    await room.obtainCards({
                        player: from,
                        cards: to.getHandCards(),
                        source: data,
                        reason: this.name,
                    });
                    context.count = count;
                    const req = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context,
                        },
                    });
                    const cards = room.getResultCards(req);
                    await room.giveCards({
                        from,
                        to,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

yuanshu.addSkill(yongsi);
yuanshu.addSkill(weidi);
