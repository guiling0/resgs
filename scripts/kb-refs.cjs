/**
 * kb:refs — 规则词条引用区穷举聚合：
 * 1. 生成 generated/refs/index.md（全量聚合清单，勿手改）
 * 2. 将聚合结果写回规则文档的「引用区」区块（<!-- kb:refs:start --> 标记之间，可重建）
 */
const fs = require('fs');
const path = require('path');
const { KNOWLEDGE_DIR, GENERATED_DIR, scanDocs } = require('./kb-lib.cjs');

const REFS_DIR = path.join(GENERATED_DIR, 'refs');
const REFS_START = '<!-- kb:refs:start -->';
const REFS_END = '<!-- kb:refs:end -->';

/** 引用方类型 → 引用区小节 */
function refsSection(label, refs) {
    const lines = [`${label}：`];
    if (refs.length === 0) {
        lines.push('  （暂无）');
    } else {
        for (const r of refs.sort((a, b) => a.rel.localeCompare(b.rel))) {
            lines.push(`- [${r.title}](../../${r.rel})`);
        }
    }
    return lines;
}

/** 构建规则文档的引用区块 */
function buildRefsBlock(refs) {
    const api = refs.filter((r) => r.type === 'api');
    const ext = refs.filter((r) => ['card', 'general', 'mode', 'project'].includes(r.type));
    const guide = refs.filter((r) => r.type === 'guide');
    return [
        '## 引用区',
        '',
        ...refsSection('① API 实现', api),
        '',
        ...refsSection('② 扩展信息', ext),
        '',
        ...refsSection('③ 编写指南', guide),
        '',
    ].join('\n');
}

// 收集 id → 文档信息
const docs = scanDocs();
const idInfo = new Map();
for (const d of docs) {
    const id = d.fm && d.fm.id;
    if (!id) continue;
    idInfo.set(id, { rel: d.rel, title: d.fm.title || d.rel.replace(/\.md$/, ''), type: d.fm.type || '-' });
}

// 反向聚合：规则 id → 声明它的文档
const refMap = new Map();
for (const d of docs) {
    const rules = d.fm && d.fm.rules;
    if (!rules || !Array.isArray(rules)) continue;
    for (const r of rules) {
        if (!refMap.has(r)) refMap.set(r, []);
        refMap.get(r).push({
            rel: d.rel,
            title: d.fm.title || d.rel.replace(/\.md$/, ''),
            type: d.fm.type || '-',
        });
    }
}

fs.mkdirSync(REFS_DIR, { recursive: true });

const lines = [];
lines.push('# 规则词条引用聚合');
lines.push('');
lines.push('> 自动生成区（`kb:refs`），勿手改。');
lines.push('');
lines.push(`共聚合 ${refMap.size} 个被引用规则词条。`);
lines.push('');

let totalRefs = 0;
for (const [ruleId, refs] of [...refMap.entries()].sort()) {
    totalRefs += refs.length;
    const target = idInfo.get(ruleId);
    const targetLink = target ? `（目标：[\`${ruleId}\`](../../${target.rel})）` : '（⚠ 目标文档不存在）';
    lines.push(`## ${ruleId} ${targetLink}`);
    lines.push('');
    lines.push('| 引用方 | 类型 |');
    lines.push('|---|---|');
    for (const r of refs.sort((a, b) => a.rel.localeCompare(b.rel))) {
        lines.push(`| [${r.title}](../../${r.rel}) | ${r.type} |`);
    }
    lines.push('');
}

// 总索引
fs.writeFileSync(path.join(REFS_DIR, 'index.md'), lines.join('\n'), 'utf8');

// ===== 写回规则文档引用区 =====
let written = 0;
for (const [ruleId, refs] of refMap) {
    const target = idInfo.get(ruleId);
    if (!target || target.type !== 'event' && target.type !== 'term' && target.type !== 'definition') continue;
    const file = path.join(KNOWLEDGE_DIR, target.rel);
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    const block = buildRefsBlock(refs);

    const sIdx = content.indexOf(REFS_START);
    const eIdx = content.indexOf(REFS_END);
    if (sIdx >= 0 && eIdx >= 0) {
        // 替换旧引用区（标记之间）
        content = content.slice(0, sIdx) + REFS_START + '\n\n' + block + '\n\n' + REFS_END + content.slice(eIdx + REFS_END.length);
    } else if (sIdx >= 0 || eIdx >= 0) {
        console.warn(`[kb:refs] 引用区标记不完整，跳过: ${ruleId}`);
        continue;
    } else {
        // 追加到文档末尾
        content = content.trimEnd() + '\n\n' + REFS_START + '\n\n' + block + '\n\n' + REFS_END + '\n';
    }
    fs.writeFileSync(file, content, 'utf8');
    written++;
}
console.log(`[kb:refs] 完成：refs/index.md（${refMap.size} 个词条，${totalRefs} 条引用），写回 ${written} 个规则文档引用区`);
