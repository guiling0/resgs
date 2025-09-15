import { AreaType } from '../../../../core/area/area.type';
import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { General } from '../../../../core/general/general';
import { Gender } from '../../../../core/general/general.type';
import { Skill } from '../../../../core/skill/skill';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';
import { jieyue } from '../power/yujin';
import { duanliang } from '../standard/wei/xuhuang';
import { xiaoguo } from '../standard/wei/yuejin';
import { qiaobian } from '../standard/wei/zhanghe';
import { tuxi } from '../standard/wei/zhangliao';

export const lord_caocao = sgs.General({
    name: 'wars.lord_caocao',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    lord: true,
    enable: false,
    isWars: true,
});

export const jianan = sgs.Skill({
    name: 'wars.lord_caocao.jianan',
});
jianan.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock, SkillTag.Lord],
        priorityType: PriorityType.None,
        trigger: EventTriggers.StateChangeEnd,
        can_trigger(room, player, data) {
            return (
                data.is(sgs.DataType.OpenEvent) &&
                data.generals.includes(this.skill?.sourceGeneral)
            );
        },
        async effect(room, data, context) {
            room.broadcast({
                type: 'MsgChangeBgmAndBg',
                bg_url: 'resources/background/wei.png',
                bgm_url: 'resources/background/wei.mp3',
                bgm_loop: false,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    const skill = await room.addSkill(
                        'wars.lord_caocao.elitegeneralflag',
                        this.player,
                        {
                            source: `effect:${this.id}`,
                            showui: 'other',
                        }
                    );
                    this.setData('wuzi', skill);
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    await this.getData<Skill>('wuzi').removeSelf();
                },
            },
        ],
    })
);

export const huibian = sgs.Skill({
    name: 'wars.lord_caocao.huibian',
});

huibian.addEffect(
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
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 2,
                                filter(item, selected) {
                                    if (!room.sameAsKingdom(from, item))
                                        return false;
                                    if (selected.length === 0) {
                                        return item.losshp > 0;
                                    } else {
                                        return true;
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `挥鞭：你可以选择两名与你势力相同的角色（前者回复体力，后者受到伤害摸牌）`,
                            thinkPrompt: `挥鞭`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, targets } = context;
            if (targets.length >= 2) {
                return await room.damage({
                    from,
                    to: targets.at(1),
                    source: data,
                    reason: this.name,
                });
            }
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            await room.drawCards({
                player: targets.at(1),
                count: 2,
                source: data,
                reason: this.name,
            });
            await room.recoverhp({
                player: targets.at(0),
                source: data,
                reason: this.name,
            });
        },
    })
);

export const zongyu = sgs.Skill({
    name: 'wars.lord_caocao.zongyu',
});

zongyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player) && player.getHorses().length > 0) {
                return data.has_filter(
                    (v, c) =>
                        c.name === 'liulongcanjia' &&
                        v.toArea.type === AreaType.Equip &&
                        v.toArea !== player.equipArea
                );
            }
        },
        context(room, player, data: MoveCardEvent) {
            const liulong = data.getCard(
                (v, c) =>
                    c.name === 'liulongcanjia' &&
                    v.toArea.type === AreaType.Equip &&
                    v.toArea !== player.equipArea
            );
            return {
                targets: [liulong.area?.player],
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (target) {
                return await room.swapCards({
                    player: from,
                    cards1: from.getHorses(),
                    toArea1: target.equipArea,
                    cards2: target.getHorses(),
                    toArea2: from.equipArea,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

zongyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                player === data.from &&
                data.card &&
                data.card.isHorse()
            ) {
                if (
                    room.discardArea.cards.find(
                        (v) => v.name === 'liulongcanjia'
                    )
                ) {
                    return true;
                }
                if (
                    room.playerAlives.find((v) =>
                        v
                            .getEquipCards()
                            .find((c) => c.name === 'liulongcanjia')
                    )
                ) {
                    return true;
                }
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            let liulong = room.discardArea.cards.find(
                (v) => v.name === 'liulongcanjia'
            );
            if (!liulong) {
                room.playerAlives.find((v) =>
                    v.getEquipCards().find((c) => {
                        if (c.name === 'liulongcanjia') {
                            liulong = c;
                            return true;
                        }
                    })
                );
            }
            if (liulong) {
                return await room.puto({
                    player: from,
                    cards: [liulong],
                    toArea: from.equipArea,
                    movetype: CardPut.Up,
                    puttype: CardPut.Up,
                    source: data,
                    reason: this.name,
                });
            }
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            await room.puto({
                player: from,
                cards: data.card?.subcards,
                toArea: room.discardArea,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const elitegeneralflag = sgs.Skill({
    name: 'wars.lord_caocao.elitegeneralflag',
});

elitegeneralflag.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        audio: [
            'lord_caocao/elitegeneralflag1',
            'lord_caocao/elitegeneralflag2',
        ],
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                room.sameAsKingdom(this.player, player) && data.isOwner(player)
            );
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
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `五子良将纛：你可以弃置一张牌并暗置一张武将牌获得技能`,
                            thinkPrompt: `五子良将纛`,
                        },
                    };
                },
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
                                    title: '五子良将纛',
                                    timebar: room.responseTime,
                                    prompt: '五子良将纛：请选择你要暗置的武将牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: '五子良将纛',
                        },
                    };
                },
                choose_skill: () => {
                    const options = [
                        'wars.lord_caocao.tuxi',
                        'wars.lord_caocao.qiaobian',
                        'wars.lord_caocao.xiaoguo',
                        'wars.lord_caocao.duanliang',
                        'wars.lord_caocao.jieyue',
                    ];
                    options.forEach((v, i) => {
                        if (
                            room.skills.find(
                                (s) =>
                                    s.isOpen() &&
                                    s.trueName === v.split('.').at(-1)
                            )
                        ) {
                            options[i] = '!' + options[i];
                        }
                    });
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: options,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: '五子良将纛：请选择一个技能获得',
                            thinkPrompt: `五子良将纛`,
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
            const { from } = context;
            let tar_general: General = from.getCloseGenerls().at(0);
            if (!tar_general) {
                const generals: General[] = from.getCanCloseGenerals();
                if (generals.length > 1) {
                    context.generals = room.getGeneralIds(generals);
                    const req = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose_general'),
                            context,
                        },
                    });
                    tar_general = req.result.results.general.result.at(0);
                    await room.close({
                        player: from,
                        generals: [tar_general],
                        source: data,
                        reason: this.name,
                    });
                } else if (generals.length > 0) {
                    tar_general = generals[0];
                    await room.close({
                        player: from,
                        generals: [tar_general],
                        source: data,
                        reason: this.name,
                    });
                }
            }
            if (tar_general) {
                const gs =
                    this.skill?.getData<General[]>(`${this.name}.generals`) ??
                    [];
                gs.push(tar_general);
                this.skill?.setData(`${this.name}.generals`, gs);

                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_skill'),
                        context,
                    },
                });
                const skill_name = room
                    .getResult(req, 'option')
                    .result.at(0) as string;
                const skill = await room.addSkill(skill_name, from, {
                    source: this.name,
                    showui: 'default',
                });
                if (skill) {
                    const skills =
                        this.getData<Skill[]>(`${this.name}.skills`) ?? [];
                    skills.push(skill);
                    this.setData(`${this.name}.skills`, skills);
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnStart,
                priority: 'before',
                async on_exec(room, data: TurnEvent) {
                    if (data.player === this.player) {
                        this.skill?.removeData(`${this.name}.generals`);
                        const skills =
                            this.getData<Skill[]>(`${this.name}.skills`) ?? [];
                        for (const skill of skills) {
                            await skill.removeSelf();
                        }
                        this.removeData(`${this.name}.skill`);
                    }
                },
            },
            {
                trigger: EventTriggers.onLose,
                priority: 'after',
                async on_exec(room, data) {
                    this.skill?.removeData(`${this.name}.generals`);
                    const skills =
                        this.getData<Skill[]>(`${this.name}.skills`) ?? [];
                    for (const skill of skills) {
                        await skill.removeSelf();
                    }
                    this.removeData(`${this.name}.skill`);
                },
            },
        ],
    })
);

elitegeneralflag.addEffect(
    sgs.StateEffect({
        [StateEffectType.Prohibit_Open](player, generals, reason) {
            const gs =
                this.skill?.getData<General[]>(`${this.name}.generals`) ?? [];
            return !!generals.find((v) => gs.includes(v));
        },
    })
);

export const lord_tuxi = sgs.Skill(
    sgs.copy(tuxi, {
        name: 'wars.lord_caocao.tuxi',
    })
);

export const lord_qiaobian = sgs.Skill(
    sgs.copy(qiaobian, {
        name: 'wars.lord_caocao.qiaobian',
    })
);

export const lord_xiaoguo = sgs.Skill(
    sgs.copy(xiaoguo, {
        name: 'wars.lord_caocao.xiaoguo',
    })
);

export const lord_duanliang = sgs.Skill(
    sgs.copy(duanliang, {
        name: 'wars.lord_caocao.duanliang',
    })
);

export const lord_jieyue = sgs.Skill(
    sgs.copy(jieyue, {
        name: 'wars.lord_caocao.jieyue',
    })
);

lord_caocao.addSkill(jianan);
lord_caocao.addSkill('#wars.lord_caocao.elitegeneralflag');
lord_caocao.addSkill('#wars.lord_caocao.tuxi');
lord_caocao.addSkill('#wars.lord_caocao.xiaoguo');
lord_caocao.addSkill('#wars.lord_caocao.jieyue');
lord_caocao.addSkill('#wars.lord_caocao.qiaobian');
lord_caocao.addSkill('#wars.lord_caocao.duanliang');
lord_caocao.addSkill(huibian);
lord_caocao.addSkill(zongyu);
