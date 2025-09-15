import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventData } from '../../../../core/event/data';
import { EventTriggers } from '../../../../core/event/triggers';
import {
    TargetListItem,
    UseCardEvent,
} from '../../../../core/event/types/event.use';
import { GameRoom } from '../../../../core/room/room';
import { TriggerEffect } from '../../../../core/skill/effect';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const qinggangjian = sgs.CardUseEquip({
    name: 'qinggangjian',
});

sgs.setCardData('qinggangjian', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'an',
});

export const qinggangjian_skill = sgs.Skill({
    name: 'qinggangjian',
    attached_equip: 'qinggangjian',
});

qinggangjian_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 2;
            }
        },
    })
);
qinggangjian_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'qinggangjian_skill',
        audio: ['qinggangjian'],
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
                const { from, card } = data;
                return card.name === 'sha' && player === from;
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            return true;
        },
        async effect(room, data: UseCardEvent, context) {
            const {
                targets: { [0]: target },
            } = context;
            target.setMark('qinggangjian_invalidity', true);
            const effect = await room.addEffect('qinggnagjian_end');
            effect.setData('qinggangjian_data', data);
            effect.setData('qinggangjian_target', data.current);
        },
    })
);

async function qinggangjian_end_func(
    this: TriggerEffect,
    room: GameRoom,
    data: EventData
) {
    const _data = this.getData<UseCardEvent>('qinggangjian_data');
    const _target = this.getData<TargetListItem>('qinggangjian_target');
    const trigger = data.trigger;
    if (!_data || !_target) {
        await this.removeSelf();
        return;
    }
    if (
        //对其无效的此【杀】对此目标进行的使用流程结束
        (trigger === EventTriggers.CardEffectStart &&
            data === _data &&
            _target.invalid &&
            _target.generator === EventTriggers.CardEffectBefore) ||
        //此【杀】被其使用的【闪】抵消
        (trigger === EventTriggers.BeOffset &&
            data.is(sgs.DataType.UseCardEvent) &&
            data.current === _target) ||
        //确定其因执行此牌的效果而造成的伤害的最终的伤害值
        (trigger === EventTriggers.ReduceHpStart &&
            data.is(sgs.DataType.ReduceHpEvent) &&
            data.getDamage().source === _data &&
            data.getDamage().source.cast(sgs.DataType.UseCardEvent)?.current ===
                _target) ||
        //防止其因执行此牌的效果而造成的伤害
        (trigger === EventTriggers.DamageEnd &&
            data.is(sgs.DataType.DamageEvent) &&
            data.source === _data &&
            data.source.cast(sgs.DataType.UseCardEvent)?.current === _target) ||
        //该使用事件结束清除此效果
        (trigger === EventTriggers.UseCardEnd3 && data === _data)
    ) {
        _target.target.removeMark('qinggangjian_invalidity');
        await this.removeSelf();
    }
}

const qinggnagjian_end = sgs.StateEffect({
    name: 'qinggnagjian_end',
    [StateEffectType.Skill_Invalidity](effect) {
        return (
            effect.skill &&
            effect.skill.data.attached_equip &&
            sgs.utils.getCardSubtype(effect.skill.data.attached_equip) ===
                CardSubType.Armor &&
            effect.skill.player &&
            effect.skill.player.hasMark('qinggangjian_invalidity')
        );
    },
    lifecycle: [
        {
            trigger: EventTriggers.CardEffectStart,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
        {
            trigger: EventTriggers.BeOffset,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
        {
            trigger: EventTriggers.ReduceHpStart,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
        {
            trigger: EventTriggers.DamageEnd,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
        {
            trigger: EventTriggers.UseCardEnd3,
            priority: 'after',
            on_exec: qinggangjian_end_func,
        },
    ],
});
