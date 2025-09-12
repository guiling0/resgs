import { GameCard } from '../../../../core/card/card';
import {
    CardColor,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DieEvent } from '../../../../core/event/types/event.die';
import { OpenEvent } from '../../../../core/event/types/event.state';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { General } from '../../../../core/general/general';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';
import { MoveCardReason } from '../../../../core/room/room.types';
import { StateEffectType } from '../../../../core/skill/skill.types';

export const luyusheng = sgs.General({
    name: 'wars.luyusheng',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const zhente = sgs.Skill({
    name: 'wars.luyusheng.zhente',
});

zhente.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.from &&
                data.from !== player &&
                data.current.target === player &&
                data.card &&
                data.card.color === CardColor.Black &&
                (data.card.type === CardType.Basic ||
                    data.card.subtype === CardSubType.InstantScroll)
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 1;
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.from],
            };
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
                            canCancle: false,
                            prompt: `贞特：请选择一项`,
                            showMainButtons: false,
                        },
                    };
                },
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            const handles = [
                {
                    text: 'zhente.use',
                    values: [],
                },
                {
                    text: 'zhente.cancle',
                    values: [{ type: 'player', value: from.playerId }],
                },
            ];
            context.handles = handles;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('zhente.use')) {
                const effect1 = await room.addEffect('zhente.delay', target);
                effect1.setData('data', room.currentTurn);
            }
            if (result.includes('zhente.cancle')) {
                await data.invalidCurrent();
            }
        },
    })
);

export const zhente_delay = sgs.StateEffect({
    name: 'zhente.delay',
    mark: ['mark.zhente'],
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        return this.isOwner(from) && card && card.color === CardColor.Black;
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const zhiwei = sgs.Skill({
    name: 'wars.luyusheng.zhiwei',
});

zhiwei.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.Opened,
        can_trigger(room, player, data: OpenEvent) {
            return (
                this.isOwner(player) &&
                data.generals.includes(this.skill?.sourceGeneral)
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `至微：你可以选择一名其他角色`,
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
            const effect = await room.addEffect('zhiwei.delay', from);
            effect.setData('target', target);
            effect.setData('general', this.skill.sourceGeneral);
            target.setMark('zhiwei.delay', true, {
                visible: true,
                source: this.name,
            });
            return true;
        },
    })
);

export const zhiwei_delay = sgs.TriggerEffect({
    name: 'zhiwei.delay',
    audio: ['luyusheng/zhiwei1', 'luyusheng/zhiwei2'],
    auto_log: 1,
    trigger: [
        EventTriggers.InflictDamaged,
        EventTriggers.CauseDamaged,
        EventTriggers.DropPhaseEnd,
        EventTriggers.Death,
    ],
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            if (
                data.trigger === EventTriggers.CauseDamaged &&
                data.is(sgs.DataType.DamageEvent)
            ) {
                const target = this.getData<GamePlayer>('target');
                return target && target === data.from;
            }
            if (
                data.trigger === EventTriggers.InflictDamaged &&
                data.is(sgs.DataType.DamageEvent)
            ) {
                const target = this.getData<GamePlayer>('target');
                return target && target === data.to;
            }
            if (
                data.trigger === EventTriggers.DropPhaseEnd &&
                data.is(sgs.DataType.PhaseEvent)
            ) {
                const target = this.getData<GamePlayer>('target');
                if (target && data.isOwner(player)) {
                    const drops = room.getHistorys(
                        sgs.DataType.MoveCardEvent,
                        (v) =>
                            v.filter(
                                (d, c) =>
                                    d.toArea === room.discardArea &&
                                    c.area === room.discardArea &&
                                    d.reason === MoveCardReason.DisCard
                            ).length > 0,
                        data
                    );
                    return drops.length > 0;
                }
            }
            if (
                data.trigger === EventTriggers.Death &&
                data.is(sgs.DataType.DieEvent)
            ) {
                const target = this.getData<GamePlayer>('target');
                return (
                    target && target === data.player && !player.hasNoneOpen()
                );
            }
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        if (
            data.trigger === EventTriggers.CauseDamaged &&
            data.is(sgs.DataType.DamageEvent)
        ) {
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        }
        if (
            data.trigger === EventTriggers.InflictDamaged &&
            data.is(sgs.DataType.DamageEvent)
        ) {
            const cards = from.handArea.get(1, sgs.DataType.GameCard, 'random');
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
        if (
            data.trigger === EventTriggers.DropPhaseEnd &&
            data.is(sgs.DataType.PhaseEvent)
        ) {
            let cards: GameCard[] = [];
            room.getPeriodHistory(data).forEach((v) => {
                if (v.data.is(sgs.DataType.MoveCardEvent)) {
                    v.data.move_datas.forEach((d) => {
                        if (
                            d.toArea === room.discardArea &&
                            d.reason === MoveCardReason.DisCard
                        ) {
                            d.cards.forEach((c) => {
                                if (c.area === room.discardArea) {
                                    cards.push(c);
                                }
                            });
                        }
                    });
                }
            });
            const target = this.getData<GamePlayer>('target');
            return await room.obtainCards({
                player: target,
                cards,
                source: data,
                reason: this.name,
            });
        }
        if (
            data.trigger === EventTriggers.Death &&
            data.is(sgs.DataType.DieEvent)
        ) {
            const general = this.getData<General>('general');
            return await room.close({
                player: from,
                generals: [general],
                source: data,
                reason: this.name,
            });
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.StateChange,
            async on_exec(room, data) {
                if (data.is(sgs.DataType.CloseEvent)) {
                    const general = this.getData<General>('general');
                    if (data.generals.includes(general)) {
                        await this.removeSelf();
                    }
                }
                if (data.is(sgs.DataType.RemoveEvent)) {
                    const general = this.getData<General>('general');
                    if (data.general === general) {
                        await this.removeSelf();
                    }
                }
            },
        },
        {
            trigger: EventTriggers.DieEnd,
            async on_exec(room, data: DieEvent) {
                if (data.player === this.player) {
                    await this.removeSelf();
                }
            },
        },
        {
            trigger: EventTriggers.onLose,
            async on_exec(room, data) {
                const target = this.getData<GamePlayer>('target');
                target?.removeMark(this.name);
            },
        },
    ],
});

luyusheng.addSkill(zhente);
luyusheng.addSkill(zhiwei);

sgs.loadTranslation({
    ['zhente.use']: '此回合不能在使用黑色牌',
    ['zhente.cancle']: '此牌对{0}无效',
    ['mark.zhente']: '贞特',
    [zhiwei_delay.name]: '至微',
});
