import { GameCard } from '../../../../core/card/card';
import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { DieEvent } from '../../../../core/event/types/event.die';
import { Gender } from '../../../../core/general/general.type';
import {
    MoveCardReason,
    WindowItemDatas,
} from '../../../../core/room/room.types';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';

export const simafu = sgs.General({
    name: 'xl.simafu',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const xunde = sgs.Skill({
    name: 'xl.simafu.xunde',
});

xunde.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return this.isOwner(player) && player === data.to;
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(from.losshp + 1);
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
            datas.datas.push({ title: 'xunde.gain', items: [] });
            cards.forEach((v) => {
                datas.datas[0].items.push({
                    title: 'cards_top',
                    card: v.id,
                });
            });
            for (let i = 0; i < 2; i++) {
                datas.datas[1].items.push({
                    title: 'cards_bottom',
                    card: undefined,
                });
            }
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
                    {
                        title: 'xunde.gain',
                        max: 1,
                        condition: 1,
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
            const result_gain = result[2].items;
            await room.obtainCards({
                player: from,
                cards: result_gain,
                source: data,
                reason: this.name,
            });
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

export const chenjie = sgs.Skill({
    name: 'xl.simafu.chenjie',
});

chenjie.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        priorityType: PriorityType.None,
        trigger: EventTriggers.Deathed,
        can_trigger(room, player, data: DieEvent) {
            if (
                data.player === this.player &&
                data.killer &&
                data.killer.kingdom === 'wei'
            ) {
                return true;
            }
            if (
                data.killer === this.player &&
                data.player &&
                data.player.kingdom === 'wei'
            ) {
                return true;
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    room.setMark('#chenjie', this.id);
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    room.removeMark('#chenjie');
                },
            },
        ],
    })
);

simafu.addSkill(xunde);
simafu.addSkill(chenjie);

sgs.loadTranslation({
    ['xunde.gain']: '获得',
});
