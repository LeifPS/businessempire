/* Business Empire – Kern: Zustand, Formatierung, Navigation, Tick-Schleife */
(function () {
'use strict';
var BE = window.BE = {
  parts: [],      // Vermögens-/Einkommensbausteine der Module
  views: {},      // Unterseiten
  tabs: {},       // Haupt-Tabs
  act: {},        // Klick-Aktionen (data-act)
  onSecond: [],   // Haken: jede Sekunde
  onLoad: [],     // Haken: nach dem Laden
  ui: {},         // flüchtiger UI-Zustand
  skew: 0         // Zeitversatz zum Server (ms)
};
var KEY = 'businessEmpire.v2';

/* ---------- kleine Helfer ---------- */
BE.$ = function (id) { return document.getElementById(id); };
BE.esc = function (s) {
  return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; });
};
BE.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
BE.now = function () { return Date.now() + BE.skew; };
BE.rid = function () { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10); };

var nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
var nf1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
var nf2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
BE.nf0 = nf0; BE.nf2 = nf2;

/* ganze Euro: 23.000.000 € (ab 1 Billion kompakt) */
BE.fmt = function (n) {
  if (!isFinite(n)) return '∞ €';
  var neg = n < 0 ? '-' : ''; n = Math.abs(n);
  if (n >= 1e15) return neg + nf2.format(n / 1e15) + ' Brd. €';
  if (n >= 1e12) return neg + nf2.format(n / 1e12) + ' Bio. €';
  return neg + nf0.format(Math.floor(n + 1e-9)) + ' €';
};
/* mit Cent (bis 10 Mio.) */
BE.fmt2 = function (n) { return n < 1e7 ? nf2.format(n) + ' €' : BE.fmt(n); };
/* kompakt für enge Stellen */
BE.fmtK = function (n) {
  var neg = n < 0 ? '-' : ''; n = Math.abs(n);
  if (n >= 1e12) return neg + nf1.format(n / 1e12) + ' Bio. €';
  if (n >= 1e9) return neg + nf1.format(n / 1e9) + ' Mrd. €';
  if (n >= 1e6) return neg + nf1.format(n / 1e6) + ' Mio. €';
  if (n >= 1e4) return neg + nf1.format(n / 1e3) + ' Tsd. €';
  return neg + nf0.format(Math.round(n)) + ' €';
};
/* Kurspreise mit passender Nachkommastelle */
BE.fmtP = function (n) {
  var d = n >= 1 ? 2 : n >= 0.1 ? 3 : n >= 0.01 ? 4 : 5;
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: d }).format(n) + ' €';
};
BE.pct = function (n, plus) { return (n > 0 && plus !== false ? '+' : '') + nf2.format(n) + ' %'; };
BE.dur = function (ms) {
  var s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60;
  if (h) return h + ' Std. ' + (m < 10 ? '0' : '') + m + ' Min.';
  return m + ':' + (r < 10 ? '0' : '') + r + ' Min.';
};
BE.dayKey = function (d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };

/* ---------- Zufall (deterministisch) ---------- */
BE.hash = function (str) {
  var h = 2166136261 >>> 0;
  for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 16;
  return h >>> 0;
};
BE.rng = function (seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* ---------- Spielstand ---------- */
function freshState() {
  return {
    v: 2, money: 250, level: 1, clicks: 0, earnedTotal: 0,
    firms: [], stocks: {}, crypto: {}, estates: [],
    garage: [], hangar: [], port: [], islands: [], col: {},
    boostUntil: 0, turboUntil: 0, turboReady: 0, mods: [],
    day: { key: '', clicks: 0, earned: 0, buys: 0, upg: 0, trades: 0, claimed: {} },
    stats: { clicks: 0, fusions: 0, trades: 0 },
    streak: { n: 0, last: '' }, ach: {}, prestige: { pts: 0, count: 0 },
    player: { id: BE.rid(), token: BE.rid() + BE.rid(), name: '' },
    nextEvent: 0, last: Date.now(), created: Date.now()
  };
}
BE.fresh = freshState;
function load() {
  var s = freshState();
  try {
    var raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && typeof raw.money === 'number') {
      for (var k in raw) s[k] = raw[k];
      ['day', 'stats', 'streak', 'prestige', 'player'].forEach(function (k) {
        s[k] = Object.assign({}, freshState()[k], raw[k]);
      });
    }
  } catch (e) {}
  return s;
}
BE.S = load();
BE.save = function () {
  BE.S.last = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(BE.S)); } catch (e) {}
};
BE.reset = function (keepMeta) {
  var old = BE.S, s = freshState();
  s.player = old.player;
  if (keepMeta) { s.ach = old.ach; s.prestige = old.prestige; s.streak = old.streak; s.stats = old.stats; }
  BE.S = s; BE.dirtyCalc(); BE.save();
};

