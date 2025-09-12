"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chiling = exports.chiling_exec = exports.chiling_effect = void 0;
exports.chiling_effect = sgs.TriggerEffect({
    name: 'chiling_effect',
    getSelectors(room, context) {
        const from = context.from;
        return {
            choose: () => {
                const handles = context.handles;
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
                                return item.type === 3 /* CardType.Equip */;
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
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return ((!data.source.is(sgs.DataType.UseCardEvent) ||
            data.source.card?.name !== 'chiling') &&
            data.has_filter((v, c) => c.name === 'chiling' && v.toArea === room.discardArea));
    },
    async cost(room, data, context) {
        let chiling = data.getCard((v, c) => c.name === 'chiling' && v.toArea === room.discardArea);
        if (chiling) {
            data.update([chiling], {
                toArea: room.treasuryArea,
                reason: 1 /* MoveCardReason.PutTo */,
                movetype: 1 /* CardPut.Up */,
                puttype: 1 /* CardPut.Up */,
                animation: true,
            });
        }
        return true;
    },
});
exports.chiling_exec = sgs.TriggerEffect({
    name: 'chiling_exec',
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
    can_trigger(room, player, data) {
        return !!room.treasuryArea.cards.find((v) => v.name === 'chiling' && v.put === 1 /* CardPut.Up */);
    },
    async cost(room, data, context) {
        let chiling = room.treasuryArea.cards.find((v) => v.name === 'chiling' && v.put === 1 /* CardPut.Up */);
        if (chiling) {
            chiling.put = 2 /* CardPut.Down */;
            const players = room.playerAlives.filter((v) => v.isNoneKingdom());
            room.sortResponse(players);
            while (players.length > 0) {
                await chilingEffect(room, players.shift(), data);
            }
        }
        return true;
    },
});
exports.chiling = sgs.CardUse({
    name: 'chiling',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [exports.chiling_effect.name, exports.chiling_exec.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                return item.isNoneKingdom();
            },
            auto: true,
        });
    },
    async effect(room, target, data) {
        const { current } = data;
        await chilingEffect(room, current.target, data);
    },
});
async function chilingEffect(room, player, data) {
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
    const handles = [];
    handles.push(`${openHead.check() ? '' : '!'}openHead`);
    handles.push(`${openDeputy.check() ? '' : '!'}openDeputy`);
    if (player
        .getSelfCards()
        .find((v) => v.type === 3 /* CardType.Equip */ &&
        player.canDropCard(v, 'chiling'))) {
        handles.push(`chiling.drop`);
    }
    else {
        handles.push(`!chiling.drop`);
    }
    if (player.hp > 0) {
        handles.push(`chiling.losehp`);
    }
    else {
        handles.push(`!chiling.losehp`);
    }
    if (handles.every((v) => v.at(0) === '!')) {
        return;
    }
    const s = room.getData('chiling_effect');
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
    const result = room.getResult(req, 'option').result;
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
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 2,
    rhyme: 'ing',
});
sgs.loadTranslation({
    ['chiling.drop']: '弃置装备',
    ['chiling.losehp']: '失去体力',
});
