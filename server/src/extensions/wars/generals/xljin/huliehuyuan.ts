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
            
            // 如果是检查阶段或者玩家不是技能拥有者，不提供无限杀效果
            if (!this.isOwner(from)) return false;
            
            // 如果是特殊检查阶段或没有目标，也返回true
            if (!target || card.custom.check) return true;
            
            // 检查是否为杀
            if (card.name !== 'sha') return false;
            
            // 火杀 - 无限出杀
            if (card.hasAttr(CardAttr.Fire)) return true;
            // 雷杀 - 不能无线出杀
            if (card.hasAttr(CardAttr.Thunder)) return false;
            
            // 检查玩家是否装备了朱雀羽扇(id为31是武器槽)
            const weapon = from.getEquip(31);
            if (weapon && weapon.name === 'zhuqueyushan') {
                // 如果装备了朱雀羽扇，所有杀都视为能无限次使用
                return true;
            }
            
            return false;
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
