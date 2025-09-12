"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiesha_invalids = exports.jiesha_delay_draw = exports.jiesha_delay = exports.jiesha = exports.hufen = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.hufen = sgs.General({
    name: 'xl.hufen',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.jiesha = sgs.Skill({
    name: 'xl.hufen.jiesha',
});
exports.jiesha.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !data.isOwner(player) &&
            player.canUseCard({ name: 'sha', method: 1 }, [data.executor], this.name, { excluesCardDistanceLimit: true }));
    },
    context(room, player, data) {
        return {
            targets: [data.executor],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: [1, 3],
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `截杀，你可以弃置至多三张牌，视为对${target.gameName}使用【杀】`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, cards, targets } = context;
        this.setInvalids(this.name, true);
        const effect = await room.addEffect('jiesha.delay', from);
        effect.setData('count', cards.length);
        effect.setData('skill', this);
        effect.setData('target', targets.at(0));
        const sha = room.createVirtualCardByNone('sha');
        sha.custom.method = 1;
        await room.usecard({
            from,
            targets,
            card: sha,
            noPlayDirectLine: true,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
    lifecycle: [
        {
            trigger: "CircleStarted" /* EventTriggers.CircleStarted */,
            async on_exec(room, data) {
                this.setInvalids(this.name, false);
            },
        },
    ],
}));
exports.jiesha_delay = sgs.TriggerEffect({
    name: 'jiesha.delay',
    audio: [],
    trigger: "CauseDamaged" /* EventTriggers.CauseDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.reason === 'sha' &&
            data.source.is(sgs.DataType.UseCardEvent) &&
            data.source.skill === this.getData('skill') &&
            this.getData('count') &&
            this.getData('target') &&
            this.getData('target').alive);
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const count = context.count;
                const targets = context.targets.at(0);
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: [1, count],
                            selectable: context.handles,
                        }),
                    },
                    options: {
                        canCancle: true,
                        prompt: `截杀：你可以选择至多${count}项令${targets.gameName}执行`,
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
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '截杀',
                                timebar: room.responseTime,
                                prompt: '截杀：请选择一张牌',
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
            choose_general: () => {
                const generals = room.getGenerals(context.generals);
                return {
                    selectors: {
                        general: room.createChooseGeneral({
                            step: 1,
                            count: 1,
                            selectable: generals,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '截杀',
                                timebar: room.responseTime,
                                prompt: '截杀：请选择一张武将牌令所有武将技能失效',
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
    async cost(room, data, context) {
        const { from } = context;
        const handles = [
            'jiesha.draw',
            'jiesha.gain',
            'jiesha.skill',
        ];
        context.handles = handles;
        context.count = this.getData('count');
        const target = this.getData('target');
        context.targets = [target];
        if (!target || !context.count) {
            await this.removeSelf();
            return true;
        }
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('jiesha.draw')) {
            const draw = await room.addEffect('jieyue.delay.draw', target);
            draw.setData('turn', room.currentTurn);
        }
        if (result.includes('jiesha.gain')) {
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
        if (result.includes('jiesha.skill')) {
            const generals = target.getOpenGenerls();
            let tar_general;
            if (generals.length > 1) {
                context.generals = room.getGeneralIds(generals);
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_general'),
                        context,
                    },
                });
                tar_general = req.result.results.general.result.at(0);
            }
            else if (generals.length > 0) {
                tar_general = generals.at(0);
            }
            if (tar_general) {
                target.setMark(this.name, tar_general.trueName, {
                    visible: true,
                });
                const effect = await room.addEffect(`jiesha.invalids`);
                effect.setData('mark', this.name);
                effect.setData('turn', room.currentTurn);
            }
        }
        await this.removeSelf();
        return true;
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
exports.jiesha_delay_draw = sgs.TriggerEffect({
    name: 'jieyue.delay.draw',
    trigger: "DrawPhaseStarted" /* EventTriggers.DrawPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player) && !data.isComplete;
    },
    async cost(room, data, context) {
        data.ratedDrawnum -= 1;
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
exports.jiesha_invalids = sgs.StateEffect({
    name: 'jiesha.invalids',
    [skill_types_1.StateEffectType.Skill_Invalidity](effect) {
        if (effect.player &&
            effect.skill &&
            effect.skill.sourceGeneral &&
            !effect.hasTag(1 /* SkillTag.Lock */)) {
            const markkey = this.getData('mark') ?? 'jiesha.delay';
            const mark = effect.player.getMark(markkey);
            return mark && effect.skill.sourceGeneral.trueName === mark;
        }
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                    const markkey = this.getData('mark') ?? 'jiesha.delay';
                    room.playerAlives.forEach((v) => v.removeMark(markkey));
                }
            },
        },
    ],
});
exports.hufen.addSkill(exports.jiesha);
sgs.loadTranslation({
    [exports.jiesha_delay.name]: '截杀',
    ['jiesha.draw']: '摸牌阶段少摸一张牌',
    ['jiesha.gain']: '获得其区域内的一张牌',
    ['jiesha.skill']: '本回合一张武将牌的非锁定技失效',
});
