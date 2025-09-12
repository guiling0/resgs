import { CardColor, CardType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { General } from '../../../../../core/general/general';
import { Gender } from '../../../../../core/general/general.type';
import {
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const zoushi = sgs.General({
    name: 'wars.zoushi',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const huoshui = sgs.Skill({
    name: 'wars.zoushi.huoshui',
});

huoshui.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Prohibit_Open](player, generals, reason) {
            return this.player.inturn && player !== this.player;
        },
    })
);

export const qingcheng = sgs.Skill({
    name: 'wars.zoushi.qingcheng',
});

qingcheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.color === CardColor.Black;
                                },
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from && !item.hasNoneOpen();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `倾城：你可以弃置一张黑色牌并选择一名其他角色，暗置他的一张武将牌`,
                        },
                    };
                },
                choose: () => {
                    const generals = room.getGenerals(context.generals);
                    return {
                        selectors: {
                            general: room.createChooseGeneral({
                                step: 1,
                                count: 1,
                                selectable: generals,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '倾城',
                                    timebar: room.responseTime,
                                    prompt: '倾城：请选择一张武将牌暗置',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: '倾城',
                        },
                    };
                },
                choose_player: () => {
                    const from = context.from;
                    const targets = context.targets;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        !targets.includes(item) &&
                                        !item.hasNoneOpen()
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '倾城，你可以选择另一名角色暗置他的一张武将牌',
                            thinkPrompt: '倾城',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from, targets, cards } = context;
            let card = cards.at(0);
            let target = targets.at(0);
            while (target) {
                const generals = target.getCanCloseGenerals();
                let tar_general: General;
                if (generals.length > 1) {
                    context.generals = room.getGeneralIds(generals);
                    const req = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context,
                        },
                    });
                    tar_general = req.result.results.general.result.at(0);
                } else if (generals.length > 0) {
                    tar_general = generals[0];
                }
                if (tar_general) {
                    await room.close({
                        player: target,
                        generals: [tar_general],
                        source: data,
                        reason: this.name,
                    });
                }
                if (card && card.type === CardType.Equip) {
                    const preq = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose_player'),
                            context,
                        },
                    });
                    target = room.getResultPlayers(preq).at(0);
                } else {
                    target = undefined;
                }
                card = undefined;
            }
        },
    })
);

zoushi.addSkill(huoshui);
zoushi.addSkill(qingcheng);
