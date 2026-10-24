/* Business Empire – Haupt-Tabs: Einnahmen, Investments, Profil + Start */
(function () {
'use strict';
var BE = window.BE, S = function () { return BE.S; };

/* ================= Einnahmen ================= */
BE.tabs.earn = {
  title: 'Einnahmen', sub: 'Jeder Klick zählt',
  render: function () {
    return '<div class="wallet"><div class="lbl">Guthaben</div><div class="num" id="money">0 €</div><div class="meta"><span class="pill" id="perClick"></span><span class="pill good" id="perHour"></span></div></div>' +
      '<div class="card"><div class="row"><div><b id="lvl">Level 1</b><div class="lbl" id="nextGain"></div></div><button class="btn" id="upBtn" data-act="clickUp">Upgrade</button></div><div class="bar" style="margin-top:12px"><i id="upBar"></i></div></div>' +
      '<div class="card tight"><div class="row"><div><b>⚡ Turbo</b><div class="lbl">10× pro Klick für 30 Sek.</div></div><button class="btn sm gold" id="turboBtn" data-act="turbo">Starten</button></div></div>' +
      '<div id="tapzone"><div id="coin">€</div><div class="hint">Tippe in diesen Bereich, um Geld zu verdienen</div></div>';
  },
  mount: function () {
    BE.$('tapzone').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var v = BE.perClick(); BE.add(v); BE.S.clicks++; BE.stat('clicks'); BE.buzz(5);
      var r = this.getBoundingClientRect(), f = document.createElement('div');
      f.className = 'float'; f.textContent = '+' + BE.fmt2(v).replace(/\s/g, '');
      f.style.left = Math.max(4, Math.min(r.width - 80, e.clientX - r.left - 28)) + 'px'; f.style.top = (e.clientY - r.top - 22) + 'px';
      this.appendChild(f); setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 900);
      BE.tabs.earn.tick();
    });
  },
  update: function () { BE.tabs.earn.tick(true); },
  tick: function (full) {
    var s = S(), c = BE.upCost(), now = Date.now(), el;
    if ((el = BE.$('money'))) el.textContent = BE.fmt2(s.money);
    if (!BE.$('upBtn')) return;
    BE.$('upBar').style.width = Math.min(100, s.money / c * 100) + '%';
    BE.$('upBtn').disabled = s.money < c; BE.$('upBtn').textContent = BE.fmt(c);
    var tz = BE.$('tapzone'), tb = BE.$('turboBtn');
    tz.classList.toggle('turbo', s.turboUntil > now);
    if (s.turboUntil > now) { tb.textContent = Math.ceil((s.turboUntil - now) / 1000) + ' s'; tb.disabled = true; }
    else if (s.turboReady > now) { tb.textContent = BE.dur(s.turboReady - now); tb.disabled = true; }
    else { tb.textContent = 'Starten'; tb.disabled = false; }
    if (full || !BE._earnT || now - BE._earnT > 1000) {
      BE._earnT = now;
      BE.$('perClick').textContent = BE.fmt2(BE.perClick()) + ' pro Klick';
      BE.$('perHour').textContent = BE.fmt(BE.calc().hour) + ' / Std.';
      BE.$('lvl').textContent = 'Level ' + s.level;
      var nxt = Math.pow(1.22, s.level) * BE.global() * BE.mod('click');
      BE.$('nextGain').textContent = 'Nächstes Level: ' + BE.fmt2(nxt) + ' pro Klick';
    }
  }
};
BE.act.clickUp = function () {
  var c = BE.upCost();
  if (!BE.spend(c)) return false;
  BE.S.level++; BE.buzz(12); BE.dirtyCalc(); BE.tabs.earn.tick(true); BE.save(); return false;
};
BE.act.turbo = function () {
  var s = S(), now = Date.now(); if (s.turboReady > now) return false;
  s.turboUntil = now + 30000; s.turboReady = now + 5 * 60000; BE.buzz(20); BE.toast('⚡ Turbo! 10× pro Klick für 30 Sekunden'); BE.tabs.earn.tick(true); BE.save(); return false;
};

