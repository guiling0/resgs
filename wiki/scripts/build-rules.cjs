/**
 * 规则集数据预处理脚本
 * 使用 mammoth 将 doc/sgsrule.docx 转换为 HTML，提取目录结构
 * 用法: node scripts/build-rules.cjs
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOCX_PATH = path.join(__dirname, '..', '..', 'doc', 'sgsrule.docx');
const OUTPUT_PATH = path.join(__dirname, '..', 'js', 'data-rules.js');

console.log('转换规则集文档...');

// 1. 使用 npx mammoth 转换 docx 为 HTML
let html;
try {
    html = execSync(`npx --yes mammoth "${DOCX_PATH}" --output-format=html`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
        maxBuffer: 50 * 1024 * 1024,
    });
} catch (e) {
    console.error('mammoth 转换失败:', e.message);
    process.exit(1);
}

console.log('  HTML 大小: ' + (html.length / 1024).toFixed(0) + ' KB');

// 2. 删除第四章内容
const ch4Start = html.search(/<h1><a[^>]*>第四章\s+游戏卡牌<\/a><\/h1>/i);
if (ch4Start !== -1) {
    html = html.substring(0, ch4Start);
    console.log('  已删除第四章及之后的内容');
}

// 3. 删除前面的 TOC 区域
const contentStart = html.search(/<a[^>]*>第一章\s+游戏规则<\/a>/i);
if (contentStart !== -1) {
    const lastPBefore = html.lastIndexOf('<p>', contentStart);
    html = html.substring(Math.max(0, lastPBefore));
    console.log('  已删除前置 TOC 区域');
}

// 4. 单次遍历：在文档顺序中处理所有标题，构建正确的层级 TOC
let tocIndex = 0;
const tocStack = [];
const tocRoot = [];

function addTocItem(level, textClean) {
    if (!textClean) return null;
    const id = 'rule-toc-' + (tocIndex++);
    const item = { id, text: textClean, level, children: [] };

    while (tocStack.length > 0 && tocStack[tocStack.length - 1].level >= level) {
        tocStack.pop();
    }

    if (tocStack.length === 0) {
        tocRoot.push(item);
    } else {
        tocStack[tocStack.length - 1].children.push(item);
    }
    tocStack.push(item);
    return id;
}

// 用统一的模式匹配所有需要处理的标题（按文档顺序）
// 匹配: <p><a>第X章</a></p> | <h1>...</h1> | <h2>...</h2> | <h3>...</h3>
const headingRe = /<(?:p|h1)>\s*<a[^>]*>(第[一二三四五六七八九十]+章\s+[^<]+)<\/a>\s*<\/(?:p|h1)>|<h([123])>([\s\S]*?)<\/h\2>/gi;

let processedHtml = html;
let match;
const replacements = [];

// 先收集所有匹配及其位置
while ((match = headingRe.exec(html)) !== null) {
    if (match[1]) {
        // 章节标题: 第X章
        replacements.push({
            pos: match.index,
            len: match[0].length,
            type: 'chapter',
            text: match[1].trim(),
            original: match[0],
        });
    } else if (match[2]) {
        // h1/h2/h3 标题
        const origLevel = parseInt(match[2]);
        const inner = match[3];
        const textClean = inner.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').trim();
        if (textClean) {
            // 章节标题映射到 level 1，普通 h1→2, h2→3, h3→4
            const mappedLevel = origLevel + 1;
            replacements.push({
                pos: match.index,
                len: match[0].length,
                type: 'heading',
                level: mappedLevel,
                text: textClean,
                inner: inner,
                origTag: 'h' + origLevel,
            });
        }
    }
}

// 按位置排序
replacements.sort(function(a, b) { return a.pos - b.pos; });

// 从后往前替换，构建 TOC
var parts = [];
var lastEnd = 0;
replacements.forEach(function(r) {
    // 添加前面的文本
    parts.push(html.substring(lastEnd, r.pos));
    lastEnd = r.pos + r.len;

    if (r.type === 'chapter') {
        var id = addTocItem(1, r.text);
        if (id) {
            parts.push('<h1 class="chapter-title" id="' + id + '">' + r.text + '</h1>');
        }
    } else {
        var id = addTocItem(r.level, r.text);
        var newTag = 'h' + r.level;
        if (id) {
            parts.push('<' + newTag + ' id="' + id + '">' + r.inner + '</' + newTag + '>');
        } else {
            parts.push(r.original);
        }
    }
});
parts.push(html.substring(lastEnd));
processedHtml = parts.join('');

console.log('  TOC 条目: ' + tocIndex);

// 5. 写入 JS 文件
const output = 'window.__wikiRules = ' + JSON.stringify({
    toc: tocRoot,
    html: processedHtml,
}, null, 2) + ';\n';

fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
console.log('  输出: ' + OUTPUT_PATH + ' (' + (output.length / 1024).toFixed(0) + ' KB)');
console.log('✅ 规则集数据处理完成！');
