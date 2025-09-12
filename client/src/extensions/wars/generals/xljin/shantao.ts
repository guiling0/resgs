import { EventTriggers } from '../../../../core/event/triggers';
import { DieEvent } from '../../../../core/event/types/event.die';
import { ChangeEvent } from '../../../../core/event/types/event.state';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';

export const shantao = sgs.General({
    name: 'xl.shantao',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const lunbei = sgs.Skill({
    name: 'xl.shantao.lunbei',
});

lunbei.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.ReadyPhaseStarted,
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
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `论备：请选择一名角色，与你势力相同摸一张牌，否则弃置一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: target.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `论备：请弃置一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            if (room.sameAsKingdom(from, to)) {
                return await room.drawCards({
                    player: to,
                    source: data,
                    reason: this.name,
                });
            } else {
                const req = await room.doRequest({
                    player: to,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                return await room.dropCards({
                    player: to,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            if (
                room.sameAsKingdom(from, to) &&
                (this.getData<number>('changes') ?? 0) < 2
            ) {
                await room.chooseYesOrNo(
                    from,
                    {
                        prompt: '@lunbei',
                        thinkPrompt: this.name,
                    },
                    async () => {
                        let count = this.getData<number>('changes') ?? 0;
                        count++;
                        this.setData('changes', count);
                        await room.change({
                            player: to,
                            general: 'deputy',
                            source: data,
                            reason: this.name,
                        });
                    }
                );
            }
        },
    })
);

export const qishi = sgs.Skill({
    name: 'xl.shantao.qishi',
});

qishi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.StateChange,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.ChangeEvent) &&
                data.is_change_deputy &&
                room.sameAsKingdom(player, data.player)
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const generals = room.getGenerals(context.generals);
                    return {
                        selectors: {
                            general: room.createChooseGeneral({
                                step: 1,
                                count: 1,
                                selectable: generals,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '启事',
                                    timebar: room.responseTime,
                                    prompt: '启事：请选择一张作为变更的武将牌',
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
        async cost(room, data: ChangeEvent, context) {
            const generlas = [data.to_general];
            room.generalArea.generals.forEach((v) => {
                if (
                    generlas.find(
                        (g) =>
                            v.kingdom === g.kingdom ||
                            v.kingdom2 === g.kingdom ||
                            v.kingdom === g.kingdom2 ||
                            v.kingdom2 === g.kingdom2
                    )
                ) {
                    return;
                }
                generlas.push(v);
            });
            context.generals = room.getGeneralIds(generlas);
            const req = await room.doRequest({
                player: data.player,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const general = req.result.results.general.result.at(0);
            if (general) {
                data.to_general = general;
            }
            return true;
        },
    })
);

export const yifu = sgs.Skill({
    name: 'xl.shantao.yifu',
});

yifu.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Limit],
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.DieEnd,
        can_trigger(room, player, data: DieEvent) {
            return (
                this.isOwner(player) &&
                data.player !== player &&
                room.sameAsKingdom(data.player, player)
            );
        },
        context(room, player, data: DieEvent) {
            return {
                targets: [data.player],
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const jishao = room.granaryArea.generals.find(
                (g) => g.name === 'xl.jishao'
            );
            if (jishao) {
                target.setProperty('death', false);
                room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: target.playerId,
                    ani: 'fuhuo',
                });
                await room.delay(1);
                target.setProperty('kingdom', from.kingdom);
                await room.change({
                    player: target,
                    general: 'head',
                    to_general: jishao,
                    source: data,
                    reason: this.name,
                });
                await room.remove({
                    player: target,
                    general: target.deputy,
                    source: data,
                    reason: this.name,
                });
                target.setProperty('maxhp', 2);
                target.changeHp(2);
                target.setProperty('general_mode', 'single');
                target.setMark('uncle', from.playerId);
                const players = room.sortPlayers(room.players);
                lodash.remove(players, (v) => v === target);
                const index = players.findIndex((v) => v === from);
                players.splice(index + 1, 0, target);
                players.forEach((v, i) => {
                    v.setProperty('seat', i + 1);
                });
                await room.delay(1);
                room.setProperty('updateSeat', 1);
                await room.delay(1);
                await room.drawCards({
                    player: target,
                    count: 2,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

shantao.addSkill(lunbei);
shantao.addSkill(qishi);
shantao.addSkill(yifu);

sgs.loadTranslation({
    ['@lunbei']: '论备：是否令其变更副将',
});
