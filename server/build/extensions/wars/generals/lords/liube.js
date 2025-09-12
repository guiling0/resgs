"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lord_liubei_rende = exports.jizhao = exports.zhangwu = exports.shouyue = exports.lord_liubei = void 0;
const liubei_1 = require("../standard/shu/liubei");
exports.lord_liubei = sgs.General({
    name: 'wars.lord_liubei',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    lord: true,
    enable: false,
    isWars: true,
});
exports.shouyue = sgs.Skill({
    name: 'wars.lord_liubei.shouyue',
});
exports.shouyue.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */, 6 /* SkillTag.Lord */],
    priorityType: 0 /* PriorityType.None */,
    trigger: "StateChangeEnd" /* EventTriggers.StateChangeEnd */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.OpenEvent) &&
            data.generals.includes(this.skill?.sourceGeneral));
    },
    async effect(room, data, context) {
        room.broadcast({
            type: 'MsgChangeBgmAndBg',
            bg_url: 'resources/background/shu.png',
            bgm_url: 'resources/background/shu.mp3',
            bgm_loop: false,
        });
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                room.setMark('#wuhujiangdaqi', this.id);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                room.removeMark('#wuhujiangdaqi');
            },
        },
    ],
}));
exports.zhangwu = sgs.Skill({
    name: 'wars.lord_liubei.zhangwu',
});
//章武 ①当【飞龙夺凤】移至弃牌堆或其他角色的装备区后，你获得此【飞龙夺凤】。
exports.zhangwu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    tag: [1 /* SkillTag.Lock */],
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.has_filter((d, c) => c.name === 'feilongduofeng' &&
                (d.toArea === room.discardArea ||
                    (d.toArea.type === 92 /* AreaType.Equip */ &&
                        d.toArea !== player.equipArea))));
    },
    async cost(room, data, context) {
        const { from } = context;
        const card = data.getCard((v, c) => c.name === 'feilongduofeng');
        if (card) {
            return await room.obtainCards({
                player: from,
                cards: [card],
                source: data,
                reason: this.name,
            });
        }
    },
}));
//章武 ②当你并非因使用【飞龙夺凤】而失去【飞龙夺凤】前，你展示此【飞龙夺凤】，将此【飞龙夺凤】的此次移动的目标区域改为牌堆底。
exports.zhangwu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    tag: [1 /* SkillTag.Lock */],
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.has_filter((v, c) => c.name === 'feilongduofeng' &&
                (v.fromArea === player.handArea ||
                    v.fromArea === player.equipArea)) &&
            (!data.source.is(sgs.DataType.UseCardEvent) ||
                data.source.card?.name !== 'feilongduofeng'));
    },
    async cost(room, data, context) {
        let feilong = data.getCard((v, c) => c.name === 'feilongduofeng');
        if (feilong) {
            await data.cancle([feilong], false);
            data.add({
                cards: [feilong],
                toArea: room.drawArea,
                reason: 1 /* MoveCardReason.PutTo */,
                movetype: 1 /* CardPut.Up */,
                puttype: 2 /* CardPut.Down */,
                animation: true,
            });
            return true;
        }
    },
}));
//③当你并非因使用【飞龙夺凤】而失去【飞龙夺凤】后，你摸两张牌。
exports.zhangwu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    tag: [1 /* SkillTag.Lock */],
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.has_filter((v, c) => c.name === 'feilongduofeng' &&
                (v.fromArea === player.handArea ||
                    v.fromArea === player.equipArea)) &&
            (!data.source.is(sgs.DataType.UseCardEvent) ||
                data.source.card?.name !== 'feilongduofeng'));
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
}));
exports.jizhao = sgs.Skill({
    name: 'wars.lord_liubei.jizhao',
});
exports.jizhao.addEffect(sgs.TriggerEffect({
    tag: [5 /* SkillTag.Limit */],
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "Dying" /* EventTriggers.Dying */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const count = from.maxhp - from.getHandCards().length;
        await room.drawCards({
            player: from,
            count,
            source: data,
            reason: this.name,
        });
        await room.recoverTo({
            player: from,
            number: 2,
            source: data,
            reason: this.name,
        });
        const skill = room.skills.find((v) => v.name === 'wars.lord_liubei.shouyue' &&
            v.sourceGeneral === this.skill?.sourceGeneral);
        await skill?.removeSelf();
        await room.addSkill('wars.lord_liubei.rende', from, {
            source: this.name,
            showui: 'default',
        });
    },
}));
exports.lord_liubei_rende = sgs.Skill(sgs.copy(liubei_1.rende, { name: 'wars.lord_liubei.rende' }));
exports.lord_liubei.addSkill(exports.shouyue);
exports.lord_liubei.addSkill('#wars.lord_liubei.wuhujiangdaqi');
exports.lord_liubei.addSkill(exports.zhangwu);
exports.lord_liubei.addSkill(exports.jizhao);
exports.lord_liubei.addSkill('#wars.lord_liubei.rende');
