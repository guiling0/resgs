import { EventTriggers } from '../../../../core/event/triggers';
import { DieEvent } from '../../../../core/event/types/event.die';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { Skill } from '../../../../core/skill/skill';

export const chenwudongxi = sgs.General({
    name: 'wars.chenwudongxi',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isDualImage: true,
    isWars: true,
});

export const duanxie = sgs.Skill({
    name: 'wars.chenwudongxi.duanxie',
});

duanxie.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (
                this.isOwner(player) &&
                data.isOwner(player) &&
                this.skill &&
                this.skill.sourceGeneral
            ) {
                if (
                    this.skill.sourceGeneral === player.head &&
                    player.hasDeputy() &&
                    !player.deputy.isLord()
                ) {
                    return true;
                }
                if (
                    this.skill.sourceGeneral === player.deputy &&
                    player.hasHead() &&
                    !player.head.isLord()
                ) {
                    return true;
                }
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            const source = this.skill.sourceGeneral;
            if (
                source === from.head &&
                from.hasDeputy() &&
                !from.deputy.isLord()
            ) {
                return await room.remove({
                    player: from,
                    general: from.deputy,
                    source: data,
                    reason: this.name,
                });
            }
            if (
                source === from.deputy &&
                from.hasHead() &&
                !from.head.isLord()
            ) {
                return await room.remove({
                    player: from,
                    general: from.head,
                    source: data,
                    reason: this.name,
                });
            }
        },
        async effect(room, data, context) {
            const { from } = context;
            const haoshi = await room.addSkill('wars.lusu.haoshi', from, {
                source: this.name,
                showui: 'default',
            });
            const jiang = await room.addSkill('wars.sunce.jiang', from, {
                source: this.name,
                showui: 'default',
            });
            const zhiheng = await room.addSkill('wars.sunquan.zhiheng', from, {
                source: this.name,
                showui: 'default',
            });
            const kurou = await room.addSkill('wars.huanggai.kurou', from, {
                source: this.name,
                showui: 'default',
            });
            const tianyi = await room.addSkill('wars.taishici.tianyi', from, {
                source: this.name,
                showui: 'default',
            });
            const skills = [haoshi, jiang, zhiheng, kurou, tianyi];
            this.setData('skills', skills);
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data) {
                    const skills = this.getData<Skill[]>('skills');
                    if (skills) {
                        for (const skill of skills) {
                            await skill.removeSelf();
                        }
                        this.removeData('skills');
                    }
                },
            },
        ],
    })
);

// duanxie.addEffect(
//     sgs.TriggerEffect({
//         auto_log: 1,
//         auto_directline: 1,
//         trigger: EventTriggers.PlayPhaseProceeding,
//         can_trigger(room, player, data: PhaseEvent) {
//             return this.isOwner(player) && data.isOwner(player);
//         },
//         getSelectors(room, context) {
//             return {
//                 skill_cost: () => {
//                     const from = context.from;
//                     const count = Math.max(1, from.losshp);
//                     return {
//                         selectors: {
//                             player: room.createChoosePlayer({
//                                 step: 1,
//                                 count: [1, count],
//                                 filter(item, selected) {
//                                     return item !== from && !item.chained;
//                                 },
//                             }),
//                         },
//                         options: {
//                             canCancle: true,
//                             showMainButtons: true,
//                             prompt: `断绁：你可以令至多${count}名角色横置。然后你横置`,
//                         },
//                     };
//                 },
//             };
//         },
//         async effect(room, data, context) {
//             const { from, targets } = context;
//             for (const player of targets) {
//                 await room.chain({
//                     player,
//                     to_state: true,
//                     source: data,
//                     reason: this.name,
//                 });
//             }
//             await room.chain({
//                 player: from,
//                 to_state: true,
//                 source: data,
//                 reason: this.name,
//             });
//         },
//     })
// );

export const fenming = sgs.Skill({
    name: 'wars.chenwudongxi.fenming',
});

fenming.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.Death,
        can_trigger(room, player, data: DieEvent) {
            return this.isOwner(player) && data.player === player;
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: [1, -1],
                                filter(item, selected) {
                                    return from !== item;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `奋命：你可以选择任意名角色横置或重置`,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { targets } = context;
            for (const target of targets) {
                await room.chain({
                    player: target,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

// fenming.addEffect(
//     sgs.TriggerEffect({
//         auto_log: 1,
//         auto_directline: 1,
//         forced: 'cost',
//         trigger: EventTriggers.EndPhaseStarted,
//         can_trigger(room, player, data: PhaseEvent) {
//             return (
//                 this.isOwner(player) && data.isOwner(player) && player.chained
//             );
//         },
//         context(room, player, data) {
//             return {
//                 targets: room.playerAlives.filter((v) => v.chained),
//             };
//         },
//         getSelectors(room, context) {
//             const from = context.from;
//             const target = room.getPlayer(context.current);
//             return {
//                 choose: () => {
//                     return {
//                         selectors: {
//                             cards: room.createDropCards(from, {
//                                 step: 1,
//                                 count: 1,
//                                 selecte_type: 'rows',
//                                 selectable: target.getAreaCards(),
//                                 data_rows: target.getCardsToArea('he'),
//                                 windowOptions: {
//                                     title: '奋命',
//                                     timebar: room.responseTime,
//                                     prompt: '奋命，请选择一张牌',
//                                 },
//                             }),
//                         },
//                         options: {
//                             canCancle: false,
//                             showMainButtons: false,
//                             prompt: '',
//                             thinkPrompt: this.name,
//                         },
//                     };
//                 },
//             };
//         },
//         async effect(room, data, context) {
//             const { from, targets } = context;
//             for (const target of targets) {
//                 context.current = target.playerId;
//                 const req = await room.doRequest({
//                     player: from,
//                     get_selectors: {
//                         effectId: this.id,
//                         name: 'choose',
//                         context,
//                     },
//                 });
//                 const cards = room.getResultCards(req);
//                 await room.dropCards({
//                     player: from,
//                     cards,
//                     source: data,
//                     reason: this.name,
//                 });
//             }
//         },
//     })
// );

chenwudongxi.addSkill(duanxie);
chenwudongxi.addSkill(fenming);
