/* ==================================================================
   右上角那枚小眼球 —— 「不属于这个官网」的东西
   ------------------------------------------------------------------
   ★ 一句话用法（页面里就这么一句）：
       <script src="seye.js" charset="utf-8"></script>
       <script>Seye.mount({ lines:[...], gate:{ keys:['幂偌'], url:'../lab/index.html' } });</script>

   ★ 为什么单独拆一个文件：
     这个模块最先是在食堂页 / 教室页里各内联一份，后来书目检索页又抄了一份 ——
     三份拷贝意味着改一句台词要改三个地方。新页面一律改用本文件，
     旧的两份（canteen.html / class.html）先不动，等做实验楼 RPG 时一并迁过来。
     ★ 本文件自带样式（插一个 <style id="seye-css">），**不依赖也不改动 site.css**，
       所以旧的那些页面不会因为多了这个文件而变样。

   ★ 它干两件事：
     1) 眼球：字符画的眼，瞳孔跟着鼠标挪，偶尔眨一下；进页面 delay 毫秒后亮起，
        把 lines 逐句滑出来。点它 = 重听一遍。
     2) gate（可选）：在本页**任意一个输入框**里打出 keys 里的名字并回车（或点检索按钮）
        → 压黑过渡 → 跳到 url。这是「搜名字」这类入口的统一做法。
        · 钩子挂在 document 的**捕获**阶段，早于 site.js 绑在元素上的那些，
          命中时直接把事件掐住，列表就不会先刷一遍「未检索到」再跳走。
        · 顶栏那个站内搜索框（#q / #qs）也一并认，所以玩家在哪儿搜都行。
   ================================================================== */
