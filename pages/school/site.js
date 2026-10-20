/* ==================================================================
   客丽市第一中学 · 共用脚本
   ------------------------------------------------------------------
   所有页面共用。靠 <body data-page="xxx" data-nav="xxx"> 分派：
     data-page ：这个页面要跑哪段初始化
     data-nav  ：顶部导航里哪一项高亮
   所有没做成页面的入口，提示语统一是「系统维护中，页面暂不开放。」
   ================================================================== */
(function(){
'use strict';

var EYE = '\u{13080}';                       /* 𓂀 —— 用来盖住号码里的一位数字 */
function eye(s){ return String(s).split(EYE).join('<span class="eye">' + EYE + '</span>'); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function $(s){ return document.querySelector(s); }
function $$(s){ return [].slice.call(document.querySelectorAll(s)); }
function q(name){ var m = location.search.match(new RegExp('[?&]' + name + '=([^&#]*)')); return m ? decodeURIComponent(m[1]) : ''; }

/* 做成页面的栏目索引（站内搜索会用到）
   没做的栏目不列进来 —— 它们一律跳 sys.html 的「系统维护中，页面暂不开放。」 */
var SITEPAGES = [
    { t:'学校概况',   u:'about.html',   k:'简介 建筑 实验楼 楼层 历史沿革 领导班子 校训', d:'办公室' },
    { t:'新闻中心',   u:'news.html',    k:'新闻 动态 校园 活动 安保 广播站 图书馆',       d:'各处室' },
    { t:'通知公告',   u:'notice.html',  k:'通知 公告 通告 放假 失物招领 实验楼 修缮 停水', d:'各处室' },
    { t:'管理机构',   u:'org.html',     k:'处室 部门 职责 电话 办公室 教务处 安全保卫处 巡逻队', d:'办公室' },
    { t:'校园文化',   u:'culture.html', k:'校训 校歌 社团 广播站 播音主持 校史',          d:'团委' },
    { t:'联系我们',   u:'contact.html', k:'地址 电话 邮箱 交通 来访 邮编 保安值班室',     d:'办公室' },
    { t:'图书馆书目检索', u:'lib.html', k:'图书 书目 检索 借阅 馆藏 索书号 华灯初上',     d:'图书馆' },
    { t:'实验楼 · 楼层与功能用房', u:'lab.html', k:'实验楼 楼层 功能用房 房间 药品库 配电间 化学实验室 物理 生物 西厅 播音主持 广播站 楼梯 修缮', d:'总务处' },
    { t:'旧版网站（2005 年存档）', u:'old.html', k:'旧版 存档 1998 实验楼 历史',         d:'办公室' }
];

/* ---------------- 底部提示条 ---------------- */
var toast = null, toastTimer = null;
function say(s){
    if (!toast) toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = s;
    toast.classList.add('on');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('on'); }, 2000);
}

/* ---------------- 顶栏日期 ----------------
   ★ 千万别改成 new Date() 取当天日期：那样玩家一打开顶栏就看见现实年份，
     整站设定（2013 年秋季学期）当场穿帮，而且违背了"日期不能贴着今天"的要求。
     这里写死成站里最后一条内容更新之后的那天（采访稿见报日），拟真才会成立。
     要挪就整条一起挪，年月日和星期必须对得上 —— 2013-09-26 是星期四。 */
function initDate(){
    var el = document.getElementById('today'); if (!el) return;
    var Y = 2013, M = 9, D = 26, wk = ['日','一','二','三','四','五','六'][4];
    el.textContent = Y + '年' + M + '月' + D + '日　星期' + wk +
                     '　欢迎访问客丽市第一中学官方网站';
}

/* ---------------- 导航高亮 ---------------- */
function initNav(){
    var cur = document.body.getAttribute('data-nav');
    if (!cur) return;
    $$('.nav a').forEach(function(a){
        if (a.textContent.replace(/\s/g,'') === cur) { a.classList.add('on'); a.removeAttribute('data-stub'); }
    });
}

/* ---------------- 搜索 ---------------- */
function goSearch(v){
    v = (v || '').replace(/^\s+|\s+$/g, '');
    if (!v) { say('请输入搜索关键词。'); return; }
    location.href = 'search.html?q=' + encodeURIComponent(v);
}
function initSearch(){
    var inp = document.getElementById('q'), btn = document.getElementById('qs');
    if (btn) btn.onclick = function(){ goSearch(inp ? inp.value : ''); };
    if (inp) inp.onkeydown = function(e){ if (e.key === 'Enter') goSearch(inp.value); };
    var sb = $('.sbar input'), sbBtn = $('.sbar button');
    if (sbBtn) sbBtn.onclick = function(){ goSearch(sb.value); };
    if (sb) sb.onkeydown = function(e){ if (e.key === 'Enter') goSearch(sb.value); };
}

/* ---------------- 顶栏四个小链接 ---------------- */
function initTopLinks(){
    /* 这两个是浏览器功能，做不了真的，只给操作提示；
       “联系我们”“旧版入口”是真链接，这里不拦，让它们正常跳。 */
    $$('.top a').forEach(function(a){
        var k = a.textContent.replace(/\s/g,'');
        if (k !== '设为首页' && k !== '加入收藏') return;
        a.onclick = function(e){
            e.preventDefault();
            say(k === '设为首页' ? '请手动将本站设为浏览器主页。' : '请按 Ctrl+D 将本站加入收藏夹。');
        };
    });
}

/* ---------------- 还没做成页面 → 统一提示 ---------------- */
function initStubs(){
    $$('[data-stub]').forEach(function(el){
        el.addEventListener('click', function(e){
            e.preventDefault();
            say('系统维护中，页面暂不开放。');
        });
    });
    var fr = document.getElementById('fr');
    if (fr) fr.addEventListener('change', function(e){
        say('正在跳转：' + e.target.value + '（外部站点）');
        e.target.selectedIndex = 0;
    });
}

/* ---------------- 首页：通栏大图轮播 ---------------- */
function initBanner(){
    var box = document.getElementById('bn'); if (!box) return;
    var slides = $$('#bn .slide'), dots = $$('#bn-dots i'), cap = document.getElementById('bn-cap'), cur = 0;
    function show(i){
        cur = i;
        slides.forEach(function(s,k){ s.classList.toggle('on', k === i); });
        dots.forEach(function(d,k){ d.classList.toggle('on', k === i); });
        var tx = ARTICLES[slides[i].getAttribute('data-id')];
        cap.textContent = tx ? tx.t : '';
    }
    dots.forEach(function(d,k){ d.onclick = function(e){ e.stopPropagation(); show(k); }; });
    show(0);
    setInterval(function(){ show((cur + 1) % slides.length); }, 5500);
}

/* ---------------- 首页：正文预览弹窗 ---------------- */
var artBox = null;
function openArt(id){
    var d = ARTICLES[id]; if (!d) { say('系统维护中，页面暂不开放。'); return; }
    artBox = artBox || document.getElementById('art');
    if (!artBox) { location.href = 'article.html?id=' + id; return; }
    document.getElementById('art-t').textContent = d.t;
    document.getElementById('art-m').textContent = '发布时间：' + d.d;
    var bd = document.getElementById('art-b'); bd.innerHTML = '';
    d.b.forEach(function(p){ var el = document.createElement('p'); el.textContent = p; bd.appendChild(el); });
    if (d.sign){ var s = document.createElement('p'); s.className = 'sign'; s.textContent = d.sign; bd.appendChild(s); }
    var open = document.getElementById('art-open');
    if (open) open.href = 'article.html?id=' + id;
    artBox.classList.add('on');
}
function closeArt(){ if (artBox) artBox.classList.remove('on'); }
function initArtBox(){
    artBox = document.getElementById('art');
    if (artBox){                                  /* 只有首页带这个弹窗 */
        var x = document.getElementById('art-x'); if (x) x.onclick = closeArt;
        var c = document.getElementById('art-c'); if (c) c.onclick = closeArt;
        artBox.addEventListener('click', function(e){ if (e.target === artBox) closeArt(); });
        document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeArt(); });
    }
    /* 列表项 / 图片 / 大图：有弹窗就先弹预览，没有就（或标了 data-direct）直接跳正文页 */
    $$('[data-id]').forEach(function(el){
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(){
            var id = el.getAttribute('data-id');
            if (!artBox || el.getAttribute('data-direct') === '1') location.href = 'article.html?id=' + id;
            else openArt(id);
        });
    });
}

