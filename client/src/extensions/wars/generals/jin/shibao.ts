import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { UseCardEvent, UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { TriggerEffect } from '../../../../core/skill/effect';

export const shibao = sgs.General({
    name: 'wars.shibao',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const zhuosheng = sgs.Skill({
    name: 'wars.shibao.zhuosheng',
});

zhuosheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        audio: ['shibao/zhuosheng1'],
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                !this.getData('delay') &&
                data.has_filter((v) => v.toArea === player.handArea)
            );
        },
        async effect(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('wars.zhuosheng.delay', from);
            this.setData('delay', effect);
            effect.setData('main', this);
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data) {
                    const effect = this.removeData<TriggerEffect>('delay');
                    if (effect) await effect.removeSelf();
                },
            },
        ],
    })
);

export const zhuosheng_delay = sgs.TriggerEffect({
    name: 'wars.zhuosheng.delay',
    audio: ['shibao/zhuosheng2'],
    trigger: EventTriggers.CardBeUse,
    can_trigger(room, player, data: UseEvent) {
        return this.isOwner(player) && player === data.from;
    },
    async cost(room, data: UseCardEvent, context) {
        const { from } = context;
        data.baseDamage += 1;
        await this.removeSelf();
        this.getData<TriggerEffect>('main')?.removeData('delay');
        return true;
    },
    lifecycle: [
        {
            trigger: EventTriggers.onObtain,
            async on_exec(room, data) {
                this.player?.setMark(this.name, true, {
                    visible: true,
                });
            },
        },
        {
            trigger: EventTriggers.onLose,
            async on_exec(room, data) {
                this.player?.removeMark(this.name);
            },
        },
    ],
});

shibao.addSkill(zhuosheng);

sgs.loadTranslation({
    [zhuosheng_delay.name]: '擢升',
});
