import {
    CardColor,
    CardSubType,
    CardType,
} from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { DyingEvent } from '../../../../../core/event/types/event.die';
import { MoveCardEvent } from '../../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import {
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const jiaxu = sgs.General({
    name: 'wars.jiaxu',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const wansha = sgs.Skill({
    name: 'wars.jiaxu.wansha',
});

wansha.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.EntryDying,
        can_trigger(room, player, data) {
            return this.isOwner(player) && player.inturn;
        },
        async cost(room, data: DyingEvent, context) {
            const { from } = context;
            from.setMark('wars.wansha', true);
            data.player.setMark('wars.wansha', true);
            const effect = await room.addEffect('wars.wansha.delay', from);
            effect.setData('data', data);
            return true;
        },
    })
);

export const wansha_delay = sgs.StateEffect({
    name: 'wars.wansha.delay',
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        if (card.name === 'tao') {
            return !from.hasMark('wars.wansha');
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.DyingEnd,
            priority: 'after',
            async on_exec(room, data) {
                if (data === this.getData('data')) {
                    room.players.forEach((v) => {
                        v.removeMark('wars.wansha');
                    });
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const luanwu = sgs.Skill({
    name: 'wars.jiaxu.luanwu',
});

luanwu.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Limit],
        auto_log: 1,
        auto_directline: 1,
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
                                count: [1, -1],
                                filter(item, selected) {
                                    return item !== from;
                                },
                                auto: true,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `乱武：你可以令所有其他角色依次对最近距离的角色使用【杀】，否则需要失去1点体力`,
                        },
                    };
                },
                target_limit: () => {
                    const from = context.from;
                    const min = Math.min(
                        ...room.playerAlives
                            .filter((v) => v !== from)
                            .map((v) => from.distanceTo(v))
                    );
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                filter(item, selected) {
                                    return from.distanceTo(item) === min;
                                },
                            }),
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            return true;
        },
        async effect(room, data, context) {
            const { targets } = context;
            while (targets.length > 0) {
                const to = targets.shift();
                const use = await room.needUseCard({
                    from: to,
                    cards: [{ name: 'sha' }],
                    targetSelector: {
                        selectorId: this.getSelectorName('target_limit'),
                        context: {
                            from: to,
                        },
                    },
                    reqOptions: {
                        canCancle: true,
                        prompt: `@luanwu`,
                        thinkPrompt: this.name,
                    },
                    source: data,
                    reason: this.name,
                });
                if (!use) {
                    await room.losehp({
                        player: to,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

export const weimu = sgs.Skill({
    name: 'wars.jiaxu.weimu',
});

weimu.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.BecomeTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                player === data.current.target &&
                data.card &&
                data.card.type === CardType.Scroll &&
                data.card.color === CardColor.Black
            );
        },
        async cost(room, data: UseCardEvent, context) {
            await data.cancleCurrent();
            return true;
        },
    })
);

weimu.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.filter(
                    (d, c) =>
                        d.toArea === player.judgeArea &&
                        c.vcard &&
                        c.vcard.subtype === CardSubType.DelayedScroll &&
                        c.vcard.color === CardColor.Black
                ).length > 0
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            data.update(
                data.getCards(
                    (d, c) =>
                        d.toArea === from.judgeArea &&
                        c.vcard &&
                        c.vcard.subtype === CardSubType.DelayedScroll &&
                        c.vcard.color === CardColor.Black
                ),
                {
                    toArea: room.discardArea,
                }
            );
            return true;
        },
    })
);

jiaxu.addSkill(wansha);
jiaxu.addSkill(luanwu);
jiaxu.addSkill(weimu);

sgs.loadTranslation({
    [`@luanwu`]: '乱武：你需要对距离最近的一名角色使用【杀】',
});
