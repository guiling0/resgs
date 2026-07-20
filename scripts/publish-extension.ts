/**
 * 发布扩展——上传 assets/ 到 CDN（阿里云 OSS）。
 *
 * 用法：npx tsx scripts/publish-extension.ts <extension-name>
 *
 * TODO（第三方方案）：评估阿里云 RAM 子账号或 STS 临时授权方案，
 * 使第三方开发者无需主账号凭证即可上传。
 */

import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = resolve(__dirname, '..');
const extName = process.argv[2];

if (!extName) {
    console.error('用法: npx tsx scripts/publish-extension.ts <extension-name>');
    console.error('示例: npx tsx scripts/publish-extension.ts standard');
    process.exit(1);
}

const EXT_DIR = join(ROOT, 'extension', extName);
const ASSETS_DIR = join(EXT_DIR, 'assets');

if (!existsSync(EXT_DIR)) {
    console.error(`[publish-extension] ❌ 扩展目录不存在: ${EXT_DIR}`);
    process.exit(1);
}

console.log(`[publish-extension] 发布扩展: ${extName}`);

// ===== 1. 打包扩展 =====
console.log('[publish-extension] 正在打包...');
try {
    execSync(`npx tsx scripts/build-extension.ts ${extName}`, {
        cwd: ROOT,
        stdio: 'inherit',
    });
} catch {
    console.error('[publish-extension] ❌ 打包失败，终止发布');
    process.exit(1);
}

// ===== 2. 上传 CDN =====
if (existsSync(ASSETS_DIR)) {
    console.log('[publish-extension] 正在上传 assets 到 CDN...');
    const cdnBase = process.env.CDN_BASE || 'oss://resgs-res';
    const cdnPath = `${cdnBase}/extensions/${extName}/`;

    try {
        // 阿里云 CLI（开发环境安装：npm i -g @alicloud/ossutil）
        execSync(`ossutil cp -r "${ASSETS_DIR}/" "${cdnPath}" --update`, {
            cwd: ROOT,
            stdio: 'inherit',
        });
        console.log('[publish-extension] ✅ assets 上传完成');
    } catch {
        console.warn('[publish-extension] ⚠️  ossutil 未安装或上传失败——跳过 CDN 上传');
        console.warn('[publish-extension]    安装: npm i -g @alicloud/ossutil');
        console.warn('[publish-extension]    TODO: 第三方授权方案（STS 临时凭证）');
    }
} else {
    console.log('[publish-extension] ℹ️  无 assets 目录，跳过 CDN 上传');
}

// ===== 3. 生成发布清单 =====
console.log(`\n[public-extension] 发布清单:`);
console.log(`  扩展名: ${extName}`);
console.log(`  打包文件: extension/${extName}/dist/${extName}.js`);
if (existsSync(ASSETS_DIR)) {
    console.log(`  CDN 路径: ${process.env.CDN_BASE || 'oss://resgs-res'}/extensions/${extName}/`);
}
console.log('[publish-extension] ✅ 发布流程完成');
