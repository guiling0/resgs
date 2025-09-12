"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xietianzi = exports.xietianzi_effect = void 0;
exports.xietianzi_effect = sgs.TriggerEffect({
    name: 'xietianzi_effect',
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `挟天子以令诸侯：你可以弃置一张手牌获得一个额外回合`,
                        thinkPrompt: '挟天子',
                    },
                };
            },
        };
    },
    priorityType: 3 /* PriorityType.Card */,
    trigger: "DropPhaseEnd" /* EventTriggers.DropPhaseEnd */,
    audio: [],
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            this.getData('turn') === room.currentTurn);
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        await this.removeSelf();
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.executeExtraTurn(room.createEventData(sgs.DataType.TurnEvent, {
            player: from,
            isExtra: true,
            phases: room.getRatedPhases(),
            skipPhases: [],
            source: undefined,
            reason: this.name,
        }));
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.xietianzi = sgs.CardUse({
    name: 'xietianziyilingzhuhou',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return item === from && item.isBigKingdom();
            },
            auto: true,
        });
    },
    async effect(room, target, data) {
        const { from, current } = data;
        const phase = room.getCurrentPhase();
        if (phase && phase.isOwner(current.target, 4 /* Phase.Play */)) {
            await phase.end();
            const effect = await room.addEffect('xietianzi_effect', current.target);
            effect.setData('turn', room.currentTurn);
        }
    },
});
sgs.setCardData('xietianziyilingzhuhou', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 7,
    rhyme: 'ou',
});
sgs.loadTranslation({ ['xietianzi_effect']: '挟天子以令诸侯' });
