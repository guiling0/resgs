import { EventTriggers } from '../../../../core/event/triggers';
import { CommandData } from '../../../../core/event/types/event.command';
import { DyingEvent } from '../../../../core/event/types/event.die';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const wuguotai = sgs.General({
    name: 'wars.wuguotai',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const ganlu = sgs.Skill({
    name: 'wars.wuguotai.ganlu',
});

ganlu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 2,
                                filter(item, selected) {
                                    if (selected.length === 0) {
                                        return true;
                                    } else {
                                        if (
                                            item.getEquipCards().length === 0 &&
                                            selected[0].getEquipCards()
                                                .length === 0
                                        ) {
                                            return false;
                                        }
                                        return (
                                            Math.abs(
                                                selected[0].getEquipCards()
                                                    .length -
                                                    item.getEquipCards().length
                                            ) <= from.losshp
                                        );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `甘露：你可以选择装备区牌数差不大于${from.losshp}得两名玩家交换装备`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target1, target2],
            } = context;
            const cards1 = target1.getEquipCards();
            const cards2 = target2.getEquipCards();
            await room.swapCards({
                player: from,
                cards1,
                toArea1: target2.equipArea,
                cards2,
                toArea2: target1.equipArea,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const buyi = sgs.Skill({
    name: 'wars.wuguotai.buyi',
});

buyi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.DyingEnd,
        can_trigger(room, player, data: DyingEvent) {
            if (
                this.isOwner(player) &&
                data.player &&
                data.player.alive &&
                room.sameAsKingdom(player, data.player)
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                if (uses.length > 0) return false;
                const damage = data.getDamage();
                return damage && !!damage.from;
            }
        },
        context(room, player, data: DyingEvent) {
            return {
                targets: [data.getDamage().from],
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
        async effect(room, data: DyingEvent, context) {
            const {
                from,
                targets: [to],
            } = context;
            const command = context.cost as CommandData;

            if (command && !command.execute) {
                await room.recoverhp({
                    player: data.player,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

wuguotai.addSkill(ganlu);
wuguotai.addSkill(buyi);
