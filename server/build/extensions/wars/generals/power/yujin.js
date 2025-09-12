"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jieyue_delay = exports.jieyue = exports.yujin = void 0;
exports.yujin = sgs.General({
    name: 'wars.yujin',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.jieyue = sgs.Skill({
    name: 'wars.yujin.jieyue',
});
exports.jieyue.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
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
                            selectable: from.getHandCards(),
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (item !== from &&
                                    room.isOtherKingdom(from, item));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `'节钺：你可以交给其他势力的角色一张牌，令其执行军令`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards, targets: [to], } = context;
        return await room.giveCards({
            from,
            to,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [to], } = context;
        const command = await room.command({
            from,
            to,
            source: data,
            reason: this.name,
        });
        if (command.execute) {
            await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        }
        else {
            const effect = await room.addEffect('jieyue.delay', from);
            effect.setData('turn', room.currentTurn);
        }
    },
}));
exports.jieyue_delay = sgs.TriggerEffect({
    name: 'jieyue.delay',
    trigger: "DrawPhaseStarted" /* EventTriggers.DrawPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player) && !data.isComplete;
    },
    async cost(room, data, context) {
        data.ratedDrawnum += 3;
        return true;
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.yujin.addSkill(exports.jieyue);
