/**
 * Wiki 数据预处理脚本
 * 读取 shared/datas 下的 JSON 文件，生成 wiki 使用的 JavaScript 数据文件
 * 用法: node scripts/build-data.cjs
 */
const fs = require('fs');
const path = require('path');

const DATAS_DIR = path.join(__dirname, '..', '..', 'shared', 'datas');
const OUTPUT_DIR = path.join(__dirname, '..', 'js');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function readJSON(...parts) {
    const filePath = path.join(DATAS_DIR, ...parts);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ==================== 卡牌数据 ====================
console.log('处理卡牌数据...');
const cardsPackData = readJSON('cards', 'cards.json');
const cardsMetaData = readJSON('cards', 'cardsdata.json');
const langCard = readJSON('lang', 'card.json');
const langName = readJSON('lang', 'name.json');
const langLang = readJSON('lang', 'lang.json');

// 构建卡牌映射
const allCards = {};
for (const packName of cardsPackData.orders) {
    const pack = cardsPackData.datas[packName];
    if (!pack) continue;
    for (const card of pack.cards) {
        const key = card.id;
        const meta = cardsMetaData[card.name] || {};
        const langNameKey = card.name.replace(/_\w+$/, ''); // 去掉 _1v1 等后缀
        const baseMeta = cardsMetaData[langNameKey] || meta;
        allCards[key] = {
            id: card.id,
            name: card.name,
            suit: card.suit,
            number: card.number,
            pack: packName,
            packName: langName[packName] || packName,
            lang_name: meta.lang_name || baseMeta.lang_name || card.name,
            acronym: meta.acronym || baseMeta.acronym || card.name,
            type: meta.type || baseMeta.type || 0,
            subtype: meta.subtype || baseMeta.subtype || 0,
            damage: meta.damage !== undefined ? meta.damage : (baseMeta.damage || false),
            recover: meta.recover !== undefined ? meta.recover : (baseMeta.recover || false),
            lang_desc: meta.lang_desc || baseMeta.lang_desc || '',
            lang_desc2: meta.lang_desc2 || baseMeta.lang_desc2 || '',
            equiptip: meta.equiptip || baseMeta.equiptip || '',
            image: meta.image || baseMeta.image || card.name,
            audio: meta.audio || baseMeta.audio || card.name,
        };
    }
}

// 按卡牌名分组
const cardsByName = {};
for (const card of Object.values(allCards)) {
    const baseName = card.name.replace(/_\w+$/, ''); // 去掉后缀
    if (!cardsByName[baseName]) {
        cardsByName[baseName] = {
            name: baseName,
            lang_name: '',
            acronym: '',
            type: 0,
            subtype: 0,
            damage: false,
            recover: false,
            lang_desc: '',
            lang_desc2: '',
            equiptip: '',
            image: '',
            audio: '',
            instances: [],
        };
    }
    // 更新基础信息（使用第一个找到的元数据）
    const info = cardsByName[baseName];
    if (!info.lang_name && card.lang_name) {
        const meta = cardsMetaData[baseName] || {};
        info.lang_name = meta.lang_name || card.lang_name;
        info.acronym = meta.acronym || card.acronym;
        info.type = meta.type || card.type;
        info.subtype = meta.subtype || card.subtype;
        info.damage = meta.damage !== undefined ? meta.damage : card.damage;
        info.recover = meta.recover !== undefined ? meta.recover : card.recover;
        info.lang_desc = meta.lang_desc || card.lang_desc;
        info.lang_desc2 = meta.lang_desc2 || card.lang_desc2;
        info.equiptip = meta.equiptip || card.equiptip;
        info.image = meta.image || card.image;
        info.audio = meta.audio || card.audio;
    }
    info.instances.push(card);
}

// 按扩展包分组
const cardsByPack = {};
for (const packName of cardsPackData.orders) {
    const pack = cardsPackData.datas[packName];
    if (!pack) continue;
    cardsByPack[packName] = {
        name: packName,
        displayName: langName[packName] || packName,
        cards: pack.cards.map(c => allCards[c.id]).filter(Boolean),
    };
}

// 写出卡牌数据
const cardsOutput = { allCards, cardsByName, cardsByPack, cardsPackData, cardsMetaData };
fs.writeFileSync(
    path.join(OUTPUT_DIR, 'data-cards.js'),
    'window.__wikiCards = ' + JSON.stringify(cardsOutput, null, 2) + ';\n'
);
console.log(`  卡牌数据: ${Object.keys(allCards).length} 张实体牌, ${Object.keys(cardsByName).length} 种类型`);

// ==================== 武将数据 ====================
console.log('处理武将数据...');
const generalsIndex = readJSON('generals', 'index.json');

// 加载所有武将 JSON
const allGeneralsData = {};
const allGeneralAssets = {};
const allSkillsAssets = {};

const loadedJsons = new Set();
for (const packName of generalsIndex.orders) {
    const pack = generalsIndex.packs[packName];
    if (!pack) continue;
    for (const subpack of pack.subpacks) {
        for (const jsonName of (subpack.json || [])) {
            if (loadedJsons.has(jsonName)) continue;
            loadedJsons.add(jsonName);

            // 武将基础数据
            const genFile = path.join(DATAS_DIR, 'generals', jsonName + '.json');
            if (fs.existsSync(genFile)) {
                const genData = JSON.parse(fs.readFileSync(genFile, 'utf-8'));
                Object.assign(allGeneralsData, genData);
            }

            // 武将资源数据（插画、配音、info.id等）
            const assetFile = path.join(DATAS_DIR, 'assets', 'generals', jsonName + '.json');
            if (fs.existsSync(assetFile)) {
                const assetData = JSON.parse(fs.readFileSync(assetFile, 'utf-8'));
                Object.assign(allGeneralAssets, assetData);
            }

            // 技能资源数据（技能配音、描述）
            const skillFile = path.join(DATAS_DIR, 'assets', 'skills', jsonName + '.json');
            if (fs.existsSync(skillFile)) {
                const skillData = JSON.parse(fs.readFileSync(skillFile, 'utf-8'));
                Object.assign(allSkillsAssets, skillData);
            }
        }
    }
}

// 构建武将完整数据
const allGenerals = {};
for (const packName of generalsIndex.orders) {
    const pack = generalsIndex.packs[packName];
    if (!pack) continue;
    for (const subpack of pack.subpacks) {
        for (const generalKey of (subpack.generals || [])) {
            if (allGenerals[generalKey]) continue; // 跳过已处理的

            const genData = allGeneralsData[generalKey] || {};
            const assetData = allGeneralAssets[generalKey] || {};
            const info = assetData.info || {};
            const skin = (assetData.skins && assetData.skins[0]) || {};

            // 解析技能列表
            const skills = [];
            if (genData.skills) {
                for (const skillKey of genData.skills) {
                    const isDerived = skillKey.startsWith('#');
                    const actualKey = isDerived ? skillKey.slice(1) : skillKey;
                    const skillAsset = allSkillsAssets[actualKey] || {};

                    skills.push({
                        key: actualKey,
                        name: skillAsset.lang_name || actualKey.split('.').pop(),
                        desc: skillAsset.lang_desc || '',
                        desc2: skillAsset.lang_desc2 || '',
                        isDerived: isDerived,
                        audios: (skillAsset.audios || []).map(a => ({
                            url: a.url,
                            text: a.translation,
                        })),
                    });
                }
            }

            // 拼音首字母
            // 武将中文名：优先用key查翻译，其次用真名（最后一个.之后的内容）查翻译
            const trueName = generalKey.includes('.') ? generalKey.split('.').pop() : generalKey;
            const chineseName = langName[generalKey] || langName[trueName] || genData.name || generalKey;
            const firstLetter = chineseToPinyinFirst(chineseName);

            const general = {
                key: generalKey,
                // 原始 JSON 数据（与 shared/datas 格式一致）
                gen: genData,
                asset: assetData,
                skillsData: {},
                // 预处理辅助字段
                lang_name: chineseName,
                firstLetter: firstLetter,
                pack: packName,
                packName: langName[packName] || packName,
                subpack: subpack.name,
                subpackName: langName[subpack.name] || subpack.name,
                skillList: skills,
                // skin 计算辅助（从 asset.skins[0] 提取）
                _skin: {
                    baseUrl: skin.baseUrl || generalKey,
                    isDualImage: skin.isDualImage || false,
                    image: skin.image || 'image',
                    image_dual: skin.image_dual || 'image.dual',
                    image_dual2: skin.image_dual2 || 'image.dual.self',
                    deathAudio: skin.audios && skin.audios.death ? {
                        url: skin.audios.death.url || (skin.baseUrl ? skin.baseUrl + '/death' : generalKey + '/death'),
                        text: skin.audios.death.translation || '',
                    } : null,
                },
            };

            // 只收集该武将用到的技能数据
            if (genData.skills) {
                for (const skillKey of genData.skills) {
                    const actualKey = skillKey.startsWith('#') ? skillKey.slice(1) : skillKey;
                    if (allSkillsAssets[actualKey]) {
                        general.skillsData[actualKey] = allSkillsAssets[actualKey];
                    }
                }
            }

            allGenerals[generalKey] = general;
        }
    }
}

// 拼音首字母函数（简化版，仅处理第一个汉字的拼音首字母）
function chineseToPinyinFirst(str) {
    if (!str) return '#';
    const first = str.charAt(0);
    // 简单的拼音首字母映射表（常用字）
    const pinyinMap = {
        // 常见武将名首字
        '曹': 'C', '司': 'S', '夏': 'X', '张': 'Z', '许': 'X', '郭': 'G', '甄': 'Z', '杨': 'Y',
        '刘': 'L', '关': 'G', '赵': 'Z', '马': 'M', '黄': 'H', '魏': 'W',
        '孙': 'S', '甘': 'G', '吕': 'L', '周': 'Z', '大': 'D', '陆': 'L',
        '华': 'H', '吕': 'L', '貂': 'D', '袁': 'Y', '公': 'G',
        '邓': 'D', '姜': 'J', '庞': 'P', '卧': 'W', '太': 'T', '颜': 'Y',
        '贾': 'J', '鲁': 'L', '董': 'D', '蔡': 'C', '祝': 'Z', '孟': 'M',
        '典': 'D', '荀': 'X', '徐': 'X', '朱': 'Z', '潘': 'P', '虞': 'Y',
        '孙': 'S', '陈': 'C', '高': 'G', '王': 'W', '李': 'L', '卞': 'B',
        '左': 'Z', '神': 'S', '界': 'J', '谋': 'M', '星': 'X', '火': 'H',
        '晋': 'J', '族': 'Z', '胡': 'H', '田': 'T',
    };
    if (pinyinMap[first]) return pinyinMap[first];
    // 尝试从 Unicode 范围推断
    const code = first.charCodeAt(0);
    if (code >= 0x4e00 && code <= 0x9fff) return '#';
    return first.toUpperCase();
}

// 按扩展包分组武将
const generalsByPack = {};
for (const packName of generalsIndex.orders) {
    const pack = generalsIndex.packs[packName];
    if (!pack) continue;
    const packGenerals = [];
    for (const subpack of pack.subpacks) {
        for (const generalKey of (subpack.generals || [])) {
            if (allGenerals[generalKey]) {
                packGenerals.push(allGenerals[generalKey]);
            }
        }
    }
    generalsByPack[packName] = {
        name: packName,
        displayName: langName[packName] || packName,
        subpacks: pack.subpacks.map(sp => ({
            name: sp.name,
            displayName: langName[sp.name] || sp.name,
            icon: sp.icon || '',
            generals: (sp.generals || []).map(k => allGenerals[k]).filter(Boolean),
        })),
        generals: packGenerals,
    };
}

// 写出武将数据
const generalsOutput = { allGenerals, generalsByPack, generalsIndex };
fs.writeFileSync(
    path.join(OUTPUT_DIR, 'data-generals.js'),
    'window.__wikiGenerals = ' + JSON.stringify(generalsOutput, null, 2) + ';\n'
);
console.log(`  武将数据: ${Object.keys(allGenerals).length} 名武将`);
console.log(`  技能数据: ${Object.keys(allSkillsAssets).length} 个技能`);

// 写出翻译数据
const langOutput = { langName, langCard, langLang };
fs.writeFileSync(
    path.join(OUTPUT_DIR, 'data-lang.js'),
    'window.__wikiLang = ' + JSON.stringify(langOutput, null, 2) + ';\n'
);
console.log('  翻译数据: 已输出');

console.log('\n✅ 数据预处理完成！');
