// ==================== 数据引用 ====================
var _C = window.__wikiCards || { allCards: {}, cardsByName: {}, cardsByPack: {} };
var _G = window.__wikiGenerals || { allGenerals: {}, generalsByPack: {} };
var _L = window.__wikiLang || { langName: {}, langCard: {}, langLang: {} };
var LL = _L.langLang; var LN = _L.langName;

// ==================== 常量 ====================
var RES_BASE = 'http://res.resgs.com/';
var GAME_IMG = RES_BASE + 'generals/';
var AUDIO_BASE = RES_BASE;

var KINGDOMS = ['wei', 'shu', 'wu', 'qun', 'jin', 'god', 'ye', 'cyan'];
var GENDERS = [{ v: 0, n: '男' }, { v: 2, n: '女' }];

// ==================== 工具函数 ====================
function T (k) { return LN[k] || LL[k] || k; }
function suitName (s) { return LL['suit' + s] || ['', '黑桃', '红桃', '梅花', '方片'][s] || ''; }
function numberName (n) { if (n === 0) return '♠JOKER'; if (n === 14) return '♥JOKER'; if (n === -1 || !n) return '—'; return LL['number' + n] || String(n); }
function suitSymbol (s) { return ['', '♠', '♥', '♣', '♦'][s] || ''; }
function suitClass (s) { return ['', 'spade', 'heart', 'club', 'diamond'][s] || ''; }
function kingdomName (k) { return LL[k] || k; }
function typeName (t) { return LL['type' + t] || ['', '基本牌', '锦囊牌', '装备牌'][t] || ''; }
function genderName (g) { return g === 2 ? '女' : '男'; }
function generalNameHtml (g) {
    var html = '';
    var prefix = (g.asset && g.asset.info && g.asset.info.prefix) || '';
    var version = (g.asset && g.asset.info && g.asset.info.version) || '';
    if (prefix) html += '<span class="name-prefix">' + prefix + '</span>';
    html += g.lang_name;
    if (version) html += ' <span class="badge-version">' + version + '</span>';
    return html;
}

// 获取 asset.info 的辅助函数
function assetInfo (g, field) {
    return (g.asset && g.asset.info && g.asset.info[field]) || '';
}

// 获取武将所属势力
function genKingdom (g) { return (g.gen && g.gen.kingdom) || ''; }

// 武将图片 URL (参考 General.getAssetsUrl('image'))
function generalImageUrl (g) {
    var skin = g._skin || {};
    var genName = (g.gen && g.gen.name) || '';
    var base = skin.baseUrl || g.key || genName;
    var img = skin.image || 'image';
    if (img.indexOf('/') !== -1) return GAME_IMG + img + '.png';
    return GAME_IMG + base + '/' + img + '.png';
}
// 音频 URL
function audioUrl (path) { if (!path) return ''; return AUDIO_BASE + path + '.mp3'; }
// 阵亡配音路径（参考 General.getAssetsUrl('death')）
function deathAudioPath (g) {
    var skin = g._skin || {};
    var base = 'generals/' + (skin.baseUrl || g.key);
    var da = skin.deathAudio;
    if (da && da.url) {
        if (da.url.indexOf('/') !== -1) return 'generals/' + da.url;
        return base + '/' + da.url;
    }
    return base + '/death';
}
// 双将图片
function generalDualImageUrl (g) {
    var skin = g._skin || {};
    var base = skin.baseUrl || g.key;
    var img = skin.image_dual || 'image.dual';
    return GAME_IMG + base + '/' + img + '.png';
}

// ==================== DOM 引用 ====================
var content = document.getElementById('content');
var sidebar = document.getElementById('sidebar');
var overlay = document.getElementById('sidebar-overlay');
var menuToggle = document.getElementById('menu-toggle');
var navLinks, activeAudio = null;

// ==================== 路由 ====================
var currentPage = '';
var state = {
    gens: { search: '', searchId: '', kingdoms: [], genders: [], pack: '', subpack: '', viewMode: 'list', selectedGeneral: null, fromPacks: false, lockFilter: false, descMode: 'desc', previewGeneral: null },
    cards: { search: '', type: 0, pack: '', viewMode: 'list', selectedCard: null, fromPacks: false },
    editor: { basic: {}, assets: {}, _tab: 'general', _populated: false }
};

function route () {
    var hash = location.hash.replace('#', '') || 'home';
    if (hash === currentPage && content.children.length > 0) return;
    currentPage = hash;
    navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function (l) { l.classList.toggle('active', l.dataset.page === hash); });
    switch (hash) {
        case 'home': renderHome(); break;
        case 'cards': renderCards(); break;
        case 'card-packs': renderCardPacks(); break;
        case 'generals': renderGenerals(); break;
        case 'general-packs': renderGeneralPacks(); break;
        case 'rules': renderRules(); break;
        case 'editor': renderEditor(); break;
        default: renderHome();
    }
    closeSidebar();
    content.scrollTop = 0; window.scrollTo(0, 0);
}

// ==================== 侧边栏 ====================
function openSidebar () { sidebar.classList.add('open'); overlay.classList.add('show'); }
function closeSidebar () { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
menuToggle.addEventListener('click', function () { sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
overlay.addEventListener('click', closeSidebar);
window.addEventListener('resize', function () { if (window.innerWidth > 768) closeSidebar(); });
window.addEventListener('hashchange', route);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSidebar(); });

// ==================== 侧边栏规则集目录 ====================
var _R = window.__wikiRules || { toc: [], html: '' };
function initSidebarRulesToc () {
    var container = document.getElementById('sidebar-rules-toc');
    var navLink = document.getElementById('rules-nav-link');
    var toggleIcon = navLink ? navLink.querySelector('.nav-toggle-icon') : null;
    if (!container || !_R.toc || _R.toc.length === 0) return;
    while (container.firstChild) container.removeChild(container.firstChild);

    // 构建侧边栏 TOC
    var ul = el('ul', { className: 'sidebar-toc-list' });
    _R.toc.forEach(function (item) {
        buildSidebarTocItem(ul, item);
    });
    container.appendChild(ul);

    // 点击 TOC 条目 → 跳转到 rules 页面
    container.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = this.getAttribute('href').replace('#', '');
            if (currentPage !== 'rules') {
                location.hash = 'rules';
                setTimeout(function () {
                    var target = document.getElementById(targetId);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
            } else {
                var target = document.getElementById(targetId);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            closeSidebar();
        });
    });

    // 点击"规则集"主链接 → 展开/收缩 TOC；导航到规则页
    if (navLink) {
        navLink.addEventListener('click', function (e) {
            // 如果点击的是规则集链接本身（非 TOC 子元素），切换 TOC
            if (e.target === navLink || e.target === toggleIcon || e.target.parentNode === navLink) {
                // 如果当前已是规则页，则只切换 TOC 不导航
                if (currentPage === 'rules') {
                    e.preventDefault();
                }
                toggleRulesToc();
            }
        });
    }

    // 如果在规则页，自动展开 TOC
    if (currentPage === 'rules') {
        container.style.display = 'block';
        if (toggleIcon) toggleIcon.textContent = '▼';
    }
}

function toggleRulesToc () {
    var container = document.getElementById('sidebar-rules-toc');
    var icon = document.querySelector('#rules-nav-link .nav-toggle-icon');
    if (!container) return;
    if (container.style.display === 'none') {
        container.style.display = 'block';
        if (icon) icon.textContent = '▼';
    } else {
        container.style.display = 'none';
        if (icon) icon.textContent = '▶';
    }
}

function buildSidebarTocItem (parentUl, item) {
    var li = el('li', { className: 'sidebar-toc-item level-' + item.level });
    var a = el('a', { href: '#' + item.id }, item.text);
    li.appendChild(a);
    if (item.children && item.children.length > 0) {
        var toggle = el('span', {
            className: 'sidebar-toc-toggle', onclick: function (e) {
                e.stopPropagation(); e.preventDefault();
                var sub = this.parentNode.querySelector('ul');
                if (sub) {
                    var hidden = sub.style.display === 'none';
                    sub.style.display = hidden ? 'block' : 'none';
                    this.textContent = hidden ? '▼' : '▶';
                }
            }
        }, '▼');
        li.insertBefore(toggle, a);
        var subUl = el('ul', { className: 'sidebar-toc-sublist' });
        item.children.forEach(function (child) {
            buildSidebarTocItem(subUl, child);
        });
        li.appendChild(subUl);
    }
    parentUl.appendChild(li);
}

setTimeout(initSidebarRulesToc, 200);

// ==================== DOM 工具 ====================
function el (tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
        if (k === 'className') e.className = attrs[k];
        else if (k === 'innerHTML') e.innerHTML = attrs[k];
        else if (k === 'style') {
            if (typeof attrs[k] === 'string') e.style.cssText = attrs[k];
            else Object.assign(e.style, attrs[k]);
        }
        else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else e.setAttribute(k, attrs[k]);
    }
    if (children !== undefined && children !== null) {
        if (typeof children === 'string') e.textContent = children;
        else if (Array.isArray(children)) children.forEach(function (c) { if (c) e.appendChild(c); });
        else if (children instanceof Node) e.appendChild(children);
    }
    return e;
}
function clearContent () { while (content.firstChild) content.removeChild(content.firstChild); }

