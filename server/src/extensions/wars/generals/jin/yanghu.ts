import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';

export const yanghu = sgs.General({
    name: 'wars.yanghu',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const huaiyuan = sgs.Skill({
    name: 'wars.yanghu.huaiyuan',
});

huaiyuan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                room.sameAsKingdom(player, data.executor)
            );
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const options = [
                        'huaiyuan.range',
                        'huaiyuan.maxhand',
                        'huaiyuan.sha',
                    ];
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: options,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: {
                                text: `是否发动技能怀远，令{0}获得一个效果`,
                                values: [
                                    { type: 'player', value: target.playerId },
                                ],
                            },
                            thinkPrompt: '怀远',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                targets: [player],
            } = context;
            const result = context.req_result.results.option.result.at(0);
            if (result) {
                const effct = await room.addEffect(result, player);
                effct?.setData('turn', room.currentTurn);
            }
            return true;
        },
    })
);

export const huaiyuan_range = sgs.StateEffect({
    name: 'huaiyuan.range',
    mark: ['mark.huaiyuan.range'],
    [StateEffectType.Range_Correct](from) {
        if (this.isOwner(from)) return 1;
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const huaiyuan_maxhand = sgs.StateEffect({
    name: 'huaiyuan.maxhand',
    mark: ['mark.huaiyuan.maxhand'],
    [StateEffectType.MaxHand_Correct](from) {
        if (this.isOwner(from)) return 1;
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const huaiyuan_sha = sgs.StateEffect({
    name: 'huaiyuan.sha',
    mark: ['mark.huaiyuan.sha'],
    [StateEffectType.TargetMod_CorrectTime](from, card, target) {
        if (this.isOwner(from) && card.name === 'sha') return 1;
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const fushou = sgs.Skill({
    name: 'wars.yanghu.fushou',
});

fushou.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.IgnoreHeadAndDeputy](skill) {
            return skill.room.sameAsKingdom(skill.player, this.player);
        },
    })
);

yanghu.addSkill(huaiyuan);
yanghu.addSkill(fushou);

sgs.loadTranslation({
    ['huaiyuan.range']: '攻击范围+1',
    ['huaiyuan.maxhand']: '手牌上限+1',
    ['huaiyuan.sha']: '杀次数+1',
    ['mark.huaiyuan.range']: '怀远[攻击范围]',
    ['mark.huaiyuan.maxhand']: '怀远[手牌上限]',
    ['mark.huaiyuan.sha']: '怀远[杀次数]',
});
