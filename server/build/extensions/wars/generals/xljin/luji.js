"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qinghe = exports.heli = exports.qinggang = exports.luji_jin = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.luji_jin = sgs.General({
    name: 'xl.luji_jin',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qinggang = sgs.Skill({
    name: 'xl.luji_jin.qinggang',
});
exports.qinggang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from !== player &&
            data.targetCount === 1 &&
            data.current.target &&
            data.current.target === player &&
            player.canPindian([data.from], this.name));
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.pindian({
            from,
            targets: [target],
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: `@qinggang`,
                thinkPrompt: this.name,
            },
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const pindian = context.cost;
        if (pindian.win === from) {
            await data.invalidCurrent();
        }
        if (pindian.lose.includes(from)) {
            await data.targetCantResponse([from]);
        }
    },
}));
exports.qinggang.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Regard_PindianResult](cards, reason) {
        if (cards.get(this.player)) {
            const pindian_cards = [...cards.values()];
            const length1 = sgs.getTranslation(pindian_cards[0]?.name) ?? 0;
            const length2 = sgs.getTranslation(pindian_cards[1]?.name) ?? 0;
            if (length1 === length2) {
                return this.player;
            }
        }
    },
}));
exports.heli = sgs.Skill({
    name: 'xl.luji_jin.heli',
});
exports.heli.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "Death" /* EventTriggers.Death */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
    },
    context(room, player, data) {
        return {
            targets: room.getPlayerByFilter((v) => v !== this.player && room.sameAsKingdom(v, this.player)),
        };
    },
    async effect(room, data, context) {
        const { targets } = context;
        for (const target of targets) {
            await room.chooseYesOrNo(target, {
                prompt: `@heli`,
                thinkPrompt: this.name,
            }, async () => {
                await room.losehp({
                    player: target,
                    source: data,
                    reason: this.name,
                });
                await room.drawCards({
                    player: target,
                    count: 3,
                    source: data,
                    reason: this.name,
                });
            });
        }
    },
}));
exports.qinghe = sgs.Skill({
    name: 'xl.luji_jin.qinghe',
});
exports.qinghe.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "TurnStarted" /* EventTriggers.TurnStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.player === player &&
            this.skill &&
            this.skill.sourceGeneral);
    },
    async cost(room, data, context) {
        const luyun = room.getGeneral('xl.luyun');
        if (luyun && luyun.area && luyun.area.type !== 91 /* AreaType.Hand */) {
            await room.change({
                player: this.player,
                general: this.skill.sourceGeneral,
                to_general: luyun,
                triggerNot: true,
                source: data,
                reason: this.name,
            });
            const skill = room.skills.find((v) => v.name === 'xl.luyun.pingyuan');
            if (skill) {
                skill.setInvalids('pingyuan', true);
            }
            return true;
        }
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.skill) {
                    this.skill.setInvalids('qinghe', false);
                }
            },
        },
    ],
}));
exports.luji_jin.addSkill(exports.qinggang);
exports.luji_jin.addSkill(exports.heli);
exports.luji_jin.addSkill(exports.qinghe);
sgs.loadTranslation({
    ['@qinggang']: '清刚：请选择一张牌拼点',
    ['@heli']: '鹤唳：是否失去1点体力并摸三张牌',
});
