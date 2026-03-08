/* ════════════════════════════════════════
   ElbowCare — app.js
════════════════════════════════════════ */

/* ── DATA ── */
const FACTS = [
  {en:"The human elbow experiences large forces during repetitive gripping — regular breaks matter.",np:"बारम्बार समात्ने काम गर्दा कुहिनोमा धेरै बल लाग्छ — नियमित आराम महत्त्वपूर्ण छ।"},
  {en:"Taking a 5-minute break every hour can reduce repetitive strain injuries by up to 40%.",np:"प्रत्येक घण्टामा ५ मिनेट आराम लिँदा चोट ४०% सम्म घटाउन सकिन्छ।"},
  {en:"Stretching forearm muscles before and after work helps prevent tendon irritation.",np:"काम अघि र पछि अग्रभुजा तन्काउनाले टेन्डनको जलनबाट बच्न मद्दत गर्छ।"},
  {en:"Staying hydrated keeps tendons elastic and reduces injury risk during repetitive tasks.",np:"पानी पिइरहनाले टेन्डन लचकदार रहन्छ र चोटको जोखिम घट्छ।"},
  {en:"Forearm strengthening exercises can reduce tennis elbow recurrence by over 70%.",np:"अग्रभुजा बलियो बनाउने व्यायामले टेनिस एल्बो ७०%+ ले घटाउन सक्छ।"},
  {en:"Tennis elbow affects up to 3% of the general population — not just athletes.",np:"टेनिस एल्बोले ३% सम्म सामान्य मानिसलाई असर गर्छ — केवल खेलाडीलाई होइन।"},
  {en:"Good posture at your workstation significantly reduces elbow and wrist problems.",np:"राम्रो बसाइले कुहिनो र नाडीको समस्या उल्लेखनीय रूपमा घटाउँछ।"},
  {en:"Even 30-second micro-breaks every 20 minutes can dramatically reduce muscle fatigue.",np:"हरेक २० मिनेटमा ३० सेकेन्डको आराम लिँदा थकान धेरै घट्छ।"},
];

/*
  VIDEO FILES: Place your video files in the same folder as index.html.
  Name them: exercise1.mp4, exercise2.mp4, exercise3.mp4, exercise4.mp4
  Or update the `vid` field below to match your actual filenames.
*/
const EX = [
  {vid:"exercise1.mp4", t:"Wrist Extension Stretch", tn:"नाडी विस्तार तन्काउ",
   d:"Hold arm out palm-down. Gently bend wrist upward with other hand. Hold 20 seconds.",
   dn:"हात अगाडि पठाउनुहोस् हत्केला तल। अर्को हातले नाडी माथि झुकाउनुहोस्। २० सेकेन्ड राख्नुहोस्।", s:30},
  {vid:"exercise2.mp4", t:"Wrist Flexion Stretch", tn:"नाडी झुकाव तन्काउ",
   d:"Hold arm out palm-up. Gently bend wrist downward with other hand. Hold 20 seconds.",
   dn:"हात अगाडि पठाउनुहोस् हत्केला माथि। नाडी तल झुकाउनुहोस्। २० सेकेन्ड राख्नुहोस्।", s:30},
  {vid:"exercise3.mp4", t:"Forearm Rotation", tn:"अग्रभुजा घुमाउने",
   d:"Elbow at side, bent 90°. Slowly rotate palm up then palm down. Repeat 10 times.",
   dn:"कुहिनो छेउमा ९०° मोड। हत्केला माथि र तल बिस्तारै घुमाउनुहोस्। १० पटक।", s:25},
  {vid:"exercise4.mp4", t:"Finger Spread & Squeeze", tn:"औंला फिँजाउ र निचोर",
   d:"Spread fingers wide, hold 5 seconds, then gently close into a fist. Repeat 10 times.",
   dn:"औंलाहरू फराकिलो फैलाउनुहोस्, ५ सेकेन्ड, त्यसपछि मुट्ठी बाँध्नुहोस्। १० पटक।", s:20},
];

