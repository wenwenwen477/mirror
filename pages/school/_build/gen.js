/* 生成客丽市第一中学官网的全部页面 -> F:\网页游戏\幂偌0.1\pages\school\ */
const fs = require('fs');
const path = require('path');
const C = require('./content.js');

/* ★ 输出到**自己这一版**的 pages/school（_build 的上级目录）。
   以前这里写死成 幂偌0.1，重跑会把内容灌进旧版目录 —— 现在按 __dirname 推，挪到哪一版都不会错。
   要临时灌到别处：SCHOOL_DIR=某个绝对路径 node gen.js */
const DIR = process.env.SCHOOL_DIR || path.join(__dirname, '..');
const EYE = '\u{13080}';

const SCHOOL = '客丽市第一中学';
const TEL_MAIN = '0' + EYE + '73-8824 6130';
const TEL_FAX  = '0' + EYE + '73-8824 6100';
const MAIL_XZ  = 'xzb@klyz.example';
/* 邮编同样遮掉一位，跟电话一个路子：不会指向任何真实存在的地区 */
const ZIP      = '5' + EYE + '1000';

function ey(s){ return String(s).split(EYE).join('<span class="eye">' + EYE + '</span>'); }
/* 没做页面的入口统一跳整页「系统维护中，页面暂不开放。」 */
function sysLink(name){ return 'sys.html?s=' + encodeURIComponent(name); }

/* ---------------- 公共片段 ---------------- */
const TOP =
'<div class="top"><div class="wrap">' +
  '<div class="l" id="today">—</div>' +
  '<div class="r">' +
    '<a href="#">设为首页</a><span class="sep">|</span><a href="#">加入收藏</a><span class="sep">|</span>' +
    '<a href="contact.html">联系我们</a><span class="sep">|</span><a href="old.html">旧版入口</a>' +
  '</div>' +
'</div></div>';

const HEAD =
'<div class="head"><div class="wrap">' +
  '<a href="index.html" class="logo" style="text-decoration:none"><b>一中</b><i>SINCE 1953</i></a>' +
  '<div class="name">' +
    '<h1><a href="index.html">' + SCHOOL + '</a></h1>' +
    '<div class="en">KELI NO.1 MIDDLE SCHOOL</div>' +
    '<div class="mot">守常　知止　见微　笃行</div>' +
  '</div>' +
  '<div class="right">' +
    '<div class="tel">新闻热线　<b>' + ey(TEL_MAIN) + '</b><br>' +
      '校长信箱　<a href="' + sysLink('校长信箱') + '">' + MAIL_XZ + '</a></div>' +
    '<div class="search"><input id="q" type="text" placeholder="站内搜索…"><button id="qs">搜索</button></div>' +
  '</div>' +
'</div></div>';

/* 只做与故事有关的栏目；教育教学 / 招生入学 / 校友之家 没做，统一落到 sys.html */
const NAV = [
  ['首页','index.html'],['学校概况','about.html'],['新闻中心','news.html'],['通知公告','notice.html'],
  ['管理机构','org.html'],['教育教学', sysLink('教育教学')],['招生入学', sysLink('招生入学')],
  ['校园文化','culture.html'],['校友之家', sysLink('校友之家')],['联系我们','contact.html']
];
function navHtml(){
  return '<div class="nav"><div class="wrap">' +
    NAV.map(n => '<a href="' + n[1] + '">' + n[0] + '</a>').join('') +
  '</div></div>';
}
function crumbHtml(cur){
  return '<div class="crumb"><div class="wrap">当前位置：<a href="index.html">首页</a> &gt; <b>' + cur + '</b></div></div>';
}
const FOOT =
'<div class="foot"><div class="wrap">' +
  '<b>' + SCHOOL + '</b>　版权所有　|　地址：客丽市西城区槐荫路 7 号　|　邮编：' + ey(ZIP) + '　|　电话：' + ey(TEL_MAIN) + '<br>' +
  '<span class="b">客ICP备 00000000 号-1　|　本站今日访问量：000123　|　建议使用 1024×768 及以上分辨率浏览</span><br>' +
  '<span class="b"><a href="contact.html">联系我们</a>　|　<a href="old.html">旧版入口</a>　|　' +
  '<a href="' + sysLink('校长信箱') + '">校长信箱</a>　|　<a href="search.html">站内搜索</a></span>' +
'</div></div>';

const SCRIPTS = '<script src="data.js" charset="utf-8"></script>\n<script src="site.js" charset="utf-8"></script>';

