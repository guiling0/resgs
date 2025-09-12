import { CustomString } from '../../../../../core/custom/custom.type';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const sunjian = sgs.General({
    name: 'wars.sunjian',
    kingdom: 'wu',
    hp: 2.5,
    gender: Gender.Male,
    isWars: true,
});

export const yinghun = sgs.Skill({
    name: 'wars.sunjian.yinghun',
});

yinghun.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.losshp > 0
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const options: CustomString[] = [];
                    if (from.losshp > 1) {
                        options.push({
                            text: 'yinghun.draw',
                            values: [{ type: 'number', value: from.losshp }],
                        });
                        options.push({
                            text: 'yinghun.drop',
                            values: [{ type: 'number', value: from.losshp }],
                        });
                    } else {
                        options.push('confirm');
                    }
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                            option: room.createChooseOptions({
                                step: 2,
                                count: 1,
                                selectable: options,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt:
                                from.losshp > 1
                                    ? `英魂，请选择一名其他角色并选择一个选项令其执行`
                                    : '英魂，请选择一名其他角色让他摸一张牌，再弃置一张牌',
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    const count = context.count as number;
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count,
                                selectable: target.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `英魂，你需要弃置${count}张牌`,
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
                req_result,
            } = context;
            let result = req_result.results.option?.result as string[];
            const drawnum = result.includes('yinghun.draw') ? from.losshp : 1;
            const dropnum = result.includes('yinghun.drop') ? from.losshp : 1;
            context.count = dropnum;
            return await room.drawCards({
                player: target,
                count: drawnum,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                targets: [target],
            } = context;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
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
        },
    })
);

sunjian.addSkill(yinghun);

sgs.loadTranslation({
    ['yinghun.draw']: '摸{0}弃1',
    ['yinghun.drop']: '摸1弃{0}',
});
