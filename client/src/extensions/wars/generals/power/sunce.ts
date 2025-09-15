import { CardColor } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PindianEvent } from '../../../../core/event/types/event.pindian';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Skill } from '../../../../core/skill/skill';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';
import { reduce_yinyangyu } from '../../rules';
import { yinghun } from '../standard/wu/sunjian';
import { yingzi } from '../standard/wu/zhouyu';

export const sunce = sgs.General({
    name: 'wars.sunce',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const jiang = sgs.Skill({
    name: 'wars.sunce.jiang',
});

jiang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.card &&
                ((data.card.name === 'sha' &&
                    data.card.color === CardColor.Red) ||
                    data.card.name === 'juedou') &&
                data.isFirstTarget
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

jiang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.current.target === player &&
                data.card &&
                ((data.card.name === 'sha' &&
                    data.card.color === CardColor.Red) ||
                    data.card.name === 'juedou')
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const yingyang = sgs.Skill({
    name: 'wars.sunce.yingyang',
});

yingyang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.PindianShow,
        can_trigger(room, player, data: PindianEvent) {
            return this.isOwner(player) && data.cards.get(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: ['+3', '-3'],
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: `是否发动鹰扬：修改你拼点牌的点数`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data: PindianEvent, context) {
            const { from } = context;
            const result = context.req_result.results.option.result.at(
                0
            ) as string;
            const card = data.cards.get(from);
            if (result && card) {
                const effect = await room.addEffect('yingyang.delay', from);
                effect.setMark('card', card.id);
                effect.setMark('update', result);
                effect.setData('data', data);
            }
        },
    })
);

export const yingyang_delay = sgs.StateEffect({
    name: 'yingyang.delay',
    [StateEffectType.Regard_CardData](
        card,
        property: 'number',
        source: number
    ) {
        if (property !== 'number') return;
        const id = this.getMark<string>('card');
        if (card.id !== id) return;
        const update = this.getMark<string>('update');
        if (update === '+3') {
            const change = source + 3;
            return change > 13 ? 13 : change;
        }
        if (update === '-3') {
            const change = source - 3;
            return change < 1 ? 1 : change;
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.PindianEnd,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const hunshang = sgs.Skill({
    name: 'wars.sunce.hunshang',
});

hunshang.addEffect(
    sgs.copy(reduce_yinyangyu, { tag: [SkillTag.Deputy, SkillTag.Secret] })
);

hunshang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Deputy],
        auto_log: 1,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) && data.isOwner(player) && player.hp === 1
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const skills: Skill[] = [];
            skills.push(
                await room.addSkill('wars.sunce.yingzi', from, {
                    source: this.name,
                    showui: 'default',
                })
            );
            skills.push(
                await room.addSkill('wars.sunce.yinghun', from, {
                    source: this.name,
                    showui: 'default',
                })
            );
            this.setData('skills', skills);
            this.setData('data', room.currentTurn);
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data) {
                    if (this.getData('data') === data) {
                        const skills = this.getData<Skill[]>('skills');
                        if (skills) {
                            for (const skill of skills) {
                                if (skill) {
                                    await skill.removeSelf();
                                }
                            }
                        }
                    }
                },
            },
        ],
    })
);

export const yingzi_sunce = sgs.Skill(
    sgs.copy(yingzi, { name: 'wars.sunce.yingzi' })
);

export const yinghun_sunce = sgs.Skill(
    sgs.copy(yinghun, { name: 'wars.sunce.yinghun' })
);

sunce.addSkill(jiang);
sunce.addSkill(yingyang);
sunce.addSkill(hunshang);
sunce.addSkill('#wars.sunce.yingzi');
sunce.addSkill('#wars.sunce.yinghun');
