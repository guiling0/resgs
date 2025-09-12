"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guanxing = exports.kongcheng = exports.zhugeliang = void 0;
function checkYiZhiLevel(room) {
    const yizhi = room.getData('#yizhi');
    return yizhi ? yizhi.isOpen() && yizhi.check() : false;
}
exports.zhugeliang = sgs.General({
    name: 'wars.zhugeliang',
    kingdom: 'shu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.kongcheng = sgs.Skill({
    name: 'wars.zhugeliang.kongcheng',
});
exports.kongcheng.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !player.hasHandCards() &&
            data.current.target === player &&
            (data.card.name === 'sha' || data.card.name === 'juedou'));
    },
    async cost(room, data, context) {
        await data.cancleCurrent();
        return true;
    },
}));
exports.kongcheng.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !player.hasHandCards() &&
            data.filter((v, c) => v.reason === 7 /* MoveCardReason.Give */ &&
                v.toArea === player.handArea).length > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = data.getCards((v, c) => v.reason === 7 /* MoveCardReason.Give */ &&
            v.toArea === from.handArea);
        data.update(cards, { toArea: from.upArea });
        cards.forEach((v) => v.setMark('$mark.qin', true));
        from.setMark('$mark.qin', true, {
            visible: true,
            source: this.name,
            type: 'cards',
            areaId: from.upArea.areaId,
        });
        return true;
    },
}));
exports.kongcheng.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "MoveCardAfter1" /* EventTriggers.MoveCardAfter1 */,
    can_trigger(room, player, data) {
        return this.player.hasUpOrSideCards('$mark.qin');
    },
    async cost(room, data, context) {
        this.player.refreshMark = '$mark.qin';
        return true;
    },
}));
exports.kongcheng.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    priorityType: 1 /* PriorityType.General */,
    trigger: "DrawPhaseStarted" /* EventTriggers.DrawPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.hasUpOrSideCards('$mark.qin'));
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = from.getUpOrSideCards('$mark.qin');
        return await room.obtainCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        from.removeMark('$mark.qin');
    },
}));
exports.guanxing = sgs.Skill({
    name: 'wars.zhugeliang.guanxing',
});
exports.guanxing.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        const { from } = context;
        const count = checkYiZhiLevel(room)
            ? 5
            : Math.min(5, room.aliveCount);
        const cards = await room.getNCards(count);
        await room.puto({
            player: from,
            cards,
            toArea: room.processingArea,
            animation: false,
            puttype: 2 /* CardPut.Down */,
            cardVisibles: [from],
            source: data,
            reason: this.name,
        });
        return cards;
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = context.cost;
        const datas = { type: 'items', datas: [] };
        datas.datas.push({ title: 'cards_top', items: [] });
        datas.datas.push({ title: 'cards_bottom', items: [] });
        cards.forEach((v) => {
            datas.datas[0].items.push({
                title: 'cards_top',
                card: v.id,
            });
            datas.datas[1].items.push({
                title: 'cards_bottom',
                card: undefined,
            });
        });
        const req = await room.sortCards(from, cards, [
            {
                title: 'cards_top',
                max: cards.length,
            },
            {
                title: 'cards_bottom',
                max: cards.length,
            },
        ], {
            canCancle: false,
            showMainButtons: false,
            prompt: this.name,
            thinkPrompt: this.name,
        });
        const result = req.result.sort_result;
        await room.moveCards({
            move_datas: [
                {
                    cards: [...result[0].items, ...result[1].items],
                    toArea: room.drawArea,
                    reason: 1 /* MoveCardReason.PutTo */,
                    animation: false,
                    puttype: 2 /* CardPut.Down */,
                },
            ],
            source: data,
            reason: this.name,
        });
        room.drawArea.remove(result[0].items);
        room.drawArea.add(result[0].items.reverse(), 'top');
    },
}));
exports.zhugeliang.addSkill(exports.kongcheng);
exports.zhugeliang.addSkill(exports.guanxing);
sgs.loadTranslation({
    ['cards_top']: '牌堆顶',
    ['cards_bottom']: '牌堆底',
    ['$mark.qin']: '琴',
});
