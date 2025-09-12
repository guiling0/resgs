"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shejian = exports.kuangcai = exports.miheng = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.miheng = sgs.General({
    name: 'wars.miheng',
    kingdom: 'qun',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.kuangcai = sgs.Skill({
    name: 'wars.miheng.kuangcai',
});
exports.kuangcai.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
        return this.isOwner(from) && from.inturn;
    },
    [skill_types_1.StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
        return this.isOwner(from) && from.inturn;
    },
    [skill_types_1.StateEffectType.MaxHand_Correct](from) {
        if (this.isOwner(from)) {
            return from.getMark(this.name, 0);
        }
    },
}));
exports.kuangcai.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    tag: [1 /* SkillTag.Lock */],
    trigger: "DropPhaseStarted" /* EventTriggers.DropPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            const use = room.getLastOneHistory(sgs.DataType.UseCardEvent, (v) => v.from === player, room.currentTurn);
            if (use) {
                return !room.hasHistorys(sgs.DataType.DamageEvent, (v) => v.from === player);
            }
            else {
                return true;
            }
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        const use = room.getLastOneHistory(sgs.DataType.UseCardEvent, (v) => v.from === from, room.currentTurn);
        const mark = from.getMark(this.name, 0);
        if (use) {
            from.setMark(this.name, mark - 1, {
                visible: true,
                source: this.name,
            });
        }
        else {
            from.setMark(this.name, mark + 1, {
                visible: true,
                source: this.name,
            });
        }
        return true;
    },
}));
exports.shejian = sgs.Skill({
    name: 'wars.miheng.shejian',
});
exports.shejian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from &&
            data.from !== player &&
            data.from.hasCanDropCards('h', player, 1, this.name) &&
            data.current.target === player &&
            data.targetCount === 1 &&
            room.playerAlives.every((v) => v.hp > 0)) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
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
                        prompt: `舌剑：请选择一项`,
                        showMainButtons: false,
                    },
                };
            },
            choose_card: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: context.count,
                            selecte_type: 'rows',
                            selectable: target.getSelfCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '舌剑',
                                timebar: room.responseTime,
                                prompt: `舌剑：请选择${context.count}张牌`,
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.dropCards({
            player: from,
            cards: from.getHandCards(),
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const move = context.cost;
        const handles = ['shejian.drop', 'shejian.damage'];
        if (!target.hasCanDropCards('he', from, 1, this.name)) {
            handles[0] = '!' + handles[0];
        }
        context.handles = handles;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('shejian.drop')) {
            context.count = move.getMoveCount();
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_card'),
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
        if (result.includes('shejian.damage')) {
            await room.damage({
                from,
                to: target,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.miheng.addSkill(exports.kuangcai);
exports.miheng.addSkill(exports.shejian);
sgs.loadTranslation({
    ['shejian.drop']: '弃置牌',
    ['shejian.damage']: '造成伤害',
});