// ==================== 音频 ====================
function playAudio (path, btn) {
    if (activeAudio) {
        activeAudio.pause(); activeAudio = null;
        document.querySelectorAll('.btn-audio.playing').forEach(function (b) { b.classList.remove('playing'); });
    }
    if (!path) return;
    var url = audioUrl(path);
    var a = new Audio(url);
    a.play().catch(function () { });
    activeAudio = a;
    if (btn) { btn.classList.add('playing'); a.addEventListener('ended', function () { btn.classList.remove('playing'); }); }
}

// ==================== 首页 ====================
function renderHome () {
    clearContent();
    var cardTypes = Object.keys(_C.cardsByName).length;
    var cardPacks = Object.keys(_C.cardsByPack).length;
    var genCount = Object.keys(_G.allGenerals).length;
    var genPackCount = Object.keys(_G.generalsByPack).length;
    var page = el('div', { className: 'wiki-page home-page' });

    page.appendChild(el('div', { className: 'hero', innerHTML: '<h1>⚔ 新神杀RE Wiki</h1><p class="hero-desc">三国杀卡牌与武将资料库</p>' }));

    // 卡牌类
    page.appendChild(el('h2', { className: 'home-section-title' }, '🃏 卡牌'));
    var csRow = el('div', { className: 'stats-row' });
    csRow.appendChild(buildStatCard('#cards', '卡牌', cardTypes, '牌名'));
    csRow.appendChild(buildStatCard('#card-packs', '卡牌扩展包', cardPacks, '扩展包'));
    page.appendChild(csRow);

    // 武将类
    page.appendChild(el('h2', { className: 'home-section-title' }, '👤 武将'));
    var gsRow = el('div', { className: 'stats-row' });
    gsRow.appendChild(buildStatCard('#generals', '武将', genCount, '名'));
    gsRow.appendChild(buildStatCard('#general-packs', '武将扩展包', genPackCount, '扩展包'));
    page.appendChild(gsRow);

    page.appendChild(el('div', {
        className: 'quick-links', innerHTML:
            '<a href="#editor" class="quick-link-card" style="grid-column:1/-1">✏ 武将编辑器 →</a>'
    }));

    content.appendChild(page);
}
function buildStatCard (href, label, num, unit) {
    return el('div', { className: 'stat-card', innerHTML: '<a href="' + href + '"><span class="stat-num">' + num + '</span><span class="stat-label">' + label + '</span></a>' });
}

// ==================== 卡牌页面 ====================
function renderCards () {
    clearContent();
    var page = el('div', { className: 'wiki-page cards-page' });

    // fromPacks 模式：显示返回按钮 + 按包展示
    if (state.cards.fromPacks) {
        var backBar = el('div', { className: 'back-bar' });
        var backBtn = el('button', {
            className: 'btn-back', onclick: function () {
                if (state.cards.viewMode === 'card-detail') {
                    // 返回 pack-detail
                    state.cards.viewMode = 'pack-detail'; state.cards.selectedCard = null;
                    renderCards();
                } else {
                    // 返回卡牌扩展包列表
                    state.cards.fromPacks = false; state.cards.pack = ''; state.cards.viewMode = 'list';
                    state.cards.selectedCard = null;
                    location.hash = 'card-packs';
                }
            }
        }, '← 返回' + (state.cards.viewMode === 'card-detail' ? '扩展包' : ''));
        backBar.appendChild(backBtn);
        page.appendChild(backBar);

        if (state.cards.viewMode === 'card-detail' && state.cards.selectedCard) {
            // 卡牌详情模式
            var card = _C.cardsByName[state.cards.selectedCard];
            if (card) page.appendChild(buildCardSection(card));
        } else {
            // 按包展示模式
            var container = el('div', { className: 'cards-list-container' });
            renderCardsByPack(page, container);
            page.appendChild(container);
        }
        content.appendChild(page);
        return;
    }

    // 默认模式：搜索 + 类型筛选（无扩展包筛选）
    var tb = el('div', { className: 'wiki-toolbar' });
    var sr = el('div', { className: 'search-row' });
    var si = el('input', {
        className: 'search-input', type: 'text', placeholder: '🔍 搜索卡牌名...', value: state.cards.search,
        oninput: function (e) { state.cards.search = e.target.value; refreshCards(page); }
    });
    var ts = el('select', {
        className: 'filter-select',
        onchange: function (e) { state.cards.type = parseInt(e.target.value); refreshCards(page); }
    });
    ts.innerHTML = '<option value="0">全部类型</option><option value="1">基本牌</option><option value="2">锦囊牌</option><option value="3">装备牌</option>';
    ts.value = String(state.cards.type);
    sr.appendChild(si); sr.appendChild(ts);
    tb.appendChild(sr);
    var rc = el('span', { className: 'result-count' });
    tb.appendChild(rc);
    page.appendChild(tb);
    var container = el('div', { className: 'cards-list-container' });
    page.appendChild(container);
    content.appendChild(page);
    refreshCards(page);
}

function refreshCards (page) {
    var container = page.querySelector('.cards-list-container');
    while (container.firstChild) container.removeChild(container.firstChild);

    var filtered = [];
    for (var name in _C.cardsByName) {
        var d = _C.cardsByName[name];
        if (!d.lang_name) continue;
        if (state.cards.search && d.lang_name.indexOf(state.cards.search) === -1 && d.acronym.indexOf(state.cards.search) === -1 && name.indexOf(state.cards.search.toLowerCase()) === -1) continue;
        if (state.cards.type && d.type !== state.cards.type) continue;
        filtered.push(d);
    }
    filtered.sort(function (a, b) { return a.acronym.localeCompare(b.acronym, 'zh'); });

    var rc = page.querySelector('.result-count');
    if (rc) rc.textContent = '共 ' + filtered.length + ' 种卡牌';

    filtered.forEach(function (card) { container.appendChild(buildCardSection(card)); });
}

function buildCardSection (card) {
    var sec = el('div', { className: 'card-detail-section' });
    var title = el('h3', { className: 'card-title', innerHTML: card.lang_name + ' <small>(' + card.name + ')</small>' });
    sec.appendChild(title);

    var metaHtml = '<span class="badge-type">' + typeName(card.type) + '</span>';
    if (card.damage) metaHtml += '<span class="badge-damage">伤害</span>';
    if (card.recover) metaHtml += '<span class="badge-recover">回复</span>';
    var meta = el('div', { className: 'card-meta', innerHTML: metaHtml });
    sec.appendChild(meta);

    if (card.lang_desc) { var d = el('div', { className: 'card-desc' }, card.lang_desc); sec.appendChild(d); }
    if (card.lang_desc2 && card.lang_desc2 !== card.lang_desc) { var d2 = el('div', { className: 'card-desc2' }, card.lang_desc2); sec.appendChild(d2); }

    if (card.instances.length > 0) {
        var det = el('details', { className: 'card-instances-detail' });
        var packs = {};
        card.instances.forEach(function (c) {
            var pn = c.packName || c.pack;
            if (!packs[pn]) packs[pn] = [];
            packs[pn].push(c);
        });
        var pnKeys = Object.keys(packs);
        var sum = el('summary');
        sum.textContent = '查看实体牌 (共' + card.instances.length + '张，' + pnKeys.length + '个扩展包)';
        det.appendChild(sum);
        var il = el('div', { className: 'instances-list' });
        pnKeys.forEach(function (pn) {
            var pd = el('div', { className: 'instance-pack' });
            pd.appendChild(el('h5', {}, pn));
            var grid = el('div', { className: 'instance-grid' });
            packs[pn].forEach(function (c) {
                var sc = suitClass(c.suit) + (c.suit === 2 || c.suit === 4 ? ' suit-red' : '');
                var s = el('span', { className: 'instance-card ' + sc }, suitSymbol(c.suit) + numberName(c.number));
                grid.appendChild(s);
            });
            pd.appendChild(grid); il.appendChild(pd);
        });
        det.appendChild(il); sec.appendChild(det);
    }
    return sec;
}

function renderCardsByPack (page, container) {
    var pack = _C.cardsByPack[state.cards.pack];
    if (!pack) return;
    var byName = {};
    pack.cards.forEach(function (c) {
        var bn = c.name.replace(/_\w+$/, '');
        if (!byName[bn]) byName[bn] = [];
        byName[bn].push(c);
    });
    var sec = el('div', { className: 'pack-section' });
    sec.appendChild(el('h3', {}, pack.displayName + ' (' + pack.cards.length + '张)'));
    var grid = el('div', { className: 'pack-cards-grid' });
    for (var bn in byName) {
        (function (cardName) {
            byName[cardName].forEach(function (c) {
                var cnName = c.lang_name || T(c.name) || c.acronym;
                var suitCls = (c.suit === 2 || c.suit === 4) ? ' suit-red' : '';
                var item = el('div', {
                    className: 'pack-card-item', innerHTML:
                        '<div class="card-name">' + suitSymbol(c.suit) + ' ' + numberName(c.number) + ' <b>' + cnName + '</b></div>' +
                        '<div class="card-attr' + suitCls + '">' + suitName(c.suit) + ' · ' + c.acronym + '</div>'
                });
                item.style.cursor = 'pointer';
                item.addEventListener('click', function () {
                    state.cards.viewMode = 'card-detail'; state.cards.selectedCard = cardName;
                    renderCards();
                });
                grid.appendChild(item);
            });
        })(bn);
    }
    sec.appendChild(grid); container.appendChild(sec);

    var rc = page.querySelector('.result-count');
    if (rc) rc.textContent = pack.displayName + ' · ' + pack.cards.length + '张实体牌';
}

