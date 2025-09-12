"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chenjiang = exports.wangjun = void 0;
exports.wangjun = sgs.General({
    name: 'xl.wangjun',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.chenjiang = sgs.Skill({
    name: 'xl.wangjun.chenjiang',
});
exports.chenjiang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const sha = room.createVirtualCardByNone('sha', undefined, false);
                sha.set({ attr: [1 /* CardAttr.Fire */] });
                sha.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return (item.name === 'sha' &&
                                    item.isCommonSha());
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    sha.addSubCard(item);
                                if (type === 'remove')
                                    sha.delSubCard(item);
                                sha.set({ attr: [1 /* CardAttr.Fire */] });
                                this._use_or_play_vcard = sha;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '沉江：你可以将一张普通【杀】当火【杀】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
            return data.from === player && data.has('sha');
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.chenjiang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            ((data.card.name === 'sha' &&
                data.card.hasAttr(1 /* CardAttr.Fire */)) ||
                data.card.name === 'huogong' ||
                data.card.name === 'huoshaolianying') &&
            data.current.target.hasCanDropCards('he', player, 1, this.name));
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getSelfCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '沉江',
                                timebar: room.responseTime,
                                prompt: '沉江：请选择一张牌',
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
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        context.cards = cards;
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.wangjun.addSkill(exports.chenjiang);