/* ---------------- 正文页 article.html ---------------- */
var CATNAME = { bn:'网站首页', news:'新闻中心', notice:'通知公告' };
var CATURL  = { bn:'index.html', news:'news.html', notice:'notice.html' };
function initArticle(){
    var id = q('id'), d = ARTICLES[id];
    var box = document.getElementById('arc'); if (!box) return;
    if (!d){
        box.innerHTML = '<div class="maint" style="border:0;padding:30px 0">' +
            '<h2>系统维护中，页面暂不开放。</h2><p>该内容暂时无法查看，请稍后再试。</p>' +
            '<a class="back" href="index.html">返回首页</a></div>';
        document.title = '内容不存在 - 客丽市第一中学';
        return;
    }
    document.title = d.t + ' - 客丽市第一中学';
    var cat = d.c || 'news';
    var html = '<h2>' + esc(d.t) + '</h2>' +
        '<div class="pmeta"><span>发布时间：' + esc(d.d.split('　')[0]) + '</span>' +
        '<span>来源：' + esc((d.d.split('来源：')[1] || '办公室').split('　')[0]) + '</span>' +
        '<span>浏览次数：' + esc((d.d.split('浏览：')[1] || '—')) + '</span></div>' +
        '<div class="pbody">';
    d.b.forEach(function(p){ html += '<p>' + esc(p) + '</p>'; });
    if (d.sign) html += '<p class="noindent" style="text-align:right;color:#666">' + esc(d.sign) + '</p>';
    /* 关联通报：同一件事前后两份说法，让玩家可以来回对读 */
    if (d.rel && ARTICLES[d.rel]){
        var r = ARTICLES[d.rel];
        html += '<div class="rel"><span class="lb">关联文件</span>' +
                '<a href="article.html?id=' + d.rel + '">' + esc(r.t) + '</a>' +
                '<span class="dt">' + esc(r.d.split('　')[0]) + '</span></div>';
    }
    /* 相关报道：从公文跳去当事人自己的说法（采访页），是本站唯一一条往外转的线 */
    if (d.link){
        html += '<div class="rel"><span class="lb">相关报道</span>' +
                '<a href="' + esc(d.link.u) + '">' + esc(d.link.t) + '</a></div>';
    }
    html += '</div>';

    /* 上下篇：同一栏目里按日期排序 */
    var same = Object.keys(ARTICLES).filter(function(k){ return ARTICLES[k].c === cat; })
        .sort(function(a,b){ return ARTICLES[b].d < ARTICLES[a].d ? -1 : 1; });
    var i = same.indexOf(id);
    var prev = same[i-1], next = same[i+1];
    html += '<div style="padding:6px 24px 0;border-top:1px dashed #e3e7ec;margin-top:14px">' +
        '<table style="width:100%;font-size:13px;color:#666;border:0">' +
        '<tr><td style="border:0;padding:6px 0;width:50%">上一篇：' +
        (prev ? '<a href="article.html?id=' + prev + '">' + esc(ARTICLES[prev].t) + '</a>' : '没有了') + '</td></tr>' +
        '<tr><td style="border:0;padding:6px 0">下一篇：' +
        (next ? '<a href="article.html?id=' + next + '">' + esc(ARTICLES[next].t) + '</a>' : '没有了') + '</td></tr>' +
        '</table></div>' +
        '<div style="text-align:center;padding:16px 0 0">' +
        '<a href="' + (CATURL[cat] || 'index.html') + '" style="display:inline-block;padding:7px 26px;background:#1b4e8b;color:#fff;font-size:13px">返回' + CATNAME[cat] + '</a></div>';
    box.innerHTML = html;
    var cr = document.getElementById('crumb-cat');
    if (cr){ cr.href = CATURL[cat] || 'index.html'; cr.textContent = CATNAME[cat]; }
    var ct = document.getElementById('crumb-t');
    if (ct) ct.textContent = d.t.length > 20 ? d.t.slice(0, 20) + '…' : d.t;
}

