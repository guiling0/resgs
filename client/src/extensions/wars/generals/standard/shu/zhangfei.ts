import { CardSubType } from '../../../../../core/card/card.types';
import { EventData } from '../../../../../core/event/data';
import { EventTriggers } from '../../../../../core/event/triggers';
import {
    TargetListItem,
    UseCardEvent,
} from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { GameRoom } from '../../../../../core/room/room';
import { TriggerEffect } from '../../../../../core/skill/effect';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

function checkLiubeiLevel(room: GameRoom) {
    const wuhu = room.getEffect(room.getMark<number>('#wuhujiangdaqi'));
    return wuhu ? wuhu.isOpen() && wuhu.check() : false;
}

export const zhangfei = sgs.General({
    name: 'wars.zhangfei',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const paoxiao = sgs.Skill({
    name: 'wars.zhangfei.paoxiao',
});

paoxiao.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
            return this.isOwner(from) && card.name === 'sha';
        },
    })
);

paoxiao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Lock],
        priorityType: PriorityType.None,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data) {
            if (data.is(sgs.DataType.UseCardEvent)) {
                const { from, card } = data;
                return (
                    card.name === 'sha' &&
                    this.player === from &&
                    this.player.getMark<number>('__sha_times') >= 2
                );
            }
        },
    })
);

paoxiao.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.UseCardEvent) &&
                data.from === player &&
                data.card.name === 'sha'
            ) {
                const history = room.getHistorys(
                    sgs.DataType.UseCardEvent,
                    (v) => v.from === player && v.card.name === 'sha',
                    room.currentTurn
                );
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
    })
);

//五虎将大旗升级
paoxiao.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        audio: [],
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                checkLiubeiLevel(room) &&
                data.is(sgs.DataType.UseCardEvent)
            ) {
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
            target.setMark('paoxiao_invalidity', true);
            const effect = await room.addEffect('paoxiao_end');
            effect.setData('paoxiao_data', data);
            effect.setData('paoxiao_target', data.current);
        },
    })
);

async function paoxiao_end_func(
    this: TriggerEffect,
    room: GameRoom,
    data: EventData
) {
    const _data = this.getData<UseCardEvent>('paoxiao_data');
    const _target = this.getData<TargetListItem>('paoxiao_target');
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
        _target.target.removeMark('paoxiao_invalidity');
        await this.removeSelf();
    }
}

const paoxiao_end = sgs.StateEffect({
    name: 'paoxiao_end',
    [StateEffectType.Skill_Invalidity](effect) {
        return (
            effect.skill &&
            effect.skill.data.attached_equip &&
            sgs.utils.getCardSubtype(effect.skill.data.attached_equip) ===
                CardSubType.Armor &&
            effect.skill.player &&
            effect.skill.player.hasMark('paoxiao_invalidity')
        );
    },
    lifecycle: [
        {
            trigger: EventTriggers.CardEffectStart,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
        {
            trigger: EventTriggers.BeOffset,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
        {
            trigger: EventTriggers.ReduceHpStart,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
        {
            trigger: EventTriggers.DamageEnd,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
        {
            trigger: EventTriggers.UseCardEnd3,
            priority: 'after',
            on_exec: paoxiao_end_func,
        },
    ],
});

zhangfei.addSkill(paoxiao);