const SIDE = C.__side;
function shell(cfg){
  const side = cfg.side
    ? '<div class="side"><div class="snav"><h3>本站栏目</h3><ul>' +
        cfg.side.map(s => '<li><a href="' + s[1] + '"' + (s[2] ? ' class="on"' : '') + '>' + s[0] + '</a></li>').join('') +
      '</ul></div>' + SIDE.quick + SIDE.contact + '</div>'
    : '';
  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>' + cfg.title + ' - ' + SCHOOL + '</title>\n' +
    '<link rel="stylesheet" href="site.css">\n</head>\n' +
    '<body' + (cfg.page ? ' data-page="' + cfg.page + '"' : '') + (cfg.nav ? ' data-nav="' + cfg.nav + '"' : '') + '>\n' +
    TOP + '\n' + HEAD + '\n' + navHtml() + '\n' + (cfg.crumbHtml || crumbHtml(cfg.crumb || cfg.title)) + '\n' +
    '<div class="wrap"><div class="layout">' + side + '<div class="cont">' + cfg.body + '</div></div></div>\n' +
    FOOT + '\n<div id="toast"></div>\n' + SCRIPTS + '\n</body>\n</html>\n';
}

/* ==================================================================
   首页
   ================================================================== */
const ROLL = '关于实验楼事故调查结论及原通报更正的通报　·　关于实验楼“9·13”火灾事故的通报　·　' +
  '关于实验楼二层东楼梯临时封闭的通告　·　' +
  '关于实验楼修缮期间暂停供水供电的通知　·　关于实验楼三层播音主持教室使用管理的通知　·　' +
  '失物招领（第 6 期）：拾获黑板擦一只（木质，柄部有裂纹），请失主到德育处认领';

const INDEX_BODY =
'<div class="roll"><div class="wrap"><span class="tag">校园公告</span>' +
  '<div class="scroll"><div class="track"><span>' + ROLL + '</span><span>' + ROLL + '</span></div></div>' +
'</div></div>' +

'<div class="banner" id="bn">' +
  '<div class="slide on" data-id="b1"><div class="ph"><span class="t">安全会议</span><span class="f">img/banner-1.jpg</span></div></div>' +
  '<div class="slide" data-id="b2"><div class="ph"><span class="t">开学检查</span><span class="f">img/banner-2.jpg</span></div></div>' +
  '<div class="slide" data-id="b3"><div class="ph"><span class="t">开学第一课</span><span class="f">img/banner-3.jpg</span></div></div>' +
  '<div class="cap" id="bn-cap"></div>' +
  '<div class="dots" id="bn-dots"><i class="on"></i><i></i><i></i></div>' +
'</div>' +

'<div class="main"><div class="left">' +

  '<div class="box"><h3>新闻中心<em onclick="location.href=\'news.html\'">更多&gt;&gt;</em></h3><div class="c"><ul class="list">' +
    '<li data-id="n1"><span class="ti">我校召开实验楼安全整改专题会议</span><span class="dt">09-17</span></li>' +
    '<li data-id="n2"><span class="ti">关于表彰实验楼事故处置先进个人的决定</span><span class="dt">09-16</span></li>' +
    '<li data-id="n3"><span class="ti">校园安防系统升级改造项目通过验收</span><span class="dt">09-09</span></li>' +
    '<li data-id="n4"><span class="ti">安全保卫处完成秋季应急疏散演练总结</span><span class="dt">09-09</span></li>' +
    '<li data-id="n5"><span class="ti">广播站完成新一期成员招募</span><span class="dt">09-09</span></li>' +
    '<li data-id="n6"><span class="ti">图书馆完成暑期馆藏清点</span><span class="dt">09-09</span></li>' +
  '</ul></div></div>' +

  '<div class="box"><h3>学校概况<em onclick="location.href=\'about.html\'">更多&gt;&gt;</em></h3><div class="c">' +
    '<p class="abs">客丽市第一中学创办于 1953 年，是客丽市创办最早的全日制公办高级中学，现为自治区示范性普通高中。' +
    '学校位于西城区槐荫路 7 号，占地 5.6 万平方米，建有教学楼两栋、实验楼一栋、图书楼一栋，设标准化实验室 6 间。' +
    '实验楼共三层：一层设化学药品库与配电间，二层设化学、物理、生物实验室，三层设西厅与播音主持教室' +
    /* ★ 手工页 lab.html 的入口，写在这儿才不会被重跑冲掉 */
    '（<a href="lab.html">实验楼 · 楼层与功能用房</a>）。' +
    '学校以“守常知止，见微笃行”为校训，注重常规与细节。</p>' +
    '<div class="stats">' +
      '<div><b>1953</b><span>建校年份</span></div>' +
      '<div><b>48</b><span>教学班</span></div>' +
      '<div><b>2400</b><span>在校学生</span></div>' +
      '<div><b>196</b><span>教职工</span></div>' +
      '<div><b>5.6万</b><span>占地面积(㎡)</span></div>' +
    '</div>' +
  '</div></div>' +

