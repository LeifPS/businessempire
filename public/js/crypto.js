/* Business Empire – Kryptobörse (erfundene Coins, Hype & Crash per Seed) */
(function () {
'use strict';
var BE = window.BE, S = function () { return BE.S; };
var FEE = 0.01;
var LIST = [
  { id: 'BTM', name: 'Bitmünz', base: 31200, vol: .55, beta: 1.05, supply: 19.5e6, c1: '#ffb347', c2: '#e8730c', sym: 'B' },
  { id: 'ETN', name: 'Etherion', base: 3840, vol: .75, beta: 1.25, supply: 120e6, c1: '#8aa4ff', c2: '#4f5fd6', sym: 'E' },
  { id: 'KRX', name: 'Kardanix', base: 0.61, vol: 1.0, beta: 1.30, supply: 36e9, c1: '#4f8cff', c2: '#1d4fb8', sym: 'K' },
  { id: 'RPL', name: 'Ripplo', base: 0.52, vol: .9, beta: 1.15, supply: 45e9, c1: '#3a3f55', c2: '#0e1220', sym: 'R' },
  { id: 'SLN', name: 'Solanis', base: 148, vol: 1.1, beta: 1.40, supply: 430e6, c1: '#19fb9b', c2: '#9945ff', sym: 'S' },
  { id: 'PKR', name: 'Polkaro', base: 7.9, vol: 1.0, beta: 1.30, supply: 1.2e9, c1: '#ff4fa3', c2: '#c4156f', sym: 'P' },
  { id: 'DGC', name: 'Dogecat', base: 0.082, vol: 1.6, beta: 1.50, supply: 140e9, c1: '#f0cf5a', c2: '#b8941d', sym: 'D' },
  { id: 'LVN', name: 'Lavina', base: 36.2, vol: 1.1, beta: 1.35, supply: 410e6, c1: '#ff6b6b', c2: '#c92a4a', sym: 'L' },
  { id: 'LCR', name: 'Litecore', base: 84.5, vol: .8, beta: 1.10, supply: 74e6, c1: '#7fa3dc', c2: '#345a9a', sym: 'C' },
  { id: 'MNB', name: 'Moonbit', base: 0.0042, vol: 2.2, beta: 1.70, supply: 900e9, c1: '#c9a6ff', c2: '#6a3fd1', sym: 'M' }
];
LIST.forEach(function (a) { a.kind = 'crypto'; a.vol *= 0.55; a.beta *= 0.8; }); // Schwankung feinjustiert
BE.market.register(LIST);
var BY = {}; LIST.forEach(function (a) { BY[a.id] = a; });
var C = BE.crypto = { LIST: LIST, BY: BY };
var qf = new Intl.NumberFormat('de-DE', { maximumSignificantDigits: 5 });

C.price = function (a, t) { return BE.market.price(a, t || BE.now()); };
C.pos = function (id) { return S().crypto[id] || { q: 0, cost: 0 }; };
C.value = function (now) {
  now = now || BE.now(); var v = 0;
  for (var id in S().crypto) v += S().crypto[id].q * C.price(BY[id], now);
  return v;
};
C.cost = function () { var c = 0; for (var id in S().crypto) c += S().crypto[id].cost; return c; };
BE.parts.push({ id: 'crypto', cat: 'crypto', worth: function (n) { return C.value(n); } });

function logo(a) { return '<div class="ico round">' + BE.art.coinLogo(a.sym, a.c1, a.c2) + '</div>'; }
function chg(a, span) { return BE.market.change(a, BE.now(), span || 86400000); }
function arrow(c) { return '<div class="' + (c.pct >= 0 ? 'good' : 'bad') + '" style="font-size:13px;font-weight:800">' + (c.pct >= 0 ? '▲' : '▼') + ' ' + BE.nf2.format(Math.abs(c.pct)) + ' %</div>'; }
function row(a) {
  var c = chg(a), p = C.pos(a.id);
  return '<div class="li tappable" data-act="open" data-v="coin" data-arg="' + a.id + '">' + logo(a) +
    '<div class="info"><div class="nm">' + a.name + '</div><div class="lbl">' + (p.q ? '<b class="gold">' + qf.format(p.q) + ' ' + a.id + '</b>' : 'Verfügbar') + '</div></div>' +
    BE.market.spark(BE.market.series(a, BE.now(), 86400000, 24), 84, 34, c.pct >= 0) +
    '<div class="rt"><div class="v">' + BE.fmtP(C.price(a)) + '</div>' + arrow(c) + '</div></div>';
}

BE.act.coinBuy = function (d) {
  var a = BY[d.id], amt = d.amt === 'max' ? S().money : +d.amt;
  if (amt > S().money) amt = S().money;
  if (amt < 1) { BE.toast('Nicht genug Geld', true); return false; }
  BE.spend(amt);
  var q = amt * (1 - FEE) / C.price(a), pos = S().crypto[a.id] = S().crypto[a.id] || { q: 0, cost: 0 };
  pos.q += q; pos.cost += amt; BE.stat('trades'); BE.buzz(8);
  BE.toast(qf.format(q) + ' ' + a.id + ' gekauft');
};
BE.act.coinSell = function (d) {
  var a = BY[d.id], pos = C.pos(a.id); if (pos.q <= 0) return false;
  var share = +d.pct / 100, q = pos.q * share, got = q * C.price(a) * (1 - FEE);
  BE.add(got); pos.cost -= pos.cost * share; pos.q -= q;
  if (share >= 0.999 || pos.q * C.price(a) < 0.01) delete S().crypto[a.id];
  BE.stat('trades'); BE.buzz(8); BE.toast('Verkauft · +' + BE.fmt2(got));
};
BE.act.coinRange = function (d) { BE.ui.crange = d.r; };
BE.act.coinSort = function (d) { BE.ui.coinSort = d.k; };

var SORTS = {
  hot: ['Heiß', function (a, b) { return Math.abs(chg(b).pct) - Math.abs(chg(a).pct); }],
  win: ['Gewinner', function (a, b) { return chg(b).pct - chg(a).pct; }],
  lose: ['Verlierer', function (a, b) { return chg(a).pct - chg(b).pct; }],
  cap: ['Höchste Obergrenze', function (a, b) { return C.price(b) * b.supply - C.price(a) * a.supply; }]
};
function moodBadge() { var m = BE.market.mood(BE.now()); return '<span class="pill ' + m.cls + '">' + (m.k === 'hype' ? '🚀 ' : m.k === 'crash' ? '📉 ' : '↔ ') + m.label + '</span>'; }

BE.views.crypto = {
  title: 'Kryptobörse',
  render: function () {
    var k = BE.ui.coinSort || 'hot', arr = LIST.slice().sort(SORTS[k][1]);
    return '<div class="chips">' + Object.keys(SORTS).map(function (x) { return '<button class="' + (x === k ? 'on' : '') + '" data-act="coinSort" data-k="' + x + '">' + SORTS[x][0] + '</button>'; }).join('') + '</div>' +
      '<div class="row" style="margin:0 4px 8px"><span class="lbl">Marktstimmung</span>' + moodBadge() + '</div>' +
      '<div class="card" style="padding:4px 14px">' + arr.map(row).join('') + '</div>';
  }
};
BE.views.cryptoPortfolio = {
  title: 'Meine Krypto-Anlagen',
  render: function () {
    var ids = Object.keys(S().crypto), val = C.value(), cost = C.cost(), gain = val - cost, pct = cost ? gain / cost * 100 : 0;
    var h = '<div class="card"><div class="lbl">Wert der Krypto-Anlagen</div><div class="big">' + BE.fmt2(val) + '</div><div class="' + (gain >= 0 ? 'good' : 'bad') + '" style="font-weight:800">' +
      (gain >= 0 ? '+' : '−') + BE.fmt2(Math.abs(gain)) + ' (' + BE.nf2.format(Math.abs(pct)) + ' %) <span class="lbl">Insgesamt</span></div></div>';
    if (!ids.length) return h + '<div class="empty"><div class="e">🪙</div>Du besitzt noch keine Coins.</div><button class="btn full" data-act="open" data-v="crypto">Zur Kryptobörse</button>';
    return h + '<div class="card" style="padding:4px 14px">' + ids.map(function (id) { return row(BY[id]); }).join('') + '</div>';
  }
};
var RANGES = { h: ['1 Std.', 3600000, 30], d: ['1 Tag', 86400000, 48], w: ['1 Woche', 7 * 86400000, 56], m: ['1 Monat', 30 * 86400000, 60] };
BE.views.coin = {
  title: function (id) { return BY[id].name; },
  render: function (id) {
    var a = BY[id], now = BE.now(), p = C.price(a, now), pos = C.pos(id), rk = BE.ui.crange || 'd', R = RANGES[rk];
    var ser = BE.market.series(a, now, R[1], R[2]), c = { pct: (ser[ser.length - 1] / ser[0] - 1) * 100 }, up = c.pct >= 0;
    var val = pos.q * p, gain = val - pos.cost, news = BE.market.news(now).filter(function (n) { return n.id === id; }).slice(0, 2);
    var h = '<div class="row" style="align-items:flex-start"><div><div class="big" style="font-size:34px">' + BE.fmtP(p) + '</div>' + arrow(c) + '</div>' + logo(a) + '</div>' +
      '<div class="chart">' + BE.market.chart(ser, up, 'c') + '</div>' +
      '<div class="chips" style="margin-bottom:0">' + Object.keys(RANGES).map(function (k) { return '<button class="' + (k === rk ? 'on' : '') + '" data-act="coinRange" data-r="' + k + '">' + RANGES[k][0] + '</button>'; }).join('') + '</div>' +
      '<div class="card"><div class="row"><span class="lbl">Marktkapitalisierung</span><b>' + BE.fmtK(p * a.supply) + '</b></div><div class="gap"></div>' +
      '<div class="row"><span class="lbl">Schwankung</span><b>' + (a.vol > .8 ? 'Extrem' : a.vol > .5 ? 'Hoch' : 'Mittel') + '</b></div><div class="gap"></div>' +
      '<div class="row"><span class="lbl">Marktstimmung</span>' + moodBadge() + '</div></div>';
    if (news.length) h += '<div class="card"><b>Nachrichten</b>' + news.map(function (n) { return '<div class="lbl" style="margin-top:8px">' + (n.good ? '🚀' : '📉') + ' ' + BE.esc(n.text) + '</div>'; }).join('') + '</div>';
    h += '<div class="card"><div class="row"><div><div class="lbl">Dein Bestand</div><div style="font-size:22px;font-weight:800">' + qf.format(pos.q) + ' ' + a.id + '</div></div>' +
      '<div style="text-align:right"><div class="lbl">Wert</div><div style="font-size:18px;font-weight:800">' + BE.fmt2(val) + '</div>' +
      (pos.q ? '<div class="' + (gain >= 0 ? 'good' : 'bad') + '" style="font-size:13px;font-weight:700">' + (gain >= 0 ? '+' : '−') + BE.fmt2(Math.abs(gain)) + '</div>' : '') + '</div></div></div>' +
      '<div class="lbl" style="margin:0 4px 6px">Kaufen für (1 % Gebühr)</div><div class="qty">' +
      ['100', '1000', '10000', 'max'].map(function (n) { return '<button data-act="coinBuy" data-id="' + id + '" data-amt="' + n + '" style="background:rgba(61,220,151,.15);border-color:rgba(61,220,151,.4)">' + (n === 'max' ? 'Alles' : BE.fmtK(+n)) + '</button>'; }).join('') + '</div>' +
      '<div class="lbl" style="margin:10px 4px 6px">Verkaufen</div><div class="qty">' +
      ['25', '50', '100'].map(function (n) { return '<button data-act="coinSell" data-id="' + id + '" data-pct="' + n + '" style="' + (pos.q ? 'background:rgba(255,107,107,.14);border-color:rgba(255,107,107,.4)' : 'opacity:.35') + '">' + n + ' %</button>'; }).join('') + '</div>';
    return h;
  }
};

BE.invest = BE.invest || {};
BE.invest.krypto = function () {
  var now = BE.now(), val = C.value(now), cost = C.cost(), gain = val - cost, pct = cost ? gain / cost * 100 : 0, up = gain >= 0;
  var h = '<div class="card tappable" data-act="open" data-v="cryptoPortfolio" style="background:linear-gradient(135deg,#0f4c4a,#143b52)"><div class="row"><b>🪙 Meine Krypto-Anlagen</b><span class="pill acc">›</span></div>' +
    '<div class="lbl" style="margin-top:12px">Wert der Krypto-Anlagen</div><div class="big" style="font-size:32px">' + BE.fmt2(val) + '</div>' +
    '<div class="' + (up ? 'good' : 'bad') + '" style="font-weight:800">' + (up ? '+' : '−') + BE.fmt2(Math.abs(gain)) + ' (' + BE.nf2.format(Math.abs(pct)) + ' %) <span class="lbl">Insgesamt</span></div></div>' +
    '<div class="cover tappable" data-act="open" data-v="crypto" style="background:linear-gradient(135deg,#19c3a0,#2563eb);min-height:104px"><h4>Kryptobörse</h4><p>Hype, Crash und wilde Kurse ›</p></div>' +
    '<div class="row" style="margin:6px 4px 0"><span class="lbl">Marktstimmung</span>' + moodBadge() + '</div>' +
    '<h3>🔥 Heiß</h3><div class="card" style="padding:4px 14px">' + LIST.slice().sort(SORTS.hot[1]).slice(0, 4).map(row).join('') + '</div>';
  var news = BE.market.news(now).filter(function (n) { return BY[n.id]; }).slice(0, 3);
  if (news.length) h += '<h3>📰 Krypto-News</h3><div class="card">' + news.map(function (n) { return '<div class="lbl" style="padding:5px 0">' + (n.good ? '🚀' : '📉') + ' ' + BE.esc(n.text) + '</div>'; }).join('') + '</div>';
  return h;
};
})();
