"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fengshi = exports.chuanxin = exports.zhangren = void 0;
const rules_1 = require("../../rules");
exports.zhangren = sgs.General({
    name: 'wars.zhangren',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.chuanxin = sgs.Skill({
    name: 'wars.zhangren.chuanxin',
});
exports.chuanxin.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "CauseDamage2" /* EventTriggers.CauseDamage2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from === player &&
            (data.reason === 'sha' || data.reason === 'juedou') &&
            data.to &&
            data.to.hasDeputy()) {
            const phase = room.getCurrentPhase();
            if (!phase.isOwner(player))
                return false;
            return room.differentAsKingdom(player, data.to, 1);
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
                        prompt: '穿心：请选择一项',
                        showMainButtons: false,
                    },
                };
            },
        };
    },
    context(room, player, data) {
        return {
            targets: [data.to],
        };
    },
    async cost(room, data, context) {
        await data.prevent();
        return true;
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const drop = room.createEventData(sgs.DataType.DropCardsData, {
            player: target,
            cards: target.getEquipCards(),
            source: data,
            reason: this.name,
        });
        const remove = room.createEventData(sgs.DataType.RemoveEvent, {
            player: target,
            general: target.deputy,
            source: data,
            reason: this.name,
        });
        const handles = [];
        handles.push(`${drop.check() ? '' : '!'}chuanxin.drop`);
        handles.push(`${remove.check() ? '' : '!'}chuanxin.remove`);
        context.handles = handles;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('chuanxin.drop')) {
            await room.dropCards(drop);
            await room.losehp({
                player: target,
                source: data,
                reason: this.name,
            });
        }
        if (result.includes('chuanxin.remove')) {
            await room.remove(remove);
        }
    },
}));
exports.fengshi = sgs.Skill({
    name: 'wars.zhangren.fengshi',
});
exports.fengshi.addEffect(sgs.TriggerEffect({
    tag: [8 /* SkillTag.Array_Siege */],
    auto_log: 1,
    auto_directline: 1,
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.card && data.card.name === 'sha') {
            const target = data.current.target;
            if (data.from === player) {
                const queue = room.getQueue(target);
                return player.isAdjacent(target) && queue.length === 0;
            }
            if (data.from !== player) {
                const sieges = room.getSiege(player);
                return !!sieges.find((v) => v.from.includes(player) &&
                    v.from.includes(data.from) &&
                    v.target === target);
            }
        }
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(target, {
                            step: 1,
                            count: 1,
                            selectable: target.getEquipCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `锋矢：请弃置一张装备区里的牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    async effect(room, data, context) {
        const { targets: [target], } = context;
        if (target.hasCanDropCards('e', target, 1, this.name)) {
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.dropCards({
                player: target,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.fengshi.addEffect(sgs.copy(rules_1.arraycall_siege));
exports.zhangren.addSkill(exports.chuanxin);
exports.zhangren.addSkill(exports.fengshi);
sgs.loadTranslation({
    ['chuanxin.drop']: '弃置装备并失去1点体力',
    ['chuanxin.remove']: '移除副将',
});
