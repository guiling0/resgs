"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.juedou = void 0;
exports.juedou = sgs.CardUse({
    name: 'juedou',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from !== item;
            },
        });
    },
    async onuse(room, data) {
        data.baseDamage = 1;
    },
    async effect(room, target, data) {
        const { from, card, current, baseDamage = 1 } = data;
        const response = [];
        response.push(current.target);
        if (current.wushuang.includes(from))
            response.push(current.target);
        response.push(from);
        if (current.wushuang.includes(current.target))
            response.push(from);
        while (true) {
            const player = response.shift();
            response.push(player);
            const tar = player === from ? current.target : from;
            const cards = ['sha'];
            let play;
            if (!data.cantResponse.includes(player)) {
                play = await room.needPlayCard({
                    from: player,
                    cards,
                    source: data,
                    reason: this.name,
                    reqOptions: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: 'juedou_response',
                        thinkPrompt: 'juedou',
                    },
                });
            }
            if (!play) {
                await room.damage({
                    from: tar,
                    to: player,
                    number: baseDamage,
                    damageType: 0 /* DamageType.None */,
                    channel: card,
                    isChain: false,
                    source: data,
                    reason: this.name,
                });
                break;
            }
        }
    },
});
sgs.setCardData('juedou', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 2,
    damage: true,
    rhyme: 'ou',
});
sgs.loadTranslation({
    ['juedou_response']: '决斗：你需要打出一张【杀】，否则受到1点伤害',
});
