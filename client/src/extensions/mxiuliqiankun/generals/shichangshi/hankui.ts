import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const cs_hankui = sgs.General({
    name: 'cs_hankui',
    kingdom: 'qun',
    hp: 1,
    gender: Gender.Male,
    enable: false,
    hidden: true,
});

export const xiaolu = sgs.Skill({
    name: 'cs_hankui.xiaolu',
});

xiaolu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        getSelectors(room, context) {
            const skill = this;
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `宵赂：你可以摸两张牌，然后交出或弃置两张牌`,
                    });
                },
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 2,
                                count: 2,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    if (
                                        !this.selectors.player ||
                                        this.selectors.player.result.length ===
                                            0
                                    )
                                        return from.canDropCard(item);
                                    return true;
                                },
                            }),
                            player: room.createChoosePlayer({
                                step: 1,
                                count: [0, 1],
                                filter(item, selected) {
                                    return from !== item;
                                },
                                onChange(type, item, selected) {
                                    if (
                                        type === 'remove' &&
                                        this.selectors.card
                                    ) {
                                        this.selectors.card.result.length = 0;
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `宵赂：请两张手牌，将这些牌交给你选择的角色，不选角色则弃置`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
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
        async effect(room, data, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            const to = room.getResultPlayers(req).at(0);
            if (to) {
                await room.giveCards({
                    from,
                    to,
                    cards,
                    source: data,
                    reason: this.name,
                });
            } else {
                await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

cs_hankui.addSkill(xiaolu);