/* ── STORAGE ── */
const LS = {
  users()          { return JSON.parse(localStorage.getItem('ec_u') || '[]'); },
  saveUsers(u)     { localStorage.setItem('ec_u', JSON.stringify(u)); },
  find(u, p)       { return this.users().find(x => x.u === u && x.p === p); },
  exists(u)        { return this.users().some(x => x.u === u); },
  add(u, p)        { const a = this.users(); a.push({u, p}); this.saveUsers(a); },
  stats(u)         { return JSON.parse(localStorage.getItem('ec_s_' + u) || '{"t":0,"m":0,"d":0}'); },
  saveStats(u, s)  { localStorage.setItem('ec_s_' + u, JSON.stringify(s)); },
  addSess(u, m)    { const s = this.stats(u); s.t++; s.m += m; s.d++; this.saveStats(u, s); return s; },
  pain(u)          { return JSON.parse(localStorage.getItem('ec_pain_' + u) || '[]'); },
  addPain(u, a)    { const h = this.pain(u); h.push({dt: new Date().toISOString(), a}); localStorage.setItem('ec_pain_' + u, JSON.stringify(h)); },
  user()      { return localStorage.getItem('ec_cu'); },
  setUser(u)  { localStorage.setItem('ec_cu', u); },
  clearUser() { localStorage.removeItem('ec_cu'); },
};

/* ── STATE ── */
let TM = {dur:0, rem:0, iv:null, run:false, pau:false};
let exI = 0, exIv = null, exL = 0, needPain = false;

/* ── VISIBILITY API — keeps timer accurate when app is backgrounded ── */
let tmBg = null;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (TM.run) tmBg = Date.now();
  } else {
    if (TM.run && tmBg !== null) {
      const elapsed = Math.floor((Date.now() - tmBg) / 1000);
      TM.rem = Math.max(0, TM.rem - elapsed);
      const el = document.getElementById('ctm');
      if (el) el.textContent = fmt(TM.rem);
      if (TM.rem <= 0) tmDone();
    }
    tmBg = null;
  }
});

/* ── ROUTER ── */
function go(pg, d = {}) {
  const u = LS.user();
  const noNav = ['intro', 'login', 'register'];
  const nav = document.getElementById('nav');
  nav.style.display = noNav.includes(pg) ? 'none' : 'flex';
  const unEl = document.getElementById('nav-username');
  if (unEl && u) unEl.textContent = u;
  const drop = document.getElementById('user-drop'), pill = document.getElementById('user-pill');
  if (drop) { drop.classList.remove('show'); pill && pill.classList.remove('open'); }
  ['timer','dashboard','exercises'].forEach(t => {
    const e = document.getElementById('nt-' + t); if (e) e.classList.remove('on');
  });
  const nt = document.getElementById('nt-' + pg); if (nt) nt.classList.add('on');
  document.getElementById('app').innerHTML = '<div class="page">' + render(pg, d) + '</div>';
  window.scrollTo(0, 0);
}

/* ── PAGE RENDERER ── */
function render(pg, d = {}) {
  const fns = {
    intro, login, register, dashboard, timer, exercises, rest,
    'ex-prompt': exprompt, 'ex-player': explayer, 'ex-therapy': extherapy,
    fact, pain, 'pain-resp': painresp,
  };
  return (fns[pg] || (() => ''))(d);
}

/* ════════════════════════════════════════
   PAGE TEMPLATES
════════════════════════════════════════ */

