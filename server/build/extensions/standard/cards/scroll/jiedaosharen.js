"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiedaosharen = exports.jiedaosharen_choose = void 0;
exports.jiedaosharen_choose = sgs.TriggerEffect({
    name: 'jiedaosharen_choose',
    getSelectors(room, context) {
        const targets = context.targets;
        return {
            target: () => {
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            filter(item, selected) {
                                return selected.length === 0
                                    ? targets.includes(item)
                                    : true;
                            },
                        }),
                    },
                };
            },
        };
    },
});
exports.jiedaosharen = sgs.CardUse({
    name: 'jiedaosharen',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [exports.jiedaosharen_choose.name],
    target(room, from, card) {
        const sha = room.createVirtualCardByNone('sha', undefined, false);
        sha.custom.method = 1;
        sha.custom.skipTimes = true;
        const vdata = sha.vdata;
        return room.createChoosePlayer({
            count: 2,
            filter(item, selected) {
                if (selected.length === 0) {
                    return (from !== item && !!item.getEquip(31 /* EquipSubType.Weapon */));
                }
                if (selected.length === 1) {
                    return selected[0].canUseCard(vdata, [item], 'jiedaosharen', undefined);
                }
                return false;
            },
        });
    },
    async onuse(room, data) {
        const { from } = data;
        const targets = data.targets.slice();
        data.targets.length = 0;
        for (let i = 0;; i += 2) {
            const items = targets.slice(i, 2);
            if (items.length < 2)
                break;
            const target = data.addTarget(items[0]);
            target.subTargets = [items[1]];
            room.directLine(from, items, 3);
        }
    },
    async effect(room, target, data) {
        const { from, card, current, baseDamage = 1, cantResponse } = data;
        const s = room.getData('jiedaosharen_choose');
        const cards = [
            {
                name: 'sha',
                method: 1,
            },
        ];
        if (cantResponse.includes(current.target)) {
            cards.length = 0;
        }
        const use = await room.needUseCard({
            from: current.target,
            cards,
            targetSelector: {
                selectorId: s.getSelectorName('target'),
                context: {
                    targets: current.subTargets,
                },
            },
            source: data,
            reason: this.name,
            reqOptions: {
                canCancle: true,
                prompt: {
                    text: 'jiedaosharen_response',
                    values: [
                        {
                            type: 'player',
                            value: current.subTargets.at(0)?.playerId,
                        },
                        { type: 'player', value: from.playerId },
                    ],
                },
                thinkPrompt: 'jiedaosharen',
            },
        });
        const wuqi = current.target.getEquip(31 /* EquipSubType.Weapon */);
        if (!use && wuqi) {
            await room.giveCards({
                from: current.target,
                to: from,
                cards: [wuqi],
                source: data,
                reason: this.name,
            });
        }
    },
});
sgs.setCardData('jiedaosharen', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'en',
});
sgs.loadTranslation({
    ['jiedaosharen_response']: '借刀杀人：你需要对包含{0}在内的角色使用【杀】。否则将武器牌交给{1}',
});
