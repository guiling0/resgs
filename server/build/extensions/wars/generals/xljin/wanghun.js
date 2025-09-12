"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cuiku = exports.wanghun = void 0;
exports.wanghun = sgs.General({
    name: 'xl.wanghun',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.cuiku = sgs.Skill({
    name: 'xl.wanghun.cuiku',
});
exports.cuiku.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.hasHandCards());
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: [1, -1],
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                if (selected.length === 0) {
                                    return true;
                                }
                                return item.suit === selected[0].suit;
                            },
                        }),
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return item !== from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `摧枯：你可以弃置至少一张同花色的手牌并选择一名其他角色让他受到伤害或弃置他的牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose_option: () => {
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
                        prompt: '摧枯：请选择一项',
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
                                title: '摧枯',
                                timebar: room.responseTime,
                                prompt: `摧枯：请选择${context.count}张牌`,
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
        const { from, cards } = context;
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const drop = context.cost;
        const handles = ['cuiku.damage', 'cuiku.drop'];
        context.handles = handles;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('cuiku.drop')) {
            context.count = drop.getMoveCount() ?? 0;
            context.targets = [target];
            if (context.count > 0) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        }
        if (result.includes('cuiku.damage')) {
            await room.damage({
                from,
                to: target,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.wanghun.addSkill(exports.cuiku);
sgs.loadTranslation({
    ['cuiku.damage']: '受到伤害',
    ['cuiku.drop']: '弃置牌',
});
