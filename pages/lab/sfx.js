/* ==================================================================
   CUT7 · 打字音效（WebAudio 现场合成，不依赖任何音频文件）
   ------------------------------------------------------------------
   ★ 每个说话人一条"嗓子"：音色 / 音高 / 时长都不一样，
     闭着眼也能听出来现在是旁白在说、记者在问，还是玻琳秋在答。
       narr 叙述   —— 低沉发闷（180Hz 三角波，压在 760Hz 以下，像隔着一堵墙）
       ji   记者   —— 干脆带齿音（400Hz 方波 + 高频噪声，像对着麦克风提问）
       lq   玻琳秋 —— 明亮微上扬（560Hz 三角波，每字轻轻往上挑一点）
     以后新角色只要在 VOICES 里加一条，其它地方一行都不用改。

   ★ 节奏：不是每字都响（会糊成一片），默认每 2 个字响一下；
     标点处**不响** —— 那里本来就停顿，静一下反而像人在换气。
     一句话开头会多一声稍长稍响的"起声"，换人时最容易听出来。

   ★ M 键开关，状态记在 mp_sfx_v1，换页也记得住。
   ★ 浏览器要求先有一次真实操作才让出声 —— 首次按键 / 点击时解锁，
     所以最开头那一句可能是哑的，这属于浏览器规矩，不是 bug。
   ================================================================== */
