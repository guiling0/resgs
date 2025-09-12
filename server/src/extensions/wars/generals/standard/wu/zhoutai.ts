import { GameCard } from '../../../../../core/card/card';
import { CardPut } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { DyingEvent } from '../../../../../core/event/types/event.die';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType, SkillTag } from '../../../../../core/skill/skill.types';

export const zhoutai = sgs.General({
    name: 'wars.zhoutai',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const buqu = sgs.Skill({
    name: 'wars.zhoutai.buqu',
});

buqu.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.Dying,
        can_trigger(room, player, data: DyingEvent) {
            return this.isOwner(player) && data.player === player;
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(1);
            await room.showCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            await room.puto({
                player: from,
                cards,
                toArea: from.upArea,
                source: data,
                movetype: CardPut.Up,
                reason: this.name,
            });
            cards.forEach((v) => v.setMark(this.name, true));
            from.setMark(this.name, true, {
                visible: true,
                source: this.name,
                type: 'cards',
                areaId: from.upArea.areaId,
            });
            return cards.at(0);
        },
        async effect(room, data, context) {
            const { from } = context;
            const card = context.cost as GameCard;
            const same = from.upArea.cards.find(
                (v) =>
                    v !== card &&
                    v.hasMark(this.name) &&
                    v.number === card.number
            );
            if (same) {
                await room.puto({
                    player: from,
                    cards: [card],
                    toArea: room.discardArea,
                    source: data,
                    movetype: CardPut.Up,
                    reason: this.name,
                });
                from.refreshMark = this.name;
            }
            if (!same) {
                await room.recoverTo({
                    player: from,
                    number: 1,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const fenji = sgs.Skill({
    name: 'wars.zhoutai.fenji',
});

fenji.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && !data.executor.hasHandCards()) {
                const lose = room.createEventData(sgs.DataType.LoseHpEvent, {
                    player,
                    number: 1,
                    source: data,
                    reason: this.name,
                });
                return lose.check();
            }
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.losehp({
                player: from,
                number: 1,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                targets: [target],
            } = context;
            await room.drawCards({
                player: target,
                count: 2,
                source: data,
                reason: this.name,
            });
        },
    })
);

zhoutai.addSkill(buqu);
zhoutai.addSkill(fenji);
