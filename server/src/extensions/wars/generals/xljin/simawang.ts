import { AreaType } from '../../../../core/area/area.type';
import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DieEvent } from '../../../../core/event/types/event.die';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { Gender } from '../../../../core/general/general.type';
import { MoveCardReason } from '../../../../core/room/room.types';
import { SkillTag } from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const simawang = sgs.General({
    name: 'xl.simawang',
    kingdom: 'jin',
    hp: 2.5,
    gender: Gender.Male,
    isWars: true,
});

export const weisu = sgs.Skill({
    name: 'xl.simawang.weisu',
});

weisu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_filter(
                    (d, c) =>
                        (d.fromArea.type === AreaType.Hand ||
                            d.fromArea.type === AreaType.Equip) &&
                        d.player !== d.fromArea.player &&
                        room.sameAsKingdom(d.fromArea.player, player) &&
                        (d.reason === MoveCardReason.DisCard ||
                            d.reason === MoveCardReason.Obtain)
                )
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: MoveCardEvent, context) {
            const { from } = context;
            const cards = data.getCards(
                (d, c) =>
                    (d.fromArea.type === AreaType.Hand ||
                        d.fromArea.type === AreaType.Equip) &&
                    d.player !== d.fromArea.player &&
                    room.sameAsKingdom(d.fromArea.player, from) &&
                    (d.reason === MoveCardReason.DisCard ||
                        d.reason === MoveCardReason.Obtain)
            );
            await data.cancle(cards);
        },
    })
);

export const linlian = sgs.Skill({
    name: 'xl.simawang.linlian',
});

linlian.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.Death,
        can_trigger(room, player, data: DieEvent) {
            return this.isOwner(player) && data.player === player;
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.removeCard({
                player: from,
                cards: from.getSelfCards(),
                puttype: CardPut.Up,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
    })
);

linlian.addEffect(sgs.copy(eyes_reserve));

simawang.addSkill(weisu);
simawang.addSkill(linlian);
