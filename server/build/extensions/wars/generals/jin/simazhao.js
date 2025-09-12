"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beiluan_delay = exports.beiluan = exports.zhaoran = exports.simazhao = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.simazhao = sgs.General({
    name: 'wars.simazhao',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.zhaoran = sgs.Skill({
    name: 'wars.simazhao.zhaoran',
});
exports.zhaoran.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
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
                        canCancle: true,
                        showMainButtons: false,
                        prompt: `昭然：你可以明置一张武将牌，令${context.from.gameName}结束当前回合`,
                        thinkPrompt: '昭然',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const count = room.getKingdomCount(false);
        return await room.drawCards({
            player: from,
            count: 4 - count,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const players = room.sortResponse(room.playerAlives);
        while (players.length > 0) {
            const player = players.shift();
            if (player === from)
                continue;
            if (!player.isNoneKingdom())
                continue;
            const openHead = room.createEventData(sgs.DataType.OpenEvent, {
                player,
                generals: [player.head],
                source: data,
                reason: this.name,
            });
            const openDeputy = room.createEventData(sgs.DataType.OpenEvent, {
                player,
                generals: [player.deputy],
                source: data,
                reason: this.name,
            });
            const handles = [];
            handles.push(`${openHead.check() ? '' : '!'}openHead`);
            handles.push(`${openDeputy.check() ? '' : '!'}openDeputy`);
            context.handles = handles;
            const req = await room.doRequest({
                player,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = req.result.results.option.result;
            if (result.includes('openHead')) {
                await room.open(openHead);
                await room.currentTurn.end();
                break;
            }
            if (result.includes('openDeputy')) {
                await room.open(openDeputy);
                await room.currentTurn.end();
                break;
            }
        }
    },
}));
exports.beiluan = sgs.Skill({
    name: 'wars.simazhao.beiluan',
});
exports.beiluan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.to === player && data.from;
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    async effect(room, data, context) {
        const { targets: [target], } = context;
        if (target) {
            const effect = await room.addEffect('beiluan.delay', target);
            effect.setData('turn', room.currentTurn);
        }
    },
}));
exports.beiluan_delay = sgs.StateEffect({
    name: 'beiluan.delay',
    [skill_types_1.StateEffectType.Regard_CardData](card, property, source) {
        if (card.area === this.player.handArea &&
            property === 'name' &&
            sgs.utils.getCardType(source) !== 3 /* CardType.Equip */) {
            return 'sha';
        }
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                this.player?.setMark(this.name, true, {
                    visible: true,
                });
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                this.player?.removeMark(this.name);
            },
        },
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
exports.simazhao.addSkill(exports.zhaoran);
exports.simazhao.addSkill(exports.beiluan);
sgs.loadTranslation({
    [exports.beiluan_delay.name]: '备乱',
});
