import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';

export const dongzhuo = sgs.General({
    name: 'wars.dongzhuo',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const hengzheng = sgs.Skill({
    name: 'wars.dongzhuo.hengzheng',
});

hengzheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.DrawPhaseStartedAfter,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                (player.hp === 1 || !player.hasHandCards()) &&
                room.playerAlives.some(
                    (v) => v !== player && v.hasCardsInArea(true)
                )
            );
        },
        context(room, player, data) {
            return {
                targets: room.playerAlives.filter(
                    (v) => v !== player && v.hasCardsInArea(true)
                ),
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = room.getPlayer(context.current);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('hej'),
                                windowOptions: {
                                    title: '横征',
                                    timebar: room.responseTime,
                                    prompt: '横征，请选择一张牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: '横征',
                        },
                    };
                },
            };
        },
        async cost(room, data: PhaseEvent, context) {
            await data.end();
            return true;
        },
        async effect(room, data, context) {
            const { from, targets } = context;

            for (const target of targets) {
                context.current = target.playerId;
                if (target === from) continue;
                if (!target.hasCardsInArea(true)) continue;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const baoling = sgs.Skill({
    name: 'wars.dongzhuo.baoling',
});

baoling.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Limit, SkillTag.Lock, SkillTag.Head],
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseEnd,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                this.isOpen() &&
                this.player?.hasDeputy()
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.remove({
                player: from,
                general: from.deputy,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.changeMaxHp({
                player: from,
                number: 3,
                source: data,
                reason: this.name,
            });
            await room.recoverhp({
                player: from,
                number: 3,
                source: data,
                reason: this.name,
            });
            await room.addSkill('wars.dongzhuo.benghuai', from, {
                showui: 'default',
                source: this.name,
            });
        },
    })
);

export const benghuai = sgs.Skill({
    name: 'wars.dongzhuo.benghuai',
});

benghuai.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                !!room.playerAlives.find(
                    (v) => v !== player && v.inthp < player.inthp
                )
            );
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
                            prompt: '崩坏：请选择一项',
                            showMainButtons: false,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { from } = context;
            const losehp = room.createEventData(sgs.DataType.LoseHpEvent, {
                player: from,
                source: data,
                reason: this.name,
            });
            const reducemax = room.createEventData(
                sgs.DataType.ChangeMaxHpEvent,
                {
                    player: from,
                    number: -1,
                    source: data,
                    reason: this.name,
                }
            );
            const handles: string[] = [];
            handles.push(`${losehp.check() ? '' : '!'}benghuai.losehp`);
            handles.push(`${reducemax.check() ? '' : '!'}benghuai.reduce`);
            context.handles = handles;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('benghuai.losehp')) {
                await room.losehp(losehp);
            }
            if (result.includes('benghuai.reduce')) {
                await room.changeMaxHp(reducemax);
            }
        },
    })
);

dongzhuo.addSkill(hengzheng);
dongzhuo.addSkill(baoling);
dongzhuo.addSkill(benghuai, true);

sgs.loadTranslation({
    ['benghuai.losehp']: '失去1点体力',
    ['benghuai.reduce']: '减少1点体力上限',
});
