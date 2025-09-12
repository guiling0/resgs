"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anfu = exports.dangwan = exports.zhouzhi = void 0;
exports.zhouzhi = sgs.General({
    name: 'xl.zhouzhi',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.dangwan = sgs.Skill({
    name: 'xl.zhouzhi.dangwan',
});
exports.dangwan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            !data.card.transform &&
            (data.card.name === 'sha' || data.card.name === 'juedou') &&
            data.current.target.hasCanDropCards('h', data.current.target, 1, this.name) &&
            player.isBigKingdom() &&
            data.current.target.isSmallKingdom());
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
                        cards: room.createDropCards(target, {
                            step: 1,
                            count: 1,
                            selectable: target.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '当万：请弃置一张手牌',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        context.cards = cards;
        return await room.dropCards({
            player: target,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.dangwan.addEffect(sgs.StateEffect({
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                room.setMark('#dangwan', this.id);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                room.removeMark('#dangwan');
            },
        },
    ],
}));
exports.anfu = sgs.Skill({
    name: 'xl.zhouzhi.anfu',
});
exports.anfu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        if (data.has_lose(player, 'h') &&
            !player.hasHandCards() &&
            player !== this.player) {
            const phase = room.getCurrentPhase();
            if (!phase.isOwner(this.player, 4 /* Phase.Play */))
                return false;
            if (!player.hasDeputy())
                return false;
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    context(room, player, data) {
        return {
            from: this.player,
            targets: [player],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const target = context.targets.at(0);
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: {
                        text: `是否发动[b]暗伏[/b]，让{0}选择移除副将或让你获得他装备区里的一张牌`,
                        values: [
                            { type: 'player', value: target.playerId },
                        ],
                    },
                });
            },
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
                        prompt: '暗伏：请选择一项',
                        showMainButtons: false,
                    },
                };
            },
            choose_card: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getEquipCards(),
                            data_rows: target.getCardsToArea('e'),
                            windowOptions: {
                                title: '暗伏',
                                timebar: room.responseTime,
                                prompt: '暗伏：请选择一张牌获得',
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
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const remove = room.createEventData(sgs.DataType.RemoveEvent, {
            player: target,
            general: target.deputy,
            source: data,
            reason: this.name,
        });
        const handles = [];
        handles.push(`${remove.check() ? '' : '!'}anfu.remove`);
        if (target.getEquipCards().length > 0) {
            handles.push(`anfu.card`);
        }
        else {
            handles.push(`!anfu.card`);
        }
        context.handles = handles;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('anfu.card')) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_card'),
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
        if (result.includes('anfu.remove')) {
            await room.remove(remove);
        }
    },
}));
exports.zhouzhi.addSkill(exports.dangwan);
exports.zhouzhi.addSkill(exports.anfu);
sgs.loadTranslation({
    ['anfu.remove']: '移除副将',
    ['anfu.card']: '获得你装备区里的一张牌',
});
