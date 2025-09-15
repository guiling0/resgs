import { CardAttr, CardSuit } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import {
    NeedUseCardData,
    UseCardEvent,
} from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';

export const cs_gaowang = sgs.General({
    name: 'cs_gaowang',
    kingdom: 'qun',
    hp: 1,
    gender: Gender.Male,
    enable: false,
    hidden: true,
});

export const miaoyu = sgs.Skill({
    name: 'cs_gaowang.miaoyu',
});

miaoyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const use_tao = context.canuses.find(
                        (v) => v.name === 'tao'
                    );
                    const tao = room.createVirtualCardByNone(
                        'tao',
                        undefined,
                        false
                    );
                    tao.custom.method = use_tao.method ?? 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, 2],
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.suit === CardSuit.Heart;
                                },
                                onChange(type, item) {
                                    if (type === 'add') tao.addSubCard(item);
                                    if (type === 'remove') tao.delSubCard(item);
                                    tao.set();
                                    this._use_or_play_vcard = tao;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '妙语：你可以将一至两张红桃牌当【桃】使用',
                        },
                    };
                },
            };
        },
        context(room, player, data: NeedUseCardData) {
            return {
                canuses: data.cards,
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('tao');
            }
        },
        async cost(room, data: UseCardEvent, context) {
            if (data.card && data.card.subcards.length > 1) {
                data.baseRecover += 1;
            }
            return true;
        },
    })
);

miaoyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const shan = room.createVirtualCardByNone(
                        'shan',
                        undefined,
                        false
                    );
                    shan.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, 2],
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.suit === CardSuit.Club;
                                },
                                onChange(type, item) {
                                    if (type === 'add') shan.addSubCard(item);
                                    if (type === 'remove')
                                        shan.delSubCard(item);
                                    shan.set();
                                    this._use_or_play_vcard = shan;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '妙语：你可以将一至两张梅花牌当【闪】使用',
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '妙语',
                                    timebar: room.responseTime,
                                    prompt: '妙语：请选择一张牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('shan');
            }
        },
        async cost(room, data: UseCardEvent, context) {
            return true;
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            if (
                data.card &&
                data.card.subcards.length > 1 &&
                room.currentTurn &&
                room.currentTurn.player
            ) {
                context.targets = [room.currentTurn.player];
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

miaoyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const wuxie = room.createVirtualCardByNone(
                        'wuxiekeji',
                        undefined,
                        false
                    );
                    wuxie.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, 2],
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.suit === CardSuit.Spade;
                                },
                                onChange(type, item) {
                                    if (type === 'add') wuxie.addSubCard(item);
                                    if (type === 'remove')
                                        wuxie.delSubCard(item);
                                    wuxie.set({ attr: [] });
                                    this._use_or_play_vcard = wuxie;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '妙语：你可以将一至两张黑桃牌当【无懈可击】使用',
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '妙语',
                                    timebar: room.responseTime,
                                    prompt: '妙语：请选择一张牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('wuxiekeji');
            }
        },
        async cost(room, data: UseCardEvent, context) {
            return true;
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            if (
                data.card &&
                data.card.subcards.length > 1 &&
                room.currentTurn &&
                room.currentTurn.player
            ) {
                context.targets = [room.currentTurn.player];
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

miaoyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const sha = room.createVirtualCardByNone(
                        'sha',
                        undefined,
                        false
                    );
                    sha.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, 2],
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.suit === CardSuit.Diamond;
                                },
                                onChange(type, item) {
                                    if (type === 'add') sha.addSubCard(item);
                                    if (type === 'remove') sha.delSubCard(item);
                                    sha.set({ attr: [CardAttr.Fire] });
                                    this._use_or_play_vcard = sha;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '妙语：你可以将一至两张方片牌当火【杀】使用',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('sha');
            }
        },
        async cost(room, data: UseCardEvent, context) {
            if (data.card && data.card.subcards.length > 1) {
                data.baseDamage += 1;
            }
            return true;
        },
    })
);

cs_gaowang.addSkill(miaoyu);
