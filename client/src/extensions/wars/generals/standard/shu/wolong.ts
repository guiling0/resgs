import { CardColor, EquipSubType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { Gender } from '../../../../../core/general/general.type';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const wolong = sgs.General({
    name: 'wars.wolong',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Male,isWars: true,
});

export const bazhen = sgs.Skill({
    name: 'wars.wolong.bazhen',
    condition(room) {
        return !this.player.getEquip(EquipSubType.Armor);
    },
});

bazhen.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        priorityType: PriorityType.None,
        trigger: [EventTriggers.NeedUseCard1, EventTriggers.NeedPlayCard1],
        can_trigger(room, player, data) {
            if (!this.isOpen()) return false;
            if (
                data.is(sgs.DataType.NeedUseCardData) ||
                data.is(sgs.DataType.NeedPlayCardData)
            ) {
                return data.from === this.player && data.has('shan');
            }
        },
        regard_skill(room, player, data) {
            if (this.isOwner(player)) {
                return 'baguazhen';
            }
        },
    })
);

export const huoji = sgs.Skill({
    name: 'wars.wolong.huoji',
});

huoji.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const huogong = room.createVirtualCardByNone(
                        'huogong',
                        undefined,
                        false
                    );
                    huogong.custom.method = 1;
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
                                        huogong.addSubCard(item);
                                    if (type === 'remove')
                                        huogong.delSubCard(item);
                                    huogong.set();
                                    this._use_or_play_vcard = huogong;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '火计，你可以将一张红色手牌当【火攻】使用',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('huogong');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

export const kanpo = sgs.Skill({
    name: 'wars.wolong.kanpo',
});

kanpo.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
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
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.color === CardColor.Black;
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
                            prompt: '看破，你可以将一张黑色手牌当【无懈可击】使用',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                player.hasHandCards()
            ) {
                return data.from === player && data.has('wuxiekeji');
            }
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

wolong.addSkill(bazhen);
wolong.addSkill(huoji);
wolong.addSkill(kanpo);
