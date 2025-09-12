"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wusheng = exports.guanyu = void 0;
function checkLiubeiLevel(room) {
    const wuhu = room.getEffect(room.getMark('#wuhujiangdaqi'));
    return wuhu ? wuhu.isOpen() && wuhu.check() : false;
}
exports.guanyu = sgs.General({
    name: 'wars.guanyu',
    kingdom: 'shu',
    hp: 2.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.wusheng = sgs.Skill({
    name: 'wars.guanyu.wusheng',
});
function wusheng_choose(room, context) {
    const from = context.from;
    const sha = room.createVirtualCardByNone('sha', undefined, false);
    sha.custom.method = 1;
    return {
        selectors: {
            card: room.createChooseCard({
                step: 1,
                count: 1,
                selectable: from.getSelfCards(),
                filter(item, selected) {
                    if (checkLiubeiLevel(room)) {
                        return true;
                    }
                    return item.color === 1 /* CardColor.Red */;
                },
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
            prompt: '武圣：你可以将一张红色牌当【杀】',
        },
    };
}
exports.wusheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return wusheng_choose(room, context);
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
exports.wusheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return wusheng_choose(room, context);
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
exports.guanyu.addSkill(exports.wusheng);
