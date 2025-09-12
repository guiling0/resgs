import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { OpenEvent } from '../../../../core/event/types/event.state';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Skill } from '../../../../core/skill/skill';
import { EffectLifecycle, SkillTag } from '../../../../core/skill/skill.types';
import { wusheng } from '../standard/shu/guanyu';
import { liegong } from '../standard/shu/huangzhong';
import { tieqi } from '../standard/shu/machao';
import { kuanggu } from '../standard/shu/weiyan';
import { paoxiao } from '../standard/shu/zhangfei';
import { longdan } from '../standard/shu/zhaoyun';

export const fazheng = sgs.General({
    name: 'wars.fazheng',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const enyuan = sgs.Skill({
    name: 'wars.fazheng.enyuan',
});

enyuan.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        auto_directline: 1,
        audio: ['fazheng/enyuan3', 'fazheng/enyuan4'],
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return this.isOwner(player) && data.from && data.to === player;
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.from],
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const effect = context.effect;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: target.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `恩怨：你需要交给${sgs.getTranslation(
                                this.player.gameName
                            )}一张手牌，否则失去1点体力`,
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
            if (target) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                const give = await room.giveCards({
                    from: target,
                    to: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
                if (!give) {
                    await room.losehp({
                        player: target,
                        source: data,
                        reason: this.name,
                    });
                }
                return true;
            }
        },
    })
);

enyuan.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        auto_directline: 1,
        audio: ['fazheng/enyuan1', 'fazheng/enyuan2'],
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from !== player &&
                data.current.target === player &&
                data.card &&
                data.card.name === 'tao'
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.from],
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            return await room.drawCards({
                player: target,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const xuanhuo = sgs.Skill({
    name: 'wars.fazheng.xuanhuo',
    global(room, to) {
        return room.sameAsKingdom(this.player, to);
    },
});

xuanhuo.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.player &&
                !this.isOwner(player) &&
                room.sameAsKingdom(this.player, player) &&
                data.isOwner(player)
            );
        },
        context(room, player, data) {
            return {
                targets: [this.player],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `眩惑：你可以将一张牌交给${this.player.gameName}`,
                        },
                    };
                },
                choose: () => {
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
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `眩惑：你需要弃置一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_skill: () => {
                    const options = [
                        'wars.fazheng.wusheng',
                        'wars.fazheng.paoxiao',
                        'wars.fazheng.longdan',
                        'wars.fazheng.tieqi',
                        'wars.fazheng.liegong',
                        'wars.fazheng.kuanggu',
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
                            prompt: '眩惑：请选择一个技能获得',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.giveCards({
                from,
                to: this.player,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            if (from.hasCardsInArea()) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                const drop = await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
                if (drop) {
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
                    const effect = await room.addEffect('xuanhuo.delay', from);
                    effect.setData('skill', skill);
                    effect.setData('data', room.currentTurn);
                    from.setMark('mark.xuanhuo', skill_name, {
                        visible: true,
                    });
                }
            }
        },
    })
);

export const xuanhuo_delay = sgs.TriggerEffect({
    name: 'xuanhuo.delay',
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data: TurnEvent) {
                if (this.getData('data') === data) {
                    this.player.removeMark('mark.xuanhuo');
                    await this.getData<Skill>('skill')?.removeSelf();
                    await this.removeSelf();
                }
            },
        },
        {
            trigger: EventTriggers.StateChanged,
            async on_exec(room, data: OpenEvent) {
                if (data.is(sgs.DataType.OpenEvent)) {
                    const skill = this.getData<Skill>('skill');
                    if (!skill) return;
                    const has = room.skills.find(
                        (s) =>
                            s !== skill &&
                            s.isOpen() &&
                            s.trueName === skill.trueName
                    );
                    if (has) {
                        this.player.removeMark('mark.xuanhuo');
                        await skill.removeSelf();
                        await this.removeSelf();
                    }
                }
            },
        },
    ],
});

export const fazheng_wusheng = sgs.Skill(
    sgs.copy(wusheng, {
        name: 'wars.fazheng.wusheng',
    })
);

export const fazheng_paoxiao = sgs.Skill(
    sgs.copy(paoxiao, {
        name: 'wars.fazheng.paoxiao',
    })
);

export const fazheng_longdan = sgs.Skill(
    sgs.copy(longdan, {
        name: 'wars.fazheng.longdan',
    })
);

export const fazheng_tieqi = sgs.Skill(
    sgs.copy(tieqi, {
        name: 'wars.fazheng.tieqi',
    })
);

export const fazheng_liegong = sgs.Skill(
    sgs.copy(liegong, {
        name: 'wars.fazheng.liegong',
    })
);

export const fazheng_kuanggu = sgs.Skill(
    sgs.copy(kuanggu, {
        name: 'wars.fazheng.kuanggu',
    })
);

fazheng.addSkill(enyuan);
fazheng.addSkill(xuanhuo);
fazheng.addSkill('#wars.fazheng.wusheng');
fazheng.addSkill('#wars.fazheng.paoxiao');
fazheng.addSkill('#wars.fazheng.longdan');
fazheng.addSkill('#wars.fazheng.tieqi');
fazheng.addSkill('#wars.fazheng.liegong');
fazheng.addSkill('#wars.fazheng.kuanggu');

sgs.loadTranslation({
    ['mark.xuanhuo']: '眩惑',
});