function intro() { return `
<div class="intro-wrap">
  <div>
    <span class="logo-emoji">💪</span>
    <h1 class="intro-h1">ElbowCare</h1>
    <div class="intro-tag">Work Smart. Rest Right. Stay Strong.</div>
    <div class="intro-tag-np">स्मार्ट काम। सही आराम। बलियो कुहिनो।</div>
  </div>
  <div class="card" style="text-align:left;">
    <p class="intro-desc">This app helps workers prevent tennis elbow by managing work sessions, rest breaks, and simple exercises.</p>
    <p class="intro-desc-np">यो एपले काम सत्र, आराम र सरल व्यायाम व्यवस्थापन गरेर कुहिनोको समस्याबाट बचाउँछ।</p>
  </div>
  <div class="intro-btns">
    <button class="btn bp big full" onclick="go('login')">Login <span class="np-s">लगिन</span></button>
    <button class="btn bs big full" onclick="go('register')">Register <span class="np-s">दर्ता</span></button>
  </div>
</div>`; }

function login(d = {}) { return `
<div style="padding-top:1.5rem;">
  <button class="back" onclick="go('intro')">← Back</button>
  <div class="card">
    <div style="font-size:2.2rem;text-align:center;margin-bottom:.7rem;">🔐</div>
    <h2 style="font-family:'Fraunces',serif;font-size:clamp(1.3rem,6vw,1.55rem);color:var(--green);text-align:center;margin-bottom:1.15rem;">
      Login <span style="font-size:.86rem;color:var(--np);font-weight:400;">लगिन</span>
    </h2>
    ${d.err ? `<div class="err">${d.err}</div>` : ''}
    ${d.ok  ? `<div class="ok">${d.ok}</div>`   : ''}
    <div class="field">
      <label>Username <span class="lnp">प्रयोगकर्ता नाम</span></label>
      <input id="lu" type="text" placeholder="Your username" autocomplete="username" autocapitalize="none"/>
    </div>
    <div class="field">
      <label>Password <span class="lnp">पासवर्ड</span></label>
      <input id="lp" type="password" placeholder="Your password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()"/>
    </div>
    <button class="btn bp big full" onclick="doLogin()">Login <span class="np-s">लगिन</span></button>
    <div class="asw">No account? <a onclick="go('register')">Register here</a></div>
  </div>
</div>`; }

function register(d = {}) { return `
<div style="padding-top:1.5rem;">
  <button class="back" onclick="go('intro')">← Back</button>
  <div class="card">
    <div style="font-size:2.2rem;text-align:center;margin-bottom:.7rem;">📝</div>
    <h2 style="font-family:'Fraunces',serif;font-size:clamp(1.3rem,6vw,1.55rem);color:var(--green);text-align:center;margin-bottom:1.15rem;">
      Register <span style="font-size:.86rem;color:var(--np);font-weight:400;">दर्ता</span>
    </h2>
    ${d.err ? `<div class="err">${d.err}</div>` : ''}
    <div class="field">
      <label>Username <span class="lnp">प्रयोगकर्ता नाम</span></label>
      <input id="ru" type="text" placeholder="Choose a username" autocomplete="username" autocapitalize="none"/>
    </div>
    <div class="field">
      <label>Password <span class="lnp">पासवर्ड</span></label>
      <input id="rp" type="password" placeholder="Choose a password" autocomplete="new-password"/>
    </div>
    <div class="field">
      <label>Confirm Password <span class="lnp">पासवर्ड दोहोर्याउनुहोस्</span></label>
      <input id="rp2" type="password" placeholder="Repeat password" autocomplete="new-password" onkeydown="if(event.key==='Enter')doRegister()"/>
    </div>
    <button class="btn bp big full" onclick="doRegister()">Create Account <span class="np-s">खाता बनाउनुहोस्</span></button>
    <div class="asw">Have an account? <a onclick="go('login')">Login here</a></div>
  </div>
</div>`; }

