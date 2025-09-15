import { AreaType } from '../../../../core/area/area.type';
import { GameCard } from '../../../../core/card/card';
import { CardColor } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PindianEvent } from '../../../../core/event/types/event.pindian';
import { OpenEvent } from '../../../../core/event/types/event.state';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { TriggerEffect } from '../../../../core/skill/effect';
import { Skill } from '../../../../core/skill/skill';
import {
    PriorityType,
    SkillTag,
    TriggerEffectContext,
} from '../../../../core/skill/skill.types';
import { shunfu } from '../jin/simayi';
import { fengying } from '../power/cuiyanmaojie';
import { yongjin } from '../power/lingtong';
import { jianglue } from '../power/wangping';
import { luanwu } from '../standard/qun/jiaxu';

export const lord_simayi = sgs.General({
    name: 'wars.lord_simayi',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    lord: true,
    enable: false,
    isWars: true,
});

export const jiaping = sgs.Skill({
    name: 'wars.lord_simayi.jiaping',
});

jiaping.addEffect(
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
                bg_url: 'resources/background/jin.png',
                bgm_url: 'resources/background/jin.mp3',
                bgm_loop: false,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    const skill = await room.addSkill(
                        'wars.lord_simayi.bahuangsishiling',
                        this.player,
                        {
                            source: `effect:${this.id}`,
                            showui: 'other',
                        }
                    );
                    this.setData('bahuang', skill);
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    await this.getData<Skill>('bahuang').removeSelf();
                },
            },
        ],
    })
);

export const guikuang = sgs.Skill({
    name: 'wars.lord_simayi.guikuang',
});

guikuang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const self = context.effect;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 2,
                                filter(item, selected) {
                                    if (selected.length === 0) {
                                        return item.canPindian([], self.name);
                                    } else {
                                        return (
                                            room.isOtherKingdom(
                                                selected[0],
                                                item
                                            ) &&
                                            selected[0].canPindian(
                                                [item],
                                                self.name
                                            )
                                        );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `诡诳，你可以选择两名玩家拼点`,
                            thinkPrompt: '诡诳',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { targets } = context;
            if (targets.length >= 2) {
                return await room.pindian({
                    from: targets[0],
                    targets: [targets[1]],
                    source: data,
                    reason: this.name,
                });
            }
        },
        async effect(room, data, context) {
            const pindian = context.cost as PindianEvent;
            const reds = [...pindian.cards.keys()].filter((v) => {
                const card = pindian.cards.get(v);
                if (card && card.color === CardColor.Red) return true;
            });
            const loses = pindian.lose;
            room.sortResponse(reds);
            while (reds.length > 0) {
                const from = reds.shift();
                const targets = loses.slice();
                while (targets.length > 0) {
                    const to = targets.shift();
                    await room.damage({
                        from,
                        to,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

export const shujuan = sgs.Skill({
    name: 'wars.lord_simayi.shujuan',
});

shujuan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Lock],
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                !this.getData(this.name) &&
                data.has_filter(
                    (d, c) =>
                        c.name === 'jilinqianyi' &&
                        (d.toArea === room.discardArea ||
                            (d.toArea.type === AreaType.Equip &&
                                d.toArea !== player.equipArea))
                )
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            this.setData(this.name, true);
            return data.getCard((v, c) => c.name === 'jilinqianyi');
        },
        async effect(room, data, context) {
            const { from } = context;
            const jilinqianyi = context.cost as GameCard;
            if (jilinqianyi) {
                await room.obtainCards({
                    player: from,
                    cards: [jilinqianyi],
                    source: data,
                    reason: this.name,
                });
                if (jilinqianyi.area === from.handArea) {
                    await room.preUseCard({
                        from,
                        card: room.createVirtualCardByOne(jilinqianyi),
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data) {
                    this.removeData(this.name);
                },
            },
        ],
    })
);

export const bahuangsishiling = sgs.Skill({
    name: 'wars.lord_simayi.bahuangsishiling',
    global(room, to) {
        return room.sameAsKingdom(this.player, to);
    },
});

bahuangsishiling.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        audio: [],
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            if (
                room.sameAsKingdom(this.player, player) &&
                data.isOwner(player) &&
                !this.getData('times') &&
                player.hasDeputy()
            ) {
                const start = room.currentTurn.getCircleStartTurn();
                return (
                    start &&
                    room.getHistorys(
                        sgs.DataType.OpenEvent,
                        (v) => v.player === player && v.dataId > start.dataId
                    ).length > 0
                );
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const effect = context.effect;
                    const options = [
                        'wars.lord_simayi.shunfu',
                        'wars.lord_simayi.fengying',
                        'wars.lord_simayi.jianglue',
                        'wars.lord_simayi.yongjin',
                        'wars.lord_simayi.luanwu',
                    ].map((v) => {
                        return effect.hasMark(v) ? `!${v}` : v;
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
                            prompt: '八荒死士令：你可以移除副将并发动一个技能',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.remove({
                player: from,
                general: from.deputy,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const skill_name = context.req_result.results.option.result.at(
                0
            ) as string;
            this.setMark(skill_name, true);
            this.setData('times', 1);
            const skill = await room.addSkill(skill_name, from, {
                source: this.name,
                showui: 'default',
            });
            if (skill) {
                const effect = skill.effects.at(0);
                if (effect) {
                    const req = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('skill_cost'),
                            context,
                        },
                    });
                    await room.useskill({
                        use_skill: effect as any,
                        context: (effect as any).getContext?.(data),
                        req,
                        source: data,
                        reason: 'useskill',
                    });
                    await skill.removeSelf();
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.CircleEnd,
                async on_exec(room, data) {
                    this.removeData('times');
                },
            },
        ],
    })
);

export const lord_simayi_shunfu = sgs.Skill(
    sgs.copy(shunfu, {
        name: 'wars.lord_simayi.shunfu',
        audio: ['lord_simayi/shunfu'],
    })
);

export const lord_simayi_luanwu = sgs.Skill(
    sgs.copy(luanwu, {
        name: 'wars.lord_simayi.luanwu',
        audio: ['lord_simayi/luanwu'],
    })
);

export const lord_simayi_fengying = sgs.Skill(
    sgs.copy(fengying, {
        name: 'wars.lord_simayi.fengying',
        audio: ['lord_simayi/fengying'],
    })
);

export const lord_simayi_yongjin = sgs.Skill(
    sgs.copy(yongjin, {
        name: 'wars.lord_simayi.yongjin',
        audio: ['lord_simayi/yongjin'],
    })
);

export const lord_simayi_jianglue = sgs.Skill(
    sgs.copy(jianglue, {
        name: 'wars.lord_simayi.jianglue',
        audio: ['lord_simayi/jianglue'],
    })
);

lord_simayi.addSkill(jiaping);
lord_simayi.addSkill('#wars.lord_simayi.bahuangsishiling');
lord_simayi.addSkill('#wars.lord_simayi.shunfu');
lord_simayi.addSkill('#wars.lord_simayi.fengying');
lord_simayi.addSkill('#wars.lord_simayi.jianglue');
lord_simayi.addSkill('#wars.lord_simayi.yongjin');
lord_simayi.addSkill('#wars.lord_simayi.luanwu');
lord_simayi.addSkill(guikuang);
lord_simayi.addSkill(shujuan);
