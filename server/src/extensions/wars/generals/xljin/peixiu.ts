import { GameCard } from '../../../../core/card/card';
import { CardPut, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { JudgeEvent } from '../../../../core/event/types/event.judge';
import { PlayCardEvent } from '../../../../core/event/types/event.play';
import { UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import { PriorityType } from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const peixiu = sgs.General({
    name: 'xl.peixiu',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const zuoming = sgs.Skill({
    name: 'xl.peixiu.zuoming',
});

zuoming.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.JudgeResult1,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const skill = this;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: room.getReserveUpCards(),
                                filter(item, selected) {
                                    return from.canPlayCard(
                                        room.createVirtualCardByOne(
                                            item,
                                            false
                                        ),
                                        skill.name
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `佐命：你可以打出一张后备区里的牌代替判定牌`,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.JudgeEvent) &&
                room.reserveArea.count > 0
            );
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            const play = room.createVirtualCardByOne(cards.at(0));
            return await room.playcard({
                from,
                card: play,
                source: data,
                reason: this.name,
                notMoveHandle: true,
                skill: this,
            });
        },
        async effect(room, data: JudgeEvent, context) {
            const play = context.cost as PlayCardEvent;
            if (play.card.subcards.length === 0) return;
            await data.setCard(play.card.subcards[0]);
        },
    })
);
zuoming.addEffect(sgs.copy(eyes_reserve));

export const liuti = sgs.Skill({
    name: 'xl.peixiu.liuti',
});

liuti.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: [EventTriggers.CardBeUse, EventTriggers.CardBePlay],
        can_trigger(room, player, data: UseEvent | PlayCardEvent) {
            if (
                this.isOwner(player) &&
                data.from &&
                room.sameAsKingdom(player, data.from)
            ) {
                const phase = room.getCurrentPhase();
                if (!phase.isOwner(data.from, Phase.Play)) return false;
                return (
                    room.getPeriodHistory(room.currentTurn).filter((v) => {
                        return (
                            (v.data.is(sgs.DataType.UseCardEvent) ||
                                v.data.is(sgs.DataType.UseCardToCardEvent) ||
                                v.data.is(sgs.DataType.PlayCardEvent)) &&
                            v.data.from === data.from
                        );
                    }).length === Math.max(1, data.from.distanceTo(player))
                );
            }
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const cards = context.cards;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: cards,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '六体',
                                    timebar: room.responseTime,
                                    prompt: '六体：请选择一张牌获得，另一张牌置入后备区',
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
        context(room, player, data: UseEvent | PlayCardEvent) {
            return {
                targets: [data.from],
            };
        },
        async effect(room, data, context) {
            const {
                targets: [target],
            } = context;
            await room.chooseYesOrNo(
                target,
                {
                    prompt: '@liuti',
                    thinkPrompt: this.name,
                },
                async () => {
                    const cards = await room.getNCards(2);
                    await room.puto({
                        player: target,
                        cards,
                        toArea: room.processingArea,
                        animation: false,
                        puttype: CardPut.Down,
                        cardVisibles: [target],
                        source: data,
                        reason: this.name,
                    });
                    context.cards = cards;
                    const req = await room.doRequest({
                        player: target,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context,
                        },
                    });
                    const gcards = room.getResultCards(req);
                    await room.obtainCards({
                        player: target,
                        cards: gcards,
                        source: data,
                        reason: this.name,
                    });
                    await room.removeCard({
                        player: target,
                        cards: cards.filter(
                            (v) => v.area === room.processingArea
                        ),
                        puttype: CardPut.Up,
                        source: data,
                        reason: this.name,
                        skill: this,
                    });
                }
            );
        },
    })
);
liuti.addEffect(sgs.copy(eyes_reserve));

export const jingsi = sgs.Skill({
    name: 'xl.peixiu.jingsi',
});

jingsi.addEffect(
    sgs.TriggerEffect({
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamaged,
        auto_log: 1,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                player === data.to &&
                data.channel &&
                data.channel.type === CardType.Scroll
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const count = from.losshp;
                    const cards = room.getReserveUpCards();
                    return {
                        selectors: {
                            card: room.createDropCards(
                                from,
                                {
                                    step: 1,
                                    count: count,
                                    selecte_type: 'rows',
                                    selectable: room.reserveArea.cards,
                                    data_rows: room.getReserveRowDatas(),
                                    filter(item, selected) {
                                        return cards.includes(item);
                                    },
                                    windowOptions: {
                                        title: '后备区',
                                        timebar: room.responseTime,
                                        prompt: `经笥：你可以弃置${count}张后备区里的牌，回复1点体力`,
                                        buttons: ['confirm'],
                                    },
                                },
                                false
                            ),
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
        async cost(room, data: DamageEvent, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.recoverhp({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);
jingsi.addEffect(sgs.copy(eyes_reserve));

peixiu.addSkill(zuoming);
peixiu.addSkill(liuti);
peixiu.addSkill(jingsi);

sgs.loadTranslation({
    ['@liuti']: '是否发动技能六体',
});
