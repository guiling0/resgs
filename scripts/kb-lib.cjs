/**
 * 知识库脚本公共库：frontmatter 解析与文档扫描。
 */
const fs = require('fs');
const path = require('path');

/** 知识库根目录（本项目 knowledge/） */
const KNOWLEDGE_DIR = path.resolve(__dirname, '..', 'knowledge');
/** 自动生成区目录 */
const GENERATED_DIR = path.join(KNOWLEDGE_DIR, 'generated');

/**
 * 解析 frontmatter 块（--- 包裹的简单 key: value）。
 * @param {string} content 文档内容
 * @returns {object|null} 元数据对象；无 frontmatter 时返回 null
 */
function parseFrontmatter(content) {
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
    if (!m) return null;
    const fm = {};
    let curKey = null;
    for (const line of m[1].split(/\r?\n/)) {
        // 列表项（- item）追加到当前 key
        const item = /^\s*-\s+(.*)$/.exec(line);
        if (item && curKey && Array.isArray(fm[curKey])) {
            fm[curKey].push(item[1].trim());
            continue;
        }
        const kv = /^([\w-]+)\s*:\s*(.*)$/.exec(line);
        if (!kv) continue;
        curKey = kv[1];
        const val = kv[2].trim();
        if (val.startsWith('[') && val.endsWith(']')) {
            // 内联数组 [a, b]
            fm[curKey] = val.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
        } else {
            // 标量保留字符串；空值（如 rules: 后接列表项）初始化为数组
            fm[curKey] = val === '' ? [] : val;
        }
    }
    return fm;
}

/**
 * 扫描 knowledge/ 下全部 md 文档（排除 generated/）。
 * @returns {Array<{file:string, rel:string, fm:object|null, content:string}>}
 */
function scanDocs() {
    const out = [];
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name === 'generated') continue;
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.md')) {
                const content = fs.readFileSync(full, 'utf8');
                out.push({
                    file: full,
                    rel: path.relative(KNOWLEDGE_DIR, full).replace(/\\/g, '/'),
                    fm: parseFrontmatter(content),
                    content,
                });
            }
        }
    }
    walk(KNOWLEDGE_DIR);
    return out;
}

module.exports = { KNOWLEDGE_DIR, GENERATED_DIR, parseFrontmatter, scanDocs };
