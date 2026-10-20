/* ==================================================================
   CUT7 · RPG 通用引擎（一层 / 二层 / 三层共用这一份）
   ------------------------------------------------------------------
   ★ 这一份**不认任何一层的内容**：地图、物品台词、大爷说啥全在
     floor1.js / floor2.js / floor3.js 里，换一层只换数据文件。
   ★ 操作：↑↓←→（或 WASD）走　Z 调查 / 说话　X 取消　C 背包　M 音效
   ★ 说话走 dialog.js 那套打字机（sink:false，说完就地交回操作权），
     所以打字音效、说话人名字、Z 翻页全都自动继承，不另写一套。
   ★ 数据长这样（详见 floor1.js 顶部注释）：
       grid 地图（字符串数组）/ objects 可调查物 / npc 固定剧情人物
       scripts.intro 进楼那几句 / scripts.end 这一段收尾
   ================================================================== */
(function(){
'use strict';

var TILE = 48;
/* 走不过去的格子：墙 / 值班台 / 公告栏 / 药品库门 / 配电间门 / 东楼梯门 / 玻璃门 / 清洁车
   ★ 各层还能往 data.solid 里追加自己的字符（二层用 C 化学 / H 物理 / V 生物 / F 灭火器箱），
     不用为了新房间改这一份。 */
var SOLID_BASE = '#TBMEPGW';

function start(opt){
    var cv  = opt.canvas, ctx = cv.getContext('2d');
    var D   = opt.data;
    var SOLID = SOLID_BASE + (D.solid || '');
    var GW  = D.grid[0].length, GH = D.grid.length;
    var W   = GW * TILE, H = GH * TILE;
    var SFX = window.CUT7Sfx || null;

    var state   = 'play';          /* play / talk / bag / done */
    var flags   = {};              /* 剧情开关，比如 { up:true } = 可以上楼了 */
    var seen    = {};              /* 每个物件被调查过几次（多次调查有不同话） */
    var clues   = [];              /* 背包里的"记下的" */
    var keys    = {};
    var npcStage = 0;
    var handle  = null;            /* 当前这轮对话（dialog.js 返回的句柄） */
    var raf     = 0;

    /* ---------------- 画布：逻辑尺寸恒定，按窗口缩放 ---------------- */
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width  = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    function fit(){
        var aw = window.innerWidth  - 48;
        var ah = window.innerHeight - (opt.bottomSpace || 250);
        var s  = Math.max(0.4, Math.min(aw / W, ah / H));
        cv.style.width  = Math.round(W * s) + 'px';
        cv.style.height = Math.round(H * s) + 'px';
    }
    window.addEventListener('resize', fit);
    fit();

    /* ---------------- 玩家 ---------------- */
    var P = { x: D.start.x * TILE, y: D.start.y * TILE, dir:'up', t:0, moving:false };
    var SPEED = 1.9;               /* 她拄着拐，走不快 */

    function isSolid(tx, ty){
        if (tx < 0 || ty < 0 || tx >= GW || ty >= GH) return true;
        if (SOLID.indexOf(D.grid[ty].charAt(tx)) >= 0) return true;
        if (D.npc && Math.round(D.npc.x) === tx && Math.round(D.npc.y) === ty) return true;
        return false;
    }
    function blocked(nx, ny){
        var x0 = Math.floor((nx - 11) / TILE), x1 = Math.floor((nx + 11) / TILE);
        var y0 = Math.floor((ny - 10) / TILE), y1 = Math.floor((ny + 10) / TILE);
        for (var ty = y0; ty <= y1; ty++)
            for (var tx = x0; tx <= x1; tx++)
                if (isSolid(tx, ty)) return true;
        return false;
    }

    /* ---------------- 画 ---------------- */
    function drawBase(){
        ctx.fillStyle = '#0b0e12';
        ctx.fillRect(0, 0, W, H);
        for (var ty = 0; ty < GH; ty++){
            for (var tx = 0; tx < GW; tx++){
                var c = D.grid[ty].charAt(tx), x = tx * TILE, y = ty * TILE;
                if (c === '#'){
                    ctx.fillStyle = '#1d232a'; ctx.fillRect(x, y, TILE, TILE);
                    ctx.fillStyle = 'rgba(200,208,194,.11)'; ctx.fillRect(x, y, TILE, 3);
                } else {
                    ctx.fillStyle = ((tx + ty) % 2) ? '#141a20' : '#161d23';
                    ctx.fillRect(x, y, TILE, TILE);
                    ctx.strokeStyle = 'rgba(200,208,194,.045)';
                    ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
                }
            }
        }
    }
    function frame(x, y, w, h, fill, edge){
        ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
        if (edge){ ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.lineWidth = 1; }
    }
    /* 各种物件的画法：全是几何块，跟整站的暗色一套 */
    function drawObj(o){
        var cx = o.x * TILE, cy = o.y * TILE;               /* o.x / o.y 是格心（可带 .5） */
        if (o.kind === 'board'){
            frame(cx - 20, cy - 15, 40, 30, '#3a3228', '#4c4235');
            frame(cx - 16, cy - 11, 32, 10, '#cfc7b8');
            frame(cx - 16, cy + 1, 32, 10, '#cfc7b8');
            ctx.fillStyle = '#8d3b3b'; ctx.fillRect(cx - 16, cy - 11, 32, 3);
        } else if (o.kind === 'door'){
            frame(cx - 17, cy - 22, 34, 44, '#20262c', '#39424b');
            ctx.fillStyle = '#9aa0a6'; ctx.fillRect(cx + 10, cy, 4, 4);
            if (o.locked){
                ctx.strokeStyle = '#7d8790'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(cx - 17, cy - 2); ctx.lineTo(cx + 17, cy - 2); ctx.stroke();
                ctx.lineWidth = 1;
                frame(cx - 13, cy - 14, 26, 10, '#cfc7b8');
                ctx.fillStyle = '#8d3b3b'; ctx.fillRect(cx - 10, cy - 11, 20, 2);
            }
            if (o.iron){
                /* 大铁门（三层播音教室那扇）：厚框 + 一掌宽的巡视窗 + 反锁旋钮 */
                ctx.strokeStyle = '#4a5560'; ctx.lineWidth = 2;
                ctx.strokeRect(cx - 17, cy - 22, 34, 44);
                ctx.lineWidth = 1;
                frame(cx - 6, cy - 15, 11, 8, 'rgba(226,220,196,.16)', '#55606a');
                ctx.fillStyle = '#78828c';
                ctx.beginPath(); ctx.arc(cx - 11, cy + 5, 2.4, 0, Math.PI * 2); ctx.fill();
            }
        } else if (o.kind === 'cart'){
            frame(cx - 14, cy - 6, 28, 20, '#2c363d', '#3d4a53');
            ctx.fillStyle = '#1a2228'; ctx.fillRect(cx - 12, cy - 4, 24, 5);
            ctx.strokeStyle = '#8a7f6a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx + 12, cy + 10); ctx.lineTo(cx - 4, cy - 26); ctx.stroke();
            ctx.lineWidth = 1;
            frame(cx - 10, cy - 30, 12, 6, '#6f675a');
        } else if (o.kind === 'desk'){
            frame(cx - 44, cy - 12, 88, 24, '#2e2a24', '#3b362e');
            frame(cx - 44, cy + 8, 88, 8, '#26221d');
            frame(cx - 30, cy - 8, 18, 10, '#cfc7b8');          /* 来访登记本 */
            ctx.fillStyle = '#9aa0a6'; ctx.fillRect(cx + 16, cy - 7, 8, 8);  /* 搪瓷缸 */
        } else if (o.kind === 'gate'){
            frame(cx - 34, cy - 22, 68, 44, 'rgba(150,190,200,.14)', '#39424b');
            ctx.strokeStyle = '#4a5560';
            ctx.beginPath(); ctx.moveTo(cx, cy - 22); ctx.lineTo(cx, cy + 22); ctx.stroke();
        } else if (o.kind === 'win'){
            /* 走廊的窗：框 + 一小块夜色。天已经暗了 */
            frame(cx - 23, cy - 19, 46, 38, '#0d1622', '#39424b');
            ctx.fillStyle = '#b6c3d4';
            ctx.fillRect(cx - 12, cy - 13, 3, 3); ctx.fillRect(cx + 4, cy - 8, 2, 2);
            ctx.fillStyle = 'rgba(140,170,210,.22)';
            ctx.fillRect(cx - 19, cy + 6, 38, 8);              /* 远处的操场灯 */
            ctx.fillStyle = '#39424b';
            ctx.fillRect(cx - 1, cy - 19, 2, 38);              /* 窗棂 */
            ctx.fillRect(cx - 23, cy - 1, 46, 2);
        } else if (o.kind === 'fire'){
            /* 灭火器箱：红的，玻璃是事故后新换的 */
            frame(cx - 13, cy - 16, 26, 32, '#7d3232', '#9c4343');
            ctx.fillStyle = 'rgba(220,230,225,.16)'; ctx.fillRect(cx - 9, cy - 13, 18, 13);
            ctx.fillStyle = '#cfc7b8'; ctx.fillRect(cx - 9, cy + 3, 18, 6);
            ctx.fillStyle = '#8d3b3b'; ctx.fillRect(cx - 9, cy + 6, 18, 2);
        } else if (o.kind === 'stair'){
            for (var i = 0; i < 4; i++){
                ctx.fillStyle = i % 2 ? '#232b33' : '#2b343d';
                ctx.fillRect(cx - 20 + i * 2, cy - 20 + i * 10, 40 - i * 4, 10);
            }
            ctx.fillStyle = (o.need ? !!flags[o.need] : true) ? '#9ad4b6' : '#5b635a';
            ctx.beginPath();
            ctx.moveTo(cx, cy - 30); ctx.lineTo(cx - 7, cy - 22); ctx.lineTo(cx + 7, cy - 22);
            ctx.closePath(); ctx.fill();
        } else if (o.kind === 'blackboard'){
            /* 黑板 + 讲台：板书没人擦；讲台上有粉笔，黑板擦却不在 */
            ctx.fillStyle = '#1d232a'; ctx.fillRect(cx - 72, cy - 24, 144, 48);
            ctx.fillStyle = 'rgba(200,208,194,.11)'; ctx.fillRect(cx - 72, cy - 24, 144, 3);
            frame(cx - 52, cy - 30, 104, 28, '#22322a', '#3a4a40');
            ctx.strokeStyle = 'rgba(214,222,216,.30)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx - 44, cy - 22); ctx.lineTo(cx + 8,  cy - 22); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx - 44, cy - 15); ctx.lineTo(cx + 22, cy - 15); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx - 44, cy - 8);  ctx.lineTo(cx - 6,  cy - 8);  ctx.stroke();
            frame(cx - 24, cy + 4, 48, 14, '#2e2a24', '#3b362e');          /* 讲台 */
            ctx.fillStyle = '#cfc7b8'; ctx.fillRect(cx - 12, cy, 11, 4);   /* 半盒粉笔 */
        } else if (o.kind === 'mirror'){
            /* 镜子：贴墙一面，练播音看口型用的（先把墙底补上再挂镜子） */
            ctx.fillStyle = '#1d232a'; ctx.fillRect(cx - 24, cy - 24, 48, 48);
            ctx.fillStyle = 'rgba(200,208,194,.11)'; ctx.fillRect(cx - 24, cy - 24, 48, 3);
            frame(cx - 11, cy - 20, 22, 40, 'rgba(190,206,216,.16)', '#4a5560');
            ctx.fillStyle = 'rgba(224,236,244,.14)'; ctx.fillRect(cx - 8, cy - 16, 5, 32);
        } else if (o.kind === 'chair'){
            /* 小方椅子：一架一架，排得整整齐齐 */
            frame(cx - 11, cy - 4, 22, 12, '#2c343c', '#414c56');
            ctx.fillStyle = '#1c232a'; ctx.fillRect(cx + 7, cy - 16, 4, 14);
            ctx.fillStyle = '#232b33'; ctx.fillRect(cx - 9, cy + 8, 3, 5); ctx.fillRect(cx + 6, cy + 8, 3, 5);
        } else if (o.kind === 'bag'){
            /* 靠墙的小方椅 + 幂偌的黑包（拉链敞着半截） */
            frame(cx - 12, cy - 4, 22, 12, '#2c343c', '#414c56');
            ctx.fillStyle = '#1c232a'; ctx.fillRect(cx - 12, cy - 18, 4, 16);
            frame(cx - 9, cy - 19, 15, 16, '#141a20', '#080b0e');
            ctx.strokeStyle = '#5a4f3e'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx - 5, cy - 19); ctx.lineTo(cx - 5, cy - 8); ctx.stroke();
        }
    }
    function drawActor(a){
        var x = a.x, y = a.y, bob = a.moving ? Math.sin(a.t * 2) * 1.6 : 0;
        ctx.fillStyle = 'rgba(0,0,0,.4)';
        ctx.beginPath(); ctx.ellipse(x, y + 14, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
        if (a.guard){
            /* 安保大爷：矮一点、灰头发、马甲 */
            frame(x - 11, y - 12 + bob, 22, 24, '#2f3339', '#454d55');
            ctx.fillStyle = '#3a424a'; ctx.fillRect(x - 11, y - 8 + bob, 22, 10);
            ctx.fillStyle = '#cdc5b6';
            ctx.beginPath(); ctx.arc(x, y - 18 + bob, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#8f959b';
            ctx.beginPath(); ctx.arc(x, y - 20 + bob, 8, Math.PI, Math.PI * 2); ctx.fill();
        } else {
            /* 玻琳秋：校服剪影 + 一副拐杖 */
            ctx.strokeStyle = '#8a7f6a'; ctx.lineWidth = 3;
            var sw = a.moving ? Math.sin(a.t * 2) * 3 : 0;
            ctx.beginPath(); ctx.moveTo(x - 13, y - 8); ctx.lineTo(x - 15 + sw, y + 13); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + 13, y - 8); ctx.lineTo(x + 15 - sw, y + 13); ctx.stroke();
            ctx.lineWidth = 1;
            frame(x - 10, y - 11 + bob, 20, 22, '#263039', '#3d4854');
            ctx.fillStyle = '#cdc5b6';
            ctx.beginPath(); ctx.arc(x, y - 17 + bob, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#2a2f36';
            ctx.beginPath(); ctx.arc(x, y - 19 + bob, 8, Math.PI, Math.PI * 2); ctx.fill();
        }
        if (!a.guard && a.dir === 'up') return;             /* 背对着：看不见脸 */
        ctx.fillStyle = '#2a2f36';
        var ey = a.guard ? y - 17 : y - 16, ox = a.dir === 'left' ? -3 : (a.dir === 'right' ? 3 : 0);
        ctx.fillRect(x - 4 + ox, ey, 2, 3); ctx.fillRect(x + 2 + ox, ey, 2, 3);
    }
    function drawMark(o){
        var cx = o.x * TILE, cy = o.y * TILE - (o.kind === 'desk' ? 22 : 30);
        var b = Math.sin(Date.now() / 260) * 2;
        ctx.fillStyle = '#9ad4b6';
        ctx.beginPath();
        ctx.moveTo(cx, cy + b); ctx.lineTo(cx - 7, cy - 10 + b); ctx.lineTo(cx + 7, cy - 10 + b);
        ctx.closePath(); ctx.fill();
    }

    function render(){
        drawBase();
        var list = [];
        D.objects.forEach(function(o){ list.push({ y:o.y * TILE, fn:function(){ drawObj(o); } }); });
        if (D.npc) list.push({ y:D.npc.y * TILE, fn:function(){ drawActor({ x:(D.npc.x + .5) * TILE, y:(D.npc.y + .5) * TILE, dir:'down', t:P.t, moving:false, guard:true }); } });
        list.push({ y:P.y, fn:function(){ drawActor(P); } });
        list.sort(function(a, b){ return a.y - b.y; });
        list.forEach(function(i){ i.fn(); });
        if (state === 'play'){
            var tg = findTarget();
            if (tg) drawMark(tg);
        }
    }

    /* ---------------- 找她面前那个东西 ---------------- */
    function dirVec(){
        if (P.dir === 'left')  return { x:-1, y:0 };
        if (P.dir === 'right') return { x: 1, y:0 };
        if (P.dir === 'up')    return { x:0, y:-1 };
        return { x:0, y:1 };
    }
    function findTarget(){
        var best = null, bs = 1e9, dv = dirVec();
        var list = D.objects.slice();
        /* npc 在 grid 里是整数格，物件用的是格心，这里补那半个格 */
        if (D.npc) list.push({ kind:'npc', x:D.npc.x + .5, y:D.npc.y + .5 });
        list.forEach(function(o){
            var cx = o.x * TILE, cy = o.y * TILE;
            var dx = cx - P.x, dy = cy - P.y, d = Math.sqrt(dx * dx + dy * dy);
            /* 大爷那边特意放宽一点 —— 隔着值班台跟他说话本来就该够得着 */
            var reach = (o.reach || (o.kind === 'npc' ? 2.1 : 1.9)) * TILE;
            if (d > reach) return;
            var front = (dx * dv.x + dy * dv.y) > d * 0.25 ? 0 : 70;   /* 面前优先 */
            var s = d + front;
            if (s < bs){ bs = s; best = o; }
        });
        return best;
    }

    /* ---------------- 说话 ---------------- */
    function boxShow(on){
        if (opt.box) opt.box.classList.toggle('off', !on);
    }
    function talk(lines, defWho, after){
        state = 'talk'; keys = {};
        var arr = lines.map(function(x){
            return (typeof x === 'string') ? { w: defWho || 'narr', t: x } : x;
        });
        boxShow(true);
        handle = window.CUT7Dialog.play(arr, {
            who:  opt.who, box: opt.box, name: opt.name, text: opt.text, next: opt.next,
            sink: false,
            onEnd:  function(){ state = 'play'; boxShow(false); if (after) after(); },
            onExit: function(){ state = 'play'; boxShow(false); }
        });
    }
    function npcTalk(){
        var st = D.npc.stages[Math.min(npcStage, D.npc.stages.length - 1)];
        talk(st.lines, 'guard', function(){
            if (st.set){
                flags[st.set] = true;
                if (SFX) SFX.say(st.tip || '可以上楼了');
            }
            if (npcStage < D.npc.stages.length - 1) npcStage++;
        });
    }
    function inspect(o){
        var n = seen[o.id] || 0;
        var line = o.lines[Math.min(n, o.lines.length - 1)];
        if (n < o.lines.length) seen[o.id] = n + 1;
        talk([line], o.w || 'narr', function(){
            if (o.clue && clues.indexOf(o.clue) < 0){
                clues.push(o.clue);
                if (SFX) SFX.say('记下了：' + o.clue);
            }
            /* 有些东西看过了就推剧情（二层：看过那间封闭的实验室，才肯上楼） */
            if (o.set && !flags[o.set]){
                flags[o.set] = true;
                if (SFX) SFX.say(o.setTip || '可以往前走了');
            }
        });
    }
    function interact(){
        var o = findTarget();
        if (!o) return;
        if (SFX) SFX.step();
        if (o.kind === 'npc'){ npcTalk(); return; }
        if (o.need && !flags[o.need]){ talk(o.locked || ['（还不行。）'], 'narr'); return; }
        if (o.action === 'up'){        /* 上楼：交给页面去收尾 */
            state = 'done';
            if (opt.onExit) opt.onExit();
            return;
        }
        inspect(o);
    }

    /* ---------------- 背包（C） ---------------- */
    var bagOpen = false;
    function paintBag(){
        if (!opt.bagList) return;
        var html = '';
        (D.items || []).forEach(function(it){ html += '<li class="it">' + it + '</li>'; });
        clues.forEach(function(c){ html += '<li class="cl">' + c + '</li>'; });
        if (!clues.length) html += '<li class="none">（还没有记下什么。）</li>';
        opt.bagList.innerHTML = html;
    }
    function toggleBag(){
        bagOpen = !bagOpen;
        if (bagOpen){ paintBag(); }
        if (opt.bag) opt.bag.classList.toggle('on', bagOpen);
        state = bagOpen ? 'bag' : 'play';
        keys = {};
        if (SFX) SFX.step();
    }
    function closeBag(){
        bagOpen = false; state = 'play'; keys = {};
        if (opt.bag) opt.bag.classList.remove('on');
    }

    /* ---------------- 键盘 ---------------- */
    function onDown(e){
        var k = e.key;
        if (k === 'm' || k === 'M') return;                       /* 音效开关归 sfx.js */
        if (state === 'bag'){
            if (k === 'c' || k === 'C' || k === 'x' || k === 'X' || k === 'Escape' || k === 'z' || k === 'Z'){ e.preventDefault(); closeBag(); }
            return;
        }
        if (state !== 'play'){                                    /* 说话中：交给 dialog.js */
            if (k.indexOf('Arrow') === 0) e.preventDefault();
            return;
        }
        if (k.indexOf('Arrow') === 0){ keys[k] = true; e.preventDefault(); return; }
        if (k === 'w' || k === 'a' || k === 's' || k === 'd'){ keys[k] = true; return; }
        if (k === 'z' || k === 'Z' || k === 'Enter'){ e.preventDefault(); interact(); return; }
        if (k === 'c' || k === 'C'){ e.preventDefault(); toggleBag(); return; }
        if (k === 'x' || k === 'X'){ e.preventDefault(); return; }   /* 取消：这里没有可取消的 */
    }
    function onUp(e){
        if (e.key.indexOf('Arrow') === 0 || 'wasd'.indexOf(e.key) >= 0) delete keys[e.key];
    }
    function blur(){ keys = {}; }
    document.addEventListener('keydown', onDown);
    document.addEventListener('keyup', onUp);
    window.addEventListener('blur', blur);

    /* ---------------- 主循环 ---------------- */
    function update(){
        if (state !== 'play') return;
        var dx = 0, dy = 0;
        if (keys.ArrowLeft  || keys.a) dx--;
        if (keys.ArrowRight || keys.d) dx++;
        if (keys.ArrowUp    || keys.w) dy--;
        if (keys.ArrowDown  || keys.s) dy++;
        if (dx || dy){
            var len = Math.sqrt(dx * dx + dy * dy); dx /= len; dy /= len;
            var nx = P.x + dx * SPEED, ny = P.y + dy * SPEED;
            if (!blocked(nx, P.y)) P.x = nx;
            if (!blocked(P.x, ny)) P.y = ny;
            P.moving = true; P.t += 0.19;
            if (Math.abs(dx) > Math.abs(dy)) P.dir = dx < 0 ? 'left' : 'right';
            else                            P.dir = dy < 0 ? 'up'    : 'down';
        } else { P.moving = false; P.t += 0.03; }
    }
    function loop(){ update(); render(); raf = requestAnimationFrame(loop); }
    loop();

    /* 进楼那几句 */
    if (opt.intro) talk(opt.intro, 'narr', opt.onIntroEnd);

    return {
        stop: function(){
            cancelAnimationFrame(raf);
            document.removeEventListener('keydown', onDown);
            document.removeEventListener('keyup', onUp);
            window.removeEventListener('blur', blur);
            window.removeEventListener('resize', fit);
            if (handle && handle.destroy) handle.destroy();
        },
        flags: flags,
        pos:   function(){ return { x:P.x, y:P.y }; }
    };
}

window.CUT7RPG = { start: start };
})();
