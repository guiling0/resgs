import { CardType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import {
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const pangde = sgs.General({
    name: 'wars.pangde',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const mashu = sgs.Skill({
    name: 'wars.pangde.mashu',
});

mashu.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Distance_Correct](from, to) {
            if (this.isOwner(from)) {
                return -1;
            }
        },
    })
);

export const jianchu = sgs.Skill({
    name: 'wars.pangde.jianchu',
});

jianchu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                player === data.from &&
                data.card &&
                data.card.name === 'sha' &&
                data.current.target.hasCanDropCards('he', player, 1, this.name)
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '鞬出',
                                    timebar: room.responseTime,
                                    prompt: '鞬出：请选择一张牌',
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
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            context.cards = cards;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: UseCardEvent, context) {
            const { cards, targets } = context;
            const card = cards.at(0);
            if (card && card.type === CardType.Equip) {
                await data.targetCantResponse(targets);
            } else {
                await room.obtainCards({
                    player: targets.at(0),
                    cards: data.card.subcards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

pangde.addSkill(mashu);
pangde.addSkill(jianchu);
