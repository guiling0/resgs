"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.benghuai = exports.baoling = exports.hengzheng = exports.dongzhuo = void 0;
exports.dongzhuo = sgs.General({
    name: 'wars.dongzhuo',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.hengzheng = sgs.Skill({
    name: 'wars.dongzhuo.hengzheng',
});
exports.hengzheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "DrawPhaseStartedAfter" /* EventTriggers.DrawPhaseStartedAfter */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            (player.hp === 1 || !player.hasHandCards()) &&
            room.playerAlives.some((v) => v !== player && v.hasCardsInArea(true)));
    },
    context(room, player, data) {
        return {
            targets: room.playerAlives.filter((v) => v !== player && v.hasCardsInArea(true)),
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const target = room.getPlayer(context.current);
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '横征',
                                timebar: room.responseTime,
                                prompt: '横征，请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '横征',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        await data.end();
        return true;
    },
    async effect(room, data, context) {
        const { from, targets } = context;
        for (const target of targets) {
            context.current = target.playerId;
            if (target === from)
                continue;
            if (!target.hasCardsInArea(true))
                continue;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.baoling = sgs.Skill({
    name: 'wars.dongzhuo.baoling',
});
exports.baoling.addEffect(sgs.TriggerEffect({
    tag: [5 /* SkillTag.Limit */, 1 /* SkillTag.Lock */, 2 /* SkillTag.Head */],
    auto_log: 1,
    trigger: "PlayPhaseEnd" /* EventTriggers.PlayPhaseEnd */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            this.isOpen() &&
            this.player?.hasDeputy());
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.remove({
            player: from,
            general: from.deputy,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.changeMaxHp({
            player: from,
            number: 3,
            source: data,
            reason: this.name,
        });
        await room.recoverhp({
            player: from,
            number: 3,
            source: data,
            reason: this.name,
        });
        await room.addSkill('wars.dongzhuo.benghuai', from, {
            showui: 'default',
            source: this.name,
        });
    },
}));
exports.benghuai = sgs.Skill({
    name: 'wars.dongzhuo.benghuai',
});
exports.benghuai.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            !!room.playerAlives.find((v) => v !== player && v.inthp < player.inthp));
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: context.handles,
                        }),
                    },
                    options: {
                        canCancle: false,
                        prompt: '崩坏：请选择一项',
                        showMainButtons: false,
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from } = context;
        const losehp = room.createEventData(sgs.DataType.LoseHpEvent, {
            player: from,
            source: data,
            reason: this.name,
        });
        const reducemax = room.createEventData(sgs.DataType.ChangeMaxHpEvent, {
            player: from,
            number: -1,
            source: data,
            reason: this.name,
        });
        const handles = [];
        handles.push(`${losehp.check() ? '' : '!'}benghuai.losehp`);
        handles.push(`${reducemax.check() ? '' : '!'}benghuai.reduce`);
        context.handles = handles;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('benghuai.losehp')) {
            await room.losehp(losehp);
        }
        if (result.includes('benghuai.reduce')) {
            await room.changeMaxHp(reducemax);
        }
    },
}));
exports.dongzhuo.addSkill(exports.hengzheng);
exports.dongzhuo.addSkill(exports.baoling);
exports.dongzhuo.addSkill(exports.benghuai, true);
sgs.loadTranslation({
    ['benghuai.losehp']: '失去1点体力',
    ['benghuai.reduce']: '减少1点体力上限',
});
