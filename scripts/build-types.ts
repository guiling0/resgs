/**
 * 构建类型声明——tsc --declaration 生成全量 .d.ts → 聚合为 types/global.d.ts。
 *
 * 用法：npx tsx scripts/build-types.ts [outputDir]
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const OUTPUT = process.argv[2] ?? join(ROOT, 'extension', 'resgs-ext-temp', 'types');
const TMP_OUT = join(OUTPUT, '.dts-tmp');
const TMP_CONFIG = join(ROOT, '.tsconfig.build-types.json');
const OUT_FILE = join(OUTPUT, 'global.d.ts');

if (!existsSync(OUTPUT)) mkdirSync(OUTPUT, { recursive: true });
if (existsSync(TMP_OUT)) rmSync(TMP_OUT, { recursive: true });

// ===== 步骤 1：写入构建用 tsconfig（放 ROOT，include 用相对路径） =====

writeFileSync(TMP_CONFIG, JSON.stringify({
    compilerOptions: {
        target: 'ESNext', module: 'nodenext', moduleResolution: 'nodenext',
        strict: false, esModuleInterop: true, experimentalDecorators: true,
        useDefineForClassFields: false, skipLibCheck: true, declaration: true, emitDeclarationOnly: true,
        outDir: TMP_OUT, rootDir: 'shared',
        paths: {
            '@shared/*': ['./shared/*'],
            '@colyseus/schema': ['./server/node_modules/@colyseus/schema'],
            'lodash': ['./server/node_modules/@types/lodash'],
        },
    },
    include: ['shared/core/**/*.ts'],
}, null, 2), 'utf-8');

// ===== 步骤 2：tsc --declaration =====

console.log('[build-types] tsc --declaration（全量类型）...');
execSync(`npx tsc -p "${TMP_CONFIG}"`, { cwd: ROOT, stdio: 'pipe', timeout: 120000 });
console.log('[build-types] tsc 完成');

// ===== 步骤 3：收集 .d.ts =====

function collectDts(dir: string): string[] {
    const r: string[] = [];
    if (!existsSync(dir)) return r;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) r.push(...collectDts(p));
        else if (e.name.endsWith('.d.ts')) r.push(p);
    }
    return r;
}

const dtsFiles = collectDts(TMP_OUT);
console.log(`[build-types] 收集到 ${dtsFiles.length} 个 .d.ts`);

// ===== 步骤 4：去除 import/export → ambient + 聚合 =====

const header = [
    '/**',
    ' * sgs 全局类型声明（全量）。',
    ' * 由 scripts/build-types.ts 自动生成——勿手动编辑。',
    ` * 生成时间：${new Date().toISOString()}`,
    ` * 源文件：${dtsFiles.length} 个 .d.ts`,
    ' */',
    '',
];

const body: string[] = [];
const seen = new Set<string>();

for (const f of dtsFiles) {
    let content = readFileSync(f, 'utf-8')
        // 去掉 import 语句
        .replace(/^import\s+.*from\s+['"].*['"];?\s*$/gm, '')
        // 去掉 import type 语句
        .replace(/^import\s+type\s+.*from\s+['"].*['"];?\s*$/gm, '')
        // export → declare（保留接口/枚举/类型/类/函数）
        .replace(/^export\s+(default\s+)?/gm, 'declare ')
        // 去掉 /// <reference ... />
        .replace(/^\s*\/\/\/\s*<reference.*\/>\s*$/gm, '')
        // 空行去重
        .replace(/\n{3,}/g, '\n\n');

    if (seen.has(content)) continue;
    seen.add(content);
    body.push(content);
}

// ===== 步骤 5：追加 sgs 全局声明 =====

import { TimingName, EventType, DamageType } from '../shared/core/types/EventTypes';
import { EffectType, PriorityType, SkillTag, StateEffectType } from '../shared/core/types/SkillTypes';
import {
    CardAttr, CardSuit, CardNumber, CardColor,
    CardType, CardSubType, EquipSubType,
} from '../shared/core/types/CardTypes';
import { AreaType } from '../shared/core/types/AreaTypes';
import { Phase } from '../shared/core/types/PlayerTypes';
import { SelectorType, PlayPhaseResult } from '../shared/core/types/ChooseTypes';
import { Gender } from '../shared/core/types/GeneralTypes';
import { StrategyType } from '../shared/core/types/AITypes';
import { GameState } from '../shared/core/types/GameState';

const enumNames = [
    'TimingName', 'EventType', 'DamageType',
    'EffectType', 'PriorityType', 'SkillTag', 'StateEffectType',
    'CardAttr', 'CardSuit', 'CardNumber', 'CardColor',
    'CardType', 'CardSubType', 'EquipSubType', 'AreaType',
    'Phase', 'Gender', 'SelectorType', 'PlayPhaseResult',
    'StrategyType', 'GameState',
];

const sgsBlock: string[] = [
    '',
    '// ===== sgs 全局对象 =====',
    '',
    'declare var sgs: {',
];
for (const name of enumNames) sgsBlock.push(`    ${name}: typeof ${name};`);
sgsBlock.push(
    '    CardBuilder: typeof CardBuilder;',
    '    GeneralBuilder: typeof GeneralBuilder;',
    '    SkillBuilder: typeof SkillBuilder;',
    '    EffectBuilder: typeof EffectBuilder;',
    '    createCard: (input?: any) => any;',
    '    createGeneral: (input: any) => any;',
    '    createSkill: (input: any) => any;',
    '    createEffect: (input: any) => any;',
    '    GameCard: typeof GameCard;',
    '    VirtualCard: typeof VirtualCard;',
    '    General: typeof General;',
    '    Player: typeof Player;',
    '    Skill: typeof Skill;',
    '    Effect: typeof Effect;',
    '    TriggerEffect: typeof TriggerEffect;',
    '    StateEffect: typeof StateEffect;',
    '    Room: typeof Room;',
    '    Area: typeof Area;',
    '    ICard: typeof ICard;',
    '    Mark: typeof Mark;',
    '',
    '    modes: Map<string, GameModeData>; cardpacks: Map<string, any>;',
    '    cards: Map<string, any>; carddatas: Map<string, any>;',
    '    generalpacks: Map<string, any>; generals: Map<string, any>;',
    '    skills: Map<string, any>; effects: Map<string, any>;',
    '    cardAssets: Map<string, any>; generalInfoMap: Map<string, any>;',
    '    generalSkinMap: Map<string, any>;',
    '    carduses: CardUseData[];',
    '    translations: Record<string, Record<string, string>>;',
    '    concept: Record<string, Record<string, string>>;',
    '};',
    '',
);

writeFileSync(OUT_FILE, [...header, ...body, ...sgsBlock].join('\n'), 'utf-8');

// ===== 清理（rmSync recursive 在部分 Windows 环境不可靠，失败则残留，create-ext 会排除 .dts-tmp） =====
try { rmSync(TMP_OUT, { recursive: true, force: true }); } catch { /* 忽略 */ }
try { rmSync(TMP_CONFIG); } catch { /* 忽略 */ }

console.log(`[build-types] ✅ global.d.ts → ${OUT_FILE}  (${dtsFiles.length} 个源文件)`);
