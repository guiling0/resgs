import { VirtualCardData } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const malong = sgs.General({
    name: 'wars.malong',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const zhuanzhan = sgs.Skill({
    name: 'wars.malong.zhuanzhan',
});

zhuanzhan.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
            const room = this.room;
            if (
                this.isOwner(from) &&
                room.playerAlives.some((v) => v.isNoneKingdom())
            ) {
                return true;
            }
        },
        [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
            const room = this.room;
            if (
                this.isOwner(from) &&
                room.playerAlives.some((v) => v.isNoneKingdom()) &&
                card.name === 'sha' &&
                target &&
                !(target as GamePlayer).isNoneKingdom?.()
            ) {
                return true;
            }
        },
    })
);

//转战播放配音
zhuanzhan.addEffect(
    sgs.TriggerEffect({
        priorityType: PriorityType.None,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseCardEvent) {
            if (this.isOpen() && data.card && data.card.name === 'sha') {
                return (
                    data.from === this.player &&
                    !!data.targets.find((v) => v.isNoneKingdom())
                );
            }
        },
    })
);

export const xunji = sgs.Skill({
    name: 'wars.malong.xunji',
});

xunji.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.ChooseTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card.name === 'sha' &&
                data.from === player
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                sha: data.card.vdata,
                targets: data.targets,
            };
        },
        getSelectors(room, context) {
            const skill = this;
            return {
                skill_cost: () => {
                    const skill = context.effect;
                    const from = context.from;
                    const sha = context.sha as VirtualCardData;
                    const targets = context.targets;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: [1, 2],
                                filter(item, selected) {
                                    return (
                                        sha &&
                                        !targets.includes(item) &&
                                        from.canUseCard(
                                            sha,
                                            [item],
                                            skill.name,
                                            { excluesCardTimesLimit: true }
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `勋济：你可以选择至多两名角色也成为【杀】的目标`,
                            thinkPrompt: `勋济`,
                        },
                    };
                },
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const { targets } = context;
            return await data.becomTarget(targets);
        },
        async effect(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('xunji.delay', from);
            effect.setData('data', data);
        },
    })
);

export const xunji_delay = sgs.TriggerEffect({
    name: 'xunji.delay',
    trigger: EventTriggers.UseCardEnd1,
    can_trigger(room, player, data: UseCardEvent) {
        return this.isOwner(player) && this.getData('data') === data;
    },
    async cost(room, data: UseCardEvent, context) {
        const { from } = context;
        await this.removeSelf();
        const damages = room
            .getHistorys(sgs.DataType.DamageEvent, (v) => v.source === data)
            .map((v) => v.to)
            .filter((v) => v);
        if (
            data.targets.length &&
            data.targets.every((v) => damages.includes(v))
        ) {
            from.reduceMark('__sha_times', 1);
        }
    },
});

malong.addSkill(zhuanzhan);
malong.addSkill(xunji);
