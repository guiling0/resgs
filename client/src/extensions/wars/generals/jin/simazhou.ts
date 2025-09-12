import { GameCard } from '../../../../core/card/card';
import { CustomString } from '../../../../core/custom/custom.type';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const simazhou = sgs.General({
    name: 'wars.simazhou',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const pojing = sgs.Skill({
    name: 'wars.simazhou.pojing',
});

pojing.addEffect(
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
                                count: 1,
                                filter(item, selected) {
                                    return item.hasCardsInArea();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `迫境：你可以令一名其他角色选择一项执行：1.你获得其区域里的一张牌；2.你发起势力召唤`,
                            thinkPrompt: '迫境',
                        },
                    };
                },
                choose: () => {
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: context.handles,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: `迫境：请选择一项`,
                            thinkPrompt: '迫境',
                        },
                    };
                },
                choose_obtain: () => {
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
                                    title: '迫境',
                                    timebar: room.responseTime,
                                    prompt: '迫境：请选择一张牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: '迫境',
                        },
                    };
                },
                choose_call: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: context.handles,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: `迫境：是否响应势力召唤并对${target.gameName}造成伤害`,
                            thinkPrompt: '迫境',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                targets: [target],
            } = context;
            const options: CustomString[] = ['pojing.obtain', 'pojing.call'];
            if (!target.hasCardsInArea()) {
                options[0] = '!' + options[0];
            }
            context.handles = options;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result;
            if (result.length) return result;
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const result = context.cost as string[];
            if (result.includes('pojing.obtain')) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_obtain'),
                        context,
                    },
                });
                const result = req.result.results.cards.result as GameCard[];
                await room.obtainCards({
                    player: from,
                    cards: result,
                    source: data,
                    reason: this.name,
                });
            }
            if (result.includes('pojing.call')) {
                const players = room.sortResponse(room.playerAlives);
                while (players.length > 0) {
                    const player = players.shift();
                    if (room.differentAsKingdom(from, player)) continue;
                    if (!player.hasNoneOpen()) continue;
                    const openHead = room.createEventData(
                        sgs.DataType.OpenEvent,
                        {
                            player,
                            generals: [player.head],
                            source: data,
                            reason: this.name,
                        }
                    );
                    const openDeputy = room.createEventData(
                        sgs.DataType.OpenEvent,
                        {
                            player,
                            generals: [player.deputy],
                            source: data,
                            reason: this.name,
                        }
                    );
                    const openAll = room.createEventData(
                        sgs.DataType.OpenEvent,
                        {
                            player,
                            generals: [player.head, player.deputy],
                            source: data,
                            reason: this.name,
                        }
                    );
                    const check = room.sameAsKingdom(from, player, 3);
                    const handles: string[] = [];
                    handles.push(
                        `${openHead.check() && check ? '' : '!'}openHead`
                    );
                    handles.push(
                        `${openDeputy.check() && check ? '' : '!'}openDeputy`
                    );
                    handles.push(
                        `${openAll.check() && check ? '' : '!'}openAll`
                    );
                    context.handles = handles;
                    const req = await room.doRequest({
                        player,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose_call'),
                            context,
                        },
                    });
                    const result = req.result.results.option.result as string[];
                    if (result.includes('openHead')) {
                        await room.open(openHead);
                        await room.damage({
                            from: player,
                            to: target,
                            source: data,
                            reason: this.name,
                        });
                    }
                    if (result.includes('openDeputy')) {
                        await room.open(openDeputy);
                        await room.damage({
                            from: player,
                            to: target,
                            source: data,
                            reason: this.name,
                        });
                    }
                    if (result.includes('openAll')) {
                        await room.open(openAll);
                        await room.damage({
                            from: player,
                            to: target,
                            number: 2,
                            source: data,
                            reason: this.name,
                        });
                    }
                }
            }
        },
    })
);

simazhou.addSkill(pojing);

sgs.loadTranslation({
    ['pojing.obtain']: '获得你区域里的一张牌',
    ['pojing.call']: '发起势力召唤',
});
