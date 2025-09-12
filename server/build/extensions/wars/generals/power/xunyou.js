"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhiyu = exports.qice_delay = exports.qice = exports.xunyou = void 0;
exports.xunyou = sgs.General({
    name: 'wars.xunyou',
    kingdom: 'wei',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qice = sgs.Skill({
    name: 'wars.xunyou.qice',
});
exports.qice.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && player.hasHandCards()) {
            const canuses = room.cardNamesToSubType
                .get(21 /* CardSubType.InstantScroll */)
                .filter((v) => v !== 'wuxiekeji' && data.has(v, 0));
            if (canuses.length === 0)
                return false;
            const phase = room.getCurrentPhase();
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, phase);
            return phase.isOwner(player, 4 /* Phase.Play */) && uses.length < 1;
        }
    },
    context(room, player, data) {
        return {
            canuses: data.cards,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const handes = from.getHandCards();
                const canuses = context.canuses;
                let vcards = [];
                room.cardNamesToSubType
                    .get(21 /* CardSubType.InstantScroll */)
                    .forEach((v) => {
                    if (v !== 'wuxiekeji' &&
                        canuses.find((c) => c.name === v)) {
                        vcards.push(room.createVirtualCard(v, handes, undefined, true, false));
                    }
                });
                vcards.forEach((v) => {
                    v.custom.method = 1;
                    v.custom.canuse = from.canUseCard(v, undefined, this.name, { excluesToCard: true });
                });
                return {
                    selectors: {
                        card: room.createChooseVCard({
                            step: 1,
                            count: 1,
                            selectable: vcards.map((v) => v.vdata),
                            filter(item, selected) {
                                return item.custom.canuse;
                            },
                            onChange(type, item) {
                                if (type === 'add') {
                                    this._use_or_play_vcard =
                                        room.createVirtualCardByData(item, false);
                                }
                            },
                        }),
                        target: room.createChoosePlayer({
                            canConfirm: (selected) => {
                                return (selected.length <=
                                    from.getHandCards().length);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `奇策，你可以将所有手牌当任意普通锦囊牌（目标数不能大于你的手牌数）`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('qice.delay', from);
        effect.setData('reason', this);
    },
}));
exports.qice_delay = sgs.TriggerEffect({
    name: 'qice.delay',
    trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.getData('reason') === data.skill;
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.chooseYesOrNo(from, {
            prompt: '@qice',
            thinkPrompt: this.name,
        }, async () => {
            await room.change({
                player: from,
                general: 'deputy',
                source: data,
                reason: this.name,
            });
        });
        await this.removeSelf();
        return true;
    },
});
exports.zhiyu = sgs.Skill({
    name: 'wars.xunyou.zhiyu',
});
exports.zhiyu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && player === data.to;
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
                            selectable: target.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `智愚：请弃置一张手牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = from.getHandCards();
        await room.showCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        if (data.from &&
            data.from.hasCanDropCards('h', data.from, 1, this.name) &&
            cards.length &&
            cards.every((v) => v.color === cards[0].color)) {
            context.targets = [data.from];
            const req = await room.doRequest({
                player: data.from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.dropCards({
                player: data.from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.xunyou.addSkill(exports.qice);
exports.xunyou.addSkill(exports.zhiyu);
sgs.loadTranslation({
    ['@qice']: '奇策：是否变更',
});