(function(){
'use strict';

var KEY = 'mp_sfx_v1';
var _ac = null, _master = null, _on = true;
try { if (localStorage.getItem(KEY) === '0') _on = false; } catch (e){}

function ac(){
    if (_ac) return _ac;
    try {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        _ac = new C();
        _master = _ac.createGain();
        _master.gain.value = 0.7;           /* 总音量：打字声别盖过背景音乐 */
        _master.connect(_ac.destination);
    } catch (e){ _ac = null; }
    return _ac;
}
/* 拿到一个"能出声的" context：没建就建，被挂起就叫醒 */
function live(){
    var a = ac();
    if (!a) return null;
    if (a.state === 'suspended'){ try { a.resume(); } catch (e){} }
    return a;
}
function unlock(){ live(); }
window.addEventListener('keydown', unlock, true);
window.addEventListener('pointerdown', unlock, true);
window.addEventListener('click', unlock, true);

/* ---------------- 嗓子表（加角色就加这里） ---------------- */
var VOICES = {
    /* 叙述：低、闷、慢半拍 */
    narr: { f:180, w:'triangle', g:0.075, d:0.055, lp:760,  jit:0.05,  every:2 },
    /* 记者：中高频方波 + 齿音，硬一点 */
    ji:   { f:400, w:'square',   g:0.030, d:0.032, lp:2400, jit:0.07,  every:2, bite:0.9 },
    /* 玻琳秋：亮，每字微微上挑 */
    lq:   { f:560, w:'triangle', g:0.070, d:0.050, lp:3400, jit:0.035, every:2, glide:1.07 },
    /* 安保大爷：低、沙、慢，上岁数的人说话那味儿 */
    guard:{ f:150, w:'square',   g:0.045, d:0.070, lp:820,  jit:0.06,  every:2 },
    /* 那个男人：更低更闷，一句话要吐很久（第三段起用） */
    man:  { f:120, w:'sawtooth', g:0.040, d:0.095, lp:560,  jit:0.025, every:3 },
    /* 幂偌：圆、亮、柔（正弦波，没有玻琳秋那么"挑"，听着更稳） */
    mp:   { f:640, w:'sine',     g:0.065, d:0.060, lp:4200, jit:0.030, every:2, glide:0.97 }
};

/* 短噪声脉冲：记者的"齿音"、翻页的"嗒"都用它 */
function sibilant(a, t, g0, hz, dur){
    var len = Math.max(1, Math.floor(a.sampleRate * dur));
    var buf = a.createBuffer(1, len, a.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    var n = a.createBufferSource(); n.buffer = buf;
    var hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hz || 2800;
    var g = a.createGain();
    g.gain.setValueAtTime(g0, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(hp); hp.connect(g); g.connect(_master);
    n.start(t); n.stop(t + dur + 0.005);
}

/* 一声"字" */
function blip(v, opt){
    opt = opt || {};
    var a = live();
    if (!a || !_on || a.state !== 'running') return;
    var t = a.currentTime + 0.001;
    var dur  = v.d * (opt.dur  || 1);
    var gain = v.g * (opt.gain || 1);
    var f0   = v.f * (opt.mul || 1) * (1 + (Math.random() * 2 - 1) * v.jit);
    var o = a.createOscillator();
    o.type = v.w;
    o.frequency.setValueAtTime(f0, t);
    if (v.glide) o.frequency.linearRampToValueAtTime(f0 * v.glide, t + dur);
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = v.lp;
    o.connect(lp); lp.connect(g); g.connect(_master);
    o.start(t); o.stop(t + dur + 0.02);
    if (v.bite) sibilant(a, t, v.bite * gain, 2800, 0.028);
}

function V(w){ return VOICES[w] || VOICES.narr; }

/* ---------------- 对外 ---------------- */
var n = 0;                       /* 这句话里已经响了几个字 */

function head(w){                /* 一句话开头那声（稍长稍响，用来"亮嗓子"） */
    n = 0;
    blip(V(w), { dur:1.8, gain:1.4 });
}
function type(w, ch){            /* 打出一个字 */
    var v = V(w);
    if (ch === ' ' || ch === '　' || ch === '\n') return;
    if ('，、；：。！？…—'.indexOf(ch) >= 0){ n = 0; return; }   /* 标点＝换气 */
    n++;
    if (n % v.every === 0) blip(v);
}
/* 下面这几个是界面音，跟"谁在说话"无关，全段通用 */
function tone(f0, f1, dur, gain, wave){
    var a = live();
    if (!a || !_on || a.state !== 'running') return;
    var t = a.currentTime + 0.001;
    var o = a.createOscillator(); o.type = wave || 'square';
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(_master);
    o.start(t); o.stop(t + dur + 0.02);
}
function step(){ tone(300, 300, 0.045, 0.05); }          /* 翻页 / 进入 */
function move(){ tone(520, 520, 0.03,  0.035); }         /* 选关上下移 */
function deny(){ tone(150, 110, 0.10,  0.05); }          /* 这一关还锁着 */
function end(){  tone(300,  90, 0.85,  0.07, 'sine'); }  /* 一段说完，镜头往下 */

/* —— 第五段（铁门）用的三声动静：全都短，其余时候安静 —— */
/* 低频"咚"：f0 砸到 f1，快起快收。敲门 / 闷响都用它 */
function thump(f0, f1, dur, gain){
    var a = live();
    if (!a || !_on || a.state !== 'running') return;
    var t = a.currentTime + 0.001;
    var o = a.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    var g = a.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(_master);
    o.start(t); o.stop(t + dur + 0.02);
}
function click(){ thump(1700, 850, 0.03, 0.16); }        /* 把手"咔哒"一声 */
function knock(){ thump(165, 52, 0.11, 0.55); thump(92, 40, 0.09, 0.26); }  /* 一记敲门：皮肉声 + 门板共振 */
function whoosh(){                                        /* 拽开窗户那口气 */
    var a = live();
    if (!a || !_on || a.state !== 'running') return;
    sibilant(a, a.currentTime + 0.001, 0.12, 420, 0.45);
}

/* ---------------- 开关 ---------------- */
function toast(text){
    var el = document.getElementById('sfxtoast');
    if (!el){
        el = document.createElement('div');
        el.id = 'sfxtoast';
        document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('on');
    clearTimeout(el._t);
    el._t = setTimeout(function(){ el.classList.remove('on'); }, 1100);
}
function setOn(v){
    _on = !!v;
    try { localStorage.setItem(KEY, _on ? '1' : '0'); } catch (e){}
    toast(_on ? '音效　开' : '音效　关');
    if (_on){ live(); step(); }
}
window.addEventListener('keydown', function(e){
    if (e.key === 'm' || e.key === 'M'){ setOn(!_on); }
}, true);

window.CUT7Sfx = {
    head: head, type: type, step: step, move: move, deny: deny, end: end,
    click: click, knock: knock, whoosh: whoosh,
    /* 页面上冒一行小字（"记下了：……" / "中楼梯 · 可以上楼了"），1.1 秒自己淡掉 */
    say:  toast,
    isOn: function(){ return _on; },
    set:  function(v){ setOn(v); },
    voices: VOICES
};
})();
