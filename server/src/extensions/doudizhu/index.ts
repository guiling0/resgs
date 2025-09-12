import { CardPut, VirtualCardData } from '../../core/card/card.types';
import { ChooseGeneralData } from '../../core/choose/types/choose.general';
import { EventTriggers } from '../../core/event/triggers';
import { DieEvent } from '../../core/event/types/event.die';
import { PhaseEvent } from '../../core/event/types/event.turn';
import { General } from '../../core/general/general';
import { GamePlayer } from '../../core/player/player';
import { PriorityType, StateEffectType } from '../../core/skill/skill.types';

export const game_doudizhu_rules = sgs.Skill({
    name: 'game_doudizhu_rules',
});
game_doudizhu_rules.addEffect('base_selectors');
game_doudizhu_rules.addEffect('gamerule_obtain_skill');
game_doudizhu_rules.addEffect('gamerule_init_handcard');
game_doudizhu_rules.addEffect('gamerule_judgephase');
game_doudizhu_rules.addEffect('gamerule_drawphase');
game_doudizhu_rules.addEffect('gamerule_dropphase');
game_doudizhu_rules.addEffect('gamerule_mvp');

/** 叫分选将 */
game_doudizhu_rules.addEffect(
    sgs.TriggerEffect({
        name: 'gamerule_ddz_choose_general',
        priorityType: PriorityType.GlobalRule,
        trigger: EventTriggers.ChooseGeneral,
        can_trigger() {
            return true;
        },
        getSelectors(room, context) {
            return {
                score: () => {
                    return {
                        selectors: {
                            general: {
                                type: 'general',
                                step: 1,
                                count: 0,
                                selectable: room.getGenerals(
                                    context.generals as string[]
                                ),
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '叫分',
                                    timebar: room.responseTime,
                                    prompt: '请叫分',
                                },
                                complete: true,
                            },
                            option: room.createChooseOptions({
                                step: 2,
                                count: 1,
                                selectable: context.scores,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: '叫分',
                            ms: 20,
                        },
                    };
                },
                choose_general: () => {
                    return {
                        selectors: {
                            general: {
                                type: 'general',
                                step: 1,
                                count: 1,
                                selectable: room.getGenerals(
                                    context.generals as string[]
                                ),
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '请选择一张武将牌',
                                    timebar: 45,
                                    buttons: ['confirm'],
                                },
                            },
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: '选择武将牌',
                            ms: 45,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            room.players.forEach((player, i) => {
                player.setProperty('general_mode', 'single');
                player.setProperty('camp_mode', 'role');
                player.setProperty('headOpen', true);
                player.setProperty('deputyOpen', true);
            });
            const generals = await room.allocateGenerals();
            if (!generals) return;
            //展示武将牌并叫分
            let maxScore = 0;
            let dizhu: GamePlayer;
            for (const player of room.players) {
                const scores = [100, 200, 300].map((v) => {
                    if (v > maxScore) {
                        return v.toString();
                    } else {
                        return '!' + v.toString();
                    }
                });
                scores.push('score_not');
                context.scores = scores;
                context.generals = generals.get(player);
                const req = await room.doRequest({
                    player,
                    get_selectors: {
                        selectorId: this.getSelectorName('score'),
                        context,
                    },
                });
                const result = room.getResult(req, 'option').result as string[];
                if (result.includes('300')) {
                    maxScore = 300;
                    dizhu = player;
                    break;
                }
                if (result.includes('200')) {
                    if (maxScore < 200) {
                        maxScore = 200;
                        dizhu = player;
                    }
                    continue;
                }
                if (result.includes('100')) {
                    if (maxScore < 100) {
                        maxScore = 100;
                        dizhu = player;
                    }
                    continue;
                }
                if (result.includes('score_not')) {
                    continue;
                }
            }
            if (!dizhu) {
                maxScore = 100;
                dizhu = room.players[0];
            }
            //地主变成1号位
            const index = room._players.findIndex((v) => v === dizhu);
            room._players.splice(index, 1);
            room._players.unshift(dizhu);
            room.players.forEach((v, i) => {
                v.setProperty('seat', i + 1);
            });
            room.sortPlayers(room._players);
            dizhu.setProperty('role', 'dizhu');
            room.players.forEach((v) => {
                if (v !== dizhu) {
                    v.setProperty('role', 'nongmin');
                }
            });
            await room.delay(1);
            room.setProperty('updateSeat', 1);
            await room.delay(1);
            room.currentTurn.player = dizhu;
            //给地主额外两张武将牌
            const newGenerals = generals
                .get('unUse')
                .slice(0, 2)
                .map((v) => {
                    const gs = room.getGeneralByName(v);
                    const id = gs[sgs.utils.randomInt(0, gs.length - 1)].id;
                    room.recordGeneral(id, ['isOffered']);
                    return id;
                });
            generals.get(dizhu)?.push(...newGenerals);
            const reqs = await room.doRequestAll(
                room.players.map((player) => {
                    const selectable = generals.get(player);
                    return {
                        player,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose_general'),
                            context: {
                                generals: selectable,
                            },
                        },
                    };
                })
            );
            reqs.forEach((v) => {
                const result = v.result.results.general.result as General[];
                room.generalArea.remove(result);
                v.player.handArea.add(result);
                if (result.length < 1) {
                    result.push(room.getGeneral('default.shibingn'));
                }
                v.player.setProperty('_head', result[0].id);
                room.recordGeneral(result[0].id, ['isInitialPick']);
            });
            return true;
        },
    })
);

/** 地主获得专属技能 */
game_doudizhu_rules.addEffect(
    sgs.TriggerEffect({
        name: 'gamerule_ddz_obtain_skill',
        trigger: EventTriggers.ChooseGeneralAfter,
        priorityType: PriorityType.GlobalRule,
        can_trigger() {
            return true;
        },
        async cost(room, data) {
            const dizhu = room.players.find((v) => v.role === 'dizhu');
            if (dizhu && dizhu.alive) {
                await room.addSkill('doudizhu.feiyang', dizhu, {
                    source: 'system',
                    showui: 'default',
                    log: false,
                });
                await room.addSkill('doudizhu.bahu', dizhu, {
                    source: 'system',
                    showui: 'default',
                    log: false,
                });
            }
            return true;
        },
    })
);

/** 初始化属性 */
game_doudizhu_rules.addEffect(
    sgs.TriggerEffect({
        name: 'gamerule_ddz_init_property',
        trigger: EventTriggers.InitProperty,
        priorityType: PriorityType.GlobalRule,
        can_trigger() {
            return true;
        },
        async cost(room, data) {
            for (const player of room.players) {
                let maxhp = player.head.sourceData.isWars
                        ? player.head.hpmax * 2
                        : player.head.hpmax,
                    hp = player.head.sourceData.isWars
                        ? player.head.hp * 2
                        : player.head.hp,
                    shield = player.head.shield;

                if (hp > maxhp) hp = maxhp;
                if (player.role === 'dizhu') {
                    maxhp += 1;
                    hp += 1;
                }
                player.setProperty('seat', player.seat);
                player.setProperty('maxhp', maxhp);
                player.setProperty('hp', hp);
                player.setProperty('inthp', hp);
                player.setProperty('shield', shield);
                player.setProperty('kingdom', player.head.kingdom);
            }
            return true;
        },
    })
);

/** 农民死后队友选择 */
game_doudizhu_rules.addEffect(
    sgs.TriggerEffect({
        name: 'gamerule_ddz_RewardAndPunish',
        priorityType: PriorityType.GlobalRule,
        trigger: EventTriggers.Deathed,
        can_trigger(room, player, data: DieEvent) {
            return data.player.role === 'nongmin';
        },
        getSelectors(room, context) {
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
                            canCancle: true,
                            prompt: '请选择一项',
                            showMainButtons: false,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const nongmin = room.playerAlives.find((v) => v.role === 'nongmin');
            if (nongmin) {
                const handles: string[] = [];
                const draw = room.createEventData(sgs.DataType.DrawCardsData, {
                    player: nongmin,
                    count: 2,
                    source: data,
                    reason: this.name,
                });
                const recover = room.createEventData(
                    sgs.DataType.RecoverHpEvent,
                    {
                        player: nongmin,
                        source: data,
                        reason: this.name,
                    }
                );
                handles.push(`${draw.check() ? '' : '!'}ddz.reward.draw`);
                handles.push(`${recover.check() ? '' : '!'}ddz.reward.recover`);
                context.handles = handles;
                const req = await room.doRequest({
                    player: nongmin,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context: {
                            handles,
                        },
                    },
                });
                const result = room.getResult(req, 'option').result as string[];
                if (result.includes('ddz.reward.draw')) {
                    await room.drawCards(draw);
                }
                if (result.includes('ddz.reward.recover')) {
                    await room.recoverhp(recover);
                }
                return true;
            }
        },
    })
);

/** 胜负判定 */
game_doudizhu_rules.addEffect(
    sgs.TriggerEffect({
        name: 'gamerule_ddz_gameover',
        priorityType: PriorityType.GlobalRule,
        trigger: EventTriggers.ConfirmRole,
        can_trigger(room, player, data: DieEvent) {
            return (
                data.player.role === 'dizhu' ||
                !room.playerAlives.find((v) => v.role === 'nongmin' && v.alive)
            );
        },
        async cost(room, data: DieEvent, context) {
            if (data.player.role === 'dizhu') {
                await room.gameOver(
                    room.getPlayerByFilter((v) => v.role !== 'dizhu', true),
                    this.name
                );
            } else {
                await room.gameOver(
                    room.getPlayerByFilter((v) => v.role === 'dizhu', true),
                    this.name
                );
            }
            return true;
        },
    })
);

/** 地主技能-飞扬 */
export const dizhu_feiyang = sgs.Skill({
    name: 'doudizhu.feiyang',
});

dizhu_feiyang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Rule,
        trigger: EventTriggers.JudgePhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.judgeCards.length > 0
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
                                count: 2,
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `飞扬：你可以弃置两张手牌，然后弃置一张判定区里的牌`,
                            thinkPrompt: '飞扬',
                        },
                    };
                },
                choose: () => {
                    const selectable = context.vcards;
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `飞扬：请弃置一张判定区里的牌`,
                            thinkPrompt: '飞扬',
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
            const vcards = from.judgeCards.map((v) => v.vdata);
            if (vcards.length) {
                context.vcards = vcards;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const card = room
                    .getResult(req, 'card')
                    .result.at(0) as VirtualCardData;
                if (card) {
                    const vcard = from.judgeCards.find((v) => v.id === card.id);
                    if (vcard) {
                        await room.puto({
                            player: from,
                            cards: vcard.subcards,
                            toArea: room.discardArea,
                            source: data,
                            movetype: CardPut.Up,
                            reason: this.name,
                        });
                    }
                }
            }
        },
    })
);

/** 地主技能-跋扈 */
export const dizhu_bahu = sgs.Skill({
    name: 'doudizhu.bahu',
});

dizhu_bahu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.ReadyPhaseStarted,
        priorityType: PriorityType.Rule,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

dizhu_bahu.addEffect(
    sgs.StateEffect({
        [StateEffectType.TargetMod_CorrectTime](from, card, target) {
            if (this.isOwner(from) && card.name === 'sha') {
                return 1;
            }
        },
    })
);

export const mode_doudizhu = sgs.GameMode({
    name: 'doudizhu',
    maxPlayer: 3,
    settings: [],
    rules: game_doudizhu_rules,
});

sgs.loadTranslation({
    ['score_not']: '不叫',
    ['ddz.reward.draw']: '摸两张牌',
    ['ddz.reward.recover']: '回复一点体力',
});

sgs.SkillSetting(dizhu_feiyang, {
    name: '飞扬',
    desc: '判定阶段开始时，若你的判定区有牌，你可以弃置两张手牌，然后弃置自己判定区的一张牌。',
});

sgs.SkillSetting(dizhu_bahu, {
    name: '跋扈',
    desc: '锁定技，准备阶段开始时，你摸一张牌。你使用【杀】的次数上限+1。',
});
