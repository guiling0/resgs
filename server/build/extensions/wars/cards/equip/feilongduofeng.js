"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feilong_skill = exports.feilongduofeng = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.feilongduofeng = sgs.CardUseEquip({
    name: 'feilongduofeng',
});
sgs.setCardData('feilongduofeng', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'eng',
});
exports.feilong_skill = sgs.Skill({
    name: 'feilongduofeng',
    attached_equip: 'feilongduofeng',
});
exports.feilong_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 2;
        }
    },
}));
exports.feilong_skill.addEffect(sgs.TriggerEffect({
    anim: 'feilongduofeng_skill',
    audio: ['feilongduofeng'],
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    getSelectors(room, context) {
        const target = context.targets.at(0);
        return {
            choose: () => {
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
                        prompt: `飞龙夺凤：你需要弃置一张牌`,
                        thinkPrompt: `飞龙夺凤`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.card.name === 'sha' &&
            data.from === player) {
            const target = data.current.target;
            return (target && target.hasCanDropCards('he', target, 1, this.name));
        }
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
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
        return true;
    },
}));
exports.feilong_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "DieEnd" /* EventTriggers.DieEnd */,
    getSelectors(room, context) {
        return {
            choose: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: false,
                    prompt: `飞龙夺凤：是否观看${sgs.getTranslation(context.kindom)}势力武将牌并选择一张重新加入游戏`,
                    thinkPrompt: '飞龙夺凤',
                });
            },
            choose_general: () => {
                const generals = room.getGenerals(context.generals);
                return {
                    selectors: {
                        general: room.createChooseGeneral({
                            step: 1,
                            count: 1,
                            selectable: generals,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '飞龙夺凤',
                                timebar: 30,
                                prompt: '飞龙夺凤：请选择一张武将牌重新加入游戏',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: '飞龙夺凤',
                        ms: 30,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.killer === player &&
            !player.isYexinjia() &&
            !player.isNoneKingdom()) {
            const damage = data.getDamage();
            if (damage &&
                damage.channel?.name === 'sha' &&
                damage.reason === 'sha' &&
                damage.source.is(sgs.DataType.UseCardEvent) &&
                damage.source.from === player) {
                const kingdoms = room.getKingdoms();
                const counts = kingdoms.map((v) => room.getPlayerCountByKingdom(v));
                const min = Math.min(...counts);
                const count = room.getPlayerCountByKingdom(player.kingdom);
                return (count === min &&
                    room.getPlayerCountByKingdom(player.kingdom, false) <
                        room.playerCount / 2);
            }
        }
    },
    context(room, player, data) {
        return {
            targets: [data.player],
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        context.kindom = from.kingdom;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        if (!req.result.cancle) {
            const generals = room.generalArea.generals.filter((v) => v.kingdom === from.kingdom ||
                v.kingdom2 === from.kingdom);
            context.generals = room.getGeneralIds(generals);
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_general'),
                    context,
                },
            });
            const general = room
                .getResult(req, 'general')
                .result.at(0);
            if (general) {
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
                    to_general: general,
                    source: data,
                    reason: this.name,
                });
                await room.remove({
                    player: target,
                    general: target.deputy,
                    source: data,
                    reason: this.name,
                });
                target.changeHp(2);
                await room.drawCards({
                    player: target,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
