import {
    CardAttr,
    CardColor,
    CardPut,
    CardSuit,
} from '../../core/card/card.types';
import { DamageType } from '../../core/event/event.types';
import { EventTriggers } from '../../core/event/triggers';
import { DamageEvent } from '../../core/event/types/event.damage';
import { MoveCardEvent } from '../../core/event/types/event.move';
import { OpenEvent } from '../../core/event/types/event.state';
import { PhaseEvent } from '../../core/event/types/event.turn';
import { NeedUseCardData } from '../../core/event/types/event.use';
import { GamePlayer } from '../../core/player/player';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../core/skill/skill.types';

/** 后备区的牌可见 */
export const eyes_reserve = sgs.StateEffect({
    [StateEffectType.FieldCardEyes](from, card) {
        if (this.isOwner(from) && card.area === from.room.reserveArea) {
            return true;
        }
    },
});

export const hezong = sgs.Skill({
    name: 'wars.hezong',
});

hezong.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.Rule,
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
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, 3],
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.hasAttr(CardAttr.Transferable);
                                },
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        (room.differentAsKingdom(from, item) ||
                                            item.isNoneKingdom())
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `合纵：你可以将至多三张带有“合纵”标识的牌交给其他角色`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                cards,
                targets: [to],
            } = context;
            await room.showCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            return await room.giveCards({
                from: from,
                to,
                cards,
                movetype: CardPut.Up,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            if (to && room.differentAsKingdom(from, to)) {
                const move = context.cost as MoveCardEvent;
                const count = move.getMoveCount();
                await room.drawCards({
                    player: from,
                    count,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

//奥秘技，减少一个阴阳鱼。
export const reduce_yinyangyu = sgs.TriggerEffect({
    audio: [],
    tag: [SkillTag.Secret],
    priorityType: PriorityType.Rule,
    trigger: EventTriggers.InitProperty,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.skill && this.skill.sourceGeneral;
    },
    async cost(room, data, context) {
        this.skill.sourceGeneral.sourceData.hpmax -= 0.5;
        return true;
    },
});

sgs.common_rules.set('reduce_yinyangyu', reduce_yinyangyu);

//阵法召唤：队列
export const arraycall_queue = sgs.TriggerEffect({
    tag: [SkillTag.Array_Quene],
    // priorityType: PriorityType.Rule,
    // trigger: EventTriggers.PlayPhaseProceeding,
    // can_trigger(room, player, data: PhaseEvent) {
    //     return (
    //         this.isOwner(player) &&
    //         data.isOwner(player) &&
    //         (player.next?.isNoneKingdom() || player.prev?.isNoneKingdom())
    //     );
    // },
    // getSelectors(room, context) {
    //     return {
    //         skill_cost: () => {
    //             return room.createCac({
    //                 canCancle: true,
    //                 showMainButtons: true,
    //                 prompt: `是否发起阵法召唤·队列`,
    //             });
    //         },
    //         choose_call: () => {
    //             const from = context.from;
    //             return {
    //                 selectors: {
    //                     option: room.createChooseOptions({
    //                         step: 1,
    //                         count: 1,
    //                         selectable: context.handles,
    //                     }),
    //                 },
    //                 options: {
    //                     canCancle: true,
    //                     showMainButtons: false,
    //                     prompt: {
    //                         text: `是否响应{0}的阵法召唤·队列`,
    //                         values: [{ type: 'player', value: from.playerId }],
    //                     },
    //                     thinkPrompt: this.name,
    //                 },
    //             };
    //         },
    //     };
    // },
    // async effect(room, data, context) {
    //     const { from } = context;
    //     const responses: GamePlayer[] = [];
    //     let i = 0;
    //     let current = from;
    //     while (i < 2) {
    //         while (true) {
    //             current = i === 0 ? current.next : current.prev;
    //             if (!current) break;
    //             if (responses.includes(current)) continue;
    //             responses.push(current);
    //             if (current.isNoneKingdom()) {
    //                 const openHead = room.createEventData(
    //                     sgs.DataType.OpenEvent,
    //                     {
    //                         player: current,
    //                         generals: [current.head],
    //                         source: data,
    //                         reason: this.name,
    //                     }
    //                 );
    //                 const openDeputy = room.createEventData(
    //                     sgs.DataType.OpenEvent,
    //                     {
    //                         player: current,
    //                         generals: [current.deputy],
    //                         source: data,
    //                         reason: this.name,
    //                     }
    //                 );
    //                 const openAll = room.createEventData(
    //                     sgs.DataType.OpenEvent,
    //                     {
    //                         player: current,
    //                         generals: [current.head, current.deputy],
    //                         source: data,
    //                         reason: this.name,
    //                     }
    //                 );
    //                 const check = room.sameAsKingdom(from, current, 3);
    //                 const handles: string[] = [];
    //                 handles.push(
    //                     `${openHead.check() && check ? '' : '!'}openHead`
    //                 );
    //                 handles.push(
    //                     `${openDeputy.check() && check ? '' : '!'}openDeputy`
    //                 );
    //                 handles.push(
    //                     `${openAll.check() && check ? '' : '!'}openAll`
    //                 );
    //                 context.handles = handles;
    //                 const req = await room.doRequest({
    //                     player: current,
    //                     get_selectors: {
    //                         effectId: this.id,
    //                         name: 'choose_call',
    //                         context,
    //                     },
    //                 });
    //                 const result = req.result.results.option.result as string[];
    //                 if (result.includes('openHead')) {
    //                     await room.open(openHead);
    //                     room.broadcast({
    //                         type: 'MsgPlayFaceAni',
    //                         player: from.playerId,
    //                         ani: 'array',
    //                         data: { type: 'quene' },
    //                     });
    //                     continue;
    //                 }
    //                 if (result.includes('openDeputy')) {
    //                     await room.open(openDeputy);
    //                     room.broadcast({
    //                         type: 'MsgPlayFaceAni',
    //                         player: from.playerId,
    //                         ani: 'array',
    //                         data: { type: 'quene' },
    //                     });
    //                     continue;
    //                 }
    //                 if (result.includes('openAll')) {
    //                     await room.open(openAll);
    //                     room.broadcast({
    //                         type: 'MsgPlayFaceAni',
    //                         player: from.playerId,
    //                         ani: 'array',
    //                         data: { type: 'quene' },
    //                     });
    //                     continue;
    //                 }
    //                 break;
    //             } else {
    //                 if (room.getQueue(from).includes(current)) continue;
    //                 else break;
    //             }
    //         }
    //         i++;
    //     }
    // },
});

sgs.common_rules.set('arraycall_queue', arraycall_queue);

//阵法召唤：围攻
export const arraycall_siege = sgs.TriggerEffect({
    tag: [SkillTag.Array_Siege],
    // priorityType: PriorityType.Rule,
    // trigger: EventTriggers.PlayPhaseProceeding,
    // can_trigger(room, player, data: PhaseEvent) {
    //     return (
    //         this.isOwner(player) &&
    //         data.isOwner(player) &&
    //         ((player.next && room.differentAsKingdom(player, player.next)) ||
    //             (player.prev && room.differentAsKingdom(player, player.prev)))
    //     );
    // },
    // getSelectors(room, context) {
    //     return {
    //         skill_cost: () => {
    //             return room.createCac({
    //                 canCancle: true,
    //                 showMainButtons: true,
    //                 prompt: `是否发起阵法召唤·围攻`,
    //             });
    //         },
    //         choose_call: () => {
    //             const from = context.from;
    //             return {
    //                 selectors: {
    //                     option: room.createChooseOptions({
    //                         step: 1,
    //                         count: 1,
    //                         selectable: context.handles,
    //                     }),
    //                 },
    //                 options: {
    //                     canCancle: true,
    //                     showMainButtons: false,
    //                     prompt: {
    //                         text: `是否响应{0}的阵法召唤·围攻`,
    //                         values: [{ type: 'player', value: from.playerId }],
    //                     },
    //                     thinkPrompt: this.name,
    //                 },
    //             };
    //         },
    //     };
    // },
    // async effect(room, data, context) {
    //     const { from } = context;
    //     const responses: GamePlayer[] = [];
    //     let i = 0;
    //     while (i < 2) {
    //         let current = i === 0 ? from.next : from.prev;
    //         if (current && room.differentAsKingdom(from, current)) {
    //             current = i === 0 ? current.next : current.prev;
    //             if (!current) break;
    //             if (
    //                 current.isNoneKingdom() &&
    //                 current !== from &&
    //                 !responses.includes(current)
    //             ) {
    //                 responses.push(current);
    //                 const openHead = room.createEventData(
    //                     sgs.DataType.OpenEvent,
    //                     {
    //                         player: current,
    //                         generals: [current.head],
    //                         source: data,
    //                         reason: this.name,
    //                     }
    //                 );
    //                 const openDeputy = room.createEventData(
    //                     sgs.DataType.OpenEvent,
    //                     {
    //                         player: current,
    //                         generals: [current.deputy],
    //                         source: data,
    //                         reason: this.name,
    //                     }
    //                 );
    //                 const openAll = room.createEventData(
    //                     sgs.DataType.OpenEvent,
    //                     {
    //                         player: current,
    //                         generals: [current.head, current.deputy],
    //                         source: data,
    //                         reason: this.name,
    //                     }
    //                 );
    //                 const check = room.sameAsKingdom(from, current, 3);
    //                 const handles: string[] = [];
    //                 handles.push(
    //                     `${openHead.check() && check ? '' : '!'}openHead`
    //                 );
    //                 handles.push(
    //                     `${openDeputy.check() && check ? '' : '!'}openDeputy`
    //                 );
    //                 handles.push(
    //                     `${openAll.check() && check ? '' : '!'}openAll`
    //                 );
    //                 context.handles = handles;
    //                 const req = await room.doRequest({
    //                     player: current,
    //                     get_selectors: {
    //                         effectId: this.id,
    //                         name: 'choose_call',
    //                         context,
    //                     },
    //                 });
    //                 const result = req.result.results.option.result as string[];
    //                 if (result.includes('openHead')) {
    //                     await room.open(openHead);
    //                     room.broadcast({
    //                         type: 'MsgPlayFaceAni',
    //                         player: from.playerId,
    //                         ani: 'array',
    //                         data: { type: 'siege' },
    //                     });
    //                 }
    //                 if (result.includes('openDeputy')) {
    //                     await room.open(openDeputy);
    //                     room.broadcast({
    //                         type: 'MsgPlayFaceAni',
    //                         player: from.playerId,
    //                         ani: 'array',
    //                         data: { type: 'siege' },
    //                     });
    //                 }
    //                 if (result.includes('openAll')) {
    //                     await room.open(openAll);
    //                     room.broadcast({
    //                         type: 'MsgPlayFaceAni',
    //                         player: from.playerId,
    //                         ani: 'array',
    //                         data: { type: 'siege' },
    //                     });
    //                 }
    //             }
    //         }
    //     }
    // },
});

sgs.common_rules.set('arraycall_siege', arraycall_siege);

//军令4
export const junling4 = sgs.StateEffect({
    name: 'junling4.effect',
    mark: ['mark.junling4'],
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        if (this.isOwner(from)) {
            const cards = from.getHandCards();
            return (
                card.subcards.length &&
                card.subcards.every((v) => cards.includes(v))
            );
        }
    },
    [StateEffectType.Prohibit_PlayCard](from, card, reason) {
        if (this.isOwner(from)) {
            const cards = from.getHandCards();
            return (
                card.subcards.length &&
                card.subcards.every((v) => cards.includes(v))
            );
        }
    },
    [StateEffectType.Skill_Invalidity](effect) {
        return (
            effect.skill &&
            !effect.hasTag(SkillTag.Lock) &&
            effect.isOwner(this.player)
        );
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

//军令5
export const junling5 = sgs.StateEffect({
    name: 'junling5.effect',
    mark: ['mark.junling5'],
    [StateEffectType.Prohibit_RecoverHp](player, number, reason) {
        return this.isOwner(player);
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

sgs.loadTranslation({
    ['mark.junling4']: '军令4',
    ['mark.junling5']: '军令5',
});

//妙计4
export const miaoji4 = sgs.StateEffect({
    name: 'miaoji4.effect',
    mark: ['mark.miaoji4'],
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        if (this.isOwner(from)) {
            const cards = from.getHandCards();
            return (
                card.subcards.length &&
                card.subcards.every((v) => cards.includes(v))
            );
        }
    },
    [StateEffectType.Prohibit_PlayCard](from, card, reason) {
        if (this.isOwner(from)) {
            const cards = from.getHandCards();
            return (
                card.subcards.length &&
                card.subcards.every((v) => cards.includes(v))
            );
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
export const miaoji4_damage = sgs.TriggerEffect({
    name: 'miaoji4.effect.damage',
    priorityType: PriorityType.Rule,
    trigger: EventTriggers.InflictDamage2,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.DamageEvent)) {
            const { damageType, to } = data;
            return damageType === DamageType.Fire && player === to;
        }
    },
    async cost(room, data: DamageEvent, context) {
        data.number++;
        return true;
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

//妙计5
export const miaoji5 = sgs.StateEffect({
    name: 'miaoji5.effect',
    mark: ['mark.miaoji5'],
    [StateEffectType.Skill_Invalidity](effect) {
        return (
            effect.skill &&
            !effect.hasTag(SkillTag.Lock) &&
            effect.isOwner(this.player)
        );
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
export const miaoji5_recover = sgs.TriggerEffect({
    name: 'miaoji4.effect.recover',
    priorityType: PriorityType.Rule,
    trigger: EventTriggers.RecoverHpAfter,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.RecoverHpEvent)) {
            return player === data.player;
        }
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const cards = from.getSelfCards();
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: cards,
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `妙计5：请弃置两张牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data: DamageEvent, context) {
        const { from } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

sgs.loadTranslation({
    ['mark.miaoji4']: '妙计4',
    ['mark.miaoji5']: '妙计5',
});

export const aozhan = sgs.TriggerEffect({
    name: 'wars.aozhan',
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.TurnStartBefore,
    can_trigger(room, player, data) {
        if (room.playerCount === 2) return false;
        if (room.hasMark('wars.aozhan')) return false;
        if (room.playerCount === 10 && room.shuffleCount > 0) {
            return true;
        }
        if (room.playerCount < 8) {
            return (
                room.aliveCount <= 3 &&
                !room.playerAlives.find((v1) =>
                    room.playerAlives.find(
                        (v2) => v1 !== v2 && room.sameAsKingdom(v1, v2)
                    )
                )
            );
        } else {
            return (
                room.aliveCount <= 4 &&
                !room.playerAlives.find((v1) =>
                    room.playerAlives.find(
                        (v2) => v1 !== v2 && room.sameAsKingdom(v1, v2)
                    )
                )
            );
        }
    },
    async cost(room, data, context) {
        room.setMark('wars.aozhan', true);
        room.players.forEach((v) => v.setMark('wars.aozhan', true));
        room.broadcast({
            type: 'MsgPlayGlobalAni',
            ani: 'aozhan',
        });
        await room.delay(0.3);
        room.broadcast({
            type: 'MsgPlayGlobalAni',
            ani: 'aozhan_bg',
            data: { show: true },
        });
        room.broadcast({
            type: 'MsgChangeBgmAndBg',
            bg_url: `resources/background/gameBg.jpg`,
            bgm_url: 'audio/system/aozhan.mp3',
            bgm_loop: true,
        });
        return true;
    },
});

sgs.loadTranslation({
    ['aozhan']: '桃',
});

export const warsmark = sgs.TriggerEffect({
    name: 'wars.mark',
    priorityType: PriorityType.Rule,
    trigger: EventTriggers.Opened,
    can_trigger(room, player, data: OpenEvent) {
        return (
            data.player &&
            player === data.player &&
            player.hasHead() &&
            player.hasDeputy()
        );
    },
    async cost(room, data, context) {
        const { from } = context;
        //先驱
        if (!room.getData('__xianqu') && room.playerCount > 2) {
            room.setData('__xianqu', true);
            room.broadcast({
                type: 'MsgPlayFaceAni',
                ani: 'xianqu',
                player: from.playerId,
            });
            await room.delay(2);
            await room.addSkill('wars.mark.xianqu', from, {
                source: this.name,
                showui: 'mark',
            });
        }
        //野心家
        if (
            !from.getData('__yexinjia') &&
            from.hasHead() &&
            from.headOpen &&
            from.head.kingdom === 'ye'
        ) {
            from.setData('__yexinjia', true);
            room.broadcast({
                type: 'MsgPlayFaceAni',
                ani: 'yexinjia',
                player: from.playerId,
            });
            await room.delay(2);
            await room.addSkill('wars.mark.yexinjia', from, {
                source: this.name,
                showui: 'mark',
            });
        }
        const generals = from.getOpenGenerls();
        if (generals.length >= 2) {
            const head = generals[0];
            const deputy = generals[1];
            //阴阳鱼
            if (
                !from.getData('__yinyangyu') &&
                (head.hpmax + deputy.hpmax) % 1 !== 0
            ) {
                from.setData('__yinyangyu', true);
                room.broadcast({
                    type: 'MsgPlayFaceAni',
                    ani: 'yinyangyu',
                    player: from.playerId,
                });
                await room.delay(2);
                await room.addSkill('wars.mark.yinyangyu', from, {
                    source: this.name,
                    showui: 'mark',
                });
            }
            //珠联璧合
            if (
                !from.getData('__zhulianbihe') &&
                sgs.utils.isRelationship(head.id, deputy.id)
            ) {
                from.setData('__zhulianbihe', true);
                room.broadcast({
                    type: 'MsgPlayFaceAni',
                    ani: 'zhulianbihe',
                    player: from.playerId,
                });
                await room.delay(2);
                await room.addSkill('wars.mark.zhulianbihe', from, {
                    source: this.name,
                    showui: 'mark',
                });
            }
        }
    },
});

export const xianqu = sgs.Skill({
    name: 'wars.mark.xianqu',
});

xianqu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                this.skill &&
                (player.getHandCards().length < 4 ||
                    room.players.some((v) => v !== player && v.hasNoneOpen()))
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const has = room.players.some(
                        (v) => v !== from && v.hasNoneOpen()
                    );
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: has ? 1 : 0,
                                filter(item, selected) {
                                    return item !== from && item.hasNoneOpen();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '先驱：你可以选择一名有暗置武将牌的角色，观看他的一张武将牌并将手牌补至4张',
                            thinkPrompt: this.name,
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
                            prompt: '先驱：请选择一项',
                            showMainButtons: false,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@xianqu',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (target && target.hasNoneOpen()) {
                const watchHead = room.createEventData(
                    sgs.DataType.WatchGeneralData,
                    {
                        watcher: from,
                        player: target,
                        generals: [target.head],
                        source: data,
                        reason: this.name,
                    }
                );
                const watchDeputy = room.createEventData(
                    sgs.DataType.WatchGeneralData,
                    {
                        watcher: from,
                        player: target,
                        generals: [target.deputy],
                        source: data,
                        reason: this.name,
                    }
                );
                const handles: string[] = [];
                handles.push(`${watchHead.check() ? '' : '!'}watchHead`);
                handles.push(`${watchDeputy.check() ? '' : '!'}watchDeputy`);
                context.handles = handles;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const result = room.getResult(req, 'option').result as string[];
                if (result.includes('watchHead')) {
                    await room.watchGeneral(watchHead);
                }
                if (result.includes('watchDeputy')) {
                    await room.watchGeneral(watchDeputy);
                }
            }
            if (from.getHandCards().length < 4) {
                await room.drawCards({
                    player: from,
                    count: 4 - from.getHandCards().length,
                    source: data,
                    reason: this.name,
                });
            }
            await this.skill.removeSelf();
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    if (this.player) {
                        const count = this.player.getMark<number>(this.name, 0);
                        this.player.setMark(this.name, count + 1, {
                            type: 'img',
                            visible: true,
                            url: '@xianqu',
                        });
                    }
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    if (this.player) {
                        const count = this.player.getMark<number>(this.name, 0);
                        if (count < 2) {
                            this.player.removeMark(this.name);
                        } else {
                            this.player.setMark(this.name, count - 1, {
                                type: 'img',
                                visible: true,
                                url: '@xianqu',
                            });
                        }
                    }
                },
            },
        ],
    })
);

export const yinyangyu = sgs.Skill({
    name: 'wars.mark.yinyangyu',
});

yinyangyu.addEffect(
    sgs.TriggerEffect({
        name: `${yinyangyu.name}0`,
        auto_log: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player) && this.skill;
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '是否弃置“阴阳鱼”，摸一张牌',
                    });
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@yinyangyu',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            await this.skill.removeSelf();
            await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    if (this.player) {
                        const count = this.player.getMark<number>(this.name, 0);
                        this.player.setMark(this.name, count + 1, {
                            type: 'img',
                            visible: true,
                            url: '@yinyangyu',
                        });
                    }
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    if (this.player) {
                        const count = this.player.getMark<number>(this.name, 0);
                        if (count < 2) {
                            this.player.removeMark(this.name);
                        } else {
                            this.player.setMark(this.name, count - 1, {
                                type: 'img',
                                visible: true,
                                url: '@yinyangyu',
                            });
                        }
                    }
                },
            },
        ],
    })
);

yinyangyu.addEffect(
    sgs.TriggerEffect({
        name: `${yinyangyu.name}1`,
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.DropPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                this.skill &&
                player.getHandCards().length > player.maxhand
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@yinyangyu',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            await this.skill.removeSelf();
            const effect = await room.addEffect('yinyangyu.delay', from);
            effect.setData('data', room.currentTurn);
        },
    })
);

export const yinyangyu_delay = sgs.StateEffect({
    name: 'yinyangyu.delay',
    [StateEffectType.MaxHand_Correct](from) {
        if (this.isOwner(from)) {
            return 2;
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.onObtain,
            async on_exec(room, data) {
                if (this.player) {
                    const mark = this.player.getMark(
                        'mark.yinyangyu.maxhand',
                        0
                    );
                    this.player.setMark('mark.yinyangyu.maxhand', mark + 2, {
                        visible: true,
                    });
                }
            },
        },
        {
            trigger: EventTriggers.onLose,
            async on_exec(room, data) {
                if (this.player) {
                    const mark = this.player.getMark(
                        'mark.yinyangyu.maxhand',
                        0
                    );
                    if (mark - 2 > 0) {
                        this.player.setMark(
                            'mark.yinyangyu.maxhand',
                            mark - 2,
                            {
                                visible: true,
                            }
                        );
                    } else {
                        this.player.removeMark('mark.yinyangyu.maxhand');
                    }
                }
            },
        },
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const zhulianbihe = sgs.Skill({
    name: 'wars.mark.zhulianbihe',
});

zhulianbihe.addEffect(
    sgs.TriggerEffect({
        name: 'wars.mark.zhulianbihe.draw',
        auto_log: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player) && this.skill;
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '是否弃置“珠联璧合”，摸两张牌',
                    });
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@zhulianbihe',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            await this.skill.removeSelf();
            await room.drawCards({
                player: from,
                count: 2,
                source: data,
                reason: this.name,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    if (this.player) {
                        const count = this.player.getMark<number>(this.name, 0);
                        this.player.setMark(this.name, count + 1, {
                            type: 'img',
                            visible: true,
                            url: '@zhulianbihe',
                        });
                    }
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    if (this.player) {
                        const count = this.player.getMark<number>(this.name, 0);
                        if (count < 2) {
                            this.player.removeMark(this.name);
                        } else {
                            this.player.setMark(this.name, count - 1, {
                                type: 'img',
                                visible: true,
                                url: '@zhulianbihe',
                            });
                        }
                    }
                },
            },
        ],
    })
);

zhulianbihe.addEffect(
    sgs.TriggerEffect({
        name: 'wars.mark.zhulianbihe.use',
        auto_log: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.NeedUseCard2,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const tao = room.createVirtualCardByNone(
                        'tao',
                        undefined,
                        false
                    );
                    tao.custom.method = context.method ?? 1;
                    tao.custom.canuse = from.canUseCard(
                        tao,
                        undefined,
                        this.name
                    );
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: [tao.vdata],
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
                            prompt: '珠联璧合：你可以视为使用一张【桃】',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                this.skill &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('tao', 0)
            );
        },
        context(room, player, data: NeedUseCardData) {
            let method = 1;
            data.cards.find((v) => {
                if (v.name === 'tao') method = v.method ?? 1;
            });
            return {
                method,
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@zhulianbihe',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            await this.skill.removeSelf();
        },
    })
);

export const yexinjia = sgs.Skill({
    name: 'wars.mark.yexinjia',
});

yexinjia.addEffect(
    sgs.TriggerEffect({
        name: `${yexinjia.name}0`,
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                this.skill &&
                (player.getHandCards().length < 4 ||
                    room.players.some((v) => v !== player && v.hasNoneOpen()))
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const has = room.players.some(
                        (v) => v !== from && v.hasNoneOpen()
                    );
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: has ? 1 : 0,
                                filter(item, selected) {
                                    return item !== from && item.hasNoneOpen();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '先驱：你可以选择一名有暗置武将牌的角色，观看他的一张武将牌并将手牌补至4张',
                            thinkPrompt: this.name,
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
                            prompt: '先驱：请选择一项',
                            showMainButtons: false,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@yexinjia',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (target && target.hasNoneOpen()) {
                const watchHead = room.createEventData(
                    sgs.DataType.WatchGeneralData,
                    {
                        watcher: from,
                        player: target,
                        generals: [target.head],
                        source: data,
                        reason: this.name,
                    }
                );
                const watchDeputy = room.createEventData(
                    sgs.DataType.WatchGeneralData,
                    {
                        watcher: from,
                        player: target,
                        generals: [target.deputy],
                        source: data,
                        reason: this.name,
                    }
                );
                const handles: string[] = [];
                handles.push(`${watchHead.check() ? '' : '!'}watchHead`);
                handles.push(`${watchDeputy.check() ? '' : '!'}watchDeputy`);
                context.handles = handles;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const result = room.getResult(req, 'option').result as string[];
                if (result.includes('watchHead')) {
                    await room.watchGeneral(watchHead);
                }
                if (result.includes('watchDeputy')) {
                    await room.watchGeneral(watchDeputy);
                }
            }
            if (from.getHandCards().length < 4) {
                await room.drawCards({
                    player: from,
                    count: 4 - from.getHandCards().length,
                    source: data,
                    reason: this.name,
                });
            }
            await this.skill.removeSelf();
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    if (this.player) {
                        const count = this.player.getMark<number>(this.name, 0);
                        this.player.setMark(this.name, count + 1, {
                            type: 'img',
                            visible: true,
                            url: '@yexinjia',
                        });
                    }
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    if (this.player) {
                        const count = this.player.getMark<number>(this.name, 0);
                        if (count < 2) {
                            this.player.removeMark(this.name);
                        } else {
                            this.player.setMark(this.name, count - 1, {
                                type: 'img',
                                visible: true,
                                url: '@yexinjia',
                            });
                        }
                    }
                },
            },
        ],
    })
);
yexinjia.addEffect(
    sgs.TriggerEffect({
        name: `${yexinjia.name}1`,
        auto_log: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player) && this.skill;
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '是否弃置“野心家”，摸一张牌',
                    });
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@yexinjia',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            await this.skill.removeSelf();
            await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);
yexinjia.addEffect(
    sgs.TriggerEffect({
        name: `${yexinjia.name}2`,
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.DropPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                this.skill &&
                player.getHandCards().length > player.maxhand
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@yexinjia',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            await this.skill.removeSelf();
            const effect = await room.addEffect('yinyangyu.delay', from);
            effect.setData('data', room.currentTurn);
        },
    })
);
yexinjia.addEffect(
    sgs.TriggerEffect({
        name: 'wars.mark.yexinjia.draw',
        auto_log: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player) && this.skill;
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '是否弃置“野心家”，摸两张牌',
                    });
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@yexinjia',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            await this.skill.removeSelf();
            await room.drawCards({
                player: from,
                count: 2,
                source: data,
                reason: this.name,
            });
        },
    })
);
yexinjia.addEffect(
    sgs.TriggerEffect({
        name: 'wars.mark.yexinjia.use',
        auto_log: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.NeedUseCard2,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const tao = room.createVirtualCardByNone(
                        'tao',
                        undefined,
                        false
                    );
                    tao.custom.method = context.method ?? 1;
                    tao.custom.canuse = from.canUseCard(
                        tao,
                        undefined,
                        this.name
                    );
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: [tao.vdata],
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
                            prompt: '野心家：你可以视为使用一张【桃】',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                this.skill &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('tao', 0)
            );
        },
        context(room, player, data: NeedUseCardData) {
            let method = 1;
            data.cards.find((v) => {
                if (v.name === 'tao') method = v.method ?? 1;
            });
            return {
                method,
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [
                            {
                                name: '@yexinjia',
                                suit: CardSuit.None,
                                number: -1,
                                color: CardColor.None,
                                subcards: [],
                                custom: {},
                                attr: [],
                            },
                        ],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [{ type: 'player', value: from.playerId }],
                        },
                    },
                ],
            });
            return true;
        },
        async effect(room, data, context) {
            await this.skill.removeSelf();
        },
    })
);

sgs.loadTranslation({
    ['wars.hezong']: '合纵',
    ['@desc:wars.hezong']:
        '出牌阶段限一次，你可将至多三张带有合纵标记的牌交给一名其他角色（不能与你势力相同）。若该角色与你势力不同，则你摸等量的牌。',
    ['wars.mark.zhulianbihe']: '珠联璧合',
    ['@desc:wars.mark.zhulianbihe']:
        '出牌阶段，你可以弃置一枚“珠联璧合”然后摸两张张牌；你可以弃置一枚“珠联璧合”视为使用一张【桃】',
    ['wars.mark.yinyangyu']: '阴阳鱼',
    ['@desc:wars.mark.yinyangyu']:
        '出牌阶段，你可以弃置一枚“阴阳鱼”然后摸一张牌；弃牌阶段开始时，你可以弃置一枚“阴阳鱼”令你的手牌上限于此回合内+2。',
    ['wars.mark.xianqu']: '先驱',
    ['@desc:wars.mark.xianqu']:
        '出牌阶段，若场上有未明置的武将牌或你的手牌数不足4张，你可以弃置一枚“先驱”，观看一张未明置的武将牌并将手牌数补至4张',
    ['@method:wars.mark.zhulianbihe.draw']: '摸两张牌',
    ['@method:wars.mark.zhulianbihe.use']: '使用桃',
    ['@method:wars.mark.yexinjia0']: '先驱',
    ['@method:wars.mark.yexinjia1']: '摸一张牌',
    ['@method:wars.mark.yexinjia2']: '',
    ['@method:wars.mark.yexinjia.draw']: '摸两张牌',
    ['@method:wars.mark.yexinjia.use']: '使用桃',
    ['mark.yinyangyu.maxhand']: '手牌上限',
    ['wars.mark.yexinjia']: '野心家',
    ['@desc:wars.mark.yexinjia']:
        '你可以将此标记当“先驱”“阴阳鱼”或“珠联璧合”使用。',
});
