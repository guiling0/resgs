import { AreaType } from '../../../../core/area/area.type';
import {
    CardPut,
    CardSubType,
    CardSuit,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { MoveCardReason } from '../../../../core/room/room.types';
import { Skill } from '../../../../core/skill/skill';
import { SkillTag, PriorityType } from '../../../../core/skill/skill.types';
import { haoshi } from '../standard/wu/lusu';
import { duoshi, duoshi_v2025 } from '../standard/wu/luxun';
import { zhiheng } from '../standard/wu/sunquan';
import { yingzi } from '../standard/wu/zhouyu';

export const lord_sunquan = sgs.General({
    name: 'wars.lord_sunquan',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    lord: true,
    enable: false,
    isWars: true,
});

export const jiahe = sgs.Skill({
    name: 'wars.lord_sunquan.jiahe',
});

jiahe.addEffect(
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
                bg_url: 'resources/background/wu.png',
                bgm_url: 'resources/background/wu.mp3',
                bgm_loop: false,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    const skill = await room.addSkill(
                        'wars.lord_sunquan.flamemap',
                        this.player,
                        {
                            source: `effect:${this.id}`,
                            showui: 'other',
                        }
                    );
                    this.setData('fenghuo', skill);
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    await this.getData<Skill>('fenghuo').removeSelf();
                },
            },
        ],
    })
);

export const lianzi = sgs.Skill({
    name: 'wars.lord_sunquan.lianzi',
});

lianzi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    let count = from.getUpOrSideCards('mark.fenghuo').length;
                    room.players.forEach((v) => {
                        if (room.sameAsKingdom(from, v)) {
                            count += v.equipArea.count;
                        }
                    });
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: {
                                text: `是否发动技能敛资，弃置一张手牌，亮出{0}张牌并获得其中与弃置牌类别相同的牌`,
                                values: [{ type: 'number', value: count }],
                            },
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
            const { from, cards } = context;
            let count = from.getUpOrSideCards('mark.fenghuo').length;
            room.players.forEach((v) => {
                if (room.sameAsKingdom(from, v)) {
                    count += v.equipArea.count;
                }
            });
            let dcards = await room.getNCards(count);
            await room.flashCards({
                player: from,
                cards: dcards,
                source: data,
                reason: this.name,
            });
            const card = cards.at(0);
            await room.delay(1);
            const obtains = dcards.slice().filter((v) => v.type === card.type);
            await room.obtainCards({
                player: from,
                cards: obtains,
                source: data,
                reason: this.name,
            });
            await room.puto({
                player: from,
                cards: dcards.filter((v) => v.area === room.processingArea),
                toArea: room.discardArea,
                // animation: false,
                source: data,
                reason: this.name,
            });
            if (obtains.length > 3) {
                await this.skill?.removeSelf();
                await room.addSkill('wars.lord_sunquan.zhiheng', from, {
                    source: this.name,
                    showui: 'default',
                });
            }
        },
    })
);

export const jubao = sgs.Skill({
    name: 'wars.lord_sunquan.jubao',
});

jubao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.MoveCardBefore1,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player)) {
                return data.has_filter((v, c) => {
                    return (
                        c.subtype === CardSubType.Treasure &&
                        v.fromArea === player.equipArea &&
                        v.reason === MoveCardReason.Obtain &&
                        v.toArea !== player.handArea
                    );
                });
            }
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const cards = data.getCards((v, c) => {
                return (
                    c.subtype === CardSubType.Treasure &&
                    v.fromArea === from.equipArea &&
                    v.reason === MoveCardReason.Obtain &&
                    v.toArea !== from.handArea
                );
            });
            await data.cancle(cards);
            return true;
        },
    })
);

jubao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                if (
                    room.discardArea.cards.find(
                        (v) => v.name === 'dinglanyemingzhu'
                    )
                ) {
                    return true;
                }
                if (
                    room.playerAlives.find((v) =>
                        v
                            .getEquipCards()
                            .find((c) => c.name === 'dinglanyemingzhu')
                    )
                ) {
                    return true;
                }
            }
        },
        getSelectors(room, context) {
            const target = context.targets.at(0);
            return {
                choose: () => {
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '聚宝',
                                    timebar: room.responseTime,
                                    prompt: '聚宝：请选择一张牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: '聚宝',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const target = room.playerAlives.find((v) =>
                v.getEquipCards().find((c) => c.name === 'dinglanyemingzhu')
            );
            if (target) {
                context.targets = [target];
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
            }
        },
    })
);

export const flamemap = sgs.Skill({
    name: 'wars.lord_sunquan.flamemap',
    global(room, to) {
        return room.sameAsKingdom(this.player, to);
    },
});

