"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qinggangjian_skill = exports.qinggangjian = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.qinggangjian = sgs.CardUseEquip({
    name: 'qinggangjian',
});
sgs.setCardData('qinggangjian', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'an',
});
exports.qinggangjian_skill = sgs.Skill({
    name: 'qinggangjian',
    attached_equip: 'qinggangjian',
});
exports.qinggangjian_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 2;
        }
    },
}));
exports.qinggangjian_skill.addEffect(sgs.TriggerEffect({
    anim: 'qinggangjian_skill',
    audio: ['qinggangjian'],
    auto_log: 1,
    auto_directline: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
            const { from, card } = data;
            return card.name === 'sha' && player === from;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { targets: { [0]: target }, } = context;
        target.setMark('qinggangjian_invalidity', true);
        const effect = await room.addEffect('qinggnagjian_end');
        effect.setData('qinggangjian_data', data);
        effect.setData('qinggangjian_target', data.current);
    },
}));
async function qinggangjian_end_func(room, data) {
    const _data = this.getData('qinggangjian_data');
    const _target = this.getData('qinggangjian_target');
    const trigger = data.trigger;
    if (!_data || !_target) {
        await this.removeSelf();
        return;
    }
    if (
    //对其无效的此【杀】对此目标进行的使用流程结束
    (trigger === "CardEffectStart" /* EventTriggers.CardEffectStart */ &&
        data === _data &&
        _target.invalid &&
        _target.generator === "CardEffectBefore" /* EventTriggers.CardEffectBefore */) ||
        //此【杀】被其使用的【闪】抵消
        (trigger === "BeOffset" /* EventTriggers.BeOffset */ &&
            data.is(sgs.DataType.UseCardEvent) &&
            data.current === _target) ||
        //确定其因执行此牌的效果而造成的伤害的最终的伤害值
        (trigger === "ReduceHpStart" /* EventTriggers.ReduceHpStart */ &&
            data.is(sgs.DataType.ReduceHpEvent) &&
            data.getDamage().source === _data &&
            data.getDamage().source.cast(sgs.DataType.UseCardEvent)?.current ===
                _target) ||
        //防止其因执行此牌的效果而造成的伤害
        (trigger === "DamageEnd" /* EventTriggers.DamageEnd */ &&
            data.is(sgs.DataType.DamageEvent) &&
            data.source === _data &&
            data.source.cast(sgs.DataType.UseCardEvent)?.current === _target) ||
        //该使用事件结束清除此效果
        (trigger === "UseCardEnd3" /* EventTriggers.UseCardEnd3 */ && data === _data)) {
        _target.target.removeMark('qinggangjian_invalidity');
        await this.removeSelf();
    }
}
const qinggnagjian_end = sgs.StateEffect({
    name: 'qinggnagjian_end',
    [skill_types_1.StateEffectType.Skill_Invalidity](effect) {
        return (effect.skill &&
            effect.skill.data.attached_equip &&
            sgs.utils.getCardSubtype(effect.skill.data.attached_equip) ===
                32 /* CardSubType.Armor */ &&
            effect.skill.player &&
            effect.skill.player.hasMark('qinggangjian_invalidity'));
    },
    lifecycle: [
        {
            trigger: "CardEffectStart" /* EventTriggers.CardEffectStart */,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
        {
            trigger: "BeOffset" /* EventTriggers.BeOffset */,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
        {
            trigger: "ReduceHpStart" /* EventTriggers.ReduceHpStart */,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
        {
            trigger: "DamageEnd" /* EventTriggers.DamageEnd */,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
        {
            trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
    ],
});
