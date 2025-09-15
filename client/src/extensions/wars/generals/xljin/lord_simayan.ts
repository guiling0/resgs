import { GameCard } from '../../../../core/card/card';
import {
    CardPut,
    CardType,
    VirtualCardData,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DieEvent, DyingEvent } from '../../../../core/event/types/event.die';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { NeedUseCardData } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import {
    WindowItemDatas,
    MoveCardReason,
} from '../../../../core/room/room.types';
import { Skill } from '../../../../core/skill/skill';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const lord_simayan = sgs.General({
    name: 'xl.lord_simayan',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    lord: true,
    enable: false,
    isWars: true,
});

export const taishi = sgs.Skill({
    name: 'xl.lord_simayan.taishi',
});

taishi.addEffect(
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
                bg_url: 'resources/background/jin_xl.png',
                bgm_url: 'resources/background/jin_xl.mp3',
                bgm_loop: false,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    const skill = await room.addSkill(
                        'xl.lord_simayan.bagongbizhengshu',
                        this.player,
                        {
                            source: `effect:${this.id}`,
                            showui: 'other',
                        }
                    );
                    this.setData('bagong', skill);
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    await this.getData<Skill>('bagong').removeSelf();
                },
            },
        ],
    })
);

taishi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock, SkillTag.Lord],
        auto_log: 1,
        trigger: EventTriggers.CircleEnd,
        can_trigger(room, player, data: TurnEvent) {
            return this.isOwner(player) && room.circleCount === 1;
        },
        async effect(room, data, context) {
            const { from } = context;
            const lords = [
                'wars.lord_liubei',
                'wars.lord_caocao',
                'wars.lord_zhangjiao',
                'wars.lord_sunquan',
                'wars.lord_simayi',
            ];
            const old = [
                'wars.liubei',
                'wars.caocao',
                'wars.zhangjiao',
                'wars.sunquan',
                'wars.simayi_jin',
            ];
            for (const player of room.playerAlives) {
                if (player === from) continue;
                const index = lords.findIndex((v) => v === player.head.name);
                if (index !== -1) {
                    const general = room.getGeneral(old[index]);
                    if (general) {
                        const lord = from.head;
                        await room.change({
                            player,
                            general: player.head,
                            to_general: general,
                            source: data,
                            reason: this.name,
                        });
                        //将原武将牌加入到仓廪
                        room.generalArea.remove([lord]);
                        room.granaryArea.add([lord]);
                        if (
                            room.getPlayerCountByKingdom(player.kingdom) >
                            room.playerCount / 2
                        ) {
                            const kingdom = player.kingdom;
                            let count =
                                room.getPlayerCountByKingdom(player.kingdom) -
                                Math.ceil(room.playerCount / 2);
                            for (const current of room.playerAlives) {
                                if (current.kingdom === kingdom) {
                                    current.kingdom = `ye_${kingdom}`;
                                    count--;
                                    if (count === 0) break;
                                }
                            }
                        }
                    }
                }
            }
        },
    })
);

export const guitong = sgs.Skill({
    name: 'xl.lord_simayan.guitong',
});

guitong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        priorityType: PriorityType.None,
        regard_skill(room, player, data) {
            if (this.isOwner(player)) {
                const ban_country = room.getData('ban_country') as string;
                if (ban_country === 'wei') {
                    return 'xl.lord_simayan.huibian';
                }
                if (ban_country === 'shu') {
                    return 'xl.lord_simayan.jizhao';
                }
                if (ban_country === 'wu') {
                    return 'xl.lord_simayan.lianzi';
                }
                if (ban_country === 'qun') {
                    return 'xl.lord_simayan.wuxin';
                }
            }
        },
    })
);

export const jizhao = sgs.Skill({
    name: 'xl.lord_simayan.jizhao',
});

jizhao.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Limit],
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.Dying,
        can_trigger(room, player, data: DyingEvent) {
            return this.isOwner(player) && data.player === player;
        },
        async cost(room, data, context) {
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            const count = from.maxhp - from.getHandCards().length;
            await room.drawCards({
                player: from,
                count,
                source: data,
                reason: this.name,
            });
            await room.recoverTo({
                player: from,
                number: 2,
                source: data,
                reason: this.name,
            });
            const skill = room.skills.find(
                (v) =>
                    v.name === 'xl.lord_simayan.taishi' &&
                    v.player === this.skill?.player
            );
            await skill?.removeSelf();
            await room.addSkill('xl.lord_simayan.rende', from, {
                source: this.name,
                showui: 'default',
            });
        },
    })
);

export const rende = sgs.Skill({
    name: 'xl.lord_simayan.rende',
});

