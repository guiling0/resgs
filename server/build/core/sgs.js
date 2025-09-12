"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sgs = void 0;
const package_1 = require("./package");
const utils_1 = require("./utils");
const card_1 = require("./card/card");
const icard_1 = require("./card/icard");
const custom_1 = require("./custom/custom");
const general_1 = require("./general/general");
const room_1 = require("./room/room");
const room_broadcast_1 = require("./room/mixins/room.broadcast");
const room_player_1 = require("./room/mixins/room.player");
const lodash_1 = __importDefault(require("lodash"));
const room_general_1 = require("./room/mixins/room.general");
const room_skill_1 = require("./room/mixins/room.skill");
const player_1 = require("./player/player");
const skill_types_1 = require("./skill/skill.types");
const room_history_1 = require("./room/mixins/room.history");
const room_handle_1 = require("./room/mixins/room.handle");
const room_choose_1 = require("./room/mixins/room.choose");
const room_json_1 = require("./room/mixins/room.json");
const room_card_1 = require("./room/mixins/room.card");
const vcard_1 = require("./card/vcard");
const event_move_1 = require("./event/types/event.move");
const skill_1 = require("./skill/skill");
const effect_1 = require("./skill/effect");
const event_state_1 = require("./event/types/event.state");
const event_turn_1 = require("./event/types/event.turn");
const event_use_1 = require("./event/types/event.use");
const event_die_1 = require("./event/types/event.die");
const event_watch_1 = require("./event/types/event.watch");
const event_play_1 = require("./event/types/event.play");
const event_damage_1 = require("./event/types/event.damage");
const event_judge_1 = require("./event/types/event.judge");
const event_hp_1 = require("./event/types/event.hp");
const event_skill_1 = require("./event/types/event.skill");
class RESGS {
    static getInstance() {
        if (!this.instance) {
            this.instance = new RESGS();
        }
        return this.instance;
    }
    static loadScript_Dev(name) {
        const pkg = name.split('@')[0];
        require(`../extensions/${pkg}/index`);
        exports.sgs.extensions.push(name);
    }
    constructor() {
        this.side = 'preview';
        this.lang = 'zh_CN';
        /** 工具函数 */
        this.utils = utils_1.Utils;
        /** 所有数据类型 */
        this.DataType = {
            GameCard: card_1.GameCard,
            GamePlayer: player_1.GamePlayer,
            General: general_1.General,
            TurnEvent: event_turn_1.TurnEvent,
            PhaseEvent: event_turn_1.PhaseEvent,
            NeedUseCardData: event_use_1.NeedUseCardData,
            PreUseCardData: event_use_1.PreUseCardData,
            UseCardEvent: event_use_1.UseCardEvent,
            UseCardToCardEvent: event_use_1.UseCardToCardEvent,
            UseCardSpecialEvent: event_use_1.UseCardSpecialEvent,
            NeedPlayCardData: event_play_1.NeedPlayCardData,
            PlayCardEvent: event_play_1.PlayCardEvent,
            MoveCardEvent: event_move_1.MoveCardEvent,
            PutToCardsData: event_move_1.PutToCardsData,
            OpenEvent: event_state_1.OpenEvent,
            CloseEvent: event_state_1.CloseEvent,
            RemoveEvent: event_state_1.RemoveEvent,
            DamageEvent: event_damage_1.DamageEvent,
            ReduceHpEvent: event_damage_1.ReduceHpEvent,
            DyingEvent: event_die_1.DyingEvent,
            DieEvent: event_die_1.DieEvent,
            JudgeEvent: event_judge_1.JudgeEvent,
            WatchHandData: event_watch_1.WatchHandData,
            WatchGeneralData: event_watch_1.WatchGeneralData,
            DrawCardsData: event_move_1.DrawCardsData,
            RecoverHpEvent: event_hp_1.RecoverHpEvent,
            UseSkillEvent: event_skill_1.UseSkillEvent,
            LoseHpEvent: event_damage_1.LoseHpEvent,
            ChangeMaxHpEvent: event_hp_1.ChangeMaxHpEvent,
            GiveCardsData: event_move_1.GiveCardsData,
            ChainEvent: event_state_1.ChainEvent,
            DropCardsData: event_move_1.DropCardsData,
            StateChangeEvent: event_state_1.StateChangeEvent,
            ChangeEvent: event_state_1.ChangeEvent,
            SkipEvent: event_state_1.SkipEvent,
        };
        this.coreLoaded = false;
        this.extensions = [];
        this.gamecardids = 0;
        this.effctids = 0;
        /** 所有扩展包 */
        this.packages = new Map();
        /** 所有模式 */
        this.modes = new Map();
        /** 所有游戏牌 */
        this.cards = new Map();
        /** 所有武将牌 */
        this.generals = new Map();
        /** 所有卡牌使用技能 */
        this.cardskills = new Map();
        /** 技能 */
        this.skills = [];
        /** 效果 */
        this.effects = [];
        this.common_rules = new Map();
        this.card2datas = {};
        /** 珠联璧合关系 */
        this.relationships = [];
        /** 翻译表 */
        this.translations = {};
        /** 游戏内显示的概念讲解。以翻译中出现对应的key值关键词为准 */
        this.concept = {};
        /** 武将资源映射表 */
        this.generalAssets = {};
        /** 技能资源映射表 */
        this.skillAssets = {};
    }
    get version() {
        return '1.0.0';
    }
    init(side, loadp) {
        if (this.coreLoaded) {
            console.log('The core library has already been initialized');
            return;
        }
        globalThis.sgs = RESGS.getInstance();
        globalThis.lodash = lodash_1.default;
        this.side = side;
        //mixins
        utils_1.Utils.mixins(card_1.GameCard, [icard_1.ICard, custom_1.Custom]);
        utils_1.Utils.mixins(vcard_1.VirtualCard, [icard_1.ICard]);
        utils_1.Utils.mixins(general_1.General, [custom_1.Custom]);
        utils_1.Utils.mixins(player_1.GamePlayer, [custom_1.Custom]);
        utils_1.Utils.mixins(room_1.GameRoom, [
            custom_1.Custom,
            room_broadcast_1.RoomBroadCastMixin,
            room_player_1.RoomPlayerMixin,
            room_general_1.RoomGeneralMixin,
            room_skill_1.RoomSkillMixin,
            room_history_1.RoomHistoryMixin,
            room_handle_1.RoomHandleMixin,
            room_choose_1.RoomChooseMixin,
            room_json_1.RoomJsonMixin,
            room_card_1.RoomCardMixin,
        ]);
        utils_1.Utils.mixins(skill_1.Skill, [custom_1.Custom]);
        utils_1.Utils.mixins(effect_1.Effect, [custom_1.Custom]);
        //默认游戏规则
        const rules = this.Skill({
            name: 'default_rules',
        });
        //默认游戏模式
        this.modes.set('default', this.GameMode({
            name: 'default',
            maxPlayer: 2,
            rules,
            settings: [],
        }));
        this.loadPackage = loadp;
        this.coreLoaded = true;
        //手动加载所有包
        if (this.side === 'preview') {
            require(`../extensions/standard/index`);
            require(`../extensions/shenhua/index`);
            require(`../extensions/yijiang/index`);
            require(`../extensions/mlongxuexuanhuang/index`);
            require(`../extensions/mxiuliqiankun/index`);
            require(`../extensions/wars/index`);
            require(`../extensions/doudizhu/index`);
            require(`../extensions/lang/index`);
        }
    }
    /** 复制一个数据 */
    copy(data, new_data) {
        if (new_data) {
            return Object.assign(lodash.cloneDeep(data), lodash.cloneDeep(new_data));
        }
        else {
            return lodash.cloneDeep(data);
        }
    }
    /** 创建一个扩展包 */
    Package(name) {
        if (this.packages.has(name)) {
            console.log(`The package:${name} already exists and will be overwritten`);
        }
        const pkg = new package_1.Package(name);
        this.packages.set(name, pkg);
        return pkg;
    }
    /** 创建一张游戏牌 */
    GameCard({ name, suit = 0 /* CardSuit.None */, number = -1 /* CardNumber.None */, attr = [], derived = false, }) {
        const card = {
            id: `00${this.gamecardids++}`,
            name,
            suit,
            number,
            attr,
            derived,
            package: 'defalut',
        };
        this.cards.set(card.id, card);
        return card;
    }
    /** 创建一张武将牌 */
    General({ name = 'sb', kingdom = 'none', hp = 4, gender = 0 /* Gender.None */, skills = [], lord = false, enable = true, hidden = false, isDualImage = false, isWars = false, }) {
        const general = {
            id: name,
            name,
            kingdom,
            hp,
            gender,
            skills,
            lord,
            enable,
            hidden,
            package: [],
            isDualImage,
            isWars,
        };
        if (this.generals.get(general.id)) {
            console.log('重复的武将牌：', general.id);
        }
        this.generals.set(general.id, general);
        return Object.assign(general, {
            addSkill: (skill, derivative = false) => {
                if (typeof skill === 'string') {
                    general.skills.push(derivative ? `#${skill}` : skill);
                }
                else {
                    general.skills.push(derivative ? `#${skill.name}` : skill.name);
                    if (!this.skills.includes(skill)) {
                        this.skills.push(skill);
                    }
                }
            },
        });
    }
    /** 创建一个游戏模式 */
    GameMode({ name = 'default', maxPlayer = 2, settings = [], rules = 'default_rules', mainProcess, }) {
        if (this.modes.get(name)) {
            console.log(`The mode:${name} already exists and will be overwritten`);
        }
        const mode = {
            name,
            maxPlayer,
            settings,
            rules: typeof rules === 'string' ? rules : rules.name,
            mainProcess,
        };
        this.modes.set(name, mode);
        return mode;
    }
    /** 创建一个卡牌使用技能 */
    CardUse({ name = 'sha', method = 1, trigger = "None" /* EventTriggers.None */, sameTime = false, effects = [], prompt = function () {
        return {
            prompt: `@${this.name}`,
            thinkPrompt: `@@${this.name}`,
        };
    }, condition = function () {
        return true;
    }, timeCondition = function () {
        return Infinity;
    }, distanceCondition = function () {
        return true;
    }, target, onuse = async function () { }, effect = async function () { }, }) {
        const key = `${name}.${method}`;
        if (this.cardskills.has(key)) {
            console.log(`The carduse:${key} already exists and will be overwritten`);
        }
        const skill = {
            name,
            method,
            trigger,
            sameTime,
            effects,
            prompt,
            condition,
            timeCondition,
            distanceCondition,
            target,
            onuse,
            effect,
        };
        this.cardskills.set(key, skill);
        return Object.assign(skill, {
            addEffect: (effect) => {
                if (typeof effect === 'string') {
                    skill.effects.push(effect);
                }
                else {
                    if (!effect.name)
                        effect.name = `${skill.name}${skill.method}${skill.effects.length}`;
                    skill.effects.push(effect.name);
                }
            },
        });
    }
    /** 创建一个装备卡牌的使用技能 */
    CardUseEquip({ name = 'sha', effects = [], condition = function () {
        return true;
    }, timeCondition = function () {
        return Infinity;
    }, distanceCondition = function () {
        return true;
    }, onuse = async function () { }, }) {
        return this.CardUse({
            name,
            method: 1,
            trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
            effects,
            prompt: function (room, from, card) {
                return {
                    prompt: `@${card.name}`,
                    thinkPrompt: `@@${card.name}`,
                };
            },
            condition,
            timeCondition,
            distanceCondition,
            target: function (room, from, card) {
                return {
                    type: 'player',
                    count: 1,
                    filter: function (item, seletcted) {
                        return from === item;
                    },
                    auto: true,
                };
            },
            onuse,
            effect: async function () { },
        });
    }
    /** 创建一个技能 */
    Skill({ name, audio, condition = function () {
        return true;
    }, global = function () {
        return false;
    }, visible = function () {
        return true;
    }, attached_kingdom, attached_equip, effects = [], regard_skills = [], }) {
        const skill = {
            name,
            audio,
            condition,
            global,
            visible,
            attached_kingdom,
            attached_equip,
            effects,
            regard_skills,
        };
        this.skills.push(skill);
        return Object.assign(skill, {
            addEffect: (effect) => {
                if (typeof effect === 'string') {
                    skill.effects.push(effect);
                }
                else {
                    if (!effect.name)
                        effect.name = `${skill.name}${skill.effects.length}`;
                    skill.effects.push(effect.name);
                    if (!this.effects.includes(effect)) {
                        this.effects.push(effect);
                    }
                }
            },
        });
    }
    /** 创建一个触发效果 */
    TriggerEffect({ name, tag = [], mark = [], regard_skill, priorityType = 1 /* PriorityType.General */, trigger = "None" /* EventTriggers.None */, anim = 'text', audio, auto_sort = true, auto_log = 0, auto_directline = 0, exclues_limitAni = false, forced = 'mute', getSelectors = function () {
        return {};
    }, can_trigger = function () {
        return false;
    }, context, cost = async function () {
        return true;
    }, effect = async function () { }, lifecycle = [], }) {
        const e = {
            name,
            tag,
            mark,
            regard_skill,
            type: skill_types_1.EffectType.Trigger,
            priorityType,
            trigger,
            anim,
            audio,
            auto_sort,
            auto_log,
            auto_directline,
            exclues_limitAni,
            forced,
            getSelectors,
            can_trigger,
            context,
            cost,
            effect,
            lifecycle,
        };
        this.effects.push(e);
        return e;
    }
    /** 创建一个状态效果 */
    StateEffect(data) {
        const e = Object.assign({}, data, {
            type: skill_types_1.EffectType.State,
        });
        if (!e.lifecycle) {
            e.lifecycle = [];
        }
        if (!e.tag) {
            e.tag = [];
        }
        if (!e.mark) {
            e.mark = [];
        }
        this.effects.push(e);
        return e;
    }
    /** 获取一个扩展包 */
    getPackage(name) {
        return this.packages.get(name);
    }
    /** 获取一个游戏模式 */
    getGameMode(name) {
        return this.modes.get(name) ?? this.modes.get('default');
    }
    /** 获取一个技能 */
    getSkill(name) {
        return this.skills.find((v) => v.name === name);
    }
    getSkillByEquip(name) {
        return this.skills.find((v) => v.attached_equip === name);
    }
    /** 获取一个效果 */
    getEffect(name) {
        return this.effects.find((v) => v.name === name);
    }
    /** 获取一个卡牌使用技能 */
    getCardUse(name, method = 1) {
        return this.cardskills.get(`${name}.${method}`);
    }
    /** 获取一张卡牌的所有使用技能 */
    getCardUseFromName(name) {
        const result = [];
        this.cardskills.forEach((v) => {
            if (v.name === name)
                result.push(v);
        });
        return result;
    }
    setCardData(card, { type = 1 /* CardType.Basic */, subtype = 1 /* CardSubType.Basic */, damage = false, recover = false, length = 1, rhyme = 'a', } = {}) {
        this.card2datas[card] = arguments[1];
    }
    setRelationship(id1, id2) {
        this.relationships.push([id1, id2]);
    }
    loadTranslation(ts = {}, lang = this.lang) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        for (let key in ts) {
            this.translations[lang][key] = ts[key];
        }
    }
    getTranslation(source, lang = this.lang) {
        if (!source)
            return '';
        return this.translations[lang]?.[source] ?? source;
    }
    loadConcept(ts = {}, lang = this.lang) {
        if (!this.concept[lang]) {
            this.concept[lang] = {};
        }
        for (let key in ts) {
            this.concept[lang][key] = ts[key];
        }
    }
    getConcept(source, lang = this.lang) {
        if (!source)
            return '';
        return this.concept[lang]?.[source] ?? source;
    }
    GeneralAssetMapping(key, map) {
        const name = typeof key === 'string' ? key : key.name;
        const tureName = name.split('.').at(-1);
        let oldmap = this.generalAssets[name];
        const defalut_dual = `generals/${tureName}/image.dual`;
        const defalut_self = `generals/${tureName}/image.dual/self`;
        const { extensions_url = oldmap?.extensions_url, image = oldmap?.image ?? `generals/${tureName}/image`, image_dual = oldmap?.image_dual ?? defalut_dual, image_self = oldmap?.image_self ?? defalut_self, death = oldmap?.death ?? `generals/${tureName}/death`, } = map;
        this.generalAssets[name] = {
            extensions_url,
            image,
            image_dual,
            image_self,
            death,
        };
    }
    SkillAssetMapping(key, map) {
        const name = typeof key === 'string' ? key : key.name;
        let oldmap = this.skillAssets[name];
        const { audios = oldmap?.audios ?? [] } = map;
        this.skillAssets[name] = {
            audios,
        };
    }
    /** 武将信息 */
    loadGeneralTranslation(general, data = {}) {
        const name = typeof general === 'string' ? general : general.name;
        const { version, title, prefix, painter, cv, script, rs, extensions_url, death_audio, image_url, image_dual_url, image_self_url, death_url, skills, skins, } = data;
        this.loadTranslation({
            [`@title:${name}`]: title,
            [`@prefix:${name}`]: prefix,
            [`@painter:${name}`]: painter,
            [`@cv:${name}`]: cv,
            [`@rs:${name}`]: rs,
            [`@script:${name}`]: script,
            [`@death:${name}`]: death_audio,
            [`@version:${name}`]: version,
        });
        this.GeneralAssetMapping(general, {
            extensions_url: extensions_url,
            image: image_url,
            death: death_url,
            image_dual: image_dual_url,
            image_self: image_self_url,
        });
        //技能部分
        if (skills) {
            for (const key in skills) {
                this.loadSkillTranslation(key, skills[key]);
            }
        }
        //皮肤部分
        if (skins) {
            // this.AssetMapping(general, {
            //     skins,
            // });
            //皮肤名称
            //@skinname_{皮肤ID}:{武将名}
            //皮肤死亡
            //@skindeath_{皮肤ID}:{武将名}
            //皮肤配音翻译
            //@skinaudio{原皮配音序号}_{皮肤ID}:{技能名}
        }
    }
    loadSkillTranslation(skill, data = {}) {
        const name = typeof skill === 'string' ? skill : skill.name;
        this.loadTranslation({
            [name]: data.name,
            [`@desc:${name}`]: data.desc,
            [`@desc2:${name}`]: data.desc2,
        });
        const audio_urls = [];
        data.audios?.forEach((v, i) => {
            this.loadTranslation({
                [`@audio${i}:${name}`]: v.lang,
            });
            audio_urls.push(v.url);
        });
        this.SkillAssetMapping(skill, { audios: audio_urls });
    }
    cac_skill(skill) {
        return `是否发动技能[b]${this.getTranslation(skill)}[/b]`;
    }
}
exports.sgs = RESGS.getInstance();
