"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kuiji = exports.cs_lisong = void 0;
exports.cs_lisong = sgs.General({
    name: 'mobile.cs_lisong',
    kingdom: 'qun',
    hp: 1,
    gender: 1 /* Gender.Male */,
    enable: false,
    hidden: true,
});
exports.kuiji = sgs.Skill({
    name: 'mobile.cs_lisong.kuiji',
});
exports.kuiji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return from !== item;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `窥机：你可以选择一名其他角色观看他的手牌，并可以弃置你与其共计4张不同花色的牌`,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                const target = context.targets.at(0);
                const cards = [];
                cards.push({
                    title: target.gameName,
                    cards: target.getHandCards(),
                });
                cards.push({
                    title: from.gameName,
                    cards: from.getHandCards(),
                });
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 4,
                            selecte_type: 'rows',
                            selectable: [
                                ...target.getHandCards(),
                                ...from.getHandCards(),
                            ],
                            data_rows: cards,
                            windowOptions: {
                                title: '窥机',
                                timebar: room.responseTime,
                                prompt: '窥机：你可以选择4张不同花色的牌弃置',
                                buttons: ['confirm'],
                            },
                            filter(item, selected) {
                                return !selected.find((v) => v.suit === item.suit);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        sgs.DataType.WatchHandData.temp(from, target.getHandCards());
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        sgs.DataType.WatchHandData.temp_end(from, target.getHandCards());
        const cards = room.getResultCards(req);
        if (!req.result.cancle && cards.length) {
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
        return true;
    },
}));
exports.cs_lisong.addSkill(exports.kuiji);