/* ---------- Geld & Statistik ---------- */
BE.add = function (x) {
  var S = BE.S; S.money += x; S.earnedTotal += x; S.day.earned += x;
};
BE.spend = function (x) {
  if (BE.S.money + 1e-9 < x) return false;
  BE.S.money -= x; if (BE.S.money < 0) BE.S.money = 0; return true;
};
BE.stat = function (key, n) {
  n = n || 1; var S = BE.S;
  S.day[key] = (S.day[key] || 0) + n;
  S.stats[key] = (S.stats[key] || 0) + n;
};

/* ---------- Einkommen & Vermögen ---------- */
var calcCache = null, calcAt = 0;
BE.dirtyCalc = function () { calcCache = null; };
BE.mod = function (type) {
  var t = Date.now(), m = 1;
  BE.S.mods.forEach(function (x) { if (x.until > t && x.type === type) m *= x.mult; });
  return m;
};
BE.global = function () {
  var S = BE.S, g = 1 + 0.1 * S.prestige.pts;
  g *= 1 + 0.005 * Object.keys(S.ach).length;
  if (BE.collMult) g *= BE.collMult();
  return g * BE.mod('all');
};
BE.calc = function () {
  var t = Date.now();
  if (calcCache && t - calcAt < 1000) return calcCache;
  var now = BE.now(), r = { parts: {}, base: 0 };
  BE.parts.forEach(function (p) {
    var h = p.hour ? p.hour(now) : 0;
    r.parts[p.id] = h; r.base += h;
  });
  r.g = BE.global();
  r.hour = r.base * r.g;
  calcCache = r; calcAt = t;
  return r;
};
BE.worth = function () {
  var now = BE.now(), cats = { cash: BE.S.money };
  BE.parts.forEach(function (p) { if (p.worth) cats[p.cat] = (cats[p.cat] || 0) + p.worth(now); });
  var total = 0; for (var k in cats) total += cats[k];
  return { total: total, cats: cats };
};
BE.perClick = function () {
  var S = BE.S, t = Date.now();
  var m = Math.pow(1.22, S.level - 1) * BE.global() * BE.mod('click');
  if (S.turboUntil > t) m *= 10;
  return m;
};
BE.upCost = function () { return Math.round(50 * Math.pow(1.6, BE.S.level - 1)); };

