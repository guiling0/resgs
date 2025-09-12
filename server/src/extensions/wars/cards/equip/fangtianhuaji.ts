import { GameCard } from '../../../../core/card/card';
import {
    CardType,
    CardSubType,
    VirtualCardData,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const fangtianhuaji = sgs.CardUseEquip({
    name: 'fangtianhuaji',
});

sgs.setCardData('fangtianhuaji', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'i',
});

export const fangtian_skill = sgs.Skill({
    name: 'fangtianhuaji',
    attached_equip: 'fangtianhuaji',
});

fangtian_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 4;
            }
        },
    })
);

fangtian_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'fangtianhuaji_skill',
        audio: ['fangtianhuaji'],
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.ChooseTarget,
        getSelectors(room, context) {
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
                                count: [1, -1],
                                filter(item, selected) {
                                    return (
                                        sha &&
                                        !targets.includes(item) &&
                                        [...targets, ...selected].every((v) =>
                                            room.isOtherKingdom(v, item)
                                        ) &&
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
                            prompt: `方天画戟：你可以令任意名不包含相同势力的角色成为此【杀】的目标`,
                            thinkPrompt: `方天画戟`,
                        },
                    };
                },
            };
        },
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
        async cost(room, data: UseCardEvent, context) {
            const { targets } = context;
            return await data.becomTarget(targets);
        },
        async effect(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('fangtian.delay', from);
            effect.setData('data', data);
        },
    })
);

export const fangtian_delay = sgs.TriggerEffect({
    name: 'fangtian.delay',
    priorityType: PriorityType.Equip,
    trigger: EventTriggers.BeOffset,
    can_trigger(room, player, data: UseCardEvent) {
        if (this.isOwner(player) && this.getData('data') === data) {
            const _data = data.current;
            return (
                _data &&
                _data.offset &&
                _data.offset.is(sgs.DataType.UseCardToCardEvent) &&
                _data.offset.card?.name === 'shan'
            );
        }
    },
    async cost(room, data: UseCardEvent, context) {
        await this.removeSelf();
        data.targetList.forEach((v) => (v.invalid = true));
        return true;
    },
    lifecycle: [
        {
            trigger: EventTriggers.UseCardEnd3,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
