import { CardPut, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { eyes_reserve } from '../../rules';

export const shichong = sgs.General({
    name: 'xl.shichong',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const haoshe = sgs.Skill({
    name: 'xl.shichong.haoshe',
});

haoshe.addEffect(
    sgs.StateEffect({
        regard_skill(room, player, data) {
            if (this.isOwner(player)) {
                const cards = room
                    .getReserveUpCards()
                    .filter((v) => v.type === CardType.Equip);
                const max = Math.max(...cards.map((v) => v.number));
                return cards.filter((v) => v.number === max).map((v) => v.name);
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.MoveCardAfter2,
                priority: 'after',
                async on_exec(room, data) {
                    const skills = this.regardSkills.get(this.player)?.slice();
                    if (!skills) return;
                    const cards = room
                        .getReserveUpCards()
                        .filter((v) => v.type === CardType.Equip);
                    const max = Math.max(...cards.map((v) => v.number));
                    for (const skill of skills) {
                        const card = cards.find((v) => v.name === skill.name);
                        if (!card || card.number !== max) {
                            lodash.remove(
                                this.regardSkills.get(this.player),
                                skill
                            );
                            await skill.removeSelf();
                        }
                    }
                },
            },
        ],
    })
);

haoshe.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from &&
                data.from !== player &&
                data.card &&
                data.card.type === CardType.Equip &&
                room
                    .getReserveUpCards()
                    .find((v) => v.subtype === data.card.subtype)
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.from],
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: target.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `豪奢：你需要移除一张牌，或点击取消装备牌对你无效`,
                            thinkPrompt: '豪奢',
                        },
                    };
                },
                choose2: () => {
                    const from = context.from;
                    const cards = room.getReserveUpCards();
                    return {
                        selectors: {
                            card: room.createDropCards(
                                from,
                                {
                                    step: 1,
                                    count: 1,
                                    selecte_type: 'rows',
                                    selectable: room.reserveArea.cards,
                                    data_rows: room.getReserveRowDatas(),
                                    filter(item, selected) {
                                        console.log(
                                            item.subtype === context.subtype
                                        );
                                        return (
                                            cards.includes(item) &&
                                            item.subtype === context.subtype
                                        );
                                    },
                                    windowOptions: {
                                        title: '后备区',
                                        timebar: room.responseTime,
                                        prompt: `豪奢：请弃置一张相同副类别的装备牌`,
                                        buttons: ['confirm'],
                                    },
                                },
                                false
                            ),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: ``,
                            thinkPrompt: '豪奢',
                        },
                    };
                },
            };
        },
        async effect(room, data: UseCardEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            if (cards.length) {
                await room.removeCard({
                    player: target,
                    cards,
                    puttype: CardPut.Up,
                    source: data,
                    reason: this.name,
                    skill: this,
                });
            } else {
                data.removeTarget(data.from);
                context.subtype = data.card.subtype;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose2'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
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
haoshe.addEffect(sgs.copy(eyes_reserve));

export const cefa = sgs.Skill({
    name: 'xl.shichong.cefa',
});

cefa.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                const damages = room.getHistorys(
                    sgs.DataType.DamageEvent,
                    (v) => v.from === player,
                    room.currentTurn
                );
                return damages.length > 0;
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item.hasCardsInArea(true);
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `策伐，你可以移存一名角色区域里的一张牌`,
                            thinkPrompt: '策伐',
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('hej'),
                                windowOptions: {
                                    title: '策伐',
                                    timebar: room.responseTime,
                                    prompt: `策伐：请选择一张牌`,
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: '策伐',
                        },
                    };
                },
            };
        },
        async cost(room, data: PhaseEvent, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.removeCard({
                player: from,
                cards,
                puttype: CardPut.Up,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
    })
);
cefa.addEffect(sgs.copy(eyes_reserve));

shichong.addSkill(haoshe);
shichong.addSkill(cefa);
