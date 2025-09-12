import { GameCard } from '../../../../../core/card/card';
import {
    CardAttr,
    CardColor,
    CardPut,
    CardType,
} from '../../../../../core/card/card.types';
import { VirtualCard } from '../../../../../core/card/vcard';
import { EventTriggers } from '../../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../../core/event/types/event.move';
import {
    NeedUseCardData,
    UseCardEvent,
} from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { PriorityType, SkillTag } from '../../../../../core/skill/skill.types';

export const luxun = sgs.General({
    name: 'wars.luxun',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const qianxun = sgs.Skill({
    name: 'wars.luxun.qianxun',
});

qianxun.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.BecomeTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card.name === 'shunshouqianyang' &&
                data.current.target === player
            );
        },
        async cost(room, data: UseCardEvent, context) {
            return await data.cancleCurrent();
        },
    })
);

qianxun.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.filter(
                    (d, c) =>
                        d.toArea === player.judgeArea &&
                        c.vcard?.name === 'lebusishu'
                ).length > 0
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            data.update(
                data.getCards(
                    (d, c) =>
                        d.toArea === from.judgeArea &&
                        c.vcard?.name === 'lebusishu'
                ),
                {
                    toArea: room.discardArea,
                }
            );
            return true;
        },
    })
);

export const duoshi = sgs.Skill({
    name: 'wars.luxun.duoshi',
});

duoshi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const yiyidailao = room.createVirtualCardByNone(
                        'yiyidailao',
                        undefined,
                        false
                    );
                    yiyidailao.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.color === CardColor.Red;
                                },
                                onChange(type, item) {
                                    if (type === 'add')
                                        yiyidailao.addSubCard(item);
                                    if (type === 'remove')
                                        yiyidailao.delSubCard(item);
                                    yiyidailao.set();
                                    this._use_or_play_vcard = yiyidailao;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '度势，你可以将一张红色手牌当【以逸待劳】使用',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('yiyidailao')
            ) {
                const phase = room.getCurrentPhase();
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    phase
                );
                return phase.isOwner(player, Phase.Play) && uses.length < 4;
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

luxun.addSkill(qianxun);
luxun.addSkill(duoshi);

export const luxun_v2025 = sgs.General({
    name: 'wars.v2025.luxun',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const qianxun_v2025 = sgs.Skill({
    name: 'wars.v2025.luxun.qianxun',
});

qianxun_v2025.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.BecomeTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from !== player &&
                data.card &&
                data.card.hasSubCards() &&
                data.card.type === CardType.Scroll &&
                data.targetCount === 1 &&
                data.current.target === player &&
                player.getUpOrSideCards('$mark.jie').length < 3
            );
        },
        async cost(room, data: UseCardEvent, context) {
            const { from } = context;
            const cards = data.card.subcards.slice();
            await room.puto({
                player: from,
                cards,
                toArea: from.upArea,
                source: data,
                movetype: CardPut.Up,
                reason: this.name,
            });
            cards.forEach((v) => v.setMark('$mark.jie', true));
            from.setMark('$mark.jie', true, {
                visible: true,
                source: this.name,
                type: 'cards',
                areaId: from.upArea.areaId,
            });
            return true;
        },
        async effect(room, data: UseCardEvent, context) {
            await data.cancleCurrent();
        },
    })
);

export const duoshi_v2025 = sgs.Skill({
    name: 'wars.v2025.luxun.duoshi',
});

duoshi_v2025.addEffect(
    sgs.TriggerEffect({
        name: `${duoshi_v2025.name}0`,
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const yiyidailao = room.createVirtualCardByNone(
                        'yiyidailao',
                        undefined,
                        false
                    );
                    yiyidailao.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.color === CardColor.Red;
                                },
                                onChange(type, item) {
                                    if (type === 'add')
                                        yiyidailao.addSubCard(item);
                                    if (type === 'remove')
                                        yiyidailao.delSubCard(item);
                                    yiyidailao.set();
                                    this._use_or_play_vcard = yiyidailao;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '度势，你可以将一张红色手牌当【以逸待劳】使用',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('yiyidailao') &&
                !player.getData(this.name)
            ) {
                const phase = room.getCurrentPhase();
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    phase
                );
                return phase.isOwner(player, Phase.Play) && uses.length < 1;
            }
        },
        async cost(room, data, context) {
            this.player?.setData(this.name, true);
            return true;
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data) {
                    await this.player?.removeData(this.name);
                },
            },
        ],
    })
);
duoshi_v2025.addEffect(
    sgs.TriggerEffect({
        name: `${duoshi_v2025.name}1`,
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard2,
        can_trigger(room, player, data: NeedUseCardData) {
            if (
                this.isOwner(player) &&
                player.hasHandCards() &&
                !player.getData(this.name)
            ) {
                const canuses = ['huogong', 'sha', 'huoshaolianying'].filter(
                    (v) => room.cardNames.includes(v) && data.has(v, 0)
                );
                if (canuses.length === 0) return false;
                const phase = room.getCurrentPhase();
                let count = 0;
                room.playerAlives.forEach((v) => {
                    count += v.getUpOrSideCards('$mark.jie').length;
                });
                return phase.isOwner(player, Phase.Play) && count >= 3;
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
                    let vcards: VirtualCard[] = [];
                    ['huogong', 'sha', 'huoshaolianying'].forEach((v) => {
                        if (
                            room.cardNames.includes(v) &&
                            canuses.find((c) => c.name === v)
                        ) {
                            vcards.push(
                                room.createVirtualCard(
                                    v,
                                    [],
                                    undefined,
                                    true,
                                    false
                                )
                            );
                        }
                    });
                    vcards.forEach((v) => {
                        v.custom.method = 1;
                        if (v.name === 'sha') {
                            v.set({ attr: [CardAttr.Fire] });
                        }
                        v.custom.canuse = from.canUseCard(
                            v,
                            undefined,
                            this.name,
                            { excluesToCard: true }
                        );
                    });
                    const cards: GameCard[] = [];
                    room.playerAlives.forEach((v) => {
                        cards.push(...v.getUpOrSideCards('$mark.jie'));
                    });
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 2,
                                count: 3,
                                selectable: cards,
                            }),
                            vcard: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: vcards.map((v) => v.vdata),
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
                            prompt: `度势，你可以将3张“节”置入弃牌堆，视为使用一张火焰伤害牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
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
            this.player?.setData(this.name, true);
            from.refreshMark = '$mark.jie';
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data) {
                    await this.player?.removeData(this.name);
                },
            },
        ],
    })
);

luxun_v2025.addSkill(qianxun_v2025);
luxun_v2025.addSkill(duoshi_v2025);

sgs.loadTranslation({
    ['$mark.jie']: '节',
    [`@method:${duoshi_v2025.name}0`]: '使用【以逸待劳】',
    [`@method:${duoshi_v2025.name}1`]: '使用火焰伤害牌',
});
