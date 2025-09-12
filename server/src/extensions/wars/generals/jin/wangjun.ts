import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const wangjun = sgs.General({
    name: 'wars.wangjun',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const chengliu = sgs.Skill({
    name: 'wars.wangjun.chengliu',
});

chengliu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const effect = context.effect;
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item.getEquipCards().length <
                                        from.getEquipCards().length
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '乘流：你可以选择一名装备区牌数少于你的角色，对他造成1点伤害',
                            thinkPrompt: effect.name,
                        },
                    };
                },
                cac: () => {
                    const effect = context.effect;
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `乘流：你可以交换装备区里的牌，然后可以再对装备区牌数小于你的角色造成1点伤害`,
                        thinkPrompt: effect.name,
                    });
                },
            };
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            let to = targets.at(0);
            do {
                if (!to) break;
                room.directLine(from, [to]);
                await room.damage({
                    from,
                    to,
                    source: data,
                    reason: this.name,
                });
                if (to.death) break;
                const cac = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('cac'),
                        context: {},
                    },
                });
                if (cac.result.cancle) break;
                await room.swapCards({
                    player: from,
                    cards1: from.getEquipCards(),
                    toArea1: to.equipArea,
                    cards2: to.getEquipCards(),
                    toArea2: from.equipArea,
                    source: data,
                    reason: this.name,
                });
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('skill_cost'),
                        context,
                    },
                });
                to = room.getResultPlayers(req).at(0);
            } while (true);
        },
    })
);

wangjun.addSkill(chengliu);