//拿技能
flamemap.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.ReadyPhaseStarted,
        audio: [],
        can_trigger(room, player, data: PhaseEvent) {
            return (
                room.sameAsKingdom(this.player, player) &&
                data.isOwner(player) &&
                this.player.hasUpOrSideCards('mark.fenghuo')
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const effect = context.effect;
                    const options = [
                        'wars.lord_sunquan.yingzi',
                        'wars.lord_sunquan.haoshi',
                        'wars.lord_sunquan.shelie',
                        'wars.lord_sunquan.duoshi',
                    ];
                    const count =
                        effect.player.getUpOrSideCards('mark.fenghuo').length;
                    for (let i = 3; i >= count; i--) {
                        options[i] = '!' + options[i];
                    }
                    const c_count = count >= 5 ? 2 : 1;
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: c_count,
                                selectable: options,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: {
                                text: '缘江烽火图：你可以选择{0}个技能获得',
                                values: [{ type: 'number', value: c_count }],
                            },
                            thinkPrompt: '缘江烽火图',
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { from } = context;
            const skill_names = context.req_result.results.option
                .result as string[];
            const skills: Skill[] = [];
            for (const name of skill_names) {
                const skill = await room.addSkill(name, from, {
                    source: this.name,
                    showui: 'default',
                });
                skills.push(skill);
            }
            const effect = await room.addEffect('fenghuo.delay', from);
            effect.setData('skills', skills);
            effect.setData('data', room.currentTurn);
        },
    })
);

export const fenghuo_delay = sgs.TriggerEffect({
    name: 'fenghuo.delay',
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data: TurnEvent) {
                if (this.getData('data') === data) {
                    const skills = this.getData<Skill[]>('skills');
                    for (const skill of skills) {
                        await skill?.removeSelf();
                    }
                }
            },
        },
    ],
});

//放烽火
flamemap.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        audio: ['lord_sunquan/flamemap1', 'lord_sunquan/flamemap2'],
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                room.sameAsKingdom(this.player, player) && data.isOwner(player)
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
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Equip;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `缘江烽火图：你可以将一张装备牌置于缘江烽火图上`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                cards,
                targets: [target],
            } = context;
            await room.showCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            await room.puto({
                player: from,
                cards,
                toArea: target.upArea,
                source: data,
                movetype: CardPut.Up,
                reason: this.name,
            });
            cards.forEach((v) => v.setMark('mark.fenghuo', true));
            this.player.setMark('mark.fenghuo', true, {
                visible: true,
                source: this.name,
                type: 'cards',
                areaId: this.player.upArea.areaId,
            });
            return true;
        },
    })
);

//掉烽火
flamemap.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        audio: ['lord_sunquan/flamemap3', 'lord_sunquan/flamemap4'],
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                data.channel &&
                (data.channel.name === 'sha' ||
                    data.channel.type === CardType.Scroll) &&
                player.hasUpOrSideCards('mark.fenghuo')
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    const cards = from.getUpOrSideCards('mark.fenghuo');
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: cards,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `缘江烽火图：请将一张“烽火”置入弃牌堆`,
                            thinkPrompt: '缘江烽火图',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.puto({
                player: from,
                cards,
                toArea: room.discardArea,
                source: data,
                movetype: CardPut.Up,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            from.refreshMark = 'mark.fenghuo';
        },
    })
);

//制衡
export const lord_zhiheng = sgs.Skill(
    sgs.copy(zhiheng, {
        name: 'wars.lord_sunquan.zhiheng',
    })
);

//英姿
export const lord_yingzi = sgs.Skill(
    sgs.copy(yingzi, {
        name: 'wars.lord_sunquan.yingzi',
    })
);

//好施
export const lord_haoshi = sgs.Skill(
    sgs.copy(haoshi, {
        name: 'wars.lord_sunquan.haoshi',
    })
);

//度势
export const lord_duoshi = sgs.Skill(
    sgs.copy(duoshi_v2025, {
        name: 'wars.lord_sunquan.duoshi',
    })
);

//涉猎
export const lord_shelie = sgs.Skill({
    name: 'wars.lord_sunquan.shelie',
});

lord_shelie.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.DrawPhaseStartedAfter,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) && data.isOwner(player) && !data.isComplete
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const cards = context.cards;
                    const suits: CardSuit[] = [];
                    cards.forEach((v) => {
                        if (!suits.includes(v.suit)) {
                            suits.push(v.suit);
                        }
                    });
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: suits.length,
                                selectable: cards,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '涉猎',
                                    timebar: room.responseTime,
                                    prompt: '涉猎：请选择想要的牌（每种花色一张）',
                                    buttons: ['confirm'],
                                },
                                filter(item, selected) {
                                    return !selected.find(
                                        (v) => v.suit === item.suit
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: '涉猎',
                        },
                    };
                },
            };
        },
        async cost(room, data: PhaseEvent, context) {
            await data.end();
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(5);
            await room.flashCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            context.cards = cards;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const gcards = room.getResultCards(req);
            await room.obtainCards({
                player: from,
                cards: gcards,
                source: data,
                reason: this.name,
            });
            await room.puto({
                player: from,
                cards: cards.filter((v) => v.area === room.processingArea),
                toArea: room.discardArea,
                source: data,
                movetype: CardPut.Up,
                reason: this.name,
            });
        },
    })
);

lord_sunquan.addSkill(jiahe);
lord_sunquan.addSkill('#wars.lord_sunquan.flamemap');
lord_sunquan.addSkill('#wars.lord_sunquan.yingzi');
lord_sunquan.addSkill('#wars.lord_sunquan.haoshi');
lord_sunquan.addSkill('#wars.lord_sunquan.shelie');
lord_sunquan.addSkill('#wars.lord_sunquan.duoshi');
lord_sunquan.addSkill(lianzi);
lord_sunquan.addSkill('#wars.lord_sunquan.zhiheng');
lord_sunquan.addSkill(jubao);

sgs.loadTranslation({
    ['mark.fenghuo']: '烽火',
});
