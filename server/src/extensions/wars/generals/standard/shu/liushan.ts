import { CardType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import {
    PhaseEvent,
    TurnEvent,
} from '../../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { PriorityType, SkillTag } from '../../../../../core/skill/skill.types';

export const liushan = sgs.General({
    name: 'wars.liushan',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const fangquan = sgs.Skill({
    name: 'wars.liushan.fangquan',
});

fangquan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        audio: [`liushan/fangquan1`],
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseStart,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) && data.isOwner(player) && !data.isComplete
            );
        },
        async cost(room, data, context) {
            await room.currentTurn.skipPhase();
            const effect = await room.addEffect('fangquan.delay', this.player);
            effect.setData('turn', room.currentTurn);
            return true;
        },
    })
);

export const fangquan_delay = sgs.TriggerEffect({
    name: 'fangquan.delay',
    auto_directline: 1,
    audio: ['liushan/fangquan2'],
    priorityType: PriorityType.General,
    trigger: EventTriggers.TurnEnd,
    can_trigger(room, player, data: TurnEvent) {
        return this.isOwner(player) && data === this.getData('turn');
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
                            selectable: from.getHandCards(),
                        }),
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return item != from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `放权，你可以选择一名其他角色，令他获得一个额外回合`,
                        thinkPrompt: '放权',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        await this.removeSelf();
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const {
            targets: [target],
        } = context;
        await room.executeExtraTurn(
            room.createEventData(sgs.DataType.TurnEvent, {
                player: target,
                isExtra: true,
                phases: room.getRatedPhases(),
                skipPhases: [],
                source: undefined,
                reason: this.name,
            })
        );
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

export const xiangle = sgs.Skill({
    name: 'wars.liushan.xiangle',
});

xiangle.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.BecomeTargeted,
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: target.getHandCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Basic;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `享乐，你需要弃置一张基本牌，否则【杀】对${context.from?.gameName}无效`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card.name === 'sha' &&
                data.current.target === player
            );
        },
        async cost(room, data: UseCardEvent, context) {
            context.targets = [data.from];
            const req = await room.doRequest({
                player: data.from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            const drop = await room.dropCards({
                player: data.from,
                cards,
                source: data,
                reason: this.name,
            });
            if (!drop) {
                await data.invalidCurrent();
            }
            return true;
        },
    })
);

liushan.addSkill(fangquan);
liushan.addSkill(xiangle);

sgs.loadTranslation({
    [fangquan_delay.name]: '放权',
});