// ==================== 卡牌扩展包页面 ====================
function renderCardPacks () {
    clearContent();
    var page = el('div', { className: 'wiki-page packs-page' });
    page.appendChild(el('h2', {}, '📦 卡牌扩展包'));
    var grid = el('div', { className: 'packs-grid' });
    var packKeys = Object.keys(_C.cardsByPack);
    packKeys.forEach(function (pk) {
        var p = _C.cardsByPack[pk];
        var card = el('div', {
            className: 'pack-card', onclick: function () {
                state.cards.pack = pk; state.cards.fromPacks = true; state.cards.viewMode = 'pack-detail';
                state.cards.selectedCard = null; state.cards.search = ''; state.cards.type = 0;
                location.hash = 'cards';
            }
        });
        card.appendChild(el('h3', {}, p.displayName || pk));
        card.appendChild(el('p', { className: 'pack-count' }, p.cards.length + ' 张牌'));
        grid.appendChild(card);
    });
    page.appendChild(grid);
    content.appendChild(page);
}

// ==================== 武将页面 ====================
function renderGenerals () {
    clearContent();
    var page = el('div', { className: 'wiki-page generals-page' });

    // detail 模式：武将详情
    if (state.gens.viewMode === 'detail' && state.gens.selectedGeneral) {
        var isPreview = state.gens.selectedGeneral === '_preview_';
        var backBar = el('div', { className: 'back-bar' });
        backBar.appendChild(el('button', {
            className: 'btn-back', onclick: function () {
                state.gens.viewMode = 'list'; state.gens.selectedGeneral = null;
                state.gens.previewGeneral = null;
                if (isPreview) { location.hash = 'editor'; } else { renderGenerals(); }
            }
        }, '← 返回'));
        page.appendChild(backBar);

        if (isPreview) {
            page.appendChild(el('div', { className: 'preview-banner', innerHTML: '⚠ 当前为编辑器预览，数据未保存' }));
        }

        var g = isPreview ? state.gens.previewGeneral : _G.allGenerals[state.gens.selectedGeneral];
        if (g) page.appendChild(buildGeneralDetail(g));
        content.appendChild(page);
        return;
    }

    // fromPacks 模式：显示返回按钮 + 面包屑，然后走正常列表渲染（但隐藏扩展包子包筛选）
    if (state.gens.fromPacks && state.gens.pack) {
        var backBar = el('div', { className: 'back-bar' });
        backBar.appendChild(el('button', {
            className: 'btn-back', onclick: function () {
                state.gens.fromPacks = false; state.gens.lockFilter = false;
                state.gens.pack = ''; state.gens.subpack = ''; state.gens.viewMode = 'list';
                location.hash = 'general-packs';
            }
        }, '← 返回扩展包'));
        // 面包屑：包 > 子包
        var pd = _G.generalsByPack[state.gens.pack];
        var crumb = pd ? pd.displayName : state.gens.pack;
        if (state.gens.subpack && pd) {
            var sp = null;
            pd.subpacks.forEach(function (s) { if (s.name === state.gens.subpack) sp = s; });
            crumb += ' › ' + (sp ? sp.displayName : state.gens.subpack);
        }
        backBar.appendChild(el('span', { className: 'breadcrumb-path' }, crumb));
        page.appendChild(backBar);
    }

    // 默认列表模式：搜索 + 筛选 + 简化的武将列表（仅ID+图+名）
    var tb = el('div', { className: 'wiki-toolbar' });
    var sr = el('div', { className: 'search-row' });
    var si = el('input', {
        className: 'search-input', type: 'text', placeholder: '🔍 搜索武将名...', value: state.gens.search,
        oninput: function (e) { state.gens.search = e.target.value; refreshGenerals(page); }
    });
    var sid = el('input', {
        className: 'search-input', type: 'text', placeholder: '🆔 按ID检索 (如 WEI001)...', value: state.gens.searchId,
        oninput: function (e) { state.gens.searchId = e.target.value; refreshGenerals(page); }
    });
    sr.appendChild(si); sr.appendChild(sid); tb.appendChild(sr);

    // 势力 checkbox
    var fr1 = el('div', { className: 'filter-row' });
    var cbg1 = el('div', { className: 'checkbox-group' });
    cbg1.appendChild(el('span', { className: 'checkbox-group-label' }, '势力:'));
    KINGDOMS.forEach(function (k) {
        var wrap = el('div', { className: 'checkbox-chip ' + k });
        var cb = el('input', {
            type: 'checkbox', value: k,
            onchange: function (e) {
                if (e.target.checked) state.gens.kingdoms.push(k);
                else { var i = state.gens.kingdoms.indexOf(k); if (i > -1) state.gens.kingdoms.splice(i, 1); }
                refreshGenerals(page);
            }
        });
        if (state.gens.kingdoms.indexOf(k) > -1) cb.checked = true;
        var lb = el('label', {}, kingdomName(k));
        wrap.appendChild(cb); wrap.appendChild(lb);
        wrap.addEventListener('click', function (e) { if (e.target !== cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); } });
        cbg1.appendChild(wrap);
    });
    fr1.appendChild(cbg1);
    // 性别 checkbox
    var cbg2 = el('div', { className: 'checkbox-group' });
    cbg2.appendChild(el('span', { className: 'checkbox-group-label' }, '性别:'));
    GENDERS.forEach(function (g) {
        var wrap = el('div', { className: 'checkbox-chip' });
        var cb = el('input', {
            type: 'checkbox', value: g.v,
            onchange: function (e) {
                if (e.target.checked) state.gens.genders.push(g.v);
                else { var i = state.gens.genders.indexOf(g.v); if (i > -1) state.gens.genders.splice(i, 1); }
                refreshGenerals(page);
            }
        });
        if (state.gens.genders.indexOf(g.v) > -1) cb.checked = true;
        var lb = el('label', {}, g.n);
        wrap.appendChild(cb); wrap.appendChild(lb);
        wrap.addEventListener('click', function (e) { if (e.target !== cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); } });
        cbg2.appendChild(wrap);
    });
    fr1.appendChild(cbg2); tb.appendChild(fr1);

    // 扩展包 + 子包（lockFilter 时隐藏）
    if (!state.gens.lockFilter) {
        var fr2 = el('div', { className: 'filter-row' });
        var ps = el('select', {
            className: 'filter-select',
            onchange: function (e) {
                state.gens.pack = e.target.value; state.gens.subpack = '';
                refreshGenerals(page);
                rebuildSubpackSelect(page, e.target.value);
            }
        });
        ps.innerHTML = '<option value="">全部扩展包</option>';
        for (var pk in _G.generalsByPack) ps.innerHTML += '<option value="' + pk + '">' + _G.generalsByPack[pk].displayName + '</option>';
        ps.value = state.gens.pack;
        fr2.appendChild(ps);
        var sps = el('select', {
            className: 'filter-select', id: 'subpack-select',
            onchange: function (e) { state.gens.subpack = e.target.value; refreshGenerals(page); }
        });
        sps.innerHTML = '<option value="">全部子包</option>';
        fr2.appendChild(sps);
        if (state.gens.pack) rebuildSubpackSelect(page, state.gens.pack, true);
        var rc = el('span', { className: 'result-count' });
        fr2.appendChild(rc); tb.appendChild(fr2);
    } else {
        var rc = el('span', { className: 'result-count' });
        tb.appendChild(rc);
    }

    page.appendChild(tb);
    var grid = el('div', { className: 'generals-grid' });
    page.appendChild(grid);
    content.appendChild(page);
    refreshGenerals(page);
}

function rebuildSubpackSelect (page, packName, init) {
    var sps = document.getElementById('subpack-select');
    if (!sps) return;
    sps.innerHTML = '<option value="">全部子包</option>';
    if (packName && _G.generalsByPack[packName]) {
        _G.generalsByPack[packName].subpacks.forEach(function (sp) {
            sps.innerHTML += '<option value="' + sp.name + '">' + sp.displayName + '</option>';
        });
    }
    if (init && state.gens.subpack) sps.value = state.gens.subpack;
}

function refreshGenerals (page) {
    var grid = page.querySelector('.generals-grid');
    if (!grid) return;
    while (grid.firstChild) grid.removeChild(grid.firstChild);

    var filtered = [];
    for (var key in _G.allGenerals) {
        var g = _G.allGenerals[key];
        if (state.gens.kingdoms.length > 0 && state.gens.kingdoms.indexOf(genKingdom(g)) === -1) continue;
        if (state.gens.genders.length > 0 && state.gens.genders.indexOf((g.gen && g.gen.gender) || 0) === -1) continue;
        if (state.gens.pack && g.pack !== state.gens.pack) continue;
        if (state.gens.subpack && g.subpack !== state.gens.subpack) continue;
        if (state.gens.searchId && assetInfo(g, 'id') !== state.gens.searchId) continue;
        if (state.gens.search) {
            var s = state.gens.search.toLowerCase();
            var genName = (g.gen && g.gen.name) || '';
            if (g.lang_name.indexOf(state.gens.search) === -1 && genName.indexOf(s) === -1 && assetInfo(g, 'title').indexOf(state.gens.search) === -1 && assetInfo(g, 'id').toLowerCase().indexOf(s) === -1) continue;
        }
        filtered.push(g);
    }
    filtered.sort(function (a, b) { return (assetInfo(a, 'id') || '').localeCompare(assetInfo(b, 'id') || '', 'zh'); });

    var rc = page.querySelector('.result-count');
    if (rc) rc.textContent = '共 ' + filtered.length + ' 名武将';

    // 默认模式：简化卡片（ID + 图 + 名字）
    filtered.forEach(function (g) { grid.appendChild(buildGeneralSimple(g)); });
}

