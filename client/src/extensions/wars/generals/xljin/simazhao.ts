import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { DyingEvent } from '../../../../core/event/types/event.die';
import { PindianEvent } from '../../../../core/event/types/event.pindian';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const simazhao = sgs.General({
    name: 'xl.simazhao',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const daidi = sgs.Skill({
    name: 'xl.simazhao.daidi',
});

daidi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.PlayPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                !data.isOwner(player) &&
                player.canPindian([data.executor], this.name)
            );
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
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
                            prompt: '怠敌：请选择一项',
                            showMainButtons: false,
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
            return await room.pindian({
                from,
                targets: [target],
                source: data,
                reason: this.name,
                reqOptions: {
                    prompt: `@daidi`,
                    thinkPrompt: this.name,
                },
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const pindian = context.cost as PindianEvent;
            if (pindian.win === from) {
                this.setInvalids(this.name, true);
                const handles: string[] = ['daidi.damage'];
                const lose = room.createEventData(sgs.DataType.LoseHpEvent, {
                    player: target,
                    source: data,
                    reason: this.name,
                });
                handles.push(lose.check() ? 'daidi.lose' : '!daidi.lose');
                context.handles = handles;
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const result = room.getResult(req, 'option').result as string[];
                if (result.includes('daidi.damage')) {
                    const effect = await room.addEffect('daidi.delay', target);
                    effect.setData('data', room.currentTurn);
                }
                if (result.includes('daidi.lose')) {
                    await room.losehp(lose);
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.CircleStarted,
                async on_exec(room, data) {
                    this.setInvalids(this.name, false);
                },
            },
        ],
    })
);

export const daidi_delay = sgs.TriggerEffect({
    name: 'daidi.delay',
    mark: ['mark.daidi'],
    priorityType: PriorityType.General,
    trigger: EventTriggers.CauseDamage2,
    can_trigger(room, player, data: DamageEvent) {
        return this.isOwner(player) && data.from === player;
    },
    async cost(room, data: DamageEvent, context) {
        data.number--;
        return true;
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

export const zhaoxin = sgs.Skill({
    name: 'xl.simazhao.zhaoxin',
});

zhaoxin.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Limit],
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.Dying,
        can_trigger(room, player, data: DyingEvent) {
            return this.isOwner(player) && data.player === player;
        },
        async cost(room, data, context) {
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            const count = 3 - from.getHandCards().length;
            await room.drawCards({
                player: from,
                count,
                source: data,
                reason: this.name,
            });
            await room.recoverTo({
                player: from,
                number: from.maxhp,
                source: data,
                reason: this.name,
            });
            await room.addSkill('xl.simazhao.nijie', from, {
                source: this.name,
                showui: 'default',
            });
        },
    })
);

export const nijie = sgs.Skill({
    name: 'xl.simazhao.nijie',
});

nijie.addEffect(
    sgs.TriggerEffect({
        audio: [`xl/xl.simazhao/nijie2`],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.CauseDamage2,
        can_trigger(room, player, data: DamageEvent) {
            if (this.isOwner(player) && data.from === player) {
                const damage = room.getHistorys(
                    sgs.DataType.DamageEvent,
                    (v) => v.from === player,
                    room.currentTurn
                );
                return damage.length < 1;
            }
        },
        async cost(room, data: DamageEvent, context) {
            data.number++;
            return true;
        },
    })
);

nijie.addEffect(
    sgs.TriggerEffect({
        audio: [`xl/xl.simazhao/nijie1`],
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamage2,
        can_trigger(room, player, data: DamageEvent) {
            if (this.isOwner(player) && data.to === player) {
                const damage = room.getHistorys(
                    sgs.DataType.DamageEvent,
                    (v) => v.to === player,
                    room.currentTurn
                );
                return damage.length < 1;
            }
        },
        async cost(room, data: DamageEvent, context) {
            data.number++;
            return true;
        },
    })
);

nijie.addEffect(
    sgs.StateEffect({
        [StateEffectType.Regard_CardData](card, property, source) {
            if (card.area === this.player.handArea && property === 'put') {
                return CardPut.Up;
            }
        },
    })
);

simazhao.addSkill(daidi);
simazhao.addSkill(zhaoxin);
simazhao.addSkill(nijie, true);

sgs.loadTranslation({
    ['@daidi']: '怠敌：请选择一张牌拼点',
    ['daidi.damage']: '本回合造成伤害-1',
    ['daidi.lose']: '失去1点体力',
    ['mark.daidi']: '怠敌',
});
