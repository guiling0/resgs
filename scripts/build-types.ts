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
        skipLibCheck: true, declaration: true, emitDeclarationOnly: true,
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

import { TimingName, EventType, DamageType } from '../shared/core/event/EventTypes';
import { PriorityType, SkillTag, StateEffectType } from '../shared/core/skill/SkillTypes';
import {
    CardAttr, CardSuit, CardNumber, CardColor,
    CardType, CardSubType, EquipSubType, AreaType,
} from '../shared/core/card/CardTypes';
import { Phase } from '../shared/core/player/PlayerTypes';
import { SelectorType, PlayPhaseResult } from '../shared/core/select/SelectTypes';
import { Gender } from '../shared/core/general/GeneralType';

const enumNames = [
    'TimingName', 'EventType', 'DamageType',
    'PriorityType', 'SkillTag', 'StateEffectType',
    'CardAttr', 'CardSuit', 'CardNumber', 'CardColor',
    'CardType', 'CardSubType', 'EquipSubType', 'AreaType',
    'Phase', 'SelectorType', 'PlayPhaseResult', 'Gender',
];

const sgsBlock: string[] = [
    '',
    '// ===== sgs 全局对象 =====',
    '',
    'declare var sgs: {',
];
for (const name of enumNames) sgsBlock.push(`    ${name}: typeof ${name};`);
sgsBlock.push(
    '    SkillBuilder: typeof SkillBuilder;',
    '    EffectBuilder: typeof EffectBuilder;',
    '    GeneralBuilder: typeof GeneralBuilder;',
    '    CardBuilder: typeof CardBuilder;',
    '    ModeBuilder: typeof ModeBuilder;',
    '    General: typeof General;',
    '    CardConfig: typeof CardConfig;',
    '    GameCard: typeof GameCard;',
    '    GameMode: typeof GameMode;',
    '    Skill: typeof Skill;',
    '    Effect: typeof Effect;',
    '    CardPackage: typeof CardPackage;',
    '    GeneralPackage: typeof GeneralPackage;',
    '    registerCards: typeof registerCards;',
    '    setExtensionContext: typeof setExtensionContext;',
    '',
    '    skills: Map<string, any>; effects: Map<string, any>;',
    '    generals: Map<string, any>; generalAssets: Map<string, any>;',
    '    cards: Map<string, any>; carddatas: Map<string, any>;',
    '    cardpacks: Map<string, any>; generalpacks: Map<string, any>;',
    '    modes: Map<string, any>; selectors: Map<string, any>;',
    '    carduses: Map<string, any>; skillsAssets: Map<string, any>;',
    '    translations: Record<string, Record<string, string>>;',
    '};',
    '',
);

writeFileSync(OUT_FILE, [...header, ...body, ...sgsBlock].join('\n'), 'utf-8');

// ===== 清理 =====
rmSync(TMP_OUT, { recursive: true });
rmSync(TMP_CONFIG);

console.log(`[build-types] ✅ global.d.ts → ${OUT_FILE}  (${dtsFiles.length} 个源文件)`);
