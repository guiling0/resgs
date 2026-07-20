/**
 * 打包单个扩展为独立 IIFE 文件（rollup）。
 * 浏览器通过 <script> 加载，扩展通过 sgs.* 全局对象访问核心 API。
 *
 * 用法：npx tsx scripts/build-extension.ts <extension-name>
 * 输出：extension/<name>/dist/<name>.js
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const extName = process.argv[2];

if (!extName) {
    console.error('用法: npx tsx scripts/build-extension.ts <extension-name>');
    console.error('示例: npx tsx scripts/build-extension.ts resgs-ext-temp');
    process.exit(1);
}

const EXT_DIR = join(ROOT, 'extension', extName);
const INPUT = join(EXT_DIR, 'index.ts');
const OUTPUT_DIR = join(EXT_DIR, 'dist');
const OUTPUT = join(OUTPUT_DIR, `${extName}.js`);

if (!existsSync(INPUT)) {
    console.error(`[build-extension] ❌ 入口文件不存在: ${INPUT}`);
    process.exit(1);
}

if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`[build-extension] 打包扩展: ${extName}`);
console.log(`  入口: ${INPUT}`);
console.log(`  输出: ${OUTPUT}`);

// ===== rollup 打包 =====
const rollupConfig = join(ROOT, 'scripts', 'rollup.extension.config.mjs');

try {
    execSync(
        `npx rollup --config "${rollupConfig}" --input "${INPUT}" --file "${OUTPUT}" --format iife --name "${toIIFEName(extName)}"`,
        {
            cwd: ROOT,
            stdio: 'inherit',
            env: { ...process.env, EXT_NAME: extName },
        },
    );
    console.log(`[build-extension] ✅ 打包完成 → ${OUTPUT}`);
} catch (err) {
    console.error(`[build-extension] ❌ 打包失败:`, err);
    process.exit(1);
}

/** 生成 IIFE 全局变量名 */
function toIIFEName(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/^(\d)/, '_$1');
}
