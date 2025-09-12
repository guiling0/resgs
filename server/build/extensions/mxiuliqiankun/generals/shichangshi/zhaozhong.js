"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chiye_delay = exports.chiye = exports.cs_zhaozhong = void 0;
exports.cs_zhaozhong = sgs.General({
    name: 'mobile.cs_zhaozhong',
    kingdom: 'qun',
    hp: 1,
    gender: 1 /* Gender.Male */,
    enable: false,
    hidden: true,
});
exports.chiye = sgs.Skill({
    name: 'mobile.cs_zhaozhong.chiye',
});
exports.chiye.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            data.card.name === 'sha' &&
            data.from === player &&
            data.current &&
            data.current.target);
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '鸱咽',
                                timebar: room.responseTime,
                                prompt: `鸱咽：请选择至多一张牌，扣置于其的武将牌旁`,
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
        const puto = await room.puto({
            player: from,
            cards,
            toArea: target.sideArea,
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
        });
        cards.forEach((v) => v.setMark('mark.chiye', true));
        return puto;
    },
    async effect(room, data, context) {
        const { targets: [target], } = context;
        target.setMark('mark.chiye', true, {
            type: 'cards',
            visible: true,
            areaId: target.sideArea.areaId,
            source: this.name,
        });
        const effect = await room.addEffect('chiye.delay', target);
        effect.setData('data', room.currentTurn);
    },
}));
exports.chiye_delay = sgs.TriggerEffect({
    name: 'chiye.delay',
    trigger: "TurnEnd" /* EventTriggers.TurnEnd */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            this.getData('data') === data &&
            player.hasUpOrSideCards('mark.chiye'));
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = from.getUpOrSideCards('mark.chiye');
        return await room.obtainCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        from.removeMark('mark.chiye');
        await this.removeSelf();
    },
});
exports.chiye.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "CauseDamage1" /* EventTriggers.CauseDamage1 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.reason === 'sha' &&
            data.to &&
            data.to.getHandCards().length <= player.getHandCards().length &&
            data.to.getEquipCards().length <= player.getEquipCards().length);
    },
    async cost(room, data, context) {
        data.number++;
        return true;
    },
}));
exports.cs_zhaozhong.addSkill(exports.chiye);
sgs.loadTranslation({
    ['mark.chiye']: '鸱咽',
});