function dashboard() {
  const u = LS.user(), s = LS.stats(u), pain = LS.pain(u);
  const h = Math.floor(s.m / 60), m = s.m % 60, avg = s.d > 0 ? Math.round(s.m / s.d) : 0;
  const pct = s.d > 0 ? (s.d % 5) / 5 * 100 : 0;
  const PL = {A:'As it is', B:'Bit relieved', C:'Much better', D:'Completely gone'};
  const PC = {A:'#c0392b', B:'#e08a1e', C:'#27ae60', D:'#2980b9'};
  const last = pain.length ? pain[pain.length - 1] : null;
  return `
<div class="dash-wrap">
  <div class="dash-top">
    <div>
      <div class="dash-hi">Welcome back,</div>
      <div class="dash-name">${u}</div>
    </div>
    <div class="active-badge">💪 Elbow Care Active</div>
  </div>
  <div class="stats">
    <div class="card sc s1"><div class="ico">⏱️</div><div class="val">${h}h ${m}m</div><div class="lbl">Total Work Time<span class="lnp">कुल काम समय</span></div></div>
    <div class="card sc s2"><div class="ico">✅</div><div class="val">${s.d}</div><div class="lbl">Sessions Done<span class="lnp">सत्र पूरा</span></div></div>
    <div class="card sc s3"><div class="ico">📊</div><div class="val">${avg}m</div><div class="lbl">Avg Session<span class="lnp">औसत सत्र</span></div></div>
    <div class="card sc s4"><div class="ico">📋</div><div class="val">${pain.length}</div><div class="lbl">Pain Reports<span class="lnp">दर्द रिपोर्ट</span></div></div>
  </div>
  ${last ? `<div class="card last-pain" style="margin-bottom:1rem;">
    <div class="lp-label">Last Pain Report<span class="lp-np">अन्तिम रिपोर्ट</span></div>
    <div class="lp-badge" style="background:${PC[last.a]}20;color:${PC[last.a]};border-color:${PC[last.a]}40;">${PL[last.a]}</div>
    <div class="lp-date">${new Date(last.dt).toLocaleDateString()}</div>
  </div>` : ''}
  <button class="btn bp big full" style="margin-bottom:1.1rem;" onclick="go('timer')">🕐 Start Work Session <span class="np-s">काम सुरु गर्नुहोस्</span></button>
  ${s.d > 0 ? `<div class="card">
    <div class="prog-lbl">Sessions until pain check-in <span class="prog-np">अर्को मूल्यांकनसम्म</span></div>
    <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
    <div class="prog-n">${s.d % 5}/5</div>
  </div>` : ''}
</div>`; }

function timer() {
  const ts = TM, disp = ts.rem > 0 ? fmt(ts.rem) : '00:00';
  const st = ts.run ? 'Working…' : ts.pau ? 'Paused' : 'Ready';
  return `
<div class="timer-wrap">
  <div class="pg-title">Work Timer<span class="pg-title-np">काम टाइमर</span></div>
  <div class="clock ${ts.run ? 'tick' : ''}">
    <div class="clock-t" id="ctm">${disp}</div>
    <div class="clock-s">${st}</div>
  </div>
  ${!ts.run && !ts.pau ? `
  <div style="width:100%;">
    <div class="dur-label">Select Duration <span class="np">अवधि छान्नुहोस्</span></div>
    <div class="dur-grid">
      <button class="dur ${ts.dur===30?'on':''}" onclick="setDur(30)">30 min</button>
      <button class="dur ${ts.dur===40?'on':''}" onclick="setDur(40)">40 min</button>
      <button class="dur ${ts.dur===50?'on':''}" onclick="setDur(50)">50 min</button>
      <button class="dur ${ts.dur===60?'on':''}" onclick="setDur(60)">60 min</button>
    </div>
    <div style="margin-top:.7rem;">
      <div class="custom-lbl">Custom <span class="np">कस्टम</span></div>
      <div class="cust-row">
        <input type="number" id="cmin" min="1" max="180" placeholder="Minutes" inputmode="numeric"/>
        <button class="btn bs" onclick="setCust()">Set</button>
      </div>
    </div>
  </div>` : ''}
  ${ts.dur > 0 && !ts.run && !ts.pau ? `<div class="sel-chip">${ts.dur} minute session selected</div>` : ''}
  <div class="t-btns">
    ${!ts.run && !ts.pau ? `<button class="btn bp big ${!ts.dur ? 'dim' : ''}" onclick="startTM()">▶ Start <span class="np-s">सुरु</span></button>` : ''}
    ${ts.run  ? `<button class="btn bw big" onclick="pauseTM()">⏸ Pause <span class="np-s">रोक्नुहोस्</span></button>` : ''}
    ${ts.pau  ? `<button class="btn bp big" onclick="resumeTM()">▶ Resume <span class="np-s">जारी</span></button>` : ''}
    ${ts.run || ts.pau ? `<button class="btn bd big" onclick="resetTM()">↺ Reset <span class="np-s">रिसेट</span></button>` : ''}
  </div>
</div>`; }

