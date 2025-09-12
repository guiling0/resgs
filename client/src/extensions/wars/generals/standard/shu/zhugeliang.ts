import { GameCard } from '../../../../../core/card/card';
import { CardPut } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { GameRoom } from '../../../../../core/room/room';
import {
    MoveCardReason,
    WindowItemDatas,
} from '../../../../../core/room/room.types';
import { StateEffect } from '../../../../../core/skill/effect';
import { PriorityType, SkillTag } from '../../../../../core/skill/skill.types';

function checkYiZhiLevel(room: GameRoom) {
    const yizhi = room.getData<StateEffect>('#yizhi');
    return yizhi ? yizhi.isOpen() && yizhi.check() : false;
}

export const zhugeliang = sgs.General({
    name: 'wars.zhugeliang',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const kongcheng = sgs.Skill({
    name: 'wars.zhugeliang.kongcheng',
});

kongcheng.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.BecomeTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                !player.hasHandCards() &&
                data.current.target === player &&
                (data.card.name === 'sha' || data.card.name === 'juedou')
            );
        },
        async cost(room, data: UseCardEvent, context) {
            await data.cancleCurrent();
            return true;
        },
    })
);

kongcheng.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                !player.hasHandCards() &&
                data.filter(
                    (v, c) =>
                        v.reason === MoveCardReason.Give &&
                        v.toArea === player.handArea
                ).length > 0
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const cards = data.getCards(
                (v, c) =>
                    v.reason === MoveCardReason.Give &&
                    v.toArea === from.handArea
            );
            data.update(cards, { toArea: from.upArea });
            cards.forEach((v) => v.setMark('$mark.qin', true));
            from.setMark('$mark.qin', true, {
                visible: true,
                source: this.name,
                type: 'cards',
                areaId: from.upArea.areaId,
            });
            return true;
        },
    })
);

kongcheng.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.GlobalRule,
        trigger: EventTriggers.MoveCardAfter1,
        can_trigger(room, player, data: PhaseEvent) {
            return this.player.hasUpOrSideCards('$mark.qin');
        },
        async cost(room, data, context) {
            this.player.refreshMark = '$mark.qin';
            return true;
        },
    })
);

kongcheng.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        priorityType: PriorityType.General,
        trigger: EventTriggers.DrawPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.hasUpOrSideCards('$mark.qin')
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = from.getUpOrSideCards('$mark.qin');
            return await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            from.removeMark('$mark.qin');
        },
    })
);

export const guanxing = sgs.Skill({
    name: 'wars.zhugeliang.guanxing',
});

guanxing.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data, context) {
            const { from } = context;
            const count = checkYiZhiLevel(room)
                ? 5
                : Math.min(5, room.aliveCount);
            const cards = await room.getNCards(count);
            await room.puto({
                player: from,
                cards,
                toArea: room.processingArea,
                animation: false,
                puttype: CardPut.Down,
                cardVisibles: [from],
                source: data,
                reason: this.name,
            });
            return cards;
        },
        async effect(room, data, context) {
            const { from } = context;
            const cards = context.cost as GameCard[];
            const datas: WindowItemDatas = { type: 'items', datas: [] };
            datas.datas.push({ title: 'cards_top', items: [] });
            datas.datas.push({ title: 'cards_bottom', items: [] });
            cards.forEach((v) => {
                datas.datas[0].items.push({
                    title: 'cards_top',
                    card: v.id,
                });
                datas.datas[1].items.push({
                    title: 'cards_bottom',
                    card: undefined,
                });
            });
            const req = await room.sortCards(
                from,
                cards,
                [
                    {
                        title: 'cards_top',
                        max: cards.length,
                    },
                    {
                        title: 'cards_bottom',
                        max: cards.length,
                    },
                ],
                {
                    canCancle: false,
                    showMainButtons: false,
                    prompt: this.name,
                    thinkPrompt: this.name,
                }
            );
            const result = req.result.sort_result;
            await room.moveCards({
                move_datas: [
                    {
                        cards: [...result[0].items, ...result[1].items],
                        toArea: room.drawArea,
                        reason: MoveCardReason.PutTo,
                        animation: false,
                        puttype: CardPut.Down,
                    },
                ],
                source: data,
                reason: this.name,
            });
            room.drawArea.remove(result[0].items);
            room.drawArea.add(result[0].items.reverse(), 'top');
        },
    })
);

zhugeliang.addSkill(kongcheng);
zhugeliang.addSkill(guanxing);

sgs.loadTranslation({
    ['cards_top']: '牌堆顶',
    ['cards_bottom']: '牌堆底',
    ['$mark.qin']: '琴',
});
