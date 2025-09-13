import { CardAttr } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const huliehuyuan = sgs.General({
    name: 'xl.huliehuyuan',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isDualImage: true,
    isWars: true,
});

export const fenmie = sgs.Skill({
    name: 'xl.huliehuyuan.fenmie',
});

fenmie.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const sha = room.createVirtualCardByNone(
                        'sha',
                        undefined,
                        false
                    );
                    sha.set({ attr: [CardAttr.Fire] });
                    sha.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: [sha.vdata],
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByData(
                                                item,
                                                false
                                            );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '焚灭，你可以失去1点体力，视为使用火【杀】',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('sha')
            ) {
                const phase = room.getCurrentPhase();
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    phase
                );
                return phase.isOwner(player, Phase.Play) && uses.length < 1;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const dangpan = sgs.Skill({
    name: 'xl.huliehuyuan.dangpan',
});

dangpan.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
            if (!target || card.custom.check) return this.isOwner(from);
            return (
                this.isOwner(from) &&
                card.name === 'sha' &&
                card.hasAttr(CardAttr.Fire)
            );
        },
    })
);

dangpan.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.CauseDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                (data.to.isYexinjia() || data.to.hasNoneOpen())
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

huliehuyuan.addSkill(fenmie);
huliehuyuan.addSkill(dangpan);
