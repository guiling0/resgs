import {
    CardType,
    CardSubType,
    CardPut,
} from '../../../../core/card/card.types';
import { CustomString } from '../../../../core/custom/custom.type';
import { EventData } from '../../../../core/event/data';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { TurnEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { GamePlayer } from '../../../../core/player/player';
import { GameRoom } from '../../../../core/room/room';
import { MoveCardReason } from '../../../../core/room/room.types';
import { TriggerEffect } from '../../../../core/skill/effect';
import { PriorityType } from '../../../../core/skill/skill.types';

export const chiling_effect = sgs.TriggerEffect({
    name: 'chiling_effect',
    getSelectors(room, context) {
        const from = context.from;
        return {
            choose: () => {
                const handles = context.handles as CustomString[];
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: handles,
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '敕令：请选择一项',
                        thinkPrompt: '敕令',
                    },
                };
            },
            choose_card: () => {
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.type === CardType.Equip;
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: '敕令：请弃置一张装备牌',
                        thinkPrompt: '敕令',
                    },
                };
            },
        };
    },
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.MoveCardBefore2,
    can_trigger(room, player, data: MoveCardEvent) {
        return (
            (!data.source.is(sgs.DataType.UseCardEvent) ||
                data.source.card?.name !== 'chiling') &&
            data.has_filter(
                (v, c) => c.name === 'chiling' && v.toArea === room.discardArea
            )
        );
    },
    async cost(room, data: MoveCardEvent, context) {
        let chiling = data.getCard(
            (v, c) => c.name === 'chiling' && v.toArea === room.discardArea
        );
        if (chiling) {
            data.update([chiling], {
                toArea: room.treasuryArea,
                reason: MoveCardReason.PutTo,
                movetype: CardPut.Up,
                puttype: CardPut.Up,
                animation: true,
            });
        }
        return true;
    },
});

export const chiling_exec = sgs.TriggerEffect({
    name: 'chiling_exec',
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.TurnEnded,
    can_trigger(room, player, data: TurnEvent) {
        return !!room.treasuryArea.cards.find(
            (v) => v.name === 'chiling' && v.put === CardPut.Up
        );
    },
    async cost(room, data: MoveCardEvent, context) {
        let chiling = room.treasuryArea.cards.find(
            (v) => v.name === 'chiling' && v.put === CardPut.Up
        );
        if (chiling) {
            chiling.put = CardPut.Down;
            const players = room.playerAlives.filter((v) => v.isNoneKingdom());
            room.sortResponse(players);
            while (players.length > 0) {
                await chilingEffect(room, players.shift(), data);
            }
        }
        return true;
    },
});

export const chiling = sgs.CardUse({
    name: 'chiling',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    effects: [chiling_effect.name, chiling_exec.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                return item.isNoneKingdom();
            },
            auto: true,
        });
    },
    async effect(room, target, data: UseCardEvent) {
        const { current } = data;
        await chilingEffect(room, current.target, data);
    },
});

async function chilingEffect(
    room: GameRoom,
    player: GamePlayer,
    data: EventData
) {
    const openHead = room.createEventData(sgs.DataType.OpenEvent, {
        player,
        generals: [player.head],
        source: data,
        reason: 'chiling',
    });
    const openDeputy = room.createEventData(sgs.DataType.OpenEvent, {
        player,
        generals: [player.deputy],
        source: data,
        reason: 'chiling',
    });
    const handles: string[] = [];
    handles.push(`${openHead.check() ? '' : '!'}openHead`);
    handles.push(`${openDeputy.check() ? '' : '!'}openDeputy`);
    if (
        player
            .getSelfCards()
            .find(
                (v) =>
                    v.type === CardType.Equip &&
                    player.canDropCard(v, 'chiling')
            )
    ) {
        handles.push(`chiling.drop`);
    } else {
        handles.push(`!chiling.drop`);
    }
    if (player.hp > 0) {
        handles.push(`chiling.losehp`);
    } else {
        handles.push(`!chiling.losehp`);
    }
    if (handles.every((v) => v.at(0) === '!')) {
        return;
    }
    const s = room.getData<TriggerEffect>('chiling_effect');
    const req = await room.doRequest({
        player,
        get_selectors: {
            selectorId: s.getSelectorName('choose'),
            context: {
                from: player,
                handles,
            },
        },
    });
    const result = room.getResult(req, 'option').result as string[];
    if (result.includes('openHead')) {
        await room.open(openHead);
        await room.drawCards({
            player,
            source: data,
            reason: 'chiling',
        });
    }
    if (result.includes('openDeputy')) {
        await room.open(openDeputy);
        await room.drawCards({
            player,
            source: data,
            reason: 'chiling',
        });
    }
    if (result.includes('chiling.drop')) {
        const req = await room.doRequest({
            player,
            get_selectors: {
                selectorId: s.getSelectorName('choose_card'),
                context: {
                    from: player,
                },
            },
        });
        const cards = room.getResultCards(req);
        await room.dropCards({
            player,
            cards,
            source: data,
            reason: 'chiling',
        });
    }
    if (result.includes('chiling.losehp')) {
        await room.losehp({
            player,
            source: data,
            reason: 'chiling',
        });
    }
}

sgs.setCardData('chiling', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 2,
    rhyme: 'ing',
});

sgs.loadTranslation({
    ['chiling.drop']: '弃置装备',
    ['chiling.losehp']: '失去体力',
});
