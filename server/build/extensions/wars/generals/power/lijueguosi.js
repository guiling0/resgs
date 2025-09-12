"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xiongsuan_delay = exports.xiongsuan = exports.lijueguosi = void 0;
exports.lijueguosi = sgs.General({
    name: 'wars.lijueguosi',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isDualImage: true,
    isWars: true,
});
exports.xiongsuan = sgs.Skill({
    name: 'wars.lijueguosi.xiongsuan',
});
exports.xiongsuan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    tag: [5 /* SkillTag.Limit */],
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return room.sameAsKingdom(from, item);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `凶算：你可以弃置一张牌对与你势力相同的一名角色造成1点伤害，然后摸三张牌`,
                        thinkPrompt: this.name,
                    },
                };
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
                        canCancle: true,
                        prompt: '凶算：你可以选择一个已经发动过的限定技，视为未发动过',
                        showMainButtons: false,
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
        const { from, targets: [to], } = context;
        await room.damage({
            from,
            to,
            source: data,
            reason: this.name,
        });
        await room.drawCards({
            player: from,
            count: 3,
            source: data,
            reason: this.name,
        });
        const skills = room.skills.filter((v) => v.player === to &&
            v.effects.find((e) => e.isLimit &&
                (v.player.getMark(`@limit:${e.id}`) ??
                    '@limit-false') === '@limit-false'));
        if (skills.length > 0) {
            context.handles = skills.map((v) => v.name);
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room
                .getResult(req, 'option')
                .result.at(0);
            if (result) {
                const skill = skills.find((v) => v.name === result);
                if (skill) {
                    const effect = await room.addEffect('xiongsuan.delay', from);
                    effect.setData('skill', skill);
                    effect.setData('data', room.currentTurn);
                }
            }
        }
    },
}));
exports.xiongsuan_delay = sgs.TriggerEffect({
    name: 'xiongsuan.delay',
    audio: [],
    trigger: "TurnEnd" /* EventTriggers.TurnEnd */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            this.getData('data') === data &&
            this.getData('skill'));
    },
    async cost(room, data, context) {
        const skill = this.getData('skill');
        skill.effects.forEach((v) => {
            if (v.isLimit) {
                v.player.setMark(`@limit:${v.id}`, '@limit-true', {
                    type: 'img',
                    visible: v.isOpen() ? true : [this.player.playerId],
                    url: '@limit-true',
                });
            }
        });
        await this.removeSelf();
        return true;
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.lijueguosi.addSkill(exports.xiongsuan);
