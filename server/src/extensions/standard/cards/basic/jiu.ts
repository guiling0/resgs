import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { StateEffectType } from '../../../../core/skill/skill.types';

export const jiu = sgs.CardUse({
    name: 'jiu',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    timeCondition(room, from, card) {
        return 1;
    },
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from === item;
            },
            auto: true,
        });
    },
    async onuse(room, data: UseCardEvent) {
        const { from, card, source } = data;
        const pass = room
            .getStates(StateEffectType.TargetMod_PassCountingTime, [
                from,
                card,
                undefined,
            ])
            .some((v) => v);
        if (!pass) {
            from.increaseMark('__jiu_times', 1);
        }
    },
    async effect(room, target, data: UseCardEvent) {
        const { current } = data;
        current.target.setProperty('jiuState', current.target.jiuState + 1);
    },
});

export const jiu2 = sgs.CardUse({
    name: 'jiu',
    method: 2,
    trigger: EventTriggers.Dying,
    condition(room, from, card, data) {
        return (
            data.is(sgs.DataType.DyingEvent) &&
            data.player === from &&
            data.player.hp <= 0
        );
    },
    prompt(room, from, card, context) {
        if (context.prompt) return context.prompt;
        else return {};
    },
    target(room, from, card) {
        const max = Math.max(...room.players.map((v) => v.indying));
        const player = room.players.find((v) => v.indying === max);
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from === item && item === player && item.hp <= 0;
            },
            auto: true,
        });
    },
    async onuse(room, data: UseCardEvent) {
        data.baseRecover = 1;
    },
    async effect(room, target, data: UseCardEvent) {
        const { current, baseRecover = 1 } = data;
        await room.recoverhp({
            player: current.target,
            number: baseRecover,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('jiu', {
    type: CardType.Basic,
    subtype: CardSubType.Basic,
    recover: true,
    rhyme: 'iu',
});
