"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yongjue = exports.cunsi = exports.guixiu_delay = exports.guixiu = exports.mifuren = void 0;
exports.mifuren = sgs.General({
    name: 'wars.mifuren',
    kingdom: 'shu',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.guixiu = sgs.Skill({
    name: 'wars.mifuren.guixiu',
});
exports.guixiu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "Opened" /* EventTriggers.Opened */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.generals.includes(this.skill?.sourceGeneral));
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
}));
exports.guixiu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "StateChange" /* EventTriggers.StateChange */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.RemoveEvent) &&
            this.isOwner(player) &&
            data.general === this.skill?.sourceGeneral);
    },
    async cost(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('guixiu.delay', from);
        effect.setData('data', data);
        return true;
    },
}));
exports.guixiu_delay = sgs.TriggerEffect({
    name: 'guixiu.delay',
    trigger: "StateChanged" /* EventTriggers.StateChanged */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.getData('data') === data;
    },
    async cost(room, data, context) {
        const { from } = context;
        await this.removeSelf();
        return await room.recoverhp({
            player: from,
            source: data,
            reason: this.name,
        });
    },
    lifecycle: [
        {
            trigger: "StateChangeEnd" /* EventTriggers.StateChangeEnd */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.cunsi = sgs.Skill({
    name: 'wars.mifuren.cunsi',
});
exports.cunsi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) && data.isOwner(player) && !this.isOpen());
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: `存嗣：是否明置武将牌`,
                });
            },
        };
    },
}));
exports.cunsi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) && data.isOwner(player) && this.isOpen());
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `存嗣：你可以选择一名角色令他获得勇决`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return room.remove({
            player: from,
            general: this.skill?.sourceGeneral,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { targets: [target], } = context;
        await room.addSkill('wars.mifuren.yongjue', target, {
            source: this.name,
            showui: 'default',
        });
        target.setMark('wars.mifuren.yongjue', true, { visible: true });
        if (target !== this.player) {
            await room.drawCards({
                player: target,
                count: 2,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.yongjue = sgs.Skill({
    name: 'wars.mifuren.yongjue',
});
exports.yongjue.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from &&
            room.sameAsKingdom(player, data.from) &&
            data.card &&
            data.card.name === 'sha' &&
            data.card.hasSubCards()) {
            const phase = room.getCurrentPhase();
            if (!phase.isOwner(data.from, 4 /* Phase.Play */))
                return false;
            const uses = room
                .getPeriodHistory(phase)
                .find((v) => v.data !== data &&
                (v.data.is(sgs.DataType.UseCardEvent) ||
                    v.data.is(sgs.DataType.UseCardToCardEvent)) &&
                v.data.from === data.from);
            return !uses;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        await room.chooseYesOrNo(target, { prompt: '@yongjue', thinkPrompt: this.name }, async () => {
            await room.obtainCards({
                player: target,
                cards: data.card.subcards,
                source: data,
                reason: this.name,
            });
        });
        return true;
    },
}));
exports.mifuren.addSkill(exports.guixiu);
exports.mifuren.addSkill(exports.cunsi);
exports.mifuren.addSkill('#wars.mifuren.yongjue');
sgs.loadTranslation({
    ['@yongjue']: '勇决：是否获得【杀】',
});