function exercises() { return `
<div class="exercises-wrap">
  <div style="font-family:'Fraunces',serif;font-size:clamp(1.5rem,7vw,1.75rem);color:var(--green);margin-bottom:.4rem;">
    Exercises <span style="font-size:.85rem;color:var(--np);font-weight:400;font-family:'DM Sans',sans-serif;">व्यायामहरू</span>
  </div>
  <p style="font-size:.87rem;color:var(--mid);line-height:1.6;margin-bottom:.2rem;">These exercises help prevent and relieve tennis elbow.</p>
  <p style="font-size:.79rem;color:var(--np);margin-bottom:1.1rem;">उत्तम परिणामका लागि नियमित गर्नुहोस्।</p>
  ${EX.map((e, i) => `
  <div class="excard" onclick="playAt(${i})">
    <div class="ex-num">${i + 1}</div>
    <div class="ex-info">
      <div class="ex-t">${e.t}</div>
      <div class="ex-tnp">${e.tn}</div>
      <div class="ex-d">${e.d}</div>
      <div class="ex-dur">⏱ ${e.s}s &nbsp;·&nbsp; 📹 ${e.vid}</div>
    </div>
    <div class="ex-arrow">→</div>
  </div>`).join('')}
  <button class="btn bp big full" style="margin-top:.2rem;" onclick="playAll()">▶ Do All Exercises <span class="np-s">सबै व्यायाम</span></button>
</div>`; }

function rest() { return `
<div class="ov-page">
  <div class="ov">
    <div class="big-icon">🌿</div>
    <h2>Time for a break.</h2>
    <div class="np-line">अब आराम गर्ने समय भयो।</div>
    <div class="rest-list">
      <div class="rest-item">🧍 Stand up <span class="np">उठ्नुहोस्</span></div>
      <div class="rest-item">🤸 Stretch your arms <span class="np">हात तन्काउनुहोस्</span></div>
      <div class="rest-item">💧 Drink some water <span class="np">पानी पिउनुहोस्</span></div>
      <div class="rest-item">😌 Relax a moment <span class="np">केही समय आराम गर्नुहोस्</span></div>
    </div>
    <div class="cd-pill" id="rcd">Rest for 60s</div>
    <button class="btn big full" style="background:rgba(255,255,255,.2);color:#fff;border:2px solid rgba(255,255,255,.4);" onclick="doneRest()">✓ Done <span class="np-s">सकियो</span></button>
  </div>
</div>`; }

function exprompt() { return `
<div class="ov-page">
  <div class="ov">
    <div class="big-icon">🏃</div>
    <h2>Time for exercise.</h2>
    <div class="np-line">अब व्यायाम गर्ने समय भयो।</div>
    <p style="font-size:1rem;font-weight:500;">Are you ready?</p>
    <p style="font-size:.88rem;opacity:.8;margin-top:-.65rem;">तयार हुनुहुन्छ?</p>
    <button class="btn big full" style="background:#fff;color:var(--green);font-weight:700;" onclick="startEx()">▶ Start <span class="np-s" style="color:var(--np);">सुरु</span></button>
    <button class="btn bg full" style="color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.3);" onclick="skipFact()">Skip exercises</button>
  </div>
</div>`; }

