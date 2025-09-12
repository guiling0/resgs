import { CardSuit } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { NeedUseCardData } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const simashi = sgs.General({
    name: 'wars.simashi',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const yimie = sgs.Skill({
    name: 'wars.simashi.yimie',
    global(room, to) {
        return this.player !== to;
    },
});

//夷灭：配音
yimie.addEffect(
    sgs.TriggerEffect({
        priorityType: PriorityType.None,
        trigger: EventTriggers.EntryDying,
        can_trigger(room, player, data) {
            return this.isOpen() && this.player.inturn;
        },
    })
);

yimie.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
            return (
                this.player?.inturn &&
                card &&
                card.name === 'tao' &&
                card.custom.method === 2 &&
                this.room.sameAsKingdom(from, target as GamePlayer)
            );
        },
    })
);

yimie.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        audio: [],
        trigger: EventTriggers.NeedUseCard3,
        can_trigger(room, player, data: NeedUseCardData) {
            return (
                player === data.from &&
                this.player?.inturn &&
                data.from === player &&
                data.has('tao', 2)
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const tao = room.createVirtualCardByNone(
                        'tao',
                        undefined,
                        false
                    );
                    tao.custom.method = 2;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
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
                            prompt: '夷灭：你可以将一张红桃牌当【桃】使用',
                        },
                    };
                },
            };
        },
    })
);

export const ruilue = sgs.Skill({
    name: 'wars.simashi.ruilue',
    global(room, to) {
        return this.player !== to && to.isNoneKingdom();
    },
});

ruilue.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                !this.isOwner(player) &&
                data.isOwner(player) &&
                player.isNoneKingdom() &&
                this.player
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
                    const effect = context.effect;
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.isDamageCard();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `睿略：你可以将一张伤害牌交给${effect.player.gameName}，然后摸一张牌`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.giveCards({
                from,
                to: this.player,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

simashi.addSkill(yimie);
simashi.addSkill(ruilue);
