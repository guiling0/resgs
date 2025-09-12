import { CardColor, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { General } from '../../../../core/general/general';
import { Gender } from '../../../../core/general/general.type';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const baifuren = sgs.General({
    name: 'wars.baifuren',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

/**
 * 黠策：若当前回合角色使用过的【杀】的次数小于其使用【杀】的次数上限，你可以将一张牌当【无懈可击】使用并令其使用【杀】的次数上限-1直到此回合结束。然后你可以变更副将。
 */
export const xiace = sgs.Skill({
    name: 'wars.baifuren.xiace',
});

xiace.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const wuxie = room.createVirtualCardByNone(
                        'wuxiekeji',
                        undefined,
                        false
                    );
                    wuxie.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                onChange(type, item) {
                                    if (type === 'add') wuxie.addSubCard(item);
                                    if (type === 'remove')
                                        wuxie.delSubCard(item);
                                    wuxie.set({ attr: [] });
                                    this._use_or_play_vcard = wuxie;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '黠策：你可以将一张牌当【无懈可击】使用并令当前回合角色此回合可使用【杀】的次数-1。',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('wuxiekeji') &&
                player.hasCardsInArea()
            ) {
                const target = room.currentTurn.player;
                const use = target.getMark<number>('__sha_times') ?? 0;
                let times = 1;
                room.getStates(StateEffectType.TargetMod_CorrectTime, [
                    target,
                    room.createVirtualCardByNone('sha', undefined, false),
                    undefined,
                ]).forEach((v) => (times += v));
                return times > use;
            }
        },
        async cost(room, data, context) {
            room.currentTurn.player.increaseMark('__sha_times', 1);
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('xiace.delay', from);
            effect.setData('reason', this);
        },
    })
);

export const xiace_delay = sgs.TriggerEffect({
    name: 'xiace.delay',
    trigger: EventTriggers.UseCardEnd3,
    can_trigger(room, player, data: UseCardEvent) {
        return this.isOwner(player) && this.getData('reason') === data.skill;
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.chooseYesOrNo(
            from,
            {
                prompt: '@xiace',
                thinkPrompt: this.name,
            },
            async () => {
                await room.change({
                    player: from,
                    general: 'deputy',
                    source: data,
                    reason: this.name,
                });
            }
        );
        await this.removeSelf();
        return true;
    },
});

export const limeng = sgs.Skill({
    name: 'wars.baifuren.limeng',
});

limeng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const general: General[] = [];
                    room.playerAlives.forEach((v) => {
                        general.push(...v.getOpenGenerls());
                    });
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 2,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.type !== CardType.Basic;
                                },
                            }),
                            general: room.createChooseGeneral({
                                step: 1,
                                count: 2,
                                selectable: general,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '离梦',
                                    timebar: room.responseTime,
                                    prompt: '离梦：选择两张具有珠联璧合关系的武将牌，再从手牌区里选择一张非基本牌',
                                },
                                filter(item, selected) {
                                    if (selected.length === 0) {
                                        return true;
                                    } else {
                                        return sgs.utils.isRelationship(
                                            selected[0].id,
                                            item.id
                                        );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            thinkPrompt: `离梦`,
                        },
                    };
                },
                // choose: () => {
                //     const from = context.from;
                //     const general: General[] = [];
                //     room.playerAlives.forEach((v) => {
                //         general.push(...v.getOpenGenerls());
                //     });
                //     return {
                //         selectors: {
                //             general: room.createChooseGeneral({
                //                 step: 1,
                //                 count: 2,
                //                 selectable: general,
                //                 filter(item, selected) {
                //                     if (selected.length === 0) {
                //                         return true;
                //                     } else {
                //                         return sgs.utils.isRelationship(
                //                             selected[0].id,
                //                             item.id
                //                         );
                //                     }
                //                 },
                //             }),
                //         },
                //         options: {
                //             canCancle: true,
                //             showMainButtons: true,
                //             prompt: `离梦：请选择两张具有珠联璧合关系的武将牌`,
                //             thinkPrompt: this.name,
                //         },
                //     };
                // },
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
            const { from } = context;
            const generals = context.req_result.results.general
                .result as General[];
            if (generals.length >= 2) {
                const alives = room.playerAlives;
                const player1 = alives.find((v) =>
                    v.getOpenGenerls().includes(generals[0])
                );
                const player2 = alives.find((v) =>
                    v.getOpenGenerls().includes(generals[1])
                );
                if (player1 && player2) {
                    const res = room.sortResponse([player1, player2]);
                    if (player1 === player2) {
                        // await room.recoverhp({
                        //     player: res[0],
                        //     source: data,
                        //     reason: this.name,
                        // });
                    } else {
                        await room.damage({
                            from: res[0],
                            to: res[1],
                            source: data,
                            reason: this.name,
                        });
                        await room.damage({
                            from: res[1],
                            to: res[0],
                            source: data,
                            reason: this.name,
                        });
                    }
                }
            }
        },
    })
);

baifuren.addSkill(xiace);
baifuren.addSkill(limeng);

sgs.loadTranslation({
    ['@xiace']: '黠策：是否变更',
});
