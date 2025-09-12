"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObtainSkillData = exports.UseSkillEvent = void 0;
const effect_1 = require("../../skill/effect");
const data_1 = require("../data");
const event_1 = require("../event");
class UseSkillEvent extends event_1.EventProcess {
    async init() {
        if (!this.use_skill)
            return;
        if (!(this.use_skill instanceof effect_1.TriggerEffect))
            return;
        await super.init();
        if (!this.context)
            return;
        //定义context中的属性
        if (this.req) {
            this.context.req_result = this.req.result;
            //有cards询问
            const has_cards = Object.keys(this.req.result.results).find((v) => this.req.result.results[v].type === 'card');
            const has_players = Object.keys(this.req.result.results).find((v) => this.req.result.results[v].type === 'player');
            if (!!has_cards) {
                this.context.cards = this.room.getResultCards(this.req);
            }
            if (!!has_players) {
                this.context.targets = this.room.getResultPlayers(this.req);
            }
        }
        if (!this.context.cards) {
            this.context.cards = [];
        }
        if (!this.context.targets) {
            this.context.targets = [];
        }
        if (!this.context.from) {
            this.context.from =
                this.use_skill.player ?? this.source.triggerCurrent;
        }
        if (!this.context.maxTimes) {
            this.context.maxTimes = 1;
        }
        //自动排序目标
        if (this.use_skill.data.auto_sort) {
            this.room.sortResponse(this.context.targets);
        }
        //发动技能
        if (this.use_skill.skill) {
            const skill = this.use_skill.skill;
            if (!this.use_skill.hasTag(9 /* SkillTag.Secret */) &&
                skill &&
                skill.player) {
                if (skill.sourceGeneral === skill.player.head) {
                    await this.room.open({
                        player: skill.player,
                        generals: [skill.player.head],
                        source: this,
                        reason: 'useskill',
                    });
                }
                if (skill.sourceGeneral === skill.player.deputy) {
                    await this.room.open({
                        player: skill.player,
                        generals: [skill.player.deputy],
                        source: this,
                        reason: 'useskill',
                    });
                }
            }
        }
        this.room.insertHistory(this);
        let ani = 'none';
        let audio;
        if (this.use_skill.data.priorityType < 3) {
            audio = {
                type: 'skill',
                effect: this.use_skill?.id,
            };
        }
        if (this.use_skill.data.anim &&
            this.use_skill.data.priorityType < 3 &&
            this.use_skill.data.priorityType !== 0 /* PriorityType.None */) {
            ani =
                this.use_skill.data.anim === 'text'
                    ? 'skilltext'
                    : this.use_skill.data.anim;
        }
        let log;
        if (this.use_skill.skill) {
            if (this.use_skill.data.auto_log === 1) {
                log = {
                    text: '#UseSkill1',
                    values: [
                        { type: 'player', value: this.context.from?.playerId },
                        {
                            type: 'string',
                            value: this.use_skill.skill?.data.attached_equip
                                ? 'equip_skill'
                                : 'general_skill',
                        },
                        {
                            type: 'string',
                            value: this.use_skill.skill?.name,
                        },
                    ],
                };
            }
            else if (this.use_skill.data.auto_log === 2) {
                log = {
                    text: '#UseSkill2',
                    values: [
                        { type: 'player', value: this.context.from?.playerId },
                        {
                            type: 'string',
                            value: this.use_skill.skill?.data.attached_equip
                                ? 'equip_skill'
                                : 'general_skill',
                        },
                        {
                            type: 'string',
                            value: this.use_skill.skill?.name,
                        },
                        {
                            type: '[player]',
                            value: this.room.getPlayerIds(this.context.targets),
                        },
                    ],
                };
            }
        }
        this.room.broadcast({
            type: 'MsgPlayFaceAni',
            player: this.context.from?.playerId,
            ani,
            data: { name: this.use_skill.skill?.name },
            audio: audio,
            log,
        });
        if (this.use_skill.hasTag(5 /* SkillTag.Limit */) &&
            !this.use_skill.data.exclues_limitAni) {
            this.room.broadcast({
                type: 'MsgPlayGlobalAni',
                ani: 'limit',
                data: {
                    player: this.context.from.playerId,
                    general: this.use_skill.skill.sourceGeneral?.id ??
                        this.context.from.head.id,
                    skill: this.use_skill.skill.id,
                },
                log,
            });
            if (this.use_skill.player) {
                const visible = this.use_skill.isOpen();
                this.use_skill.player.setMark(`@limit:${this.use_skill.id}`, '@limit-false', {
                    type: 'img',
                    visible: visible
                        ? true
                        : [this.use_skill.player.playerId],
                    url: '@limit-false',
                });
            }
            await this.room.delay(3);
        }
        if (this.use_skill.data.auto_directline !== 0) {
            this.room.directLine(this.context.from, this.context.targets, this.use_skill.data.auto_directline);
        }
        if (this.use_skill.isArray && this.use_skill.player) {
            if (this.use_skill.hasTag(7 /* SkillTag.Array_Quene */)) {
                this.room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: this.use_skill.player.playerId,
                    ani: 'array',
                    data: { type: 'quene' },
                });
            }
            if (this.use_skill.hasTag(8 /* SkillTag.Array_Siege */)) {
                this.room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: this.use_skill.player.playerId,
                    ani: 'array',
                    data: { type: 'siege' },
                });
            }
        }
        const general = this.use_skill.skill &&
            this.use_skill.skill.getData('huashen_source');
        const huashen = !!general;
        //国战化身耦合-设置当前触发时机已发动过
        if (huashen) {
            this.source.data[`wars.huashen.${this.source.trigger}`] = true;
            this.room.setData(`huashen_cost_${general.id}`, true);
        }
        const cost = await this.use_skill.data.cost.call(this.use_skill, this.room, this.source, this.context);
        if (huashen) {
            //展示化身
            this.room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [general.id],
                        fromArea: this.use_skill.skill.player?.handArea.areaId ??
                            this.context.from.handArea.areaId,
                        toArea: this.room.processingArea.areaId,
                        movetype: 1 /* CardPut.Up */,
                        puttype: 1 /* CardPut.Up */,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                    },
                ],
            });
        }
        if (Boolean(cost)) {
            this.context.cost = cost;
            this.used = true;
            await this.room.trigger("BeCost" /* EventTriggers.BeCost */, this);
            await this.use_skill.data.effect.call(this.use_skill, this.room, this.source, this.context);
            //国战化身耦合-将化身牌置入弃牌堆
            if (huashen) {
                //移除化身
                await this.room.removeWarsHuashen(this.use_skill.skill.player, general, this.use_skill.skill.options.source);
                this.room.removeData(`huashen_cost_${general.id}`);
            }
        }
    }
}
exports.UseSkillEvent = UseSkillEvent;
class ObtainSkillData extends data_1.EventData {
}
exports.ObtainSkillData = ObtainSkillData;
