"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paoxiao = exports.zhangfei = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
function checkLiubeiLevel(room) {
    const wuhu = room.getEffect(room.getMark('#wuhujiangdaqi'));
    return wuhu ? wuhu.isOpen() && wuhu.check() : false;
}
exports.zhangfei = sgs.General({
    name: 'wars.zhangfei',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.paoxiao = sgs.Skill({
    name: 'wars.zhangfei.paoxiao',
});
exports.paoxiao.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
        return this.isOwner(from) && card.name === 'sha';
    },
}));
exports.paoxiao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    tag: [1 /* SkillTag.Lock */],
    priorityType: 0 /* PriorityType.None */,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        if (data.is(sgs.DataType.UseCardEvent)) {
            const { from, card } = data;
            return (card.name === 'sha' &&
                this.player === from &&
                this.player.getMark('__sha_times') >= 2);
        }
    },
}));
exports.paoxiao.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.UseCardEvent) &&
            data.from === player &&
            data.card.name === 'sha') {
            const history = room.getHistorys(sgs.DataType.UseCardEvent, (v) => v.from === player && v.card.name === 'sha', room.currentTurn);
            return history.length === 2;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
//五虎将大旗升级
exports.paoxiao.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    audio: [],
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            checkLiubeiLevel(room) &&
            data.is(sgs.DataType.UseCardEvent)) {
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
        target.setMark('paoxiao_invalidity', true);
        const effect = await room.addEffect('paoxiao_end');
        effect.setData('paoxiao_data', data);
        effect.setData('paoxiao_target', data.current);
    },
}));
async function paoxiao_end_func(room, data) {
    const _data = this.getData('paoxiao_data');
    const _target = this.getData('paoxiao_target');
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
        _target.target.removeMark('paoxiao_invalidity');
        await this.removeSelf();
    }
}
const paoxiao_end = sgs.StateEffect({
    name: 'paoxiao_end',
    [skill_types_1.StateEffectType.Skill_Invalidity](effect) {
        return (effect.skill &&
            effect.skill.data.attached_equip &&
            sgs.utils.getCardSubtype(effect.skill.data.attached_equip) ===
                32 /* CardSubType.Armor */ &&
            effect.skill.player &&
            effect.skill.player.hasMark('paoxiao_invalidity'));
    },
    lifecycle: [
        {
            trigger: "CardEffectStart" /* EventTriggers.CardEffectStart */,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
        {
            trigger: "BeOffset" /* EventTriggers.BeOffset */,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
        {
            trigger: "ReduceHpStart" /* EventTriggers.ReduceHpStart */,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
        {
            trigger: "DamageEnd" /* EventTriggers.DamageEnd */,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
        {
            trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
    ],
});
exports.zhangfei.addSkill(exports.paoxiao);
