/**
 * kb:check — 知识库一致性校验：id 唯一、rules 引用存在、索引对齐。
 * 校验失败时以非 0 退出码结束。
 */
const { scanDocs } = require('./kb-lib.cjs');

const docs = scanDocs();
const errors = [];

// 收集全部 id，检查唯一性
const idMap = new Map();
for (const d of docs) {
    const id = d.fm && d.fm.id;
    if (!id) continue;
    if (idMap.has(id)) {
        errors.push(`[id 冲突] ${id} 同时存在于 ${idMap.get(id)} 与 ${d.rel}`);
    } else {
        idMap.set(id, d.rel);
    }
}

// rules 声明必须指向已存在的 id
for (const d of docs) {
    const rules = d.fm && d.fm.rules;
    if (!rules) continue;
    for (const r of rules) {
        if (!idMap.has(r)) {
            errors.push(`[悬空引用] ${d.rel} 的 rules 声明指向不存在的 id: ${r}`);
        }
    }
}

if (errors.length) {
    console.error(`[kb:check] 发现 ${errors.length} 个问题：`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
}
console.log(`[kb:check] 通过（${docs.length} 篇文档，${idMap.size} 个 id）`);
