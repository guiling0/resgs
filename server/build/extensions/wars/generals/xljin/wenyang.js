"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.danxiong = exports.wenyang = void 0;
exports.wenyang = sgs.General({
    name: 'xl.wenyang',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.danxiong = sgs.Skill({
    name: 'xl.wenyang.danxiong',
});
exports.danxiong.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const juedou = room.createVirtualCardByNone('juedou', undefined, false);
                juedou.custom.method = 1;
                const color = context.color;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.color !== color;
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
                        prompt: `胆雄，你可以将一张不为${sgs.getTranslation('color' + color)}的手牌当【决斗】使用`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from === player &&
            data.has('juedou')) {
            const phase = room.getCurrentPhase();
            if (!phase.isOwner(player, 4 /* Phase.Play */))
                return false;
            const last_use = room.getLastOneHistory(sgs.DataType.UseCardEvent, (v) => v.from === player, phase);
            if (last_use &&
                last_use.card &&
                !last_use.card.transform &&
                last_use.data.subcards &&
                last_use.data.subcards.length === 1)
                return true;
            const last_usetocard = room.getLastOneHistory(sgs.DataType.UseCardToCardEvent, (v) => v.from === player, phase);
            if (last_usetocard &&
                last_usetocard.card &&
                !last_usetocard.card.transform &&
                last_usetocard.data.subcards &&
                last_usetocard.data.subcards.length === 1)
                return true;
            return false;
        }
    },
    context(room, player, data) {
        const phase = room.getCurrentPhase();
        const last_use = room.getLastOneHistory(sgs.DataType.UseCardEvent, (v) => v.from === player &&
            v.card &&
            !v.card.transform &&
            v.data.subcards &&
            v.data.subcards.length === 1, phase);
        if (last_use) {
            return {
                color: last_use.card.color,
            };
        }
        const last_usetocard = room.getLastOneHistory(sgs.DataType.UseCardToCardEvent, (v) => v.from === player &&
            v.card &&
            !v.card.transform &&
            v.data.subcards &&
            v.data.subcards.length === 1, phase);
        if (last_usetocard) {
            return {
                color: last_usetocard.card.color,
            };
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.wenyang.addSkill(exports.danxiong);
