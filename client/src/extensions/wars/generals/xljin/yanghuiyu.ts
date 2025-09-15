import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import {
    ObtainSkillData,
    UseSkillEvent,
} from '../../../../core/event/types/event.skill';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { PriorityType } from '../../../../core/skill/skill.types';

export const yanghuiyu = sgs.General({
    name: 'xl.yanghuiyu',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const shenyi = sgs.Skill({
    name: 'xl.yanghuiyu.shenyi',
});

shenyi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.onObtainTrigger,
        can_trigger(room, player, data: ObtainSkillData) {
            return (
                this.isOwner(player) &&
                data.obtain_skill &&
                data.obtain_skill.player &&
                (data.obtain_skill.name === 'wars.mark.xianqu' ||
                    data.obtain_skill.name === 'wars.mark.yinyangyu' ||
                    data.obtain_skill.name === 'wars.mark.zhulianbihe') &&
                data.obtain_skill.options.source !== this.name
            );
        },
        context(room, player, data: ObtainSkillData) {
            return {
                targets: [data.obtain_skill.player],
            };
        },
        getSelectors(room, context) {
            const target = context.targets.at(0);
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== target;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `慎仪：你可以令一名角色获得一枚“阴阳鱼”`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            room.broadcast({
                type: 'MsgPlayFaceAni',
                ani: 'yinyangyu',
                player: target.playerId,
            });
            await room.delay(2);
            await room.addSkill('wars.mark.yinyangyu', target, {
                source: this.name,
                showui: 'mark',
            });
            return true;
        },
    })
);

const can_trigger_skillnames = [
    'wars.mark.yinyangyu0',
    'wars.mark.yinyangyu1',
    'wars.mark.zhulianbihe.draw',
    'wars.mark.zhulianbihe.use',
];

shenyi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.BeCost,
        can_trigger(room, player, data: UseSkillEvent) {
            return (
                this.isOwner(player) &&
                can_trigger_skillnames.includes(data.use_skill.data.name) &&
                data.context.from
            );
        },
        context(room, player, data: UseSkillEvent) {
            return {
                use: data.use_skill.data.name,
                targets: [data.context.from],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const target = context.targets.at(0);
                    const use = context.use;
                    let prompt: string;
                    if (use === 'wars.mark.yinyangyu0') {
                        prompt = `慎仪：你可以令一名角色执行“阴阳鱼”加手牌上限的效果`;
                    } else if (use === 'wars.mark.yinyangyu1') {
                        prompt = `慎仪：你可以令一名角色执行“阴阳鱼”摸牌的效果`;
                    } else if (use === 'wars.mark.zhulianbihe.draw') {
                        prompt = `慎仪：你可以令一名角色执行“珠联璧合”使用桃的效果`;
                    } else if (use === 'wars.mark.zhulianbihe.use') {
                        prompt = `慎仪：你可以令一名角色执行“珠联璧合”摸牌的效果`;
                    }
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
                            prompt,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const {
                targets: [to],
            } = context;
            const use = context.use as string;
            if (use === 'wars.mark.yinyangyu0') {
                const effect = await room.addEffect('yinyangyu.delay', to);
                effect.setData('data', room.currentTurn);
            } else if (use === 'wars.mark.yinyangyu1') {
                await room.drawCards({
                    player: to,
                    source: data,
                    reason: this.name,
                });
            } else if (use === 'wars.mark.zhulianbihe.draw') {
                const card = room.createVirtualCardByNone('tao');
                if (to.canUseCard(card, undefined, this.name)) {
                    await room.preUseCard({
                        from: to,
                        card,
                        source: data,
                        reason: this.name,
                    });
                }
            } else if (use === 'wars.mark.zhulianbihe.use') {
                await room.drawCards({
                    player: to,
                    count: 2,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const ciwei = sgs.Skill({
    name: 'xl.yanghuiyu.ciwei',
});

ciwei.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        getSelectors(room, context) {
            const skill = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, -1],
                                selectable: from.getHandCards(),
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `慈威：你可以将任意张牌交给一名其他角色`,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    const count = context.count;
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: [1, count],
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('hej'),
                                windowOptions: {
                                    title: '慈威',
                                    timebar: room.responseTime,
                                    prompt: `慈威：请选择至多${count}张牌`,
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data, context) {
            const {
                from,
                cards,
                targets: [target],
            } = context;
            return await room.giveCards({
                from,
                to: target,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const give = context.cost as MoveCardEvent;
            context.count = give.getMoveCount() - 1;
            if (context.count > 0) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
                if (context.count > target.hp) {
                    await room.chooseYesOrNo(
                        from,
                        {
                            prompt: '@ciwei',
                            thinkPrompt: this.name,
                        },
                        async () => {
                            await room.recoverhp({
                                player: target,
                                source: data,
                                reason: this.name,
                            });
                        }
                    );
                }
            }
        },
    })
);

yanghuiyu.addSkill(shenyi);
yanghuiyu.addSkill(ciwei);

sgs.loadTranslation({
    ['@ciwei']: '慈威：是否令其回复1点体力',
});
