/**
 * 一次性工具：将 rules/terms/ 下 9 个分类聚合档拆分为「每词条一档」。
 * 每个分类建子文件夹，词条文件名用拼音 slug（后续由人工改为英文，与属性/方法名对应）。
 * 用法：node scripts/kb-split-terms.cjs
 */
const fs = require('fs');
const path = require('path');

const TERMS_DIR = path.resolve(__dirname, '..', 'knowledge', 'rules', 'terms');

/** 分类 → { 词条中文名: 拼音 slug } */
const MAP = {
    'card-terms': {
        '身份牌': 'shenfenpai',
        '武将牌': 'wujiangpai',
        '体力牌': 'tilipai',
        '游戏牌': 'youxipai',
        '衍生牌': 'yanshengpai',
        '基本牌': 'jibenpai',
        '装备牌': 'zhuangbeipai',
        '锦囊牌': 'jinnangpai',
        '实体/虚拟牌': 'shitixunipai',
    },
    'card-face-terms': {
        '花色': 'huase',
        '颜色': 'yanse',
        '点数初值': 'dianshuchuzhi',
        '姓名': 'xingming',
        '性别': 'xingbie',
        '势力': 'shili',
        '技能': 'jineng',
        '珠联璧合': 'zhulianbihe',
    },
    'zone-terms': {
        '区域': 'quyu',
        '牌堆': 'paidui',
        '弃牌堆': 'qipaidui',
        '武将牌堆': 'wujiangpaidui',
        '处理区': 'chuliqu',
        '手牌区': 'shoupaiqu',
        '武器区': 'wuqiqu',
        '防具区': 'fangjuqu',
        '进攻坐骑区': 'jingongzuoqiqu',
        '防御坐骑区': 'fangyuzuoqiqu',
        '特殊坐骑区': 'teshuzuoqiqu',
        '宝物区': 'baowuqu',
        '装备区': 'zhuangbeiqu',
        '判定区': 'pandingqu',
        '角色的区域': 'juesequyu',
        '武将牌上': 'wujiangpaishang',
        '武将牌旁': 'wujiangpaipang',
        '仓廪': 'canglin',
        '府库': 'fuku',
        '维系区域': 'weixiquyu',
        '废除<一个区域>': 'feichuquyu',
        '恢复<一个区域>': 'huifuquyu',
    },
    'value-terms': {
        '体力上限': 'tilishangxian',
        '体力值': 'tilizhi',
        '已损失的体力值': 'yisunshidetilizhi',
        '体力': 'tili',
        '手牌上限': 'shoupaishangxian',
        '伤害值基数': 'shanghaizhijishu',
        '回复值基数': 'huifuzhijishu',
        '距离': 'juli',
        '攻击范围': 'gongjifanwei',
        'X、Y、Z': 'xyz',
        '<数值X>与<数值Y>之差': 'shuzhizhicha',
        '等量的……': 'dengliang',
        '……的势力/角色数': 'shilijueshushu',
        '<一个数值>最大/小': 'zuidazhixiao',
        '<一个数值X>的一半': 'yiban',
        '至多/少X': 'zhiduoshaox',
        '任意数量': 'renyishuliang',
        '额定摸牌数': 'edingmopaishu',
        '玩家数': 'wanjiashu',
        '目标对应的角色数': 'mubiaojueseshu',
        '游戏牌ID': 'youxipaiid',
        '点数': 'dianshu',
    },
    'description-terms': {
        '锁定技': 'suodingji',
        '限定技': 'xiandingji',
        '觉醒技': 'juexingji',
        '主公技': 'zhugongji',
        '<角色>的<……（与区域无关的限制条件）牌>': 'xianzhiyutiaojianpai',
        '可': 'ke',
        '〖〗': 'jinengkuohao',
        '【】': 'paimingkuohao',
        '“ ”': 'yinhao',
        '{ }': 'huakuohao',
        '/': 'xiegang',
        '▶': 'bofang',
        '▷': 'zanting',
        '→': 'jiantou',
        '转移': 'zhuanyi',
        '依次<操作><X>张……牌': 'yicicaozuo',
        '此牌': 'cipai',
        '需': 'xuyao',
        '须': 'bixu',
        '并': 'bing',
        '扣减体力': 'koujiantili',
        '使用/打出者': 'shiyongdachuzhe',
        '来源': 'laiyuan',
        '渠道': 'qudao',
        '普通/属性伤害': 'shuxingshanghai',
        '连环伤害': 'lianhuanshanghai',
        '已/未受伤': 'yiweishoushang',
        '<一名角色>回复<X>点体力': 'huifutili',
        '<一名角色>将体力回复至<X>点': 'huifutilizhi',
        '选择：1.……2.……': 'xuanze',
        'A令B': 'alingb',
        '另一名角色': 'lingyimingjuese',
        '你': 'ni',
        '其他角色': 'qitajuese',
        '<一张牌>的目标': 'mubiao',
        '以此法/未以此法': 'yicifa',
        '可见': 'kejian',
        '杀死': 'shasi',
        '<多名角色>各<执行一个操作>': 'gezhixingcaozuo',
        '主/副将技': 'zhufujiangji',
        '相邻': 'xianglin',
        '围攻': 'weigong',
        '队列': 'duilie',
        '大势力': 'dashili',
        '小势力': 'xiaoshili',
        '不计入距离的计算': 'bujirujuli',
        '不计入座次的计算': 'bujiruzuoci',
        '阵法技': 'zhenfaji',
        '阵法召唤': 'zhenfazhaohuan',
        '<X名角色>也成为<一张牌>的目标': 'yechengweimubiao',
        '因<执行一个操作>/因<一名角色><执行一个操作>': 'yincaozuo',
        '奥秘技': 'aomiji',
        '牌堆里的第……张<一张牌>': 'paiduidizhang',
        '军令': 'junling',
        '失去<一名角色的>所有武将技能': 'shiqujineng',
        '转化': 'zhuanhua',
        '造成（或受到）……点普通/火焰/雷电伤害': 'zaochengshanghai',
    },
    'game-flow-terms': {
        '回合': 'huike',
        '上/下家': 'shangxiajia',
        '阶段': 'jieduan',
        '终止……流程/回合': 'zhongzhi',
        '角色': 'juese',
        '结束……阶段/回合': 'jieshu',
    },
    'resolution-terms': {
        '事件': 'shijian',
        '响应': 'xiangying',
        '结算': 'jiesuan',
        '时机': 'shiji',
        '流程': 'liucheng',
        '无效': 'wuxiao',
        '取消': 'quxiao',
        '无视': 'wushi',
        '防止': 'fangzhi',
        '起点': 'qidian',
    },
    'card-op-terms': {
        '移至<一个区域>': 'yizhi',
        '使用': 'shiyong',
        '打出': 'dachu',
        '<一名角色>能如手牌般使用或打出<牌A>': 'rushoupaibanshiyong',
        '重铸': 'chongzhu',
        '置于/入': 'zhiyu',
        '扣置于/入': 'kouzhiyu',
        '弃置': 'qizhi',
        '弃': 'qi',
        '视为': 'shiwei',
        '<角色A>将……牌交给<角色B>': 'jiaogei',
        '拼点': 'pindian',
        '摸……张牌': 'mozhang',
        '将<牌>弃置至<X>张': 'qizhizhixzhang',
        '将<牌>补至<X>张': 'buzhixzhang',
        '观看': 'guankan',
        '展示': 'zhanshi',
        '亮出': 'liangchu',
        '交换': 'jiaohuan',
        '获得<牌>': 'huode',
        '得到': 'dedao',
        '失去<牌>/<手牌>/<装备区里的牌>': 'shiqu',
        '判定': 'panding',
        '<一名角色><操作>……所有<……牌>': 'suoyoupai',
        '合纵': 'hezong',
        '<一名角色><操作>（对应的实体牌为）牌堆/弃牌堆里的<一张……牌>': 'paiduiqipaishitipai',
        '洗牌': 'xipai',
    },
    'general-op-terms': {
        '横置': 'hengzhi',
        '重置': 'chongzhi',
        '连环状态': 'lianhuanzhuangtai',
        '翻面': 'fanmian',
        '复原': 'fuyuan',
        '明置': 'mingzhi',
        '暗置': 'anzhi',
        '叠置': 'diezhi',
        '移除': 'yichu',
        '变更': 'biangeng',
    },
};

