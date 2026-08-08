/**
 * kb:index — 生成全库文档清单索引（generated/index.md）。
 */
const fs = require('fs');
const { KNOWLEDGE_DIR, GENERATED_DIR, scanDocs } = require('./kb-lib.cjs');

const docs = scanDocs();

// 按顶层目录分组（根目录文件归入 "(根)"）
const groups = new Map();
for (const d of docs) {
    const top = d.rel.includes('/') ? d.rel.split('/')[0] : '(根)';
    if (!groups.has(top)) groups.set(top, []);
    groups.get(top).push(d);
}

const lines = [];
lines.push('# 知识库索引');
lines.push('');
lines.push('> 自动生成区（`kb:index`），勿手改。');
lines.push('');
for (const [top, list] of [...groups.entries()].sort()) {
    lines.push(`## ${top}/`);
    lines.push('');
    lines.push('| 文档 | 类型 | ID | 标签 |');
    lines.push('|---|---|---|---|');
    for (const d of [...list].sort((a, b) => a.rel.localeCompare(b.rel))) {
        const fm = d.fm || {};
        const title = fm.title || d.rel.replace(/\.md$/, '');
        const type = fm.type || '-';
        const id = fm.id || '-';
        const tags = Array.isArray(fm.tags) ? fm.tags.join(', ') : '-';
        lines.push(`| [${title}](${d.rel}) | ${type} | ${id} | ${tags} |`);
    }
    lines.push('');
}

fs.mkdirSync(GENERATED_DIR, { recursive: true });
fs.writeFileSync(`${GENERATED_DIR}/index.md`, lines.join('\n'));
console.log(`[kb:index] 生成 ${GENERATED_DIR}/index.md（${docs.length} 篇文档）`);
