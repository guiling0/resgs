"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cixiong_skill = exports.cixiongshuanggujian = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.cixiongshuanggujian = sgs.CardUseEquip({
    name: 'cixiongshuanggujian',
});
sgs.setCardData('cixiongshuanggujian', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'an',
});
exports.cixiong_skill = sgs.Skill({
    name: 'cixiongshuanggujian',
    attached_equip: 'cixiongshuanggujian',
});
exports.cixiong_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 2;
        }
    },
}));
exports.cixiong_skill.addEffect(sgs.TriggerEffect({
    anim: 'cixiongshuanggujian_skill',
    audio: ['cixiongshuanggujian'],
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    getSelectors(room, context) {
        const target = context.targets.at(0);
        return {
            choose: () => {
                return {
                    selectors: {
                        card: room.createDropCards(target, {
                            step: 1,
                            count: 1,
                            selectable: target.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `雌雄双股剑：你需要弃置一张牌，否则${context.from?.gameName}摸一张牌`,
                        thinkPrompt: '雌雄双股剑',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
            const { from, current, card } = data;
            return (card.name === 'sha' &&
                player === from &&
                room.differentAsGender(player, current.target));
        }
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    async cost(room, data, context) {
        const { from, targets } = context;
        const target = targets.at(0);
        if (!target)
            return;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'card').result;
        const drop = await room.dropCards({
            player: target,
            cards: result,
            source: data,
            reason: this.name,
        });
        if (!drop) {
            await room.drawCards({
                player: from,
                count: 1,
                source: data,
                reason: this.name,
            });
        }
        return true;
    },
}));