function explayer() {
  const e = EX[exI], total = EX.length;
  return `
<div class="ex-player-wrap">
  <div class="ex-prog-bar"><div class="ex-prog-fill" style="width:${exI / total * 100}%"></div></div>
  <div class="ex-count">${exI + 1} / ${total}</div>
  <div class="ex-player-title">${e.t}</div>
  <div class="ex-player-title-np">${e.tn}</div>

  <div class="ex-video-wrap" id="vid-wrap-${exI}">
    <video id="ex-vid" src="${e.vid}" playsinline controls preload="metadata" muted
      onerror="showVidPlaceholder(${exI},'${e.vid}')"></video>
  </div>

  <div class="ex-ring">
    <svg class="ex-svg" viewBox="0 0 100 100">
      <circle class="tr" cx="50" cy="50" r="40"/>
      <circle class="tf" id="exc" cx="50" cy="50" r="40"/>
    </svg>
    <div class="ex-n" id="exn">${e.s}</div>
  </div>

  <p class="ex-desc">${e.d}</p>
  <p class="ex-desc-np">${e.dn}</p>

  <div class="ex-ctrls">
    <button class="btn bs" onclick="replayEx()">↺ Rewatch <span class="np-s">फेरि</span></button>
    <button class="btn bp" onclick="nextEx()">Next → <span class="np-s">अर्को</span></button>
  </div>
</div>`; }

function extherapy() { return `
<div class="therapy-wrap">
  <div>
    <div class="therapy-title">After Exercise Care</div>
    <div class="therapy-title-np">व्यायामपछिको हेरचाह</div>
  </div>
  <div class="therapy-cards">
    <div class="therapy-card ice">
      <div class="therapy-icon">🧊</div>
      <div class="therapy-label">Ice Bag</div>
      <div class="therapy-label-np">आइस ब्याग</div>
      <div class="therapy-when">Use when pain is sharp or fresh</div>
      <div class="therapy-when-np">दुखाइ तीव्र वा नयाँ छ भने</div>
    </div>
    <div class="therapy-card heat">
      <div class="therapy-icon">🌡️</div>
      <div class="therapy-label">Hot Bag</div>
      <div class="therapy-label-np">तातो ब्याग</div>
      <div class="therapy-when">Use when pain has calmed down</div>
      <div class="therapy-when-np">दुखाइ कम भएको छ भने</div>
    </div>
  </div>
  <div class="therapy-note">
    Apply ice for <strong>10–15 minutes</strong> to reduce inflammation when pain is sharp, new, or after activity.
    Switch to heat when the pain has settled — warmth helps relax tight muscles and improve blood flow.
    <div class="np-block">
      दुखाइ तीव्र, नयाँ, वा काम गरेपछि भएमा <strong>१०–१५ मिनेट</strong> आइस लगाउनुहोस्।
      दुखाइ कम भएपछि तातो ब्याग प्रयोग गर्नुहोस् — यसले मांसपेशी शिथिल गर्न र रक्त प्रवाह सुधार गर्न मद्दत गर्छ।
    </div>
  </div>
  <button class="btn bp big full" onclick="go('fact')">Next → <span class="np-s">अर्को</span></button>
</div>`; }

function fact() {
  const f = FACTS[Math.floor(Math.random() * FACTS.length)];
  return `
<div class="fact-wrap">
  <div class="fact-badge">💡 Did You Know? <span class="np">के तपाईंलाई थाहा छ?</span></div>
  <div class="card" style="text-align:center;">
    <span class="fact-icon">🦴</span>
    <p class="fact-en">${f.en}</p>
    <p class="fact-np-text">${f.np}</p>
  </div>
  <button class="btn bp big full" onclick="finishSess()">→ Back to Dashboard <span class="np-s">ड्यासबोर्ड</span></button>
</div>`; }

