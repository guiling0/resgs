"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duoshi_v2025 = exports.qianxun_v2025 = exports.luxun_v2025 = exports.duoshi = exports.qianxun = exports.luxun = void 0;
exports.luxun = sgs.General({
    name: 'wars.luxun',
    kingdom: 'wu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qianxun = sgs.Skill({
    name: 'wars.luxun.qianxun',
});
exports.qianxun.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card.name === 'shunshouqianyang' &&
            data.current.target === player);
    },
    async cost(room, data, context) {
        return await data.cancleCurrent();
    },
}));
exports.qianxun.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.filter((d, c) => d.toArea === player.judgeArea &&
                c.vcard?.name === 'lebusishu').length > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        data.update(data.getCards((d, c) => d.toArea === from.judgeArea &&
            c.vcard?.name === 'lebusishu'), {
            toArea: room.discardArea,
        });
        return true;
    },
}));
exports.duoshi = sgs.Skill({
    name: 'wars.luxun.duoshi',
});
exports.duoshi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const yiyidailao = room.createVirtualCardByNone('yiyidailao', undefined, false);
                yiyidailao.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.color === 1 /* CardColor.Red */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    yiyidailao.addSubCard(item);
                                if (type === 'remove')
                                    yiyidailao.delSubCard(item);
                                yiyidailao.set();
                                this._use_or_play_vcard = yiyidailao;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '度势，你可以将一张红色手牌当【以逸待劳】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            data.from === player &&
            data.has('yiyidailao')) {
            const phase = room.getCurrentPhase();
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, phase);
            return phase.isOwner(player, 4 /* Phase.Play */) && uses.length < 4;
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.luxun.addSkill(exports.qianxun);
exports.luxun.addSkill(exports.duoshi);
exports.luxun_v2025 = sgs.General({
    name: 'wars.v2025.luxun',
    kingdom: 'wu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qianxun_v2025 = sgs.Skill({
    name: 'wars.v2025.luxun.qianxun',
});
exports.qianxun_v2025.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from !== player &&
            data.card &&
            data.card.hasSubCards() &&
            data.card.type === 2 /* CardType.Scroll */ &&
            data.targetCount === 1 &&
            data.current.target === player &&
            player.getUpOrSideCards('$mark.jie').length < 3);
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = data.card.subcards.slice();
        await room.puto({
            player: from,
            cards,
            toArea: from.upArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
        cards.forEach((v) => v.setMark('$mark.jie', true));
        from.setMark('$mark.jie', true, {
            visible: true,
            source: this.name,
            type: 'cards',
            areaId: from.upArea.areaId,
        });
        return true;
    },
    async effect(room, data, context) {
        await data.cancleCurrent();
    },
}));
exports.duoshi_v2025 = sgs.Skill({
    name: 'wars.v2025.luxun.duoshi',
});
exports.duoshi_v2025.addEffect(sgs.TriggerEffect({
    name: `${exports.duoshi_v2025.name}0`,
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const yiyidailao = room.createVirtualCardByNone('yiyidailao', undefined, false);
                yiyidailao.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.color === 1 /* CardColor.Red */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    yiyidailao.addSubCard(item);
                                if (type === 'remove')
                                    yiyidailao.delSubCard(item);
                                yiyidailao.set();
                                this._use_or_play_vcard = yiyidailao;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '度势，你可以将一张红色手牌当【以逸待劳】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            data.from === player &&
            data.has('yiyidailao') &&
            !player.getData(this.name)) {
            const phase = room.getCurrentPhase();
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, phase);
            return phase.isOwner(player, 4 /* Phase.Play */) && uses.length < 1;
        }
    },
    async cost(room, data, context) {
        this.player?.setData(this.name, true);
        return true;
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                await this.player?.removeData(this.name);
            },
        },
    ],
}));
exports.duoshi_v2025.addEffect(sgs.TriggerEffect({
    name: `${exports.duoshi_v2025.name}1`,
    auto_log: 1,
    trigger: "NeedUseCard2" /* EventTriggers.NeedUseCard2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            player.hasHandCards() &&
            !player.getData(this.name)) {
            const canuses = ['huogong', 'sha', 'huoshaolianying'].filter((v) => room.cardNames.includes(v) && data.has(v, 0));
            if (canuses.length === 0)
                return false;
            const phase = room.getCurrentPhase();
            let count = 0;
            room.playerAlives.forEach((v) => {
                count += v.getUpOrSideCards('$mark.jie').length;
            });
            return phase.isOwner(player, 4 /* Phase.Play */) && count >= 3;
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
                const canuses = context.canuses;
                let vcards = [];
                ['huogong', 'sha', 'huoshaolianying'].forEach((v) => {
                    if (room.cardNames.includes(v) &&
                        canuses.find((c) => c.name === v)) {
                        vcards.push(room.createVirtualCard(v, [], undefined, true, false));
                    }
                });
                vcards.forEach((v) => {
                    v.custom.method = 1;
                    if (v.name === 'sha') {
                        v.set({ attr: [1 /* CardAttr.Fire */] });
                    }
                    v.custom.canuse = from.canUseCard(v, undefined, this.name, { excluesToCard: true });
                });
                const cards = [];
                room.playerAlives.forEach((v) => {
                    cards.push(...v.getUpOrSideCards('$mark.jie'));
                });
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 2,
                            count: 3,
                            selectable: cards,
                        }),
                        vcard: room.createChooseVCard({
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
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `度势，你可以将3张“节”置入弃牌堆，视为使用一张火焰伤害牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.puto({
            player: from,
            cards,
            toArea: room.discardArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        this.player?.setData(this.name, true);
        from.refreshMark = '$mark.jie';
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                await this.player?.removeData(this.name);
            },
        },
    ],
}));
exports.luxun_v2025.addSkill(exports.qianxun_v2025);
exports.luxun_v2025.addSkill(exports.duoshi_v2025);
sgs.loadTranslation({
    ['$mark.jie']: '节',
    [`@method:${exports.duoshi_v2025.name}0`]: '使用【以逸待劳】',
    [`@method:${exports.duoshi_v2025.name}1`]: '使用火焰伤害牌',
});
