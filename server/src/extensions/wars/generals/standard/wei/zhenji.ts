import { GameCard } from '../../../../../core/card/card';
import { CardColor } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { JudgeEvent } from '../../../../../core/event/types/event.judge';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { GameRoom } from '../../../../../core/room/room';
import { MoveCardReason } from '../../../../../core/room/room.types';
import {
    PriorityType,
    TriggerEffectContext,
} from '../../../../../core/skill/skill.types';

export const zhenji = sgs.General({
    name: 'wars.zhenji',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const qingguo = sgs.Skill({
    name: 'wars.zhenji.qingguo',
});

function qingguo_choose(room: GameRoom, context: TriggerEffectContext) {
    const from = context.from;
    const shan = room.createVirtualCardByNone('shan', undefined, false);
    shan.custom.method = 1;
    return {
        selectors: {
            card: room.createChooseCard({
                step: 1,
                count: 1,
                selectable: from.getHandCards(),
                filter(item, selected) {
                    return item.color === CardColor.Black;
                },
                onChange(type, item) {
                    if (type === 'add') shan.addSubCard(item);
                    if (type === 'remove') shan.delSubCard(item);
                    shan.set();
                    this._use_or_play_vcard = shan;
                },
            }),
        },
        options: {
            canCancle: true,
            showMainButtons: true,
            prompt: '倾国：你可以将一张黑色手牌当【闪】',
        },
    };
}

qingguo.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return qingguo_choose(room, context);
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('shan');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

qingguo.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedPlayCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return qingguo_choose(room, context);
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedPlayCardData)
            ) {
                return data.from === player && data.has('shan');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

export const luoshen = sgs.Skill({
    name: 'wars.zhenji.luoshen',
});
luoshen.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.ReadyPhaseStarted,
        forced: 'cost',
        getSelectors(room, context) {
            return {
                choose: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '洛神，是否继续判定',
                        thinkPrompt: this.name,
                    });
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Ready &&
                data.executor === player
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.judge({
                player: from,
                isSucc(result) {
                    return result.color === CardColor.Black;
                },
                source: data,
                reason: this.name,
                notMoveHandle(data: JudgeEvent) {
                    return data.result.color === CardColor.Black;
                },
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            let judge = context.cost as JudgeEvent;
            const cards: GameCard[] = [];
            do {
                if (!judge) {
                    judge = await room.judge({
                        player: from,
                        isSucc(result) {
                            return result.color === CardColor.Black;
                        },
                        source: data,
                        reason: this.name,
                        notMoveHandle(data: JudgeEvent) {
                            return data.result.color === CardColor.Black;
                        },
                    });
                }
                if (judge.success) {
                    cards.push(judge.card);
                    judge = undefined;
                    const req = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context,
                        },
                    });
                    if (req.result.cancle) {
                        break;
                    }
                } else {
                    break;
                }
            } while (true);
            if (cards.length > 0) {
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

zhenji.addSkill(qingguo);
zhenji.addSkill(luoshen);