// 简化武将条目：图在上，ID+名字在下（图鉴风格）
function buildGeneralSimple (g) {
    var card = el('div', {
        className: 'general-simple kingdom-' + genKingdom(g), onclick: function () {
            state.gens.viewMode = 'detail'; state.gens.selectedGeneral = g.key; renderGenerals();
        }
    });
    var img = el('img', {
        className: 'gen-simple-img', src: generalImageUrl(g),
        onerror: function () { this.style.display = 'none'; }
    });
    card.appendChild(img);
    var info = el('div', { className: 'gen-simple-info' });
    info.appendChild(el('span', { className: 'gen-simple-id' }, assetInfo(g, 'id') || '—'));
    info.appendChild(el('span', { className: 'gen-simple-name', innerHTML: generalNameHtml(g) }));
    card.appendChild(info);
    return card;
}

// 武将详情
function buildGeneralDetail (g) {
    var wrap = el('div', { className: 'general-detail' });
    // 头部
    var header = el('div', { className: 'general-detail-header' });
    var avatar = el('img', {
        className: 'general-avatar', src: generalImageUrl(g),
        onerror: function () { this.style.display = 'none'; }
    });
    header.appendChild(avatar);
    var info = el('div', { className: 'general-info' });
    // 右上角编辑按钮
    var editBtn = el('button', {
        className: 'btn-edit-json', onclick: function (e) {
            e.stopPropagation();
            populateEditorFromGeneral(g);
            location.hash = 'editor';
        }
    }, '✏ 编辑JSON');
    info.appendChild(editBtn);
    var nameHtml = generalNameHtml(g);
    if (g.gen && g.gen.lord) nameHtml += ' <span class="badge-lord">主</span>';
    info.appendChild(el('h3', { className: 'general-name', innerHTML: nameHtml }));
    info.appendChild(el('div', {
        className: 'general-meta', innerHTML:
            '<span class="meta-id">' + (assetInfo(g, 'id') || '—') + '</span>' +
            '<span class="meta-title">' + (assetInfo(g, 'title') || '') + '</span>' +
            '<span class="meta-kingdom k-' + genKingdom(g) + '">' + kingdomName(genKingdom(g)) + '</span>'
    }));
    var hp = (g.gen && g.gen.hp) || 0;
    var maxHp = (g.gen && g.gen.maxHp);
    var gender = (g.gen && g.gen.gender) || 0;
    info.appendChild(el('div', {
        className: 'general-stats', innerHTML:
            '<span>体力: ' + hp + (maxHp && maxHp !== hp ? '/' + maxHp : '') + '</span>' +
            '<span>' + genderName(gender) + '</span>'
    }));
    if (g.packName) {
        var packPath = g.packName;
        if (g.subpackName && g.subpackName !== g.packName) packPath += ' > ' + g.subpackName;
        info.appendChild(el('div', { className: 'general-pack-path', innerHTML: packPath }));
    }
    var skin0 = (g.asset && g.asset.skins && g.asset.skins[0]) || {};
    var creds = '';
    if (assetInfo(g, 'designer')) creds += '<small>设计: ' + assetInfo(g, 'designer') + '</small>';
    if (skin0.painter) creds += '<small>插画: ' + skin0.painter + '</small>';
    if (skin0.cv) creds += '<small>CV: ' + skin0.cv + '</small>';
    if (creds) info.appendChild(el('div', { className: 'general-credits', innerHTML: creds }));
    header.appendChild(info); wrap.appendChild(header);

    // 技能表格（2列：技能名 | 描述）
    // 描述切换按钮
    var descToggle = el('button', {
        className: 'btn-sm desc-toggle', type: 'button', onclick: function () {
            state.gens.descMode = state.gens.descMode === 'desc' ? 'desc2' : 'desc';
            // 更新所有技能描述
            var descCells = wrap.querySelectorAll('.skill-desc');
            descCells.forEach(function (cell, i) {
                var s = skillList[i];
                if (!s) return;
                var dm = cell.querySelector('.desc-main');
                if (dm) dm.innerHTML = renderSkillDesc(state.gens.descMode === 'desc2' && s.desc2 ? s.desc2 : (s.desc || '(暂无描述)'));
                // 更新切换按钮文字
                descToggle.textContent = '描述: ' + (state.gens.descMode === 'desc' ? '标准' : '详细');
            });
        }
    }, '描述: 标准');

    var skillList = g.skillList || [];
    if (skillList.length > 0) {
        var ss = el('div', { className: 'skills-section' });
        var skillHeader = el('div', { className: 'skills-header' });
        skillHeader.appendChild(el('h4', {}, '技能 (' + skillList.length + ')'));
        skillHeader.appendChild(descToggle);
        ss.appendChild(skillHeader);
        var table = el('table', {
            className: 'skills-table', innerHTML:
                '<thead><tr><th>技能名</th><th>描述</th></tr></thead>'
        });
        var tbody = el('tbody');
        skillList.forEach(function (s) {
            var tr = el('tr', { className: s.isDerived ? 'derived-skill' : '' });
            var tdName = el('td', { className: 'skill-name' });
            var nameDiv = el('div', {}, s.name);
            tdName.appendChild(nameDiv);
            if (s.isDerived) tdName.appendChild(el('div', { className: 'badge-derived' }, '衍生技'));
            tr.appendChild(tdName);
            var tdDesc = el('td', { className: 'skill-desc' });
            var showDesc = state.gens.descMode === 'desc2' && s.desc2 ? s.desc2 : (s.desc || '(暂无描述)');
            tdDesc.appendChild(el('div', { className: 'desc-main', innerHTML: renderSkillDesc(showDesc) }));
            if (s.audios.length > 0) {
                var al = el('div', { className: 'audio-list' });
                s.audios.forEach(function (a, i) {
                    var ai = el('div', { className: 'audio-item' });
                    var btn = el('button', {
                        className: 'btn-audio', type: 'button',
                        onclick: function (e) { playAudio(a.url, e.target); }
                    }, '▶ ' + (i + 1));
                    ai.appendChild(btn);
                    if (a.text) ai.appendChild(el('span', { className: 'audio-text' }, a.text));
                    // 缩短地址：去掉 RES_BASE 前缀
                    ai.appendChild(el('span', { className: 'audio-url' }, audioShortUrl(a.url)));
                    al.appendChild(ai);
                });
                tdDesc.appendChild(al);
            }
            tr.appendChild(tdDesc);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody); ss.appendChild(table); wrap.appendChild(ss);
    }

    // 阵亡配音
    var deathAudio = g._skin && g._skin.deathAudio;
    if (deathAudio && deathAudio.text) {
        var ds = el('div', { className: 'death-section' });
        ds.appendChild(el('h4', {}, '阵亡配音'));
        var db = el('button', {
            className: 'btn-audio btn-death', type: 'button',
            onclick: function (e) { playAudio(deathAudioPath(g), e.target); }
        }, '▶ 阵亡');
        ds.appendChild(db);
        ds.appendChild(el('span', { className: 'audio-text' }, deathAudio.text));
        ds.appendChild(el('span', { className: 'audio-url' }, audioShortUrl(deathAudioPath(g))));
        wrap.appendChild(ds);
    }

    // 同名武将
    var relatedGens = findRelatedGenerals(g);
    if (relatedGens.length > 0) {
        var rsec = el('div', { className: 'related-generals-section' });
        rsec.appendChild(el('h4', {}, '同名武将 (' + relatedGens.length + ')'));
        var rgrid = el('div', { className: 'generals-grid' });
        relatedGens.forEach(function (rg) {
            rgrid.appendChild(buildGeneralSimple(rg));
        });
        rsec.appendChild(rgrid);
        wrap.appendChild(rsec);
    }

    return wrap;
}

// 将技能描述中的 <a> 标签替换为可点击的 span，保留其他 HTML 标签
function renderSkillDesc (desc) {
    if (!desc) return '';
    // 把 <a href="...">text</a> 替换为带 data-tip 的 span
    return desc.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, function (m, href, text) {
        // 对 href 内容做 HTML 转义，防止注入
        var safeHref = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return '<span class="skill-tip-link" data-tip="' + safeHref + '" onclick="showSkillTip(event)">' + text + '</span>';
    });
}

