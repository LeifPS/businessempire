/* Business Empire – Meta: Tagesaufgaben, Login-Bonus, Erfolge, Börsengang (Prestige), Zufallsereignisse */
(function () {
'use strict';
var BE = window.BE, S = function () { return BE.S; };
var M = BE.meta = {};

/* ---------- Tageswechsel ---------- */
function newDay() {
  var s = S(), key = BE.dayKey();
  if (s.day.key === key) return;
  var y = new Date(); y.setDate(y.getDate() - 1);
  s.streak.n = s.streak.last === BE.dayKey(y) ? s.streak.n + 1 : 1;
  s.streak.last = key; s.streak.pending = true;
  s.day = { key: key, clicks: 0, earned: 0, buys: 0, upg: 0, trades: 0, claimed: {} };
}
BE.onLoad.push(function () { newDay(); });
BE.onSecond.push(function () { var k = S().day.key; newDay(); if (S().day.key !== k) BE.refresh(); });

M.loginReward = function () {
  var h = BE.calc().hour, w = BE.worth().total, n = Math.min(S().streak.n, 7);
  return Math.round((300 + h * 0.5 + w * 0.0005) * n);
};
BE.act.claimLogin = function () {
  var r = M.loginReward(); BE.add(r); S().streak.pending = false; BE.closeSheet();
  BE.toast('Tagesbonus: +' + BE.fmt(r)); BE.buzz(20);
};
function showLogin() {
  var n = S().streak.n, r = M.loginReward();
  var days = '';
  for (var i = 1; i <= 7; i++) days += '<div style="flex:1;text-align:center;padding:8px 0;border-radius:12px;font-weight:800;font-size:12px;background:' + (i <= Math.min(n, 7) ? 'linear-gradient(135deg,#ffd76a,#f59e0b)' : 'var(--card2)') + ';color:' + (i <= Math.min(n, 7) ? '#4a3000' : 'var(--mut)') + '">' + i + '</div>';
  BE.sheet('<h4>🎁 Tagesbonus</h4><p>Du bist seit <b>' + n + '</b> ' + (n === 1 ? 'Tag' : 'Tagen') + ' in Folge dabei. Je länger die Serie (bis Tag 7), desto größer der Bonus.</p><div style="display:flex;gap:6px;margin-bottom:16px">' + days + '</div>' +
    '<div class="btns"><button class="btn gold" data-act="claimLogin">Abholen · +' + BE.fmt(r) + '</button></div>');
}

/* ---------- Tagesaufgaben ---------- */
var POOL = [
  { id: 'clicks', text: function (g) { return 'Klicke ' + g + '-mal'; }, goal: function () { return 150; }, get: function (d) { return d.clicks; } },
  { id: 'earn', text: function (g) { return 'Verdiene ' + BE.fmt(g); }, goal: function () { return Math.max(800, Math.round(BE.calc().hour * 0.6 / 100) * 100); }, get: function (d) { return d.earned; } },
  { id: 'buys', text: function (g) { return 'Kaufe ' + g + ' Dinge (Firmen, Immobilien, Gegenstände)'; }, goal: function () { return 2; }, get: function (d) { return d.buys || 0; } },
  { id: 'trades', text: function (g) { return 'Handle ' + g + '× mit Aktien oder Krypto'; }, goal: function () { return 4; }, get: function (d) { return d.trades || 0; } },
  { id: 'upg', text: function (g) { return 'Baue ein Unternehmen aus'; }, goal: function () { return 1; }, get: function (d) { return d.upg || 0; } }
];
M.tasks = function () {
  var r = BE.rng(BE.hash('tasks' + S().day.key)), ids = POOL.map(function (_, i) { return i; }), out = [];
  for (var i = 0; i < 3; i++) out.push(POOL[ids.splice(Math.floor(r() * ids.length), 1)[0]]);
  return out;
};
M.taskReward = function () { return Math.round(Math.max(500, BE.worth().total * 0.002 + BE.calc().hour * 1.5)); };
M.claimable = function () {
  var d = S().day; return M.tasks().filter(function (t) { return !d.claimed[t.id] && t.get(d) >= t.goal(); }).length;
};
BE.act.taskClaim = function (d) {
  var t = POOL.filter(function (x) { return x.id === d.id; })[0], day = S().day;
  if (day.claimed[t.id] || t.get(day) < t.goal()) return false;
  var r = M.taskReward(); day.claimed[t.id] = true; BE.add(r); BE.buzz(16); BE.toast('Aufgabe erledigt: +' + BE.fmt(r));
};
BE.views.tasks = {
  title: 'Tagesaufgaben',
  render: function () {
    var day = S().day, r = M.taskReward();
    var h = '<div class="card"><div class="row"><div><b>Heute</b><div class="lbl">Neue Aufgaben jeden Tag · Serie: <b>' + S().streak.n + ' Tage</b></div></div><span class="pill gold">Belohnung je ' + BE.fmtK(r) + '</span></div></div>';
    M.tasks().forEach(function (t) {
      var g = t.goal(), v = Math.min(g, t.get(day)), done = !!day.claimed[t.id], ok = v >= g;
      h += '<div class="card"><div class="task"><div class="tx"><b>' + t.text(g) + '</b><div class="bar" style="margin:10px 0 6px"><i style="width:' + (v / g * 100) + '%"></i></div>' +
        '<div class="lbl">' + (t.id === 'earn' ? BE.fmtK(v) + ' / ' + BE.fmtK(g) : BE.nf0.format(Math.floor(v)) + ' / ' + BE.nf0.format(g)) + '</div></div>' +
        (done ? '<span class="pill good">✓ Erledigt</span>' : '<button class="btn sm ' + (ok ? 'gold' : 'off') + '" data-act="taskClaim" data-id="' + t.id + '">Abholen</button>') + '</div></div>';
    });
    return h;
  }
};

/* ---------- Erfolge ---------- */
function cnt(o) { return Object.keys(o).length; }
var ACH = [
  ['click1', '👆', 'Erster Klick', 'Verdiene Geld per Klick', function (s) { return s.stats.clicks >= 1; }],
  ['click100', '✋', '100 Klicks', '100-mal geklickt', function (s) { return s.stats.clicks >= 100; }],
  ['click5k', '⚡', 'Klick-Maschine', '5.000-mal geklickt', function (s) { return s.stats.clicks >= 5000; }],
  ['lvl10', '📈', 'Klick-Level 10', 'Erreiche Klick-Level 10', function (s) { return s.level >= 10; }],
  ['firm1', '🏪', 'Unternehmer', 'Gründe dein erstes Unternehmen', function (s) { return s.firms.length >= 1; }],
  ['firm5', '🏢', 'Mittelständler', 'Besitze 5 Unternehmen', function (s) { return s.firms.length >= 5; }],
  ['firm10', '🏛️', 'Konzernchef', 'Besitze 10 Unternehmen', function (s) { return s.firms.length >= 10; }],
  ['fuse', '🤝', 'Fusion', 'Fusioniere zwei Unternehmen', function (s) { return s.stats.fusions >= 1; }],
  ['lvmax', '💎', 'Perfektionist', 'Baue ein Unternehmen auf Level 10 aus', function (s) { return s.firms.some(function (f) { return f.lv >= 10; }); }],
  ['stock1', '📊', 'Börsenneuling', 'Kaufe deine erste Aktie', function (s) { return cnt(s.stocks) >= 1; }],
  ['stock5', '🗂️', 'Diversifiziert', 'Halte 5 verschiedene Aktien', function (s) { return cnt(s.stocks) >= 5; }],
  ['crypto1', '🪙', 'Krypto-Pionier', 'Kaufe deinen ersten Coin', function (s) { return cnt(s.crypto) >= 1; }],
  ['estate1', '🏠', 'Hausbesitzer', 'Kaufe eine Immobilie', function (s) { return s.estates.length >= 1; }],
  ['estate10', '🌆', 'Immobilien-Mogul', 'Besitze 10 Immobilien', function (s) { return s.estates.length >= 10; }],
  ['car1', '🚗', 'Fahrer', 'Kaufe dein erstes Auto', function (s) { return s.garage.length >= 1; }],
  ['car5', '🏁', 'Autosammler', 'Besitze 5 Autos', function (s) { return s.garage.length >= 5; }],
  ['plane1', '✈️', 'Pilot', 'Kaufe ein Flugzeug', function (s) { return s.hangar.length >= 1; }],
  ['yacht1', '⚓', 'Kapitän', 'Kaufe eine Yacht', function (s) { return s.port.length >= 1; }],
  ['island1', '🏝️', 'Inselkönig', 'Kaufe eine Insel', function (s) { return s.islands.length >= 1; }],
  ['col1', '🗿', 'Sammler', 'Ersteigere ein Sammlerstück', function () { return BE.collCount() >= 1; }],
  ['colset', '🏆', 'Kurator', 'Vervollständige eine Sammlung', function () { return BE.collSets() >= 1; }],
  ['w1k', '💶', 'Tausender', 'Vermögen von 1.000 €', function (s, w) { return w >= 1e3; }],
  ['w100k', '💰', 'Sechsstellig', 'Vermögen von 100.000 €', function (s, w) { return w >= 1e5; }],
  ['w1m', '🤑', 'Millionär', 'Vermögen von 1 Mio. €', function (s, w) { return w >= 1e6; }],
  ['w100m', '👑', 'Hundertmillionär', 'Vermögen von 100 Mio. €', function (s, w) { return w >= 1e8; }],
  ['w1b', '🚀', 'Milliardär', 'Vermögen von 1 Mrd. €', function (s, w) { return w >= 1e9; }],
  ['w1t', '🌍', 'Billionär', 'Vermögen von 1 Bio. €', function (s, w) { return w >= 1e12; }],
  ['ipo', '🔔', 'Börsengang', 'Gehe zum ersten Mal an die Börse', function (s) { return s.prestige.count >= 1; }],
  ['streak7', '🔥', 'Treu', '7 Tage in Folge gespielt', function (s) { return s.streak.n >= 7; }]
];
M.ACH = ACH;
var achTick = 0;
BE.onSecond.push(function () {
  var s = S(), w = BE.worth().total, got = [];
  ACH.forEach(function (a) { if (!s.ach[a[0]]) { try { if (a[4](s, w)) { s.ach[a[0]] = Date.now(); got.push(a); } } catch (e) {} } });
  if (got.length) { BE.dirtyCalc(); BE.toast('🏆 Erfolg: ' + got[0][2] + (got.length > 1 ? ' (+' + (got.length - 1) + ')' : '')); BE.buzz(24); }
  BE.badges.profile = M.claimable() > 0 || !!s.streak.pending;
  if (!(++achTick % 3)) BE.renderNav();
});
BE.views.ach = {
  title: 'Erfolge',
  render: function () {
    var s = S(), n = cnt(s.ach);
    return '<div class="card"><div class="row"><div><b style="font-size:20px">' + n + ' von ' + ACH.length + '</b><div class="lbl">Jeder Erfolg gibt dauerhaft <b class="good">+0,5 %</b> auf alle Einnahmen</div></div><span class="pill gold">+' + (n * 0.5).toFixed(1).replace('.', ',') + ' %</span></div>' +
      '<div class="bar" style="margin-top:12px"><i style="width:' + n / ACH.length * 100 + '%"></i></div></div><div class="card" style="padding:6px 14px">' +
      ACH.map(function (a) { var d = !!s.ach[a[0]]; return '<div class="ach ' + (d ? 'done' : '') + '"><div class="ic">' + a[1] + '</div><div><b>' + a[2] + '</b><div class="lbl">' + a[3] + '</div></div></div>'; }).join('') + '</div>';
  }
};

/* ---------- Börsengang (Prestige) ---------- */
var IPO_MIN = 25e6;
M.ipoGain = function () { return Math.floor(Math.cbrt(BE.worth().total / 1e6)); };
BE.views.ipo = {
  title: 'Börsengang',
  render: function () {
    var s = S(), w = BE.worth().total, ok = w >= IPO_MIN, g = M.ipoGain();
    return '<div class="cover" style="min-height:140px;background:linear-gradient(135deg,#7b2cbf,#2563eb)"><h4>🔔 Börsengang</h4><p>Starte neu und werde dauerhaft stärker.</p></div>' +
      '<div class="card"><div class="row"><span class="lbl">Aktuelle Anteilsscheine</span><b>' + s.prestige.pts + ' (+' + s.prestige.pts * 10 + ' % auf alles)</b></div><div class="gap"></div>' +
      '<div class="row"><span class="lbl">Bisherige Börsengänge</span><b>' + s.prestige.count + '</b></div><div class="gap"></div>' +
      '<div class="row"><span class="lbl">Dein Vermögen</span><b>' + BE.fmt(w) + '</b></div><div class="gap"></div>' +
      '<div class="row"><span class="lbl">Neue Anteilsscheine jetzt</span><b class="gold">+' + (ok ? g : 0) + '</b></div></div>' +
      '<div class="card lbl" style="line-height:1.55">Beim Börsengang werden Geld, Unternehmen, Aktien, Krypto, Immobilien und alle Gegenstände zurückgesetzt. Du behältst Erfolge, Tagesbonus-Serie, Namen und deine Anteilsscheine. Jeder Anteilsschein bringt <b class="good">+10 %</b> auf alle Einnahmen, dazu startest du mit etwas mehr Kapital.<br><br>' +
      (ok ? '' : 'Verfügbar ab einem Vermögen von <b>' + BE.fmt(IPO_MIN) + '</b>.') + '</div>' +
      '<button class="btn full ' + (ok ? 'gold' : 'off') + '" data-act="ipoAsk">Jetzt an die Börse gehen</button>';
  }
};
BE.act.ipoAsk = function () {
  var g = M.ipoGain();
  BE.ask('Wirklich an die Börse gehen?', 'Alles wird zurückgesetzt. Du erhältst <b>' + g + ' Anteilsschein' + (g === 1 ? '' : 'e') + '</b> (+' + g * 10 + ' % dauerhaft).', 'Börsengang', function () {
    var pts = g, old = S();
    BE.reset(true);
    var s = S(); s.prestige = { pts: old.prestige.pts + pts, count: old.prestige.count + 1 };
    s.money = 250 + 1000 * s.prestige.pts; s.streak.pending = false; s.nextEvent = Date.now() + 240000;
    BE.stack = []; BE.dirtyCalc(); BE.save(); BE.setTab('earn'); BE.toast('🔔 Börsengang! +' + pts + ' Anteilsscheine');
  }, true);
  return false;
};

/* ---------- Zufallsereignisse ---------- */
function fmtC(x) { return '<b>' + BE.fmt(x) + '</b>'; }
var EVENTS = [
  function () { var h = BE.calc().hour, c = Math.round(Math.min(S().money * 0.05, Math.max(500, h * 2)));
    return { icon: '🧾', title: 'Steuerprüfung', text: 'Das Finanzamt steht vor der Tür. Fällig sind ' + fmtC(c) + '. Mit einem Anwalt (kostet ' + fmtC(c * 0.2) + ') gewinnst du mit 60 % Chance und zahlst nichts.',
      choices: [{ l: 'Zahlen', f: function () { BE.spend(Math.min(c, S().money)); BE.toast('Gezahlt: −' + BE.fmt(c)); } },
        { l: 'Anwalt', f: function () { BE.spend(Math.min(c * 0.2, S().money)); if (Math.random() < 0.6) BE.toast('Gewonnen! Keine Strafe.'); else { BE.spend(Math.min(c, S().money)); BE.toast('Verloren: −' + BE.fmt(c * 1.2), true); } } }] }; },
  function () { var x = Math.round(Math.max(1000, BE.calc().hour * 3));
    return { icon: '💌', title: 'Erbschaft', text: 'Eine entfernte Tante hinterlässt dir ' + fmtC(x) + '.', choices: [{ l: 'Annehmen', f: function () { BE.add(x); BE.toast('+' + BE.fmt(x)); } }] }; },
  function () { return { icon: '📱', title: 'Viraler Hit', text: 'Dein Unternehmen geht viral! 2 Minuten lang bringen Klicks das <b>Dreifache</b>.', choices: [{ l: 'Los!', f: function () { S().mods.push({ type: 'click', mult: 3, until: Date.now() + 120000 }); } }] }; },
  function () { return { icon: '🤝', title: 'Investorenbesuch', text: 'Ein Investor ist beeindruckt: <b>+40 %</b> Unternehmenseinnahmen für 20 Minuten.', choices: [{ l: 'Gerne', f: function () { S().mods.push({ type: 'firm', mult: 1.4, until: Date.now() + 1200000 }); BE.dirtyCalc(); } }] }; },
  function () { var c = Math.round(Math.min(S().money, Math.max(800, BE.calc().hour * 1.2)));
    return { icon: '🚰', title: 'Rohrbruch', text: 'Ein Rohr ist geplatzt. Reparatur kostet ' + fmtC(c) + '. Wenn du wartest, sinken die Unternehmenseinnahmen 10 Minuten lang um 30 %.',
      choices: [{ l: 'Reparieren', f: function () { BE.spend(c); BE.toast('−' + BE.fmt(c)); } }, { l: 'Warten', f: function () { S().mods.push({ type: 'firm', mult: 0.7, until: Date.now() + 600000 }); BE.dirtyCalc(); } }] }; },
  function () { var b = Math.floor(S().money * 0.1);
    return { icon: '🎲', title: 'Glückswette', text: 'Ein Fremder bietet dir eine Wette an: Setze ' + fmtC(b) + ' (10 % deines Bargelds). Mit 50 % Chance bekommst du das Doppelte, sonst ist es weg.',
      choices: [{ l: 'Wagen', f: function () { if (Math.random() < 0.5) { BE.add(b); BE.toast('Gewonnen! +' + BE.fmt(b)); } else { BE.spend(b); BE.toast('Verloren: −' + BE.fmt(b), true); } } }, { l: 'Lieber nicht', f: function () {} }] }; },
  function () { var x = Math.round(Math.max(500, BE.calc().hour * 0.8));
    return { icon: '🎟️', title: 'Rubbellos', text: 'Du hast ein Rubbellos gefunden – und es ist ein Gewinn: ' + fmtC(x) + '!', choices: [{ l: 'Einlösen', f: function () { BE.add(x); BE.toast('+' + BE.fmt(x)); } }] }; },
  function () { var c = Math.round(Math.max(300, BE.calc().hour * 0.5));
    return { icon: '🪧', title: 'Streik', text: 'Deine Mitarbeiter streiken. Mit ' + fmtC(c) + ' Prämie ist der Frieden gerettet, sonst sinken die Unternehmenseinnahmen 10 Minuten um 30 %.',
      choices: [{ l: 'Prämie zahlen', f: function () { BE.spend(Math.min(c, S().money)); } }, { l: 'Aussitzen', f: function () { S().mods.push({ type: 'firm', mult: 0.7, until: Date.now() + 600000 }); BE.dirtyCalc(); } }] }; }
];
BE.act.evChoice = function (d) {
  var ev = BE.ui.ev; BE.closeSheet(); BE.ui.ev = null;
  if (ev && ev.choices[+d.i]) ev.choices[+d.i].f();
  S().nextEvent = Date.now() + (6 + Math.random() * 6) * 60000; BE.dirtyCalc();
};
function maybeEvent() {
  var s = S(), now = Date.now();
  if (!s.nextEvent) { s.nextEvent = now + 180000; return; }
  if (now < s.nextEvent || BE.ui.ev || BE.stack.length || BE.$('sheetWrap').classList.contains('on') || document.hidden) return;
  if (BE.worth().total < 2000) { s.nextEvent = now + 120000; return; }
  var ev = EVENTS[Math.floor(Math.random() * EVENTS.length)]();
  BE.ui.ev = ev;
  BE.sheet('<h4>' + ev.icon + ' ' + ev.title + '</h4><p>' + ev.text + '</p><div class="btns">' + ev.choices.map(function (c, i) { return '<button class="btn ' + (i ? 'ghost' : '') + '" data-act="evChoice" data-i="' + i + '">' + c.l + '</button>'; }).join('') + '</div>');
  BE.buzz(30);
}
BE.onSecond.push(function () {
  maybeEvent();
  var s = S();
  if (s.streak.pending && !BE.ui.loginShown && !BE.$('sheetWrap').classList.contains('on') && !BE.ui.ev && Date.now() - BE.touch >= 0 && BE.ui.ready) { BE.ui.loginShown = true; showLogin(); }
});
BE.onLoad.push(function () { setTimeout(function () { BE.ui.ready = true; }, 800); });
})();
