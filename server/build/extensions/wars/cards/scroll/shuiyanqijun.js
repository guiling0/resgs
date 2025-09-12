"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuiyanqijun = exports.shuiyanqijun_choose = void 0;
exports.shuiyanqijun_choose = sgs.TriggerEffect({
    name: 'shuiyanqijun_choose',
    getSelectors(room, context) {
        return {
            choose: () => {
                const skill = context.effect;
                const from = context.from;
                const options = [];
                if (from.hasCanDropCards('e', from, from.getEquipCards().length, skill.name)) {
                    options.push('shuiyan.drop');
                }
                else {
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
exports.shuiyanqijun = sgs.CardUse({
    name: 'shuiyanqijun',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [exports.shuiyanqijun_choose.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return item !== from && item.getEquipCards().length > 0;
            },
        });
    },
    async onuse(room, data) {
        data.baseDamage = 1;
    },
    async effect(room, target, data) {
        const { from, current } = data;
        const s = room.getData('shuiyanqijun_choose');
        const req = await room.doRequest({
            player: current.target,
            get_selectors: {
                selectorId: s.getSelectorName('choose'),
                context: { effect: s, from: current.target },
            },
        });
        const result = room.getResult(req, 'option').result;
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
                damageType: 2 /* DamageType.Thunder */,
                channel: data.card,
                source: data,
                reason: this.name,
            });
        }
    },
});
sgs.setCardData('shuiyanqijun', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'un',
    damage: true,
});
sgs.loadTranslation({
    ['shuiyan.drop']: '弃置装备',
    ['shuiyan.damage']: '受到伤害',
});
