import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { TurnEvent } from '../../../../core/event/types/event.turn';
import { UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';

export const yanghuiyu = sgs.General({
    name: 'wars.yanghuiyu',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const ciwei = sgs.Skill({
    name: 'wars.yanghuiyu.ciwei',
});

ciwei.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseEvent) {
            if (
                this.isOwner(player) &&
                data.from &&
                player !== data.from &&
                player.inturn
            ) {
                return !!room
                    .getPeriodHistory(room.currentTurn)
                    .findLast((v) => {
                        return (
                            (v.data.is(sgs.DataType.UseCardEvent) ||
                                v.data.is(sgs.DataType.UseCardToCardEvent) ||
                                v.data.is(sgs.DataType.PlayCardEvent)) &&
                            v.data.from !== data.from &&
                            v.data.from !== player &&
                            v.data.from.alive &&
                            room.isOtherKingdom(data.from, v.data.from)
                        );
                    });
            }
        },
        context(room, player, data: UseEvent) {
            return {
                targets: [data.from],
            };
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
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `慈威：你可以弃置一张牌，令此牌失效`,
                            this: '慈威',
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
        async effect(room, data, context) {
            data.isEnd = true;
        },
    })
);

export const caiyuan = sgs.Skill({
    name: 'wars.yanghuiyu.caiyuan',
});

caiyuan.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.TurnStarted,
        can_trigger(room, player, data: TurnEvent) {
            if (
                this.isOwner(player) &&
                data.player === player &&
                !player.hasNoneOpen() &&
                this.skill
            ) {
                const opens = room.getHistorys(
                    sgs.DataType.OpenEvent,
                    (v) => v.generals.includes(this.skill.sourceGeneral),
                    data
                );
                return opens.length === 0;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                count: 2,
                source: data,
                reason: this.name,
            });
        },
    })
);

caiyuan.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                !player.hasNoneOpen() &&
                this.skill &&
                this.skill.sourceGeneral
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.close({
                player: from,
                generals: [this.skill.sourceGeneral],
                source: data,
                reason: this.name,
            });
        },
    })
);

yanghuiyu.addSkill(ciwei);
yanghuiyu.addSkill(caiyuan);