/* ---------- Toast & Sheet ---------- */
var toastTimer;
BE.toast = function (msg, bad) {
  var t = BE.$('toast'); t.textContent = msg; t.className = (bad ? 'bad ' : '') + 'on';
  clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2600);
};
BE.buzz = function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 6); } catch (e) {} };
var yesCb = null;
BE.sheet = function (html) {
  BE.$('sheet').innerHTML = html; BE.$('sheetWrap').classList.add('on');
  BE.$('sheet').scrollTop = 0;
};
BE.closeSheet = function () { BE.$('sheetWrap').classList.remove('on'); yesCb = null; };
BE.ask = function (title, text, yes, cb, danger) {
  yesCb = cb;
  BE.sheet('<h4>' + title + '</h4><p>' + text + '</p><div class="btns"><button class="btn ghost" data-act="closeSheet">Abbrechen</button>' +
    '<button class="btn ' + (danger ? 'bad' : '') + '" data-act="yes">' + yes + '</button></div>');
};
BE.info = function (title, text, btn) {
  BE.sheet('<h4>' + title + '</h4><p>' + text + '</p><div class="btns"><button class="btn" data-act="closeSheet">' + (btn || 'OK') + '</button></div>');
};
BE.askText = function (title, text, value, cb) {
  yesCb = function () { var v = BE.$('askInput').value; cb(v); };
  BE.sheet('<h4>' + title + '</h4><p>' + text + '</p><input id="askInput" maxlength="16" value="' + BE.esc(value || '') + '" autocomplete="off">' +
    '<div class="btns"><button class="btn ghost" data-act="closeSheet">Abbrechen</button><button class="btn" data-act="yes">Speichern</button></div>');
};
BE.act.closeSheet = function () { BE.closeSheet(); return false; };
BE.act.yes = function () { var cb = yesCb; BE.closeSheet(); if (cb) cb(); };
BE.$('sheetBg').addEventListener('click', BE.closeSheet);

/* ---------- Navigation ---------- */
var NAV = [
  ['invest', 'Investments', '<path d="M3 20h18M6 16v-4M11 16V8M16 16v-7M21 5l-5 4-5-3-5 4"/>'],
  ['firm', 'Unternehmen', '<path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M9 11h.01M15 11h.01"/>'],
  ['earn', 'Einnahmen', '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-1.9-.4-2.5-1.2M12 6.5V8m0 8v1.5"/>'],
  ['items', 'Gegenstände', '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>'],
  ['profile', 'Profil', '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>']
];
BE.badges = {};
function renderNav() {
  BE.$('nav').innerHTML = NAV.map(function (n) {
    return '<button data-act="tab" data-t="' + n[0] + '" class="' + (BE.tab === n[0] ? 'on' : '') + '"><svg viewBox="0 0 24 24">' + n[2] + '</svg>' + n[1] +
      (BE.badges[n[0]] ? '<span class="dot"></span>' : '') + '</button>';
  }).join('');
}
BE.tab = 'earn';
BE.stack = [];
var mounted = '';

BE.setTab = function (name) {
  if (BE.stack.length) { BE.stack = []; try { history.go(-(history.state && history.state.d || 0)); } catch (e) {} renderPages(); }
  BE.tab = name; mounted = ''; renderTab(true); renderNav();
};
function renderTab(anim) {
  var tab = BE.tabs[BE.tab]; if (!tab) return;
  BE.$('title').textContent = tab.title; BE.$('subtitle').textContent = tab.sub || '';
  var main = BE.$('main');
  if (mounted === BE.tab && tab.update) { tab.update(); return; }
  var sc = mounted === BE.tab ? main.scrollTop : 0;
  main.innerHTML = '<div class="' + (anim ? 'fade' : '') + '">' + tab.render() + '</div>';
  main.scrollTop = sc; mounted = BE.tab;
  if (tab.mount) tab.mount();
  if (tab.update) tab.update();
}
BE.open = function (name, arg) {
  BE.stack.push({ name: name, arg: arg });
  try { history.pushState({ d: BE.stack.length }, ''); } catch (e) {}
  renderPages(true);
};
BE.back = function () {
  if (!BE.stack.length) return;
  try { history.back(); } catch (e) { BE.stack.pop(); renderPages(); }
};
BE.replacePage = function (name, arg) { BE.stack[BE.stack.length - 1] = { name: name, arg: arg }; renderPages(true); };
window.addEventListener('popstate', function (e) {
  var d = (e.state && e.state.d) || 0;
  var changed = false;
  while (BE.stack.length > d) { BE.stack.pop(); changed = true; }
  if (changed) renderPages();
});
var BACK = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
function renderPages(anim) {
  var box = BE.$('pages');
  if (!BE.stack.length) { box.innerHTML = ''; renderTab(); return; }
  var top = BE.stack[BE.stack.length - 1], v = BE.views[top.name];
  if (!v) { BE.stack.pop(); return; }
  var existing = box.querySelector('.page'), body = existing && existing.querySelector('.pbody');
  var html = v.render(top.arg);
  var title = typeof v.title === 'function' ? v.title(top.arg) : v.title;
  var sub = v.noMoney ? (v.sub ? v.sub(top.arg) : '') : 'Guthaben: <b id="pgMoney">' + BE.fmt2(BE.S.money) + '</b>';
  if (existing && !anim && existing.dataset.v === top.name) {
    var sc = body.scrollTop; body.innerHTML = html; body.scrollTop = sc;
    existing.querySelector('h2').textContent = title;
    return;
  }
  box.innerHTML = '<div class="page" data-v="' + top.name + '" style="' + (anim ? '' : 'animation:none') + '"><div class="phdr"><button class="back" data-act="back">' + BACK + '</button>' +
    '<div class="pt"><h2>' + title + '</h2><div class="sub">' + sub + '</div></div>' + (v.action ? v.action(top.arg) : '') + '</div><div class="pbody">' + html + '</div></div>';
  if (v.mount) v.mount(top.arg);
}
BE.refresh = function () {
  if (BE.stack.length) renderPages(); else renderTab();
  updateHud();
};
function updateHud() {
  var m = BE.S.money, txt = BE.fmt2(m);
  BE.$('hud').textContent = txt;
  var pg = BE.$('pgMoney'); if (pg) pg.textContent = txt;
}
BE.updateHud = updateHud;
BE.act.back = function () { BE.back(); return false; };
BE.act.tab = function (d) { BE.setTab(d.t); return false; };

