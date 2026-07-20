/**
 * 扫描 extension/ 目录下所有扩展，生成 registry.ts（自动 re-export）。
 *
 * 用法：npx tsx scripts/build-registry.ts
 * 输出：extension/registry.ts
 */

import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const EXTENSION_DIR = join(__dirname, '..', 'extension');
const OUTPUT = join(EXTENSION_DIR, 'registry.ts');

// ===== 扫描扩展目录 =====
const entries = readdirSync(EXTENSION_DIR, { withFileTypes: true });
const extensions: string[] = [];

for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const indexPath = join(EXTENSION_DIR, entry.name, 'index.ts');
    try {
        // 检查 index.ts 是否存在
        readdirSync(join(EXTENSION_DIR, entry.name));
        if (
            require('fs').existsSync(indexPath)
        ) {
            extensions.push(entry.name);
        }
    } catch {
        // 跳过无法读取的目录
    }
}

console.log(`[build-registry] 发现 ${extensions.length} 个扩展:`);
for (const ext of extensions) {
    console.log(`  - ${ext}`);
}

// ===== 生成 registry.ts =====
const lines = [
    '// ===== 自动生成——勿手动编辑 =====',
    '// 生成命令：npx tsx scripts/build-registry.ts',
    `// 生成时间：${new Date().toISOString()}`,
    '',
];
for (const ext of extensions) {
    lines.push(`export * as ${toVarName(ext)} from './${ext}';`);
}
lines.push('');

writeFileSync(OUTPUT, lines.join('\n'), 'utf-8');
console.log(`\n[build-registry] ✅ 已生成 → ${OUTPUT}`);

/** 将目录名转为合法 JS 变量名 */
function toVarName(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9_$]/g, '_')
        .replace(/^(\d)/, '_$1');
}
