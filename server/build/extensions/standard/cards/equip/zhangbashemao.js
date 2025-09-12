"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhangba_skill = exports.zhangba = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.zhangba = sgs.CardUseEquip({
    name: 'zhangbashemao',
});
sgs.setCardData('zhangbashemao', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'ao',
});
exports.zhangba_skill = sgs.Skill({
    name: 'zhangbashemao',
    attached_equip: 'zhangbashemao',
});
exports.zhangba_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 3;
        }
    },
}));
exports.zhangba_skill.addEffect(sgs.TriggerEffect({
    anim: 'zhangbashemao_skill',
    audio: ['zhangbashemao'],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    auto_log: 1,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const sha = room.createVirtualCardByNone('sha', undefined, false);
                sha.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 2,
                            selectable: from.getHandCards(),
                            onChange(type, item) {
                                if (type === 'add')
                                    sha.addSubCard(item);
                                if (type === 'remove')
                                    sha.delSubCard(item);
                                sha.set({ attr: [] });
                                this._use_or_play_vcard = sha;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `丈八蛇矛：你可以将两张手牌当【杀】使用`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
            return data.from === player && data.has('sha');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.zhangba_skill.addEffect(sgs.TriggerEffect({
    anim: 'zhangbashemao_skill',
    audio: ['zhangbashemao'],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */,
    auto_log: 1,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const sha = room.createVirtualCardByNone('sha', undefined, false);
                sha.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 2,
                            selectable: from.getHandCards(),
                            onChange(type, item) {
                                if (type === 'add')
                                    sha.addSubCard(item);
                                if (type === 'remove')
                                    sha.delSubCard(item);
                                sha.set({ attr: [] });
                                this._use_or_play_vcard = sha;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `丈八蛇矛：你可以将两张手牌当【杀】打出`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedPlayCardData)) {
            return data.from === player && data.has('sha');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
