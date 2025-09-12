import { GameCard } from '../../../../core/card/card';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import { SkillTag } from '../../../../core/skill/skill.types';

export const cs_sunzhang = sgs.General({
    name: 'cs_sunzhang',
    kingdom: 'qun',
    hp: 1,
    gender: Gender.Male,
    enable: false,
    hidden: true,
});

export const zimou = sgs.Skill({
    name: 'cs_sunzhang.zimou',
});

zimou.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseEvent) {
            if (this.isOwner(player) && data.from === player) {
                const phase = room.getCurrentPhase();
                if (!phase.isOwner(player, Phase.Play)) return false;
                const uses = room
                    .getPeriodHistory(room.currentTurn)
                    .filter((v) => {
                        return (
                            (v.data.is(sgs.DataType.UseCardEvent) ||
                                v.data.is(sgs.DataType.UseCardToCardEvent)) &&
                            v.data.from === player
                        );
                    }).length;
                return uses === 2 || uses === 4 || uses === 6;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            const uses = room.getPeriodHistory(room.currentTurn).filter((v) => {
                return (
                    (v.data.is(sgs.DataType.UseCardEvent) ||
                        v.data.is(sgs.DataType.UseCardToCardEvent)) &&
                    v.data.from === from
                );
            }).length;

            let cards: GameCard[];
            if (uses === 2) {
                cards = room.drawArea.get(
                    1,
                    sgs.DataType.GameCard,
                    'top',
                    (v) => v.name === 'jiu'
                );
            }
            if (uses === 4) {
                cards = room.drawArea.get(
                    1,
                    sgs.DataType.GameCard,
                    'top',
                    (v) => v.name === 'sha'
                );
            }
            if (uses === 6) {
                cards = room.drawArea.get(
                    1,
                    sgs.DataType.GameCard,
                    'top',
                    (v) => v.name === 'juedou'
                );
            }
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            return true;
        },
    })
);

cs_sunzhang.addSkill(zimou);
