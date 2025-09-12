"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chenjie = exports.xunde = exports.simafu = void 0;
exports.simafu = sgs.General({
    name: 'xl.simafu',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.xunde = sgs.Skill({
    name: 'xl.simafu.xunde',
});
exports.xunde.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && player === data.to;
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(from.losshp + 1);
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
        datas.datas.push({ title: 'xunde.gain', items: [] });
        cards.forEach((v) => {
            datas.datas[0].items.push({
                title: 'cards_top',
                card: v.id,
            });
        });
        for (let i = 0; i < 2; i++) {
            datas.datas[1].items.push({
                title: 'cards_bottom',
                card: undefined,
            });
        }
        const req = await room.sortCards(from, cards, [
            {
                title: 'cards_top',
                max: cards.length,
            },
            {
                title: 'cards_bottom',
                max: cards.length,
            },
            {
                title: 'xunde.gain',
                max: 1,
                condition: 1,
            },
        ], {
            canCancle: false,
            showMainButtons: false,
            prompt: this.name,
            thinkPrompt: this.name,
        });
        const result = req.result.sort_result;
        const result_gain = result[2].items;
        await room.obtainCards({
            player: from,
            cards: result_gain,
            source: data,
            reason: this.name,
        });
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
exports.chenjie = sgs.Skill({
    name: 'xl.simafu.chenjie',
});
exports.chenjie.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    priorityType: 0 /* PriorityType.None */,
    trigger: "Deathed" /* EventTriggers.Deathed */,
    can_trigger(room, player, data) {
        if (data.player === this.player &&
            data.killer &&
            data.killer.kingdom === 'wei') {
            return true;
        }
        if (data.killer === this.player &&
            data.player &&
            data.player.kingdom === 'wei') {
            return true;
        }
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                room.setMark('#chenjie', this.id);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                room.removeMark('#chenjie');
            },
        },
    ],
}));
exports.simafu.addSkill(exports.xunde);
exports.simafu.addSkill(exports.chenjie);
sgs.loadTranslation({
    ['xunde.gain']: '获得',
});
