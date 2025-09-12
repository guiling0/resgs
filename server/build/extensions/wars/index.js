"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mode_wars = exports.game_wars_rules = void 0;
const rules_1 = require("./rules");
exports.game_wars_rules = sgs.Skill({
    name: 'game_wars_rules',
});
exports.game_wars_rules.addEffect('base_selectors');
exports.game_wars_rules.addEffect('gamerule_obtain_skill');
exports.game_wars_rules.addEffect('gamerule_init_handcard');
exports.game_wars_rules.addEffect('gamerule_judgephase');
exports.game_wars_rules.addEffect('gamerule_drawphase');
exports.game_wars_rules.addEffect('gamerule_dropphase');
exports.game_wars_rules.addEffect('gamerule_mvp');
exports.game_wars_rules.addEffect(rules_1.aozhan);
exports.game_wars_rules.addEffect(rules_1.warsmark);
async function replace(room, source, card, data) {
    const equip = room.drawArea.cards.filter((v) => v.name === source);
    await room.moveCards({
        move_datas: [
            {
                cards: equip,
                toArea: room.granaryArea,
                reason: 1 /* MoveCardReason.PutTo */,
                animation: false,
            },
        ],
        source: data,
        reason: 'replace',
    });
    lodash.remove(room.cardNames, (c) => c === source);
    await room.createGameCard(card, undefined, true);
}
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'lord_equips',
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "GameStartBefore" /* EventTriggers.GameStartBefore */,
    can_trigger(room, player, data) {
        return room.options.settings.lordEquip;
    },
    async effect(room, data, context) {
        const ban_country = room.getData('ban_country');
        //飞龙
        if (room.getGeneral('wars.lord_liubei') && ban_country !== 'shu') {
            await replace(room, 'cixiongshuanggujian', {
                id: '00_feilongduofeng',
                name: 'feilongduofeng',
                suit: 1 /* CardSuit.Spade */,
                number: 2,
                attr: [],
                derived: false,
                package: 'WarsExtraCards',
            }, data);
        }
        //太平
        if (room.getGeneral('wars.lord_zhangjiao') &&
            ban_country !== 'qun') {
            await replace(room, 'jingfan', {
                id: '00_taipingyaoshu',
                name: 'taipingyaoshu',
                suit: 2 /* CardSuit.Heart */,
                number: 3,
                attr: [],
                derived: false,
                package: 'WarsExtraCards',
            }, data);
        }
        if (room.getGeneral('wars.lord_sunquan') && ban_country !== 'wu') {
            //定澜
            await replace(room, 'wuliujian', {
                id: '00_dinglanyemingzhu',
                name: 'dinglanyemingzhu',
                suit: 4 /* CardSuit.Diamond */,
                number: 6,
                attr: [],
                derived: false,
                package: 'WarsExtraCards',
            }, data);
        }
        //六龙
        if (room.getGeneral('wars.lord_caocao') && ban_country !== 'wei') {
            await replace(room, 'zhuahuangfeidian', {
                id: '00_liulongcanjia',
                name: 'liulongcanjia',
                suit: 2 /* CardSuit.Heart */,
                number: 13,
                attr: [],
                derived: false,
                package: 'WarsExtraCards',
            }, data);
        }
        //jiling
        if (room.getGeneral('wars.lord_simayi') && ban_country !== 'jin') {
            await replace(room, 'qinggangjian', {
                id: '00_jilinqianyi',
                name: 'jilinqianyi',
                suit: 1 /* CardSuit.Spade */,
                number: 6,
                attr: [],
                derived: false,
                package: 'WarsExtraCards',
            }, data);
        }
        //赤宝珊瑚
        if (room.getGeneral('xl.lord_simayan') && ban_country !== 'jin') {
            await replace(room, 'huxinjing', {
                id: '00_chibaoshanhu',
                name: 'chibaoshanhu',
                suit: 3 /* CardSuit.Club */,
                number: 2,
                attr: [],
                derived: false,
                package: 'WarsExtraCards',
            }, data);
        }
    },
}));
/** mvp */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_mvp_wars',
    trigger: [
        "Death" /* EventTriggers.Death */, //记录击杀
        "InflictDamage3" /* EventTriggers.InflictDamage3 */, //记录伤害
        "RecoverHpStart" /* EventTriggers.RecoverHpStart */, //记录回复
    ],
    priorityType: 5 /* PriorityType.GlobalRule */,
    can_trigger(room, player, data) {
        return true;
    },
    async effect(room, data, context) {
        if (data.is(sgs.DataType.DieEvent) && data.killer) {
            if (room.sameAsKingdom(data.killer, data.player)) {
                return;
            }
            const count = room.getPlayerCountByKingdom(data.player.kingdom);
            data.killer.mvp_score.kill += Math.min(4, count);
            if (data.player.head.isLord()) {
                data.killer.mvp_score.kill += 2;
            }
        }
        if (data.is(sgs.DataType.DamageEvent) && data.from) {
            const skill = room.skills.find((v) => v.name === data.reason);
            if (skill && skill.player) {
                skill.player.mvp_score.damage++;
            }
        }
        if (data.is(sgs.DataType.RecoverHpEvent)) {
            const skill = room.skills.find((v) => v.name === data.reason);
            if (skill && skill.player) {
                skill.player.mvp_score.recover++;
            }
        }
    },
}));
/** 国战模式-游戏开始时获得合纵 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_obtain_hezong',
    trigger: "ChooseGeneralAfter" /* EventTriggers.ChooseGeneralAfter */,
    priorityType: 5 /* PriorityType.GlobalRule */,
    can_trigger() {
        return true;
    },
    async cost(room, data) {
        for (const player of room.playerAlives) {
            await room.addSkill('wars.hezong', player, {
                source: 'system',
                showui: 'other',
                log: false,
            });
        }
        return true;
    },
}));
/** 国战模式-选择武将牌 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_choose_general',
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "ChooseGeneral" /* EventTriggers.ChooseGeneral */,
    can_trigger() {
        return true;
    },
    getSelectors(room, context) {
        return {
            choose_general: () => {
                return {
                    selectors: {
                        general: {
                            type: 'general',
                            step: 1,
                            count: 2,
                            selectable: room.getGenerals(context.generals),
                            filter: function (item, selected) {
                                if (selected.length === 0) {
                                    if (item.name === 'mobile.shichangshi')
                                        return true;
                                    return (!item.isDual() &&
                                        !!(this.selectors.general).selectable.find((v) => v !== item && item.sameAs(v)));
                                }
                                else if (selected.length === 1) {
                                    if (item.name === 'mobile.shichangshi')
                                        return false;
                                    return (item.kingdom !== 'ye' &&
                                        item.sameAs(selected[0]));
                                }
                                return false;
                            },
                            selecte_type: 'dual',
                            windowOptions: {
                                title: '请选择两张势力相同的武将牌',
                                timebar: 45,
                                buttons: ['confirm'],
                            },
                            onChange(type, item, selected) {
                                if (type === 'add' &&
                                    item.name === 'mobile.shichangshi') {
                                    this.selectors.general.count = 1;
                                }
                                else {
                                    this.selectors.general.count = 2;
                                }
                            },
                        },
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '选择武将牌',
                        ms: 45,
                    },
                };
            },
        };
    },
    async cost(room, data) {
        const generals = await room.allocateGenerals();
        if (!generals)
            return;
        const reqs = await room.doRequestAll(room.players.map((player) => {
            const selectable = generals.get(player);
            return {
                player,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_general'),
                    context: {
                        effect: this,
                        generals: selectable,
                    },
                },
            };
        }));
        reqs.forEach((v) => {
            const result = v.result.results.general.result;
            room.generalArea.remove(result);
            v.player.handArea.add(result);
            if (result.length < 1) {
                result.push(room.getGeneral('default.shibingn'), room.getGeneral('default.shibingv'));
            }
            if (result.length < 2) {
                result.push(room.getGeneral('default.shibingn'));
            }
            v.player.setProperty('_head', result[0].id);
            v.player.setProperty('_deputy', result[1].id);
            room.recordGeneral(result[0].id, ['isInitialPick']);
            room.recordGeneral(result[1].id, ['isInitialPick']);
        });
        return true;
    },
}));
/** 游戏开始时初始化属性 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_init_property',
    trigger: "InitProperty" /* EventTriggers.InitProperty */,
    priorityType: 5 /* PriorityType.GlobalRule */,
    can_trigger() {
        return true;
    },
    async cost(room, data) {
        for (const player of room.players) {
            let maxhp = 0, hp = 0, shield = 0;
            if (player.head && player.head.name === 'mobile.shichangshi') {
                maxhp = player.head.hpmax;
                hp = player.head.hp;
                shield = player.head.shield;
            }
            else {
                maxhp = lodash.toInteger((player.head?.hpmax || 0) + (player.deputy?.hpmax || 0));
                hp = lodash.toInteger((player.head?.hp || 0) + (player.deputy?.hp || 0));
                shield = lodash.toInteger((player.head?.shield || 0) +
                    (player.deputy?.shield || 0));
                player.setProperty('general_mode', 'dual');
            }
            if (hp > maxhp)
                hp = maxhp;
            player.setProperty('seat', player.seat);
            player.setProperty('maxhp', maxhp);
            player.setProperty('hp', hp);
            player.setProperty('inthp', hp);
            player.setProperty('shield', shield);
            player.setProperty('kingdom', 'none');
        }
        return true;
    },
}));
/** 回合开始时明置武将牌 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_open_general',
    trigger: "TurnStart" /* EventTriggers.TurnStart */,
    priorityType: 4 /* PriorityType.Rule */,
    can_trigger(room, player, data) {
        const { player: current } = data;
        return current === player && current.hasNoneOpen();
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
                        canCancle: true,
                        showMainButtons: false,
                        prompt: '请选择要明置的武将牌',
                        thinkPrompt: '明置武将牌',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const openHead = room.createEventData(sgs.DataType.OpenEvent, {
            player: from,
            generals: [from.head],
            source: data,
            reason: this.name,
        });
        const openDeputy = room.createEventData(sgs.DataType.OpenEvent, {
            player: from,
            generals: [from.deputy],
            source: data,
            reason: this.name,
        });
        const openAll = room.createEventData(sgs.DataType.OpenEvent, {
            player: from,
            generals: [from.head, from.deputy],
            source: data,
            reason: this.name,
        });
        const handles = [];
        handles.push(`${openHead.check() ? '' : '!'}openHead`);
        handles.push(`${openDeputy.check() ? '' : '!'}openDeputy`);
        handles.push(`${openAll.check() ? '' : '!'}openAll`);
        context.handles = handles;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = req.result.results.option.result;
        if (result.includes('openHead')) {
            await room.open(openHead);
        }
        if (result.includes('openDeputy')) {
            await room.open(openDeputy);
        }
        if (result.includes('openAll')) {
            await room.open(openAll);
        }
        return true;
    },
}));
/** 明置后赋予势力 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_change_kingdom',
    trigger: "StateChanged" /* EventTriggers.StateChanged */,
    priorityType: 4 /* PriorityType.Rule */,
    can_trigger(room, player, data) {
        return data.is(sgs.DataType.OpenEvent) && data.player === player;
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: '是否变身君主',
                    thinkPrompt: '君主',
                });
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        // 君主变身
        if (data.reason === 'game_wars_rules' && data.is_open_head) {
            const lords = [
                'wars.lord_liubei',
                'wars.lord_caocao',
                'wars.lord_zhangjiao',
                'wars.lord_sunquan',
                'wars.lord_simayi',
                'xl.lord_simayan',
            ];
            const old = [
                'wars.liubei',
                'wars.caocao',
                'wars.zhangjiao',
                'wars.sunquan',
                'wars.simayi_jin',
                'xl.simayan',
            ];
            const turns = room.getHistorys(sgs.DataType.TurnEvent, (v) => v.player === from);
            if (turns.length === 1 && old.includes(from.head?.name)) {
                const index = old.findIndex((v) => v === from.head.name);
                if (index !== -1) {
                    const general = room.getGeneral(lords[index]);
                    if (general) {
                        const req = await room.doRequest({
                            player: from,
                            get_selectors: {
                                selectorId: this.getSelectorName('choose'),
                                context: { effect: this },
                            },
                        });
                        if (!req.result.cancle) {
                            const old = from.head;
                            lodash.remove(data.generals, (c) => c === from.head);
                            data.generals.push(general);
                            await room.change({
                                player: from,
                                general: from.head,
                                to_general: general,
                                source: data,
                                reason: this.name,
                            });
                            //将原武将牌加入到仓廪
                            room.generalArea.remove([old]);
                            room.granaryArea.add([old]);
                            //重新计算体力上限
                            let maxhp = lodash.toInteger((from.head?.hpmax || 0) +
                                (from.deputy?.hpmax || 0)), hp = lodash.toInteger((from.head?.hp || 0) +
                                (from.deputy?.hp || 0));
                            if (hp > maxhp)
                                hp = maxhp;
                            const c = maxhp - from.maxhp;
                            from.setProperty('maxhp', maxhp);
                            from.changeHp(from.hp + c);
                            room.setData(`lord_${general.kingdom}`, true);
                            room.players.forEach((v) => {
                                if (v.kingdom.includes('ye') &&
                                    v.kingdom.includes(general.kingdom)) {
                                    v.setProperty('kingdom', general.kingdom);
                                }
                            });
                        }
                    }
                }
            }
        }
        //赋予势力
        from.definWarsKindom();
        return true;
    },
}));
/** 观看下家 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_watchnext',
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "GameStarted" /* EventTriggers.GameStarted */,
    can_trigger(room, player, data) {
        return room.options.settings.watchNext;
    },
    async cost(room, data, context) {
        await room.doRequestAll(room.playerAlives.map((v) => {
            if (!v.next)
                return;
            // //发送给其余玩家
            // room.sendLog(
            //     {
            //         text: '#WatchGeneral1',
            //         values: [
            //             { type: 'player', value: v.playerId },
            //             { type: 'player', value: v.next.playerId },
            //             { type: 'string', value: 'deputy' },
            //             {
            //                 type: '[string]',
            //                 value: [],
            //             },
            //         ],
            //     },
            //     [v]
            // );
            //发送给观看玩家
            room.sendLog({
                text: '#WatchGeneral1',
                values: [
                    { type: 'player', value: v.playerId },
                    { type: 'player', value: v.next.playerId },
                    { type: 'string', value: 'deputy' },
                    {
                        type: 'string',
                        value: v.next.deputy?.trueName,
                    },
                ],
            }, room.players.filter((p) => p !== v));
            return {
                player: v,
                get_selectors: {
                    selectorId: room.base_selectors.getSelectorName('watch_general'),
                    context: {
                        effect: room.base_selectors,
                        targets: [v.next],
                        pos: 'deputy',
                        generals: room.getGeneralIds([v.next.deputy]),
                    },
                },
            };
        }));
        return true;
    },
}));
/** 击杀奖惩 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_RewardAndPunish',
    priorityType: 4 /* PriorityType.Rule */,
    trigger: "Deathed" /* EventTriggers.Deathed */,
    can_trigger(room, player, data) {
        return player === data.killer && player.alive;
    },
    async cost(room, data, context) {
        const { from } = context;
        const to = data.player;
        const chenjie = room.getEffect(room.getMark('#chenjie'));
        if (chenjie &&
            chenjie.player &&
            chenjie.isOpen() &&
            chenjie.check()) {
            if ((data.player === chenjie.player &&
                from.kingdom === 'wei') ||
                (from === chenjie.player &&
                    data.player &&
                    data.player.kingdom === 'wei')) {
                await room.dropCards({
                    player: from,
                    cards: [
                        ...from.getHandCards(),
                        ...from.getEquipCards(),
                    ],
                    source: data,
                    reason: 'punish',
                });
                return true;
            }
        }
        if (room.sameAsKingdom(from, to)) {
            await room.dropCards({
                player: from,
                cards: [...from.getHandCards(), ...from.getEquipCards()],
                source: data,
                reason: 'punish',
            });
        }
        if (room.differentAsKingdom(from, to)) {
            const count = from.isYexinjia()
                ? 3
                : room.getPlayerCount((v) => room.sameAsKingdom(to, v)) + 1;
            await room.drawCards({
                player: from,
                count,
                source: data,
                reason: 'reward',
            });
        }
        return true;
    },
}));
/** 胜负判定1 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_gameover1',
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "StateChanged" /* EventTriggers.StateChanged */,
    can_trigger(room, player, data) {
        return (room.playerAlives.every((v) => room.sameAsKingdom(v, room.playerAlives[0])) && room.players.every((v) => v.rest === 0));
    },
    async cost(room, data, context) {
        await room.gameOver(room.getPlayerByFilter((v) => room.sameAsKingdom(v, room.playerAlives[0]), true), this.name);
        return true;
    },
}));
/** 胜负判定2 */
exports.game_wars_rules.addEffect(sgs.TriggerEffect({
    name: 'gamerule_gameover2',
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "ConfirmRole" /* EventTriggers.ConfirmRole */,
    can_trigger(room, player, data) {
        return (room.playerAlives.every((v) => room.sameAsKingdom(v, room.playerAlives[0])) && room.players.every((v) => v.rest === 0));
    },
    async cost(room, data, context) {
        await room.gameOver(room.getPlayerByFilter((v) => room.sameAsKingdom(v, room.playerAlives[0]), true), this.name);
        return true;
    },
}));
exports.mode_wars = sgs.GameMode({
    name: 'wars',
    maxPlayer: 10,
    settings: [],
    rules: exports.game_wars_rules,
});
__exportStar(require("./cards"), exports);
__exportStar(require("./generals"), exports);
__exportStar(require("./relationship"), exports);
__exportStar(require("./rules"), exports);
sgs.loadTranslation({
    ['game_wars_rules']: '',
    ['InsufficientQuantityGeneral']: '武将牌数量不足',
    ['openHead']: '明置主将',
    ['openDeputy']: '明置副将',
    ['openAll']: '全部明置',
});
