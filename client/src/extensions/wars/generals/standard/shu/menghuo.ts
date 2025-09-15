import { CardSuit } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType, SkillTag } from '../../../../../core/skill/skill.types';

export const menghuo = sgs.General({
    name: 'wars.menghuo',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const huoshou = sgs.Skill({
    name: 'wars.menghuo.huoshou',
});

huoshou.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.CardEffectStart,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card.name === 'nanmanruqin' &&
                data.current.target === player
            );
        },
        async cost(room, data: UseCardEvent, context) {
            return await data.invalidCurrent();
        },
    })
);

huoshou.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card.name === 'nanmanruqin' &&
                data.from !== player
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('huoshou.delay', from);
            effect.setData('use', data);
            return true;
        },
    })
);

export const huoshou_delay = sgs.TriggerEffect({
    name: 'huoshou.delay',
    audio: [],
    priorityType: PriorityType.General,
    trigger: EventTriggers.DamageStart,
    can_trigger(room, player, data: DamageEvent) {
        return (
            this.isOwner(player) &&
            data.source === this.getData('use') &&
            data.from !== player
        );
    },
    async cost(room, data: DamageEvent, context) {
        data.from = context.from;
        return true;
    },
    lifecycle: [
        {
            trigger: EventTriggers.UseCardEnd3,
            priority: 'after',
            async on_exec(room, data) {
                if (data === this.getData('use')) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const zaiqi = sgs.Skill({
    name: 'wars.menghuo.zaiqi',
});

zaiqi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.DrawPhaseStartedAfter,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.losshp > 0 &&
                data.ratedDrawnum > 0
            );
        },
        async cost(room, data: PhaseEvent, context) {
            await data.end();
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(from.losshp);
            await room.puto({
                player: from,
                cards,
                toArea: room.processingArea,
                animation: true,
                source: data,
                reason: this.name,
            });
            await room.delay(1);
            const count = cards.filter((v) => v.suit === CardSuit.Heart);
            await room.recoverhp({
                player: from,
                number: count.length,
                source: data,
                reason: this.name,
            });
            await room.puto({
                player: from,
                cards: count,
                toArea: room.discardArea,
                animation: true,
                source: data,
                reason: this.name,
            });
            await room.obtainCards({
                player: from,
                cards: cards.filter(
                    (v) =>
                        v.suit !== CardSuit.Heart &&
                        v.area === room.processingArea
                ),
                source: data,
                reason: this.name,
            });
        },
    })
);

menghuo.addSkill(huoshou);
menghuo.addSkill(zaiqi);
