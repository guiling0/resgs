"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhuosheng_delay = exports.zhuosheng = exports.shibao = void 0;
exports.shibao = sgs.General({
    name: 'wars.shibao',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.zhuosheng = sgs.Skill({
    name: 'wars.shibao.zhuosheng',
});
exports.zhuosheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    audio: ['shibao/zhuosheng1'],
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !this.getData('delay') &&
            data.has_filter((v) => v.toArea === player.handArea));
    },
    async effect(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('wars.zhuosheng.delay', from);
        this.setData('delay', effect);
        effect.setData('main', this);
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                const effect = this.removeData('delay');
                if (effect)
                    await effect.removeSelf();
            },
        },
    ],
}));
exports.zhuosheng_delay = sgs.TriggerEffect({
    name: 'wars.zhuosheng.delay',
    audio: ['shibao/zhuosheng2'],
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && player === data.from;
    },
    async cost(room, data, context) {
        const { from } = context;
        data.baseDamage += 1;
        await this.removeSelf();
        this.getData('main')?.removeData('delay');
        return true;
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
    ],
});
exports.shibao.addSkill(exports.zhuosheng);
sgs.loadTranslation({
    [exports.zhuosheng_delay.name]: '擢升',
});