/* ---------------- 图书馆书目检索 lib.html ---------------- */
function initLib(){
    var tb = document.getElementById('bk-body'); if (!tb) return;
    function draw(list){
        if (!list.length){ tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:26px;color:#999">未检索到相关书目，请更换关键词后重试。</td></tr>'; return; }
        tb.innerHTML = list.map(function(b){
            return '<tr><td>' + esc(b.t) +
                   (b.n ? '<div class="sub">' + esc(b.n) + '</div>' : '') + '</td>' +
                   '<td>' + esc(b.a) + '</td><td>' + esc(b.k) + '</td><td>' + esc(b.p) + '</td>' +
                   '<td style="color:' + (b.s === '可借' ? '#1b7a3a' : '#a71e26') + '">' + esc(b.s) + '</td></tr>';
        }).join('');
    }
    draw(BOOKS);
    var inp = document.getElementById('bk-q'), btn = document.getElementById('bk-go');
    function run(){
        var v = (inp.value || '').replace(/^\s+|\s+$/g, '');
        if (!v){ draw(BOOKS); return; }
        draw(BOOKS.filter(function(b){
            return (b.t + b.a + b.k + b.p + b.s + (b.n || '')).toLowerCase().indexOf(v.toLowerCase()) >= 0;
        }));
    }
    if (btn) btn.onclick = run;
    if (inp) inp.onkeydown = function(e){ if (e.key === 'Enter') run(); };
}

/* ---------------- 实验楼 · 楼层与功能用房 lab.html ----------------
   ★ 房间表与各层说明都从 data.js 的 LAB_ROOMS / LAB_FLOORS 渲染，
     这一页自己不放数据 —— 加房间只改 data.js，别在 html 里手抄一份。
   ★ 楼层示意按 LAB_FLOORS 的顺序画（三层在最上），房间按 LAB_ROOMS 归层。 */
function initLab(){
    var tb = document.getElementById('rm-body'); if (!tb) return;

    /* 状态上色：能用的绿，用不了的红。跟书目检索页那套保持一致。 */
    var OK = { '正常':1, '通行':1, '登记使用':1 };
    function color(s){ return OK[s] ? '#1b7a3a' : '#a71e26'; }

    function draw(list){
        if (!list.length){
            tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:26px;color:#999">未检索到相关房间，请更换关键词后重试。</td></tr>';
            return;
        }
        tb.innerHTML = list.map(function(r){
            return '<tr><td>' + esc(r.f) + '</td><td>' + esc(r.n) + '</td><td>' + esc(r.p) + '</td>' +
                   '<td>' + esc(r.u) + '</td>' +
                   '<td style="color:' + color(r.s) + '">' + esc(r.s) + '</td></tr>';
        }).join('');
    }
    draw(LAB_ROOMS);

    /* 楼层示意：一层一条，房间排成一行 */
    var fl = document.getElementById('fl-list');
    if (fl){
        fl.innerHTML = LAB_FLOORS.map(function(F){
            var rooms = LAB_ROOMS.filter(function(r){ return r.f === F.f; });
            return '<div class="fl"><div class="fl-f">' + esc(F.f) + '</div>' +
                   '<div class="fl-rs">' + rooms.map(function(r){
                       return '<span class="fl-r' + (OK[r.s] ? '' : ' off') + '">' + esc(r.n) + '</span>';
                   }).join('') + '</div>' +
                   '<div class="fl-d">' + esc(F.d) + '</div></div>';
        }).join('');
    }

    var inp = document.getElementById('rm-q'), btn = document.getElementById('rm-go');
    function run(){
        var v = (inp.value || '').replace(/^\s+|\s+$/g, '');
        if (!v){ draw(LAB_ROOMS); return; }
        draw(LAB_ROOMS.filter(function(r){
            return (r.f + r.n + r.p + r.u + r.s).toLowerCase().indexOf(v.toLowerCase()) >= 0;
        }));
    }
    if (btn) btn.onclick = run;
    if (inp) inp.onkeydown = function(e){ if (e.key === 'Enter') run(); };
}

/* ---------------- 搜索结果页 search.html ---------------- */
function initSearchPage(){
    var box = document.getElementById('res'); if (!box) return;
    var kw = q('q');
    var inp = document.getElementById('q2'); if (inp) inp.value = kw;
    document.title = '站内搜索 - 客丽市第一中学';
    var hits = [];
    Object.keys(ARTICLES).forEach(function(k){
        var a = ARTICLES[k];
        var txt = a.t + ' ' + a.b.join(' ');
        if (txt.indexOf(kw) >= 0) hits.push({ t:a.t, u:'article.html?id=' + k, d:a.d.split('　')[0], s:a.b[0] });
    });
    SITEPAGES.forEach(function(p){
        if ((p.t + ' ' + p.k).indexOf(kw) >= 0) hits.push({ t:p.t, u:p.u, d:'栏目', s:'栏目页面：' + p.k.replace(/\s+/g, '　') });
    });
    var html = '<div class="phead"><h2>站内搜索</h2><div class="pmeta"><span>关键词：' + esc(kw) + '</span><span>共找到 ' + hits.length + ' 条结果</span></div></div>' +
               '<div class="pbody" style="padding-top:6px">';
    if (!hits.length){
        html += '<div class="note">未找到与「' + esc(kw) + '」相关的内容。请更换关键词，或到 <a href="index.html">网站首页</a> 浏览。</div>';
    } else {
        hits.forEach(function(h){
            html += '<div style="padding:10px 0;border-bottom:1px dashed #e8ebef">' +
                    '<a href="' + h.u + '" style="font-size:14px;color:#1b4e8b;font-weight:700">' + esc(h.t) + '</a>' +
                    '<div style="font-size:12px;color:#999;margin:3px 0">' + esc(h.d) + '</div>' +
                    '<div style="font-size:12.5px;color:#666">' + esc(h.s.slice(0, 70)) + '…</div></div>';
        });
    }
    html += '</div>';
    box.innerHTML = html;
}

/* ---------------- 数据驱动的页面片段 ---------------- */
function initOrgPage(){
    var el = document.getElementById('org-list'); if (!el) return;
    el.innerHTML = ORGS.map(function(o){
        return '<div class="card"><div class="nm">' + esc(o.n) + '</div><div class="rl">' + esc(o.r) + '</div>' +
               '<div class="ds">' + esc(o.d) + '</div>' +
               '<div class="ds" style="margin-top:6px;color:#a71e26">电话：' + eye(o.t) + '</div></div>';
    }).join('');
}
function initLeaderPage(){
    var el = document.getElementById('lead-list'); if (!el) return;
    el.innerHTML = LEADERS.map(function(l){
        return '<div class="card"><div class="nm">' + esc(l.n) + '</div><div class="rl">' + esc(l.r) + '</div>' +
               '<div class="ds">' + esc(l.d) + '</div></div>';
    }).join('');
}
function initTelPage(){
    var el = document.getElementById('tel-list'); if (!el) return;
    el.innerHTML = '<table class="tbl"><tr><th style="width:150px">部门</th><th style="width:170px">电话</th><th>说明</th></tr>' +
        TELS.map(function(t){
            return '<tr><td>' + esc(t[0]) + '</td><td style="color:#a71e26">' + eye(t[1]) + '</td><td>' + esc(t[2]) + '</td></tr>';
        }).join('') + '</table>';
    var el2 = document.getElementById('tel-head');
    if (el2) el2.innerHTML = '校办公室　' + eye('0\u{13080}73-8824 6130') + '　传真　' + eye('0\u{13080}73-8824 6100');
}
/* ---------------- 分派 ---------------- */
function boot(){
    initDate(); initNav(); initSearch(); initTopLinks(); initStubs();
    initBanner(); initArtBox();
    var pg = document.body.getAttribute('data-page');
    if (pg === 'article') initArticle();
    else if (pg === 'lib') initLib();
    else if (pg === 'lab') initLab();
    else if (pg === 'search') initSearchPage();
    else if (pg === 'org') initOrgPage();
    else if (pg === 'about') initLeaderPage();
    else if (pg === 'contact') initTelPage();
    /* 所有页面都可能出现的数据渲染 */
    if (document.getElementById('org-list') && pg !== 'org') initOrgPage();
    if (document.getElementById('tel-list') && pg !== 'contact') initTelPage();
    if (document.getElementById('lead-list') && pg !== 'about') initLeaderPage();
    if (document.getElementById('term') && pg !== 'calendar') initTermPage();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

window.Site = { say:say, eye:eye, openArt:openArt, EYE:EYE };
})();
