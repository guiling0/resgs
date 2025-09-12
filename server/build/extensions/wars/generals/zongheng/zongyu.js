"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chengshang = exports.qiao = exports.zongyu = void 0;
exports.zongyu = sgs.General({
    name: 'wars.zongyu',
    kingdom: 'shu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qiao = sgs.Skill({
    name: 'wars.zongyu.qiao',
});
exports.qiao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from &&
            room.isOtherKingdom(player, data.from) &&
            data.from.hasCanDropCards('he', player, 1, this.name) &&
            data.current.target === player) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 2;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        const from = context.from;
        const target = context.targets.at(0);
        return {
            choose: () => {
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getSelfCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '气傲',
                                timebar: room.responseTime,
                                prompt: '气傲：请选择一张牌',
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
        const { from, targets: [target], } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        if (from.hasCanDropCards('he', from, 1, this.name)) {
            context.targets = [from];
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
    },
}));
exports.chengshang = sgs.Skill({
    name: 'wars.zongyu.chengshang',
});
exports.chengshang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "UseCardEnd1" /* EventTriggers.UseCardEnd1 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.UseCardEvent) &&
            data.from &&
            data.from === player &&
            data.card &&
            data.card.subcards.length === 1 &&
            data.targetList.some((v) => room.isOtherKingdom(player, v.target)) &&
            !this.getData(this.name)) {
            const phase = room.getCurrentPhase();
            if (!phase.isOwner(player, 4 /* Phase.Play */))
                return false;
            return !room.hasHistorys(sgs.DataType.DamageEvent, (v) => v.channel === data.card, data);
        }
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = room.drawArea.cards.filter((v) => v.suit === data.card.suit && v.number === data.card.number);
        const gain = await room.obtainCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        if (gain) {
            this.setData(this.name, true);
        }
    },
    lifecycle: [
        {
            trigger: "PlayPhaseEnd" /* EventTriggers.PlayPhaseEnd */,
            async on_exec(room, data) {
                if (data.isOwner(this.player)) {
                    this.removeData(this.name);
                }
            },
        },
    ],
}));
exports.zongyu.addSkill(exports.qiao);
exports.zongyu.addSkill(exports.chengshang);
