import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const cs_guosheng = sgs.General({
    name: 'cs_guosheng',
    kingdom: 'qun',
    hp: 1,
    gender: Gender.Male,
    enable: false,
    hidden: true,
});

export const niqu = sgs.Skill({
    name: 'cs_guosheng.niqu',
});

niqu.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        getSelectors(room, context) {
            const skill = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `逆取：你可以对一名角色造成1点火焰伤害`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            return await room.damage({
                from,
                to,
                damageType: DamageType.Fire,
                source: data,
                reason: this.name,
            });
        },
    })
);

cs_guosheng.addSkill(niqu);
