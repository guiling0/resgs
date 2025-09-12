import { GameCard } from '../../../../core/card/card';
import { CardSubType, CardType } from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PlayCardEvent } from '../../../../core/event/types/event.play';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { GamePlayer } from '../../../../core/player/player';
import { TriggerEffect } from '../../../../core/skill/effect';

export const wanjianqifa = sgs.CardUse({
    name: 'wanjianqifa',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                return from !== item;
            },
            auto: true,
        });
    },
    async onuse(room, data: UseCardEvent) {
        data.baseDamage = 1;
    },
    async effect(room, target, data: UseCardEvent) {
        const { from, card, current, baseDamage = 1 } = data;
        const cards = ['shan'];
        let play: PlayCardEvent;
        if (!data.cantResponse.includes(current.target)) {
            play = await room.needPlayCard({
                from: current.target,
                cards,
                source: data,
                reason: this.name,
                reqOptions: {
                    canCancle: true,
                    showMainButtons: true,
                    prompt: '@wanjianqifa_response',
                    thinkPrompt: '@@wanjianqifa_response',
                },
            });
        }
        if (!play) {
            await room.damage({
                from,
                to: current.target,
                number: baseDamage,
                damageType: DamageType.None,
                channel: card,
                isChain: false,
                source: data,
                reason: this.name,
            });
        }
    },
});

sgs.setCardData('wanjianqifa', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    damage: true,
    rhyme: 'a',
});

sgs.loadTranslation({
    ['@wanjianqifa_response']:
        '万箭齐发：你需要打出一张【闪】，否则受到1点伤害',
    ['@@wanjianqifa_response']: '万箭齐发',
});
