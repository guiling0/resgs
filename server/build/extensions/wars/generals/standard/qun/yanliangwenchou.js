"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuangxiong = exports.yanliangwenchou = void 0;
exports.yanliangwenchou = sgs.General({
    name: 'wars.yanliangwenchou',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isDualImage: true,
    isWars: true,
});
exports.shuangxiong = sgs.Skill({
    name: 'wars.yanliangwenchou.shuangxiong',
});
exports.shuangxiong.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DrawPhaseStartedAfter" /* EventTriggers.DrawPhaseStartedAfter */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            data.ratedDrawnum > 0);
    },
    async cost(room, data, context) {
        await data.end();
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const judge = await room.judge({
            player: from,
            isSucc(result) {
                return true;
            },
            source: data,
            reason: this.name,
        });
        if (!judge || !judge.result)
            return;
        let color = 0 /* CardColor.None */;
        if (judge.result.color === 2 /* CardColor.Black */)
            color = 1 /* CardColor.Red */;
        if (judge.result.color === 1 /* CardColor.Red */)
            color = 2 /* CardColor.Black */;
        from.setMark(this.name, `color${color}`, {
            visible: true,
        });
        from.setMark('wars.ss', color);
        await room.obtainCards({
            player: from,
            cards: [judge.card],
            source: data,
            reason: this.name,
        });
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                this.player.removeMark(this.name);
                this.player.removeMark('wars.ss');
            },
        },
    ],
}));
exports.shuangxiong.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const juedou = room.createVirtualCardByNone('juedou', undefined, false);
                juedou.custom.method = 1;
                const color = from.getMark('wars.ss');
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.color === color;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    juedou.addSubCard(item);
                                if (type === 'remove')
                                    juedou.delSubCard(item);
                                juedou.set();
                                this._use_or_play_vcard = juedou;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `双雄，你可以将一张${sgs.getTranslation('color' + color)}手牌当【决斗】使用`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            data.from === player &&
            data.has('juedou') &&
            player.hasMark('wars.ss'));
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.yanliangwenchou.addSkill(exports.shuangxiong);
