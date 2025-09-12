import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { GamePlayer } from '../../../../core/player/player';
import { GameRoom } from '../../../../core/room/room';

function checkXlWyuanjiLevel(room: GameRoom, from: GamePlayer) {
    const qianchong = room.getEffect(room.getMark<number>('#qianchong'));
    if (qianchong && room.sameAsKingdom(qianchong.player, from)) {
        return qianchong.isOpen() && qianchong.check();
    }
    return false;
}

export const tao = sgs.CardUse({
    name: 'tao',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        if (checkXlWyuanjiLevel(room, from)) {
            //谦冲修改
            return room.createChoosePlayer({
                count: 1,
                filter(item, selected) {
                    return room.sameAsKingdom(from, item) && item.losshp > 0;
                },
            });
        } else {
            return room.createChoosePlayer({
                count: 1,
                filter(item, selected) {
                    return from === item && item.losshp > 0;
                },
                auto: true,
            });
        }
    },
    async onuse(room, data: UseCardEvent) {
        data.baseRecover = 1;
    },
    async effect(room, target, data: UseCardEvent) {
        const { current, baseRecover = 1 } = data;
        await room.recoverhp({
            player: current.target,
            number: baseRecover,
            source: data,
            reason: this.name,
        });
    },
});

export const tao2 = sgs.CardUse({
    name: 'tao',
    method: 2,
    trigger: EventTriggers.Dying,
    condition(room, from, card, data) {
        return data.is(sgs.DataType.DyingEvent) && data.player.hp <= 0;
    },
    prompt(room, from, card, context) {
        if (context.prompt) {
            return context.prompt;
        } else return {};
    },
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return (
                    item.hp <= 0 &&
                    Math.max(...room.players.map((v) => v.indying)) ===
                        item.indying
                );
            },
            auto: true,
        });
    },
    async onuse(room, data: UseCardEvent) {
        data.baseRecover = 1;
    },
    async effect(room, target, data: UseCardEvent) {
        const { current, baseRecover = 1 } = data;
        await room.recoverhp({
            player: current.target,
            number: baseRecover,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('tao', {
    type: CardType.Basic,
    subtype: CardSubType.Basic,
    recover: true,
    rhyme: 'ao',
});
