/* ==================================================================
   CUT7 · 演出（第四段开场：黑屏 + 居中对对话框背后的那段"戏"）
   ------------------------------------------------------------------
   第三段的开场画的是"走廊两头：她的背影和他的身影"；这一段画的是
   "走廊右侧那扇大铁门"—— 幂偌在里面，门开了又关，最后只剩
   巡视窗后面那一点光，和她贴着小窗看人走远的半张脸。
   ★ 跟 scene.js 同一套做法：台词数据里带一个 cue，dialog.js 每翻一条
     回调 onLine，页面把 cue 转给这里，画面自己慢慢走过去
     （每帧往目标值挪一点，所以是"演"不是"切"）。
   ★ 全屏画布，位置全用**屏幕比例**写：任何窗口都是同一套构图 ——
     一点透视的走廊，消失点压在画面中上；教室的大门开在右墙近处，
     她从左下角拄着拐走过去。对话框浮在正中，主角们都走在框外。
   ★ 加一段新演出 = 在 CUES 里加一条，别的地方一行都不用改。
   ================================================================== */
(function(){
'use strict';

var BASE_H = 900;               /* 构图是按 900 高的屏画的，别的屏整体按比例缩放 */
var KEYS = ['fade','lit','dark','pulse',
            'lqX','lqY','lqS','lqWalk','lqCrutch','lqA',
            'mpX','mpY','mpS','mpWalk','mpA','mpHug',
            'doorOpen','warm','peer'];

/* 每一"cue"只写要变的那几项，没写的保持原样。
   lq = 玻琳秋（拄拐背影）  mp = 幂偌（及肩长发 + 背上的黑包）
   doorOpen: 0 关 ~ 1 全开   warm: 门里那盏灯有多亮   peer: 巡视窗后那张脸 */
var CUES = {
    /* 她拄着拐，往走廊深处走 —— 声音就是从那头发过来的 */
    enter:  { fade:1, lit:1, dark:0, pulse:0,
              lqX:.30, lqY:.94, lqS:1.35, lqWalk:1, lqCrutch:1, lqA:1,
              mpX:.845, mpY:.70, mpS:2.0, mpWalk:0, mpA:0, mpHug:0,
              doorOpen:0, warm:0, peer:0 },
    /* 门开了 —— 幂偌就站在门口的暖光里 */
    door:   { lqX:.55, lqY:.905, lqS:1.15, doorOpen:1, warm:1, mpA:1 },
    /* 她冲过去抱住幂偌。拐杖也撇了 */
    hug:    { lqX:.815, lqY:.765, lqS:1.40, lqWalk:0, lqCrutch:0,
              mpX:.84, mpY:.71, mpS:1.9, mpHug:1 },
    /* 两人进屋，幂偌顺手把门关上 —— 只剩巡视窗那一点光 */
    in:     { doorOpen:.06, warm:.14, lqA:0, mpA:0, mpHug:0, peer:0 },
    /* 屋里说正事：门缝里那点光亮了一些 */
    serious:{ warm:.3 },
    /* 幂偌要下楼：门再开，她走出来 */
    leave:  { doorOpen:.62, warm:.7, mpX:.79, mpY:.78, mpS:1.95, mpWalk:1, mpA:1 },
    /* 门又合上。她顺着走廊往远处走 —— 门后，琳秋贴着巡视窗看她走 */
    gone:   { doorOpen:.06, warm:.15, peer:1, mpX:.50, mpY:.455, mpS:.62 },
    /* 走着走着，人就淡进走廊尽头那片黑里了 */
    fade2:  { mpA:0 }
};

function poly(ctx, pts, fill){
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
}

/* ---------------- 那条三层走廊（跟 scene.js 同一套透视；
   右侧整面墙留给播音教室的大门，所以小门只画左边一排） ---------------- */
function corridor(ctx, VW, VH, lit){
    /* 灭点压得比画面中心高一点：尽头那面墙整个落在对话框上方 */
    var cx = VW * 0.5, vy = VH * 0.285;
    var fw = Math.max(90, VW * 0.13), fh = Math.max(60, VH * 0.13);
    var fx0 = cx - fw / 2, fx1 = cx + fw / 2, fy0 = vy - fh / 2, fy1 = vy + fh / 2;
    var nl = -VW * 0.18, nr = VW * 1.18;

    poly(ctx, [[nl,0],[nr,0],[fx1,fy0],[fx0,fy0]], '#131a21');        /* 顶 */
    poly(ctx, [[nl,VH],[nr,VH],[fx1,fy1],[fx0,fy1]], '#1b232c');      /* 地 */
    poly(ctx, [[nl,0],[fx0,fy0],[fx0,fy1],[nl,VH]],  '#212a34');      /* 左墙 */
    poly(ctx, [[nr,0],[fx1,fy0],[fx1,fy1],[nr,VH]],  '#1d252e');      /* 右墙 */
    /* 尽头那面墙：比别处亮 —— 那边漏着一点光 */
    var fg = ctx.createLinearGradient(cx, fy0, cx, fy1);
    fg.addColorStop(0, '#28333e'); fg.addColorStop(1, '#151d25');
    ctx.fillStyle = fg; ctx.fillRect(fx0, fy0, fw, fh);
    var gg = ctx.createRadialGradient(cx, vy, 4, cx, vy, fw * 2.1);
    gg.addColorStop(0, 'rgba(178,204,224,.20)');
    gg.addColorStop(1, 'rgba(178,204,224,0)');
    ctx.fillStyle = gg; ctx.fillRect(fx0 - fw * 2, fy0 - fh * 2.5, fw * 5, fh * 6);

    /* 左墙一排门，近大远小 */
    var ts = [0.12, 0.30, 0.46, 0.60, 0.72, 0.82];
    for (var a = 0; a < ts.length; a++){
        var t = ts[a];
        var lx = nl + (fx0 - nl) * t;
        var y0 = fy0 * t, y1 = VH + (fy1 - VH) * t;
        var top = y0 + (y1 - y0) * 0.30, h = (y1 - top) * 0.92, dw = (1 - t) * 100 + 12;
        ctx.fillStyle = 'rgba(0,0,0,.42)';
        ctx.fillRect(lx, top, dw, h);
        ctx.fillStyle = 'rgba(210,220,215,.13)';
        ctx.fillRect(lx, top, dw, Math.max(1, h * 0.035));
        ctx.fillStyle = 'rgba(210,220,215,.07)';
        ctx.fillRect(lx, top, Math.max(1, dw * 0.06), h);
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

/* ---------------- 播音主持教室的大门（右墙，近景） ----------------
   厚铁门 + 一掌宽的巡视窗 + 门楣上「播音主持」的小牌。
   open: 门往教室里开 —— 门板从远端那侧收进去，近端是门轴；
   warm: 门里那盏灯；peer: 门关严以后，贴着巡视窗往外看的那张脸。 */
function ironDoor(ctx, VW, VH, open, warm, peer, u){
    var cx = VW * 0.5, vy = VH * 0.285;
    var fw = Math.max(90, VW * 0.13), fh = Math.max(60, VH * 0.13);
    var fx1 = cx + fw / 2, fy0 = vy - fh / 2, fy1 = vy + fh / 2;
    function wx(t){ return VW + (fx1 - VW) * t; }
    function wy(t, f){ var yT = fy0 * t, yB = VH + (fy1 - VH) * t; return yT + (yB - yT) * f; }

    var t1 = 0.22, t2 = 0.46, fa = 0.14, fb = 0.90;
    var A = [wx(t1), wy(t1, fa)], B = [wx(t2), wy(t2, fa)],
        C = [wx(t2), wy(t2, fb)], D = [wx(t1), wy(t1, fb)];

    /* 门洞：墙里挖出来的那一块，永远比墙暗 */
    poly(ctx, [A, B, C, D], '#10161c');

    /* 门开着：里面的暖光从门洞里漏出来，泼到走廊的地板上 */
    if (open > 0.01){
        var ig = ctx.createLinearGradient(0, A[1], 0, C[1]);
        ig.addColorStop(0, 'rgba(120,86,40,' + (0.55 * open * warm).toFixed(3) + ')');
        ig.addColorStop(1, 'rgba(255,205,128,' + (0.75 * open * warm).toFixed(3) + ')');
        poly(ctx, [A, B, C, D], ig);
        var sw = (D[0] - C[0]) * 1.15, sh = (VH - D[1]) * 0.34;
        var sg = ctx.createLinearGradient(0, D[1], 0, D[1] + sh);
        sg.addColorStop(0, 'rgba(255,206,138,' + (0.30 * open * warm).toFixed(3) + ')');
        sg.addColorStop(1, 'rgba(255,206,138,0)');
        poly(ctx, [[D[0], D[1]], [C[0], C[1]],
                   [C[0] - sw * 0.62, C[1] + sh], [D[0] - sw, D[1] + sh * 1.12]], sg);
    }

    /* 门板：开着就往教室里收，收剩的宽度跟着 open 走 */
    var pt2 = t1 + (t2 - t1) * (1 - open);
    if (pt2 - t1 > 0.015){
        var PA = [wx(t1), wy(t1, fa)], PB = [wx(pt2), wy(pt2, fa)],
            PC = [wx(pt2), wy(pt2, fb)], PD = [wx(t1), wy(t1, fb)];
        poly(ctx, [PA, PB, PC, PD], '#232b33');
        /* 门板上的两道横筋 */
        ctx.strokeStyle = 'rgba(160,172,180,.14)'; ctx.lineWidth = Math.max(1, 1.2 * u);
        ctx.beginPath(); ctx.moveTo(PA[0], PA[1] + (PD[1] - PA[1]) * 0.42);
        ctx.lineTo(PB[0], PB[1] + (PC[1] - PB[1]) * 0.42); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(PA[0], PA[1] + (PD[1] - PA[1]) * 0.62);
        ctx.lineTo(PB[0], PB[1] + (PC[1] - PB[1]) * 0.62); ctx.stroke();
        ctx.lineWidth = 1;
        /* 拉手（离门轴最远的那一侧） */
        var hx = PB[0] + (PA[0] - PB[0]) * 0.12, hy = PB[1] + (PC[1] - PB[1]) * 0.5;
        ctx.fillStyle = 'rgba(200,208,194,.5)';
        ctx.fillRect(hx - 2 * u, hy - 6 * u, 4 * u, 12 * u);
        /* 巡视窗：一掌宽。门里的灯亮着，它就透光 */
        function pp(df, hf){
            var xt = PA[0] + (PB[0] - PA[0]) * df;
            var yt = PA[1] + (PB[1] - PA[1]) * df;
            var yb = PD[1] + (PC[1] - PD[1]) * df;
            return [xt, yt + (yb - yt) * hf];
        }
        var S1 = pp(0.32, 0.35), S2 = pp(0.68, 0.35), S3 = pp(0.68, 0.47), S4 = pp(0.32, 0.47);
        /* 有人贴着巡视窗往外看时，那块小玻璃会亮一些 —— 剪影才衬得出来 */
        poly(ctx, [S1, S2, S3, S4], 'rgba(226,214,178,' + (0.10 + 0.42 * warm + 0.30 * peer).toFixed(3) + ')');
        /* 巡视窗后那张脸：剪影，只有两个点 */
        if (peer > 0.02){
            var pcx = (S1[0] + S3[0]) / 2, pcy = (S1[1] + S3[1]) / 2;
            var pw = S2[0] - S1[0], ph2 = S4[1] - S1[1];
            ctx.fillStyle = 'rgba(5,7,11,' + (0.88 * peer).toFixed(2) + ')';
            ctx.beginPath(); ctx.ellipse(pcx, pcy + ph2 * 0.12, pw * 0.36, ph2 * 0.66, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(226,232,236,' + (0.75 * peer).toFixed(2) + ')';
            ctx.fillRect(pcx - pw * 0.17, pcy - ph2 * 0.04, Math.max(1.2, 1.8 * u), Math.max(1.6, 2.6 * u));
            ctx.fillRect(pcx + pw * 0.08, pcy - ph2 * 0.04, Math.max(1.2, 1.8 * u), Math.max(1.6, 2.6 * u));
        }
    }

    /* 门框 */
    ctx.strokeStyle = '#39424b'; ctx.lineWidth = Math.max(1.5, 2 * u);
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]);
    ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); ctx.closePath(); ctx.stroke();
    ctx.lineWidth = 1;
    /* 「播音主持」小牌：钉在门楣上面 */
    var sgh = Math.max(10, 16 * u);
    poly(ctx, [[A[0], A[1] - 2], [B[0], B[1] - 2],
               [B[0], B[1] - 2 - sgh], [A[0], A[1] - 2 - sgh]], 'rgba(24,32,40,.95)');
    ctx.fillStyle = 'rgba(207,199,184,.62)';
    ctx.font = Math.round(Math.max(8, 11 * u)) + 'px "Sarasa Mono SC","Microsoft YaHei",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('播 音 主 持', (A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 2 - sgh / 2);
}

function vignette(ctx, VW, VH, k){
    k = Math.max(0, Math.min(1.2, k));
    var g = ctx.createRadialGradient(VW / 2, VH * 0.50, Math.min(VW, VH) * 0.10,
                                     VW / 2, VH * 0.50, Math.max(VW, VH) * 0.80);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,' + (0.46 + 0.32 * k).toFixed(3) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}

/* ---------------- 琳秋：拄拐的背影（跟 scene.js 那个她是同一个人） ---------------- */
function drawLq(ctx, x, y, s, o, alpha){
    ctx.save();
    ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
    var walk = o.lqWalk > 0.5;
    var now = Date.now();
    var bob = walk ? Math.sin(now / 190) * 2.2 * s : 0;
    var yy = y + bob * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath(); ctx.ellipse(x, y + 3, 30 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
    /* 拐杖：走着就拄着；抱住了就撇在脚边 */
    if (o.lqCrutch > 0.5){
        var sw = walk ? Math.sin(now / 190) * 4 * s : 0;
        ctx.strokeStyle = '#05070b'; ctx.lineWidth = Math.max(2, 3.2 * s);
        ctx.beginPath(); ctx.moveTo(x - 24 * s, yy - 104 * s); ctx.lineTo(x - 31 * s + sw, yy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 24 * s, yy - 104 * s); ctx.lineTo(x + 31 * s - sw, yy); ctx.stroke();
    } else {
        ctx.strokeStyle = '#05070b'; ctx.lineWidth = Math.max(2, 3 * s);
        ctx.beginPath(); ctx.moveTo(x - 44 * s, y + 2 * s); ctx.lineTo(x - 16 * s, y + 9 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 48 * s, y + 10 * s); ctx.lineTo(x - 22 * s, y - 2 * s); ctx.stroke();
    }
    /* 腿 / 上身 / 裙 / 头（短发背影） */
    ctx.fillStyle = '#05070b';
    ctx.fillRect(x - 14 * s, yy - 54 * s, 10 * s, 54 * s);
    ctx.fillRect(x + 4 * s,  yy - 54 * s, 10 * s, 54 * s);
    ctx.fillRect(x - 19 * s, yy - 104 * s, 38 * s, 52 * s);
    ctx.beginPath();
    ctx.moveTo(x - 19 * s, yy - 52 * s); ctx.lineTo(x + 19 * s, yy - 52 * s);
    ctx.lineTo(x + 24 * s, yy - 34 * s); ctx.lineTo(x - 24 * s, yy - 34 * s);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, yy - 118 * s, 15 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b0f14';
    ctx.beginPath(); ctx.arc(x, yy - 118 * s, 15 * s, Math.PI * 0.98, Math.PI * 2.02); ctx.fill();
    /* 一点微光勾边，别让她糊进墙里 */
    ctx.strokeStyle = 'rgba(214,224,230,.22)'; ctx.lineWidth = 1;
    ctx.strokeRect(x - 19 * s, yy - 104 * s, 38 * s, 52 * s);
    ctx.beginPath(); ctx.arc(x, yy - 118 * s, 15 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

/* ---------------- 幂偌：及肩长发在肩膀那里散开 + 背上的黑包 ----------------
   剪影里最认得出她的两笔：发梢、背包。 */
function drawMp(ctx, x, y, s, o, alpha){
    ctx.save();
    ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
    var walk = o.mpWalk > 0.5;
    var bob = walk ? Math.sin(Date.now() / 165) * 2 * s : 0;
    var yy = y + bob * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath(); ctx.ellipse(x, y + 3, 28 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#04060a';
    /* 腿（瘦） */
    ctx.fillRect(x - 11 * s, yy - 50 * s, 8 * s, 50 * s);
    ctx.fillRect(x + 3 * s,  yy - 50 * s, 8 * s, 50 * s);
    /* 身子 */
    ctx.fillRect(x - 15 * s, yy - 98 * s, 30 * s, 50 * s);
    /* 背包：贴在背上 */
    ctx.fillStyle = '#0c1015';
    ctx.fillRect(x - 10 * s, yy - 92 * s, 20 * s, 30 * s);
    /* 头 + 及肩长发：发梢在肩膀那里散开 */
    ctx.beginPath();
    ctx.arc(x, yy - 112 * s, 14.5 * s, Math.PI * 0.92, Math.PI * 2.08);
    ctx.bezierCurveTo(x + 18 * s, yy - 96 * s, x + 20 * s, yy - 86 * s, x + 16 * s, yy - 78 * s);
    ctx.lineTo(x - 16 * s, yy - 78 * s);
    ctx.bezierCurveTo(x - 20 * s, yy - 86 * s, x - 18 * s, yy - 96 * s, x - 14.5 * s, yy - 112 * s);
    ctx.closePath(); ctx.fill();
    /* 逆光勾边：门里漏出来的光给她描了一圈 */
    ctx.strokeStyle = 'rgba(230,200,150,.30)'; ctx.lineWidth = Math.max(1, 1.1 * s);
    ctx.strokeRect(x - 15 * s, yy - 98 * s, 30 * s, 50 * s);
    ctx.beginPath(); ctx.arc(x, yy - 112 * s, 14.5 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

/* ---------------- 对外 ---------------- */
function open(canvas){
    var ctx = canvas.getContext('2d');
    var VW = 0, VH = 0, dpr = 1, raf = 0;

    /* st = 现在画成什么样，tg = 要变成什么样；每帧往目标挪一点 */
    var st = {}, tg = {}, i;
    for (i = 0; i < KEYS.length; i++){ st[KEYS[i]] = 0; tg[KEYS[i]] = 0; }
    st.fade = 1; st.lit = 1;
    st.lqX = .14; st.lqY = .965; st.lqS = 1.5; st.lqWalk = 1; st.lqCrutch = 1; st.lqA = 1;
    st.mpX = .845; st.mpY = .70; st.mpS = 2.0;
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
        ironDoor(ctx, VW, VH, st.doorOpen, st.warm, st.peer, u);
        drawMp(ctx, VW * st.mpX, VH * st.mpY, st.mpS * u, st, st.mpA);
        drawLq(ctx, VW * st.lqX, VH * st.lqY, st.lqS * u, st, st.lqA);
        /* 抱住的那一下：她伸过去的手臂（画在两个人上面，把两个人兜在一起） */
        if (st.mpHug > 0.4 && st.lqA > 0.5 && st.mpA > 0.5){
            var lx = VW * st.lqX, ly = VH * st.lqY, ls = st.lqS * u;
            var mx = VW * st.mpX, my = VH * st.mpY, ms = st.mpS * u;
            ctx.strokeStyle = '#05070b';
            ctx.lineWidth = Math.max(2, 6 * ls);
            ctx.beginPath();
            ctx.moveTo(lx + 14 * ls, ly - 96 * ls);
            ctx.quadraticCurveTo((lx + mx) / 2, Math.min(ly, my) - 120 * ls,
                                 mx - 8 * ms, my - 96 * ms);
            ctx.stroke();
        }
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

window.CUT7Scene3 = { open: open };
})();
