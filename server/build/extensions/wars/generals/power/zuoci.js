"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.huashen = exports.xinsheng = exports.zuoci = void 0;
exports.zuoci = sgs.General({
    name: 'wars.zuoci',
    kingdom: 'qun',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.xinsheng = sgs.Skill({
    name: 'wars.zuoci.xinsheng',
});
exports.xinsheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && player === data.to;
    },
    async cost(room, data, context) {
        const { from } = context;
        const general = room.generalArea.get(1, sgs.DataType.General, 'random');
        if (general.length) {
            await room.addWarsHuashen(from, general.at(0), 'mark.huashen');
        }
        return true;
    },
}));
exports.huashen = sgs.Skill({
    name: 'wars.zuoci.huashen',
});
exports.huashen.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            choose_general: () => {
                const generals = room.getGenerals(context.generals);
                return {
                    selectors: {
                        general: room.createChooseGeneral({
                            step: 1,
                            count: 2,
                            selectable: generals,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '化身',
                                timebar: room.responseTime,
                                prompt: '化身：请选择两张武将牌作为“化身”',
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose_general2: () => {
                const generals = room.getGenerals(context.generals);
                return {
                    selectors: {
                        general: room.createChooseGeneral({
                            step: 1,
                            count: 1,
                            selectable: generals,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '化身',
                                timebar: room.responseTime,
                                prompt: '化身：请选择一张“化身”替换',
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from } = context;
        const huashen = from.upArea.generals.filter((v) => v.hasMark('mark.huashen'));
        if (huashen.length < 2) {
            const news = room.generalArea.get(5, sgs.DataType.General, 'random');
            context.generals = room.getGeneralIds(news);
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_general'),
                    context,
                },
            });
            const obs = req.result.results.general.result;
            for (const general of obs) {
                await room.addWarsHuashen(from, general, 'mark.huashen');
            }
        }
        else {
            context.generals = room.getGeneralIds(huashen);
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_general2'),
                    context,
                },
            });
            const rep = req.result.results.general.result.at(0);
            if (rep) {
                await room.removeWarsHuashen(from, rep, 'mark.huashen');
                const general = room.generalArea.get(1, sgs.DataType.General, 'random');
                if (general.length) {
                    await room.addWarsHuashen(from, general.at(0), 'mark.huashen');
                }
            }
        }
    },
}));
exports.zuoci.addSkill('wars.zuoci.huashen');
exports.zuoci.addSkill('wars.zuoci.xinsheng');
sgs.loadTranslation({
    ['mark.huashen']: '化身',
    ['mark.huashen.count']: '化身',
});
