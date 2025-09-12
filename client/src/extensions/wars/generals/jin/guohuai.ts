import { CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PlayCardEvent } from '../../../../core/event/types/event.play';
import { UseCardEvent, UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';

export const guohuai_jin = sgs.General({
    name: 'wars.guohuai_jin',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const zhefu = sgs.Skill({
    name: 'wars.guohuai_jin.zhefu',
});

zhefu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.UseCardEnd3,
        can_trigger(room, player, data: UseEvent) {
            return (
                this.isOwner(player) &&
                player === data.from &&
                !player.inturn &&
                data.card &&
                data.card.type === CardType.Basic
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const selfCount = room.getPlayerCountByKingdom(
                        from.kingdom
                    );
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    const count = room.getPlayerCountByKingdom(
                                        item.kingdom
                                    );
                                    return (
                                        item !== from &&
                                        count >= selfCount &&
                                        item.hasHandCards()
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `哲妇：你可以观看一名势力人数大于等于你的一名角色的手牌`,
                            thinkPrompt: '哲妇',
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getHandCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '哲妇',
                                    timebar: room.responseTime,
                                    prompt: '哲妇：你可以弃置一张基本牌',
                                },
                                filter(item, selected) {
                                    return item.type === CardType.Basic;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            thinkPrompt: '哲妇',
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            sgs.DataType.WatchHandData.temp(from, target.getHandCards());
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            sgs.DataType.WatchHandData.temp_end(from, target.getHandCards());
            const cards = room.getResultCards(req);
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);
zhefu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayCardEnd,
        can_trigger(room, player, data: PlayCardEvent) {
            return (
                this.isOwner(player) &&
                player === data.from &&
                !player.inturn &&
                data.card &&
                data.card.type === CardType.Basic
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const selfCount = room.getPlayerCountByKingdom(
                        from.kingdom
                    );
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    const count = room.getPlayerCountByKingdom(
                                        item.kingdom
                                    );
                                    return (
                                        item !== from &&
                                        count >= selfCount &&
                                        item.hasHandCards()
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `哲妇：你可以观看一名势力人数大于等于你的一名角色的手牌`,
                            thinkPrompt: '哲妇',
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getHandCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '哲妇',
                                    timebar: room.responseTime,
                                    prompt: '哲妇：你可以弃置一张基本牌',
                                },
                                filter(item, selected) {
                                    return item.type === CardType.Basic;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            thinkPrompt: '哲妇',
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            sgs.DataType.WatchHandData.temp(from, target.getHandCards());
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            sgs.DataType.WatchHandData.temp_end(from, target.getHandCards());
            const cards = room.getResultCards(req);
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const weidu = sgs.Skill({
    name: 'wars.guohuai_jin.weidu',
});

weidu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.UseCardEnd3,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.from === player &&
                player.inturn &&
                data.card &&
                data.card.isDamageCard()
            ) {
                const damages = room
                    .getHistorys(
                        sgs.DataType.DamageEvent,
                        (v) => v.source === data,
                        data
                    )
                    .map((v) => v.to)
                    .filter((v) => v);
                this.setData('check', damages);
                return damages.length < data.targets.length;
            }
        },
        context(room, player, data: UseCardEvent) {
            const players = this.getData<GamePlayer[]>('check');
            return {
                targets: data.targets.filter((v) => !players.includes(v)),
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const targets = context.targets;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                selectable: targets,
                                filter(item, selected) {
                                    return item.hasHandCards();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `遗毒：你可以展示一名角色至多两张牌`,
                            thinkPrompt: `遗毒`,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, 2],
                                selecte_type: 'rows',
                                selectable: target.getHandCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '遗毒',
                                    timebar: room.responseTime,
                                    prompt: '遗毒：请选择1到2张牌展示',
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            thinkPrompt: `遗毒`,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.showCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            if (cards.length) {
                const card = cards.at(0);
                if (cards.every((v) => v.color === card.color)) {
                    await room.dropCards({
                        player: from,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

guohuai_jin.addSkill(zhefu);
guohuai_jin.addSkill(weidu);
