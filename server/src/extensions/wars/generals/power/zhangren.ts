import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';
import { arraycall_siege } from '../../rules';

export const zhangren = sgs.General({
    name: 'wars.zhangren',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const chuanxin = sgs.Skill({
    name: 'wars.zhangren.chuanxin',
});

chuanxin.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.CauseDamage2,
        can_trigger(room, player, data: DamageEvent) {
            if (
                this.isOwner(player) &&
                data.from === player &&
                (data.reason === 'sha' || data.reason === 'juedou') &&
                data.to &&
                data.to.hasDeputy()
            ) {
                const phase = room.getCurrentPhase();
                if (!phase.isOwner(player)) return false;
                return room.differentAsKingdom(player, data.to, 1);
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
                            prompt: '穿心：请选择一项',
                            showMainButtons: false,
                        },
                    };
                },
            };
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        async cost(room, data: DamageEvent, context) {
            await data.prevent();
            return true;
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;

            const drop = room.createEventData(sgs.DataType.DropCardsData, {
                player: target,
                cards: target.getEquipCards(),
                source: data,
                reason: this.name,
            });
            const remove = room.createEventData(sgs.DataType.RemoveEvent, {
                player: target,
                general: target.deputy,
                source: data,
                reason: this.name,
            });
            const handles: string[] = [];
            handles.push(`${drop.check() ? '' : '!'}chuanxin.drop`);
            handles.push(`${remove.check() ? '' : '!'}chuanxin.remove`);
            context.handles = handles;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('chuanxin.drop')) {
                await room.dropCards(drop);
                await room.losehp({
                    player: target,
                    source: data,
                    reason: this.name,
                });
            }
            if (result.includes('chuanxin.remove')) {
                await room.remove(remove);
            }
        },
    })
);

export const fengshi = sgs.Skill({
    name: 'wars.zhangren.fengshi',
});

fengshi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Array_Siege],
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (this.isOwner(player) && data.card && data.card.name === 'sha') {
                const target = data.current.target;
                if (data.from === player) {
                    const queue = room.getQueue(target);
                    return player.isAdjacent(target) && queue.length === 0;
                }
                if (data.from !== player) {
                    const sieges = room.getSiege(player);
                    return !!sieges.find(
                        (v) =>
                            v.from.includes(player) &&
                            v.from.includes(data.from) &&
                            v.target === target
                    );
                }
            }
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: target.getEquipCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `锋矢：请弃置一张装备区里的牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async effect(room, data: UseCardEvent, context) {
            const {
                targets: [target],
            } = context;
            if (target.hasCanDropCards('e', target, 1, this.name)) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
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
        },
    })
);

fengshi.addEffect(sgs.copy(arraycall_siege));

zhangren.addSkill(chuanxin);
zhangren.addSkill(fengshi);

sgs.loadTranslation({
    ['chuanxin.drop']: '弃置装备并失去1点体力',
    ['chuanxin.remove']: '移除副将',
});
