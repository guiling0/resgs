import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';

export const miheng = sgs.General({
    name: 'wars.miheng',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const kuangcai = sgs.Skill({
    name: 'wars.miheng.kuangcai',
});

kuangcai.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
            return this.isOwner(from) && from.inturn;
        },
        [StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
            return this.isOwner(from) && from.inturn;
        },
        [StateEffectType.MaxHand_Correct](from) {
            if (this.isOwner(from)) {
                return from.getMark(this.name, 0);
            }
        },
    })
);

kuangcai.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Lock],
        trigger: EventTriggers.DropPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                const use = room.getLastOneHistory(
                    sgs.DataType.UseCardEvent,
                    (v) => v.from === player,
                    room.currentTurn
                );
                if (use) {
                    return !room.hasHistorys(
                        sgs.DataType.DamageEvent,
                        (v) => v.from === player
                    );
                } else {
                    return true;
                }
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            const use = room.getLastOneHistory(
                sgs.DataType.UseCardEvent,
                (v) => v.from === from,
                room.currentTurn
            );
            const mark = from.getMark(this.name, 0);
            if (use) {
                from.setMark(this.name, mark - 1, {
                    visible: true,
                    source: this.name,
                });
            } else {
                from.setMark(this.name, mark + 1, {
                    visible: true,
                    source: this.name,
                });
            }
            return true;
        },
    })
);

export const shejian = sgs.Skill({
    name: 'wars.miheng.shejian',
});

shejian.addEffect(
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
                data.from.hasCanDropCards('h', player, 1, this.name) &&
                data.current.target === player &&
                data.targetCount === 1 &&
                room.playerAlives.every((v) => v.hp > 0)
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
                            prompt: `舌剑：请选择一项`,
                            showMainButtons: false,
                        },
                    };
                },
                choose_card: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: context.count,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '舌剑',
                                    timebar: room.responseTime,
                                    prompt: `舌剑：请选择${context.count}张牌`,
                                    buttons: ['confirm'],
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
            const { from } = context;
            return await room.dropCards({
                player: from,
                cards: from.getHandCards(),
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const move = context.cost as MoveCardEvent;
            const handles = ['shejian.drop', 'shejian.damage'];
            if (!target.hasCanDropCards('he', from, 1, this.name)) {
                handles[0] = '!' + handles[0];
            }
            context.handles = handles;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('shejian.drop')) {
                context.count = move.getMoveCount();
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: target,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
            if (result.includes('shejian.damage')) {
                await room.damage({
                    from,
                    to: target,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

miheng.addSkill(kuangcai);
miheng.addSkill(shejian);

sgs.loadTranslation({
    ['shejian.drop']: '弃置牌',
    ['shejian.damage']: '造成伤害',
});
