import { GameCard } from '../../../../core/card/card';
import { EventTriggers } from '../../../../core/event/triggers';
import { JudgeEvent } from '../../../../core/event/types/event.judge';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const cs_bilan = sgs.General({
    name: 'cs_bilan',
    kingdom: 'qun',
    hp: 1,
    gender: Gender.Male,
    enable: false,
    hidden: true,
});

export const picai = sgs.Skill({
    name: 'cs_bilan.picai',
});

picai.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `庀材：你可以连续判定直到出现相同花色`,
                    });
                },
                choose: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '庀材：是否继续判定',
                        thinkPrompt: this.name,
                    });
                },
                choose_target: () => {
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `庀材：选择一名角色将所有判定牌交给他`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.judge({
                player: from,
                isSucc(result) {
                    return true;
                },
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            let judge = context.cost as JudgeEvent;
            const cards: GameCard[] = [];
            if (judge.card.area === room.discardArea) {
                cards.push(judge.card);
            }
            do {
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
                const judge = await room.judge({
                    player: from,
                    isSucc(result) {
                        return true;
                    },
                    source: data,
                    reason: this.name,
                });
                let same = cards.find((v) => v.suit === judge.card.suit);
                if (judge.card.area === room.discardArea) {
                    cards.push(judge.card);
                }
                if (same) break;
            } while (true);

            const gains = cards.filter((v) => v.area === room.discardArea);
            if (gains.length) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_target'),
                        context,
                    },
                });
                const to = room.getResultPlayers(req).at(0);
                await room.giveCards({
                    from,
                    to,
                    cards: gains,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

cs_bilan.addSkill(picai);
