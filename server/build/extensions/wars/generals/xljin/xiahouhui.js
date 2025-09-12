"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jianxi = exports.lvbing = exports.yuchou = exports.xiahouhui = void 0;
const rules_1 = require("../../rules");
exports.xiahouhui = sgs.General({
    name: 'xl.xiahouhui',
    kingdom: 'jin',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.yuchou = sgs.Skill({
    name: 'xl.xiahouhui.yuchou',
});
exports.yuchou.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            return (data.getCards((v) => v.reason === 6 /* MoveCardReason.DisCard */ &&
                player.isOnwerCardArea(v.fromArea)).length > 0);
        }
    },
    context(room, player, data) {
        const count = data.getCards((v) => v.reason === 6 /* MoveCardReason.DisCard */ &&
            player.isOnwerCardArea(v.fromArea)).length;
        return {
            count,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const count = context.count;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item !== from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `豫筹：你可以选择一名其他角色令他摸${count}张牌获得交给他${count}张后备区里的`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
                const target = context.targets.at(0);
                const count = context.count;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count,
                            selecte_type: 'rows',
                            selectable: room.reserveArea.cards,
                            data_rows: room.getReserveRowDatas(),
                            windowOptions: {
                                title: '后备区',
                                timebar: room.responseTime,
                                prompt: `豫筹：将${count}张牌交给${target.gameName}（点击取消令他摸牌）`,
                                buttons: ['confirm'],
                            },
                        }, false),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: ``,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [to], } = context;
        const count = context.count ?? 0;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        if (cards.length) {
            return await room.giveCards({
                from,
                to,
                cards,
                source: data,
                reason: this.name,
            });
        }
        else {
            return await room.drawCards({
                player: to,
                count,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.yuchou.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.lvbing = sgs.Skill({
    name: 'xl.xiahouhui.lvbing',
});
exports.lvbing.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "EntryDying" /* EventTriggers.EntryDying */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.player === player) {
            const damage = data.getDamage();
            if (damage && damage.from && damage.from.alive) {
                const jianxi = room.skills.find((v) => v.name === 'xl.xiahouhui.jianxi');
                return !jianxi;
            }
        }
    },
    context(room, player, data) {
        return {
            targets: [data.getDamage().from],
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        await room.addSkill('xl.xiahouhui.jianxi', target, {
            showui: 'default',
            source: this.name,
        });
        return true;
    },
}));
exports.jianxi = sgs.Skill({
    name: 'xl.xiahouhui.jianxi',
});
exports.jianxi.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    audio: [`xl/xl.xiahouhui/jianxi1`],
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            return data.has_filter((v) => v.reason === 6 /* MoveCardReason.DisCard */ &&
                player.isOnwerCardArea(v.fromArea));
        }
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `见隙：请选择一张牌移除`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        return await room.removeCard({
            player: from,
            cards,
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.jianxi.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    audio: [`xl/xl.xiahouhui/jianxi2`],
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.has_obtain(player) &&
            !player.inturn) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 2;
        }
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: context.handles,
                        }),
                    },
                    options: {
                        canCancle: false,
                        prompt: '见隙：请选择一项',
                        showMainButtons: false,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const handles = ['jianxi.drop', 'jianxi.lose'];
        context.handles = handles;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('jianxi.drop')) {
            const cards = [];
            data.getObtainDatas(from).forEach((v) => cards.push(...v.cards));
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
        if (result.includes('jianxi.lose')) {
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.jianxi.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.xiahouhui.addSkill(exports.yuchou);
exports.xiahouhui.addSkill(exports.lvbing);
exports.xiahouhui.addSkill(exports.jianxi, true);
sgs.loadTranslation({
    ['jianxi.drop']: '弃置获得的牌',
    ['jianxi.lose']: '失去1点体力',
});
