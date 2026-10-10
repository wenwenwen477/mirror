/* ==================================================================
   CUT7 · 演出（第五段「铁门」：黑屏 + 居中对对话框背后的整段"戏"）
   ------------------------------------------------------------------
   这一段没有 RPG，从头到尾都是演出：反锁好的教室、旋动的把手、
   巡视窗后面那只眼睛、敞开的窗。
   ★ 压迫感的三个来源：
       1) 巡视窗：走廊没人时透着光；他往门口一站，那点光就被**挡死**，
          只剩玻璃后头一小片黑影和一粒反光 —— 会轻轻地动，在盯着她看。
       2) 灯（amb）：她的处境越坏灯越暗（1 → 0.6）；"腾"地起立那一刻
          回一口，他离开才亮回来。灯 = 她的底气。
       3) 镜头（camZ）：dread 起缓慢前推（1 → 1.06），对峙推到 1.22 ——
          一直很慢，但一直在收紧。
   ★ 动静只有三处，全都短（sfx.js 新增的三声）：把手"咔哒"（click）、
     砸门四声（knock，门跟着抖）、拽开窗户（whoosh，画布抖一下）。
     其余时间一根针掉地上都听得见 —— 安静本身就是压迫。
   ★ 跟 scene.js / scene3.js 同一套做法：台词带 cue，dialog.js 每翻一条
     回调 onLine，页面把 cue 转给这里；带声响的 cue 只演第一次。
   ================================================================== */
