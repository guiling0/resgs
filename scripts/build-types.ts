/**
 * 构建类型声明——从 shared/core 生成 .d.ts 到扩展模板目录。
 * 扩展开发者依赖这些声明获取 sgs.* 的类型补全。
 *
 * 用法：npx tsx scripts/build-types.ts [outputDir]
 */

import { execSync } from 'child_process';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const OUTPUT = process.argv[2] ?? join(ROOT, 'extension', 'resgs-ext-temp', 'types');

console.log('[build-types] 输出目录:', OUTPUT);

// ===== 生成 .d.ts 声明文件 =====
try {
    execSync(
        `npx tsc --declaration --emitDeclarationOnly --outDir "${OUTPUT}" -p tsconfig.json`,
        {
            cwd: ROOT,
            stdio: 'inherit',
        },
    );
    console.log('[build-types] ✅ .d.ts 生成完成 →', OUTPUT);
} catch (err) {
    console.error('[build-types] ❌ 生成失败:', err);
    process.exit(1);
}

// ===== 后处理：提取核心类型供扩展使用 =====
import { existsSync, mkdirSync, copyFileSync } from 'fs';

const CORE_TYPES = [
    'shared/core/skill/builder/SkillBuilder.d.ts',
    'shared/core/skill/builder/EffectBuilder.d.ts',
    'shared/core/general/builder/GeneralBuilder.d.ts',
    'shared/core/card/builder/CardBuilder.d.ts',
    'shared/core/room/builder/ModeBuilder.d.ts',
];

console.log('[build-types] 核心类型文件:');
for (const t of CORE_TYPES) {
    const src = join(OUTPUT, t);
    if (existsSync(src)) {
        console.log(`  ✅ ${t}`);
    } else {
        console.log(`  ⚠️  未找到: ${t}`);
    }
}
