import { GameCard } from '../../../core/card/card';
import { CardPut, CardSuit, CardType } from '../../../core/card/card.types';
import { CustomString } from '../../../core/custom/custom.type';
import { EventTriggers } from '../../../core/event/triggers';
import { DamageEvent } from '../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../core/event/types/event.move';
import { PhaseEvent, TurnEvent } from '../../../core/event/types/event.turn';
import { NeedUseCardData } from '../../../core/event/types/event.use';
import { Gender } from '../../../core/general/general.type';
import { GamePlayer } from '../../../core/player/player';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../core/skill/skill.types';

export const caomao = sgs.General({
    name: 'caomao',
    kingdom: 'wei',
    hp: 3,
    gender: Gender.Male,
});

async function obtainSkill(player: GamePlayer) {
    const daoxin = player.getMark<number>('mark.daoxin', 0);
    if (
        daoxin >= 25 &&
        !player.room.skills.find(
            (v) => v.name === 'caomao.qingzheng' && v.player === player
        )
    ) {
        await player.room.addSkill('caomao.qingzheng', player, {
            source: 'qianlong',
            showui: 'default',
        });
    }
    if (
        daoxin >= 50 &&
        !player.room.skills.find(
            (v) => v.name === 'caomao.jiushi' && v.player === player
        )
    ) {
        await player.room.addSkill('caomao.jiushi', player, {
            source: 'qianlong',
            showui: 'default',
        });
    }
    if (
        daoxin >= 75 &&
        !player.room.skills.find(
            (v) => v.name === 'caomao.fangzhu' && v.player === player
        )
    ) {
        await player.room.addSkill('caomao.fangzhu', player, {
            source: 'qianlong',
            showui: 'default',
        });
    }
    if (
        daoxin >= 99 &&
        !player.room.skills.find(
            (v) => v.name === 'caomao.juejin' && v.player === player
        )
    ) {
        await player.room.addSkill('caomao.juejin', player, {
            source: 'qianlong',
            showui: 'default',
        });
    }
}

export const qianlong = sgs.Skill({
    name: 'caomao.qianlong',
});

qianlong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        audio: [],
        auto_log: 1,
        trigger: EventTriggers.GameStarted,
        can_trigger(room, player, data) {
            return this.isOwner(player);
        },
        async cost(room, data, context) {
            const { from } = context;
            from.setMark('mark.daoxin', 20, {
                visible: true,
                source: this.name,
            });
            return true;
        },
    })
);

qianlong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        audio: [`caomao/qianlong3`, `caomao/qianlong4`],
        auto_log: 1,
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return this.isOwner(player) && data.to === player;
        },
        async cost(room, data, context) {
            const { from } = context;
            const daoxin = from.getMark<number>('mark.daoxin', 0);
            from.setMark('mark.daoxin', Math.min(daoxin + 10, 99), {
                visible: true,
                source: this.name,
            });
            obtainSkill(from);
            return true;
        },
    })
);

qianlong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        audio: [`caomao/qianlong1`, `caomao/qianlong2`],
        auto_log: 1,
        trigger: EventTriggers.CauseDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return this.isOwner(player) && data.from === player;
        },
        async cost(room, data, context) {
            const { from } = context;
            const daoxin = from.getMark<number>('mark.daoxin', 0);
            from.setMark('mark.daoxin', Math.min(daoxin + 15, 99), {
                visible: true,
                source: this.name,
            });
            obtainSkill(from);
            return true;
        },
    })
);

qianlong.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        audio: [`caomao/qianlong5`, `caomao/qianlong6`],
        auto_log: 1,
        trigger: EventTriggers.MoveCardAfter1,
        can_trigger(room, player, data: MoveCardEvent) {
            return this.isOwner(player) && data.has_obtain(player);
        },
        async cost(room, data, context) {
            const { from } = context;
            const daoxin = from.getMark<number>('mark.daoxin', 0);
            from.setMark('mark.daoxin', Math.min(daoxin + 5, 99), {
                visible: true,
                source: this.name,
            });
            obtainSkill(from);
            return true;
        },
    })
);

export const qingzheng = sgs.Skill({
    name: 'caomao.qingzheng',
});

