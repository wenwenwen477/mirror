/* ==================================================================
   CUT7 · 演出（黑屏 + 居中对对话框背后的那段"戏"）
   ------------------------------------------------------------------
   ★ 只管画，一句台词都不认：台词数据里带一个 cue（'hall' / 'stare' /
     'greet' …），dialog.js 每翻一条就回调 onLine，页面把 cue 转给这里，
     画面自己慢慢走过去（每帧往目标值挪一点，所以是"演"不是"切"）。
   ★ 全屏画布，位置全用**屏幕比例**写：任何窗口都是同一套构图 ——
     走廊从近处往远处收，她（拄拐的背影）在近处那一头，他在远处那一头。
     对话框浮在正中，两个人一个在框上一个在框下，不会被挡住。
   ★ 加一段新演出 = 在 CUES 里加一条，别的地方一行都不用改。
   ================================================================== */
(function(){
'use strict';

var BASE_H = 900;               /* 构图是按 900 高的屏画的，别的屏整体按比例缩放 */
var KEYS = ['fade','lit','dark','pulse',
            'herX','herY','herS','herWave','herTurn',
            'himX','himY','himS','himA','himLean'];

/* 每一"cue"只写要变的那几项，没写的保持原样 */
var CUES = {
    /* 走廊。只剩她的背影。另一端，是他的身影。 */
    hall:   { fade:1, lit:1, dark:0, pulse:0,
              herX:.50, herY:.92, herS:1.30, herWave:0, herTurn:0,
              himX:.50, himY:.35, himS:.62, himA:1, himLean:0 },
    /* 静默持续到令人恐怖的程度：暗角压下来，开始一下一下地跳 */
    stare:  { dark:1, pulse:1 },
    greet:  { herWave:1 },                                   /* 她举手打招呼 */
    /* 她径直上楼，他在她身后默默跟着 —— 他更靠近镜头，所以更大更下 */
    follow: { herY:.78, herS:.92, herWave:0, himY:.88, himS:1.22 },
    ask:    { himLean:1 },                                   /* 他开口，身子前倾一点 */
    turn:   { herTurn:1 },                                   /* 她回头看他 */
    pass:   { herX:.63, herY:.73, herS:.86,                  /* 错开身位 */
              himX:.37, himY:.90, himS:1.30, himLean:0 },
    part:   { himX:.12, himA:0, herTurn:0 },                 /* 他顺着往西，走没影了 */
    out:    { fade:0, lit:0 }
};

function poly(ctx, pts, fill){
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
}

/* ---------------- 那条幽深的走廊 ---------------- */
function corridor(ctx, VW, VH, lit){
    /* 灭点压得比画面中心高一点：尽头那面墙整个落在对话框**上方**，
       他站在尽头的地面上时才不会被框挡住（他 y=0.35×高，正踩在 fy1 上） */
    var cx = VW * 0.5, vy = VH * 0.285;
    var fw = Math.max(90, VW * 0.13), fh = Math.max(60, VH * 0.13);
    var fx0 = cx - fw / 2, fx1 = cx + fw / 2, fy0 = vy - fh / 2, fy1 = vy + fh / 2;
    var nl = -VW * 0.18, nr = VW * 1.18;

    poly(ctx, [[nl,0],[nr,0],[fx1,fy0],[fx0,fy0]], '#131a21');        /* 顶 */
    poly(ctx, [[nl,VH],[nr,VH],[fx1,fy1],[fx0,fy1]], '#1b232c');      /* 地 */
    poly(ctx, [[nl,0],[fx0,fy0],[fx0,fy1],[nl,VH]],  '#212a34');      /* 左墙 */
    poly(ctx, [[nr,0],[fx1,fy0],[fx1,fy1],[nr,VH]],  '#1d252e');      /* 右墙 */
    /* 尽头那面墙：比别处亮 —— 那边漏着一点光。剪影要能"剪"出来全靠它 */
    var fg = ctx.createLinearGradient(cx, fy0, cx, fy1);
    fg.addColorStop(0, '#28333e'); fg.addColorStop(1, '#151d25');
    ctx.fillStyle = fg; ctx.fillRect(fx0, fy0, fw, fh);
    /* 尽头那道逆光 */
    var gg = ctx.createRadialGradient(cx, vy, 4, cx, vy, fw * 2.1);
    gg.addColorStop(0, 'rgba(178,204,224,.20)');
    gg.addColorStop(1, 'rgba(178,204,224,0)');
    ctx.fillStyle = gg; ctx.fillRect(fx0 - fw * 2, fy0 - fh * 2.5, fw * 5, fh * 6);

    /* 墙上的门，近大远小 */
    var ts = [0.12, 0.30, 0.46, 0.60, 0.72, 0.82];
    for (var a = 0; a < ts.length; a++){
        var t = ts[a];
        var lx = nl + (fx0 - nl) * t, rx = nr + (fx1 - nr) * t;
        var y0 = fy0 * t, y1 = VH + (fy1 - VH) * t;
        var top = y0 + (y1 - y0) * 0.30, h = (y1 - top) * 0.92, dw = (1 - t) * 100 + 12;
        ctx.fillStyle = 'rgba(0,0,0,.42)';
        ctx.fillRect(lx, top, dw, h);
        ctx.fillRect(rx - dw, top, dw, h);
        ctx.fillStyle = 'rgba(210,220,215,.13)';
        ctx.fillRect(lx, top, dw, Math.max(1, h * 0.035));
        ctx.fillRect(rx - dw, top, dw, Math.max(1, h * 0.035));
        ctx.fillStyle = 'rgba(210,220,215,.07)';
        ctx.fillRect(lx, top, Math.max(1, dw * 0.06), h);
        ctx.fillRect(rx - dw + dw * 0.94, top, Math.max(1, dw * 0.06), h);
    }
    /* 顶灯：一直在闪，其中一盏接触不良 */
    var ls = [0.18, 0.40, 0.62, 0.80], now = Date.now();
    for (var b = 0; b < ls.length; b++){
        var t2 = ls[b];
        var fl = (0.70 + 0.30 * Math.abs(Math.sin(now / 700 + b))) *
                 (0.80 + 0.20 * Math.sin(now / 430 + b * 2.1));
        var y = fy0 * t2, w = (1 - t2) * 80 + 14, h2 = Math.max(2, (1 - t2) * 7 + 2);
        ctx.fillStyle = 'rgba(210,220,215,' + (0.11 * fl * lit).toFixed(3) + ')';
        ctx.fillRect(cx - w / 2, y, w, h2);
    }
}
function vignette(ctx, VW, VH, k){
    k = Math.max(0, Math.min(1.2, k));
    var g = ctx.createRadialGradient(VW / 2, VH * 0.50, Math.min(VW, VH) * 0.10,
                                     VW / 2, VH * 0.50, Math.max(VW, VH) * 0.80);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,' + (0.46 + 0.32 * k).toFixed(3) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}

/* ---------------- 两个人：全是剪影 ---------------- */
function drawHer(ctx, x, y, s, wave, turn){
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath(); ctx.ellipse(x, y + 3, 30 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
    /* 拐杖：走路的时候拄着，挥手时右手那根抬起来一点 */
    ctx.strokeStyle = '#05070b'; ctx.lineWidth = Math.max(2, 3.2 * s);
    ctx.beginPath(); ctx.moveTo(x - 24 * s, y - 104 * s); ctx.lineTo(x - 31 * s, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 24 * s, y - 104 * s);
    ctx.lineTo(x + 31 * s - wave * 7 * s, y - wave * 10 * s); ctx.stroke();
    /* 腿 / 上身 / 裙 / 头（短发） */
    ctx.fillStyle = '#05070b';
    ctx.fillRect(x - 14 * s, y - 54 * s, 10 * s, 54 * s);
    ctx.fillRect(x + 4 * s,  y - 54 * s, 10 * s, 54 * s);
    ctx.fillRect(x - 19 * s, y - 104 * s, 38 * s, 52 * s);
    ctx.beginPath();
    ctx.moveTo(x - 19 * s, y - 52 * s); ctx.lineTo(x + 19 * s, y - 52 * s);
    ctx.lineTo(x + 24 * s, y - 34 * s); ctx.lineTo(x - 24 * s, y - 34 * s);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - 118 * s, 15 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b0f14';
    ctx.beginPath(); ctx.arc(x, y - 118 * s, 15 * s, Math.PI * 0.98, Math.PI * 2.02); ctx.fill();
    /* 挥手 */
    if (wave > 0.02){
        ctx.strokeStyle = '#05070b'; ctx.lineWidth = Math.max(2, 5 * s);
        ctx.beginPath();
        ctx.moveTo(x + 16 * s, y - 100 * s);
        ctx.lineTo(x + 34 * s, y - (100 + 42 * wave) * s);
        ctx.stroke();
    }
    /* 回过头：看得见眼睛了 */
    if (turn > 0.02){
        ctx.fillStyle = 'rgba(200,208,194,' + (0.55 * turn).toFixed(2) + ')';
        ctx.fillRect(x - 6 * s, y - 120 * s, 2.4 * s, 3.2 * s);
        ctx.fillRect(x + 4 * s, y - 120 * s, 2.4 * s, 3.2 * s);
    }
    /* 一点微光勾边，别让她糊进墙里 */
    ctx.strokeStyle = 'rgba(214,224,230,.24)'; ctx.lineWidth = 1;
    ctx.strokeRect(x - 19 * s, y - 104 * s, 38 * s, 52 * s);
    ctx.beginPath(); ctx.arc(x, y - 118 * s, 15 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
function drawHim(ctx, x, y, s, lean, alpha){
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    if (lean){ ctx.translate(x, y); ctx.rotate(lean * 0.05); ctx.translate(-x, -y); }
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath(); ctx.ellipse(x, y + 3, 32 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#04060a';
    ctx.fillRect(x - 15 * s, y - 58 * s,  11 * s, 58 * s);
    ctx.fillRect(x + 4 * s,  y - 58 * s,  11 * s, 58 * s);
    ctx.fillRect(x - 22 * s, y - 112 * s, 44 * s, 56 * s);
    ctx.fillRect(x - 27 * s, y - 116 * s, 54 * s, 12 * s);          /* 肩：比她宽 */
    ctx.beginPath(); ctx.arc(x, y - 130 * s, 16 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0e13';
    ctx.beginPath(); ctx.arc(x, y - 130 * s, 16 * s, Math.PI * 0.97, Math.PI * 2.03); ctx.fill();
    /* 他一直面朝这边，所以那双眼睛看得见 */
    ctx.fillStyle = 'rgba(214,224,230,.42)';
    ctx.fillRect(x - 6.5 * s, y - 132 * s, 3 * s, 3.6 * s);
    ctx.fillRect(x + 3.5 * s, y - 132 * s, 3 * s, 3.6 * s);
    /* 逆光勾边：他站在尽头那道光前面，所以整个人被描了一圈 */
    ctx.strokeStyle = 'rgba(214,224,230,.38)'; ctx.lineWidth = Math.max(1, 1.2 * s);
    ctx.strokeRect(x - 22 * s, y - 112 * s, 44 * s, 56 * s);
    ctx.strokeRect(x - 27 * s, y - 116 * s, 54 * s, 12 * s);
    ctx.beginPath(); ctx.arc(x, y - 130 * s, 16 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

/* ---------------- 对外 ---------------- */
function open(canvas){
    var ctx = canvas.getContext('2d');
    var VW = 0, VH = 0, dpr = 1, raf = 0;

    /* st = 现在画成什么样，tg = 要变成什么样；每帧往目标挪一点 */
    var st = {}, tg = {}, i;
    for (i = 0; i < KEYS.length; i++){ st[KEYS[i]] = 0; tg[KEYS[i]] = 0; }
    st.herX = .50; st.himX = .50; st.herY = .92; st.himY = .35;
    st.herS = 1.30; st.himS = .62; st.himA = 1;
    for (i = 0; i < KEYS.length; i++) tg[KEYS[i]] = st[KEYS[i]];

    function resize(){
        dpr = Math.min(2, window.devicePixelRatio || 1);
        VW = window.innerWidth; VH = window.innerHeight;
        canvas.width  = Math.round(VW * dpr);
        canvas.height = Math.round(VH * dpr);
        canvas.style.width = VW + 'px'; canvas.style.height = VH + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(){
        ctx.clearRect(0, 0, VW, VH);
        ctx.fillStyle = '#07090b'; ctx.fillRect(0, 0, VW, VH);
        var a = Math.max(0, Math.min(1, st.fade));
        if (a <= 0.002) return;
        var u = VH / BASE_H;
        ctx.save();
        ctx.globalAlpha = a;
        corridor(ctx, VW, VH, st.lit);
        drawHim(ctx, VW * st.himX, VH * st.himY, st.himS * u, st.himLean, st.himA);
        drawHer(ctx, VW * st.herX, VH * st.herY, st.herS * u, st.herWave, st.herTurn);
        vignette(ctx, VW, VH, st.dark + (st.pulse ? 0.12 * Math.sin(Date.now() / 520) : 0));
        ctx.restore();
    }
    function frame(){
        for (var k = 0; k < KEYS.length; k++){
            var key = KEYS[k];
            st[key] += (tg[key] - st[key]) * 0.055;
        }
        draw();
        raf = requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', resize);
    frame();

    return {
        cue: function(name){
            var c = CUES[name];
            if (!c) return;
            for (var k in c) if (tg.hasOwnProperty(k)) tg[k] = c[k];
        },
        stop: function(){
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        }
    };
}

window.CUT7Scene = { open: open, cues: CUES };
})();