function pain() { return `
<div class="pain-wrap">
  <div>
    <div class="milestone-badge">🎯 5 sessions done! Great work!</div>
    <div class="milestone-np">५ सत्र पूरा भयो!</div>
  </div>
  <div class="card" style="width:100%;">
    <div class="pain-q">How does your elbow feel?</div>
    <div class="pain-q-np">तपाईंको कुहिनोको दुखाइ कस्तो छ?</div>
    ${[{k:'A',en:'As it is',np:'जस्तो छ त्यस्तै'},
       {k:'B',en:'Bit relieved',np:'अलि कम भएको'},
       {k:'C',en:'Much better',np:'धेरै राम्रो भएको'},
       {k:'D',en:'Completely gone',np:'पूरै ठीक भएको'}]
      .map(o => `<button class="popt" onclick="subPain('${o.k}')">
        <div class="plet">${o.k}</div>
        <div class="ptxt">${o.en}<span class="np">${o.np}</span></div>
      </button>`).join('')}
  </div>
</div>`; }

function painresp(d = {}) { return `
<div class="pain-resp-wrap">
  <div class="card" style="text-align:center;">
    <span class="pain-resp-icon">${d.icon || '😊'}</span>
    <p class="pain-resp-en">${d.en}</p>
    <p class="pain-resp-np">${d.np}</p>
  </div>
  <button class="btn bp big full" onclick="go('dashboard')">→ Dashboard <span class="np-s">ड्यासबोर्ड</span></button>
</div>`; }

/* ════════════════════════════════════════
   ACTIONS
════════════════════════════════════════ */
function doLogin() {
  const u = v('lu'), p = v('lp');
  if (!u || !p) { go('login', {err:'Please fill in all fields.'}); return; }
  if (LS.find(u, p)) { LS.setUser(u); go('dashboard'); }
  else go('login', {err:'Wrong username or password.'});
}
function doRegister() {
  const u = v('ru'), p = v('rp'), p2 = v('rp2');
  if (!u || !p || !p2) { go('register', {err:'Please fill in all fields.'}); return; }
  if (p !== p2)         { go('register', {err:'Passwords do not match.'}); return; }
  if (p.length < 4)     { go('register', {err:'Password must be at least 4 characters.'}); return; }
  if (LS.exists(u))     { go('register', {err:'Username already taken.'}); return; }
  LS.add(u, p); go('login', {ok:'Account created! Please login.'});
}
const v = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };

/* timer controls */
function setDur(m)  { TM.dur = m; TM.rem = m * 60; TM.run = false; TM.pau = false; go('timer'); }
function setCust()  { const val = parseInt((document.getElementById('cmin') || {}).value); if (val && val > 0 && val <= 180) setDur(val); }
function startTM()  { if (!TM.dur) return; TM.run = true; TM.pau = false; TM.iv = setInterval(tick, 1000); go('timer'); }
function pauseTM()  { clearInterval(TM.iv); TM.run = false; TM.pau = true; go('timer'); }
function resumeTM() { TM.run = true; TM.pau = false; TM.iv = setInterval(tick, 1000); go('timer'); }
function resetTM()  { killTimer(); go('timer'); }

function tick() {
  if (!TM.run) { clearInterval(TM.iv); return; }
  TM.rem--;
  const el = document.getElementById('ctm');
  if (el) el.textContent = fmt(TM.rem);
  if (TM.rem <= 0) tmDone();
}
function tmDone() {
  clearInterval(TM.iv); TM.run = false;
  if (!LS.user()) return;
  const u = LS.user(), stats = LS.addSess(u, TM.dur);
  buzzer();
  TM = {dur:0, rem:0, iv:null, run:false, pau:false};
  needPain = stats.d % 5 === 0;
  go('rest');
  let t = 60, iv = setInterval(() => {
    t--;
    const el = document.getElementById('rcd');
    if (el) el.textContent = `Rest for ${t}s`;
    if (t <= 0) clearInterval(iv);
  }, 1000);
}
function doneRest() { go('ex-prompt'); }