qingzheng.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        audio: [`caomao/qingzheng1`, `caomao/qingzheng2`],
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const hands = from.getHandCards();
                    const options = [
                        CardSuit.Spade,
                        CardSuit.Heart,
                        CardSuit.Club,
                        CardSuit.Diamond,
                    ].map((v) => {
                        if (
                            hands.filter(
                                (card) =>
                                    card.suit === v &&
                                    from.canDropCard(card, this.name)
                            ).length > 0
                        ) {
                            return `suit${v}`;
                        } else {
                            return `!suit${v}`;
                        }
                    });
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: options,
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from && item.hasHandCards();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: '清正：你可以弃置一种花色的所有手牌并选择一名其他有手牌的角色',
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const self = this;
                    const from = context.from;
                    const target = context.targets.at(0);
                    const cards: { title: CustomString; cards: GameCard[] }[] =
                        [];
                    target.getHandCards().forEach((card) => {
                        const data = cards.find(
                            (v) => v.title === `suit${card.suit}`
                        );
                        if (data) {
                            data.cards.push(card);
                        } else {
                            cards.push({
                                title: `suit${card.suit}`,
                                cards: [card],
                            });
                        }
                    });
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 0,
                                selecte_type: 'rows',
                                selectable: target.getHandCards(),
                                data_rows: cards,
                                windowOptions: {
                                    title: '清正',
                                    timebar: room.responseTime,
                                    prompt: '清正：请选择一种花色弃置所有该花色的牌',
                                    buttons: [
                                        'suit1',
                                        'suit2',
                                        'suit3',
                                        'suit4',
                                    ],
                                },
                                filter_buttons(item, selected) {
                                    const c =
                                        cards.find((v) => v.title === item)
                                            ?.cards ?? [];
                                    return (
                                        c.length &&
                                        !!c.find((v) =>
                                            from.canDropCard(v, self.name)
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: '清正',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            const result = context.req_result.results.option.result.at(
                -1
            ) as string;
            if (result) {
                const suit = Number(result.at(-1));
                const cards = from
                    .getHandCards()
                    .filter((v) => v.suit === suit)
                    .filter((v) => from.canDropCard(v, this.name));
                if (cards.length > 0) {
                    return await room.dropCards({
                        player: from,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (target.hasHandCards()) {
                sgs.DataType.WatchHandData.temp(from, target.getHandCards());
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                sgs.DataType.WatchHandData.temp_end(
                    from,
                    target.getHandCards()
                );
                const result = room.getResult(req, 'cards').windowResult.at(0);
                if (result) {
                    const suit = Number(result.at(-1));
                    const cards = target
                        .getHandCards()
                        .filter((v) => v.suit === suit)
                        .filter((v) => from.canDropCard(v, this.name));
                    const drop2 = await room.dropCards({
                        player: from,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                    const drop = context.cost as MoveCardEvent;
                    if (drop.getMoveCount() > drop2.getMoveCount()) {
                        await room.damage({
                            from,
                            to: target,
                            source: data,
                            reason: this.name,
                        });
                    }
                }
            }
        },
    })
);

export const jiushi = sgs.Skill({
    name: 'caomao.jiushi',
    audio: [`caomao/jiushi1`, `caomao/jiushi2`],
});

jiushi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const use_jiu = context.canuses.find(
                        (v) => v.name === 'jiu'
                    );
                    const jiu = room.createVirtualCardByNone(
                        'jiu',
                        undefined,
                        false
                    );
                    jiu.custom.method = use_jiu?.method ?? 1;
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: [jiu.vdata],
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
                            prompt: '酒诗：你可以翻面并视为使用一张【酒】',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: NeedUseCardData) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                !data.from.skip &&
                data.has('jiu')
            );
        },
        context(room, player, data: NeedUseCardData) {
            return {
                canuses: data.cards,
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.skip({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

jiushi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            if (this.isOwner(player) && data.to === player && player.skip) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill.skill === this.skill,
                    data
                );
                return uses.length < 1;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.skip({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

jiushi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.StateChanged,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.SkipEvent) &&
                data.player === player
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const card = room.drawArea.get(
                1,
                sgs.DataType.GameCard,
                'top',
                (card) => card.type === CardType.Scroll
            );
            if (card.length) {
                return await room.obtainCards({
                    player: from,
                    cards: card,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const fangzhu = sgs.Skill({
    name: 'caomao.fangzhu',
});

fangzhu.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal],
        auto_log: 1,
        auto_directline: 1,
        audio: ['caomao/fangzhu1', 'caomao/fangzhu2'],
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from && item !== target;
                                },
                            }),
                            options: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: ['fangzhu.use', 'fangzhu.skill'],
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: `放逐，你可以选择一名角色令其执行一项`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        context(room, player, data) {
            return {
                targets: room.playerAlives.filter((v) =>
                    v.hasMark('mark.fangzhu')
                ),
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const result = context.req_result.results.options
                .result as string[];
            target.setMark('mark.fangzhu', 1);
            if (result.includes('fangzhu.use')) {
                await room.addEffect('fangzhu.use.delay', target);
            }
            if (result.includes('fangzhu.skill')) {
                await room.addEffect('fangzhu.skill.delay', target);
            }
            return true;
        },
        lifecycle: [
            {
                trigger: EventTriggers.PlayPhaseEnd,
                async on_exec(room, data) {
                    room.playerAlives.forEach((v) => {
                        if (v.hasMark('mark.fangzhu')) {
                            v.increaseMark('mark.fangzhu', 1);
                            if (v.getMark<number>('mark.fangzhu', 1) > 2) {
                                v.removeMark('mark.fangzhu');
                            }
                        }
                    });
                },
            },
        ],
    })
);

export const fangzhu_use_delay = sgs.StateEffect({
    name: 'fangzhu.use.delay',
    mark: ['fangzhu.use'],
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        if (this.isOwner(this.player)) {
            return (
                card.subcards &&
                card.subcards.some((v) => v.type !== CardType.Scroll)
            );
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data: TurnEvent) {
                if (data.player === this.player) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const fangzhu_skill_delay = sgs.StateEffect({
    name: 'fangzhu.skill.delay',
    mark: ['fangzhu.skill'],
    [StateEffectType.Skill_Invalidity](effect) {
        return effect && effect.skill && effect.player === this.player;
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data: TurnEvent) {
                if (data.player === this.player) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const juejin = sgs.Skill({
    name: 'caomao.juejin',
});

juejin.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Eternal, SkillTag.Limit],
        exclues_limitAni: true,
        auto_log: 1,
        audio: ['caomao/juejin1', 'caomao/juejin2'],
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `是否发动技能：决进`,
                    });
                },
            };
        },
        async cost(room, data, context) {
            room.broadcast({
                type: 'MsgPlayGlobalAni',
                ani: 'caomao_skill',
                audio: 'generals/caomao/juejin_effect.mp3',
            });
            room.broadcast({
                type: 'MsgChangeBgmAndBg',
                bgm_url: 'generals/caomao/caomao_bgm.mp3',
            });
            await room.delay(6);
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            for (const player of room.playerAlives) {
                if (player.hp !== 1) {
                    const shield =
                        (1 - player.hp) * -1 + (player === from ? 2 : 0);
                    player.changeHp(1);
                    if (shield > 0) {
                        player.setProperty('shield', shield);
                    }
                }
            }
            const cards = room.cards.filter(
                (v) => v.name === 'shan' || v.name === 'tao' || v.name === 'jiu'
            );
            cards.forEach((v) => {
                v.removeAllMark();
            });
            await room.puto({
                player: from,
                cards,
                toArea: room.granaryArea,
                movetype: CardPut.Up,
                puttype: CardPut.Up,
                source: data,
                reason: this.name,
            });
        },
    })
);

caomao.addSkill(qianlong);
caomao.addSkill(qingzheng, true);
caomao.addSkill(jiushi, true);
caomao.addSkill(fangzhu, true);
caomao.addSkill(juejin, true);

sgs.loadTranslation({
    ['mark.daoxin']: '道心',
    ['fangzhu.use']: '只能使用锦囊牌',
    ['fangzhu.skill']: '技能失效',
});
