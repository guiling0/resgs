import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const hetaihou = sgs.General({
    name: 'wars.hetaihou',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const zhendu = sgs.Skill({
    name: 'wars.hetaihou.zhendu',
});

zhendu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                !data.isOwner(player) &&
                data.executor.alive &&
                player.hasCanDropCards('h', player, 1, this.name)
            );
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: {
                                text: `${sgs.cac_skill(
                                    this.name
                                )}，对{0}造成1点伤害并视为使用【酒】`,
                                values: [
                                    { type: 'player', value: target.playerId },
                                ],
                            },
                            thinkPrompt: this.name,
                        },
                    };
                },
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
                targets: [to],
            } = context;
            const jiu = room.createVirtualCardByNone('jiu');
            await room.preUseCard({
                from: to,
                card: jiu,
                source: data,
                reason: this.name,
            });
            await room.damage({
                from,
                to,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const qiluan = sgs.Skill({
    name: 'wars.hetaihou.qiluan',
});

qiluan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.TurnEnd,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                room.hasHistorys(
                    sgs.DataType.DieEvent,
                    (v) => v.killer && v.killer === player,
                    data
                )
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                count: 3,
                source: data,
                reason: this.name,
            });
        },
    })
);

hetaihou.addSkill(zhendu);
hetaihou.addSkill(qiluan);
