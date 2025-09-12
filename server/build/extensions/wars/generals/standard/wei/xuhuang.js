"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duanliang = exports.xuhuang = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.xuhuang = sgs.General({
    name: 'wars.xuhuang',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.duanliang = sgs.Skill({
    name: 'wars.xuhuang.duanliang',
});
exports.duanliang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const bing = room.createVirtualCardByNone('bingliangcunduan', undefined, false);
                bing.custom.method = 1;
                bing.custom.skipDistances = true;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return (item.color === 2 /* CardColor.Black */ &&
                                    (item.type === 1 /* CardType.Basic */ ||
                                        item.type === 3 /* CardType.Equip */));
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    bing.addSubCard(item);
                                if (type === 'remove')
                                    bing.delSubCard(item);
                                bing.set();
                                this._use_or_play_vcard = bing;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '断粮：你可以将一张黑色基本牌或装备牌当【兵粮寸断】使用（无距离限制）',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
            return (data.from === player &&
                !player.hasMark('marks.duanliang') &&
                data.has('bingliangcunduan'));
        }
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        await data.exec();
        const targets = data.targets;
        if (targets.some((v) => from.distanceTo(v) > 2)) {
            from.setMark('marks.duanliang', true, {
                visible: true,
            });
        }
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                this.player?.removeMark('marks.duanliang');
            },
        },
    ],
}));
exports.duanliang.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
        if (this.isOwner(from) &&
            card.name === 'bingliangcunduan' &&
            !from.hasMark('marks.duanliang')) {
            return true;
        }
    },
}));
exports.xuhuang.addSkill(exports.duanliang);
sgs.loadTranslation({
    ['marks.duanliang']: '断粮失效',
});
