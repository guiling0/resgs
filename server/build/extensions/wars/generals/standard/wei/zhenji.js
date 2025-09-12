"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luoshen = exports.qingguo = exports.zhenji = void 0;
exports.zhenji = sgs.General({
    name: 'wars.zhenji',
    kingdom: 'wei',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.qingguo = sgs.Skill({
    name: 'wars.zhenji.qingguo',
});
function qingguo_choose(room, context) {
    const from = context.from;
    const shan = room.createVirtualCardByNone('shan', undefined, false);
    shan.custom.method = 1;
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
                        shan.addSubCard(item);
                    if (type === 'remove')
                        shan.delSubCard(item);
                    shan.set();
                    this._use_or_play_vcard = shan;
                },
            }),
        },
        options: {
            canCancle: true,
            showMainButtons: true,
            prompt: '倾国：你可以将一张黑色手牌当【闪】',
        },
    };
}
exports.qingguo.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return qingguo_choose(room, context);
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
            return data.from === player && data.has('shan');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.qingguo.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return qingguo_choose(room, context);
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedPlayCardData)) {
            return data.from === player && data.has('shan');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.luoshen = sgs.Skill({
    name: 'wars.zhenji.luoshen',
});
exports.luoshen.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    forced: 'cost',
    getSelectors(room, context) {
        return {
            choose: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: '洛神，是否继续判定',
                    thinkPrompt: this.name,
                });
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 1 /* Phase.Ready */ &&
            data.executor === player);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.judge({
            player: from,
            isSucc(result) {
                return result.color === 2 /* CardColor.Black */;
            },
            source: data,
            reason: this.name,
            notMoveHandle(data) {
                return data.result.color === 2 /* CardColor.Black */;
            },
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        let judge = context.cost;
        const cards = [];
        do {
            if (!judge) {
                judge = await room.judge({
                    player: from,
                    isSucc(result) {
                        return result.color === 2 /* CardColor.Black */;
                    },
                    source: data,
                    reason: this.name,
                    notMoveHandle(data) {
                        return data.result.color === 2 /* CardColor.Black */;
                    },
                });
            }
            if (judge.success) {
                cards.push(judge.card);
                judge = undefined;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                if (req.result.cancle) {
                    break;
                }
            }
            else {
                break;
            }
        } while (true);
        if (cards.length > 0) {
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.zhenji.addSkill(exports.qingguo);
exports.zhenji.addSkill(exports.luoshen);
