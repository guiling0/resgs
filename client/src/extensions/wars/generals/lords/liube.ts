import { AreaType } from '../../../../core/area/area.type';
import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DyingEvent } from '../../../../core/event/types/event.die';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { Gender } from '../../../../core/general/general.type';
import { MoveCardReason } from '../../../../core/room/room.types';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';
import { rende } from '../standard/shu/liubei';

export const lord_liubei = sgs.General({
    name: 'wars.lord_liubei',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    lord: true,
    enable: false,
    isWars: true,
});
export const shouyue = sgs.Skill({
    name: 'wars.lord_liubei.shouyue',
});

shouyue.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock, SkillTag.Lord],
        priorityType: PriorityType.None,
        trigger: EventTriggers.StateChangeEnd,
        can_trigger(room, player, data) {
            return (
                data.is(sgs.DataType.OpenEvent) &&
                data.generals.includes(this.skill?.sourceGeneral)
            );
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
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    room.setMark('#wuhujiangdaqi', this.id);
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    room.removeMark('#wuhujiangdaqi');
                },
            },
        ],
    })
);

export const zhangwu = sgs.Skill({
    name: 'wars.lord_liubei.zhangwu',
});

//章武 ①当【飞龙夺凤】移至弃牌堆或其他角色的装备区后，你获得此【飞龙夺凤】。
zhangwu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Lock],
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_filter(
                    (d, c) =>
                        c.name === 'feilongduofeng' &&
                        (d.toArea === room.discardArea ||
                            (d.toArea.type === AreaType.Equip &&
                                d.toArea !== player.equipArea))
                )
            );
        },
        async cost(room, data: MoveCardEvent, context) {
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
    })
);

//章武 ②当你并非因使用【飞龙夺凤】而失去【飞龙夺凤】前，你展示此【飞龙夺凤】，将此【飞龙夺凤】的此次移动的目标区域改为牌堆底。
zhangwu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Lock],
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_filter(
                    (v, c) =>
                        c.name === 'feilongduofeng' &&
                        (v.fromArea === player.handArea ||
                            v.fromArea === player.equipArea)
                ) &&
                (!data.source.is(sgs.DataType.UseCardEvent) ||
                    data.source.card?.name !== 'feilongduofeng')
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            let feilong = data.getCard((v, c) => c.name === 'feilongduofeng');
            if (feilong) {
                await data.cancle([feilong], false);
                data.add({
                    cards: [feilong],
                    toArea: room.drawArea,
                    reason: MoveCardReason.PutTo,
                    movetype: CardPut.Up,
                    puttype: CardPut.Down,
                    animation: true,
                });
                return true;
            }
        },
    })
);

//③当你并非因使用【飞龙夺凤】而失去【飞龙夺凤】后，你摸两张牌。
zhangwu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Lock],
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_filter(
                    (v, c) =>
                        c.name === 'feilongduofeng' &&
                        (v.fromArea === player.handArea ||
                            v.fromArea === player.equipArea)
                ) &&
                (!data.source.is(sgs.DataType.UseCardEvent) ||
                    data.source.card?.name !== 'feilongduofeng')
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                count: 2,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const jizhao = sgs.Skill({
    name: 'wars.lord_liubei.jizhao',
});

jizhao.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Limit],
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.Dying,
        can_trigger(room, player, data: DyingEvent) {
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
            const skill = room.skills.find(
                (v) =>
                    v.name === 'wars.lord_liubei.shouyue' &&
                    v.sourceGeneral === this.skill?.sourceGeneral
            );
            await skill?.removeSelf();
            await room.addSkill('wars.lord_liubei.rende', from, {
                source: this.name,
                showui: 'default',
            });
        },
    })
);

export const lord_liubei_rende = sgs.Skill(
    sgs.copy(rende, { name: 'wars.lord_liubei.rende' })
);

lord_liubei.addSkill(shouyue);
lord_liubei.addSkill('#wars.lord_liubei.wuhujiangdaqi');
lord_liubei.addSkill(zhangwu);
lord_liubei.addSkill(jizhao);
lord_liubei.addSkill('#wars.lord_liubei.rende');
