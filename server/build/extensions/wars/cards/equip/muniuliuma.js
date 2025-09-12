"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.muniuliuma_skill = exports.muniuliuma = exports.muniuliuma_lose = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.muniuliuma_lose = sgs.TriggerEffect({
    name: 'muniuliuma_lose',
    auto_log: 1,
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        if (data.has_filter((d, c) => c.name === 'muniuliuma')) {
            const card = data.getCard((d, c) => c.name === 'muniuliuma');
            const move = data.get(card);
            if (!move)
                return false;
            if (move.reason === 9 /* MoveCardReason.Swap */ &&
                move.toArea !== room.processingArea &&
                move.toArea.type !== 92 /* AreaType.Equip */) {
                return true;
            }
            if (move.reason !== 9 /* MoveCardReason.Swap */ &&
                move.toArea.type !== 92 /* AreaType.Equip */) {
                return true;
            }
        }
    },
    async cost(room, data, context) {
        const cards = room.granaryArea.cards.filter((v) => v.hasMark('mark.zi'));
        return await room.puto({
            cards,
            toArea: room.discardArea,
            source: data,
            reason: this.name,
        });
    },
});
exports.muniuliuma = sgs.CardUseEquip({
    name: 'muniuliuma',
});
sgs.setCardData('muniuliuma', {
    type: 3 /* CardType.Equip */,
    subtype: 36 /* CardSubType.Treasure */,
    rhyme: 'a',
});
exports.muniuliuma_skill = sgs.Skill({
    name: 'muniuliuma',
    attached_equip: 'muniuliuma',
});
//①出牌阶段限一次，你可将一张手牌置入仓廪（称为“辎”）▶
// 你可将装备区里的【木牛流马】置入一名其他角色的装备区。
// \n◆“辎”对你可见。\n
// ◆若【木牛流马】于因交换而进行的移动事件中的目标区域不为处理区或一名角色的装备区，或于并非因交换而进行的移动事件中的目标区域不为一名角色的装备区，系统将所有因执行作为此【木牛流马】的装备技能的〖木牛流马①〗的消耗而置入仓廪的“辎”置入弃牌堆。\n
// ②你能如手牌般使用或打出“辎”。
exports.muniuliuma_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
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
                        prompt: `木牛流马：你可以将一张牌放到【木牛流马】下`,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (item !== from &&
                                    !item.getEquip(36 /* EquipSubType.Treasure */));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `木牛流马：你可以将木牛流马移至其他角色的装备区`,
                        thinkPrompt: `木牛流马`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        const put = await room.puto({
            player: from,
            cards,
            toArea: room.granaryArea,
            puttype: 2 /* CardPut.Down */,
            cardVisibles: [from],
            source: data,
            reason: this.name,
        });
        if (put) {
            cards.forEach((v) => v.setMark('mark.zi', true));
            refreshMark(from, true);
        }
        return !!put;
    },
    async effect(room, data, context) {
        const { from } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const target = room.getResultPlayers(req).at(0);
        if (!req.result.cancle && target && this.skill?.sourceEquip) {
            await room.puto({
                player: from,
                cards: [this.skill.sourceEquip],
                toArea: target.equipArea,
                source: data,
                reason: this.name,
            });
        }
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                refreshMark(this.player, true);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                refreshMark(this.player, false);
            },
        },
        {
            trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
            async on_exec(room, data) {
                refreshMark(this.player, true);
            },
        },
    ],
}));
exports.muniuliuma_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.LikeHandToUse](from, card) {
        return this.isOwner(from) && card.hasMark('mark.zi');
    },
    [skill_types_1.StateEffectType.LikeHandToPlay](from, card) {
        return this.isOwner(from) && card.hasMark('mark.zi');
    },
    [skill_types_1.StateEffectType.FieldCardEyes](from, card) {
        return this.isOwner(from) && card.hasMark('mark.zi');
    },
}));
sgs.loadTranslation({
    ['mark.zi']: '辎',
});
function refreshMark(player, visible = true) {
    const room = player.room;
    const cards = room.granaryArea.cards.filter((v) => v.hasMark('mark.zi'));
    player.setMark('mark.zi', cards.length, {
        visible: true,
    });
    if (visible && cards.length > 0) {
        player.setMark('mark.zi', cards.length, {
            visible: true,
        });
    }
    else {
        player.removeMark('mark.zi');
    }
}
