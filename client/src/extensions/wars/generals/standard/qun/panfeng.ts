import { GameCard } from '../../../../../core/card/card';
import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { Gender } from '../../../../../core/general/general.type';

export const panfeng = sgs.General({
    name: 'wars.panfeng',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const kuangfu = sgs.Skill({
    name: 'wars.panfeng.kuangfu',
});

kuangfu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.CauseDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.reason === 'sha' &&
                data.to.getEquipCards().length > 0
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    const skill = this;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getEquipCards(),
                                data_rows: target.getCardsToArea('e'),
                                windowOptions: {
                                    title: '狂斧',
                                    timebar: room.responseTime,
                                    prompt: '狂斧：请选择一张牌并选择一项执行',
                                    buttons: ['kuangfu.putto', 'kuangfu.drop'],
                                },
                                filter_buttons(item, selected) {
                                    const card = selected.at(0);
                                    if (!card) return false;
                                    if (item === 'kuangfu.putto') {
                                        return !from.getEquip(
                                            card.subtype as number
                                        );
                                    }
                                    if (item === 'kuangfu.drop') {
                                        return from.canDropCard(
                                            card,
                                            skill.name
                                        );
                                    }
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
        async cost(room, data, context) {
            const { from, targets } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'card');
            const card = result.result.at(0) as GameCard;
            const option = result.windowResult.at(0) as string;
            if (option === 'kuangfu.putto') {
                await room.puto({
                    player: from,
                    cards: [card],
                    toArea: from.equipArea,
                    source: data,
                    reason: this.name,
                });
            }
            if (option === 'kuangfu.drop') {
                await room.dropCards({
                    player: from,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

panfeng.addSkill(kuangfu);

sgs.loadTranslation({
    ['kuangfu.putto']: '置入自己装备区',
    ['kuangfu.drop']: '弃置装备',
    ['kuangfu.obtain']: '获得',
    ['kuangfu.dropcard']: '弃置',
});

export const panfeng_v2025 = sgs.General({
    name: 'wars.v2025.panfeng',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const kuangfu_v2025 = sgs.Skill({
    name: 'wars.v2025.panfeng.kuangfu',
});

kuangfu_v2025.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.CauseDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.reason === 'sha' &&
                data.to.hasCardsInArea()
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    const skill = this;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '狂斧',
                                    timebar: room.responseTime,
                                    prompt: '狂斧：请选择一张牌并选择一项执行',
                                    buttons: [
                                        'kuangfu.obtain',
                                        'kuangfu.dropcard',
                                    ],
                                },
                                filter_buttons(item, selected) {
                                    const card = selected.at(0);
                                    if (!card) return false;
                                    if (item === 'kuangfu.obtain') {
                                        return true;
                                    }
                                    if (item === 'kuangfu.dropcard') {
                                        return from.canDropCard(
                                            card,
                                            skill.name
                                        );
                                    }
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
        async cost(room, data, context) {
            const { from, targets } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'card');
            const card = result.result.at(0) as GameCard;
            const option = result.windowResult.at(0) as string;
            if (option === 'kuangfu.obtain') {
                await room.obtainCards({
                    player: from,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
            }
            if (option === 'kuangfu.dropcard') {
                await room.dropCards({
                    player: from,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

panfeng_v2025.addSkill(kuangfu_v2025);