'</div><div class="right">' +

  '<div class="box"><h3>通知公告<em onclick="location.href=\'notice.html\'">更多&gt;&gt;</em></h3><div class="c"><ul class="list">' +
    '<li data-id="t2b"><span class="ti">关于实验楼事故调查结论及原通报更正的通报</span><span class="dt">09-23</span></li>' +
    '<li data-id="t11"><span class="ti">关于实验楼“9·13”火灾事故的通报</span><span class="dt">09-13</span></li>' +
    '<li data-id="t2"><span class="ti">关于实验楼化学实验室事故的通报</span><span class="dt">09-10</span></li>' +
    '<li data-id="t3"><span class="ti">关于实验楼二层东楼梯临时封闭的通告</span><span class="dt">09-10</span></li>' +
    '<li data-id="t4"><span class="ti">关于实验楼修缮期间暂停供水供电的通知</span><span class="dt">09-09</span></li>' +
    '<li data-id="t5"><span class="ti">关于实验楼三层播音主持教室使用管理的通知</span><span class="dt">09-09</span></li>' +
    '<li data-id="t6"><span class="ti">失物招领（第 6 期）</span><span class="dt">09-06</span></li>' +
  '</ul></div></div>' +

  '<div class="box"><h3>快速通道</h3><div class="c"><div class="links">' +
    '<a href="lib.html">图书馆书目检索</a>' +
    '<a href="notice.html">通知公告</a>' +
    '<a href="org.html">管理机构</a>' +
    /* ★ 手工单页（不在生成器里），写死在这，重跑不会丢 */
    '<a href="lab.html">实验楼</a>' +
    '<a href="canteen.html">学生食堂</a>' +
    '<a href="class.html">高二（3）班教室</a>' +
    '<a href="' + sysLink('教务管理系统') + '">教务管理系统</a>' +
    '<a href="' + sysLink('一卡通服务') + '">一卡通服务</a>' +
    '<a href="' + sysLink('心理咨询预约') + '">心理咨询预约</a>' +
  '</div></div></div>' +

  '<div class="friend">友情链接<select id="fr">' +
    '<option>客丽市教育局</option><option>客丽市教育科学研究院</option>' +
    '<option>客丽市招生考试院</option><option>客丽师范附属小学</option>' +
  '</select></div>' +

'</div></div>';

const INDEX_HTML =
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'<title>' + SCHOOL + ' - 官方网站</title>\n<link rel="stylesheet" href="site.css">\n</head>\n' +
'<body data-nav="首页">\n' +
TOP + '\n' + HEAD + '\n' + navHtml() + '\n' + crumbHtml('网站首页') + '\n' +
'<div class="wrap">' + INDEX_BODY + '</div>\n' + FOOT + '\n\n' +
'<div id="art"><div class="bx">' +
  '<h2 id="art-t"></h2><div class="meta" id="art-m"></div><div class="bd" id="art-b"></div>' +
  '<div class="acts"><a id="art-open" href="#" target="_blank">查看完整页面</a>' +
  '<button type="button" class="gray" id="art-c">关　闭</button></div>' +
'</div></div>\n' +
'<div id="toast"></div>\n' + SCRIPTS + '\n</body>\n</html>\n';

/* ==================================================================
   旧版入口 old.html（自带一套"上个时代"的样式，刻意的）
   ================================================================== */
