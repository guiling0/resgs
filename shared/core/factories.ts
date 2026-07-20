/**
 * 直接创建方法——sgs.General(data) / sgs.CardConfig(data) / sgs.GameCard() 等。
 * Input 类型 = Partial<Data> & Pick<Data, 必填键>，字段增减时自动跟随。
 */
import type { CardData, GameCardData } from './card/CardTypes';
import type { GeneralData } from './general/GeneralType';
import type { GameMode } from './room/GameMode';
import type { CardPackData, GeneralPackData } from './packs/types';
import type { SkillData, EffectData } from './skill/SkillTypes';
import { GeneralBuilder } from './general/builder/GeneralBuilder';
import { CardBuilder } from './card/builder/CardBuilder';
import { ModeBuilder } from './room/builder/ModeBuilder';
import { SkillBuilder } from './skill/builder/SkillBuilder';
import { EffectBuilder } from './skill/builder/EffectBuilder';

// ===== 扩展上下文（由加载器在导入扩展前自动注入） =====

let _currentExtName = '';

export function setExtensionContext(name: string): void {
    _currentExtName = name;
}

// ===== 实体牌 ID 计数器（按扩展名分组） =====

const _cardCounters = new Map<string, number>();

/**
 * 为实体牌分配 ID（{扩展名}.{自增序号}）并批量注册到 sgs.cards。
 * 扩展名自动注入——加载器在导入扩展前调用 setExtensionContext()。
 * 不同扩展独立计数，不依赖加载顺序。
 */
export function registerCards(cards: GameCardData[]): GameCardData[] {
    const extName = _currentExtName;
    let counter = _cardCounters.get(extName) ?? 1;
    for (const card of cards) {
        if (!card.id) card.id = `${extName}.${counter++}`;
        if (sgs.cards.has(card.id)) {
            console.warn(`[registerCards] 实体牌 "${card.id}" 已存在——跳过`);
            continue;
        }
        sgs.cards.set(card.id, card);
    }
    _cardCounters.set(extName, counter);
    return cards;
}

/** 注册卡牌扩展包——内部调用 registerCards + sgs.cardpacks.set */
export function CardPackage(name: string, cards: GameCardData[]): CardPackData {
    registerCards(cards);
    const data: CardPackData = { name, cards };
    sgs.cardpacks.set(name, data);
    return data;
}

/** 注册武将扩展包 → sgs.generalpacks */
export function GeneralPackage(
    name: string,
    subpacks: GeneralPackData['subpacks'],
): GeneralPackData {
    const data: GeneralPackData = { name, subpacks };
    sgs.generalpacks.set(name, data);
    return data;
}

// ===== CardConfig（卡牌类型信息 → sgs.carddatas，增量覆盖） =====

export type CardConfigInput = Partial<CardData> & Pick<CardData, 'name'>;

export function CardConfig(input: CardConfigInput): CardData {
    const existing = sgs.carddatas.get(input.name);
    const defaults: CardData = {
        name: input.name, type: 1 as any, subtype: 1 as any,
        damage: false, recover: false, length: input.name.length,
        rhyme: '', score: [0, 0, 0], acronym: input.name[0] || '', equiptip: '',
    };
    const data: CardData = { ...(existing ?? defaults), ...input };
    sgs.carddatas.set(input.name, data);
    return data;
}

// ===== GameCard（构建实体牌数据，不注册——统一由 registerCards 注册） =====

export type GameCardInput = Partial<GameCardData>;

export function GameCard(input: GameCardInput = {}): GameCardData {
    const name = input.name || 'sha';
    const b = CardBuilder(name);
    if (input.suit !== undefined) b.suit(input.suit);
    if (input.number !== undefined) b.number(input.number);
    if (input.attr !== undefined) b.attr(input.attr);
    if (input.derived !== undefined) b.derived(input.derived);
    return b.build();
}

// ===== General =====

export type GeneralInput = Partial<GeneralData> & Pick<GeneralData, 'name'>;

export function General(input: GeneralInput): GeneralData {
    const b = GeneralBuilder(input.name);
    if (input.kingdom !== undefined) b.kingdom(input.kingdom);
    if (input.hp !== undefined) b.hp(input.hp);
    if (input.gender !== undefined) b.gender(input.gender);
    if (input.skills !== undefined) b.skills(input.skills);
    if (input.lord !== undefined) b.lord(input.lord);
    if (input.enable !== undefined) b.enable(input.enable);
    if (input.hidden !== undefined) b.hidden(input.hidden);
    if (input.isWars !== undefined) b.isWars(input.isWars);
    if (input.rs !== undefined) b.rs(input.rs);
    return b.register();
}

// ===== GameMode =====

export type GameModeInput = Partial<GameMode> & Pick<GameMode, 'name'>;

export function GameMode(input: GameModeInput): GameMode {
    const b = ModeBuilder(input.name);
    if (input.maxPlayer !== undefined) b.maxPlayer(input.maxPlayer);
    if (input.isTeamMode !== undefined) b.isTeamMode(input.isTeamMode);
    if (input.settings !== undefined) b.settings(input.settings);
    if (input.rules !== undefined) b.rules(input.rules);
    if (input.beforeStart !== undefined) b.beforeStart(input.beforeStart);
    if (input.mainProcess !== undefined) b.mainProcess(input.mainProcess);
    return b.register();
}

// ===== Skill =====

export type SkillInput = Partial<SkillData> & Pick<SkillData, 'name'>;

export function Skill(input: SkillInput): SkillData {
    const b = SkillBuilder(input.name);
    if (input.data !== undefined) b.data = input.data;
    if (input.is_rule !== undefined) b.is_rule = input.is_rule;
    if (input.is_lord !== undefined) b.is_lord = input.is_lord;
    if (input.attached_equip !== undefined) b.attached_equip = input.attached_equip;
    if (input.attached_kingdom !== undefined) b.attached_kingdom = input.attached_kingdom;
    return b.register();
}

// ===== Effect =====

export type EffectInput = Pick<Partial<EffectData>, 'tag' | 'priority' | 'condition'>
    & { name: string; skillName: string };

export function Effect(input: EffectInput): EffectData {
    const b = EffectBuilder(input.name);
    if (input.tag !== undefined) b.tag = input.tag;
    if (input.priority !== undefined) b.priority = input.priority;
    if (input.condition !== undefined) b.condition(input.condition);
    return b.register(input.skillName);
}
