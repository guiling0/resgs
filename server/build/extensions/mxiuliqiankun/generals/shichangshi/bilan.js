"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.picai = exports.cs_bilan = void 0;
exports.cs_bilan = sgs.General({
    name: 'mobile.cs_bilan',
    kingdom: 'qun',
    hp: 1,
    gender: 1 /* Gender.Male */,
    enable: false,
    hidden: true,
});
exports.picai = sgs.Skill({
    name: 'mobile.cs_bilan.picai',
});
exports.picai.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: `庀材：你可以连续判定直到出现相同花色`,
                });
            },
            choose: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: '庀材：是否继续判定',
                    thinkPrompt: this.name,
                });
            },
            choose_target: () => {
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `庀材：选择一名角色将所有判定牌交给他`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.judge({
            player: from,
            isSucc(result) {
                return true;
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        let judge = context.cost;
        const cards = [];
        if (judge.card.area === room.discardArea) {
            cards.push(judge.card);
        }
        do {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            if (req.result.cancle) {
                break;
            }
            const judge = await room.judge({
                player: from,
                isSucc(result) {
                    return true;
                },
                source: data,
                reason: this.name,
            });
            let same = cards.find((v) => v.suit === judge.card.suit);
            if (judge.card.area === room.discardArea) {
                cards.push(judge.card);
            }
            if (same)
                break;
        } while (true);
        const gains = cards.filter((v) => v.area === room.discardArea);
        if (gains.length) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_target'),
                    context,
                },
            });
            const to = room.getResultPlayers(req).at(0);
            await room.giveCards({
                from,
                to,
                cards: gains,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.cs_bilan.addSkill(exports.picai);
