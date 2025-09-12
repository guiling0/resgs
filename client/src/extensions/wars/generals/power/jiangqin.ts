import { CardColor } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';
import { arraycall_siege } from '../../rules';

export const jiangqin = sgs.General({
    name: 'wars.jiangqin',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const shangyi = sgs.Skill({
    name: 'wars.jiangqin.shangyi',
});

shangyi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.hasHandCards()
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `${sgs.cac_skill(
                                this.name
                            )}，令一名其他角色观看你的手牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const handles = context.handles;
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: handles,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: `尚义：请选择一项`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_card: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getHandCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '尚义',
                                    timebar: room.responseTime,
                                    prompt: '尚义：你可以弃置一张黑色牌',
                                },
                                filter(item, selected) {
                                    return item.color === CardColor.Black;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [watcher],
            } = context;
            return await room.watchHandCard({
                watcher,
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [player],
            } = context;
            const options = ['shangyi.watchhand', 'shangyi.watchgeneral'];
            if (!player.hasHandCards()) {
                options[0] = '!' + options[0];
            }
            if (!player.hasNoneOpen()) {
                options[1] = '!' + options[1];
            }
            context.handles = options;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('shangyi.watchhand')) {
                sgs.DataType.WatchHandData.temp(from, player.getHandCards());
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card'),
                        context,
                    },
                });
                sgs.DataType.WatchHandData.temp_end(
                    from,
                    player.getHandCards()
                );
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
            if (result.includes('shangyi.watchgeneral')) {
                await room.watchGeneral({
                    watcher: from,
                    generals: player.getGenerls(),
                    onlyConcealed: true,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const niaoxiang = sgs.Skill({
    name: 'wars.jiangqin.niaoxiang',
});

niaoxiang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Array_Siege],
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (this.isOwner(player) && data.card && data.card.name === 'sha') {
                const target = data.current.target;
                if (data.from === player) {
                    const queue = room.getQueue(target);
                    return player.isAdjacent(target) && queue.length === 0;
                }
                if (data.from !== player) {
                    const sieges = room.getSiege(player);
                    return !!sieges.find(
                        (v) =>
                            v.from.includes(player) &&
                            v.from.includes(data.from) &&
                            v.target === target
                    );
                }
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            data.current.wushuang.push(data.from);
            return true;
        },
    })
);

niaoxiang.addEffect(sgs.copy(arraycall_siege));

jiangqin.addSkill(shangyi);
jiangqin.addSkill(niaoxiang);

sgs.loadTranslation({
    ['shangyi.watchhand']: '观看手牌',
    ['shangyi.watchgeneral']: '观看武将牌',
});