// 显示技能提示弹窗
var activeSkillTip = null;
function showSkillTip (event) {
    event.stopPropagation();
    if (activeSkillTip) { activeSkillTip.remove(); activeSkillTip = null; }
    var target = event.target;
    var content = target.getAttribute('data-tip') || '';
    if (!content) return;
    var popup = document.createElement('div');
    popup.className = 'skill-tip-popup';
    popup.innerHTML = content;
    popup.style.position = 'fixed';
    popup.style.maxWidth = '400px';
    var rect = target.getBoundingClientRect();
    popup.style.left = Math.min(rect.left, window.innerWidth - 420) + 'px';
    popup.style.top = (rect.bottom + 4) + 'px';
    document.body.appendChild(popup);
    activeSkillTip = popup;
    setTimeout(function () {
        document.addEventListener('click', function closeTip () {
            if (popup.parentNode) popup.remove();
            activeSkillTip = null;
            document.removeEventListener('click', closeTip);
        });
    }, 0);
}

// 缩短音频 URL 显示（去掉 http://res.resgs.com/ 前缀）
function audioShortUrl (path) {
    if (!path) return '';
    var full = audioUrl(path);
    // 去掉 RES_BASE 前缀
    if (full.indexOf(RES_BASE) === 0) return full.substring(RES_BASE.length);
    return full;
}

// 从武将 g 查找所有同名（真名即最后一个.后的部分相同）的其他武将
function findRelatedGenerals (g) {
    var results = [];
    var targetName = (g.gen && g.gen.name) || g.name || '';
    // 获取真名（最后一个 . 后的部分）
    var trueName = targetName.indexOf('.') !== -1 ? targetName.split('.').pop() : targetName;
    if (!trueName) return results;
    for (var key in _G.allGenerals) {
        if (key === g.key) continue;
        var og = _G.allGenerals[key];
        var ogName = (og.gen && og.gen.name) || og.name || '';
        var ogTrueName = ogName.indexOf('.') !== -1 ? ogName.split('.').pop() : ogName;
        if (ogTrueName === trueName) results.push(og);
    }
    return results;
}

// 从武将数据填充编辑器表单
function populateEditorFromGeneral (g) {
    var gen = g.gen || {};
    var asset = g.asset || {};
    var skin0 = (asset.skins && asset.skins[0]) || {};
    var death = (skin0.audios && skin0.audios.death) || {};

    // 基本信息
    state.editor.basic.name = gen.name || g.name || '';
    state.editor.basic.kingdom = gen.kingdom || '';
    state.editor.basic.kingdomCustom = '';
    var hpVal = Array.isArray(gen.hp) ? gen.hp : [gen.hp || 4];
    state.editor.basic.hp = String(hpVal[0] || '');
    state.editor.basic.maxHp = hpVal.length > 1 ? String(hpVal[1]) : '';
    state.editor.basic.armor = hpVal.length > 2 ? String(hpVal[2]) : '';
    state.editor.basic.gender = gen.gender || 0;
    state.editor.basic.lord = gen.lord || false;
    state.editor.basic.enable = gen.enable !== false;
    state.editor.basic.hidden = !!gen.hidden;
    state.editor.basic.isWars = !!gen.isWars;
    state.editor.basic.rs = Array.isArray(gen.rs) ? gen.rs.slice() : [];

    // 技能列表
    var skillsArr = [];
    (gen.skills || []).forEach(function (sk) {
        var derived = sk.startsWith('#');
        var actualKey = derived ? sk.slice(1) : sk;
        var sd = g.skillsData ? (g.skillsData[actualKey] || {}) : {};
        skillsArr.push({
            name: actualKey,
            lang_name: sd.lang_name || '',
            lang_desc: sd.lang_desc || '',
            lang_desc2: sd.lang_desc2 || '',
            isDerived: derived,
            audios: (sd.audios || []).map(function (a) { return { url: a.url || '', translation: a.translation || '' }; })
        });
    });
    state.editor.basic.skills = skillsArr;

    // 资源信息
    state.editor.assets.infoId = (asset.info && asset.info.id) || '';
    state.editor.assets.infoTitle = (asset.info && asset.info.title) || '';
    state.editor.assets.infoVersion = (asset.info && asset.info.version) || '';
    state.editor.assets.infoPrefix = (asset.info && asset.info.prefix) || '';
    state.editor.assets.infoDesigner = (asset.info && asset.info.designer) || '';
    state.editor.assets.infoScript = (asset.info && asset.info.script) || '';
    state.editor.assets.skins = (asset.skins || []).map(function (sk) {
        var d = (sk.audios && sk.audios.death) || {};
        return {
            name: sk.name || 'default',
            painter: sk.painter || '',
            cv: sk.cv || '',
            baseUrl: sk.baseUrl || '',
            image: sk.image || '',
            isDual: sk.isDualImage || false,
            deathUrl: d.url || '',
            deathTranslation: d.translation || ''
        };
    });
    if (state.editor.assets.skins.length === 0) {
        state.editor.assets.skins = [{ name: 'default', painter: '', cv: '', baseUrl: '', image: '', isDual: false, deathUrl: '', deathTranslation: '' }];
    }

    // 标记为已填充，防止 renderEditor 重置数据
    state.editor._populated = true;
    state.editor._tab = 'both';
}

// ==================== 武将扩展包页面 ====================
function renderGeneralPacks () {
    clearContent();
    var page = el('div', { className: 'wiki-page packs-page' });
    page.appendChild(el('h2', {}, '📚 武将扩展包'));

    var pkKeys = Object.keys(_G.generalsByPack);
    pkKeys.forEach(function (pk) {
        var pd = _G.generalsByPack[pk];
        var totalGens = 0;
        pd.subpacks.forEach(function (sp) { totalGens += sp.generals.length; });

        var sec = el('div', { className: 'gen-pack-section' });
        // 包头：点击跳转
        var header = el('div', {
            className: 'gen-pack-header', onclick: function () {
                state.gens.pack = pk; state.gens.subpack = ''; state.gens.fromPacks = true;
                state.gens.lockFilter = true; state.gens.viewMode = 'list'; state.gens.selectedGeneral = null;
                state.gens.search = ''; state.gens.searchId = ''; state.gens.kingdoms = []; state.gens.genders = [];
                location.hash = 'generals';
            }
        });
        header.appendChild(el('h3', {}, pd.displayName || pk));
        header.appendChild(el('span', { className: 'pack-count' }, totalGens + ' 名武将'));
        sec.appendChild(header);

        // 子包列表（可收缩）
        var subList = el('div', { className: 'gen-subpack-list' });
        pd.subpacks.forEach(function (sp) {
            var spItem = el('div', {
                className: 'gen-subpack-item', onclick: function (e) {
                    e.stopPropagation();
                    state.gens.pack = pk; state.gens.subpack = sp.name; state.gens.fromPacks = true;
                    state.gens.lockFilter = true; state.gens.viewMode = 'list'; state.gens.selectedGeneral = null;
                    state.gens.search = ''; state.gens.searchId = ''; state.gens.kingdoms = []; state.gens.genders = [];
                    location.hash = 'generals';
                }
            });
            spItem.appendChild(el('span', {}, sp.displayName));
            spItem.appendChild(el('span', { className: 'subpack-count' }, sp.generals.length + ' 名'));
            subList.appendChild(spItem);
        });
        // 默认收缩
        var toggle = el('button', {
            className: 'btn-sm', type: 'button', onclick: function (e) {
                e.stopPropagation();
                subList.style.display = subList.style.display === 'none' ? 'block' : 'none';
                this.textContent = subList.style.display === 'none' ? '▶' : '▼';
            }
        }, '▼');
        header.appendChild(toggle);
        sec.appendChild(subList);
        page.appendChild(sec);
    });
    content.appendChild(page);
}

// ==================== 规则集页面 ====================
function renderRules () {
    clearContent();
    var page = el('div', { className: 'wiki-page rules-page' });
    page.innerHTML = _R.html;
    content.appendChild(page);
}

// ==================== 武将编辑器 ====================
function edField (container, label, opts) {
    /* opts: { key, assets?, placeholder?, type?, options?, onchange? } */
    var f = el('div', { className: 'editor-field' });
    f.appendChild(el('label', {}, label));
    var target = opts.assets ? 'assets' : 'basic';
    var curVal = state.editor[target][opts.key];
    var inp;
    var handler = opts.onchange || function () { refreshEditorOutput(); };
    if (opts.type === 'checkbox') {
        inp = el('input', { type: 'checkbox', onchange: function (e) { state.editor[target][opts.key] = e.target.checked; handler(); } });
        if (curVal) inp.checked = true;
        var wrap = el('div', { className: 'editor-field-inline' });
        wrap.appendChild(inp); wrap.appendChild(el('label', { style: 'margin-bottom:0' }, opts.placeholder || ''));
        f.appendChild(wrap);
    } else if (opts.type === 'select') {
        inp = el('select', { onchange: function (e) { state.editor[target][opts.key] = e.target.value; handler(); } });
        inp.innerHTML = opts.options || '';
        inp.value = curVal || '';
        f.appendChild(inp);
    } else {
        inp = el('input', {
            type: opts.type || 'text', placeholder: opts.placeholder || '',
            value: curVal || '',
            oninput: function (e) { state.editor[target][opts.key] = e.target.value; handler(); }
        });
        f.appendChild(inp);
    }
    container.appendChild(f);
    return inp;
}

