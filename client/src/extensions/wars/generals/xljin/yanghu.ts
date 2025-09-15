import {
    CardPut,
    CardSubType,
    CardSuit,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PlayCardEvent } from '../../../../core/event/types/event.play';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent, UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { TriggerEffect } from '../../../../core/skill/effect';
import { SkillTag } from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const yanghu = sgs.General({
    name: 'xl.yanghu',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const deshao = sgs.Skill({
    name: 'xl.yanghu.deshao',
});

deshao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.BeOffset,
        can_trigger(room, player, data: UseEvent) {
            if (this.isOwner(player) && data.card && data.card.hasSubCards()) {
                if (data.from === player && data.current) {
                    return (
                        data.current.offset &&
                        data.current.offset.from !== player
                    );
                }
                if (data.from !== player && data.current) {
                    return (
                        data.current.offset &&
                        data.current.offset.from === player
                    );
                }
            }
        },
        async cost(room, data: UseEvent, context) {
            const { from } = context;
            return await room.removeCard({
                player: from,
                cards: data.card.subcards,
                puttype: CardPut.Up,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const yinyangyu = room.skills.find(
                (v) => v.player === from && v.name === 'wars.mark.yinyangyu'
            );
            if (!yinyangyu) {
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
        },
    })
);

export const xuantao = sgs.Skill({
    name: 'xl.yanghu.xuantao',
});

xuantao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (
                this.isOwner(player) &&
                room.differentAsKingdom(player, data.executor)
            ) {
                return room.reserveArea.cards.some((v) => {
                    if (v.isDamageCard()) {
                        const vcard = room.createVirtualCardByOne(v, false);
                        vcard.clearSubCard();
                        return player.canUseCard(
                            vcard,
                            [data.executor],
                            this.name,
                            {
                                excluesCardDistanceLimit: true,
                                excluesCardTimesLimit: true,
                            }
                        );
                    }
                    return false;
                });
            }
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
            };
        },
        getSelectors(room, context) {
            const self = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `宣讨：你可以弃置一张牌，然后弃置后备区里的一张牌，视为对${target.gameName}使用`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    const cards = room.getReserveUpCards();
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: room.reserveArea.cards,
                                data_rows: room.getReserveRowDatas(),
                                filter(item, selected) {
                                    if (!cards.includes(item)) return false;
                                    if (item.isDamageCard()) {
                                        const vcard =
                                            room.createVirtualCardByOne(
                                                item,
                                                false
                                            );
                                        vcard.clearSubCard();
                                        return from.canUseCard(
                                            vcard,
                                            [target],
                                            self.name,
                                            {
                                                excluesCardDistanceLimit: true,
                                                excluesCardTimesLimit: true,
                                            }
                                        );
                                    }
                                    return false;
                                },
                                windowOptions: {
                                    title: '后备区',
                                    timebar: room.responseTime,
                                    prompt: `宣讨：请弃置一张伤害牌，视为对${target.gameName}使用`,
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
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
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const card = room.getResultCards(req).at(0);
            if (card) {
                await room.dropCards({
                    player: from,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
                const vcard = room.createVirtualCardByOne(card);
                vcard.clearSubCard();
                const effect = await room.addEffect('xuantao.delay', from);
                effect.setData('skill', this);
                await room.usecard({
                    from,
                    card: vcard,
                    targets,
                    source: data,
                    reason: this.name,
                    skill: this,
                });
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.CircleStarted,
                async on_exec(room, data) {
                    this.setInvalids(this.name, false);
                },
            },
        ],
    })
);
xuantao.addEffect(sgs.copy(eyes_reserve));

export const xuantao_delay = sgs.TriggerEffect({
    name: 'xuantao.delay',
    audio: [],
    trigger: EventTriggers.InflictDamaged,
    can_trigger(room, player, data: DamageEvent) {
        return (
            this.isOwner(player) &&
            data.source.is(sgs.DataType.UseCardEvent) &&
            data.source.skill === this.getData('skill') &&
            data.from &&
            data.from.alive
        );
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
        const skill = this.getData<TriggerEffect>('skill');
        skill.setInvalids(skill.name, true);
        await this.removeSelf();
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

export const chonge = sgs.Skill({
    name: 'xl.yanghu.chonge',
});

chonge.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Array_Quene],
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                room.getQueue(this.player).includes(player) &&
                data.current.target === player &&
                data.card &&
                data.card.suit !== CardSuit.None &&
                (data.card.name === 'sha' || data.card.name === 'juedou')
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                suit: data.card.suit,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const skill = this;
                    const suit = context.suit;
                    const s_suit = sgs.getTranslation(`suit${suit}`);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return (
                                        item.suit === suit &&
                                        from.canPlayCard(
                                            room.createVirtualCardByOne(
                                                item,
                                                false
                                            ),
                                            skill.name
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `冲轭：你可以打出一张${s_suit}牌抵消`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            if (cards.at(0)) {
                const play = room.createVirtualCardByOne(cards.at(0));
                return await room.playcard({
                    from,
                    card: play,
                    source: data,
                    reason: this.name,
                    notMoveHandle: true,
                    skill: this,
                });
            }
        },
        async effect(room, data: UseCardEvent, context) {
            const play = context.cost as PlayCardEvent;
            data.current.offset = play;
        },
    })
);

chonge.addEffect(sgs.copy(sgs.common_rules.get('arraycall_queue')));

yanghu.addSkill(deshao);
yanghu.addSkill(xuantao);
yanghu.addSkill(chonge);
