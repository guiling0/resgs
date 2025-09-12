import { EventTriggers } from '../../../../../core/event/triggers';
import { JudgeEvent } from '../../../../../core/event/types/event.judge';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { General } from '../../../../../core/general/general';
import { Gender } from '../../../../../core/general/general.type';
import { GameRoom } from '../../../../../core/room/room';
import { StateEffect } from '../../../../../core/skill/effect';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

function checkLiubeiLevel(room: GameRoom) {
    const wuhu = room.getEffect(room.getMark<number>('#wuhujiangdaqi'));
    return wuhu ? wuhu.isOpen() && wuhu.check() : false;
}

export const machao = sgs.General({
    name: 'wars.machao',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const mashu = sgs.Skill({
    name: 'wars.machao.mashu',
});

mashu.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Distance_Correct](from, to) {
            if (this.isOwner(from)) {
                return -1;
            }
        },
    })
);

export const tieqi = sgs.Skill({
    name: 'wars.machao.tieqi',
});

tieqi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.AssignTargeted,
        getSelectors(room, context) {
            return {
                choose_general: () => {
                    const generals = room.getGenerals(context.generals);
                    return {
                        selectors: {
                            general: room.createChooseGeneral({
                                step: 1,
                                count: 1,
                                selectable: generals,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '铁骑',
                                    timebar: room.responseTime,
                                    prompt: '铁骑：请选择一张武将牌令所有武将技能失效',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: '铁骑',
                        },
                    };
                },
                choose_card: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 2,
                                count: 1,
                                selectable: target.getSelfCards(),
                                filter(item, selected) {
                                    return item.suit === context.suit;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `铁骑，你需要弃置一张${sgs.getTranslation(
                                'suit' + context.suit
                            )}牌，否则不能响应【杀】`,
                            thinkPrompt: '铁骑',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card.name === 'sha' &&
                data.from === player
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
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
        async effect(room, data: UseCardEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            const judge = context.cost as JudgeEvent;

            if (judge?.success) {
                const generals: General[] = target.getOpenGenerls();
                let tar_general: General[] = [];
                if (checkLiubeiLevel(room)) {
                    tar_general = generals.slice();
                } else {
                    if (generals.length > 1) {
                        context.generals = room.getGeneralIds(generals);
                        const req = await room.doRequest({
                            player: from,
                            get_selectors: {
                                selectorId:
                                    this.getSelectorName('choose_general'),
                                context,
                            },
                        });
                        tar_general.push(
                            req.result.results.general.result.at(0)
                        );
                    } else if (generals.length > 0) {
                        tar_general.push(generals.at(0));
                    }
                }
                if (tar_general.length) {
                    while (tar_general.length > 0) {
                        const cur = tar_general.shift();
                        let pos = target.getMark<string>(this.name);
                        if (cur === target.head) {
                            pos =
                                pos === 'deputy' || pos === 'all'
                                    ? 'all'
                                    : 'head';
                        }
                        if (cur === target.deputy) {
                            pos =
                                pos === 'head' || pos === 'all'
                                    ? 'all'
                                    : 'deputy';
                        }
                        target.setMark(this.name, pos, {
                            visible: true,
                        });
                    }
                    if (!this.getData('invalids')) {
                        const effect = await room.addEffect(`tieqi.invalids`);
                        this.setData('invalids', effect);
                        effect.setData('mark', this.name);
                    }
                }

                //drop
                context.suit = judge.card?.suit;
                const drop_req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card'),
                        context,
                    },
                });
                const cards = room.getResultCards(drop_req);
                const drop = await room.dropCards({
                    player: target,
                    cards,
                    source: data,
                    reason: this.name,
                });
                if (!drop) {
                    await data.targetCantResponse([target]);
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data) {
                    room.players.forEach((v) => v.removeMark(this.name));
                    const skill = this.getData<StateEffect>('invalids');
                    if (skill) {
                        await skill.removeSelf();
                    }
                    this.removeData('invalids');
                },
            },
        ],
    })
);

export const tieqi_invalids = sgs.StateEffect({
    name: 'tieqi.invalids',
    [StateEffectType.Skill_Invalidity](effect) {
        if (
            effect.player &&
            effect.skill &&
            effect.skill.sourceGeneral &&
            !effect.hasTag(SkillTag.Lock)
        ) {
            const markkey = this.getData<string>('mark') ?? 'wars.machao.tieqi';
            const mark = effect.player.getMark<string>(markkey);
            if (
                mark === 'head' &&
                effect.skill.sourceGeneral === effect.player.head
            ) {
                return true;
            }
            if (
                mark === 'deputy' &&
                effect.skill.sourceGeneral === effect.player.deputy
            ) {
                return true;
            }
            if (mark === 'all') {
                return true;
            }
        }
    },
});

machao.addSkill(mashu);
machao.addSkill(tieqi);

sgs.loadTranslation({
    ['marks.tieqi']: '铁骑',
});