// 通用数组字段：可动态添加/删除条目
function renderArrayField (container, label, items, renderItem, addDefault, onUpdate) {
    var wrap = el('div', { className: 'array-field' });
    var hd = el('div', { className: 'array-header' });
    hd.appendChild(el('span', { className: 'array-label' }, label + ' (' + items.length + ')'));
    var addBtn = el('button', {
        className: 'btn-sm', type: 'button', onclick: function () {
            items.push(addDefault());
            rebuildArray(); onUpdate();
        }
    }, '+ 添加');
    hd.appendChild(addBtn);
    wrap.appendChild(hd);

    var list = el('div', { className: 'array-list' });
    function rebuildArray () {
        while (list.firstChild) list.removeChild(list.firstChild);
        items.forEach(function (item, i) {
            var row = el('div', { className: 'array-item' });
            var delBtn = el('button', {
                className: 'btn-sm danger', type: 'button', onclick: function () {
                    items.splice(i, 1); rebuildArray(); onUpdate();
                }
            }, '✕');
            var body = renderItem(item, i, function () { onUpdate(); });
            var rhd = el('div', { className: 'array-item-header' });
            rhd.appendChild(el('span', { className: 'array-item-index' }, '#' + (i + 1)));
            rhd.appendChild(delBtn);
            row.appendChild(rhd);
            row.appendChild(body);
            list.appendChild(row);
        });
        hd.firstChild.textContent = label + ' (' + items.length + ')';
    }
    rebuildArray();
    wrap.appendChild(list);
    container.appendChild(wrap);
    return { rebuild: rebuildArray };
}

// 从编辑器状态构建预览用的武将对象
function buildPreviewGeneral () {
    var b = state.editor.basic;
    var a = state.editor.assets;
    var name = b.name || 'preview';
    var skin0 = (a.skins && a.skins[0]) || {};
    var death = (skin0.deathUrl || skin0.deathTranslation) ? { url: skin0.deathUrl || '', text: skin0.deathTranslation || '' } : null;

    // 构建 gen 数据
    var hpVal = b.hp;
    if (hpVal.indexOf && hpVal.indexOf('.') !== -1) {
        var parts = hpVal.split('.');
        hpVal = [parseInt(parts[0]), parseInt(parts[0]) + 1, 0];
    } else {
        hpVal = parseInt(hpVal) || 4;
    }
    if (b.maxHp) {
        if (!Array.isArray(hpVal)) hpVal = [hpVal, parseInt(b.maxHp) || hpVal];
        else hpVal[1] = parseInt(b.maxHp) || hpVal[1];
    }
    if (b.armor) {
        if (!Array.isArray(hpVal)) hpVal = [hpVal, hpVal, parseInt(b.armor) || 0];
        else { hpVal[2] = parseInt(b.armor) || 0; if (hpVal.length < 3 && !b.maxHp) hpVal[1] = hpVal[0]; }
    }
    var skillsArr = (b.skills || []).map(function (s) { return (s.isDerived ? '#' : '') + s.name; });

    var gen = {
        name: name, kingdom: b.kingdom || '', hp: hpVal,
        skills: skillsArr
    };
    if (b.gender === 2) gen.gender = 2;
    if (b.lord) gen.lord = true;
    if (b.enable === false) gen.enable = false;
    if (b.hidden) gen.hidden = true;
    if (b.isWars) gen.isWars = true;
    if (b.rs && b.rs.length > 0) gen.rs = b.rs.slice();
    if (b.maxHp) gen.maxHp = Array.isArray(hpVal) ? hpVal[1] : parseInt(b.maxHp);

    // 构建 asset 数据
    var info = {};
    if (a.infoId) info.id = a.infoId;
    if (a.infoTitle) info.title = a.infoTitle;
    if (a.infoVersion) info.version = a.infoVersion;
    if (a.infoPrefix) info.prefix = a.infoPrefix;
    if (a.infoDesigner) info.designer = a.infoDesigner;
    if (a.infoScript) info.script = a.infoScript;

    var skins = (a.skins || []).map(function (sk) {
        var s = { name: sk.name || 'default' };
        if (sk.painter) s.painter = sk.painter;
        if (sk.cv) s.cv = sk.cv;
        if (sk.baseUrl) s.baseUrl = sk.baseUrl;
        if (sk.image && sk.image !== 'image') s.image = sk.image;
        if (sk.isDual) s.isDualImage = true;
        if (sk.deathUrl || sk.deathTranslation) {
            s.audios = { death: {} };
            if (sk.deathUrl) s.audios.death.url = sk.deathUrl;
            if (sk.deathTranslation) s.audios.death.translation = sk.deathTranslation;
        }
        return s;
    });
    if (skins.length === 0) skins = [{ name: 'default' }];

    var asset = {};
    if (Object.keys(info).length > 0) asset.info = info;
    asset.skins = skins;

    // 构建 skillsData
    var skillsData = {};
    (b.skills || []).forEach(function (s) {
        if (!s.name) return;
        var sd = { name: s.name };
        if (s.lang_name) sd.lang_name = s.lang_name;
        if (s.lang_desc) sd.lang_desc = s.lang_desc;
        if (s.lang_desc2) sd.lang_desc2 = s.lang_desc2;
        if (s.audios && s.audios.length > 0) sd.audios = s.audios.map(function (a) { return { url: a.url || '', translation: a.translation || '' }; });
        skillsData[s.name] = sd;
    });

    // 构建 skillList
    var skillList = (b.skills || []).map(function (s) {
        return {
            key: s.name, name: s.lang_name || s.name, desc: s.lang_desc || '', desc2: s.lang_desc2 || '',
            isDerived: s.isDerived || false,
            audios: (s.audios || []).map(function (a) { return { url: a.url || '', text: a.translation || '' }; })
        };
    });

    var baseUrl = skin0.baseUrl || name;
    return {
        key: name,
        gen: gen,
        asset: asset,
        skillsData: skillsData,
        lang_name: b.kingdomCustom || name,
        firstLetter: '#',
        pack: '_preview_',
        packName: '预览',
        subpack: '',
        subpackName: '',
        skillList: skillList,
        _skin: {
            baseUrl: baseUrl,
            isDualImage: skin0.isDual || false,
            image: skin0.image || 'image',
            image_dual: 'image.dual',
            image_dual2: 'image.dual.self',
            deathAudio: death
        }
    };
}

