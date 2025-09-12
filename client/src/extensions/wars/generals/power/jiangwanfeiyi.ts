import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const jiangwanfeiyi = sgs.General({
    name: 'wars.jiangwanfeiyi',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Male,
    isDualImage: true,
    isWars: true,
});

export const shengxi = sgs.Skill({
    name: 'wars.jiangwanfeiyi.shengxi',
});

shengxi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.DropPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                const damages = room.getHistorys(
                    sgs.DataType.DamageEvent,
                    (v) => v.from === player,
                    room.currentTurn
                );
                return damages.length === 0;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                count: 2,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const shoucheng = sgs.Skill({
    name: 'wars.jiangwanfeiyi.shoucheng',
});

shoucheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                !player.inturn &&
                room.sameAsKingdom(this.player, player) &&
                data.has_lose(player, 'h') &&
                !player.hasHandCards()
            );
        },
        context(room, player, data) {
            return {
                from: this.player,
                targets: [player],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const target = context.targets.at(0);
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: {
                            text: `是否发动[b]守成[/b]，令{0}摸一张牌`,
                            values: [
                                { type: 'player', value: target.playerId },
                            ],
                        },
                    });
                },
            };
        },
        async cost(room, data, context) {
            const {
                targets: [player],
            } = context;
            return await room.drawCards({
                player,
                source: data,
                reason: this.name,
            });
        },
    })
);

jiangwanfeiyi.addSkill(shengxi);
jiangwanfeiyi.addSkill(shoucheng);
