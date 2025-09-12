"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feiying = exports.heyi = exports.huyuan = exports.caohong = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
const rules_1 = require("../../rules");
exports.caohong = sgs.General({
    name: 'wars.caohong',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.huyuan = sgs.Skill({
    name: 'wars.caohong.huyuan',
});
exports.huyuan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.type === 3 /* CardType.Equip */;
                            },
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                const card = this.selectors.card.result.at(0);
                                return (card &&
                                    card.type === 3 /* CardType.Equip */ &&
                                    !item.getEquip(card.subtype));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `护援：你可以将一张装备牌置入一名角色的装备区`,
                        thinkPrompt: '护援',
                    },
                };
            },
            choose_player: () => {
                const targets = context.targets;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            selectable: targets.slice(1),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: {
                            text: '护援：你可以弃置{0}距离1以内的一名角色的一张牌',
                            values: [
                                {
                                    type: 'player',
                                    value: targets.at(0).playerId,
                                },
                            ],
                        },
                        thinkPrompt: '护援',
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
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '护援',
                                timebar: room.responseTime,
                                prompt: '护援：请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '护援',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards, targets: [target], } = context;
        return await room.puto({
            player: from,
            cards,
            toArea: target.equipArea,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const players = room.getPlayerByFilter((v) => target.distanceTo(v) === 1 && v.hasCardsInArea());
        context.targets = [target, ...players];
        const req_target = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose_player'),
                context,
            },
        });
        const drop_target = room.getResultPlayers(req_target);
        if (drop_target.length) {
            context.targets = drop_target;
            const req_card = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_card'),
                    context,
                },
            });
            const cards = room.getResultCards(req_card);
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.heyi = sgs.Skill({
    name: 'wars.caohong.heyi',
});
exports.heyi.addEffect(sgs.StateEffect({
    tag: [7 /* SkillTag.Array_Quene */],
    regard_skill(room, player, data) {
        if (player === this.player ||
            room.getQueue(this.player).includes(player)) {
            return 'wars.caohong.feiying';
        }
    },
}));
exports.heyi.addEffect(sgs.copy(rules_1.arraycall_queue));
exports.feiying = sgs.Skill({
    name: 'wars.caohong.feiying',
    condition(room) {
        return (this.sourceEffect &&
            this.sourceEffect.player &&
            room.getQueue(this.sourceEffect.player).includes(this.player));
    },
    visible(room) {
        return (this.sourceEffect &&
            this.sourceEffect.player &&
            room.getQueue(this.sourceEffect.player).includes(this.player));
    },
});
exports.feiying.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct](from, to) {
        if (this.isOwner(to)) {
            return 1;
        }
    },
}));
exports.caohong.addSkill(exports.huyuan);
exports.caohong.addSkill(exports.heyi);
exports.caohong.addSkill('#wars.caohong.feiying');