rende.addEffect(
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
                                    return (
                                        item !== from &&
                                        !item.hasMark('rende_wars')
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `仁德，你可以将任意张牌交给一名其他角色`,
                        },
                    };
                },
                viewuse: () => {
                    const from = context.from;
                    let vcards: VirtualCardData[] = [];
                    room.cardNamesToType.get(CardType.Basic).forEach((v) => {
                        vcards.push(...room.createVData({ name: v }));
                    });
                    vcards.forEach((v) => {
                        v.custom.method = 1;
                        v.custom.canuse = from.canUseCard(
                            v,
                            undefined,
                            this.name,
                            { excluesToCard: true }
                        );
                    });
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: vcards,
                                filter(item, selected) {
                                    return item.custom.canuse;
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByData(
                                                item,
                                                false
                                            );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `仁德，你可以视为使用一张基本牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        context(room, player, data) {
            return {
                maxTimes: -1,
            };
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
            target.setMark('rende_wars', true);
            const count = this.getData<number>(this.name) ?? 0;
            const newcount = count + give.getMoveCount();
            this.setData(this.name, newcount);
            if (newcount >= 2 && count < 2) {
                const use = await room.preUseCard({
                    from,
                    can_use_cards: room.cardNames
                        .filter(
                            (v) => sgs.utils.getCardType(v) === CardType.Basic
                        )
                        .map((v) => {
                            return {
                                name: v,
                            };
                        }),
                    cardSelector: {
                        selectorId: this.getSelectorName('viewuse'),
                        context,
                    },
                    source: data,
                    reason: this.name,
                });
                if (use && use.card.name === 'sha') {
                    from.increaseMark('__sha_times', 1);
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data: TurnEvent) {
                    if (this.isOwner(data.player)) {
                        this.removeData(this.name);
                        room.players.forEach((v) => v.removeMark('rende_wars'));
                    }
                },
            },
        ],
    })
);

export const huibian = sgs.Skill({
    name: 'xl.lord_simayan.huibian',
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
                            thinkPrompt: this.name,
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

export const lianzi = sgs.Skill({
    name: 'xl.lord_simayan.lianzi',
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
                                text: `${sgs.cac_skill(
                                    this.name
                                )}，弃置一张手牌，亮出{0}张牌并获得其中与弃置牌类别相同的牌`,
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
                await room.addSkill('xl.lord_simayan.zhiheng', from, {
                    source: this.name,
                    showui: 'default',
                });
            }
        },
    })
);

export const zhiheng = sgs.Skill({
    name: 'xl.lord_simayan.zhiheng',
});

zhiheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
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
                            card: room.createDropCards(from, {
                                step: 1,
                                count: from.getMark('#yemingzhu_level')
                                    ? [1, -1]
                                    : [1, from.maxhp],
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `制衡，你可以弃置至多${from.maxhp}张牌，然后摸等量的牌`,
                            thinkPrompt: this.name,
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
            await room.drawCards({
                player: from,
                count: cards.length,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const wuxin = sgs.Skill({
    name: 'xl.lord_simayan.wuxin',
});

wuxin.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.DrawPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(
                room.getPlayerCountByKingdom(from.kingdom, false)
            );
            await room.puto({
                player: from,
                cards,
                toArea: room.processingArea,
                animation: false,
                puttype: CardPut.Down,
                cardVisibles: [from],
                source: data,
                reason: this.name,
            });
            return cards;
        },
        async effect(room, data, context) {
            const { from } = context;
            const cards = context.cost as GameCard[];
            const datas: WindowItemDatas = { type: 'items', datas: [] };
            datas.datas.push({ title: 'cards_top', items: [] });
            cards.forEach((v) => {
                datas.datas[0].items.push({
                    title: 'cards_top',
                    card: v.id,
                });
            });
            const req = await room.sortCards(
                from,
                cards,
                [
                    {
                        title: 'cards_top',
                        max: cards.length,
                    },
                ],
                {
                    canCancle: false,
                    showMainButtons: false,
                    prompt: this.name,
                    thinkPrompt: this.name,
                }
            );
            const result = req.result.sort_result;
            await room.moveCards({
                move_datas: [
                    {
                        cards: result[0].items,
                        toArea: room.drawArea,
                        reason: MoveCardReason.PutTo,
                        animation: false,
                        puttype: CardPut.Down,
                    },
                ],
                source: data,
                reason: this.name,
            });
            room.drawArea.remove(result[0].items);
            room.drawArea.add(result[0].items.reverse(), 'top');
        },
    })
);

export const yubao = sgs.Skill({
    name: 'xl.lord_simayan.yubao',
});

yubao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
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
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.name !== 'chibaoshanhu';
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `御宝，你可以移除一张不为【赤宝珊瑚】的牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.removeCard({
                player: from,
                cards,
                puttype: CardPut.Up,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            let chibaoshanhu: GameCard;
            const target = room.playerAlives.find((v) =>
                v.getEquipCards().find((c) => c.name === 'chibaoshanhu')
            );
            if (target) {
                chibaoshanhu = target
                    .getEquipCards()
                    .find((v) => v.name === 'chibaoshanhu');
            }
            if (!chibaoshanhu) {
                chibaoshanhu = room.discardArea.cards.find(
                    (v) => v.name === 'chibaoshanhu'
                );
            }
            if (!chibaoshanhu) {
                chibaoshanhu = room
                    .getReserveUpCards()
                    .find((v) => v.name === 'chibaoshanhu');
            }
            if (chibaoshanhu) {
                await room.obtainCards({
                    player: from,
                    cards: [chibaoshanhu],
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);
yubao.addEffect(sgs.copy(eyes_reserve));

export const bagong = sgs.Skill({
    name: 'xl.lord_simayan.bagongbizhengshu',
    global(room, to) {
        return room.sameAsKingdom(this.player, to);
    },
});

bagong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                !player.inturn &&
                data.has_lose(player, 'h') &&
                !player.hasHandCards()
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const count = Math.floor(
                        room.getReserveUpCards().length / 2
                    );
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: count,
                                selecte_type: 'win',
                                selectable: room.getReserveUpCards(),
                                windowOptions: {
                                    title: '八公弼政疏',
                                    timebar: room.responseTime,
                                    prompt: `八公弼政疏：请选择${count}张牌弃置`,
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: ``,
                            thinkPrompt: this.name,
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
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    room.setMark('#bagongbizhengshu', this.id);
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    room.removeMark('#bagongbizhengshu');
                },
            },
        ],
    })
);
bagong.addEffect(
    sgs.TriggerEffect({
        name: 'xl.lord_simayan.bagongbizhengshu.remove',
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
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
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.type !== CardType.Basic;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `八公弼政疏：你可以移除一张非基本牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.removeCard({
                player: from,
                cards,
                puttype: CardPut.Up,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
    })
);
bagong.addEffect(
    sgs.TriggerEffect({
        name: 'xl.lord_simayan.bagongbizhengshu.use',
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        can_trigger(room, player, data: NeedUseCardData) {
            if (room.sameAsKingdom(this.player, player)) {
                const phase = room.getCurrentPhase();
                if (!phase.isOwner(player, Phase.Play)) return false;
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    phase
                );
                return uses.length < 1;
            }
        },
        context(room, player, data: NeedUseCardData) {
            return {
                canuses: data.cards,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const canuses = context.canuses as {
                        name: string;
                        method?: number;
                    }[];
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: room.getReserveUpCards(),
                                filter(item, selected) {
                                    return (
                                        canuses.find(
                                            (v) => v.name === item.name
                                        ) &&
                                        from.canUseCard(
                                            room.createVirtualCardByOne(
                                                item,
                                                false
                                            )
                                        )
                                    );
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByOne(
                                                item,
                                                false
                                            );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `八公弼政疏：你可以从后备区明区中使用一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
    })
);
bagong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.Death,
        can_trigger(room, player, data: DieEvent) {
            return (
                this.isOwner(player) &&
                data.player.kingdom !== 'jin' &&
                room.getReserveUpCards().length > 8
            );
        },
        context(room, player, data) {
            return {
                targets: room.getPlayerByFilter((v) =>
                    room.sameAsKingdom(this.player, v)
                ),
            };
        },
        async cost(room, data, context) {
            const { targets } = context;
            for (const player of targets) {
                await room.drawCards({
                    player,
                    source: data,
                    reason: this.name,
                });
            }
            return true;
        },
    })
);

lord_simayan.addSkill(taishi);
lord_simayan.addSkill(bagong, true);
lord_simayan.addSkill(guitong);
lord_simayan.addSkill(huibian, true);
lord_simayan.addSkill(jizhao, true);
lord_simayan.addSkill(rende, true);
lord_simayan.addSkill(lianzi, true);
lord_simayan.addSkill(zhiheng, true);
lord_simayan.addSkill(wuxin, true);
lord_simayan.addSkill(yubao);

sgs.loadTranslation({
    ['@method:xl.lord_simayan.bagongbizhengshu.remove']: '移除牌',
    ['@method:xl.lord_simayan.bagongbizhengshu.use']: '使用后备区的牌',
});