function parseFrontmatter(content) {
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
    if (!m) return { fm: null, body: content };
    const fm = {};
    let curKey = null;
    for (const line of m[1].split(/\r?\n/)) {
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
            fm[curKey] = val.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
        } else {
            fm[curKey] = [];
        }
    }
    return { fm, body: content.slice(m[0].length) };
}

/** 按 ### 词条标题切分正文 */
function splitSections(body) {
    const sections = [];
    let cur = null;
    for (const line of body.split(/\r?\n/)) {
        const h = /^###\s+(.*)$/.exec(line);
        if (h) {
            if (cur) sections.push(cur);
            cur = { title: h[1].trim(), lines: [] };
        } else if (cur) {
            cur.lines.push(line);
        }
    }
    if (cur) sections.push(cur);
    return sections;
}

let total = 0;
for (const [cat, slugMap] of Object.entries(MAP)) {
    const file = path.join(TERMS_DIR, `${cat}.md`);
    if (!fs.existsSync(file)) {
        console.error(`[split] 缺少文件: ${file}`);
        continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    const { fm, body } = parseFrontmatter(content);
    const tags = (fm && fm.tags) || [];
    const sections = splitSections(body);

    const dir = path.join(TERMS_DIR, cat);
    fs.mkdirSync(dir, { recursive: true });

    let ok = 0;
    for (const s of sections) {
        const slug = slugMap[s.title];
        if (!slug) {
            console.error(`[split] ${cat} 缺 slug: ${s.title}`);
            continue;
        }
        const doc = [
            '---',
            `title: ${s.title}`,
            'type: term',
            `id: terms/${cat}/${slug}`,
            `tags: [${tags.join(', ')}]`,
            '---',
            '',
            `# ${s.title}`,
            '',
            ...s.lines,
        ].join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
        fs.writeFileSync(path.join(dir, `${slug}.md`), doc, 'utf8');
        ok++;
        total++;
    }
    fs.unlinkSync(file);
    console.log(`[split] ${cat} → ${ok}/${sections.length} 词条`);
}
console.log(`[split] 完成，共 ${total} 个词条档`);
