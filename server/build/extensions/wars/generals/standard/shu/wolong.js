"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kanpo = exports.huoji = exports.bazhen = exports.wolong = void 0;
exports.wolong = sgs.General({
    name: 'wars.wolong',
    kingdom: 'shu',
    hp: 1.5,
    gender: 1 /* Gender.Male */, isWars: true,
});
exports.bazhen = sgs.Skill({
    name: 'wars.wolong.bazhen',
    condition(room) {
        return !this.player.getEquip(32 /* EquipSubType.Armor */);
    },
});
exports.bazhen.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    priorityType: 0 /* PriorityType.None */,
    trigger: ["NeedUseCard1" /* EventTriggers.NeedUseCard1 */, "NeedPlayCard1" /* EventTriggers.NeedPlayCard1 */],
    can_trigger(room, player, data) {
        if (!this.isOpen())
            return false;
        if (data.is(sgs.DataType.NeedUseCardData) ||
            data.is(sgs.DataType.NeedPlayCardData)) {
            return data.from === this.player && data.has('shan');
        }
    },
    regard_skill(room, player, data) {
        if (this.isOwner(player)) {
            return 'baguazhen';
        }
    },
}));
exports.huoji = sgs.Skill({
    name: 'wars.wolong.huoji',
});
exports.huoji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const huogong = room.createVirtualCardByNone('huogong', undefined, false);
                huogong.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.color === 1 /* CardColor.Red */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    huogong.addSubCard(item);
                                if (type === 'remove')
                                    huogong.delSubCard(item);
                                huogong.set();
                                this._use_or_play_vcard = huogong;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '火计，你可以将一张红色手牌当【火攻】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
            return data.from === player && data.has('huogong');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.kanpo = sgs.Skill({
    name: 'wars.wolong.kanpo',
});
exports.kanpo.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const wuxie = room.createVirtualCardByNone('wuxiekeji', undefined, false);
                wuxie.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.color === 2 /* CardColor.Black */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    wuxie.addSubCard(item);
                                if (type === 'remove')
                                    wuxie.delSubCard(item);
                                wuxie.set({ attr: [] });
                                this._use_or_play_vcard = wuxie;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '看破，你可以将一张黑色手牌当【无懈可击】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            player.hasHandCards()) {
            return data.from === player && data.has('wuxiekeji');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.wolong.addSkill(exports.bazhen);
exports.wolong.addSkill(exports.huoji);
exports.wolong.addSkill(exports.kanpo);
