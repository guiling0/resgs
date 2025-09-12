import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';

export const madai = sgs.General({
    name: 'wars.madai',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const mashu = sgs.Skill({
    name: 'wars.madai.mashu',
});

mashu.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Distance_Correct](from, to) {
            if (this.isOwner(from)) {
                return -1;
            }
        },
    })
);

export const qianxi = sgs.Skill({
    name: 'wars.madai.qianxi',
});

qianxi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return from.distanceTo(item) === 1;
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `潜袭：请弃置一张牌并选择距离为1的角色，他本回合不能使用与此牌颜色相同的手牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            const targets = room.getResultPlayers(req);
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            const card = cards.at(0);
            const target = targets.at(0);
            if (target && card) {
                target.setMark('mark.qianxi', `color${card.color}`, {
                    visible: true,
                });
                const effect = await room.addEffect('qianxi.delay', target);
                effect.setData('turn', room.currentTurn);
            }
        },
    })
);

export const qianxi_delay = sgs.StateEffect({
    name: 'qianxi.delay',
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        if (
            this.isOwner(from) &&
            `color${card.color}` === from.getMark('mark.qianxi')
        ) {
            const cards = card.subcards;
            return cards.length && cards.every((v) => v.area === from.handArea);
        }
    },

    [StateEffectType.Prohibit_PlayCard](from, card, reason) {
        if (
            this.isOwner(from) &&
            `color${card.color}` === from.getMark('mark.qianxi')
        ) {
            const cards = card.subcards;
            return cards.length && cards.every((v) => v.area === from.handArea);
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                    this.player.removeMark('mark.qianxi');
                    this.player.removeData('qianxi.color');
                }
            },
        },
    ],
});

madai.addSkill(mashu);
madai.addSkill(qianxi);

sgs.loadTranslation({
    ['mark.qianxi']: '潜袭',
});
