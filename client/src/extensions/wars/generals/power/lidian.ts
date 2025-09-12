import { GameCard } from '../../../../core/card/card';
import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import {
    MoveCardReason,
    WindowItemDatas,
} from '../../../../core/room/room.types';

export const lidian = sgs.General({
    name: 'wars.lidian',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const wangxi = sgs.Skill({
    name: 'wars.lidian.wangxi',
});

wangxi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                data.from &&
                data.from.alive &&
                data.from !== player
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.from],
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [player],
            } = context;
            await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
            await room.drawCards({
                player,
                source: data,
                reason: this.name,
            });
        },
    })
);

wangxi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.CauseDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.to &&
                data.to.alive &&
                data.to !== player
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [player],
            } = context;
            await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
            await room.drawCards({
                player,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const xunxun = sgs.Skill({
    name: 'wars.lidian.xunxun',
});

xunxun.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.DrawPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(4);
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
                    title: 'cards_bottom',
                    card: v.id,
                });
            });
            for (let i = 0; i < 2; i++) {
                datas.datas[1].items.push({
                    title: 'cards_top',
                    card: undefined,
                });
            }
            const req = await room.sortCards(
                from,
                cards,
                [
                    {
                        title: 'cards_bottom',
                        max: cards.length,
                        condition: 2,
                    },
                    {
                        title: 'cards_top',
                        max: 2,
                        condition: 2,
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
            room.drawArea.remove(result[1].items);
            room.drawArea.add(result[1].items.reverse(), 'top');
        },
    })
);

lidian.addSkill(wangxi);
lidian.addSkill(xunxun);
