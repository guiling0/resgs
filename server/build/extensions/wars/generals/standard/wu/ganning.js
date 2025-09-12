"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qixi = exports.ganning = void 0;
exports.ganning = sgs.General({
    name: 'wars.ganning',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qixi = sgs.Skill({
    name: 'wars.ganning.qixi',
});
exports.qixi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const chai = room.createVirtualCardByNone('guohechaiqiao', undefined, false);
                chai.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.color === 2 /* CardColor.Black */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    chai.addSubCard(item);
                                if (type === 'remove')
                                    chai.delSubCard(item);
                                chai.set();
                                this._use_or_play_vcard = chai;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '奇袭，你可以将一张黑色牌当【过河拆桥】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
            return data.from === player && data.has('guohechaiqiao');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.ganning.addSkill(exports.qixi);
