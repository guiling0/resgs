import { CardType, CardSubType } from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { TriggerEffect } from '../../../../core/skill/effect';

export const shuiyanqijun_choose = sgs.TriggerEffect({
    name: 'shuiyanqijun_choose',
    getSelectors(room, context) {
        return {
            choose: () => {
                const skill = context.effect;
                const from = context.from;
                const options: string[] = [];
                if (
                    from.hasCanDropCards(
                        'e',
                        from,
                        from.getEquipCards().length,
                        skill.name
                    )
                ) {
                    options.push('shuiyan.drop');
                } else {
                    options.push('!shuiyan.drop');
                }
                options.push('shuiyan.damage');
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: options,
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: `水淹七军：请选择一项`,
                        thinkPrompt: '水淹七军',
                    },
                };
            },
        };
    },
});

export const shuiyanqijun = sgs.CardUse({
    name: 'shuiyanqijun',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    effects: [shuiyanqijun_choose.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return item !== from && item.getEquipCards().length > 0;
            },
        });
    },
    async onuse(room, data: UseCardEvent) {
        data.baseDamage = 1;
    },
    async effect(room, target, data: UseCardEvent) {
        const { from, current } = data;
        const s = room.getData<TriggerEffect>('shuiyanqijun_choose');
        const req = await room.doRequest({
            player: current.target,
            get_selectors: {
                selectorId: s.getSelectorName('choose'),
                context: { effect: s, from: current.target },
            },
        });
        const result = room.getResult(req, 'option').result as string[];
        if (result.includes('shuiyan.drop')) {
            await room.dropCards({
                player: current.target,
                cards: current.target.getEquipCards(),
                source: data,
                reason: this.name,
            });
        }
        if (result.includes('shuiyan.damage')) {
            await room.damage({
                from,
                to: current.target,
                damageType: DamageType.Thunder,
                channel: data.card,
                source: data,
                reason: this.name,
            });
        }
    },
});

sgs.setCardData('shuiyanqijun', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'un',
    damage: true,
});

sgs.loadTranslation({
    ['shuiyan.drop']: '弃置装备',
    ['shuiyan.damage']: '受到伤害',
});
