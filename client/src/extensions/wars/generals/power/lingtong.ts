import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';

export const lingtong = sgs.General({
    name: 'wars.lingtong',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const xuanlue = sgs.Skill({
    name: 'wars.lingtong.xuanlue',
});

xuanlue.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return this.isOwner(player) && data.has_lose(player, 'e');
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
                                    return (
                                        item !== from &&
                                        item.hasCanDropCards(
                                            'he',
                                            from,
                                            1,
                                            self.name
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `旋略：你可以弃置其他角色的一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '旋略',
                                    timebar: room.responseTime,
                                    prompt: '旋略：请选择一张牌',
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
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const yongjin = sgs.Skill({
    name: 'wars.lingtong.yongjin',
});

yongjin.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Limit],
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `勇进：你可以移动场上至多三张装备牌`,
                    });
                },
            };
        },
        async effect(room, data, context) {
            const { from } = context;
            for (let i = 0; i < 3; i++) {
                await room.moveFiled(
                    from,
                    'e',
                    {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: {
                            text: '@yongjin',
                            values: [{ type: 'number', value: 3 - i }],
                        },
                        thinkPrompt: this.name,
                    },
                    data,
                    this.name
                );
            }
        },
    })
);

lingtong.addSkill('wars.lingtong.xuanlue');
lingtong.addSkill('wars.lingtong.yongjin');

sgs.loadTranslation({
    ['@yongjin']: '勇进：你可以移动场上至多三张装备牌（还剩{0}次）',
});
