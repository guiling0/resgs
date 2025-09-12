import { CardType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import {
    DrawCardsData,
    MoveCardEvent,
} from '../../../../../core/event/types/event.move';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const caoren = sgs.General({
    name: 'wars.caoren',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const jushou = sgs.Skill({
    name: 'wars.caoren.jushou',
});

jushou.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.EndPhaseStarted,
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    if (item.type === CardType.Equip) {
                                        return from.canUseCard(
                                            room.createVirtualCardByOne(
                                                item,
                                                false
                                            ).vdata
                                        );
                                    } else {
                                        return from.canDropCard(item);
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: '据守：请选择一张装备牌使用或一张非装备牌弃置',
                            thinkPrompt: this.skill.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.End &&
                data.executor === player
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const count = room.getKingdomCount();
            return await room.drawCards({
                player: from,
                count,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const draw = context.cost as MoveCardEvent;
            const count = draw.getMoveCount();
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const card = room.getResultCards(req).at(0);
            if (card) {
                if (card.type === CardType.Equip) {
                    await room.preUseCard({
                        from,
                        card: room.createVirtualCardByOne(card),
                        source: data,
                        reason: this.name,
                    });
                } else {
                    await room.dropCards({
                        player: from,
                        cards: [card],
                        source: data,
                        reason: this.name,
                    });
                }
            }
            if (count > 2) {
                await room.skip({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

caoren.addSkill(jushou);
