import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';

export const simalun = sgs.General({
    name: 'wars.simalun',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const zhulan = sgs.Skill({
    name: 'wars.simalun.zhulan',
});

zhulan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.CauseDamage1,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.from &&
                room.sameAsKingdom(data.from, data.to) &&
                player.hasCanDropCards('he', player, 1, this.name)
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `助澜：你可以弃置一张牌令伤害+1`,
                            thinkPrompt: `助澜`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: DamageEvent, context) {
            data.number += 1;
        },
    })
);

export const luanchang = sgs.Skill({
    name: 'wars.simalun.luanchang',
});

luanchang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Limit],
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.TurnEnd,
        can_trigger(room, player, data: TurnEvent) {
            if (this.isOwner(player)) {
                const damages = room.getHistorys(
                    sgs.DataType.DamageEvent,
                    (v) => room.sameAsKingdom(v.to, player) && v.to.alive,
                    data
                );
                return (
                    damages.length > 0 &&
                    data.player.canUseCard(
                        room.createVirtualCard(
                            'wanjianqifa',
                            data.player.getHandCards(),
                            undefined,
                            true,
                            false
                        ).vdata,
                        undefined,
                        this.name
                    )
                );
            }
        },
        context(room, player, data: TurnEvent) {
            return {
                targets: [data.player],
            };
        },
        async cost(room, data, context) {
            const {
                targets: [target],
            } = context;
            return await room.preUseCard({
                from: target,
                card: room.createVirtualCard(
                    'wanjianqifa',
                    target.getHandCards(),
                    undefined,
                    true,
                    false
                ),
                source: data,
                reason: this.name,
                transform: this,
            });
        },
    })
);

simalun.addSkill(zhulan);
simalun.addSkill(luanchang);
