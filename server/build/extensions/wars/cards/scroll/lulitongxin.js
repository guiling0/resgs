"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lulitongxin = void 0;
exports.lulitongxin = sgs.CardUse({
    name: 'lulitongxin',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                if (selected.length === 0) {
                    return item.isBigKingdom() || item.isSmallKingdom();
                }
                else {
                    if (selected[0].isBigKingdom()) {
                        return item.isBigKingdom();
                    }
                    if (selected[0].isSmallKingdom()) {
                        return item.isSmallKingdom();
                    }
                }
            },
            onChange(type, item, selected) {
                if (type === 'add' && selected.length === 1) {
                    this.selectors.target.auto_func();
                    this.options.prompt = `选择一名角色，根据他的势力让大势力或小势力的所有角色横置（当前选择：${selected[0].isBigKingdom() ? '大势力' : '小势力'}）`;
                }
            },
        });
    },
    async effect(room, target, data) {
        const { from, current } = data;
        const chain = await room.chain({
            player: current.target,
            to_state: true,
            source: data,
            reason: this.name,
        });
        if (!chain) {
            await room.drawCards({
                player: current.target,
                source: data,
                reason: this.name,
            });
        }
    },
});
sgs.setCardData('lulitongxin', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'in',
});