/* ---------- Klick-Verteilung ---------- */
BE.touch = 0;
document.addEventListener('pointerdown', function () { BE.touch = Date.now(); }, true);
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]'); if (!el) return;
  var fn = BE.act[el.dataset.act]; if (!fn) return;
  BE.touch = Date.now();
  var r = fn(el.dataset, el, e);
  if (r !== false) { BE.dirtyCalc(); BE.refresh(); BE.save(); }
});

/* ---------- Spielschleife ---------- */
var lastTick = Date.now(), lastSec = 0, lastSave = Date.now();
function offlineGain(secs) {
  var cap = 8 * 3600; secs = Math.min(secs, cap);
  var gain = BE.calc().hour / 3600 * secs;
  if (gain >= 1) { BE.add(gain); return gain; }
  return 0;
}
function tick() {
  var now = Date.now(), dt = (now - lastTick) / 1000; lastTick = now;
  if (dt > 3) {
    var g = offlineGain(dt);
    if (g > 0 && dt > 60) BE.toast('Während du weg warst: +' + BE.fmt(g));
  } else {
    var h = BE.calc().hour;
    if (h > 0) BE.add(h / 3600 * dt);
  }
  updateHud();
  var tab = BE.tabs[BE.tab];
  if (!BE.stack.length && tab && tab.tick) tab.tick();
  if (now - lastSec >= 1000) {
    lastSec = now;
    BE.S.mods = BE.S.mods.filter(function (m) { return m.until > now; });
    BE.onSecond.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }
  if (now - lastSave > 5000) { lastSave = now; BE.save(); }
}
BE.start = function () {
  var S = BE.S;
  var secs = (Date.now() - (S.last || Date.now())) / 1000;
  lastTick = Date.now() - Math.max(0, secs) * 1000;
  BE.onLoad.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  try { history.replaceState({ d: 0 }, ''); } catch (e) {}
  renderNav(); renderTab(true); updateHud();
  setInterval(tick, 250);
  /* sanfte Auto-Aktualisierung der Listen, nie mitten in einer Berührung */
  setInterval(function () {
    if (Date.now() - BE.touch < 1600 || BE.tab === 'earn' && !BE.stack.length) return;
    if ($sheetOpen()) return;
    BE.refresh();
  }, 4000);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) BE.save(); else { tick(); BE.refresh(); }
  });
  window.addEventListener('pagehide', BE.save);
  tick();
};
function $sheetOpen() { return BE.$('sheetWrap').classList.contains('on'); }
BE.renderNav = renderNav;
})();
