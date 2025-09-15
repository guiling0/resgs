import { CardType, VirtualCardData } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../../core/event/types/event.move';
import {
    PhaseEvent,
    TurnEvent,
} from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const liubei = sgs.General({
    name: 'wars.liubei',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const rende = sgs.Skill({
    name: 'wars.liubei.rende',
});

rende.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        getSelectors(room, context) {
            const skill = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, -1],
                                selectable: from.getHandCards(),
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        !item.hasMark(skill.name)
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `仁德，你可以将任意张牌交给一名其他角色`,
                        },
                    };
                },
                viewuse: () => {
                    const from = context.from;
                    let vcards: VirtualCardData[] = [];
                    room.cardNamesToType.get(CardType.Basic).forEach((v) => {
                        vcards.push(...room.createVData({ name: v }));
                    });
                    vcards.forEach((v) => {
                        v.custom.method = 1;
                        v.custom.canuse = from.canUseCard(
                            v,
                            undefined,
                            this.name,
                            { excluesToCard: true }
                        );
                    });
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: vcards,
                                filter(item, selected) {
                                    return item.custom.canuse;
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByData(
                                                item,
                                                false
                                            );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `仁德，你可以视为使用一张基本牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        context(room, player, data) {
            return {
                maxTimes: -1,
            };
        },
        async cost(room, data, context) {
            const {
                from,
                cards,
                targets: [target],
            } = context;
            return await room.giveCards({
                from,
                to: target,
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
            const give = context.cost as MoveCardEvent;
            target.setMark(this.name, true);
            const count = this.getData<number>(this.name) ?? 0;
            const newcount = count + give.getMoveCount();
            this.setData(this.name, newcount);
            if (newcount >= 2 && count < 2) {
                const use = await room.preUseCard({
                    from,
                    can_use_cards: room.cardNames
                        .filter(
                            (v) => sgs.utils.getCardType(v) === CardType.Basic
                        )
                        .map((v) => {
                            return {
                                name: v,
                            };
                        }),
                    cardSelector: {
                        selectorId: this.getSelectorName('viewuse'),
                        context,
                    },
                    source: data,
                    reason: this.name,
                });
                if (use && use.card.name === 'sha') {
                    from.increaseMark('__sha_times', 1);
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data: TurnEvent) {
                    if (this.isOwner(data.player)) {
                        this.removeData(this.name);
                        room.players.forEach((v) => v.removeMark(this.name));
                    }
                },
            },
        ],
    })
);

liubei.addSkill(rende);
