import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { General } from '../../../../core/general/general';
import { Gender, GeneralId } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';

export const zuoci = sgs.General({
    name: 'wars.zuoci',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const xinsheng = sgs.Skill({
    name: 'wars.zuoci.xinsheng',
});

xinsheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return this.isOwner(player) && player === data.to;
        },
        async cost(room, data, context) {
            const { from } = context;
            const general = room.generalArea.get(
                1,
                sgs.DataType.General,
                'random'
            );
            if (general.length) {
                await room.addWarsHuashen(from, general.at(0), 'mark.huashen');
            }
            return true;
        },
    })
);

export const huashen = sgs.Skill({
    name: 'wars.zuoci.huashen',
});

huashen.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                choose_general: () => {
                    const generals = room.getGenerals(context.generals);
                    return {
                        selectors: {
                            general: room.createChooseGeneral({
                                step: 1,
                                count: 2,
                                selectable: generals,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '化身',
                                    timebar: room.responseTime,
                                    prompt: '化身：请选择两张武将牌作为“化身”',
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_general2: () => {
                    const generals = room.getGenerals(context.generals);
                    return {
                        selectors: {
                            general: room.createChooseGeneral({
                                step: 1,
                                count: 1,
                                selectable: generals,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '化身',
                                    timebar: room.responseTime,
                                    prompt: '化身：请选择一张“化身”替换',
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { from } = context;
            const huashen = from.upArea.generals.filter((v) =>
                v.hasMark('mark.huashen')
            );
            if (huashen.length < 2) {
                const news = room.generalArea.get(
                    5,
                    sgs.DataType.General,
                    'random'
                );
                context.generals = room.getGeneralIds(news);
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_general'),
                        context,
                    },
                });
                const obs = req.result.results.general.result as General[];
                for (const general of obs) {
                    await room.addWarsHuashen(from, general, 'mark.huashen');
                }
            } else {
                context.generals = room.getGeneralIds(huashen);
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_general2'),
                        context,
                    },
                });
                const rep = req.result.results.general.result.at(0) as General;
                if (rep) {
                    await room.removeWarsHuashen(from, rep, 'mark.huashen');
                    const general = room.generalArea.get(
                        1,
                        sgs.DataType.General,
                        'random'
                    );
                    if (general.length) {
                        await room.addWarsHuashen(
                            from,
                            general.at(0),
                            'mark.huashen'
                        );
                    }
                }
            }
        },
    })
);

zuoci.addSkill('wars.zuoci.huashen');
zuoci.addSkill('wars.zuoci.xinsheng');

sgs.loadTranslation({
    ['mark.huashen']: '化身',
    ['mark.huashen.count']: '化身',
});