(function(){
'use strict';

var CSS = [
'#seye{ position:fixed; right:22px; top:118px; z-index:80;',
'    padding:8px 12px 6px; border-radius:3px;',
'    background:rgba(8,12,10,.9); box-shadow:0 0 0 1px rgba(120,180,150,.22), 0 6px 26px rgba(0,0,0,.45);',
'    opacity:0; transform:translateY(-8px); pointer-events:none; cursor:pointer;',
'    transition:opacity .9s ease, transform .9s ease, box-shadow .6s ease; }',
'#seye.on{ opacity:1; transform:translateY(0); pointer-events:auto; }',
'#seye.hot{ box-shadow:0 0 0 1px rgba(150,220,180,.55), 0 6px 30px rgba(0,60,30,.55); }',
'#seye:hover{ box-shadow:0 0 0 1px rgba(150,220,180,.4), 0 6px 30px rgba(0,60,30,.5); }',
'#seye .eyeb{ margin:0; font:15px/1.02 "Sarasa Mono SC","Sarasa Term SC","Noto Sans Mono CJK SC",Consolas,"Courier New",monospace;',
'    color:#cfe6d6; text-shadow:0 0 7px rgba(160,220,180,.55), 0 0 16px rgba(120,200,150,.28);',
'    white-space:pre; user-select:none; }',
'#seye .tip{ position:absolute; right:0; top:100%; margin-top:8px; pointer-events:none; }',
'#seye .tip .tl{ position:absolute; right:0; top:0; white-space:nowrap; transition:transform .6s ease; }',
'#seye .tip .tl.in{ transition:transform .2s ease; }',
'#seye .tip .tl.gone{ display:none; }',
'#seye .tip .tl span{ display:block; padding:6px 12px; font-size:12px; line-height:1.75;',
'    color:#dff0e4; background:rgba(8,12,10,.94); border-left:2px solid #6fbf8f;',
'    box-shadow:0 4px 16px rgba(0,0,0,.4);',
'    opacity:0; transform:translateX(10px);',
'    transition:opacity .75s ease, transform .75s ease; }',
'#seye .tip .tl.on span{ opacity:1; transform:translateX(0); }',
'#seye .tip .tl.in span{ transition:opacity .2s ease, transform .2s ease; }',
'#seye-veil{ position:fixed; inset:0; z-index:200; background:#07090b; pointer-events:none;',
'    opacity:0; transition:opacity .7s ease; }',
'#seye-veil.on{ opacity:1; }',
'@media (max-width:1230px){',
'    #seye{ right:6px; top:76px; padding:6px 9px 4px; }',
'    #seye .eyeb{ font-size:12px; }',
'    #seye .tip .tl{ white-space:normal; width:176px; }',
'    #seye .tip .tl span{ font-size:11px; }',
'}'
].join('\n');

function mount(opt){
    opt = opt || {};
    var lines = opt.lines || [];
    var gate  = opt.gate  || null;
    var delay = typeof opt.delay === 'number' ? opt.delay : 1200;

    /* ---------- 样式 ---------- */
    if (!document.getElementById('seye-css')){
        var st = document.createElement('style');
        st.id = 'seye-css'; st.textContent = CSS;
        document.head.appendChild(st);
    }

    /* ---------- DOM ---------- */
    var wrap = document.getElementById('seye');
    if (!wrap){
        wrap = document.createElement('div');
        wrap.id = 'seye';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.title = '……';
        document.body.appendChild(wrap);
    }
    wrap.innerHTML = '<pre class="eyeb"></pre><div class="tip"></div>';
    var pre = wrap.querySelector('.eyeb');
    var tip = wrap.querySelector('.tip');

    var veil = document.getElementById('seye-veil');
    if (!veil){
        veil = document.createElement('div');
        veil.id = 'seye-veil';
        document.body.appendChild(veil);
    }

    var going = false;

    /* ---------------- 检索入口（gate） ---------------- */
    if (gate && gate.keys && gate.url){
        function norm(v){ return (v || '').replace(/[\s　]/g, ''); }
        function hit(v){ return gate.keys.indexOf(norm(v)) >= 0; }
        function doJump(val){
            if (window.Site && window.Site.say) window.Site.say((gate.toast || '正在检索：') + norm(val));
            veil.classList.add('on');
            setTimeout(function(){ location.href = gate.url; }, 760);
        }
        function go(val){
            if (going) return;
            going = true;
            /* 若本页挂了 onHit（例如实验楼这枚排序题）：先弹题，解出来再 proceed 跳转；
               玩家中途关掉题则 cancel()，把 going 复位，允许下次再搜。没挂 onHit 就照旧直跳。 */
            if (typeof gate.onHit === 'function'){
                gate.onHit(val, function(){ doJump(val); }, function(){ going = false; });
            } else {
                doJump(val);
            }
        }
        /* 顶栏站内搜索 / 本页检索框：按钮 id → 输入框 id */
        var BTN2IN = gate.buttons || { 'rm-go':'rm-q', 'qs':'q', 'bk-go':'bk-q' };
        document.addEventListener('keydown', function(e){
            if (e.key !== 'Enter' || going) return;
            var t = e.target;
            if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA')) return;
            if (!hit(t.value)) return;
            e.preventDefault(); e.stopPropagation();
            go(t.value);
        }, true);
        document.addEventListener('click', function(e){
            if (going) return;
            var id = e.target && e.target.id;
            if (!id || !BTN2IN[id]) return;
            var inp = document.getElementById(BTN2IN[id]);
            if (!inp || !hit(inp.value)) return;
            e.preventDefault(); e.stopPropagation();
            go(inp.value);
        }, true);
    }

    /* ---------------- 眼球本体 ---------------- */
    function eyeFrame(col, row, closed){
        var a = [' .-"""""-. ',
                 '/         \\',
                 '|         |',
                 '|         |',
                 '\\         /',
                 ' `-.....-` '];
        if (closed){ a[3] = '|  ─────  |'; }
        else {
            var line = '         '.split('');
            line[col] = '●';
            a[2 + row] = '|' + line.join('') + '|';
        }
        return a.join('\n');
    }
    var col = 4, row = 0, closed = false;
    function draw(){ pre.textContent = eyeFrame(col, row, closed); }
    draw();

    window.addEventListener('mousemove', function(e){
        var w = window.innerWidth || 1, h = window.innerHeight || 1;
        var dx = (e.clientX / w - 0.72) * 2, dy = (e.clientY / h - 0.14) * 2;
        var nc = Math.max(1, Math.min(7, 4 + Math.round(dx * 3)));
        var nr = (dy > 0.25) ? 1 : 0;
        if (nc !== col || nr !== row){ col = nc; row = nr; if (!closed) draw(); }
    }, { passive:true });
    (function blink(){
        setTimeout(function(){
            closed = true; draw();
            setTimeout(function(){ closed = false; draw(); blink(); }, 150);
        }, 3500 + Math.random() * 4500);
    })();

    /* ---------------- 说话 ---------------- */
    var STEP = 900, HOLD = 4200, REC = 170, GAP = 4, OUT_MS = 780;
    var lineEls = [], timers = [], playing = false;

    function buildLines(){
        tip.innerHTML = '';
        lineEls = lines.map(function(s){
            var d = document.createElement('div');
            d.className = 'tl gone';
            var b = document.createElement('span');
            b.textContent = s;
            d.appendChild(b);
            tip.appendChild(d);
            return d;
        });
    }
    function clearTimers(){ timers.forEach(function(t){ clearTimeout(t); }); timers = []; }
    function layout(){
        var y = 0;
        lineEls.forEach(function(el){
            if (el.classList.contains('gone')) return;
            el.style.transform = 'translateY(' + y + 'px)';
            var box = el.firstChild;
            y += (box ? box.offsetHeight : 0) + GAP;
        });
    }
    function say(){
        if (!lineEls.length || playing) return;
        playing = true;
        clearTimers();
        lineEls.forEach(function(el){ el.classList.remove('on', 'in', 'gone'); });
        layout();
        var n = lineEls.length;
        lineEls.forEach(function(el, i){
            timers.push(setTimeout(function(){
                el.classList.add('in', 'on');
                timers.push(setTimeout(function(){ el.classList.remove('in'); }, 220));
                layout();
            }, i * STEP));
            var off = (n - 1) * STEP + HOLD + i * REC;
            timers.push(setTimeout(function(){
                el.classList.remove('on');
                timers.push(setTimeout(function(){ el.classList.add('gone'); layout(); }, OUT_MS));
            }, off));
        });
        var end = (n - 1) * STEP + HOLD + (n - 1) * REC + OUT_MS;
        timers.push(setTimeout(function(){ playing = false; }, end + 300));
    }
    buildLines();

    function enter(){
        if (going) return;
        wrap.classList.add('on', 'hot');
        say();
    }
    setTimeout(enter, delay);

    wrap.addEventListener('click', function(){
        closed = true; draw();
        setTimeout(function(){ closed = false; draw(); }, 200);
        wrap.classList.add('on', 'hot');
        clearTimers(); playing = false; say();
    });

    window.MP_EYE = { enter:enter, say:say };
    return window.MP_EYE;
}

window.Seye = { mount:mount };
})();
