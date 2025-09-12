import { CardColor } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { StateEffectType } from '../../../../core/skill/skill.types';

export const fengxi = sgs.General({
    name: 'wars.fengxi',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const yusui = sgs.Skill({
    name: 'wars.fengxi.yusui',
});

yusui.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.from &&
                room.differentAsKingdom(player, data.from) &&
                data.current.target === player &&
                data.card &&
                data.card.color === CardColor.Black
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 1;
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.from],
            };
        },
        getSelectors(room, context) {
            const target = context.targets.at(0);
            return {
                choose: () => {
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: context.handles,
                            }),
                        },
                        options: {
                            canCancle: false,
                            prompt: `玉碎：请选择一项令${target.gameName}执行`,
                            showMainButtons: false,
                        },
                    };
                },
                choose_card: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(target, {
                                step: 1,
                                count: target.maxhp,
                                selectable: target.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `玉碎：你需要弃置${target.maxhp}张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (from.death) return;
            const loseCount = Math.max(target.hp - from.hp, 0);
            const handles = [
                {
                    text: 'yusui.drop',
                    values: [{ type: 'number', value: target.maxhp }],
                },
                {
                    text: 'yusui.lose',
                    values: [{ type: 'number', value: loseCount }],
                },
            ];
            if (!target.hasCanDropCards('h', target, 1, this.name)) {
                handles[0].text = '!' + handles[0];
            }
            if (loseCount === 0) {
                handles[1].text = '!' + handles[1];
            }
            if (!handles.every((v) => v.text.at(0) === '!')) {
                context.handles = handles;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const result = room.getResult(req, 'option').result as string[];
                if (result.includes('yusui.drop')) {
                    const req = await room.doRequest({
                        player: target,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose_card'),
                            context,
                        },
                    });
                    const cards = room.getResultCards(req);
                    await room.dropCards({
                        player: target,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                }
                if (result.includes('yusui.lose')) {
                    await room.losehp({
                        player: target,
                        number: loseCount,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

export const boyan = sgs.Skill({
    name: 'wars.fengxi.boyan',
});

boyan.addEffect(
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
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `驳言：你可以选择一名其他角色将手牌补至体力上限，但他本回合不能再使用或打出牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            await room.drawCards({
                player: to,
                count: to.maxhp - to.getHandCards().length,
                source: data,
                reason: this.name,
            });
            const effect1 = await room.addEffect('boyan.delay', to);
            effect1.setData('data', room.currentTurn);
            await room.chooseYesOrNo(
                from,
                {
                    prompt: `@boyan`,
                    thinkPrompt: this.name,
                },
                async () => {
                    const skill = await room.addSkill(
                        'wars.fengxi.boyanzongheng',
                        to,
                        {
                            source: this.name,
                            showui: 'default',
                        }
                    );
                }
            );
        },
    })
);

export const boyan_zongheng = sgs.Skill({
    name: 'wars.fengxi.boyanzongheng',
});

boyan_zongheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        mark: ['boyanzongheng'],
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
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `驳言：你可以选择一名其他角色，他本回合不能使用或打出牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            const effect1 = await room.addEffect('boyan.delay', to);
            effect1.setData('data', room.currentTurn);
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data: TurnEvent) {
                    if (data.player === this.player && this.skill) {
                        await this.skill.removeSelf();
                    }
                },
            },
        ],
    })
);

export const boyan_delay = sgs.StateEffect({
    name: 'boyan.delay',
    mark: ['mark.boyan'],
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        return (
            this.isOwner(from) &&
            card.subcards.length &&
            card.subcards.every((v) => v.area === from.handArea)
        );
    },
    [StateEffectType.Prohibit_PlayCard](from, card, reason) {
        return (
            this.isOwner(from) &&
            card.subcards.length &&
            card.subcards.every((v) => v.area === from.handArea)
        );
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

fengxi.addSkill(yusui);
fengxi.addSkill(boyan);
fengxi.addSkill(boyan_zongheng, true);

sgs.loadTranslation({
    ['yusui.drop']: '弃置{0}张牌',
    ['yusui.lose']: '失去{0}点体力',
    ['mark.boyan']: '驳言',
    ['@boyan']: '是否令其获得“驳言(纵横)”',
    ['boyanzongheng']: '纵横:驳言',
});
