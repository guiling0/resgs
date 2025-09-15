import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { PindianEvent } from '../../../../../core/event/types/event.pindian';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType, SkillTag } from '../../../../../core/skill/skill.types';

export const zhurong = sgs.General({
    name: 'wars.zhurong',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Female,
    isWars: true,
});

export const juxiang = sgs.Skill({
    name: 'wars.zhurong.juxiang',
});

juxiang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.CardEffectStart,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card.name === 'nanmanruqin' &&
                data.current.target === player
            );
        },
        async cost(room, data: UseCardEvent, context) {
            return await data.invalidCurrent();
        },
    })
);

juxiang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.UseCardEnd3,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card.name === 'nanmanruqin' &&
                data.from !== player &&
                data.card.hasSubCards()
            );
        },
        async cost(room, data: UseCardEvent, context) {
            const { from } = context;
            return await room.obtainCards({
                player: from,
                cards: data.card.subcards,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const lieren = sgs.Skill({
    name: 'wars.zhurong.lieren',
});

lieren.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.CauseDamaged,
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '猎刃',
                                    timebar: room.responseTime,
                                    prompt: `猎刃，请选择一张牌`,
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: this.skill.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: DamageEvent) {
            if (
                this.isOwner(player) &&
                data.from === player &&
                data.reason === 'sha' &&
                player.canPindian([data.to])
            ) {
                const source = data.source;
                return (
                    source.is(sgs.DataType.UseCardEvent) &&
                    source.current.target === data.to
                );
            }
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        async cost(room, data, context) {
            const { from, targets } = context;
            return await room.pindian({
                from,
                targets,
                source: data,
                reason: this.name,
                reqOptions: {
                    prompt: 'lieren_pindian',
                    thinkPrompt: this.name,
                },
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const pindian = context.cost as PindianEvent;
            if (pindian.win === from) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

zhurong.addSkill(juxiang);
zhurong.addSkill(lieren);

sgs.loadTranslation({
    ['lieren_pindian']: '烈刃：请选择一张牌拼点',
});
