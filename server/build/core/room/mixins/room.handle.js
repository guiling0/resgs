"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomHandleMixin = void 0;
const vcard_1 = require("../../card/vcard");
const event_command_1 = require("../../event/types/event.command");
const event_damage_1 = require("../../event/types/event.damage");
const event_die_1 = require("../../event/types/event.die");
const event_hp_1 = require("../../event/types/event.hp");
const event_judge_1 = require("../../event/types/event.judge");
const event_move_1 = require("../../event/types/event.move");
const event_pindian_1 = require("../../event/types/event.pindian");
const event_play_1 = require("../../event/types/event.play");
const event_skill_1 = require("../../event/types/event.skill");
const event_state_1 = require("../../event/types/event.state");
const event_use_1 = require("../../event/types/event.use");
const event_watch_1 = require("../../event/types/event.watch");
const skill_types_1 = require("../../skill/skill.types");
class RoomHandleMixin {
    /**
     * 横置/重置
     * @param data.player 横置/重置的角色
     * @param data.to_state 目标状态
     * @param data.damageType 受到哪种伤害而解锁
     */
    async chain(data) {
        return await this.cast(event_state_1.ChainEvent, data).exec();
    }
    /**
     * 翻面/叠置
     * @param data.player 翻面/叠置的角色
     * @param data.to_state 目标状态
     */
    async skip(data) {
        return await this.cast(event_state_1.SkipEvent, data).exec();
    }
    /**
     * 明置武将牌
     * @param data.player 明置武将牌的角色
     * @param data.generals 要明置的武将牌
     */
    async open(data) {
        return await this.cast(event_state_1.OpenEvent, data).exec();
    }
    /**
     * 暗置武将牌
     * @param data.player 暗置武将牌的角色
     * @param data.generals 要暗置的武将牌
     */
    async close(data) {
        return await this.cast(event_state_1.CloseEvent, data).exec();
    }
    /**
     * 变更武将牌
     * @param data.player 变更武将牌的角色
     * @param data.general 要变更的武将牌或位置
     * @param data.to_general 目标武将牌
     */
    async change(data) {
        return await this.cast(event_state_1.ChangeEvent, data).exec();
    }
    /**
     * 移除武将牌
     * @param data.player 移除武将牌的角色
     * @param data.general 要移除的武将牌
     */
    async remove(data) {
        return await this.cast(event_state_1.RemoveEvent, data).exec();
    }
    /**
     * 复原武将牌
     * @param data.player 要复原武将牌的角色
     */
    async restore(data) {
        const restore = this.cast(event_state_1.RestoreData, data);
        if (!restore.player || restore.player.death)
            return;
        const result = {};
        if (restore.player.chained) {
            result.chain = await this.chain(Object.assign({
                player: restore.player,
                to_state: false,
            }, restore.copy()));
        }
        if (restore.player.skip) {
            result.skip = await this.skip(Object.assign({
                player: restore.player,
                to_state: false,
            }, restore.copy()));
        }
        return result;
    }
    /**
     * 伤害
     * @param data.from [可选]伤害来源
     * @param data.to 受到伤害的角色
     * @param data.damageType 伤害类型
     * @param data.channel 渠道的牌
     * @param data.number 伤害值
     * @param data.isChain 是否为连环伤害
     * @returns
     */
    async damage(data) {
        return await this.cast(event_damage_1.DamageEvent, data).exec();
    }
    /**
     * 失去体力
     * @param data.player 失去体力的角色
     * @param data.number 失去体力的数值
     * @returns
     */
    async losehp(data) {
        return await this.cast(event_damage_1.LoseHpEvent, data).exec();
    }
    /**
     * 扣减体力
     * @param data.player 扣减体力的角色
     * @param data.number 扣减体力的数值
     * @returns
     */
    async reducehp(data) {
        return await this.cast(event_damage_1.ReduceHpEvent, data).exec();
    }
    /**
     * 回复体力
     * @param data.player 回复体力的角色
     * @param data.number 回复体力的数值
     */
    async recoverhp(data) {
        return await this.cast(event_hp_1.RecoverHpEvent, data).exec();
    }
    /**
     * 将体力回复至
     * @param data.player 回复体力的角色
     * @param data.number 回复体力的数值
     * @description 提供与回复体力相同的数据，但number改为要回复到的体力点数。
     */
    async recoverTo(data) {
        data.number = data.number - data.player?.hp;
        return this.recoverhp(data);
    }
    /**
     * 改变体力上限
     * @param data.player 回复体力的角色
     * @param data.number 回复体力的数值
     */
    async changeMaxHp(data) {
        return await this.cast(event_hp_1.ChangeMaxHpEvent, data).exec();
    }
    /**
     * 让一名角色进入濒死状态
     * @param data.player 濒死的角色
     * @returns
     */
    async dying(data) {
        return await this.cast(event_die_1.DyingEvent, data).exec();
    }
    /**
     * 让一名角色死亡
     * @param data.player 死亡的角色
     * @param data.killer 击杀者
     * @returns
     */
    async die(data) {
        return await this.cast(event_die_1.DieEvent, data).exec();
    }
    /**
     * 移动牌
     * @param data 移动牌数据。
     * @description 这个方法没有合法性检测，会全部移动
     */
    async moveCards(data) {
        return await this.cast(event_move_1.MoveCardEvent, data).exec();
    }
    /**
     * 将牌置于/入
     * @param this
     * @param data
     */
    async puto(data) {
        return event_move_1.PutToCardsData.exec(this, data);
    }
    /**
     * 摸牌
     * @param data.player 摸牌的角色
     * @param data.count 摸牌的数量
     */
    async drawCards(data) {
        return event_move_1.DrawCardsData.exec(this, data);
    }
    /**
     * 弃牌
     * @param data.player 执行弃牌的角色
     * @param data.cards 弃置的牌
     */
    async dropCards(data) {
        return event_move_1.DropCardsData.exec(this, data);
    }
    /**
     * 获得牌
     * @param data.player 获得牌的角色
     * @param data.cards 获得的牌
     */
    async obtainCards(data) {
        return event_move_1.ObtainCardsData.exec(this, data);
    }
    /**
     * 重铸牌
     * @param data.player 重铸牌的角色
     * @param data.cards 重铸的牌
     * @description 角色只能重铸自己的牌
     */
    async recastCards(data) {
        return event_move_1.RecastCardsData.exec(this, data);
    }
    /**
     * 交给牌
     * @param data.from 交给牌的角色
     * @param data.to 获得牌的角色
     * @param data.cards 交给的牌
     */
    async giveCards(data) {
        return event_move_1.GiveCardsData.exec(this, data);
    }
    /**
     * 交换牌。这些牌会先同时置入处理区，在同时置入各自的目标区域
     * @param data.player 主要角色
     * @param data.cards1 第一叠牌
     * @param data.toArea1 第一叠牌的目标区域
     * @param data.cards2 第二叠牌
     * @param data.toArea2 第二叠牌的目标区域
     */
    async swapCards(data) {
        return event_move_1.SwapCardsData.exec(this, data);
    }
    /**
     * 亮出牌
     */
    async flashCards(data) {
        return event_move_1.FlashCardsData.exec(this, data);
    }
    /**
     * 展示牌
     */
    async showCards(data) {
        return event_move_1.ShowCardsData.exec(this, data);
    }
    /**
     * 让一名角色判定
     * @param data.player 判定的角色
     * @param data.card [可选]判定牌 一般不需要设置判定牌，判定事件开始后会亮出牌堆顶的一张牌作为判定牌
     * @param data.result [可选]判定结果 一般不需要设置判定结果，在有判定牌后会自动填充结果。但可以在后续时机中修改结果的属性
     * @param data.success [可选]判定是否成功 一般不需要设置，在判定结果确定后自动填充该属性
     * @param data.isSucc [可选]对一个结果而言判定是否是成功的，如果不设置则默认均成功
     */
    async judge(data) {
        return await this.cast(event_judge_1.JudgeEvent, data).exec();
    }
    /**
     * 拼点
     * @param data
     * @returns
     */
    async pindian(data) {
        return await this.cast(event_pindian_1.PindianEvent, data).exec();
    }
    /**
     * 需要打出牌
     * @param data.from 打出牌的角色
     * @param data.cards 需要打出的牌
     * @param data.reqOptions [可选]发起的打出牌询问的设置
     */
    async needPlayCard(data) {
        const play = this.cast(event_play_1.NeedPlayCardData, data);
        if (!play.from || play.from.death)
            return;
        if (!play.cards) {
            play.cards = this.cardNames.slice();
        }
        if (play.cards.length === 0)
            return;
        play.cards = play.cards.filter((v) => play.from.canPlayCard(v, play.reason));
        if (play.cards.length === 0)
            return;
        play.trigger = "NeedPlayCard1" /* EventTriggers.NeedPlayCard1 */;
        await this.trigger(play.trigger, play);
        if (play.played)
            return play.played;
        play.triggerCurrent = play.from;
        const contexts = new Map();
        this.trigger_effects.forEach((v) => {
            play.trigger = "NeedPlayCard2" /* EventTriggers.NeedPlayCard2 */;
            if (v.check(play)) {
                const context = v.getContext(play);
                contexts.set(v, context);
            }
            play.trigger = "NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */;
            if (v.check(play)) {
                const context = v.getContext(play);
                contexts.set(v, context);
            }
        });
        return this.prePlayCard(Object.assign({
            from: play.from,
            can_play_cards: play.cards,
            can_use_skills: contexts,
            reqOptions: play.reqOptions,
        }, play.copy()));
    }
    /**
     * 预打出牌
     * @param data
     */
    async prePlayCard(data) {
        const play = this.cast(event_play_1.PrePlayCardData, data);
        let useskill, req;
        if (!play.card) {
            if (!play.can_play_cards)
                return;
            if (play.can_play_cards.length === 0)
                return;
            if (!play.can_use_skills)
                play.can_use_skills = new Map();
            if (!play.reqOptions)
                play.reqOptions = {};
            const context = {
                from: play.from,
                can_play_cards: play.can_play_cards,
                options: play.reqOptions,
                card_selector: play.cardSelector && {
                    selectorId: play.cardSelector.selectorId,
                    context: this.toJson_Context(play.cardSelector.context),
                },
                reason: play.reason,
            };
            if (!play.cardSelector) {
                context.can_use_skills = [];
                play.can_use_skills.forEach((v, k) => {
                    context.can_use_skills.push({
                        selectorId: k.getSelectorName('skill_cost'),
                        context: this.toJson_Context(v),
                    });
                });
            }
            req = await this.doRequest({
                player: play.from,
                get_selectors: {
                    selectorId: this.base_selectors.getSelectorName('play_card'),
                    context,
                },
            });
            if (req && !req.result.cancle) {
                play.card = this.createVirtualCardByData(req.result.use_or_play_card);
                useskill = this.getEffect(req.result.selected_skill);
            }
        }
        if (play.card) {
            play.card.transform = play.transform;
            play.played = this.createEventData(event_play_1.PlayCardEvent, Object.assign({
                from: play.from,
                card: play.card,
                transform: useskill,
            }, play.copy()));
        }
        if (play.played) {
            if (useskill && useskill.inTrigger("NeedPlayCard2" /* EventTriggers.NeedPlayCard2 */)) {
                play.skill = useskill;
                await this.useskill({
                    use_skill: useskill,
                    context: data.can_use_skills.get(useskill),
                    req,
                    source: play,
                    reason: data.reason,
                });
            }
            if (useskill && useskill.inTrigger("NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */)) {
                play.played.skill = useskill;
                play.card.transform = useskill;
                await this.useskill({
                    use_skill: useskill,
                    context: data.can_use_skills.get(useskill),
                    req,
                    source: play.played,
                    reason: data.reason,
                });
            }
        }
        if (play.played && !play.played.isComplete) {
            await play.played.exec();
        }
        return play.played;
    }
    /**
     * 打出牌
     * @param data.from 打出牌的角色
     * @param data.card 打出的牌
     */
    async playcard(data) {
        return await this.cast(event_play_1.PlayCardEvent, data).exec();
    }
    /**
     * 需要使用牌
     * @param data.from 打出牌的角色
     * @param data.cards 需要打出的牌
     * @param data.reqOptions [可选]发起的打出牌询问的设置
     */
    async needUseCard(data) {
        const use = this.cast(event_use_1.NeedUseCardData, data);
        if (!use.from || use.from.death)
            return;
        if (!use.cards) {
            use.cards = [];
            this.card_uses.forEach((v) => {
                if (v.trigger !== use.source.trigger || v.sameTime)
                    return;
                use.cards.push({
                    name: v.name,
                    method: v.method,
                });
            });
        }
        if (use.cards.length === 0 && use.reason !== 'playphase')
            return;
        const selectors = use.targetSelector &&
            this.getSelectors(use.targetSelector.selectorId, use.targetSelector.context);
        const key = selectors?.selectors &&
            Object.keys(selectors.selectors).find((v) => selectors.selectors[v].type === 'player');
        const targetSelector = key && selectors.selectors[key];
        use.cards = use.cards.filter((v) => {
            const name = v.name;
            const method = v.method ?? 1;
            const use_skill = this.getCardUse(name, method);
            const _card = this.createVirtualCardByNone(name, undefined, false);
            _card.custom.check = true;
            _card.custom.method = method;
            //检测来源
            if (!use_skill.condition.call(use_skill, this, use.from, _card, use.source))
                return false;
            //检测其他
            return use.from.canUseCard(_card, undefined, use.reason, targetSelector);
        });
        if (use.cards.length === 0 && use.reason !== 'playphase')
            return;
        use.trigger = "NeedUseCard1" /* EventTriggers.NeedUseCard1 */;
        await this.trigger(use.trigger, use);
        if (use.used)
            return use.used;
        use.triggerCurrent = use.from;
        const contexts = new Map();
        this.trigger_effects.forEach((v) => {
            use.trigger = "NeedUseCard2" /* EventTriggers.NeedUseCard2 */;
            if (v.check(use)) {
                const context = v.getContext(use);
                contexts.set(v, context);
            }
            use.trigger = "NeedUseCard3" /* EventTriggers.NeedUseCard3 */;
            if (v.check(use)) {
                const context = v.getContext(use);
                contexts.set(v, context);
            }
        });
        if (use.reason === 'playphase') {
            use.playphase_skills.forEach((v, k) => {
                contexts.set(k, v);
            });
        }
        return this.preUseCard(Object.assign({
            from: use.from,
            can_use_cards: use.cards,
            can_use_skills: contexts,
            playphase_skills: use.playphase_skills,
            reqOptions: use.reqOptions,
            targetSelector: use.targetSelector,
        }, use.copy()));
    }
    /**
     * 需要使用牌-同时询问
     * @param data.from 使用牌的角色
     * @param data.cards 需要使用的牌
     * @param data.reqOptions [可选]发起的使用牌询问的设置
     */
    async needUseCardSame(data) {
        const use = this.cast(event_use_1.NeedUseCardData, data);
        if (!use.cards) {
            use.cards = [];
            this.card_uses.forEach((v) => {
                if (v.trigger !== use.source.trigger || !v.sameTime)
                    return;
                use.cards.push({
                    name: v.name,
                    method: v.method,
                });
            });
        }
        const selectors = use.targetSelector &&
            this.getSelectors(use.targetSelector.selectorId, use.targetSelector.context);
        const key = selectors?.selectors &&
            Object.keys(selectors.selectors).find((v) => selectors.selectors[v].type === 'player');
        const targetSelector = key && selectors.selectors[key];
        const canuses = this.playerAlives
            .map((from) => {
            const canuses = use.cards.filter((v) => {
                const name = v.name;
                const method = v.method ?? 1;
                const use_skill = this.getCardUse(name, method);
                const _card = this.createVirtualCardByNone(name, undefined, false);
                _card.custom.check = true;
                _card.custom.method = method;
                if (name === 'wuxiekeji' && from.skipWuxie)
                    return false;
                //检测来源
                if (!use_skill.condition.call(use_skill, this, from, _card, use.source))
                    return false;
                //检测其他
                if (!from.canUseCard(_card, undefined, use.reason, targetSelector)) {
                    return false;
                }
                return true;
            });
            return {
                from,
                canuses,
            };
        })
            .filter((v) => {
            return v.canuses.length > 0;
        });
        if (canuses.length === 0)
            return false;
        //TODO 竞技类询问会默认询问3秒
        use.trigger = "NeedUseCard1" /* EventTriggers.NeedUseCard1 */;
        await this.trigger(use.trigger, use);
        if (use.used)
            return use.used;
        const preuses = canuses
            .map((canuse) => {
            const contexts = new Map();
            use.from = canuse.from;
            use.triggerCurrent = canuse.from;
            use.cards = canuse.canuses;
            this.trigger_effects.forEach((v) => {
                use.trigger = "NeedUseCard2" /* EventTriggers.NeedUseCard2 */;
                if (v.check(use)) {
                    const context = v.getContext(use);
                    contexts.set(v, context);
                }
                use.trigger = "NeedUseCard3" /* EventTriggers.NeedUseCard3 */;
                if (v.check(use)) {
                    const context = v.getContext(use);
                    contexts.set(v, context);
                }
            });
            if (contexts.size > 0) {
                return Object.assign({
                    from: use.from,
                    can_use_cards: canuse.canuses,
                    can_use_skills: contexts,
                    reqOptions: use.reqOptions,
                    targetSelector: use.targetSelector,
                }, use.copy());
            }
            else {
                const hands = canuse.from.getHandCards();
                const viewuse = this.cards.filter((v) => this.getStates(skill_types_1.StateEffectType.LikeHandToUse, [
                    canuse.from,
                    v,
                ]).some((s) => s));
                canuse.canuses = canuse.canuses.filter((c) => hands.find((h) => h.name === c.name) ||
                    viewuse.find((h) => h.name === c.name));
            }
            if (canuse.canuses.length > 0) {
                return Object.assign({
                    from: use.from,
                    can_use_cards: canuse.canuses,
                    can_use_skills: contexts,
                    reqOptions: use.reqOptions,
                    targetSelector: use.targetSelector,
                }, use.copy());
            }
        })
            .filter((v) => v);
        return this.preUseCardSameTime(preuses);
    }
    /**
     * 预使用牌
     * @param data
     */
    async preUseCard(data) {
        const use = this.cast(event_use_1.PreUseCardData, data);
        if (use.card) {
            const vdata = use.card.vdata;
            const skill = this.getCardUse(vdata);
            const condition = skill.condition.call(skill, this, use.from, use.card, use.source);
            if (condition instanceof vcard_1.VirtualCard) {
                use.targets = condition;
            }
        }
        let useskill, req;
        if (!use.card || !use.targets) {
            if (!use.card) {
                if (!use.can_use_cards)
                    return;
                if (use.can_use_cards.length === 0)
                    return;
            }
            if (!use.can_use_skills)
                use.can_use_skills = new Map();
            if (!use.reqOptions)
                use.reqOptions = {};
            const context = {
                from: use.from,
                can_use_cards: use.can_use_cards,
                options: use.reqOptions,
                card_selector: use.cardSelector && {
                    selectorId: use.cardSelector.selectorId,
                    context: this.toJson_Context(use.cardSelector.context),
                },
                target_selector: use.targetSelector && {
                    selectorId: use.targetSelector.selectorId,
                    context: this.toJson_Context(use.targetSelector.context),
                },
                prompt: use.get_prompt(),
                reason: use.reason,
            };
            if (use.card) {
                context.skip_card = use.card.vdata;
            }
            if (use.targets) {
                context.skip_target = true;
            }
            if (use.reason === 'playphase') {
                context.options.isPlayPhase = true;
                context.options.prompt = '@playphase';
                context.options.prompt = '@@playphase';
            }
            if (!use.cardSelector && !use.card) {
                context.can_use_skills = [];
                use.can_use_skills.forEach((v, k) => {
                    context.can_use_skills.push({
                        selectorId: k.getSelectorName('skill_cost'),
                        context: this.toJson_Context(v),
                    });
                });
            }
            req = await this.doRequest({
                player: use.from,
                get_selectors: {
                    selectorId: this.base_selectors.getSelectorName('use_card'),
                    context,
                },
            });
            if (use.reason === 'playphase') {
                await this.playphase(req, use);
                return;
            }
            if (req && !req.result.cancle) {
                use.card = this.createVirtualCardByData(req.result.use_or_play_card);
                use.targets = req.result.results.target?.result;
                useskill = this.getEffect(req.result.selected_skill);
            }
        }
        if (use.card) {
            use.card.transform = use.transform;
            const vdata = use.card.vdata;
            const skill = this.getCardUse(vdata);
            const condition = skill.condition.call(skill, this, use.from, use.card, use.source);
            if (typeof condition === 'boolean' && Array.isArray(use.targets)) {
                use.used = this.createEventData(event_use_1.UseCardEvent, Object.assign({
                    from: use.from,
                    targets: use.targets,
                    card: use.card,
                    noPlayDirectLine: use.noPlayDirectLine,
                    effectTimes: use.effectTimes,
                }, use.copy()));
            }
            if (condition instanceof vcard_1.VirtualCard) {
                use.used = this.createEventData(event_use_1.UseCardToCardEvent, Object.assign({
                    from: use.from,
                    card: use.card,
                    targets: use.targets ?? condition,
                }, use.copy()));
            }
        }
        if (use.used) {
            if (useskill && useskill.inTrigger("NeedUseCard2" /* EventTriggers.NeedUseCard2 */)) {
                use.skill = useskill;
                await this.useskill({
                    use_skill: useskill,
                    context: data.can_use_skills.get(useskill),
                    req,
                    source: use,
                    reason: data.reason,
                });
            }
            if (useskill && useskill.inTrigger("NeedUseCard3" /* EventTriggers.NeedUseCard3 */)) {
                use.used.skill = useskill;
                use.card.transform = useskill;
                await this.useskill({
                    use_skill: useskill,
                    context: data.can_use_skills.get(useskill),
                    req,
                    source: use.used,
                    reason: data.reason,
                });
            }
        }
        if (use.used && !use.used.isComplete) {
            await use.used.exec();
        }
        return use.used;
    }
    /**
     * 预使用牌-同时发起询问
     * @param data
     */
    async preUseCardSameTime(data) {
        const req = await this.doRequestRace(data.map((v, i) => {
            const use = this.cast(event_use_1.PreUseCardData, v);
            data[i] = use;
            if (use.can_use_cards.length === 0)
                return;
            if (!use.can_use_skills)
                use.can_use_skills = new Map();
            if (!use.reqOptions)
                use.reqOptions = {};
            use.reqOptions.isAllShowTimebar = true;
            const context = {
                from: use.from,
                can_use_cards: use.can_use_cards,
                options: use.reqOptions,
                card_selector: use.cardSelector && {
                    selectorId: use.cardSelector.selectorId,
                    context: this.toJson_Context(use.cardSelector.context),
                },
                target_selector: use.targetSelector && {
                    selectorId: use.targetSelector.selectorId,
                    context: this.toJson_Context(use.targetSelector.context),
                },
                prompt: use.get_prompt(),
                reason: use.reason,
            };
            if (use.card) {
                context.skip_card = use.card.vdata;
            }
            if (use.targets) {
                context.skip_target = true;
            }
            if (!use.cardSelector) {
                context.can_use_skills = [];
                use.can_use_skills.forEach((v, k) => {
                    context.can_use_skills.push({
                        selectorId: k.getSelectorName('skill_cost'),
                        context: this.toJson_Context(v),
                    });
                });
            }
            return {
                player: use.from,
                get_selectors: {
                    selectorId: this.base_selectors.getSelectorName('use_card'),
                    context,
                },
            };
        }));
        if (!req)
            return;
        const use = data.find((v) => v.from === req.player);
        use.card = this.createVirtualCardByData(req.result.use_or_play_card);
        use.targets = req.result.results.target?.result;
        const useskill = this.getEffect(req.result.selected_skill);
        if (use.card) {
            use.card.transform = use.transform;
            const vdata = use.card.vdata;
            const skill = this.getCardUse(vdata);
            const condition = skill.condition.call(skill, this, use.from, use.card, use.source);
            if (typeof condition === 'boolean' && Array.isArray(use.targets)) {
                use.used = this.createEventData(event_use_1.UseCardEvent, Object.assign({
                    from: use.from,
                    targets: use.targets,
                    card: use.card,
                    noPlayDirectLine: use.noPlayDirectLine,
                    effectTimes: use.effectTimes,
                }, use.copy()));
            }
            if (condition instanceof vcard_1.VirtualCard) {
                use.used = this.createEventData(event_use_1.UseCardToCardEvent, Object.assign({
                    from: use.from,
                    card: use.card,
                    targets: use.targets ?? condition,
                }, use.copy()));
            }
        }
        if (use.used) {
            if (useskill && useskill.inTrigger("NeedUseCard2" /* EventTriggers.NeedUseCard2 */)) {
                use.skill = useskill;
                await this.useskill({
                    use_skill: useskill,
                    context: use.can_use_skills.get(useskill),
                    req,
                    source: use,
                    reason: use.reason,
                });
            }
            if (useskill && useskill.inTrigger("NeedUseCard3" /* EventTriggers.NeedUseCard3 */)) {
                use.used.skill = useskill;
                use.card.transform = useskill;
                await this.useskill({
                    use_skill: useskill,
                    context: use.can_use_skills.get(useskill),
                    req,
                    source: use.used,
                    reason: use.reason,
                });
            }
        }
        if (use.used && !use.used.isComplete) {
            await use.used.exec();
        }
        return use.used;
    }
    /**
     * 使用牌
     */
    async usecard(data) {
        return await this.cast(event_use_1.UseCardEvent, data).exec();
    }
    /**
     * 使用目标为牌的牌
     */
    async usecard_tocard(data) {
        return await this.cast(event_use_1.UseCardToCardEvent, data).exec();
    }
    /**
     * 判定阶段系统特殊使用牌
     */
    async usecardsp(data) {
        return await this.cast(event_use_1.UseCardSpecialEvent, data).exec();
    }
    /**
     * 使用技能
     */
    async useskill(data) {
        return await this.cast(event_skill_1.UseSkillEvent, data).exec();
    }
    /**
     * 观看一名角色的手牌
     * @param data.watcher 进行观看的角色
     * @param data.player 被观看的角色
     */
    async watchHandCard(data) {
        const watch = this.cast(event_watch_1.WatchHandData, data);
        if (!watch.check())
            return;
        //让目标角色的所有手牌对观看者可见
        const { player, watcher } = watch;
        event_watch_1.WatchHandData.temp(watcher, player.getHandCards());
        this.sendLog({
            text: '#WatchHand',
            values: [
                { type: 'player', value: watcher.playerId },
                { type: 'player', value: player.playerId },
                {
                    type: '[carddata]',
                    value: this.getCardIds(player.getHandCards()),
                },
            ],
        });
        await this.doRequest({
            player: watcher,
            get_selectors: {
                selectorId: this.base_selectors.getSelectorName('watch_hand'),
                context: {
                    targets: [player],
                    cards: player.getHandCards(),
                },
            },
        });
        event_watch_1.WatchHandData.temp_end(watcher, player.getHandCards());
        return watch;
    }
    /**
     * 观看武将牌
     * @param data.watcher 进行观看的角色
     * @param data.player 被观看的角色
     */
    async watchGeneral(data) {
        const watch = this.cast(event_watch_1.WatchGeneralData, data);
        if (!watch.check())
            return;
        const { player, watcher } = watch;
        let pos = '';
        if (watch.is_watch_head && watch.is_watch_deputy) {
            pos = 'head_and_deputy';
        }
        else if (watch.is_watch_head) {
            pos = 'head';
        }
        else if (watch.is_watch_deputy) {
            pos = 'deputy';
        }
        if (watch.player) {
            //发送给其余玩家
            this.sendLog({
                text: '#WatchGeneral1',
                values: [
                    { type: 'player', value: watcher.playerId },
                    { type: 'player', value: player.playerId },
                    { type: 'string', value: pos },
                    {
                        type: '[string]',
                        value: [],
                    },
                ],
            }, [watcher]);
            //发送给观看玩家
            this.sendLog({
                text: '#WatchGeneral1',
                values: [
                    { type: 'player', value: watcher.playerId },
                    { type: 'player', value: player.playerId },
                    { type: 'string', value: pos },
                    {
                        type: '[string]',
                        value: watch.generals.map((v) => v.trueName),
                    },
                ],
            }, this.players.filter((v) => v !== watcher));
        }
        else {
            this.sendLog({
                text: '#WatchGeneral2',
                values: [
                    { type: 'player', value: watcher.playerId },
                    { type: 'number', value: watch.generals.length },
                    {
                        type: '[string]',
                        value: watch.generals.map((v) => v.trueName),
                    },
                ],
            }, [watcher]);
            this.sendLog({
                text: '#WatchGeneral2',
                values: [
                    { type: 'player', value: watcher.playerId },
                    { type: 'number', value: watch.generals.length },
                    {
                        type: '[string]',
                        value: [],
                    },
                ],
            }, this.players.filter((v) => v !== watcher));
        }
        await this.doRequest({
            player: watcher,
            get_selectors: {
                selectorId: this.base_selectors.getSelectorName('watch_general'),
                context: {
                    targets: [player],
                    pos,
                    generals: this.getGeneralIds(watch.generals),
                },
            },
        });
        return watch;
    }
    /**
     * 移动场上的牌
     * @param player 执行的角色
     * @param pos 可以移动的位置，仅有e和j 代表判定区和装备区；
     * @param options 发起询问的设置
     * @param cards 提供一个cards数组，表示可移动的牌
     */
    async moveFiled(player, pos, options, source, reason, cards) {
        /** 选择角色 */
        const req = await this.doRequest({
            player,
            get_selectors: {
                selectorId: this.base_selectors.getSelectorName('move_filed'),
                context: {
                    pos,
                    options,
                    cards,
                },
            },
        });
        const targets = this.getResultPlayers(req);
        if (targets.length < 2)
            return;
        const req_card = await this.doRequest({
            player,
            get_selectors: {
                selectorId: this.base_selectors.getSelectorName('move_filed_card'),
                context: {
                    pos,
                    cards,
                    targets,
                    options,
                },
            },
        });
        const card = this.getResultCards(req_card).at(0);
        if (!card)
            return;
        const from = card.area?.player;
        const to = targets.find((v) => v !== from);
        if (from !== to) {
            await this.moveCards({
                move_datas: [
                    {
                        cards: [card],
                        toArea: card.area.type === 92 /* AreaType.Equip */
                            ? to.equipArea
                            : to.judgeArea,
                        reason: 1 /* MoveCardReason.PutTo */,
                    },
                ],
                source,
                reason,
            });
        }
    }
    /**
     * 将牌排序
     * @param player 执行的角色
     * @param data 数据
     * @param options 发起询问的设置
     */
    async sortCards(player, cards, areas = [], options) {
        const req = await this.doRequest({
            player,
            get_selectors: {
                selectorId: this.base_selectors.getSelectorName('sort_cards'),
                context: {
                    cards,
                    areas,
                    options,
                },
            },
        });
        if (!req || !req.result.sort_result) {
            req.result.sort_result = [];
            areas.reverse().forEach((v) => {
                req.result.sort_result.push({
                    title: v.title,
                    items: cards.splice(0, v.condition ? v.condition : v.max),
                });
            });
        }
        return req;
    }
    /**
     * 选择军令
     * @param player  执行的角色
     * @param commands
     * @param options
     */
    async chooseCommand(player, commands, options, reason) {
        if (!commands || !commands.length)
            commands = this.getCommands(2);
        const req = await this.doRequest({
            player,
            get_selectors: {
                selectorId: this.base_selectors.getSelectorName('choose_command'),
                context: {
                    commands,
                    options,
                },
            },
        });
        const command = this.getResult(req, 'command').result.at(0) ??
            commands[0];
        this.broadcast({
            type: 'MsgPlayCardMoveAni',
            data: [
                {
                    cards: [command],
                    fromArea: player.handArea.areaId,
                    toArea: this.processingArea.areaId,
                    movetype: 1 /* CardPut.Up */,
                    puttype: 1 /* CardPut.Up */,
                    animation: true,
                    moveVisibles: [],
                    cardVisibles: [],
                    isMove: false,
                    label: {
                        text: '{0}{1}',
                        values: [
                            { type: 'player', value: player.playerId },
                            { type: 'string', value: reason },
                        ],
                    },
                },
            ],
            log: {
                text: '#ChooseJunling',
                values: [
                    { type: 'player', value: player.playerId },
                    {
                        type: 'string',
                        value: `#junling${command}`,
                    },
                ],
            },
        });
        return command;
    }
    /**
     * 军令
     */
    async command(data) {
        return await this.cast(event_command_1.CommandData, data).exec();
    }
    /**
     * 献策
     */
    async xiance(data) {
        return await this.cast(event_command_1.MiaoJiData, data).exec();
    }
    /**
     * 移除牌
     */
    async removeCard(data) {
        return event_move_1.RemoveCardData.exec(this, data);
    }
    /**
     * 获取一个额外回合
     * @param this
     * @param data 额外回合数据
     * @param exec 是否立即执行
     */
    async executeExtraTurn(data, exec = false) {
        if (exec) {
            const currentTurn = this.currentTurn;
            this.setProperty('turnCount', this.turnCount + 1);
            this.currentTurn = data;
            await this.currentTurn.exec();
            this.currentTurn = currentTurn;
        }
        else {
            this.extraTurns.push(data);
        }
    }
}
exports.RoomHandleMixin = RoomHandleMixin;
