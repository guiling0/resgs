/**
 * kb:api — 从 shared/core 源码轻量提取 API 文档 → knowledge/project-api/（随 git 提交重建）。
 * 粒度：**每个导出类一档**（project-api/<模块>/<类名>.md，事件域即每事件一档）；
 * 文件内非类符号（接口/枚举/函数/类型）并入所在文件的类档；文件无类时生成 <文件名>.md 文件档。
 * 从 JSDoc 提取 @rules 写入 frontmatter rules（供 kb-refs 聚合规则词条引用区①）。
 * 同时产出 generated/anchors.json（符号 → 文件:行号）供 kb:links 使用。
 */
const fs = require('fs');
const path = require('path');
const { KNOWLEDGE_DIR, GENERATED_DIR } = require('./kb-lib.cjs');

const CORE_DIR = path.resolve(__dirname, '..', 'shared', 'core');
const API_DIR = path.join(KNOWLEDGE_DIR, 'project-api');
const ANCHORS_FILE = path.join(GENERATED_DIR, 'anchors.json');

/** 顶层模块 → 文档 id 前缀/标题 */
const MODULES = [
    { dir: 'builder', id: 'builder', title: '构建器域（builder/）' },
    { dir: 'entity', id: 'entity', title: '实体域（entity/）' },
    { dir: 'logic/event', id: 'event', title: '事件域（logic/event/）' },
    { dir: 'logic/room', id: 'room', title: '房间宿主域（logic/room/）' },
    { dir: 'state', id: 'state', title: '状态域（state/）' },
    { dir: 'transport', id: 'transport', title: '传输域（transport/）' },
    { dir: 'types', id: 'types', title: '类型域（types/）' },
    { dir: 'utils', id: 'utils', title: '工具域（utils/）' },
];
const ROOT_MODULE = { id: 'core', title: '核心域（shared/core 根）' };

/** 递归收集目录下全部 .ts 文件 */
function collectTs(dir) {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...collectTs(p));
        else if (e.name.endsWith('.ts')) out.push(p);
    }
    return out;
}

/** 声明位置前最近的 JSDoc（声明前仅允许空白） */
function jsDocOf(content, index) {
    const before = content.slice(0, index);
    const end = before.lastIndexOf('*/');
    if (end < 0) return '';
    const start = before.lastIndexOf('/**', end);
    if (start < 0) return '';
    if (!/^\s*$/.test(before.slice(end + 2))) return '';
    return before
        .slice(start + 3, end)
        .replace(/^\s*\*\s?/gm, '')
        .replace(/\r\n|\r/g, '\n')
        .trim();
}

/** 声明所在行号（1 起） */
function lineOf(content, index) {
    return content.slice(0, index).split('\n').length;
}

/** 顶层导出符号签名（class/interface/enum 取到 { 前） */
function sigOf(content, index, kind) {
    let sig = content.slice(index, content.indexOf('\n', index) + 1 || content.length).trim().replace(/\s+/g, ' ');
    if (kind === 'class' || kind === 'interface' || kind === 'enum') {
        const open = content.indexOf('{', index);
        if (open >= 0 && open - index < 500) sig = content.slice(index, open).trim().replace(/\s+/g, ' ');
    }
    return sig.length > 120 ? sig.slice(0, 117) + '…' : sig;
}

/** 提取文件中的顶层导出符号 */
function extractSymbols(content, fileRel) {
    const symbols = [];
    const re = /export\s+(?:abstract\s+|declare\s+|default\s+)*(class|interface|enum|function|type|const)\s+([A-Za-z_$][\w$]*)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        const kind = m[1];
        const name = m[2];
        if (kind === 'const' && !/\s=\s/.test(content.slice(m.index, m.index + 200))) continue;
        symbols.push({
            kind,
            name,
            doc: jsDocOf(content, m.index),
            line: lineOf(content, m.index),
            file: fileRel,
            sig: sigOf(content, m.index, kind),
            index: m.index,
        });
    }
    return symbols;
}

/** 尽力提取类内方法（4 空格缩进、方法名/get/set/async 等开头、后跟括号） */
function extractMembers(content, fileRel) {
    const members = [];
    const re = /^ {4}(?:(?:public|private|protected|readonly|static|async|abstract|get|set)\s+)*([A-Za-z_$][\w$]*)(?:<[^>]*>)?\(/gm;
    let m;
    while ((m = re.exec(content)) !== null) {
        const name = m[1];
        const paren = content.indexOf('(', m.index);
        const close = content.indexOf(')', paren);
        if (close < 0 || close - m.index > 300) continue;
        const head = content.slice(m.index, close + 1).replace(/\s+/g, ' ');
        // 返回类型匹配到行尾（保留对象字面量内 ;/|），行尾为方法体 { 时去除
        const ret = /\)\s*:\s*([^\n]+)/.exec(content.slice(close, close + 300));
        const sig = ret ? `${head}: ${ret[1].trim().replace(/\s*\{\s*$/, '')}` : head;
        members.push({
            name,
            sig: sig.length > 110 ? sig.slice(0, 107) + '…' : sig,
            doc: jsDocOf(content, m.index),
            line: lineOf(content, m.index),
            file: fileRel,
        });
    }
    return members;
}