const OLD_HTML =
'<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n' +
'<title>' + SCHOOL + ' 旧版主页（2005 年存档）</title>\n<style>\n' +
'body{margin:0;background:#f5f5f0;color:#000;font:12px/1.8 SimSun,"Songti SC",serif;}\n' +
'a{color:#0000cc;}a:hover{color:#ff0000;}\n' +
'.w{width:760px;margin:0 auto;background:#fff;border:1px solid #999;}\n' +
'td{font:12px/1.8 SimSun,serif;}\n' +
'.hd{background:#003399;color:#fff;padding:8px 12px;font-size:18px;font-weight:bold;letter-spacing:4px;}\n' +
'.hd small{font-size:11px;letter-spacing:1px;font-weight:normal;}\n' +
'.nav{background:#dcdcdc;border-top:1px solid #999;border-bottom:1px solid #999;padding:5px 10px;text-align:center;}\n' +
'.nav a{margin:0 6px;}\n' +
'.box{border:1px solid #999;margin:10px;}\n' +
'.box h4{margin:0;background:#eeeee0;border-bottom:1px solid #999;padding:4px 10px;font-size:13px;}\n' +
'.box .c{padding:8px 10px;}\n' +
'.li{line-height:1.9;}\n' +
'.li span{float:right;color:#666;}\n' +
'.ft{border-top:1px solid #999;text-align:center;padding:10px;color:#666;font-size:11px;}\n' +
'.warn{color:#cc0000;}\n' +
'</style>\n</head>\n<body>\n<div class="w">\n' +
'<div class="hd">' + SCHOOL + '　<small>KELI NO.1 MIDDLE SCHOOL</small></div>\n' +
'<div class="nav">\n<a href="index.html">返回新版</a> |\n<a href="old.html">本站首页</a> |\n' +
'<a href="old.html">学校概况</a> |\n<a href="old.html">新闻</a> |\n<a href="old.html">留言簿</a> |\n' +
'<a href="old.html">校友录</a>\n</div>\n' +
'<marquee style="margin:8px 10px;color:#cc0000">欢迎访问客丽市第一中学网站　·　本站自 2006 年起不再更新，内容保留供查阅　·　新版网站请点击右上方"返回新版"</marquee>\n' +
'<table width="100%" cellpadding="0" cellspacing="10" style="padding:0 6px"><tr valign="top">\n' +
'<td width="70%">\n' +
'<div class="box"><h4>学校简讯（存档）</h4><div class="c">\n' +
'<div class="li">· 2005.09.10　我校通过市级示范性高中初评<span>办公室</span></div>\n' +
'<div class="li">· 2004.06.02　图书楼四层加层工程开工<span>总务处</span></div>\n' +
'<div class="li">· 2003.10.01　建校五十周年，校史陈列室首次布展<span>办公室</span></div>\n' +
'<div class="li">· 1999.04.18　实验楼通过竣工验收，二层东楼梯、三层西厅同期交付使用<span>总务处</span></div>\n' +
'<div class="li">· 1998.09.05　因校舍改造，实验楼部分区域临时封闭，钥匙由总务处统一保管<span>总务处</span></div>\n' +
'<div class="li">· 1998.08.20　实验楼工程完工，进入验收阶段<span>总务处</span></div>\n' +
'<div class="li">· 1996.11.03　图书楼落成，图书馆迁入新馆<span>办公室</span></div>\n' +
'</div></div>\n' +
'<div class="box"><h4>学校概况</h4><div class="c">\n' +
'客丽市第一中学创办于 1953 年，1978 年增设高中部并改用现名。现有教学班 42 个，教职工 170 余人。<br>\n' +
'校址：客丽市西城区槐荫路 7 号。校办电话：0' + EYE + '73-8824 6130。<br>\n' +
'<span class="warn">（以上为 2005 年存档数据，与现状可能不一致）</span>\n' +
'</div></div>\n' +
'</td>\n<td width="30%">\n' +
'<div class="box"><h4>公告</h4><div class="c">\n' +
'· 本站已停止更新<br>· 留言簿暂停使用<br>· 校友录数据迁移中\n' +
'</div></div>\n' +
'<div class="box"><h4>来访计数</h4><div class="c" style="text-align:center">\n' +
'<span style="font:bold 20px Courier New,monospace;background:#000;color:#00ff00;padding:2px 8px">000123</span><br>\n' +
'自 2001 年 5 月起计数\n' +
'</div></div>\n' +
'<div class="box"><h4>友情链接</h4><div class="c">\n' +
'<select style="width:100%;font:12px SimSun"><option>客丽市教育局</option><option>客丽师范附属小学</option></select>\n' +
'</div></div>\n' +
'</td>\n</tr></table>\n' +
'<div class="ft">\n' + SCHOOL + '　版权所有　|　建议使用 800×600 分辨率、IE 5.0 以上浏览器浏览<br>\n' +
'本站内容停止更新于 2006 年 3 月　|　<a href="index.html">进入新版网站</a>\n' +
'</div>\n</div>\n</body>\n</html>\n';

/* ==================================================================
   输出
   ================================================================== */
fs.writeFileSync(path.join(DIR, 'index.html'), INDEX_HTML, 'utf8');
fs.writeFileSync(path.join(DIR, 'old.html'), OLD_HTML, 'utf8');

Object.keys(C).forEach(function(f){
  if (f === '__side') return;
  const cfg = C[f];
  const html = shell(Object.assign({ crumb: cfg.title }, cfg));
  fs.writeFileSync(path.join(DIR, f), html, 'utf8');
  console.log('  wrote', f);
});
console.log('  wrote index.html');
console.log('  wrote old.html');
console.log('完成，共', Object.keys(C).length + 2, '个页面');