/* exercises */
function startEx()    { exI = 0; go('ex-player'); runEX(); }
function playAll()    { exI = 0; needPain = false; go('ex-player'); runEX(); }
function playAt(i)    { exI = i; needPain = false; go('ex-player'); runEX(); }

function runEX() {
  clearInterval(exIv);
  const e = EX[exI]; exL = e.s;
  const vid = document.getElementById('ex-vid');
  if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
  /* recalculate dasharray for r=40 ring: 2π×40 ≈ 251 */
  exIv = setInterval(() => {
    exL--;
    const n = document.getElementById('exn'), c = document.getElementById('exc');
    if (n) n.textContent = exL;
    if (c) c.style.strokeDashoffset = 251 - (exL / e.s * 251);
    if (exL <= 0) clearInterval(exIv);
  }, 1000);
}
function showVidPlaceholder(i, filename) {
  const wrap = document.getElementById('vid-wrap-' + i);
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="vid-placeholder">
      <div class="vid-icon">🎬</div>
      <div>Video will appear here</div>
      <div style="font-size:.73rem;opacity:.55;margin-top:.15rem;">Place your video file in the same folder as index.html</div>
      <div class="vid-filename">${filename}</div>
    </div>`;
}
function replayEx() {
  const vid = document.getElementById('ex-vid');
  if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
  runEX();
}
function nextEx() {
  clearInterval(exIv); exI++;
  if (exI >= EX.length) go('ex-therapy');
  else { go('ex-player'); runEX(); }
}
function skipFact()   { go('fact'); }
function finishSess() { if (needPain) { needPain = false; go('pain'); } else go('dashboard'); }

function subPain(a) {
  LS.addPain(LS.user(), a);
  const R = {
    A: {icon:'😔', en:'You may need more rest. Keep doing exercises regularly.',         np:'सायद अझ आराम आवश्यक छ। नियमित व्यायाम जारी राख्नुहोस्।'},
    B: {icon:'🙂', en:'Good progress! Keep up the exercises and rest schedule.',         np:'राम्रो प्रगति! व्यायाम र आरामको तालिका जारी राख्नुहोस्।'},
    C: {icon:'😊', en:'Great improvement! Keep up the healthy work habits.',             np:'धेरै सुधार! राम्रो काम गर्ने बानी कायम राख्नुहोस्।'},
    D: {icon:'🎉', en:'Excellent! Keep safe habits to prevent future injury.',           np:'उत्कृष्ट! भविष्यमा चोट लाग्न नदिन सुरक्षित बानी अपनाउनुहोस्।'},
  };
  go('pain-resp', R[a]);
}

/* user menu */
function toggleMenu(e) {
  e.stopPropagation();
  const pill = document.getElementById('user-pill'), drop = document.getElementById('user-drop');
  const open = drop.classList.contains('show');
  drop.classList.toggle('show', !open);
  pill.classList.toggle('open', !open);
}
document.addEventListener('click', () => {
  const drop = document.getElementById('user-drop'), pill = document.getElementById('user-pill');
  if (drop) { drop.classList.remove('show'); pill && pill.classList.remove('open'); }
});
function doExit()   { killTimer(); go('login'); }
function doLogout() { killTimer(); LS.clearUser(); go('intro'); }

function killTimer() {
  clearInterval(TM.iv); clearInterval(exIv);
  TM = {dur:0, rem:0, iv:null, run:false, pau:false};
  needPain = false;
}

/* audio */
function buzzer() {
  try {
    const audio = new Audio('buzzer.mp3');
    audio.play();
  } catch(e) {}
}

const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

/* ── INIT ── */
(()=>{ const u = LS.user(); if (u) go('dashboard'); else go('intro'); })();
