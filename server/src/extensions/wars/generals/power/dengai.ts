import { CardPut, CardSuit } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { JudgeEvent } from '../../../../core/event/types/event.judge';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { Gender } from '../../../../core/general/general.type';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';
import { reduce_yinyangyu } from '../../rules';

export const dengai = sgs.General({
    name: 'wars.dengai',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const tuntian = sgs.Skill({
    name: 'wars.dengai.tuntian',
});

tuntian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                !player.inturn &&
                data.has_lose(player, 'he')
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `屯田：是否将判定牌置于武将牌上`,
                        thinkPrompt: `屯田`,
                    });
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.judge({
                player: from,
                isSucc(result) {
                    return result.suit !== CardSuit.Heart;
                },
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const judge = context.cost as JudgeEvent;
            const card = judge.card;
            if (judge.success && card?.area === room.discardArea) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context: {},
                    },
                });
                if (req.result.cancle) return;
                await room.puto({
                    player: from,
                    cards: [card],
                    toArea: from.upArea,
                    source: data,
                    puttype: CardPut.Up,
                    reason: this.name,
                });
                card.setMark('mark.tian', true);
                from.setMark('mark.tian', true, {
                    visible: true,
                    source: this.name,
                    type: 'cards',
                    areaId: from.upArea.areaId,
                });
            }
        },
    })
);

tuntian.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct](from, to) {
            if (this.isOwner(from)) {
                return from.getUpOrSideCards('mark.tian').length * -1;
            }
        },
    })
);

export const jixi = sgs.Skill({
    name: 'wars.dengai.jixi',
});

jixi.addEffect(
    sgs.copy(reduce_yinyangyu, {
        tag: [SkillTag.Head, SkillTag.Secret],
    })
);

jixi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const shun = room.createVirtualCardByNone(
                        'shunshouqianyang',
                        undefined,
                        false
                    );
                    shun.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getUpOrSideCards('mark.tian'),
                                filter(item, selected) {
                                    return true;
                                },
                                onChange(type, item) {
                                    if (type === 'add') shun.addSubCard(item);
                                    if (type === 'remove')
                                        shun.delSubCard(item);
                                    shun.set();
                                    this._use_or_play_vcard = shun;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '急袭，你可以将一张“田”当【顺手牵羊】使用',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('shunshouqianyang')
            );
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            from.refreshMark = 'mark.tian';
            return true;
        },
    })
);

export const ziliang = sgs.Skill({
    name: 'wars.dengai.ziliang',
    visible(room) {
        return this.sourceGeneral === this.player.deputy;
    },
});

ziliang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        tag: [SkillTag.Deputy],
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to &&
                data.to.alive &&
                room.sameAsKingdom(player, data.to) &&
                player.hasUpOrSideCards('mark.tian')
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getUpOrSideCards('mark.tian'),
                                filter(item, selected) {
                                    return true;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: {
                                text: `资粮：你可以将一张“田”交给[b]{0}[/b]`,
                                values: [
                                    { type: 'player', value: target.playerId },
                                ],
                            },
                        },
                    };
                },
            };
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        async cost(room, data, context) {
            const {
                from,
                cards,
                targets: [to],
            } = context;
            return await room.giveCards({
                from,
                to,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from, cards } = context;
            from.refreshMark = 'mark.tian';
        },
    })
);

dengai.addSkill(tuntian);
dengai.addSkill(jixi);
dengai.addSkill(ziliang);

sgs.loadTranslation({
    ['mark.tian']: '田',
});
