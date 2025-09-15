import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { GamePlayer } from '../../../../core/player/player';
import { TriggerEffect } from '../../../../core/skill/effect';
import { StateEffectType } from '../../../../core/skill/skill.types';

export const diaohulishan = sgs.CardUse({
    name: 'diaohulishan',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, 2],
            filter(item, selected) {
                return item !== from;
            },
        });
    },
    async effect(room, target, data: UseCardEvent) {
        const { current } = data;
        const effect = await room.addEffect(
            'diaohulishan.state',
            current.target
        );
        effect.setData('turn', room.currentTurn);
    },
});

export const diaohulishan_state = sgs.StateEffect({
    name: 'diaohulishan.state',
    [StateEffectType.NotCalcDistance](from) {
        return this.isOwner(from);
    },
    [StateEffectType.NotCalcSeat](from) {
        return this.isOwner(from);
    },
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        return this.isOwner(from) || this.isOwner(target as GamePlayer);
    },
    lifecycle: [
        {
            trigger: EventTriggers.onObtain,
            async on_exec(room, data) {
                this.player.setProperty('indiaohu', true);
            },
        },
        {
            trigger: EventTriggers.onLose,
            async on_exec(room, data) {
                this.player.setProperty('indiaohu', false);
            },
        },
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

sgs.setCardData('diaohulishan', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'an',
});

sgs.loadTranslation({
    [diaohulishan_state.name]: '调虎离山',
});
