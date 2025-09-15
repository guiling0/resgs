import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';

export const diaochan = sgs.General({
    name: 'wars.diaochan',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const lijian = sgs.Skill({
    name: 'wars.diaochan.lijian',
});

lijian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        auto_sort: false,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const juedou = room.createVirtualCardByNone(
                        'juedou',
                        undefined,
                        false
                    );
                    juedou.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 2,
                                filter(item, selected) {
                                    if (
                                        item === from ||
                                        item.gender !== Gender.Male
                                    )
                                        return false;
                                    if (selected.length === 0) {
                                        return true;
                                    } else {
                                        return item.canUseCard(juedou.vdata, [
                                            selected[0],
                                        ]);
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `离间：你可以选择两名其他男性角色，后者对前者者视为使用【决斗】`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, targets, cards } = context;
            if (targets.length >= 2) {
                return await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
        async effect(room, data, context) {
            const { from, targets, cards } = context;
            const juedou = room.createVirtualCardByNone('juedou');
            juedou.custom.method = 1;
            await room.usecard({
                from: targets[1],
                targets: [targets[0]],
                card: juedou,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const biyue = sgs.Skill({
    name: 'wars.diaochan.biyue',
});

biyue.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

diaochan.addSkill(lijian);
diaochan.addSkill(biyue);
