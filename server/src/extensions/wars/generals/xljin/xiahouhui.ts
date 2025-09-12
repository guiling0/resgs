import { GameCard } from '../../../../core/card/card';
import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DyingEvent } from '../../../../core/event/types/event.die';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { Gender } from '../../../../core/general/general.type';
import { MoveCardReason } from '../../../../core/room/room.types';
import { SkillTag } from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const xiahouhui = sgs.General({
    name: 'xl.xiahouhui',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const yuchou = sgs.Skill({
    name: 'xl.xiahouhui.yuchou',
});

yuchou.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player)) {
                return (
                    data.getCards(
                        (v) =>
                            v.reason === MoveCardReason.DisCard &&
                            player.isOnwerCardArea(v.fromArea)
                    ).length > 0
                );
            }
        },
        context(room, player, data: MoveCardEvent) {
            const count = data.getCards(
                (v) =>
                    v.reason === MoveCardReason.DisCard &&
                    player.isOnwerCardArea(v.fromArea)
            ).length;
            return {
                count,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const count = context.count;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
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
                            prompt: `豫筹：你可以选择一名其他角色令他摸${count}张牌获得交给他${count}张后备区里的`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    const count = context.count;
                    return {
                        selectors: {
                            card: room.createChooseCard(
                                {
                                    step: 1,
                                    count,
                                    selecte_type: 'rows',
                                    selectable: room.reserveArea.cards,
                                    data_rows: room.getReserveRowDatas(),
                                    windowOptions: {
                                        title: '后备区',
                                        timebar: room.responseTime,
                                        prompt: `豫筹：将${count}张牌交给${target.gameName}（点击取消令他摸牌）`,
                                        buttons: ['confirm'],
                                    },
                                },
                                false
                            ),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: ``,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const {
                from,
                targets: [to],
            } = context;
            const count = context.count ?? 0;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            if (cards.length) {
                return await room.giveCards({
                    from,
                    to,
                    cards,
                    source: data,
                    reason: this.name,
                });
            } else {
                return await room.drawCards({
                    player: to,
                    count,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);
yuchou.addEffect(sgs.copy(eyes_reserve));

export const lvbing = sgs.Skill({
    name: 'xl.xiahouhui.lvbing',
});

lvbing.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.EntryDying,
        can_trigger(room, player, data: DyingEvent) {
            if (this.isOwner(player) && data.player === player) {
                const damage = data.getDamage();
                if (damage && damage.from && damage.from.alive) {
                    const jianxi = room.skills.find(
                        (v) => v.name === 'xl.xiahouhui.jianxi'
                    );
                    return !jianxi;
                }
            }
        },
        context(room, player, data: DyingEvent) {
            return {
                targets: [data.getDamage().from],
            };
        },
        async cost(room, data, context) {
            const {
                targets: [target],
            } = context;
            await room.addSkill('xl.xiahouhui.jianxi', target, {
                showui: 'default',
                source: this.name,
            });
            return true;
        },
    })
);

export const jianxi = sgs.Skill({
    name: 'xl.xiahouhui.jianxi',
});

jianxi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        audio: [`xl/xl.xiahouhui/jianxi1`],
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player)) {
                return data.has_filter(
                    (v) =>
                        v.reason === MoveCardReason.DisCard &&
                        player.isOnwerCardArea(v.fromArea)
                );
            }
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `见隙：请选择一张牌移除`,
                        },
                    };
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
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
jianxi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        audio: [`xl/xl.xiahouhui/jianxi2`],
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (
                this.isOwner(player) &&
                data.has_obtain(player) &&
                !player.inturn
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 2;
            }
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
                            prompt: '见隙：请选择一项',
                            showMainButtons: false,
                        },
                    };
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const handles = ['jianxi.drop', 'jianxi.lose'];
            context.handles = handles;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('jianxi.drop')) {
                const cards: GameCard[] = [];
                data.getObtainDatas(from).forEach((v) =>
                    cards.push(...v.cards)
                );
                return await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
            if (result.includes('jianxi.lose')) {
                return await room.losehp({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);
jianxi.addEffect(sgs.copy(eyes_reserve));

xiahouhui.addSkill(yuchou);
xiahouhui.addSkill(lvbing);
xiahouhui.addSkill(jianxi, true);

sgs.loadTranslation({
    ['jianxi.drop']: '弃置获得的牌',
    ['jianxi.lose']: '失去1点体力',
});
