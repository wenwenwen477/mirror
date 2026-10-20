/* 各子页面的内容（HTML 片段），由 gen.js 套进统一模板后输出成 .html
   ------------------------------------------------------------------
   砍页原则：只做与故事有关的页面。
     留下：about / org / news / notice / culture / contact / lib
           + article(正文) + search(搜索) + sys(维护中)
     不做：图片新闻、教育教学、招生入学、校友之家、校历、表单、专题、校园风光
           —— 这些入口统一用「系统维护中，页面暂不开放。」挡掉。
   想再加页面：在这里补一段配置，再跑一次 gen.js 即可。
*/

var EYE = '\u{13080}';                    /* 𓂀 */
function ey(s){ return String(s).split(EYE).join('<span class="eye">' + EYE + '</span>'); }
/* 邮编遮掉一位，跟电话一个路子：不解释，也不会指向任何真实地区 */
var ZIP = '5' + EYE + '1000';

/* 没做的入口统一跳这张整页；小链接用 data-stub 弹底部提示条 */
function sysLink(name){
    return 'sys.html?s=' + encodeURIComponent(name);
}

/* 侧栏小工具：快速通道 / 联系我们（多数页面共用） */
var SIDE_QUICK =
'<div class="snav"><h3>快速通道</h3><ul>' +
  '<li><a href="lib.html">图书馆书目检索</a></li>' +
  '<li><a href="notice.html">通知公告</a></li>' +
  '<li><a href="org.html">管理机构</a></li>' +
  /* ★ 下面三条手工页（lab / canteen / class）不在生成器里，是单独写的单页。
     **必须写在这儿**：以前有人直接改生成的 about.html，一重跑就被冲掉了。 */
  '<li><a href="lab.html">实验楼 · 楼层与功能用房</a></li>' +
  '<li><a href="canteen.html">学生食堂</a></li>' +
  '<li><a href="class.html">高二（3）班教室</a></li>' +
  '<li><a href="old.html">旧版入口</a></li>' +
  '<li><a href="' + sysLink('教务管理系统') + '">教务管理系统</a></li>' +
  '<li><a href="' + sysLink('一卡通服务') + '">一卡通服务</a></li>' +
'</ul></div>';

var SIDE_CONTACT =
'<div class="box"><h3>联系我们</h3><div class="c" style="font-size:12.5px;color:#666;line-height:1.9">' +
  '地址：客丽市西城区槐荫路 7 号<br>邮编：' + ey(ZIP) + '<br>' +
  '校办：' + ey('0' + EYE + '73-8824 6130') + '<br>' +
  '传真：' + ey('0' + EYE + '73-8824 6100') + '<br>' +
  '邮箱：office@klyz.example' +
'</div></div>';

