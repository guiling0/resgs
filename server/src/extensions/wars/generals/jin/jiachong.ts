import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { MoveCardReason } from '../../../../core/room/room.types';
import { TriggerEffect } from '../../../../core/skill/effect';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';

export const jiachong = sgs.General({
    name: 'wars.jiachong',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const chujue = sgs.Skill({
    name: 'wars.jiachong.chujue',
});

chujue.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (this.isOwner(player) && data.from === player && this.isOpen()) {
                const target = data.current.target;
                return room.playerDeads.some((v) =>
                    room.sameAsKingdom(v, target)
                );
            }
        },
        async cost(room, data: UseCardEvent, context) {
            return await data.targetCantResponse([data.current.target]);
        },
    })
);

chujue.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
            const room = this.room;
            if (!target) return this.isOwner(from);
            return (
                this.isOwner(from) &&
                target &&
                room.playerDeads.some((v) => room.sameAsKingdom(v, target))
            );
        },
    })
);

export const jianzhi = sgs.Skill({
    name: 'wars.jiachong.jianzhi',
});

jianzhi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.CauseDamage2,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                player === data.from &&
                data.to &&
                data.number >= data.to.hp &&
                player.hasCanDropCards('h', player, 1, this.name)
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.dropCards({
                player: from,
                cards: from.getHandCards(),
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            if (!from.getData('chujue.tripleReward')) {
                const effect = await room.addEffect(
                    'wars.chujue.tripleReward',
                    from
                );
                from.setData('chujue.tripleReward', effect);
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data) {
                    const effect = this.player.getData<TriggerEffect>(
                        'chujue.tripleReward'
                    );
                    if (effect) {
                        await effect.removeSelf();
                    }
                },
            },
        ],
    })
);

export const tripleReward = sgs.TriggerEffect({
    name: 'wars.chujue.tripleReward',
    trigger: EventTriggers.MoveCardBefore2,
    can_trigger(room, player, data: MoveCardEvent) {
        return (
            this.isOwner(player) &&
            data.reason === 'reward' &&
            data.filter((d) => d.reason === MoveCardReason.Draw).length > 0
        );
    },
    async cost(room, data: MoveCardEvent, context) {
        const { from } = context;
        from.removeData('chujue.tripleReward');
        await this.removeSelf();
        const datas = data.filter((v) => v.reason === MoveCardReason.Draw);
        const length = datas.length;
        for (let i = 0; i < length; i++) {
            const data = datas[i];
            const count = data.cards.length;
            const cards = await room.getNCards(count * 3);
            data.cards.length = 0;
            data.cards.push(...cards);
        }
        return true;
    },
});

jiachong.addSkill(chujue);
jiachong.addSkill(jianzhi);
