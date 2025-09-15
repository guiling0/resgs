import { AreaType } from '../../../../core/area/area.type';
import { EventTriggers } from '../../../../core/event/triggers';
import {
    ChangeEvent,
    RemoveEvent,
} from '../../../../core/event/types/event.state';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const luyun = sgs.General({
    name: 'xl.luyun',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    enable: false,
    isWars: true,
});

export const duisong = sgs.Skill({
    name: 'xl.luyun.duisong',
});

duisong.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            const self = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                            target: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        item.hasCanDropCards(
                                            'he',
                                            item,
                                            1,
                                            self.name
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `对颂：你可以弃置一张牌并令一名其他角色弃置一张牌`,
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
                            prompt: `对颂：请弃置一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose2: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '对颂',
                                    timebar: room.responseTime,
                                    prompt: '对颂：请选择一张牌',
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
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                cards,
                targets: [target],
            } = context;
            if (target.hasCanDropCards('he', target, 1, this.name)) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const card1 = cards.at(0);
                const card2 = room.getResultCards(req).at(0);
                await room.dropCards({
                    player: from,
                    cards: [card2],
                    source: data,
                    reason: this.name,
                });
                if (card1 && card2) {
                    if (
                        card1.number === card2.number ||
                        sgs.getTranslation(card1.name).length ===
                            sgs.getTranslation(card2.name).length
                    ) {
                        await room.drawCards({
                            player: from,
                            source: data,
                            reason: this.name,
                        });
                        await room.drawCards({
                            player: target,
                            source: data,
                            reason: this.name,
                        });
                    } else {
                        await room.chooseYesOrNo(
                            from,
                            {
                                prompt: `@duisong`,
                                thinkPrompt: this.name,
                            },
                            async () => {
                                const req = await room.doRequest({
                                    player: from,
                                    get_selectors: {
                                        selectorId:
                                            this.getSelectorName('choose2'),
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
                        );
                    }
                }
            }
            await room.chooseYesOrNo(
                from,
                {
                    prompt: `@duisong_ob`,
                    thinkPrompt: this.name,
                },
                async () => {
                    await room.addSkill('xl.luyun.duisongzongheng', target, {
                        source: this.name,
                        showui: 'default',
                    });
                }
            );
        },
    })
);

export const duisong_zongheng = sgs.Skill({
    name: 'xl.luyun.duisongzongheng',
});

duisong_zongheng.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        mark: ['duisongzongheng'],
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            const self = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                            target: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        item.hasCanDropCards(
                                            'he',
                                            item,
                                            1,
                                            self.name
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `对颂(纵横)：你可以弃置一张牌并令一名其他角色弃置一张牌`,
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
                            prompt: `对颂(纵横)：请弃置一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose2: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '对颂(纵横)',
                                    timebar: room.responseTime,
                                    prompt: '对颂(纵横)：请选择一张牌',
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
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                cards,
                targets: [target],
            } = context;
            if (target.hasCanDropCards('he', target, 1, this.name)) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const card1 = cards.at(0);
                const card2 = room.getResultCards(req).at(0);
                await room.dropCards({
                    player: from,
                    cards: [card2],
                    source: data,
                    reason: this.name,
                });
                if (card1 && card2) {
                    if (
                        card1.number === card2.number ||
                        sgs.getTranslation(card1.name).length ===
                            sgs.getTranslation(card2.name).length
                    ) {
                        await room.drawCards({
                            player: from,
                            source: data,
                            reason: this.name,
                        });
                        await room.drawCards({
                            player: target,
                            source: data,
                            reason: this.name,
                        });
                    } else {
                        await room.chooseYesOrNo(
                            from,
                            {
                                prompt: `@duisong`,
                                thinkPrompt: this.name,
                            },
                            async () => {
                                const req = await room.doRequest({
                                    player: from,
                                    get_selectors: {
                                        selectorId:
                                            this.getSelectorName('choose2'),
                                        context,
                                    },
                                });
                                const cards = room.getResultCards(req);
                                await room.dropCards({
                                    player: from,
                                    cards,
                                    source: data,
                                    reason: this.name,
                                });
                            }
                        );
                    }
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data: TurnEvent) {
                    if (data.player === this.player && this.skill) {
                        await this.skill.removeSelf();
                    }
                },
            },
        ],
    })
);

export const fengxu = sgs.Skill({
    name: 'xl.luyun.fengxu',
});

fengxu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.StateChange,
        can_trigger(room, player, data: RemoveEvent | ChangeEvent) {
            if (this.isOwner(player)) {
                if (data.is(sgs.DataType.RemoveEvent)) {
                    return data.general === this.skill?.sourceGeneral;
                }
                if (data.is(sgs.DataType.ChangeEvent)) {
                    return data.general === this.skill?.sourceGeneral;
                }
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item.losshp > 0;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `凤煦：你可以选择一名角色，让他回复1点体力`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                targets: [target],
            } = context;
            return await room.recoverhp({
                player: target,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const pingyuan = sgs.Skill({
    name: 'xl.luyun.pingyuan',
});

pingyuan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.TurnStarted,
        can_trigger(room, player, data: TurnEvent) {
            return (
                this.isOwner(player) &&
                data.player === player &&
                this.skill &&
                this.skill.sourceGeneral
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item.losshp > 0;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `凤煦：你可以选择一名角色，让他回复1点体力`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { from } = context;
            const luji = room.getGeneral('xl.luji_jin');
            if (luji && luji.area && luji.area.type !== AreaType.Hand) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const player = room.getResultPlayers(req).at(0);
                if (player) {
                    await room.recoverhp({
                        player,
                        source: data,
                        reason: this.name,
                    });
                }
                await room.change({
                    player: this.player,
                    general: this.skill.sourceGeneral,
                    to_general: luji,
                    triggerNot: true,
                    source: data,
                    reason: this.name,
                });
                const skill = room.skills.find(
                    (v) => v.name === 'xl.luji_jin.qinghe'
                );
                if (skill) {
                    skill.setInvalids('qinghe', true);
                }
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data) {
                    if (this.skill) {
                        this.skill.setInvalids('pingyuan', false);
                    }
                },
            },
        ],
    })
);

luyun.addSkill(duisong);
luyun.addSkill(duisong_zongheng, true);
luyun.addSkill(fengxu);
luyun.addSkill(pingyuan);

sgs.loadTranslation({
    ['@duisong']: '对颂：是否获得其一张牌',
    ['@duisong_zongheng']: '对颂：是否弃置其一张牌',
    ['@duisong_ob']: '是否令其获得“对颂(纵横)”',
    ['duisongzongheng']: '纵横:对颂',
});
