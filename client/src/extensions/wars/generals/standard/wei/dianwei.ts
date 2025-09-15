import { CardSubType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const dianwei = sgs.General({
    name: 'wars.dianwei',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const qiangxi = sgs.Skill({
    name: 'wars.dianwei.qiangxi',
});

qiangxi.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player, Phase.Play);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: [0, 1],
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.subtype === CardSubType.Weapon;
                                },
                            }),
                            target: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    if (
                                        this.selectors.card.result.length ===
                                            0 &&
                                        from.hp <= 0
                                    )
                                        return false;
                                    return item !== from && from.rangeOf(item);
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `强袭，选择一张武器牌弃置（可以不选），再选择一名攻击范围内的角色，对他造成1点伤害`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            if (cards.length === 0) {
                return await room.losehp({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            } else {
                return await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            await room.damage({
                from,
                to: target,
                source: data,
                reason: this.name,
            });
        },
    })
);

dianwei.addSkill(qiangxi);
