/**
 * 创建新扩展——复制 resgs-ext-temp 模板，排除测试脚本（保留 setup）与模板文件（cards/**、generals/** 保留 index.ts）。
 *
 * 用法：npx tsx scripts/create-ext.ts <扩展名>
 */

import { cpSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'extension', 'resgs-ext-temp');
const name = process.argv[2];

if (!name) {
    console.error('用法：npx tsx scripts/create-ext.ts <扩展名>');
    process.exit(1);
}

// 扩展名校验：小写字母开头，含小写字母/数字/连字符
if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error(`扩展名非法：${name}（仅允许小写字母开头，含小写字母/数字/连字符）`);
    process.exit(1);
}

const DEST = join(ROOT, 'extension', name);
if (existsSync(DEST)) {
    console.error(`扩展目录已存在：${DEST}`);
    process.exit(1);
}
if (!existsSync(SRC)) {
    console.error(`模板目录不存在：${SRC}`);
    process.exit(1);
}

// ===== 1. 复制模板（filter 排除测试脚本与模板文件，不复制即无需删除） =====
cpSync(SRC, DEST, {
    recursive: true,
    filter: (src: string) => {
        const rel = src.slice(SRC.length).replace(/\\/g, '/');
        // 排除类型构建临时目录
        if (rel.includes('/.dts-tmp')) return false;
        // 排除测试脚本（保留 setup.ts）
        if (rel.startsWith('/test/')) return rel.endsWith('/setup.ts');
        // 排除卡牌模板文件
        if (rel.startsWith('/pkg/cards')) return false;
        // 排除武将模板文件（保留 generals/index.ts）
        if (rel.startsWith('/pkg/generals/')) return rel.endsWith('/pkg/generals/index.ts');
        return true;
    },
});
console.log(`[create-ext] 已复制模板 → ${DEST}`);

// ===== 2. 清理 pkg/index.ts 中对已排除模板文件的引用 =====
const pkgIndex = join(DEST, 'pkg', 'index.ts');
if (existsSync(pkgIndex)) {
    let content = readFileSync(pkgIndex, 'utf-8')
        .replace(/^import\s+['"]\.\/cards\/[^'"]+['"];\s*$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    writeFileSync(pkgIndex, content + '\n');
}

// ===== 3. 清空 generals/index.ts 的模板引用 =====
const generalsIndex = join(DEST, 'pkg', 'generals', 'index.ts');
if (existsSync(generalsIndex)) {
    writeFileSync(
        generalsIndex,
        `/**
 * 组织所有武将扩展包。
 * 每个大包被分为若干子包（如标准包 → 魏/蜀/吴/群），
 * 子包下每个文件导出该武将的 GeneralData。
 */

// TODO: 在此导入武将并注册扩展包
sgs.GeneralPackage('standard', [
    { name: 'standard.wei', generals: [] },
    { name: 'standard.shu', generals: [] },
    { name: 'standard.wu', generals: [] },
    { name: 'standard.qun', generals: [] },
]);
`,
    );
}

// ===== 4. 更新 index.ts 的 meta =====
const entry = join(DEST, 'index.ts');
if (existsSync(entry)) {
    let content = readFileSync(entry, 'utf-8');
    content = content
        .replace(/@name\s+.*/, `@name ${name}`)
        .replace(/@description\s+.*/, '@description 新建扩展')
        .replace(/name:\s*'[^']*'/, `name: '${name}'`)
        .replace(/description:\s*'[^']*'/, "description: '新建扩展'");
    writeFileSync(entry, content);
}

// ===== 5. 更新 package.json name =====
const pkgFile = join(DEST, 'package.json');
if (existsSync(pkgFile)) {
    const data = JSON.parse(readFileSync(pkgFile, 'utf-8'));
    data.name = name;
    writeFileSync(pkgFile, JSON.stringify(data, null, 4) + '\n');
}

console.log(`[create-ext] ✅ 扩展 ${name} 创建完成`);
console.log(`   目录：${DEST}`);
console.log('   下一步：在 pkg/cards、pkg/generals 中编写内容，并更新 index.ts meta');
