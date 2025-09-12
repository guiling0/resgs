"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liuli = exports.guose = exports.daqiao = void 0;
exports.daqiao = sgs.General({
    name: 'wars.daqiao',
    kingdom: 'wu',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.guose = sgs.Skill({
    name: 'wars.daqiao.guose',
});
exports.guose.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const le = room.createVirtualCardByNone('lebusishu', undefined, false);
                le.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.suit === 4 /* CardSuit.Diamond */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    le.addSubCard(item);
                                if (type === 'remove')
                                    le.delSubCard(item);
                                le.set();
                                this._use_or_play_vcard = le;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '国色，你可以将一张方片牌当【乐不思蜀】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
            return data.from === player && data.has('lebusishu');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.liuli = sgs.Skill({
    name: 'wars.daqiao.liuli',
});
exports.liuli.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const from = context.from;
                const sha = context.sha;
                const targets = context.targets;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (!targets.includes(item) &&
                                    from.rangeOf(item) &&
                                    targets[0].canUseCard(sha, [item], skill.name, {
                                        excluesCardTimesLimit: true,
                                        excluesCardDistanceLimit: true,
                                    }));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `流离，你可以弃置一张牌，转移【杀】的目标`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.current.target === player &&
            data.card.name === 'sha' &&
            player.hasCanDropCards('he', player, 1, this.name));
    },
    context(room, player, data) {
        return {
            targets: [data.from, ...data.targets],
            sha: data.card.vdata,
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
        const { targets } = context;
        await data.transferCurrent(targets.at(0));
    },
}));
exports.daqiao.addSkill(exports.guose);
exports.daqiao.addSkill(exports.liuli);