(function(){
'use strict';

var BASE_H = 900;
var KEYS = ['fade','amb','dark','pulse',
            'herX','herY','herS','herPose','herWalk','herFace','herLook','herA',
            'handleT','tremble','slitGlow','eye','slitFlick',
            'winOpen','camZ','camX','camY','shake'];
/* 个别键用不同的速率：抖动要散得快，转身要利落，镜头要收得慢 */
var RATE = { tremble:.10, shake:.12, slitFlick:.16,
             herFace:.16, herPose:.075, camZ:.035, camX:.035, camY:.035 };

/* 每一"cue"只写要变的那几项。herFace: 1 朝门 / -1 朝窗（只用于起身之后）；
   herLook: 坐着时只转头 —— 0 看 door，-1 看窗，不做全身翻转 */
var CUES = {
    /* 反锁好的教室。她坐在窗边的小方椅上等 */
    room:   { fade:1, amb:1, dark:.12, pulse:0,
              herX:.40, herY:.845, herS:1.15, herPose:0, herWalk:0, herFace:1, herLook:0, herA:1,
              handleT:0, tremble:0, slitGlow:.38, eye:0, slitFlick:0,
              winOpen:0, camZ:1, camX:.5, camY:.5, shake:0 },
    /* "咔哒——"把手旋动了 */
    knob:   { handleT:1 },
    /* 门没开。他站住了 —— 巡视窗那点光被挡死，只漏一圈边缝 */
    there:  { slitGlow:.16, eye:1, amb:.8 },
    /* 他开口了 */
    voice:  { amb:.75 },
    /* 大脑发懵。灯往下压，镜头开始爬 */
    dread:  { amb:.6, dark:.35, pulse:1, camZ:1.06 },
    /* 她看向窗户 —— 只转头 */
    lookwin:{ herLook:-1, amb:.6 },
    /* "腾——"她拄拐起立 —— 灯回一口，暗角松开 */
    stand:  { herPose:1, amb:.8, dark:.15, pulse:0, camZ:1 },
    /* 走进过道 */
    walk:   { herX:.26, herWalk:1, herFace:-1 },
    /* 过道中间，她回头注视铁门数秒 */
    glance: { herFace:1, herWalk:0 },
    /* 回头，继续向前 */
    resume: { herX:.205, herWalk:1, herFace:-1 },
    /* 到窗边了 */
    atwin:  { herWalk:0, herFace:-1 },
    /* 对着铁门喊那一嗓子 */
    yell:   { herFace:1, camZ:1.12, camX:.55, amb:.7 },
    /* 对面沉默 */
    silence:{ },
    /* 他慌慌张张地敲门 —— 门跟着抖 */
    knock:  { camZ:1.14 },
    /* 对峙：镜头收到最紧，巡视窗后那粒反光盯着她
       （门外的走廊灯不归教室的旋钮管 —— 他贴得越近，那圈光越亮） */
    standoff:{ camZ:1.22, camX:.48, camY:.46, dark:.3, pulse:1, amb:.65, slitGlow:.3, eye:1 },
    /* 僵着说话 */
    parley: { },
    /* "琳秋！——"他一失利，退了 */
    rescue: { eye:0, slitGlow:.22, amb:.85, dark:.15, pulse:0 },
    /* 走廊空了 */
    leave:  { slitGlow:.38, camZ:1, camX:.5, camY:.5, amb:1 },
    /* 只剩下她，和敞开的窗 */
    out:    { herFace:-1, dark:.08 }
};

/* 带声响的 cue 只演第一次 —— 同一个 cue 挂在好几句台词上也不重响 */
var SOUND_CUES = { knob:1, knock:1, open:1, stand:1 };

function poly(ctx, pts, fill){
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
}

/* ---------------- 教室：墙 / 地 / 顶灯那点暖光 ---------------- */
function room(ctx, VW, VH, amb){
    ctx.fillStyle = '#0d1116'; ctx.fillRect(0, 0, VW, VH * .10);          /* 顶 */
    ctx.fillStyle = '#1a2027'; ctx.fillRect(0, VH * .10, VW, VH * .76);   /* 墙 */
    ctx.fillStyle = '#10151a'; ctx.fillRect(0, VH * .86, VW, VH * .14);   /* 地 */
    ctx.fillStyle = 'rgba(200,208,194,.05)'; ctx.fillRect(0, VH * .86, VW, 2);
    /* 顶灯的光池 —— amb 就是它的旋钮 */
    var g = ctx.createRadialGradient(VW * .5, VH * .10, 10, VW * .5, VH * .52, VW * .55);
    g.addColorStop(0, 'rgba(255,226,170,' + (0.10 * amb).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,226,170,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}

/* ---------------- 教室的窗：外面是后楼的墙，顶上漏一条天 ---------------- */
function windowDraw(ctx, VW, VH, open, amb, u, now){
    var x0 = VW * .055, x1 = VW * .195, y0 = VH * .20, y1 = VH * .56;
    /* 玻璃里：对面就是墙 */
    var g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, 'rgba(140,168,205,' + ((.13 + .10 * open) * (.5 + .5 * amb)).toFixed(3) + ')');
    g.addColorStop(.22, 'rgba(90,112,142,' + (.08 * (.5 + .5 * amb)).toFixed(3) + ')');
    g.addColorStop(1, '#0c1118');
    ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    /* 远处那面墙的窗，两粒淡点 */
    ctx.fillStyle = 'rgba(200,214,228,.16)';
    ctx.fillRect(x0 + (x1 - x0) * .30, y0 + (y1 - y0) * .58, 2.5 * u, 2.5 * u);
    ctx.fillRect(x0 + (x1 - x0) * .62, y0 + (y1 - y0) * .66, 2 * u, 2 * u);
    /* 框 + 窗棂 */
    ctx.strokeStyle = '#39424b'; ctx.lineWidth = Math.max(1.5, 2.4 * u);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.lineWidth = Math.max(1, 1.4 * u);
    ctx.beginPath();
    ctx.moveTo((x0 + x1) / 2, y0); ctx.lineTo((x0 + x1) / 2, y1);
    ctx.moveTo(x0, (y0 + y1) / 2); ctx.lineTo(x1, (y0 + y1) / 2);
    ctx.stroke(); ctx.lineWidth = 1;
    /* 敞开的窗扇：右边斜出去一条亮边，风进来两道流线 */
    if (open > .02){
        var a = Math.min(1, open);
        poly(ctx, [[x1, y0 + 4 * u], [x1 + 16 * u * a, y0 + 12 * u],
                   [x1 + 16 * u * a, y1 - 10 * u], [x1, y1 - 4 * u]],
             'rgba(150,175,205,' + (.10 * a).toFixed(3) + ')');
        ctx.strokeStyle = 'rgba(170,192,216,' + (.22 * a).toFixed(3) + ')';
        ctx.lineWidth = Math.max(1, 1.2 * u);
        for (var i = 0; i < 2; i++){
            var ph = now / (700 + i * 260) + i * 2.4;
            var yy = y0 + (y1 - y0) * (.30 + i * .3) + Math.sin(ph) * 5 * u;
            ctx.beginPath();
            ctx.moveTo(x1 + 2 * u, yy);
            ctx.lineTo(x1 + (10 + 5 * Math.sin(ph * 1.7)) * u * a, yy + 3 * u);
            ctx.stroke();
        }
        ctx.lineWidth = 1;
    }
}

/* ---------------- 那扇大铁门：把手 / 横筋 / 巡视窗 / 窗后的眼睛 ---------------- */
function doorDraw(ctx, VW, VH, st, u, now){
    var tr = st.tremble;
    var dx = Math.sin(now / 24) * 3.2 * tr, dy = Math.cos(now / 37) * 1.6 * tr;
    var x0 = VW * .70 + dx, x1 = VW * .88 + dx, y0 = VH * .14 + dy, y1 = VH * .78 + dy;
    /* 门板 */
    ctx.fillStyle = '#232b33'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = '#39424b'; ctx.lineWidth = Math.max(1.5, 2.2 * u);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.lineWidth = Math.max(1, 1.2 * u);
    ctx.strokeStyle = 'rgba(160,172,180,.13)';
    ctx.beginPath();
    ctx.moveTo(x0, y0 + (y1 - y0) * .58); ctx.lineTo(x1, y0 + (y1 - y0) * .58);
    ctx.moveTo(x0, y0 + (y1 - y0) * .78); ctx.lineTo(x1, y0 + (y1 - y0) * .78);
    ctx.stroke(); ctx.lineWidth = 1;
    /* 把手：正在被旋动的那一下 */
    var hx = x0 + (x1 - x0) * .84, hy = y0 + (y1 - y0) * .47;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(st.handleT * .55);
    ctx.fillStyle = 'rgba(200,208,194,' + (.42 + .2 * st.handleT).toFixed(3) + ')';
    ctx.fillRect(-2.6 * u, -2 * u, 5.2 * u, 17 * u);
    ctx.restore();
    /* 巡视窗：走廊亮它就亮；他一站过来，光被挡死，只漏头边一圈缝 */
    var sx0 = x0 + (x1 - x0) * .14, sx1 = x0 + (x1 - x0) * .64;
    var sy0 = y0 + (y1 - y0) * .23, sy1 = y0 + (y1 - y0) * .35;
    var glow = st.slitGlow * (1 - st.eye * .72) + st.slitFlick * .32 * (1 - st.eye);
    ctx.fillStyle = 'rgba(226,214,178,' + Math.min(.8, glow * (.7 + .3 * st.amb)).toFixed(3) + ')';
    ctx.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    /* 窗后那只眼睛：一小片黑影 + 一粒会动的反光 */
    if (st.eye > .02){
        var scx = (sx0 + sx1) / 2, scy = (sy0 + sy1) / 2;
        ctx.fillStyle = 'rgba(6,8,12,' + (.92 * st.eye).toFixed(3) + ')';
        ctx.beginPath();
        ctx.ellipse(scx, scy + (sy1 - sy0) * .16, (sx1 - sx0) * .52, (sy1 - sy0) * .60, 0, 0, Math.PI * 2);
        ctx.fill();
        var px = scx + Math.sin(now / 900) * 2.4 * u;
        var py = scy + Math.cos(now / 1300) * 1.4 * u;
        ctx.fillStyle = 'rgba(226,232,238,' + (.72 * st.eye).toFixed(3) + ')';
        ctx.fillRect(px - 1.2 * u, py - 1.6 * u, 2.4 * u, 3.2 * u);
    }
    /* 小窗自己的框 */
    ctx.strokeStyle = '#39424b'; ctx.lineWidth = Math.max(1.5, 2 * u);
    ctx.strokeRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    ctx.lineWidth = 1;
}

/* ---------------- 小方椅子（全剪影） ---------------- */
function chairAt(ctx, x, y, s){
    ctx.fillStyle = '#0b0f14';
    ctx.fillRect(x - 12 * s, y - 15 * s, 5 * s, 24 * s);        /* 靠背 */
    ctx.fillRect(x - 12 * s, y - 15 * s, 26 * s, 5 * s);        /* 座沿 */
    ctx.fillRect(x - 12 * s, y - 11 * s, 26 * s, 4 * s);        /* 座面 */
    ctx.fillRect(x - 10 * s, y - 7 * s, 3.5 * s, 8 * s);        /* 腿 */
    ctx.fillRect(x + 9 * s,  y - 7 * s, 3.5 * s, 8 * s);
    ctx.fillStyle = 'rgba(200,208,194,.06)';
    ctx.fillRect(x - 12 * s, y - 15 * s, 26 * s, 1.5);
}
function chairs(ctx, VW, VH, u){
    var rowA = [.11, .215, .32, .425, .53, .635], rowB = [.13, .265, .40, .535, .67];
    for (var i = 0; i < rowA.length; i++) chairAt(ctx, VW * rowA[i], VH * .73, .8 * u);
    for (var j = 0; j < rowB.length; j++) chairAt(ctx, VW * rowB[j], VH * .865, 1.06 * u);
}

/* ---------------- 她：坐 → 腾地起立 → 拄拐走 → 回头 → 开窗对峙 ----------------
   herFace 直接当 scaleX 用 —— 过 0 的那一瞬就是"转身"（只在起身之后用）；
   坐着时转头走 herLook，只动脑袋，不翻身。 */
function her(ctx, x, y, s, o, u, now){
    if (o.herA <= .01) return;
    ctx.save();
    ctx.translate(x, y);
    var face = o.herFace;
    if (face === 0) face = 1;
    ctx.scale(face, 1);
    ctx.globalAlpha *= Math.max(0, Math.min(1, o.herA));
    var ink = '#05070b';
    var walk = o.herWalk > .5;
    var bob = walk ? Math.sin(now / 180) * 2.2 * s : 0;
    var pose = Math.max(0, Math.min(1, o.herPose));
    /* 站姿（拄着双拐） */
    if (pose > .02){
        ctx.save();
        ctx.globalAlpha *= pose;
        ctx.translate(0, -bob * .5);
        ctx.fillStyle = 'rgba(0,0,0,.45)';
        ctx.beginPath(); ctx.ellipse(0, 2, 24 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ink;
        ctx.fillRect(-9 * s, -52 * s, 8 * s, 52 * s);            /* 腿 */
        ctx.fillRect(3 * s,  -52 * s, 8 * s, 52 * s);
        ctx.fillRect(-10 * s, -102 * s, 20 * s, 52 * s);         /* 身 */
        ctx.beginPath();                                          /* 短发的后脑勺 */
        ctx.arc(2 * s, -114 * s, 14 * s, Math.PI * .75, Math.PI * 1.9);
        ctx.lineTo(-8 * s, -108 * s); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(2 * s, -114 * s, 14 * s, 0, Math.PI * 2); ctx.fill();
        /* 双拐：近的那根清楚，远的那根淡一点 */
        var sw = walk ? Math.sin(now / 180) * 3 * s : 0;
        ctx.strokeStyle = ink; ctx.lineWidth = Math.max(2, 3 * s);
        ctx.beginPath(); ctx.moveTo(10 * s, -92 * s); ctx.lineTo(20 * s + sw, 2 * s); ctx.stroke();
        ctx.globalAlpha *= .55;
        ctx.beginPath(); ctx.moveTo(6 * s, -92 * s); ctx.lineTo(14 * s - sw, 2 * s); ctx.stroke();
        ctx.restore();
    }
    /* 坐姿（拐靠在椅子边）。herLook 只转脑袋：0 看门，-1 看窗 */
    if (pose < .98){
        ctx.save();
        ctx.globalAlpha *= (1 - pose);
        var look = Math.max(-1, Math.min(0, o.herLook || 0));
        ctx.fillStyle = ink;
        ctx.strokeStyle = ink; ctx.lineWidth = Math.max(2.5, 5 * s);
        ctx.beginPath();                                          /* 大腿朝前 */
        ctx.moveTo(0, -12 * s); ctx.lineTo(17 * s, -12 * s); ctx.stroke();
        ctx.lineWidth = Math.max(2, 4 * s);
        ctx.beginPath();                                          /* 小腿往下 */
        ctx.moveTo(17 * s, -12 * s); ctx.lineTo(19 * s, 1 * s); ctx.stroke();
        ctx.fillRect(-9 * s, -56 * s, 18 * s, 46 * s);            /* 身 */
        var hx0 = 1 * s + look * 7 * s;                           /* 脑袋转过去一点 */
        ctx.beginPath();
        ctx.arc(hx0, -68 * s, 13 * s, Math.PI * .75, Math.PI * 1.9);
        ctx.lineTo(hx0 - 10 * s, -62 * s); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(hx0, -68 * s, 13 * s, 0, Math.PI * 2); ctx.fill();
        if (look < -.2){                                          /* 看窗时，一粒眼睛的反光 */
            ctx.fillStyle = 'rgba(216,224,230,.55)';
            ctx.fillRect(hx0 - 5 * s, -70 * s, 2.4 * s, 3 * s);
        }
        ctx.lineWidth = Math.max(2, 3 * s);                       /* 拐靠在椅子边上 */
        ctx.beginPath(); ctx.moveTo(26 * s, 2 * s); ctx.lineTo(33 * s, -62 * s); ctx.stroke();
        ctx.globalAlpha *= .55;
        ctx.beginPath(); ctx.moveTo(30 * s, 2 * s); ctx.lineTo(37 * s, -58 * s); ctx.stroke();
        ctx.restore();
    }
    /* 回头那一眼：脸朝门的时候，给侧脸一粒眼睛的反光 */
    if (o.herFace > .35 && o.herPose > .3){
        ctx.fillStyle = 'rgba(216,224,230,.5)';
        ctx.fillRect(9 * s, (-114 - 2) * s + (o.herPose > .5 ? 0 : 46 * s), 2.6 * s, 3.4 * s);
    }
    ctx.restore();
}

function vignette(ctx, VW, VH, k){
    k = Math.max(0, Math.min(1.2, k));
    var g = ctx.createRadialGradient(VW / 2, VH * .5, Math.min(VW, VH) * .10,
                                     VW / 2, VH * .5, Math.max(VW, VH) * .78);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,' + (0.42 + 0.34 * k).toFixed(3) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}

/* ---------------- 对外 ---------------- */
function open(canvas){
    var ctx = canvas.getContext('2d');
    var VW = 0, VH = 0, dpr = 1, raf = 0;
    var fired = {};                       /* 带声响的 cue 只演一次 */

    var st = {}, tg = {}, i;
    for (i = 0; i < KEYS.length; i++){ st[KEYS[i]] = 0; tg[KEYS[i]] = 0; }
    st.fade = 0; st.amb = 1; st.dark = .12;
    st.herX = .40; st.herY = .845; st.herS = 1.15; st.herA = 1; st.herFace = 1;
    st.camZ = 1; st.camX = .5; st.camY = .5;
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
        var now = Date.now();
        ctx.save();
        ctx.globalAlpha = a;
        /* 整块画布抖（拽窗那一下） */
        if (st.shake > 0.01){
            ctx.translate(Math.sin(now / 22) * 3.4 * st.shake, Math.cos(now / 31) * 2.2 * st.shake);
        }
        /* 镜头：缓慢收紧 */
        if (Math.abs(st.camZ - 1) > .003){
            ctx.translate(VW * st.camX, VH * st.camY);
            ctx.scale(st.camZ, st.camZ);
            ctx.translate(-VW * st.camX, -VH * st.camY);
        }
        room(ctx, VW, VH, st.amb);
        windowDraw(ctx, VW, VH, st.winOpen, st.amb, u, now);
        doorDraw(ctx, VW, VH, st, u, now);
        chairs(ctx, VW, VH, u);
        her(ctx, VW * st.herX, VH * st.herY, st.herS * u, st, u, now);
        vignette(ctx, VW, VH, st.dark + (st.pulse ? 0.10 * Math.sin(now / 560) : 0));
        ctx.restore();
    }
    function frame(){
        for (var k = 0; k < KEYS.length; k++){
            var key = KEYS[k];
            st[key] += (tg[key] - st[key]) * (RATE[key] || 0.055);
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
            var S = window.CUT7Sfx;
            if (SOUND_CUES[name] && !fired[name]){
                fired[name] = 1;
                if (name === 'knob' && S && S.click){
                    st.slitFlick = 1; tg.slitFlick = 0;       /* 门被带得晃了一下，走廊的灯闪一下 */
                    st.tremble = 1;  tg.tremble = 0;
                    S.click();
                }
                if (name === 'stand'){ st.shake = .5; tg.shake = 0; }
                if (name === 'open'){
                    st.shake = 1; tg.shake = 0;
                    if (S && S.whoosh) S.whoosh();
                }
                if (name === 'knock' && S && S.knock){
                    [0, 300, 580, 950].forEach(function(d){
                        setTimeout(function(){
                            S.knock();
                            st.tremble = 1; tg.tremble = 0;   /* 每一记都砸得门一颤 */
                        }, d);
                    });
                }
            }
        },
        stop: function(){
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        }
    };
}

window.CUT7Scene4 = { open: open };
})();