function renderEditor () {
    clearContent();

    // 如果不是从武将详情填充来的，则重置 state
    if (!state.editor._populated) {
        state.editor.basic = {
            name: '', kingdom: '', kingdomCustom: '',
            hp: '', maxHp: '', armor: '',
            gender: 0, lord: false,
            enable: true, hidden: false, isWars: false,
            rs: [],
            skills: []
        };
        state.editor.assets = {
            infoId: '', infoTitle: '', infoVersion: '', infoPrefix: '',
            infoDesigner: '', infoScript: '',
            skins: [{ name: 'default', painter: '', cv: '', baseUrl: '', image: '', isDual: false, deathUrl: '', deathTranslation: '' }]
        };
        state.editor._tab = 'general';
    }
    // 重置填充标志
    state.editor._populated = false;

    var page = el('div', { className: 'wiki-page editor-page' });
    var titleRow = el('div', { style: 'display:flex;align-items:center;justify-content:space-between;margin-bottom:6px' });
    titleRow.appendChild(el('h2', { style: 'margin:0' }, '✏ 武将数据可视化编辑器'));
    titleRow.appendChild(el('button', {
        className: 'btn-preview', type: 'button', onclick: function () {
            state.gens.previewGeneral = buildPreviewGeneral();
            state.gens.viewMode = 'detail';
            state.gens.selectedGeneral = '_preview_';
            state.editor._populated = true; // 保持编辑器数据，返回时不重置
            location.hash = 'generals';
        }
    }, '👁 预览'));
    page.appendChild(titleRow);
    page.appendChild(el('p', { style: 'color:#999;font-size:13px;margin-bottom:16px' }, '填写下方表单，自动生成符合 shared/datas 格式的 JSON 数据，可直接复制粘贴到对应 JSON 文件末尾'));

    // ===== 编辑区 =====
    var grid = el('div', { className: 'editor-grid' });

    // ===== 左栏：基本信息 =====
    var bs = el('div', { className: 'editor-section' });
    bs.appendChild(el('h3', {}, '📋 基本信息 (generals JSON)'));

    // name
    (function () {
        var f = el('div', { className: 'editor-field' });
        f.appendChild(el('label', {}, '武将英文名 *'));
        var inp = el('input', {
            type: 'text', placeholder: '如 caocao, simayi',
            value: state.editor.basic.name || '',
            oninput: function (e) { state.editor.basic.name = e.target.value; refreshEditorOutput(); }
        });
        f.appendChild(inp); bs.appendChild(f);
    })();

    // kingdom select + custom input
    (function () {
        var f = el('div', { className: 'editor-field' });
        f.appendChild(el('label', {}, '势力 *'));
        var sel = el('select', {
            onchange: function (e) {
                state.editor.basic.kingdom = e.target.value;
                var ci = document.getElementById('kingdom-custom-input');
                var cw = document.getElementById('kingdom-custom-wrap');
                if (e.target.value === '__custom__') { cw.style.display = 'block'; if (ci) ci.focus(); }
                else { cw.style.display = 'none'; state.editor.basic.kingdomCustom = ''; if (ci) ci.value = ''; }
                refreshEditorOutput();
            }
        });
        sel.innerHTML = '<option value="">选择势力</option><option value="wei">wei 魏</option><option value="shu">shu 蜀</option><option value="wu">wu 吴</option><option value="qun">qun 群</option><option value="jin">jin 晋(紫)</option><option value="god">god 神</option><option value="ye">ye 野</option><option value="cyan">cyan 晋(青)</option><option value="__custom__">🖊 自定义势力...</option>';
        sel.value = state.editor.basic.kingdom || '';
        f.appendChild(sel); bs.appendChild(f);
        var cw = el('div', { id: 'kingdom-custom-wrap', style: 'display:none;margin-top:6px' });
        cw.appendChild(el('input', {
            id: 'kingdom-custom-input', type: 'text', placeholder: '输入自定义势力名...',
            oninput: function (e) { state.editor.basic.kingdomCustom = e.target.value; refreshEditorOutput(); }
        }));
        bs.appendChild(cw);
    })();

    // hp / maxHp / armor
    (function () {
        var f = el('div', { className: 'editor-field editor-row-3' });
        var s1 = el('div', {});
        s1.appendChild(el('label', {}, '体力值 *'));
        s1.appendChild(el('input', { type: 'text', placeholder: '如 4 或 1.5', value: state.editor.basic.hp || '', oninput: function (e) { state.editor.basic.hp = e.target.value; refreshEditorOutput(); } }));
        f.appendChild(s1);
        var s2 = el('div', {});
        s2.appendChild(el('label', {}, '体力上限'));
        s2.appendChild(el('input', { type: 'text', placeholder: '同体力值可不填', value: state.editor.basic.maxHp || '', oninput: function (e) { state.editor.basic.maxHp = e.target.value; refreshEditorOutput(); } }));
        f.appendChild(s2);
        var s3 = el('div', {});
        s3.appendChild(el('label', {}, '护甲值'));
        s3.appendChild(el('input', { type: 'text', placeholder: '可不填', value: state.editor.basic.armor || '', oninput: function (e) { state.editor.basic.armor = e.target.value; refreshEditorOutput(); } }));
        f.appendChild(s3);
        bs.appendChild(f);
    })();

    // gender
    (function () {
        var f = el('div', { className: 'editor-field' });
        f.appendChild(el('label', {}, '性别'));
        var sel = el('select', { onchange: function (e) { state.editor.basic.gender = parseInt(e.target.value); refreshEditorOutput(); } });
        sel.innerHTML = '<option value="0">男 (默认)</option><option value="2">女</option>';
        sel.value = String(state.editor.basic.gender || 0);
        f.appendChild(sel); bs.appendChild(f);
    })();

    // checkboxes row: lord, enable, hidden, isWars
    (function () {
        var f = el('div', { className: 'editor-field' });
        f.appendChild(el('label', {}, '选项'));
        var row = el('div', { className: 'checkbox-row' });
        var chks = [
            ['lord', '是否主公'],
            ['enable', '启用(enable)', true],
            ['hidden', '隐藏(hidden)'],
            ['isWars', '国战武将(isWars)']
        ];
        var rsWrap = null;
        chks.forEach(function (c) {
            var key = c[0], txt = c[1], defVal = c[2];
            var cw = el('div', { className: 'editor-field-inline' });
            var cbk = el('input', {
                type: 'checkbox', onchange: function (e) {
                    state.editor.basic[key] = e.target.checked;
                    if (key === 'isWars') {
                        var rsw = document.getElementById('rs-section');
                        if (rsw) rsw.style.display = e.target.checked ? 'block' : 'none';
                    }
                    refreshEditorOutput();
                }
            });
            if (defVal !== undefined) cbk.checked = defVal;
            if (state.editor.basic[key] !== undefined) cbk.checked = state.editor.basic[key];
            cw.appendChild(cbk);
            cw.appendChild(el('label', { style: 'margin-bottom:0;font-weight:400' }, txt));
            row.appendChild(cw);
        });
        f.appendChild(row); bs.appendChild(f);
    })();

    // 珠联璧合 rs（仅 isWars）
    (function () {
        var wrap = el('div', { id: 'rs-section', style: 'display:none' });
        renderArrayField(wrap, '珠联璧合 (rs)', state.editor.basic.rs,
            function (item, i, onUpdate) {
                var d = el('div', { className: 'array-item-body' });
                d.appendChild(el('input', {
                    type: 'text', placeholder: '如 wars.dianwei', value: item,
                    oninput: function (e) { state.editor.basic.rs[i] = e.target.value; onUpdate(); }
                }));
                return d;
            },
            function () { return ''; },
            function () { refreshEditorOutput(); }
        );
        bs.appendChild(wrap);
    })();

    // 技能列表（放在基本信息面板内）
    var skillSection = el('div', { className: 'sub-section' });
    skillSection.appendChild(el('h4', {}, '⚡ 技能列表'));
    renderArrayField(skillSection, '技能', state.editor.basic.skills,
        function (skill, ski, onUpdate) {
            var d = el('div', { className: 'array-item-body editor-card-body' });
            var fields = [
                ['技能Key (如 caocao.jianxiong) *', 'name', ''],
                ['技能名 (lang_name)', 'lang_name', '如 奸雄'],
            ];
            fields.forEach(function (fd) {
                var ff = el('div', { className: 'editor-field' });
                ff.appendChild(el('label', {}, fd[0]));
                ff.appendChild(el('input', {
                    type: 'text', placeholder: fd[2], value: skill[fd[1]] || '',
                    oninput: function (e) { skill[fd[1]] = e.target.value; onUpdate(); }
                }));
                d.appendChild(ff);
            });
            // lang_desc / lang_desc2
            ['lang_desc', 'lang_desc2'].forEach(function (dk) {
                var ff = el('div', { className: 'editor-field' });
                ff.appendChild(el('label', {}, dk === 'lang_desc' ? '技能描述 (lang_desc)' : '详细描述 (lang_desc2)'));
                ff.appendChild(el('textarea', { placeholder: '', oninput: function (e) { skill[dk] = e.target.value; onUpdate(); } }, skill[dk] || ''));
                d.appendChild(ff);
            });
            // isDerived
            var fdi = el('div', { className: 'editor-field' });
            var diw = el('div', { className: 'editor-field-inline' });
            var dicb = el('input', { type: 'checkbox', onchange: function (e) { skill.isDerived = e.target.checked; onUpdate(); } });
            if (skill.isDerived) dicb.checked = true;
            diw.appendChild(dicb); diw.appendChild(el('label', { style: 'margin-bottom:0;font-weight:400' }, '衍生技 (generals中自动添加#前缀)'));
            fdi.appendChild(diw); d.appendChild(fdi);
            // audios 子数组
            if (!skill.audios) skill.audios = [];
            var aw = el('div', {});
            renderArrayField(aw, '配音列表', skill.audios,
                function (audio, ai, auUpdate) {
                    var ad = el('div', { style: 'display:flex;gap:6px;flex:1' });
                    ad.appendChild(el('input', {
                        type: 'text', placeholder: '配音URL (如 generals/caocao/jianxiong1)', value: audio.url || '',
                        oninput: function (e) { audio.url = e.target.value; auUpdate(); }
                    }));
                    ad.appendChild(el('input', {
                        type: 'text', placeholder: '台词文本', value: audio.translation || '',
                        oninput: function (e) { audio.translation = e.target.value; auUpdate(); }
                    }));
                    return ad;
                },
                function () { return { url: '', translation: '' }; },
                function () { onUpdate(); }
            );
            d.appendChild(aw);
            return d;
        },
        function () { return { name: '', lang_name: '', lang_desc: '', lang_desc2: '', isDerived: false, audios: [] }; },
        function () { refreshEditorOutput(); }
    );
    bs.appendChild(skillSection);

    grid.appendChild(bs);

    // ===== 右栏：资源信息 =====
    var ast = el('div', { className: 'editor-section' });
    ast.appendChild(el('h3', {}, '🎨 资源信息 (assets JSON)'));

    // info fields
    var assetFields = [
        ['武将ID (info.id) *', 'infoId', '如 WEI001'],
        ['称号 (info.title)', 'infoTitle', '如 魏武帝'],
        ['版本', 'infoVersion', ''],
        ['前缀', 'infoPrefix', ''],
        ['设计者', 'infoDesigner', '如 KayaK'],
        ['脚本作者', 'infoScript', '如 归零'],
    ];
    assetFields.forEach(function (a) { edField(ast, a[0], { key: a[1], assets: true, placeholder: a[2] }); });

    // 皮肤列表
    var skinSection = el('div', { className: 'sub-section' });
    skinSection.appendChild(el('h4', {}, '🎭 皮肤列表'));
    renderArrayField(skinSection, '皮肤', state.editor.assets.skins,
        function (skin, si, onUpdate) {
            var d = el('div', { className: 'array-item-body editor-card-body' });
            var fields = [
                ['皮肤名称', 'name', '如 default'],
                ['画师', 'painter', ''],
                ['CV配音', 'cv', ''],
                ['baseUrl', 'baseUrl', '留空使用武将名'],
                ['皮肤图片名', 'image', '留空默认 image.png'],
            ];
            fields.forEach(function (fd) {
                var ff = el('div', { className: 'editor-field' });
                ff.appendChild(el('label', {}, fd[0]));
                ff.appendChild(el('input', {
                    type: 'text', placeholder: fd[2], value: skin[fd[1]] || '',
                    oninput: function (e) { skin[fd[1]] = e.target.value; onUpdate(); }
                }));
                d.appendChild(ff);
            });
            // isDualImage
            var fdi = el('div', { className: 'editor-field' });
            var diw = el('div', { className: 'editor-field-inline' });
            var dicb = el('input', { type: 'checkbox', onchange: function (e) { skin.isDual = e.target.checked; onUpdate(); } });
            if (skin.isDual) dicb.checked = true;
            diw.appendChild(dicb); diw.appendChild(el('label', { style: 'margin-bottom:0;font-weight:400' }, '是否双将图'));
            fdi.appendChild(diw); d.appendChild(fdi);
            // death audio
            var dl = el('div', { className: 'editor-field' });
            dl.appendChild(el('label', {}, '阵亡配音'));
            var dr = el('div', { style: 'display:flex;gap:6px' });
            dr.appendChild(el('input', {
                type: 'text', placeholder: '台词翻译', value: skin.deathTranslation || '',
                oninput: function (e) { skin.deathTranslation = e.target.value; onUpdate(); }
            }));
            dr.appendChild(el('input', {
                type: 'text', placeholder: '配音URL (如 generals/caocao/death)', value: skin.deathUrl || '',
                oninput: function (e) { skin.deathUrl = e.target.value; onUpdate(); }
            }));
            dl.appendChild(dr); d.appendChild(dl);
            return d;
        },
        function () { return { name: 'skin' + (state.editor.assets.skins.length + 1), painter: '', cv: '', baseUrl: '', image: '', isDual: false, deathUrl: '', deathTranslation: '' }; },
        function () { refreshEditorOutput(); }
    );
    ast.appendChild(skinSection);

    grid.appendChild(ast);
    page.appendChild(grid);

    // ===== 输出面板 =====
    var os = el('div', { className: 'editor-output' });
    var tr = el('div', { style: 'display:flex;gap:8px;margin-bottom:10px' });
    ['general', 'asset', 'both'].forEach(function (t, i) {
        var b = el('button', {
            className: 'btn-sm' + (i === 0 ? ' primary' : ''),
            onclick: function () {
                state.editor._tab = t;
                os.querySelectorAll('.btn-sm').forEach(function (x) { x.classList.remove('primary'); });
                this.classList.add('primary'); refreshEditorOutput();
            }
        });
        b.textContent = t === 'general' ? '武将数据 (generals)' : t === 'asset' ? '资源数据 (assets)' : '全部数据';
        tr.appendChild(b);
    });
    os.appendChild(tr);
    var outHeader = el('div', { className: 'output-header' });
    outHeader.appendChild(el('h3', { style: 'font-size:14px;color:#333;margin:0' }, '生成的 JSON 数据'));
    var cb = el('button', {
        className: 'btn-copy', onclick: function () {
            var t = os.querySelector('pre').textContent;
            navigator.clipboard.writeText(t).then(function () {
                cb.textContent = '✅ 已复制!'; cb.classList.add('copied');
                setTimeout(function () { cb.textContent = '📋 复制到剪贴板'; cb.classList.remove('copied'); }, 2000);
            });
        }
    }, '📋 复制到剪贴板');
    outHeader.appendChild(cb);
    os.appendChild(outHeader);
    os.appendChild(el('pre', {}));
    page.appendChild(os);

    content.appendChild(page);
    refreshEditorOutput();
}