module.exports = {

/* ==================================================================
   学校概况 —— 校园建筑（实验楼楼层结构是关键线索）
   ================================================================== */
'about.html': {
  title:'学校概况', nav:'学校概况', page:'about',
  side:[['学校简介','about.html',1],['历史沿革','about.html'],['领导班子','about.html'],['管理机构','org.html'],['联系我们','contact.html']],
  body:
  '<div class="phead"><h2>学校简介</h2>' +
    '<div class="pmeta"><span>来源：党政办公室</span><span>发布时间：2013-09-02</span><span>浏览次数：2143</span></div></div>' +
  '<div class="pbody">' +
    '<div class="lead">客丽市第一中学创办于 1953 年，是客丽市创办最早的全日制公办高级中学，现为自治区示范性普通高中。学校位于西城区槐荫路 7 号，占地 5.6 万平方米。</div>' +
    '<p>学校现有教学班 48 个，在校学生 2400 余人，教职工 196 人，其中特级教师 3 人、高级教师 62 人。校园内有教学楼两栋（思源楼、致远楼）、实验楼一栋、图书楼一栋、体育馆一座、学生宿舍楼三栋，设标准化实验室 6 间、多媒体教室 48 间。</p>' +
    '<p>学校以“守常知止，见微笃行”为校训。“守常”谓守常规、守本分；“知止”谓知边界、知敬畏；“见微”谓于细微处用心；“笃行”谓落到实处。</p>' +
    '<div class="ph" style="height:300px;margin:14px 0"><span class="t">校园全景</span><span class="f">img/school-map.jpg</span></div>' +
    '<div class="cap">校园平面图（2013 年版）</div>' +
    '<h3>基本情况</h3>' +
    '<table class="tbl"><tr><th style="width:130px">项目</th><th>内容</th></tr>' +
      '<tr><td>创办时间</td><td>1953 年</td></tr>' +
      '<tr><td>学校性质</td><td>全日制公办高级中学</td></tr>' +
      '<tr><td>办学层次</td><td>自治区示范性普通高中</td></tr>' +
      '<tr><td>校训</td><td>守常　知止　见微　笃行</td></tr>' +
      '<tr><td>教学班 / 在校学生</td><td>48 个 / 2400 余人</td></tr>' +
      '<tr><td>教职工</td><td>196 人（专任教师 168 人）</td></tr>' +
      '<tr><td>校址</td><td>客丽市西城区槐荫路 7 号　邮编 ' + ey(ZIP) + '</td></tr>' +
      '<tr><td>校办电话</td><td>' + ey('0' + EYE + '73-8824 6130') + '</td></tr>' +
    '</table>' +
    '<h3>主要建筑</h3>' +
    '<table class="tbl"><tr><th style="width:96px">建筑</th><th style="width:70px">建成</th><th>楼层与用途</th></tr>' +
      '<tr><td>思源楼</td><td>1987</td><td>主教学楼，共四层，设普通教室 36 间。高二年级组与年级办公室设在三层东侧。</td></tr>' +
      '<tr><td>致远楼</td><td>2004</td><td>第二教学楼，共四层，设普通教室 12 间、合班教室 2 间。</td></tr>' +
      '<tr><td>实验楼</td><td>1998</td><td>共三层。一层东侧设化学药品库与仪器准备室，一层西侧设配电间；' +
        '二层东侧设化学实验室，二层西侧设物理、生物实验室；三层设西厅（多功能厅）与播音主持教室。' +
        '二层东楼梯本学期临时封闭，前往二层请改走中楼梯。</td></tr>' +
      '<tr><td>图书楼</td><td>1996</td><td>共四层。一、二层设学生阅览室与教师资料室，三层设夜间自习区，四层设心理健康教育中心。校史陈列室在一层东侧。</td></tr>' +
    '</table>' +
    '<div class="note">实验楼各楼层开放情况以 <a href="notice.html">通知公告</a> 为准，各层房间与用途见 <a href="lab.html">实验楼 · 楼层与功能用房</a>。修缮期间部分楼层封闭，请勿擅自进入。</div>' +
    '<h3>领导班子</h3>' +
    '<div class="cards" id="lead-list"></div>' +
    '<h3>历史沿革</h3>' +
    '<div class="tl">' +
      '<div class="it"><div class="yr">1953</div><div class="ev">建校，定名“客丽中学”，设初中部。</div></div>' +
      '<div class="it"><div class="yr">1978</div><div class="ev">增设高中部，更名为“客丽市第一中学”。</div></div>' +
      '<div class="it"><div class="yr">1987</div><div class="ev">思源楼（主教学楼）建成投入使用。</div></div>' +
      '<div class="it"><div class="yr">1996</div><div class="ev">图书楼建成，图书馆迁入。</div></div>' +
      '<div class="it"><div class="yr">1998</div><div class="ev">实验楼完工并通过验收；同年秋季，学校对部分老旧校舍进行封闭改造。</div></div>' +
      '<div class="it"><div class="yr">2003</div><div class="ev">建校五十周年，校史陈列室首次布展。</div></div>' +
      '<div class="it"><div class="yr">2011</div><div class="ev">被评为自治区示范性普通高中。</div></div>' +
      '<div class="it"><div class="yr">2013</div><div class="ev">校园安防系统完成升级改造并通过验收。</div></div>' +
    '</div>' +
    '<h3>主要荣誉</h3>' +
    '<ul class="dot">' +
      '<li>自治区示范性普通高中（2011）</li>' +
      '<li>自治区体育传统项目学校（2009）</li>' +
      '<li>客丽市文明校园（2008、2012）</li>' +
      '<li>客丽市普通高中教学工作先进单位（2007—2011 连续五年）</li>' +
      '<li>自治区教育系统先进集体（2012）</li>' +
    '</ul>' +
  '</div>'
},

/* ==================================================================
   管理机构 —— 安全保卫处是故事里的安保队
   ================================================================== */
'org.html': {
  title:'管理机构', nav:'管理机构', page:'org',
  side:[['学校简介','about.html'],['领导班子','about.html'],['管理机构','org.html',1],['联系我们','contact.html']],
  body:
  '<div class="phead"><h2>管理机构</h2>' +
    '<div class="pmeta"><span>来源：党政办公室</span><span>发布时间：2013-09-05</span><span>浏览次数：536</span></div></div>' +
  '<div class="pbody">' +
    '<div class="lead">学校设党政办公室、教务处、德育处、总务处、信息中心、安全保卫处、团委、图书馆等职能处室，各司其职。</div>' +
    '<div class="cards c2" id="org-list"></div>' +
    '<h3>办公时间与来访须知</h3>' +
    '<table class="tbl"><tr><th style="width:130px">事项</th><th>说明</th></tr>' +
      '<tr><td>办公时间</td><td>周一至周五　8:00—11:40　14:30—17:30（节假日除外）</td></tr>' +
      '<tr><td>来访登记</td><td>校外人员须在门卫处登记并领取临时通行证，由受访部门派人接入</td></tr>' +
      '<tr><td>档案查阅</td><td>1998 年前后的纸质档案正在数字化整理，整理期间暂停对外查阅</td></tr>' +
      '<tr><td>监控调阅</td><td>须书面申请并经安全保卫处负责人批准，录像保存期 30 天</td></tr>' +
    '</table>' +
  '</div>'
},

/* ==================================================================
   新闻中心
   ================================================================== */
'news.html': {
  title:'新闻中心', nav:'新闻中心', page:'list',
  side:[['新闻中心','news.html',1],['通知公告','notice.html'],['学校概况','about.html'],['图书馆检索','lib.html']],
  body:
  '<div class="phead"><h2>新闻中心</h2>' +
    '<div class="pmeta"><span>共 10 条</span><span>第 1 / 1 页</span></div></div>' +
  '<div class="pbody" style="padding-top:6px">' +
    '<ul class="list">' +
      li('n1','我校召开实验楼安全整改专题会议','09-17') +
      li('n2','关于表彰实验楼事故处置先进个人的决定','09-16') +
      li('n3','校园安防系统升级改造项目通过验收','09-09') +
      li('n4','安全保卫处完成秋季应急疏散演练总结','09-09') +
      li('n5','广播站完成新一期成员招募','09-09') +
      li('n6','图书馆完成暑期馆藏清点','09-09') +
      li('n7','我校教师在市级优质课评比中获一等奖','09-09') +
      li('n8','关于调整晚自习作息时间的通知','09-06') +
      li('n9','高二年级开展研学实践活动','09-05') +
      li('n10','关于校史陈列室征集实物资料的启事','08-30') +
    '</ul>' +
    pgs(1,1) +
  '</div>'
},

/* ==================================================================
   通知公告 —— 全站线索最密的一页
   ================================================================== */
'notice.html': {
  title:'通知公告', nav:'通知公告', page:'list',
  side:[['通知公告','notice.html',1],['新闻中心','news.html'],['学校概况','about.html'],['旧版入口','old.html']],
  body:
  '<div class="phead"><h2>通知公告</h2>' +
    '<div class="pmeta"><span>共 12 条</span><span>第 1 / 1 页</span></div></div>' +
  '<div class="pbody" style="padding-top:6px">' +
    '<ul class="list">' +
      li('t2b','关于实验楼事故调查结论及原通报更正的通报','09-23') +
      li('t11','关于实验楼“9·13”火灾事故的通报','09-13') +
      li('t2','关于实验楼化学实验室事故的通报','09-10') +
      li('t3','关于实验楼二层东楼梯临时封闭的通告','09-10') +
      li('t4','关于实验楼修缮期间暂停供水供电的通知','09-09') +
      li('t5','关于实验楼三层播音主持教室使用管理的通知','09-09') +
      li('t6','失物招领（第 6 期）','09-06') +
      li('t7','关于开展秋季消防疏散演练的通知','09-04') +
      li('t8','关于近期夜间照明不稳定的情况说明','09-09') +
      li('t9','校园监控系统录像调阅管理办法（试行）','09-05') +
      li('t12','关于后勤临时聘用人员劳务关系终止的公示','09-05') +
      li('t10','关于加强校门出入管理的通知','08-20') +
    '</ul>' +
    pgs(1,1) +
  '</div>'
},

/* ==================================================================
   校园文化 —— 广播站 / 播音主持教室
   ================================================================== */
'culture.html': {
  title:'校园文化', nav:'校园文化', page:'culture',
  side:[['校训校风','culture.html',1],['学生社团','culture.html'],['播音主持教室','article.html?id=t5'],['联系我们','contact.html']],
  body:
  '<div class="phead"><h2>校园文化</h2>' +
    '<div class="pmeta"><span>来源：团委 / 德育处</span><span>发布时间：2013-09-09</span><span>浏览次数：688</span></div></div>' +
  '<div class="pbody">' +
    '<div class="lead">“守常知止，见微笃行”八字校训，是八十年代以来一代代一中人对“怎样读书、怎样做事”的共识。</div>' +
    '<h3>校训释义</h3>' +
    '<table class="tbl"><tr><th style="width:90px">条目</th><th>释义</th></tr>' +
      '<tr><td>守常</td><td>守常规、守本分。把该做的事按规矩做到位，不取巧。</td></tr>' +
      '<tr><td>知止</td><td>知边界、知敬畏。知道什么不能做，也知道什么时候该停。</td></tr>' +
      '<tr><td>见微</td><td>于细微处用心。一间教室的卫生、一次作业的订正，都不是小事。</td></tr>' +
      '<tr><td>笃行</td><td>落到实处。说了就做，做了就做完。</td></tr>' +
    '</table>' +
    '<h3>校歌</h3>' +
    '<p>《思源之歌》作于 1993 年，由本校教师作词，为四四拍合唱曲。每年开学典礼与毕业典礼全体合唱。</p>' +
    '<div class="ph" style="height:180px"><span class="t">校歌歌谱</span><span class="f">img/song.jpg</span></div>' +
    '<div class="cap">《思源之歌》歌谱（1993 年版）</div>' +
    '<h3>学生社团</h3>' +
    '<div class="cards c2">' +
      card('广播站','指导老师　团委','每日午间播音，负责校园通知播报。专用教室设在实验楼三层，课后向学生开放，使用须到总务处登记领取钥匙。') +
      card('文学社','指导老师　语文组','社刊《槐荫》每学期两期，常年征稿。') +
      card('天文社','指导老师　地理组','每月一次观测活动，器材由学校提供。') +
      card('机器人社','指导老师　技术组','近三年获市级奖项 6 项。') +
      card('足球队','指导老师　体育组','全国校园足球特色学校项目队。') +
      card('心理社','指导老师　心理中心','协助开展团体辅导与同伴支持活动。') +
    '</div>' +
    '<div class="note">实验楼修缮期间，三层播音主持教室的开放安排见 ' +
      '<a href="article.html?id=t5">《关于实验楼三层播音主持教室使用管理的通知》</a>。</div>' +
  '</div>'
},

/* ==================================================================
   联系我们
   ================================================================== */
'contact.html': {
  title:'联系我们', nav:'联系我们', page:'contact',
  side:[['联系方式','contact.html',1],['管理机构','org.html'],['通知公告','notice.html'],['旧版入口','old.html']],
  body:
  '<div class="phead"><h2>联系我们</h2>' +
    '<div class="pmeta"><span>来源：党政办公室</span><span>发布时间：2013-09-05</span><span>浏览次数：1108</span></div></div>' +
  '<div class="pbody">' +
    '<div class="lead">校址：客丽市西城区槐荫路 7 号　邮编：' + ey(ZIP) + '。来访请于办公时间到办公楼一层登记。</div>' +
    '<h3>常用电话</h3>' +
    '<div id="tel-list"></div>' +
    '<h3>通信地址与邮箱</h3>' +
    '<table class="tbl"><tr><th style="width:150px">项目</th><th>内容</th></tr>' +
      '<tr><td>通信地址</td><td>客丽市西城区槐荫路 7 号　客丽市第一中学　党政办公室</td></tr>' +
      '<tr><td>邮政编码</td><td>' + ey(ZIP) + '</td></tr>' +
      '<tr><td>校长信箱</td><td>xzb@klyz.example　（<a href="' + sysLink('校长信箱') + '">在线留言</a>）</td></tr>' +
      '<tr><td>办公室邮箱</td><td>office@klyz.example</td></tr>' +
    '</table>' +
    /* ★★ 校长信箱·在线留言 —— 玩家问什么都回同一封官函，但这封信漏了三件事：
       他 8 月 26 日进校做临时工、9 月 5 日解除、9 月 2 日坠落送医后**自己走了**。
       名字不在这儿（在总务处公示 t12 里）—— 玩家得把两处对读才拼得上。 */
    '<h3>校长信箱 · 在线留言</h3>' +
    '<div class="note">来信请注明姓名与联系方式。一般事项五个工作日内答复；涉及正在核查的事项，以有关部门结论为准。</div>' +
    '<div><textarea id="xz-q" rows="4" placeholder="请在此输入您要反映的问题…" ' +
      'style="width:100%;box-sizing:border-box;font:inherit;padding:8px"></textarea>' +
      '<div style="margin-top:8px"><button type="button" id="xz-go" style="padding:6px 18px;cursor:pointer">提交留言</button>' +
      '<span id="xz-tip" style="margin-left:10px;font-size:12px;color:#8a8577"></span></div>' +
      '<div id="xz-ans" style="display:none;margin-top:14px;border:1px solid #dcd8c8;background:#faf8f0;padding:14px 16px">' +
        '<div style="font-size:12px;color:#8a8577;margin-bottom:10px">校长信箱　来信回复　编号 XZ-2013-0924　|　2013-09-24</div>' +
        '<div id="xz-ans-b" style="line-height:1.9"></div>' +
      '</div></div>' +
    '<script>(function(){' +
      'var g=document.getElementById("xz-go"),a=document.getElementById("xz-ans"),' +
      'b=document.getElementById("xz-ans-b"),t=document.getElementById("xz-tip");if(!g)return;' +
      'var R=[' +
        '"来函收悉。现就您询问的事项答复如下。",' +
        '"一、九月十三日火灾事故的涉事人员身份，有关部门正在核查，学校不掌握其个人信息。",' +
        '"二、经查，九月二日校内发生的意外，涉事人员系我校后勤临时聘用人员，八月二十六日到岗，九月五日解除劳务关系（详见总务处公示）。该人员与此后九月十三日事故的关联，有关部门正在核查。",' +
        '"三、该同志在校期间从事实验楼区域保洁与搬运工作，九月二日作业时不慎坠落，由校方派员送医诊治，本人当日自行离院，未办理后续手续。学校未掌握其后续情况。",' +
        '"四、感谢您对学校工作的关心。"' +
      '];' +
      'g.onclick=function(){' +
        'var e=document.getElementById("xz-q"),v=e?(e.value||""):"";' +
        'if(!v.replace(/\\s/g,"")){t.textContent="请填写留言内容。";return;}' +
        't.textContent="已提交。回复如下：";' +
        'b.innerHTML=R.map(function(s){return "<p>"+s+"</p>";}).join("");' +
        'a.style.display="block";' +
      '};})();</script>' +
    '<h3>交通指引</h3>' +
    '<ul class="dot">' +
      '<li>公交：3 路、7 路、21 路“一中站”下车，步行约 200 米。</li>' +
      '<li>地铁：2 号线“槐荫路站”C 口出，步行约 900 米。</li>' +
      '<li>自驾：校外停车位有限，建议错峰来访；车辆从东侧门进入。</li>' +
    '</ul>' +
    '<div class="ph" style="height:240px"><span class="t">校园位置图</span><span class="f">img/map.jpg</span></div>' +
    '<div class="cap">校园位置示意图</div>' +
  '</div>'
},

/* ==================================================================
   图书馆书目检索 —— 《华灯初上》在这里
   ================================================================== */
'lib.html': {
  title:'图书馆书目检索', nav:'', page:'lib',
  side:[['书目检索','lib.html',1],['学校概况','about.html'],['管理机构','org.html'],['首 页','index.html']],
  body:
  '<div class="phead"><h2>图书馆书目检索</h2>' +
    '<div class="pmeta"><span>来源：图书馆</span><span>馆藏目录 2013-09</span></div></div>' +
  '<div class="pbody">' +
    '<div class="sbar"><input id="bk-q" type="text" placeholder="输入书名、作者、索书号或馆藏位置…"><button id="bk-go">检索</button></div>' +
    '<div class="note">本目录仅收录部分馆藏，共 12 条。三层北侧区域封闭整理期间，该区域图书暂不提供借阅。</div>' +
    '<table class="tbl"><thead><tr><th style="width:34%">书名</th><th style="width:20%">责任者</th><th style="width:16%">索书号</th><th style="width:16%">馆藏位置</th><th style="width:14%">状态</th></tr></thead><tbody id="bk-body"></tbody></table>' +
    '<div class="note">《华灯初上》为本馆本年度流通率最高的文学类图书，位于三层文学区 A 架。' +
      '另有读者反映，个别馆藏存在“夹带异物未清理”的情况，请借阅时留意，发现后交回服务台。</div>' +
    '<h3>借阅规则</h3>' +
    '<ul class="dot">' +
      '<li>学生凭一卡通借阅，每证最多 4 册，借期 30 天，可续借一次。</li>' +
      '<li>标为“仅供阅览”“不外借”的资料，只可在馆内指定区域查阅。</li>' +
      '<li>标为“整理中”的资料暂不提供查阅，整理完成后另行通知。</li>' +
      '<li>校史类资料查阅须经图书馆馆长同意，并登记用途。</li>' +
    '</ul>' +
    /* ★★ 作者和学校的接缝：《华灯初上》是**校友捐回来的**，捐赠人署名梁晚青。
       玩家在保险页撤案书上见过同一个名字 —— 两处一对，父女关系就浮出来了。 */
    '<h3>校友及社会捐赠</h3>' +
    '<table class="tbl"><thead><tr><th style="width:20%">日期</th><th style="width:28%">捐赠人</th><th style="width:52%">捐赠内容</th></tr></thead><tbody>' +
      '<tr><td>2013-09-08</td><td>梁晚青（2010 届校友）</td><td>《华灯初上》　一册（作者签名本）</td></tr>' +
      '<tr><td>2013-06-12</td><td>高二年级学生家长</td><td>教辅图书 34 册</td></tr>' +
      '<tr><td>2013-03-21</td><td>退休教师　王仲平</td><td>个人藏书 112 册</td></tr>' +
    '</tbody></table>' +
    '<div class="note">捐赠图书加盖“捐赠”章后入藏相应书区。捐赠人如需留名，请在扉页题写。</div>' +
    '<div class="note">如需查阅 1998 年前后的纸质档案，请联系党政办公室：档案数字化整理期间暂停对外查阅。</div>' +
  '</div>'
},

/* ==================================================================
   正文页（动态：article.html?id=xxx）
   ================================================================== */
'article.html': {
  title:'正文', nav:'', page:'article',
  crumbHtml:'<div class="crumb"><div class="wrap">当前位置：<a href="index.html">首页</a> &gt; ' +
            '<a id="crumb-cat" href="news.html">新闻中心</a> &gt; <b id="crumb-t">正文</b></div></div>',
  side:[['新闻中心','news.html'],['通知公告','notice.html'],['学校概况','about.html'],['首 页','index.html']],
  body:'<div id="arc"></div>'
},

/* ==================================================================
   站内搜索结果（动态：search.html?q=xxx）
   ================================================================== */
'search.html': {
  title:'站内搜索', nav:'', page:'search',
  side:[['新闻中心','news.html'],['通知公告','notice.html'],['学校概况','about.html'],['首 页','index.html']],
  body:'<div id="res"></div>'
},

/* ==================================================================
   系统维护中 —— 所有没做页面的入口都落到这儿
   ================================================================== */
'sys.html': {
  title:'系统维护中', nav:'', page:'sys',
  side:[['首页','index.html'],['通知公告','notice.html'],['联系我们','contact.html']],
  body:
  '<div class="maint" style="border:0">' +
    '<div class="ic">' + EYE + '</div>' +
    '<h2>系统维护中，页面暂不开放。</h2>' +
    '<p id="sys-n">该功能模块正在维护升级。</p>' +
    '<p style="color:#999">维护期间给您带来不便，敬请谅解。</p>' +
    '<a class="back" href="index.html">返回首页</a>' +
  '</div>' +
  '<script>' +
    '(function(){var m=location.search.match(/[?&]s=([^&#]*)/);var n=m?decodeURIComponent(m[1]):"该功能模块";' +
    'document.getElementById("sys-n").textContent="「"+n+"」正在维护升级，暂不开放使用。";' +
    'document.title=n+" - 系统维护中 - 客丽市第一中学";})();' +
  '</script>'
}

};

/* 侧栏共用的两块，挂到 __side 上（不放进页面列表里） */
module.exports.__side = { quick: SIDE_QUICK, contact: SIDE_CONTACT };

/* ---------- 页面里用到的小构件 ---------- */
function li(id, t, d){
    return '<li data-id="' + id + '" data-direct="1"><span class="ti">' + t + '</span><span class="dt">' + d + '</span></li>';
}
function card(n, r, d){
    return '<div class="card"><div class="nm">' + n + '</div><div class="rl">' + r + '</div><div class="ds">' + d + '</div></div>';
}
function pgs(cur, total){
    var h = '<div class="pgs"><span class="on">1</span>';
    for (var i = 2; i <= total; i++) h += '<a href="#">' + i + '</a>';
    h += '</div>';
    return h;
}