/* ================= Investments ================= */
BE.ui.invTab = 'aktien';
BE.act.invTab = function (d) { BE.ui.invTab = d.k; };
BE.tabs.invest = {
  title: 'Investments', sub: 'Aktien, Immobilien und Krypto',
  render: function () {
    var k = BE.ui.invTab;
    return '<div class="subtabs">' + [['aktien', 'Aktien'], ['immo', 'Immobilien'], ['krypto', 'Krypto']].map(function (t) {
      return '<button class="' + (t[0] === k ? 'on' : '') + '" data-act="invTab" data-k="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' + BE.invest[k]();
  }
};

/* ================= Profil ================= */
var CATS = [['cash', 'Guthaben', '--c-cash'], ['firm', 'Unternehmen', '--c-firm'], ['stock', 'Aktien', '--c-stock'], ['real', 'Immobilien', '--c-real'],
  ['trans', 'Transport', '--c-trans'], ['coll', 'Sammlungen', '--c-coll'], ['crypto', 'Krypto-Anlagen', '--c-crypto'], ['res', 'Residenz', '--c-res']];
function menuRow(icon, label, sub, act, v, badge) {
  return '<div class="li tappable" data-act="' + act + '"' + (v ? ' data-v="' + v + '"' : '') + '><div class="ico" style="width:44px;height:44px;border-radius:14px;background:var(--card2);font-size:21px">' + icon + '</div>' +
    '<div class="info"><div class="nm">' + label + '</div><div class="lbl">' + sub + '</div></div>' + (badge ? '<span class="pill bad">' + badge + '</span>' : '') + '<span class="lbl" style="font-size:20px">›</span></div>';
}
BE.act.claimLoginBtn = function () { var r = BE.meta.loginReward(); BE.add(r); S().streak.pending = false; BE.toast('Tagesbonus: +' + BE.fmt(r)); BE.buzz(20); };
BE.act.resetAsk = function () {
  BE.ask('Spielstand löschen?', 'Alles wird unwiderruflich gelöscht – auch Erfolge und Anteilsscheine.', 'Löschen', function () {
    BE.reset(false); BE.stack = []; BE.setTab('earn'); BE.toast('Neustart!');
  }, true);
  return false;
};
BE.tabs.profile = {
  title: 'Profil', sub: '',
  render: function () {
    var w = BE.worth(), s = S(), claim = BE.meta.claimable(), n = Object.keys(s.ach).length;
    var st = '', ct = '';
    CATS.forEach(function (c) {
      var v = w.cats[c[0]] || 0;
      if (v > 0 && w.total > 0) st += '<i style="width:' + (v / w.total * 100) + '%;background:var(' + c[2] + ')"></i>';
      ct += '<div class="cat" style="--c:var(' + c[2] + ')"><div class="lbl">' + c[1] + '</div><div class="v">' + BE.fmt(v) + '</div></div>';
    });
    var h = '<div class="card"><div class="row"><div class="lbl">Vermögen</div>' + (s.player.name ? '<span class="pill acc">' + BE.esc(s.player.name) + '</span>' : '<button class="btn sm ghost" data-act="setName">Namen wählen</button>') + '</div>' +
      '<div class="big" style="margin-top:2px">' + BE.fmt(w.total) + '</div><div class="stack">' + st + '</div><div class="cats">' + ct + '</div></div>';
    if (s.streak.pending) h += '<button class="btn gold full" data-act="claimLoginBtn" style="margin-bottom:12px">🎁 Tagesbonus abholen · +' + BE.fmt(BE.meta.loginReward()) + '</button>';
    h += '<div class="card" style="padding:4px 14px">' +
      menuRow('🏆', 'Rangliste', 'Die reichsten Spieler der Welt', 'open', 'ranking') +
      menuRow('📋', 'Tagesaufgaben', 'Serie: ' + s.streak.n + ' Tage', 'open', 'tasks', claim ? claim + ' bereit' : '') +
      menuRow('🎖️', 'Erfolge', n + ' von ' + BE.meta.ACH.length + ' · +' + (n * 0.5).toFixed(1).replace('.', ',') + ' % Einnahmen', 'open', 'ach') +
      menuRow('🔔', 'Börsengang', s.prestige.pts + ' Anteilsscheine · +' + s.prestige.pts * 10 + ' %', 'open', 'ipo', w.total >= 25e6 ? 'bereit' : '') +
      '</div>';
    h += '<div class="card" style="font-size:13px;line-height:1.7"><b>Einkommen</b><br>Pro Stunde gesamt: <b class="good">' + BE.fmt(BE.calc().hour) + '</b><br>Bonus auf alles: <b class="good">+' + ((BE.global() - 1) * 100).toFixed(1).replace('.', ',') + ' %</b> (Erfolge, Sammlungen, Börsengänge)<br>Offline-Verdienst: bis zu 8 Stunden</div>';
    h += '<button class="btn ghost full" data-act="resetAsk">Spielstand zurücksetzen</button>';
    return h;
  }
};

/* ---------- Start ---------- */
BE.start();
})();
