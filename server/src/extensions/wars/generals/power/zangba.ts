import { CardSuit } from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import {
    NeedUseCardData,
    UseCardEvent,
} from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import { PriorityType } from '../../../../core/skill/skill.types';

export const zangba = sgs.General({
    name: 'wars.zangba',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const renxia = sgs.Skill({
    name: 'wars.zangba.renxia',
});

renxia.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        can_trigger(room, player, data: NeedUseCardData) {
            if (this.isOwner(player) && data.has('tiesuolianhuan')) {
                const phase = room.getCurrentPhase();
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    phase
                );
                return phase.isOwner(player, Phase.Play) && uses.length < 1;
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const tiesuo = room.createVirtualCardByNone(
                        'tiesuolianhuan',
                        undefined,
                        false
                    );
                    tiesuo.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.suit === CardSuit.Spade;
                                },
                                onChange(type, item) {
                                    if (type === 'add') tiesuo.addSubCard(item);
                                    if (type === 'remove')
                                        tiesuo.delSubCard(item);
                                    tiesuo.set();
                                    this._use_or_play_vcard = tiesuo;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `捍御：你可以将一张黑桃手牌当【铁索连环】使用`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            return true;
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            await data.exec();
            await room.chain({
                player: from,
                to_state: true,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const hengjiang = sgs.Skill({
    name: 'wars.zangba.hengjiang',
});

hengjiang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                data.damageType !== DamageType.None &&
                player.chained
            );
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
                                    return item !== from && item.chained;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `横江：你可以选择一名处于铁索连环的角色，解除他的铁索连环状态并移除他的副将`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [player],
            } = context;
            await room.chain({
                player,
                to_state: false,
                source: data,
                reason: this.name,
            });
            if (room.differentAsKingdom(from, player)) {
                await room.remove({
                    player,
                    general: player.deputy,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

zangba.addSkill(renxia);
zangba.addSkill(hengjiang);
