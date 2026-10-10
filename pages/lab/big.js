/* ==================================================================
   CUT7 · 黑屏大字（通用）
   ------------------------------------------------------------------
   形式照抄 CUT4 的「翻页吧。」/「头朝地摔的。」那张卡：
     **冷不丁**，不做淡入 —— 满屏纯黑，正中间一行白字，
     下面一条极淡的横线 + 一行更小的英文，然后就那么停着，
     等玩家自己按 Z 翻走。
   ★ 字是**静止**的：不打字、不抖、不淡入、不带辉光、**也没有音效**。
     要的就是"突然出现一行字"这件事本身（CUT5 安全员那种 22 行满屏
     抖动大字是另一种，别混）。

   ★ 用法：台词数据里给那一条加一个 big，别的什么都不用管 ——
       { w:'man', cue:'pass', t:'嗯……还是要注意安全，摔死可就麻烦了。',
         big:'摔死可就麻烦了', bigEn:'Mind you don’t fall.' }
     dialog.js 看见 big 就：把对话框收起来 → 大字硬切上屏 →
     按 Z 收大字 → 对话框回来继续下一条。
     t 那句原文整句留着备查（哪天把 big 去掉就回到普通对话）。

   ★ DOM 是自己建的（挂到 body 上），所以任何一段只要
     <script src="big.js"> 一行就能用，不用改 html、不用加 div。
     样式在 cut7.css 的 #bigw 那一段。

   ★ 层级 120 —— 压在扫描线(60)、压黑(70)、对话框(30/#stage)之上，
     #veil 之上：大字要的是整个屏幕只剩这一行字。
   ================================================================== */
(function(){
'use strict';

var el = null, zhEl = null, enEl = null, on = false;

function build(){
    if (el) return;
    el = document.createElement('div');
    el.id = 'bigw';
    el.innerHTML =
        '<div class="zh"></div>' +
        '<div class="rule"></div>' +
        '<div class="en"></div>';
    document.body.appendChild(el);
    zhEl = el.querySelector('.zh');
    enEl = el.querySelector('.en');
}

/* 上字：一帧就上屏，不带任何过渡 —— 冷不丁。
   屏上只有这一行字：没有名字框、没有 ▼，进出都不淡。 */
function show(zh, o){
    build();
    o = o || {};
    zhEl.textContent = zh || '';
    enEl.textContent = o.en || '';
    el.classList.add('on');
    on = true;
}

/* 收：上屏依旧是硬切，但收的时候给 0.3 秒淡出 —— 不然黑卡一撤，
   底下的画面"啪"地怼回脸上，很愣。返回淡出时长，dialog.js 拿它
   当"等多久再让对话框回来"的依据。 */
function hide(){
    if (!el || !on) return 300;
    on = false;
    el.classList.remove('on');          /* CSS：#bigw（无 .on）带 .3s 淡出 */
    return 300;
}

window.CUT7Big = {
    show: show,
    hide: hide,
    isOn: function(){ return on; }
};
})();
