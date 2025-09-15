import { GameCard } from '../../../../core/card/card';
import { CardPut } from '../../../../core/card/card.types';
import { CustomString } from '../../../../core/custom/custom.type';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { OpenEvent } from '../../../../core/event/types/event.state';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import {
    MoveCardReason,
    WindowItemDatas,
} from '../../../../core/room/room.types';
import { SkillTag } from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const duyu = sgs.General({
    name: 'xl.duyu',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const huaijing = sgs.Skill({
    name: 'xl.duyu.huaijing',
});

huaijing.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.Opened,
        can_trigger(room, player, data: OpenEvent) {
            return (
                this.isOwner(player) &&
                data.generals.includes(this.skill?.sourceGeneral)
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(3);
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

huaijing.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    const cards: { title: CustomString; cards: GameCard[] }[] =
                        [];
                    cards.push({
                        title: 'huaijing.title1',
                        cards: context.cards,
                    });
                    cards.push({
                        title: 'huaijing.title2',
                        cards: room.getReserveUpCards(),
                    });
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 3,
                                selecte_type: 'rows',
                                selectable: [
                                    ...context.cards,
                                    ...room.getReserveUpCards(),
                                ],
                                data_rows: cards,
                                windowOptions: {
                                    title: '怀经',
                                    timebar: room.responseTime,
                                    prompt: '怀经：请选择三张牌作为即将放到牌堆顶得牌',
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(3);
            await room.puto({
                player: from,
                cards,
                toArea: room.processingArea,
                animation: false,
                puttype: CardPut.Down,
                cardVisibles: [from],
                source: data,
                reason: this.name,
            });
            return cards;
        },
        async effect(room, data, context) {
            const { from } = context;
            let cards = context.cost as GameCard[];
            context.cards = cards;
            const req_change = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result_change = room.getResultCards(req_change);
            const cards1 = cards.filter((v) => !result_change.includes(v));
            const cards2 = room
                .getReserveUpCards()
                .filter((v) => result_change.includes(v));
            await room.moveCards({
                move_datas: [
                    {
                        cards: cards1,
                        toArea: room.reserveArea,
                        puttype: CardPut.Up,
                        reason: MoveCardReason.PutTo,
                        animation: false,
                    },
                    {
                        cards: cards2,
                        toArea: room.processingArea,
                        puttype: CardPut.Down,
                        cardVisibles: [from],
                        reason: MoveCardReason.PutTo,
                        animation: false,
                    },
                ],
                source: data,
                reason: this.name,
            });

            const datas: WindowItemDatas = { type: 'items', datas: [] };
            datas.datas.push({ title: 'cards_top', items: [] });
            result_change.forEach((v) => {
                datas.datas[0].items.push({
                    title: 'cards_top',
                    card: v.id,
                });
            });
            const req = await room.sortCards(
                from,
                result_change,
                [
                    {
                        title: 'cards_top',
                        max: result_change.length,
                    },
                ],
                {
                    canCancle: false,
                    showMainButtons: false,
                    prompt: this.name,
                    thinkPrompt: this.name,
                }
            );
            const result = req.result.sort_result;
            await room.moveCards({
                move_datas: [
                    {
                        cards: result[0].items,
                        toArea: room.drawArea,
                        reason: MoveCardReason.PutTo,
                        animation: false,
                        puttype: CardPut.Down,
                    },
                ],
                source: data,
                reason: this.name,
            });
            room.drawArea.remove(result[0].items);
            room.drawArea.add(result[0].items.reverse(), 'top');
        },
    })
);

export const zhigong = sgs.Skill({
    name: 'xl.duyu.zhigong',
});

zhigong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Head],
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseEnd,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                return room.hasHistorys(
                    sgs.DataType.DieEvent,
                    (v) =>
                        room.isOtherKingdom(player, v.player) && v.player.death,
                    data
                );
            }
        },
        context(room, player, data) {
            const count = room.getHistorys(
                sgs.DataType.UseSkillEvent,
                (v) => v.use_skill === this
            ).length;
            return {
                count,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const count = context.count;
                    if (count === 0) {
                        return room.createCac({
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `是否发动技能致功：执行一个额外的出牌阶段`,
                            thinkPrompt: this.name,
                        });
                    }
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count,
                                selecte_type: 'rows',
                                selectable: room.reserveArea.cards,
                                data_rows: room.getReserveRowDatas(),
                                windowOptions: {
                                    title: '后备区',
                                    timebar: room.responseTime,
                                    prompt: `致功：你可以获得后备区里的${count}张牌，然后执行一个额外出牌阶段`,
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: ``,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            if (cards.length) {
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            room.currentTurn.phases.unshift({
                executor: from,
                isExtra: true,
                phase: Phase.Play,
            });
        },
    })
);

export const shannong = sgs.Skill({
    name: 'xl.duyu.shannong',
});

shannong.addEffect(
    sgs.copy(sgs.common_rules.get('reduce_yinyangyu'), {
        tag: [SkillTag.Deputy, SkillTag.Secret],
    })
);

shannong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Deputy],
        forced: 'cost',
        auto_log: 1,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                room.sameAsKingdom(player, data.executor) &&
                room.getReserveUpCards().length > 0
            );
        },
        getSelectors(room, context) {
            const self = this;
            return {
                cardSelector: () => {
                    const from = context.from;
                    const canuses = context.canuses as string[];
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: room.reserveArea.cards,
                                filter(item, selected) {
                                    return (
                                        canuses.find((v) => v === item.name) &&
                                        from.canUseCard(
                                            room.createVirtualCardByOne(
                                                item,
                                                false
                                            ),
                                            undefined,
                                            self.name,
                                            { excluesToCard: true }
                                        )
                                    );
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByOne(
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
                            prompt: `缮农：你可以使用一张后备区里的牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: target.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `缮农：请移除一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { from } = context;
            const canuse = [...room.getReserveUpCards().map((v) => v.name)];
            context.canuses = canuse;
            const use = await room.preUseCard({
                from: from,
                can_use_cards: canuse.map((v) => {
                    return {
                        name: v,
                        method: 1,
                    };
                }),
                source: data,
                reason: this.name,
                skill: this,
                cardSelector: {
                    selectorId: this.getSelectorName('cardSelector'),
                    context,
                },
                reqOptions: {
                    prompt: `@shannong`,
                    thinkPrompt: this.name,
                    canCancle: true,
                },
            });
            if (use) {
                const damage = room.getHistorys(
                    sgs.DataType.DamageEvent,
                    (v) => v.channel === use.card,
                    use
                );
                if (damage.length) {
                    const target = room.currentTurn.player;
                    if (target && target.hasHandCards()) {
                        context.targets = [target];
                        const req = await room.doRequest({
                            player: target,
                            get_selectors: {
                                selectorId: this.getSelectorName('choose'),
                                context,
                            },
                        });
                        const cards = room.getResultCards(req);
                        await room.removeCard({
                            player: target,
                            cards,
                            puttype: CardPut.Up,
                            source: data,
                            reason: this.name,
                            skill: this,
                        });
                    }
                }
            }
        },
    })
);
shannong.addEffect(eyes_reserve);

duyu.addSkill(huaijing);
duyu.addSkill(zhigong);
duyu.addSkill(shannong);

sgs.loadTranslation({
    ['huaijing.title1']: '牌堆顶',
    ['huaijing.title2']: '后备区',
    ['@shannong']: '缮农：你可以使用一张后备区里的牌',
});
