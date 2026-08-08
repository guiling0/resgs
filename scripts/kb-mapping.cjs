/**
 * kb:mapping — 描述转换索引（标注描述 ↔ 详细描述对照示例聚合）：
 * 扫描 extensions/ 全部实体文档，提取「标注描述」「详细描述」小节，
 * 聚合为 generated/mapping.md——AI 写新扩展时查此索引学习转换模式。
 */
const fs = require('fs');
const path = require('path');
const { GENERATED_DIR, scanDocs } = require('./kb-lib.cjs');

// 提取小节内容：## 或 ### 标题 → 到下一个同级/更高标题或文档尾
function extractSection(content, titleRe) {
    const lines = content.split(/\r?\n/);
    let start = -1;
    let level = 0;
    for (let i = 0; i < lines.length; i++) {
        const m = /^(#{2,3})\s+(.*)$/.exec(lines[i]);
        if (!m) continue;
        if (start < 0) {
            if (titleRe.test(m[2])) {
                start = i + 1;
                level = m[1].length;
            }
        } else if (m[1].length <= level) {
            return lines.slice(start, i).join('\n').trim();
        }
    }
    return start < 0 ? '' : lines.slice(start).join('\n').trim();
}

const docs = scanDocs();
const samples = [];
for (const d of docs) {
    if (!d.rel.startsWith('extensions/')) continue;
    if (d.fm && !['card', 'general', 'mode'].includes(d.fm.type)) continue;
    if (d.fm && d.fm.type === undefined && !/^extensions\/[^/]+\/[^/]+\.md$/.test(d.rel)) continue;
    const annotated = extractSection(d.content, /标注描述/);
    const detailed = extractSection(d.content, /详细描述/);
    if (annotated || detailed) {
        samples.push({ rel: d.rel, title: (d.fm && d.fm.title) || d.rel, annotated, detailed });
    }
}

const lines = [];
lines.push('# 描述转换索引（标注描述 ↔ 详细描述）');
lines.push('');
lines.push('> 自动生成区（`kb:mapping`），勿手改。');
lines.push('');
lines.push('标注描述：人类自然语言（面向玩家）；详细描述：按规则词条拆解逻辑（面向 AI）。');
lines.push('');
if (samples.length === 0) {
    lines.push('（暂无已归档扩展实体，首个扩展归档后自动聚合）');
} else {
    lines.push(`共聚合 ${samples.length} 个对照示例。`);
    lines.push('');
    for (const s of samples) {
        lines.push(`## ${s.title}（[${s.rel}](../${s.rel})）`);
        lines.push('');
        if (s.annotated) {
            lines.push('**标注描述**');
            lines.push('');
            lines.push(s.annotated);
            lines.push('');
        }
        if (s.detailed) {
            lines.push('**详细描述**');
            lines.push('');
            lines.push(s.detailed);
            lines.push('');
        }
    }
}
fs.writeFileSync(path.join(GENERATED_DIR, 'mapping.md'), lines.join('\n'), 'utf8');
console.log(`[kb:mapping] 完成：mapping.md（${samples.length} 个对照示例）`);
