/* ==================================================================
   CUT7 · 通用对话框引擎
   ------------------------------------------------------------------
   传说之下那种：一个大方框，字一个一个出来，打完右下角闪一个 ▶，
   按 Z（或回车 / 空格 / 点一下）翻下一条；整段说完，框自己往下挪出画面，
   镜头就顺势落到下一段去。

   ★ 用法（页面里就这么点东西）：
       CUT7Dialog.play(P1_SCRIPT, {
           who:  { narr:'', ji:'记　者', lq:'玻琳秋' },   // 说话人显示名
           onEnd: function(){ ... },                     // 全部说完（框已挪走）
           onExit:function(){ ... },                     // 按 X / Esc 中途退出
           onLine:function(i, it){ ... },                // 每翻一条（第三段用它驱动演出）
           sink: false                                   // RPG 里一段话说完**不要**下沉
       });

   ★ 台词里给某一条加 big（要配 big.js）：那一条**不进对话框**，
     走黑屏大字（CUT4「翻页吧。」那张卡的形制）—— 框收起来、满屏黑、
     正中间一行白字，按 Z 收掉大字、框回来接着下一条：
       { w:'man', cue:'pass', t:'嗯……还是要注意安全，摔死可就麻烦了。',
         big:'摔死可就麻烦了', bigEn:'Mind you don’t fall.' }
     t 那句原文整句留着备查（把 big 去掉就自动回到普通对话）。
     DOM 用默认 id：#dbox #dname #dtext #dnext，也可以自己传元素进来。
   ★ 一份对话说完就自动把自己摘干净（解绑 keydown / click），
     所以 RPG 里可以一句一句地反复调 play()，不会越叠越多。

   ★ 这一份**不认任何一段的具体台词**，台词全在各段的 js 数据里；
     以后 RPG 那些段（p2 / p3 / p4）也是调这同一个引擎，不另写一套打字。
   ================================================================== */
(function(){
'use strict';

function $(id){ return document.getElementById(id); }

function play(script, opt){
    opt = opt || {};
    var box  = opt.box  || $('dbox');
    var name = opt.name || $('dname');
    var txt  = opt.text || $('dtext');
    var next = opt.next || $('dnext');
    var who  = opt.who  || {};
    var speed = typeof opt.speed === 'number' ? opt.speed : 26;   /* 每字毫秒 */
    if (!box || !txt || !script || !script.length) return null;

    var i = 0, typing = false, done = false, timer = null, sinked = false;
    var shown = '', full = '', curW = '';
    var SFX = window.CUT7Sfx || null;          /* 没引 sfx.js 就安静地播，不报错 */
    var BIG = window.CUT7Big  || null;         /* 没引 big.js 就当没有大字这回事 */
    var sinkIt = opt.sink !== false;           /* RPG 里传 sink:false —— 说完就地收工 */
    var bigOn = false;                         /* 这一条是不是正占着满屏大字 */

    /* 标点后面多停一会儿，读起来才像人在说话 */
    function pause(ch){
        if ('，、；：'.indexOf(ch) >= 0) return 180;
        if ('。！？'.indexOf(ch) >= 0)   return 300;
        if (ch === '…')                  return 90;
        return 0;
    }
    function tick(){
        if (i >= script.length) return;
        if (shown.length >= full.length){
            typing = false;
            if (next) next.classList.add('on');
            return;
        }
        var ch = full.charAt(shown.length);
        shown += ch;
        txt.textContent = shown;
        if (SFX) SFX.type(curW, ch);           /* 一个字一声，嗓子按说话人换 */
        timer = setTimeout(tick, speed + pause(ch));
    }
    function show(k){
        var it = script[k];
        full = it.t || '';
        shown = '';
        curW = it.w || '';
        txt.textContent = '';
        if (next) next.classList.remove('on');
        var nm = who[it.w || ''] || '';
        if (name){
            name.textContent = nm;
            name.style.display = nm ? 'block' : 'none';
        }
        if (opt.onLine) opt.onLine(k, it);     /* 交给页面：这一条该配什么画面 */

        /* 这一条是黑屏大字：框收起来，满屏交给那一行字。
           ★ 不打字（字一出来就是完整的），也不挂 ▶（卡上没有任何指示器）。 */
        if (it.big && BIG){
            box.classList.add('off');
            BIG.show(it.big, { en: it.bigEn || '' });
            bigOn = true;
            typing = false;
            return;
        }

        typing = true;
        if (SFX) SFX.head(curW);               /* 开口那声：换人时最明显 */
        timer = setTimeout(tick, 60);
    }
    function advance(){
        if (done || sinked) return;
        if (bigOn){
            /* 下一句还是大字：黑底不撤，字原地换 —— 背景一帧都不漏 */
            var nxt = script[i + 1];
            if (nxt && nxt.big && BIG){
                i++;
                BIG.show(nxt.big, { en: nxt.bigEn || '' });
                if (next) next.classList.remove('on');
                return;
            }
            bigOn = false;                     /* 后面不是大字了：黑卡淡出，框回来 */
            var w = BIG ? BIG.hide() : 0;
            timer = setTimeout(function(){
                box.classList.remove('off');
                i++;
                if (i >= script.length){ finish(); return; }
                show(i);                       /* ★ 翻页不出声 */
            }, w + 60);
            return;
        }
        if (typing){                      /* 打字中再按一下 = 整句直接出来 */
            clearTimeout(timer);
            shown = full;
            txt.textContent = full;
            typing = false;
            if (next) next.classList.add('on');
            return;
        }
        i++;
        if (i >= script.length){ finish(); return; }
        show(i);                               /* ★ 翻页不出声 */
    }
    function off(){                            /* 把自己摘干净：不摘的话 RPG 里会越叠越多 */
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('click', onClick);
    }
    function finish(){
        done = true;
        if (next) next.classList.remove('on');
        if (sinkIt){
            if (SFX) SFX.end();                /* 一段说完，镜头往下走 */
            /* 框往下挪 —— 镜头跟着往下，接下一段 */
            box.classList.add('sink');
            sinked = true;
            off();
            setTimeout(function(){ if (opt.onEnd) opt.onEnd(); }, 1150);
        } else {
            sinked = true;
            off();
            if (opt.onEnd) opt.onEnd();        /* 就地收工，交回游戏 */
        }
    }
    function exit(){
        if (sinked) return;
        sinked = true;
        clearTimeout(timer);
        if (bigOn){ bigOn = false; if (BIG) BIG.hide(); box.classList.remove('off'); }
        off();
        if (opt.onExit) opt.onExit();
    }
    function onKey(e){
        var k = e.key;
        if (k === 'z' || k === 'Z' || k === 'Enter' || k === ' ' || k === 'Spacebar'){
            e.preventDefault(); advance(); return;
        }
        if (k === 'x' || k === 'X' || k === 'Escape'){ e.preventDefault(); exit(); }
    }
    function onClick(e){ e.preventDefault(); advance(); }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);

    show(0);
    return { next:advance, exit:exit, destroy:off };
}

window.CUT7Dialog = { play:play };
})();
