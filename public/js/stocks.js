/* Business Empire – Aktien (erfundene Firmen, Kurse per Tages-Seed, Dividenden) */
(function () {
'use strict';
var BE = window.BE, S = function () { return BE.S; };
var FEE = 0.005;

var LIST = [
  { id: 'NVT', name: 'Novatech', sector: 'Technik', base: 142.3, vol: .20, beta: .55, div: .0018, ico: 'chip', bg: '#4f8cff' },
  { id: 'SUN', name: 'Sunrise Energie', sector: 'Energie', base: 48.2, vol: .14, beta: .30, div: .0105, ico: 'sun', bg: '#f5a623' },
  { id: 'BRK', name: 'Brotkorb AG', sector: 'Konsum', base: 21.75, vol: .08, beta: .15, div: .0115, ico: 'wheat', bg: '#c58b3d' },
  { id: 'MDX', name: 'Medilux Pharma', sector: 'Pharma', base: 96.4, vol: .16, beta: .35, div: .0042, ico: 'cross', bg: '#25c485' },
  { id: 'ARC', name: 'Arcadia Games', sector: 'Medien', base: 63.1, vol: .36, beta: .80, div: .0008, ico: 'pad', bg: '#8f7bff' },
  { id: 'VLT', name: 'Voltauto', sector: 'Fahrzeuge', base: 187.5, vol: .28, beta: .70, div: .0012, ico: 'bolt', bg: '#ff6b6b' },
  { id: 'GLD', name: 'Goldmann Bank', sector: 'Finanzen', base: 112.0, vol: .14, beta: .50, div: .0095, ico: 'bank', bg: '#c9a227' },
  { id: 'TRP', name: 'Transpora', sector: 'Logistik', base: 34.8, vol: .13, beta: .40, div: .0078, ico: 'truck', bg: '#ef8a5a' },
  { id: 'AQU', name: 'Aquaria Wasser', sector: 'Versorger', base: 27.3, vol: .07, beta: .10, div: .0120, ico: 'drop', bg: '#2aa7b8' },
  { id: 'SKY', name: 'Skylink Telekom', sector: 'Telekom', base: 41.6, vol: .11, beta: .30, div: .0102, ico: 'signal', bg: '#6a5cff' },
  { id: 'FRM', name: 'Farmland', sector: 'Agrar', base: 18.9, vol: .10, beta: .20, div: .0068, ico: 'leaf', bg: '#3fae6a' },
  { id: 'BLD', name: 'Bauwerk', sector: 'Bau', base: 72.4, vol: .15, beta: .45, div: .0055, ico: 'hammer', bg: '#e8455a' },
  { id: 'ORB', name: 'Orbital Raumfahrt', sector: 'Raumfahrt', base: 260.0, vol: .42, beta: .90, div: .0004, ico: 'rocket', bg: '#4f46e5' },
  { id: 'FIT', name: 'FitFuture', sector: 'Freizeit', base: 15.4, vol: .30, beta: .60, div: .0020, ico: 'dumbbell', bg: '#ec4899' },
  { id: 'CHP', name: 'Chipwerk Systems', sector: 'Technik', base: 88.7, vol: .26, beta: .70, div: .0010, ico: 'chip', bg: '#3b82f6' },
  { id: 'SOL', name: 'Solaris Solar', sector: 'Energie', base: 24.6, vol: .27, beta: .65, div: .0030, ico: 'sun', bg: '#f59e0b' },
  { id: 'HRT', name: 'Herzblut Klinik', sector: 'Pharma', base: 54.3, vol: .12, beta: .25, div: .0070, ico: 'cross', bg: '#10b981' },
  { id: 'PLY', name: 'Playbox Studios', sector: 'Medien', base: 31.2, vol: .33, beta: .75, div: .0006, ico: 'pad', bg: '#a78bfa' },
  { id: 'AMP', name: 'Ampere Mobil', sector: 'Fahrzeuge', base: 69.9, vol: .24, beta: .60, div: .0030, ico: 'bolt', bg: '#f87171' },
  { id: 'SPK', name: 'Sparkasse Nord', sector: 'Finanzen', base: 38.5, vol: .10, beta: .35, div: .0110, ico: 'bank', bg: '#d4a72c' },
  { id: 'CRG', name: 'Cargolux Fracht', sector: 'Logistik', base: 52.0, vol: .17, beta: .50, div: .0060, ico: 'truck', bg: '#fb923c' },
  { id: 'RHN', name: 'Rheinwasser', sector: 'Versorger', base: 63.8, vol: .06, beta: .08, div: .0125, ico: 'drop', bg: '#14b8a6' },
  { id: 'NET', name: 'Netzwerk Funk', sector: 'Telekom', base: 22.4, vol: .13, beta: .32, div: .0095, ico: 'signal', bg: '#818cf8' },
  { id: 'BIO', name: 'Biohof Grün', sector: 'Agrar', base: 29.1, vol: .11, beta: .22, div: .0075, ico: 'leaf', bg: '#22c55e' },
  { id: 'STN', name: 'Steinbau Union', sector: 'Bau', base: 44.0, vol: .14, beta: .42, div: .0065, ico: 'hammer', bg: '#ef4444' },
  { id: 'LUN', name: 'Lunar Transit', sector: 'Raumfahrt', base: 130.0, vol: .40, beta: .85, div: .0005, ico: 'rocket', bg: '#6366f1' },
  { id: 'GYM', name: 'Gymwelt Holding', sector: 'Freizeit', base: 26.8, vol: .22, beta: .50, div: .0035, ico: 'dumbbell', bg: '#f472b6' },
  { id: 'MHL', name: 'Mühle & Söhne', sector: 'Konsum', base: 14.2, vol: .08, beta: .14, div: .0120, ico: 'wheat', bg: '#b9833a' },
  { id: 'AER', name: 'Aerolinie Nova', sector: 'Luftfahrt', base: 47.5, vol: .30, beta: .80, div: .0020, ico: 'plane', bg: '#0ea5e9' },
  { id: 'HTL', name: 'Hotelia Resorts', sector: 'Tourismus', base: 76.3, vol: .21, beta: .60, div: .0045, ico: 'hotel', bg: '#06b6d4' },
  { id: 'AUT', name: 'Autohof Premium', sector: 'Fahrzeuge', base: 118.0, vol: .18, beta: .55, div: .0058, ico: 'car', bg: '#64748b' },
  { id: 'CLD', name: 'Cloudkern', sector: 'Technik', base: 205.0, vol: .30, beta: .75, div: .0004, ico: 'code', bg: '#2563eb' },
  { id: 'SNK', name: 'Snackwerk', sector: 'Konsum', base: 9.8, vol: .20, beta: .30, div: .0090, ico: 'burger', bg: '#fb7185' }
];
LIST.forEach(function (a) { a.kind = 'stock'; });
BE.market.register(LIST);
var BY = {}; LIST.forEach(function (a) { BY[a.id] = a; });
var ST = BE.stocks = { LIST: LIST, BY: BY };

ST.price = function (a, t) { return BE.market.price(a, t || BE.now()); };
ST.pos = function (id) { return S().stocks[id] || { n: 0, cost: 0 }; };
ST.value = function (now) {
  now = now || BE.now(); var v = 0;
  for (var id in S().stocks) v += S().stocks[id].n * ST.price(BY[id], now);
  return v;
};
ST.cost = function () { var c = 0; for (var id in S().stocks) c += S().stocks[id].cost; return c; };
ST.divHour = function (now) {
  now = now || BE.now(); var h = 0;
  for (var id in S().stocks) { var a = BY[id]; h += S().stocks[id].n * ST.price(a, now) * a.div; }
  return h;
};
BE.parts.push({ id: 'stock', cat: 'stock', worth: function (n) { return ST.value(n); }, hour: function (n) { return ST.divHour(n); } });

function ico(a) { return '<div class="ico round">' + BE.art.icon(a.ico, '#fff', a.bg) + '</div>'; }
function chg(a, span) { return BE.market.change(a, BE.now(), span || 86400000); }
function chgHtml(c) {
  var up = c.pct >= 0;
  return '<div class="' + (up ? 'good' : 'bad') + '" style="font-size:13px;font-weight:700">' + (up ? '+' : '−') + BE.nf2.format(Math.abs(c.abs)) + ' € (' + BE.nf2.format(Math.abs(c.pct)) + ' %)</div>';
}
function row(a, extra) {
  var c = chg(a), p = ST.pos(a.id), up = c.pct >= 0;
  return '<div class="li tappable" data-act="open" data-v="stock" data-arg="' + a.id + '">' + ico(a) +
    '<div class="info"><div class="nm">' + a.name + '</div><div class="lbl">' + (p.n ? '<b class="gold">' + BE.nf0.format(p.n) + ' Stück</b> · ' : '') + a.sector + '</div></div>' +
    BE.market.spark(BE.market.series(a, BE.now(), 86400000, 24), 84, 34, up) +
    '<div class="rt"><div class="v">' + BE.fmtP(ST.price(a)) + '</div><div class="' + (up ? 'good' : 'bad') + '" style="font-size:13px;font-weight:700">' + (up ? '▲ ' : '▼ ') + BE.nf2.format(Math.abs(c.pct)) + ' %</div></div></div>';
}

/* ---------- Aktionen ---------- */
BE.act.stockBuy = function (d) {
  var a = BY[d.id], p = ST.price(a), unit = p * (1 + FEE), n;
  var max = Math.floor(S().money / unit);
  n = d.n === 'max' ? max : Math.min(+d.n, max);
  if (n < 1) { BE.toast('Nicht genug Geld', true); return false; }
  var cost = n * unit; BE.spend(cost);
  var pos = S().stocks[a.id] = S().stocks[a.id] || { n: 0, cost: 0 };
  pos.n += n; pos.cost += cost; BE.stat('trades'); BE.buzz(8);
  BE.toast(BE.nf0.format(n) + '× ' + a.name + ' gekauft');
};
BE.act.stockSell = function (d) {
  var a = BY[d.id], pos = ST.pos(a.id), n = d.n === 'all' ? pos.n : Math.min(+d.n, pos.n);
  if (n < 1) return false;
  var p = ST.price(a) * (1 - FEE), got = n * p, share = n / pos.n;
  BE.add(got); pos.cost -= pos.cost * share; pos.n -= n;
  if (pos.n <= 0) delete S().stocks[a.id];
  BE.stat('trades'); BE.buzz(8);
  BE.toast(BE.nf0.format(n) + '× verkauft · +' + BE.fmt(got));
};
BE.act.stockRange = function (d) { BE.ui.range = d.r; };
BE.act.stockSort = function (d) { BE.ui.stockSort = d.k; };

/* ---------- Ansichten ---------- */
var SORTS = {
  divHi: ['Höchste Dividende', function (a, b) { return b.div - a.div; }],
  divLo: ['Niedrigste Dividende', function (a, b) { return a.div - b.div; }],
  win: ['Gewinner', function (a, b) { return chg(b).pct - chg(a).pct; }],
  lose: ['Verlierer', function (a, b) { return chg(a).pct - chg(b).pct; }],
  pHi: ['Teuerste', function (a, b) { return ST.price(b) - ST.price(a); }],
  pLo: ['Günstigste', function (a, b) { return ST.price(a) - ST.price(b); }]
};
BE.views.stocks = {
  title: 'Börse',
  render: function () {
    var k = BE.ui.stockSort || 'divHi', arr = LIST.slice().sort(SORTS[k][1]);
    var h = '<div class="chips">' + Object.keys(SORTS).map(function (x) { return '<button class="' + (x === k ? 'on' : '') + '" data-act="stockSort" data-k="' + x + '">' + SORTS[x][0] + '</button>'; }).join('') + '</div>';
    return h + '<div class="card" style="padding:4px 14px">' + arr.map(row).join('') + '</div>';
  }
};
BE.views.portfolio = {
  title: 'Aktienportfolio',
  render: function () {
    var val = ST.value(), cost = ST.cost(), gain = val - cost, pct = cost ? gain / cost * 100 : 0, ids = Object.keys(S().stocks);
    var h = '<div class="card"><div class="lbl">Wert des Aktienportfolios</div><div class="big">' + BE.fmt2(val) + '</div>' +
      '<div class="' + (gain >= 0 ? 'good' : 'bad') + '" style="font-weight:800">' + (gain >= 0 ? '+' : '−') + BE.fmt2(Math.abs(gain)) + ' (' + BE.nf2.format(Math.abs(pct)) + ' %) <span class="lbl">Insgesamt</span></div>' +
      '<div class="lbl" style="margin-top:14px">Dividenden pro Stunde</div><div style="font-size:24px;font-weight:800">' + BE.fmt2(ST.divHour() * BE.global()) + '</div></div>';
    if (!ids.length) return h + '<div class="empty"><div class="e">📈</div>Du besitzt noch keine Aktien.</div><button class="btn full" data-act="open" data-v="stocks">Zur Börse</button>';
    ids.sort(function (a, b) { return S().stocks[b].n * ST.price(BY[b]) - S().stocks[a].n * ST.price(BY[a]); });
    return h + '<div class="card" style="padding:4px 14px">' + ids.map(function (id) { return row(BY[id]); }).join('') + '</div>';
  }
};
var RANGES = { h: ['1 Std.', 3600000, 30], d: ['1 Tag', 86400000, 48], w: ['1 Woche', 7 * 86400000, 56], m: ['1 Monat', 30 * 86400000, 60] };
BE.views.stock = {
  title: function (id) { return BY[id].name; },
  render: function (id) {
    var a = BY[id], now = BE.now(), p = ST.price(a, now), pos = ST.pos(id), rk = BE.ui.range || 'd', R = RANGES[rk];
    var ser = BE.market.series(a, now, R[1], R[2]), c = { abs: ser[ser.length - 1] - ser[0], pct: (ser[ser.length - 1] / ser[0] - 1) * 100 }, up = c.pct >= 0;
    var max = Math.floor(S().money / (p * (1 + FEE))), val = pos.n * p, gain = val - pos.cost;
    var news = BE.market.news(now).filter(function (n) { return n.id === id; }).slice(0, 2);
    var mood = BE.market.mood(now);
    var h = '<div class="row" style="align-items:flex-start"><div><div class="big" style="font-size:34px">' + BE.fmtP(p) + '</div>' + chgHtml(c) + '</div>' + ico(a) + '</div>' +
      '<div class="chart">' + BE.market.chart(ser, up, 's') + '</div>' +
      '<div class="chips" style="margin-bottom:0">' + Object.keys(RANGES).map(function (k) { return '<button class="' + (k === rk ? 'on' : '') + '" data-act="stockRange" data-r="' + k + '">' + RANGES[k][0] + '</button>'; }).join('') + '</div>' +
      '<div class="card"><div class="row"><span class="lbl">Branche</span><b>' + a.sector + '</b></div><div class="gap"></div>' +
      '<div class="row"><span class="lbl">Dividende</span><b class="good">' + BE.pct(a.div * 100, false) + ' / Std.</b></div><div class="gap"></div>' +
      '<div class="row"><span class="lbl">Marktstimmung</span><span class="pill ' + mood.cls + '">' + mood.label + '</span></div></div>';
    if (news.length) h += '<div class="card"><b>Nachrichten</b>' + news.map(function (n) { return '<div class="lbl" style="margin-top:8px">' + (n.good ? '📈' : '📉') + ' ' + BE.esc(n.text) + '</div>'; }).join('') + '</div>';
    h += '<div class="card"><div class="row"><div><div class="lbl">Dein Bestand</div><div style="font-size:22px;font-weight:800">' + BE.nf0.format(pos.n) + ' Stück</div></div>' +
      '<div style="text-align:right"><div class="lbl">Wert</div><div style="font-size:18px;font-weight:800">' + BE.fmt2(val) + '</div>' +
      (pos.n ? '<div class="' + (gain >= 0 ? 'good' : 'bad') + '" style="font-size:13px;font-weight:700">' + (gain >= 0 ? '+' : '−') + BE.fmt2(Math.abs(gain)) + '</div>' : '') + '</div></div>' +
      (pos.n ? '<div class="lbl" style="margin-top:8px">Dividende: +' + BE.fmt2(val * a.div * BE.global()) + ' pro Stunde</div>' : '') + '</div>' +
      '<div class="lbl" style="margin:0 4px 6px">Kaufen (0,5 % Gebühr) · max. ' + BE.nf0.format(max) + '</div><div class="qty">' +
      ['1', '10', '100', 'max'].map(function (n) { return '<button data-act="stockBuy" data-id="' + id + '" data-n="' + n + '" style="background:rgba(61,220,151,.15);border-color:rgba(61,220,151,.4)">' + (n === 'max' ? 'Max' : '+' + n) + '</button>'; }).join('') + '</div>' +
      '<div class="lbl" style="margin:10px 4px 6px">Verkaufen</div><div class="qty">' +
      ['1', '10', '100', 'all'].map(function (n) { return '<button data-act="stockSell" data-id="' + id + '" data-n="' + n + '" style="' + (pos.n ? 'background:rgba(255,107,107,.14);border-color:rgba(255,107,107,.4)' : 'opacity:.35') + '">' + (n === 'all' ? 'Alles' : '−' + n) + '</button>'; }).join('') + '</div>';
    return h;
  }
};

/* ---------- Tab "Investments → Aktien" ---------- */
BE.invest = BE.invest || {};
BE.invest.aktien = function () {
  var now = BE.now(), val = ST.value(now), cost = ST.cost(), gain = val - cost, pct = cost ? gain / cost * 100 : 0, up = gain >= 0;
  var h = '<div class="card tappable" data-act="open" data-v="portfolio" style="background:linear-gradient(135deg,#1c3a78,#1a2a5e)"><div class="row"><b>💼 Mein Aktienportfolio</b><span class="pill acc">›</span></div>' +
    '<div class="lbl" style="margin-top:12px">Wert des Aktienportfolios</div><div class="big" style="font-size:32px">' + BE.fmt2(val) + '</div>' +
    '<div class="' + (up ? 'good' : 'bad') + '" style="font-weight:800">' + (up ? '+' : '−') + BE.fmt2(Math.abs(gain)) + ' (' + BE.nf2.format(Math.abs(pct)) + ' %) <span class="lbl">Insgesamt</span></div>' +
    '<div class="lbl" style="margin-top:12px">Geschätzter Gewinn pro Stunde</div><div style="font-size:22px;font-weight:800">' + BE.fmt2(ST.divHour(now) * BE.global()) + '</div></div>';
  h += '<div class="cover tappable" data-act="open" data-v="stocks" style="background:linear-gradient(135deg,#2f6bff,#6a5cff);min-height:104px"><h4>Börse</h4><p>Alle verfügbaren Angebote anzeigen ›</p></div>';
  h += '<div class="row" style="margin:6px 4px 0"><span class="pill acc">Seed des Tages ' + BE.market.daySeed(now) + '</span><span class="lbl">Für alle Spieler gleich</span></div>';
  h += '<h3>⚖️ Stabile Einnahmen<div class="lbl" style="font-weight:500;font-size:13px;margin-top:2px">Aktien mit den höchsten Dividenden</div></h3><div class="card" style="padding:4px 14px">' +
    LIST.slice().sort(SORTS.divHi[1]).slice(0, 4).map(row).join('') + '</div>';
  h += '<h3>🔥 Heute in Bewegung</h3><div class="card" style="padding:4px 14px">' +
    LIST.slice().sort(function (a, b) { return Math.abs(chg(b).pct) - Math.abs(chg(a).pct); }).slice(0, 3).map(row).join('') + '</div>';
  var news = BE.market.news(now).filter(function (n) { return BY[n.id]; }).slice(0, 3);
  if (news.length) h += '<h3>📰 Börsennachrichten</h3><div class="card">' + news.map(function (n) { return '<div class="lbl" style="padding:5px 0">' + (n.good ? '📈' : '📉') + ' ' + BE.esc(n.text) + '</div>'; }).join('') + '</div>';
  return h;
};
BE.act.open = BE.act.open || function (d) { BE.open(d.v, d.arg); return false; };
})();