/** 尽力提取类内字段（4 空格缩进：可选 @装饰器 + 修饰符 + name[?] : type） */
function extractFields(content, fileRel) {
    const fields = [];
    const re = /^ {4}((?:@[\w.]+\([^)]*\)\s+)*(?:(?:public|private|protected|readonly|static|abstract)\s+)*)([A-Za-z_$][\w$]*)(\??)\s*:\s*([^;=\n]+)/gm;
    let m;
    while ((m = re.exec(content)) !== null) {
        const sig = `${m[1].trim()} ${m[2]}${m[3]}: ${m[4].trim()}`.replace(/\s+/g, ' ').trim();
        fields.push({
            name: m[2],
            sig: sig.length > 110 ? sig.slice(0, 107) + '…' : sig,
            doc: jsDocOf(content, m.index),
            line: lineOf(content, m.index),
            file: fileRel,
        });
    }
    return fields;
}

/** 符号类型中文名 */
function kindLabel(kind) {
    return { class: '类', interface: '接口', enum: '枚举', function: '函数', type: '类型别名', const: '常量' }[kind] ?? kind;
}

/** 从 JSDoc 中提取 @rules 引用的规则词条/事件 id（支持 #锚点 与中文时机名） */
function extractRules(doc) {
    if (!doc) return [];
    const rules = [];
    const re = /@rules\s+([\w/.?#\u4e00-\u9fa5-]+)/g;
    let m;
    while ((m = re.exec(doc)) !== null) rules.push(m[1]);
    return rules;
}

/** 符号的 frontmatter rules 段（按 JSDoc @rules 收集，存去锚点后的基础 id 供 kb-refs/kb-check 使用） */
function rulesBlock(docs) {
    const set = new Set();
    for (const d of docs) for (const r of extractRules(d && d.doc)) set.add(r.split('#')[0].replace(/\/+$/, ''));
    if (set.size === 0) return [];
    return ['rules:', ...[...set].sort().map((r) => `  - ${r}`)];
}

/** 多行文本转为 markdown 引用块（每行加 > 前缀） */
function quoteBlock(text) {
    return text.split(/\r?\n/).map((l) => `> ${l}`).join('\n');
}

/** 符号段落（签名 + 位置 + 规则链接 + JSDoc） */
function symbolSection(s) {
    const lines = [];
    lines.push(`### ${s.name}（${kindLabel(s.kind)}）`);
    lines.push('');
    lines.push(`- 签名：\`${s.sig}\``);
    lines.push(`- 位置：../../shared/core/${s.file}#L${s.line}`);
    const rules = ruleLinks(s.doc);
    if (rules.length > 0) lines.push(`- 规则：${rules.join('、')}`);
    if (s.doc) {
        lines.push('');
        lines.push(quoteBlock(s.doc));
    }
    lines.push('');
    return lines;
}

/** 类内成员表（方法/getter/字段，成员名可点规则链接，规则列列出全部） */
function memberTable(clsMembers) {
    if (clsMembers.length === 0) return [];
    const lines = ['**类内成员：**', '', '| 成员 | 签名 | 规则 | 说明 |', '|---|---|---|---|'];
    for (const mn of clsMembers) {
        const rl = ruleLinks(mn.doc);
        const nameCell = rl.length > 0 ? `[${mn.name}](${rl[0].match(/\((.+)\)/)?.[1]})` : mn.name;
        lines.push(`| ${nameCell} | \`${mn.sig.replace(/\|/g, '\\|')}\` | ${rl.join('、')} | ${docSummary(mn.doc).replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
    return lines;
}

/** 提取枚举成员（成员名、值、JSDoc、行号） */
function extractEnumMembers(content, symIndex) {
    const open = content.indexOf('{', symIndex);
    if (open < 0) return [];
    let depth = 0;
    let close = -1;
    for (let i = open; i < content.length; i++) {
        if (content[i] === '{') depth++;
        else if (content[i] === '}') {
            depth--;
            if (depth === 0) {
                close = i;
                break;
            }
        }
    }
    if (close < 0) return [];
    const body = content.slice(open + 1, close);
    const members = [];
    const re = /\/\*\*[\s\S]*?\*\/\s*([A-Za-z_$][\w$]*)\s*=\s*([^,\n]+)/g;
    let m;
    while ((m = re.exec(body)) !== null) {
        const docRaw = m[0].slice(0, m[0].lastIndexOf('*/') + 2);
        const doc = docRaw
            .replace(/\/\*\*/, '').replace(/\*\/$/, '')
            .replace(/^\s*\*\s?/gm, '')
            .replace(/\r\n|\r/g, '\n')
            .trim();
        members.push({
            name: m[1],
            value: m[2].trim().replace(/^['"]|['"]$/g, ''),
            doc,
            line: lineOf(content, open + 1 + m.index),
        });
    }
    return members;
}

/** 规则 id → 知识库相对路径（仅规则域可链接） */
function idToRel(id) {
    if (/^(events|terms|definitions|topics)\//.test(id)) return `rules/${id}.md`;
    return null;
}

/** JSDoc 中 @rules 引用 → 可点击链接列表（词条/事件/时机） */
function ruleLinks(doc) {
    if (!doc) return [];
    const links = [];
    for (const r of extractRules(doc)) {
        const mm = /^([\w/.-]+?)(?:#(.+))?$/.exec(r);
        if (!mm) continue;
        const rel = idToRel(mm[1].replace(/\/+$/, ''));
        if (!rel) continue;
        const anchor = mm[2];
        links.push(`[${anchor || mm[1].split('/').pop()}](${anchor ? `../../${rel}#${anchor}` : `../../${rel}`})`);
    }
    return links;
}

/** JSDoc 第一行非 @ 说明（作为摘要） */
function docSummary(doc) {
    return ((doc || '').split('\n').find((l) => l && !l.startsWith('@')) || '').trim();
}

/** 枚举符号段（签名 + 全部枚举值表，值行按 @rules 生成指向规则文档时机标题的链接） */
function enumSection(s, members) {
    const lines = symbolSection(s);
    if (members.length === 0) return lines;
    lines.push('**枚举值：**');
    lines.push('');
    lines.push('| 值 | 成员 | 说明 |');
    lines.push('|---|---|---|');
    for (const mn of members) {
        let desc = (mn.doc || '').split('\n')[0] || '';
        // 纯 @rules 注释（无其他说明）时，用锚点时机名作为说明
        if (desc.startsWith('@rules ')) {
            const am = /#(.+)$/.exec(desc);
            if (am) desc = am[1];
            else desc = '';
        }
        for (const r of extractRules(mn.doc)) {
            const mm = /^([\w/.-]+?)(?:#(.+))?$/.exec(r);
            if (!mm) continue;
            const rel = idToRel(mm[1].replace(/\/+$/, ''));
            if (!rel) continue;
            const anchor = mm[2];
            desc += `（[${anchor || mn.name}](${anchor ? `../../${rel}#${anchor}` : `../../${rel}`})）`;
        }
        lines.push(`| \`${mn.value}\` | ${mn.name} | ${desc.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
    return lines;
}

// ===== 主流程 =====

/** 递归删除目录（project-api/ 为自动生成区，生成前整体清空） */
function rmrf(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) rmrf(p);
        else fs.unlinkSync(p);
    }
    fs.rmdirSync(dir);
}

rmrf(API_DIR);
fs.mkdirSync(API_DIR, { recursive: true });
fs.mkdirSync(GENERATED_DIR, { recursive: true });

const anchors = [];
const docList = []; // { id, rel, title } 供 index 使用
const allFiles = collectTs(CORE_DIR).sort();
const used = new Set();

/** 处理一个模块的文件集合 */
function processModule(mod, files) {
    const modDir = path.join(API_DIR, mod.id);
    fs.mkdirSync(modDir, { recursive: true });
    let count = 0;

    for (const file of files) {
        const rel = path.relative(CORE_DIR, file).replace(/\\/g, '/');
        const content = fs.readFileSync(file, 'utf8');
        const symbols = extractSymbols(content, rel);
        const members = extractMembers(content, rel);
        const fields = extractFields(content, rel);
        if (symbols.length === 0) continue;

        // 枚举成员表（供展示与 rules 收集）
        const enumMembers = new Map();
        for (const s of symbols) {
            if (s.kind === 'enum') enumMembers.set(s.name, extractEnumMembers(content, s.index));
        }
        // 全部规则来源（顶层符号 + 枚举成员 + 类内方法/getter + 类内字段）
        const ruleDocs = [];
        for (const s of symbols) {
            ruleDocs.push(s);
            if (s.kind === 'enum') ruleDocs.push(...(enumMembers.get(s.name) || []));
        }
        ruleDocs.push(...members, ...fields);

        // 符号段渲染：枚举用 enumSection（含全部值），其余 symbolSection
        const render = (s) => (s.kind === 'enum' ? enumSection(s, enumMembers.get(s.name) || []) : symbolSection(s));

        const classes = symbols.filter((s) => s.kind === 'class');
        const nonClasses = symbols.filter((s) => s.kind !== 'class');

        // 收集该文件的锚点
        for (const s of symbols) {
            anchors.push({ name: s.name, kind: s.kind, file: `shared/core/${s.file}`, line: s.line });
        }

        if (classes.length > 0) {
            // 每类一档；非类符号并入第一个类档
            const extra = nonClasses.flatMap(render);
            for (const cls of classes) {
                const nextClass = classes.find((x) => x.line > cls.line);
                const end = nextClass ? nextClass.line : Infinity;
                const clsMembers = [...members, ...fields]
                    .filter((mn) => mn.line > cls.line && mn.line < end)
                    .sort((a, b) => a.line - b.line);
                const clsRules = ruleLinks(cls.doc);
                const doc = [
                    '---',
                    `title: ${cls.name}`,
                    'type: api',
                    `id: api/${mod.id}/${cls.name}`,
                    ...rulesBlock(ruleDocs),
                    `tags: [API, ${mod.title}]`,
                    '---',
                    '',
                    `# ${cls.name}（类）`,
                    '',
                    `- 签名：\`${cls.sig}\``,
                    `- 位置：../../shared/core/${cls.file}#L${cls.line}`,
                    ...(clsRules.length > 0 ? [`- 规则：${clsRules.join('、')}`] : []),
                    '',
                ];
                if (cls.doc) doc.push(quoteBlock(cls.doc), '');
                doc.push(...memberTable(clsMembers));
                doc.push(...extra);
                fs.writeFileSync(path.join(modDir, `${cls.name}.md`), doc.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', 'utf8');
                docList.push({ id: `api/${mod.id}/${cls.name}`, rel: `${mod.id}/${cls.name}.md`, title: cls.name });
                count++;
            }
        } else {
            // 无类：文件档（含全部非类符号）
            const base = path.basename(file, '.ts');
            const doc = [
                '---',
                `title: ${base}`,
                'type: api',
                `id: api/${mod.id}/${base}`,
                ...rulesBlock(ruleDocs),
                `tags: [API, ${mod.title}]`,
                '---',
                '',
                `# ${base}（${mod.title}）`,
                '',
                ...nonClasses.flatMap(render),
            ];
            fs.writeFileSync(path.join(modDir, `${base}.md`), doc.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', 'utf8');
            docList.push({ id: `api/${mod.id}/${base}`, rel: `${mod.id}/${base}.md`, title: base });
            count++;
        }
    }
    return count;
}

for (const mod of MODULES) {
    const dir = path.join(CORE_DIR, mod.dir);
    const files = allFiles.filter((f) => f.startsWith(dir) && !used.has(f));
    for (const f of files) used.add(f);
    const count = processModule(mod, files);
    console.log(`[kb:api] ${mod.id} ← ${files.length} 个文件（${count} 档）`);
}

// 根目录文件（core 模块）
{
    const files = allFiles.filter((f) => path.dirname(f) === CORE_DIR);
    const count = processModule(ROOT_MODULE, files);
    console.log(`[kb:api] ${ROOT_MODULE.id} ← ${files.length} 个文件（${count} 档）`);
}

// API 总索引
{
    const byMod = new Map();
    for (const d of docList) {
        const m = d.id.split('/')[1];
        if (!byMod.has(m)) byMod.set(m, []);
        byMod.get(m).push(d);
    }
    const lines = [
        '---',
        'title: 项目 API 索引',
        'type: api',
        'id: api/index',
        'tags: [API]',
        '---',
        '',
        '# 项目 API 索引',
        '',
        '> 自动生成区（`kb:api`），勿手改。',
        '',
    ];
    for (const [m, list] of [...byMod.entries()].sort()) {
        const title = [...MODULES.map((x) => [x.id, x.title]), [ROOT_MODULE.id, ROOT_MODULE.title]].find((x) => x[0] === m)?.[1] ?? m;
        lines.push(`## ${title}`, '');
        for (const d of list.sort((a, b) => a.title.localeCompare(b.title))) {
            lines.push(`- [${d.title}](${d.rel})`);
        }
        lines.push('');
    }
    fs.writeFileSync(path.join(API_DIR, 'index.md'), lines.join('\n'), 'utf8');
}

fs.writeFileSync(ANCHORS_FILE, JSON.stringify(anchors, null, 2), 'utf8');
console.log(`[kb:api] 完成：${API_DIR}（${docList.length} 档，${anchors.length} 个锚点 → anchors.json）`);
