import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const lusu = sgs.General({
    name: 'wars.lusu',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const haoshi = sgs.Skill({
    name: 'wars.lusu.haoshi',
});

haoshi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.DrawPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data: PhaseEvent, context) {
            const { from } = context;
            data.ratedDrawnum += 2;
            const effect = await room.addEffect('haoshi.delay', from);
            effect.setData('data', data);
            return true;
        },
    })
);

export const haoshi_delay = sgs.TriggerEffect({
    name: 'haoshi.delay',
    auto_log: 1,
    audio: [],
    priorityType: PriorityType.General,
    trigger: EventTriggers.DrawPhaseEnd,
    can_trigger(room, player, data: PhaseEvent) {
        return (
            this.isOwner(player) &&
            this.getData('data') === data &&
            player.getHandCards().length > 5
        );
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const min = Math.min(
                    ...room.playerAlives
                        .filter((v) => v !== from)
                        .map((v) => v.getHandCards().length)
                );
                const count = Math.floor(from.getHandCards().length / 2);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count,
                            selectable: from.getHandCards(),
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (
                                    item !== from &&
                                    item.getHandCards().length === min
                                );
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `好施，你需要将${count}张手牌交给一名手牌数最少的角色`,
                        thinkPrompt: '好施',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        const target = room.getResultPlayers(req).at(0);
        if (cards.length && target) {
            return await room.giveCards({
                from,
                to: target,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.DrawPhaseEnd,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

export const dimeng = sgs.Skill({
    name: 'wars.lusu.dimeng',
});

dimeng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
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
                                    return item !== from;
                                },
                                onChange(type, item, selected) {
                                    if (
                                        type === 'add' &&
                                        selected.length === 2
                                    ) {
                                        const p1 = selected[0],
                                            p2 = selected[1];
                                        const count = Math.abs(
                                            p1.getHandCards().length -
                                                p2.getHandCards().length
                                        );
                                        this.selectors.card.count = count;
                                        this.options.prompt = `缔盟，你可以选择两名其他角色并弃置${count}张牌，交换他们的手牌`;
                                    } else {
                                        this.options.prompt = `缔盟，你可以选择两名其他角色（还未选择），交换他们的手牌`;
                                    }
                                },
                            }),
                            card: room.createDropCards(from, {
                                step: 2,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `缔盟，你可以选择两名其他角色（还未选择），交换他们的手牌`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            return true;
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [tar1, tar2],
            } = context;
            const cards1 = tar1.getHandCards();
            const cards2 = tar2.getHandCards();
            await room.swapCards({
                player: from,
                cards1,
                toArea1: tar2.handArea,
                cards2,
                toArea2: tar1.handArea,
                source: data,
                reason: this.name,
            });
        },
    })
);

lusu.addSkill(haoshi);
lusu.addSkill(dimeng);
