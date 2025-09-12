"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wanjianqifa = void 0;
exports.wanjianqifa = sgs.CardUse({
    name: 'wanjianqifa',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                return from !== item;
            },
            auto: true,
        });
    },
    async onuse(room, data) {
        data.baseDamage = 1;
    },
    async effect(room, target, data) {
        const { from, card, current, baseDamage = 1 } = data;
        const cards = ['shan'];
        let play;
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
                damageType: 0 /* DamageType.None */,
                channel: card,
                isChain: false,
                source: data,
                reason: this.name,
            });
        }
    },
});
sgs.setCardData('wanjianqifa', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    damage: true,
    rhyme: 'a',
});
sgs.loadTranslation({
    ['@wanjianqifa_response']: '万箭齐发：你需要打出一张【闪】，否则受到1点伤害',
    ['@@wanjianqifa_response']: '万箭齐发',
});
