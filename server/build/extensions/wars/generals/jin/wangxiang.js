"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bingxin = exports.wangxiang = void 0;
exports.wangxiang = sgs.General({
    name: 'wars.wangxiang',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.bingxin = sgs.Skill({
    name: 'wars.wangxiang.bingxin',
});
//当你需要使用本回合未以此法使用过的基本牌时❷，你可获得1枚“冰心”▶你展示所有手牌。若你的手牌数等于你的体力值且{你的所有手牌颜色均相同或你没有手牌}，你可摸一张牌▷你使用无对应实体牌的此牌。
exports.bingxin.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "NeedUseCard2" /* EventTriggers.NeedUseCard2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            const hands = player.getHandCards();
            if (hands.length === player.hp &&
                (!hands.length ||
                    hands.every((v) => v.color === hands[0].color))) {
                const uses = player.getMark(this.name, []);
                return (data.from === player &&
                    room.cardNamesToType
                        .get(1 /* CardType.Basic */)
                        .filter((v) => !uses.includes(v) && data.has(v, 0))
                        .length > 0);
            }
        }
    },
    context(room, player, data) {
        return {
            canuses: data.cards,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const effect = context.effect;
                const from = context.from;
                const uses = from.getMark(effect.name, []);
                const canuses = context.canuses;
                let vcards = [];
                room.cardNamesToType.get(1 /* CardType.Basic */).forEach((v) => {
                    if (!uses.includes(v) &&
                        canuses.find((c) => c.name === v)) {
                        vcards.push(...room.createVData({ name: v }));
                    }
                });
                vcards.forEach((v) => {
                    v.custom.method =
                        canuses.find((c) => c.name === v.name)?.method ?? 1;
                    v.custom.canuse = from.canUseCard(v, undefined, effect.name);
                });
                return {
                    selectors: {
                        card: room.createChooseVCard({
                            step: 1,
                            count: 1,
                            selectable: vcards,
                            filter(item, selected) {
                                return item.custom.canuse;
                            },
                            onChange(type, item) {
                                if (type === 'add') {
                                    this._use_or_play_vcard =
                                        room.createVirtualCardByData(item, false);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `冰心，你可以视为使用一张基本牌`,
                        thinkPrompt: effect.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.showCards({
            player: from,
            cards: from.getHandCards(),
            source: data,
            reason: this.name,
        });
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
        const uses = from.getMark(this.name, []);
        uses.push(data.card.name);
        from.setMark(this.name, uses);
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                this.player.removeMark(this.name);
            },
        },
    ],
}));
exports.wangxiang.addSkill(exports.bingxin);