function refreshEditorOutput () {
    var pre = document.querySelector('.editor-output pre');
    if (!pre) return;
    var b = state.editor.basic;
    var a = state.editor.assets;
    var name = b.name || 'general_name';
    var key = b.name || '';
    var tab = state.editor._tab || 'general';

    function parseHp (v) {
        if (!v) return 4;
        var s = String(v).trim(); if (!s) return 4;
        var n = parseFloat(s);
        if (isNaN(n) || n <= 0) return 4;
        if (s.indexOf('.') !== -1) { var parts = s.split('.'); var hi = parseInt(parts[0]); if (parts[1] === '5') return [hi, hi + 1, 0]; }
        return n;
    }
    function fmtVal (v) { if (v === undefined || v === null || v === '') return undefined; return v; }
    function parseIntSafe (v) { var n = parseInt(v); return isNaN(n) ? undefined : n; }

    // 构建 HP 值
    var hpBase = parseHp(b.hp);
    var hpFinal;
    var maxHpN = fmtVal(b.maxHp) ? parseIntSafe(b.maxHp) : undefined;
    var armorN = fmtVal(b.armor) ? parseIntSafe(b.armor) : undefined;

    if (maxHpN !== undefined || armorN !== undefined) {
        // 需要用数组格式
        var hpArr = [];
        if (Array.isArray(hpBase)) { hpArr.push(hpBase[0]); }
        else { hpArr.push(typeof hpBase === 'number' ? hpBase : 4); }
        if (maxHpN !== undefined) { hpArr.push(maxHpN); }
        else if (armorN !== undefined) { hpArr.push(hpArr[0]); } // 有护甲无上限，上限=体力
        else { hpArr.push(hpArr[0]); }
        if (armorN !== undefined) { hpArr.push(armorN); }
        hpFinal = hpArr;
    } else {
        hpFinal = hpBase;
    }

    // 武将基本信息 (generals json)
    var genObj = { name: name };
    var kingdom = b.kingdomCustom || b.kingdom;
    if (kingdom) genObj.kingdom = kingdom;
    genObj.hp = hpFinal;
    if (b.gender === 2) genObj.gender = 2;
    if (b.lord) genObj.lord = true;
    if (b.enable === false) genObj.enable = false;
    if (b.hidden) genObj.hidden = true;
    if (b.isWars) genObj.isWars = true;
    if (b.isWars && b.rs.length > 0) genObj.rs = b.rs.slice();
    // 技能名列表（衍生技加 # 前缀）
    var skillNames = b.skills.map(function (s) { return (s.isDerived ? '#' : '') + s.name; }).filter(function (n) { return !!n; });
    if (skillNames.length > 0) genObj.skills = skillNames;

    // 资源信息 (assets json)
    var info = {};
    if (fmtVal(a.infoId)) info.id = a.infoId;
    if (fmtVal(a.infoTitle)) info.title = a.infoTitle;
    if (fmtVal(a.infoVersion)) info.version = a.infoVersion;
    if (fmtVal(a.infoPrefix)) info.prefix = a.infoPrefix;
    if (fmtVal(a.infoDesigner)) info.designer = a.infoDesigner;
    if (fmtVal(a.infoScript)) info.script = a.infoScript;

    // 皮肤列表
    var skinsOut = a.skins.map(function (skin) {
        var so = { name: skin.name || 'default' };
        if (fmtVal(skin.painter)) so.painter = skin.painter;
        if (fmtVal(skin.cv)) so.cv = skin.cv;
        if (fmtVal(skin.baseUrl)) so.baseUrl = skin.baseUrl;
        if (fmtVal(skin.image) && skin.image !== 'image') so.image = skin.image;
        if (skin.isDual) so.isDualImage = true;
        // death audio
        var da = {};
        var hd = false;
        if (fmtVal(skin.deathUrl)) { da.url = skin.deathUrl; hd = true; }
        if (fmtVal(skin.deathTranslation)) { da.translation = skin.deathTranslation; hd = true; }
        if (hd) so.audios = { death: da };
        return so;
    });

    var assetObj = {};
    if (Object.keys(info).length > 0) assetObj.info = info;
    assetObj.skins = skinsOut;

    // 技能数据（全部数据 Tab 使用）
    var skillsObj = {};
    b.skills.forEach(function (s) {
        if (!s.name) return;
        var so = { name: s.name };
        if (fmtVal(s.lang_name)) so.lang_name = s.lang_name;
        if (fmtVal(s.lang_desc)) so.lang_desc = s.lang_desc;
        if (fmtVal(s.lang_desc2)) so.lang_desc2 = s.lang_desc2;
        if (s.audios && s.audios.length > 0) {
            so.audios = s.audios.map(function (a) {
                var ao = {};
                if (fmtVal(a.url)) ao.url = a.url;
                if (fmtVal(a.translation)) ao.translation = a.translation;
                return ao;
            }).filter(function (ao) { return Object.keys(ao).length > 0; });
        }
        skillsObj[s.name] = so;
    });

    // 构建输出
    var skillKeys = Object.keys(skillsObj);
    var skillJSONs = skillKeys.map(function (k) { return '"' + k + '": ' + JSON.stringify(skillsObj[k], null, 2); });

    var output;
    if (tab === 'general') {
        output = '// generals/xxx.json 数据\n// 复制到对应文件末尾\n"' + key + '": ' + JSON.stringify(genObj, null, 2);
    } else if (tab === 'asset') {
        output = '// assets/generals/xxx.json 数据\n// 复制到对应文件末尾\n"' + key + '": ' + JSON.stringify(assetObj, null, 2);
    } else {
        output = '// ==== generals/xxx.json ====\n"' + key + '": ' + JSON.stringify(genObj, null, 2) + '\n\n// ==== assets/generals/xxx.json ====\n"' + key + '": ' + JSON.stringify(assetObj, null, 2);
        if (skillJSONs.length > 0) {
            output += '\n\n// ==== 技能 JSON（可复制到对应 skills JSON 文件） ====\n' + skillJSONs.join(',\n');
        }
    }
    pre.textContent = output;
}

// ==================== 初始化 ====================
route();
