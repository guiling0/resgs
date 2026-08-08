/**
 * kb:links — 生成三层链接的自动层（锚点链接）：
 * - generated/anchors.md：API 符号 → 源码位置（文件:行号）全量表
 * - generated/links/index.md：按 API 模块聚合的源码锚点导航
 * 语义链接（规则词条 → API 词条）由人工/半自动建立，不在本脚本内。
 */
const fs = require('fs');
const path = require('path');
const { GENERATED_DIR } = require('./kb-lib.cjs');

const ANCHORS_FILE = path.join(GENERATED_DIR, 'anchors.json');
const LINKS_DIR = path.join(GENERATED_DIR, 'links');

if (!fs.existsSync(ANCHORS_FILE)) {
    console.error('[kb:links] 缺少 anchors.json（请先运行 kb:api）');
    process.exit(1);
}

const anchors = JSON.parse(fs.readFileSync(ANCHORS_FILE, 'utf8'));
fs.mkdirSync(LINKS_DIR, { recursive: true });

// 按文件分组（文件 → 符号列表）
const byFile = new Map();
for (const a of anchors) {
    if (!byFile.has(a.file)) byFile.set(a.file, []);
    byFile.get(a.file).push(a);
}

// ===== generated/anchors.md：符号 → 源码位置全表 =====
{
    const lines = [
        '# 源码锚点（符号 → 位置）',
        '',
        '> 自动生成区（`kb:links`），勿手改。',
        '',
        '| 符号 | 类型 | 源码位置 |',
        '|---|---|---|',
    ];
    for (const a of [...anchors].sort((x, y) => (x.file === y.file ? x.line - y.line : x.file.localeCompare(y.file)))) {
        const anchor = `../../${a.file}#L${a.line}`;
        lines.push(`| ${a.name} | ${a.kind} | [${a.file}#L${a.line}](${anchor}) |`);
    }
    fs.writeFileSync(path.join(GENERATED_DIR, 'anchors.md'), lines.join('\n'), 'utf8');
}

// ===== generated/links/index.md：按模块导航 =====
{
    const lines = [
        '# 交叉链接索引',
        '',
        '> 自动生成区（`kb:links`），勿手改。',
        '',
        '## 源码锚点',
        '',
        '全部 API 符号 → 源码位置见 [anchors.md](../anchors.md)。',
        '',
        '## 按文件',
        '',
    ];
    for (const [file, syms] of [...byFile.entries()].sort()) {
        const anchor = `../../../${file}`;
        lines.push(`### [${file}](${anchor})`);
        lines.push('');
        for (const s of syms.sort((x, y) => x.line - y.line)) {
            lines.push(`- ${s.name}（L${s.line}）`);
        }
        lines.push('');
    }
    fs.writeFileSync(path.join(LINKS_DIR, 'index.md'), lines.join('\n'), 'utf8');
}

console.log(`[kb:links] 完成：anchors.md + links/index.md（${anchors.length} 个锚点）`);
