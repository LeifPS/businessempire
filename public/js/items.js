/* Business Empire – Gegenstände: Autos, Flugzeuge, Yachten, Inseln, Sammlungen */
(function () {
'use strict';
var BE = window.BE, S = function () { return BE.S; }, A = BE.art;
var DAY = 86400000, SELL_FEE = 0.10;

function car(id, name, k, c, price, tier, rate) { return { id: id, name: name, k: k, c: c, price: price, tier: tier, rate: rate || -0.004, floor: .45, cap: 3 }; }
var CARS = [
  car('c1', 'Pico Zwerg', 'mini', '#4fb0ff', 14900, 1), car('c2', 'Brio Kompakt', 'mini', '#ff7a45', 24500, 1), car('c3', 'Stadtfuchs EV', 'mini', '#2ec4b6', 38900, 1),
  car('c4', 'Lastenesel Van', 'van', '#eceff4', 54000, 2), car('c5', 'Mercato Limousine', 'sedan', '#8a2be2', 74000, 2), car('c6', 'Bergkönig SUV', 'suv', '#2e7d32', 96000, 2),
  car('c7', 'Senator V8', 'sedan', '#1c1f2b', 138000, 2), car('c8', 'Aurelia Cabrio', 'conv', '#ffb300', 185000, 3), car('c9', 'Falke GT', 'coupe', '#e53935', 260000, 3),
  car('c10', 'Rapido 57', 'retro', '#7a9e9f', 380000, 3, .003), car('c11', 'Vortex RS', 'coupe', '#1e88e5', 420000, 4), car('c12', 'Marlin Speedster', 'conv', '#00b894', 780000, 4),
  car('c13', 'Kaiser Cabrio 36', 'retro', '#1b3a57', 1200000, 4, .003), car('c14', 'Strato S1', 'hyper', '#ff6b00', 1900000, 5), car('c15', 'Tempesta Hyper', 'hyper', '#7b2cbf', 3600000, 5),
  car('c16', 'Onyx Noir', 'hyper', '#2a2a2e', 19000000, 6), car('c17', 'Chronos Roadster', 'conv', '#c9ced8', 28000000, 6), car('c18', 'Gran Corsa 250', 'retro', '#c62828', 50000000, 6, .004)
];
function plane(id, name, k, price, tier, c, t) { return { id: id, name: name, k: k, price: price, tier: tier, c: c || '#eef2ff', t: t || '#2f6bff', rate: -0.002, floor: .5, cap: 1 }; }
var PLANES = [
  plane('p1', 'Kolibri K-2', 'prop', 295000, 1), plane('p2', 'Falcon Twin T7', 'twin', 995000, 2, '#fff', '#e8455a'), plane('p3', 'Gazelle Jet 60', 'jet', 1895000, 3),
  plane('p4', 'Helix H130', 'heli', 2700000, 3, '#f4f6fb', '#f5a623'), plane('p5', 'SeaGull Amphibie', 'sea', 3400000, 3, '#fffbe8', '#19a8a0'), plane('p6', 'Nimbus 7X', 'jet', 14000000, 4, '#e8f0ff', '#e8455a'),
  plane('p7', 'Meridian 900', 'jet', 38000000, 5, '#f3f3f3', '#1d2f55'), plane('p8', 'Zenith Überschall', 'super', 95000000, 5, '#e4e9f5', '#6a5cff'),
  plane('p9', 'Aeroliner 400', 'airliner', 180000000, 6, '#fff', '#2f6bff'), plane('p10', 'Condor VIP', 'airliner', 240000000, 6, '#f6f1e2', '#c9a227')
];
function yacht(id, name, k, price, tier, c) { return { id: id, name: name, k: k, c: c || '#1d3a8a', price: price, tier: tier, rate: -0.002, floor: .55, cap: 1 }; }
var YACHTS = [
  yacht('y1', 'Marina Fifty', 'motor', 1200000, 1, '#1d3a8a'), yacht('y2', 'Wellenreiter 70', 'cat', 4800000, 2, '#0f6b6b'), yacht('y3', 'Santorin', 'sail', 9500000, 2, '#1d3a8a'),
  yacht('y4', 'Nautilus 120', 'motor', 24000000, 3, '#222c4a'), yacht('y5', 'Poseidon Explorer', 'mega', 85000000, 4, '#1d3a8a'), yacht('y6', 'Sirenia', 'mega', 230000000, 5, '#12353a'),
  yacht('y7', 'Aurora Giga', 'mega', 320000000, 6, '#4a1d3a'), yacht('y8', 'Leviathan', 'mega', 480000000, 7, '#111522')
];
function isle(id, name, k, price) { return { id: id, name: name, k: k, price: price, tier: 1, rate: .003, floor: 1, cap: 2.5 }; }
var ISLANDS = [
  isle('i1', 'Palmeira Cay', 'palm', 23000000), isle('i2', 'Isla Verde del Sol', 'rock', 39700000), isle('i3', 'Nordkap Skerry', 'forest', 58000000),
  isle('i4', 'Atoll Perlmutt', 'atoll', 92000000), isle('i5', 'Vulkaninsel Kaiya', 'volcano', 140000000), isle('i6', 'Archipel Aurora', 'arch', 260000000)
];
var CARBONUS = [0, .005, .01, .02, .035, .055, .08], PLANEDISC = [0, .01, .015, .025, .04, .06, .09], YACHTBONUS = [0, .02, .03, .05, .08, .12, .18, .25];
var ISLAND_Y = 0.0035;

var STORES = {
  garage: { title: 'Auto-Ausstellungsraum', mine: 'Meine Garage', list: CARS, art: function (i) { return A.car(i.k, i.c); }, perk: function (i) { return '+<b>' + (CARBONUS[i.tier] * 100).toFixed(1).replace('.', ',') + ' %</b> Unternehmenseinnahmen'; }, unit: 'Auto', plural: 'Autos' },
  hangar: { title: 'Flugzeug-Geschäft', mine: 'Meine Flugzeughalle', list: PLANES, art: function (i) { return A.plane(i.k, i.c, i.t); }, perk: function (i) { return '<b>−' + (PLANEDISC[i.tier] * 100).toFixed(1).replace('.', ',') + ' %</b> Ausbaukosten für Unternehmen'; }, unit: 'Flugzeug', plural: 'Flugzeuge' },
  port: { title: 'Yacht-Geschäft', mine: 'Mein Hafen', list: YACHTS, art: function (i) { return A.yacht(i.k, i.c); }, perk: function (i) { return '+<b>' + (YACHTBONUS[i.tier] * 100).toFixed(0) + ' %</b> Mieteinnahmen'; }, unit: 'Yacht', plural: 'Yachten' },
  islands: { title: 'Inseln', mine: 'Meine Inseln', list: ISLANDS, art: function (i) { return A.island(i.k); }, perk: function (i) { return 'Resort: <b>+' + BE.fmt(i.price * ISLAND_Y * BE.global()) + ' / Std.</b>'; }, unit: 'Insel', plural: 'Inseln' }
};
var BYID = {};
Object.keys(STORES).forEach(function (k) { STORES[k].list.forEach(function (i) { i.store = k; BYID[i.id] = i; }); });
var cache = {};
function art(i) { return cache[i.id] || (cache[i.id] = STORES[i.store].art(i).replace('xMidYMid meet', 'xMidYMid slice')); }

function value(i, ts, now) {
  var d = Math.max(0, ((now || BE.now()) - ts) / DAY), m = 1 + i.rate * d;
  return i.price * Math.max(i.floor, Math.min(i.cap, m));
}
function ownedList(k) { return S()[k]; }
function sum(k, f) { var s = 0; S()[k].forEach(function (o) { s += f(BYID[o.id]); }); return s; }
BE.carBonus = function () { return sum('garage', function (i) { return CARBONUS[i.tier]; }); };
BE.planeDiscount = function () { return Math.min(.5, sum('hangar', function (i) { return PLANEDISC[i.tier]; })); };
BE.yachtBonus = function () { return sum('port', function (i) { return YACHTBONUS[i.tier]; }); };
function worthOf(k, now) { var v = 0; S()[k].forEach(function (o) { v += value(BYID[o.id], o.ts, now); }); return v; }
BE.parts.push({ id: 'transport', cat: 'trans', worth: function (n) { return worthOf('garage', n) + worthOf('hangar', n) + worthOf('port', n); } });
BE.parts.push({ id: 'islands', cat: 'res', worth: function (n) { return worthOf('islands', n); }, hour: function () { return sum('islands', function (i) { return i.price * ISLAND_Y; }); } });

/* ---------- Kaufen / Verkaufen ---------- */
BE.act.itemBuy = function (d) {
  var i = BYID[d.id], k = i.store;
  if (ownedList(k).some(function (o) { return o.id === i.id; })) return false;
  if (!BE.spend(i.price)) { BE.toast('Nicht genug Geld', true); return false; }
  ownedList(k).push({ id: i.id, paid: i.price, ts: BE.now() }); BE.stat('buys'); BE.buzz(18);
  BE.toast(i.name + ' gekauft!');
};
BE.act.itemSell = function (d) {
  var i = BYID[d.id], k = i.store, o = ownedList(k).filter(function (x) { return x.id === i.id; })[0]; if (!o) return false;
  var got = Math.round(value(i, o.ts) * (1 - SELL_FEE));
  BE.ask(i.name + ' verkaufen?', 'Du bekommst ' + BE.fmt(got) + ' (10 % Verkaufskosten).', 'Verkaufen', function () {
    var a = ownedList(k), n = a.indexOf(o); if (n < 0) return;
    a.splice(n, 1); BE.add(got); BE.toast('Verkauft für ' + BE.fmt(got)); BE.dirtyCalc(); BE.refresh(); BE.save();
  }, true);
  return false;
};
BE.act.storeTab = function (d) { BE.ui.storeTab = d.t; };

function offer(i, mine, o) {
  var p = i.price, can = S().money >= p;
  var v = mine ? value(i, o.ts) : p, ch = mine ? (v / o.paid - 1) * 100 : 0;
  return '<div class="offer ' + (mine ? 'owned' : '') + '"><div class="pic">' + art(i) + '<div class="tag"><div class="nm">' + i.name + '</div><div class="pr">' + (mine ? BE.fmt(v) : BE.fmt(p)) + '</div></div></div>' +
    '<div class="bd"><div class="perk">' + STORES[i.store].perk(i) + (mine ? '<br>Wertänderung: <span class="' + (ch >= 0 ? 'good' : 'bad') + '">' + BE.pct(ch) + '</span>' : '') + '</div>' +
    (mine ? '<button class="btn sm ghost" data-act="itemSell" data-id="' + i.id + '">Verkaufen</button>' : '<button class="btn ' + (can ? 'good' : 'off') + '" data-act="itemBuy" data-id="' + i.id + '">Kaufen</button>') + '</div></div>';
}
function storeView(k) {
  var st = STORES[k];
  return {
    title: st.title,
    render: function () {
      var tab = BE.ui.storeTab || 'offers', mine = ownedList(k);
      var h = '<div class="subtabs"><button class="' + (tab === 'offers' ? 'on' : '') + '" data-act="storeTab" data-t="offers">Angebote</button><button class="' + (tab === 'mine' ? 'on' : '') + '" data-act="storeTab" data-t="mine">' + st.mine + ' (' + mine.length + ')</button></div>';
      if (tab === 'mine') {
        if (!mine.length) return h + '<div class="empty"><div class="e">' + (k === 'garage' ? '🚗' : k === 'hangar' ? '✈️' : k === 'port' ? '🛥️' : '🏝️') + '</div>Noch kein ' + st.unit + ' im Besitz.</div>';
        return h + mine.map(function (o) { return offer(BYID[o.id], true, o); }).join('');
      }
      var rest = st.list.filter(function (i) { return !mine.some(function (o) { return o.id === i.id; }); });
      if (!rest.length) return h + '<div class="empty"><div class="e">🏆</div>Alles gekauft!</div>';
      return h + rest.map(function (i) { return offer(i, false); }).join('');
    }
  };
}
['garage', 'hangar', 'port', 'islands'].forEach(function (k) { BE.views[k] = storeView(k); });
BE.act.openStore = function (d) { BE.ui.storeTab = 'offers'; BE.open(d.v); return false; };

/* ================= Sammlungen ================= */
function geo(n, min, max, i) { var v = min * Math.pow(max / min, n > 1 ? i / (n - 1) : 0); var mag = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.round(v / mag) * mag; }
var COLS = [
  { id: 'coins', name: 'Münzen', n: 20, min: 2500, max: 2000000, art: function (i) { return A.coin(i); },
    names: ['Bronze-Obolus', 'Kupfer-Heller', 'Silber-Denar', 'Kaisertaler 1740', 'Goldgulden', 'Silberner Dukat', 'Ritter-Pfennig', 'Hanse-Münze', 'Piratenpiaster', 'Seeräuber-Dublone', 'Kolonialtaler', 'Zarenrubel', 'Mondgoldmünze', 'Krönungsmedaille', 'Phönix-Unze', 'Drachen-Tael', 'Pharaonen-Stater', 'Olympia-Drachme', 'Königs-Sovereign', 'Das Goldene Siegel'] },
  { id: 'paint', name: 'Gemälde', n: 25, min: 40000, max: 60000000, art: function (i) { return A.painting(i); },
    names: ['Nebel über dem Moor', 'Der Hafen bei Nacht', 'Die Lesende', 'Stillleben mit Birnen', 'Frühling in Weiß', 'Sturm vor Cádiz', 'Das rote Segel', 'Dame mit Fächer', 'Winterlandschaft', 'Der Wachturm', 'Blaue Stunde', 'Die Tänzerin', 'Sonnenblumenfeld', 'Das Café am Kanal', 'Porträt eines Admirals', 'Venezianische Nacht', 'Der Lichtfänger', 'Mohnfeld im Wind', 'Die Gondel', 'Schwarzes Quadrat in Gold', 'Das Meer von Ost', 'Der weise Rabe', 'Kleine Welt', 'Das große Rot', 'Die Unvollendete'] },
  { id: 'uni', name: 'Unikate', n: 5, fixed: [5e6, 30e6, 90e6, 220e6, 500e6], art: function (i) { return A.unique(i); },
    names: ['Sternenfunke-Diamant', 'Kaiserkrone von Aurelien', 'Meteor von Kharun', 'Das Goldene Ei', 'Schlüssel der Zeit'] },
  { id: 'retro', name: 'Retroautos', n: 20, min: 20000, max: 30000000, art: function (i) {
      var cl = ['#c62828', '#1b5e8a', '#2e7d32', '#f9a825', '#6d4c41', '#8e24aa', '#00897b', '#37474f', '#ef6c00', '#9e9e9e'], ks = ['retro', 'retro', 'coupe', 'conv', 'sedan'];
      return A.car(ks[i % ks.length], cl[i % cl.length]); },
    names: ['Wanderer 1931', 'Bürgerwagen 38', 'Käfer-Kutsche 49', 'Bella Fiora 55', 'Rapido Coupé 58', 'Strand-Buggy 62', 'Postillon 64', 'Rennmaus 66', 'Adler Sport 68', 'Montana Kombi 70', 'Panther GT 71', 'Sonnenrad 72', 'Delta Turbo 75', 'Cabrio Riviera 76', 'Silberpfeil 79', 'Königsklasse 81', 'Mondrenner 84', 'Zenit Sport 86', 'Goldene Ära 88', 'Urahn Nr. 1'] },
  { id: 'crown', name: 'Juwelen', n: 15, min: 80000, max: 90000000, art: function (i) { return A.crown(i); },
    names: ['Silberreif', 'Perlendiadem', 'Rubinring', 'Smaragdkette', 'Saphir-Collier', 'Jadekrone', 'Tiara von Valmont', 'Zepter-Krönchen', 'Diamantdiadem', 'Rubinkrone', 'Fürstenkrone', 'Kaiserreif', 'Königscollier', 'Sternentiara', 'Weltenkrone'] },
  { id: 'watch', name: 'Uhren', n: 20, min: 6000, max: 12000000, art: function (i) { return A.watch(i); },
    names: ['Taschenuhr Anker', 'Chronos Klassik', 'Taucher 300', 'Pilot Alpha', 'Mondphase', 'Rennsport Tacho', 'Skelett Meister', 'Gold-Dresswatch', 'Tourbillon I', 'Kaiseruhr', 'Ewiger Kalender', 'Marine Chrono', 'Polaris GMT', 'Sternenzeit', 'Savanne Auto', 'Grand Complication', 'Minutenrepetition', 'Bergführer', 'Zeitlos Gold', 'Die Unsterbliche'] }
];
COLS.forEach(function (c) {
  c.items = [];
  for (var i = 0; i < c.n; i++) c.items.push({ id: c.id + i, i: i, name: c.names[i], price: c.fixed ? c.fixed[i] : geo(c.n, c.min, c.max, i), col: c.id });
});
var COLBY = {}; COLS.forEach(function (c) { COLBY[c.id] = c; });
var colArt = {};
function cart(c, it) { return colArt[it.id] || (colArt[it.id] = c.art(it.i)); }
function colOwned(c) { return S().col[c.id] || (S().col[c.id] = []); }
function colValue(c, now) { var v = 0; colOwned(c).forEach(function (o) { var it = c.items[o.i]; v += it.price * Math.min(2.5, 1 + 0.004 * Math.max(0, ((now || BE.now()) - o.ts) / DAY)); }); return v; }
BE.collCount = function () { var n = 0; COLS.forEach(function (c) { n += colOwned(c).length; }); return n; };
BE.collSets = function () { var n = 0; COLS.forEach(function (c) { if (colOwned(c).length >= c.n) n++; }); return n; };
BE.collMult = function () { return 1 + 0.001 * BE.collCount() + 0.05 * BE.collSets(); };
BE.parts.push({ id: 'coll', cat: 'coll', worth: function (n) { var v = 0; COLS.forEach(function (c) { v += colValue(c, n); }); return v; } });

BE.act.colOpen = function (d) { BE.open('col', d.id); return false; };
BE.act.colInfo = function (d) {
  var c = COLBY[d.col], it = c.items[+d.i], own = colOwned(c).some(function (o) { return o.i === it.i; });
  BE.sheet('<div style="height:120px;margin-bottom:6px">' + cart(c, it) + '</div><h4 style="text-align:center">' + BE.esc(it.name) + '</h4>' +
    '<p style="text-align:center">' + c.name + ' · Nr. ' + (it.i + 1) + ' von ' + c.n + '<br>Sammlerstücke gewinnen jeden Tag an Wert. Jedes Stück bringt <b class="good">+0,1 %</b> auf alle Einnahmen, ein komplettes Set sogar <b class="good">+5 %</b>.</p>' +
    (own ? '<div class="btns"><button class="btn ghost" data-act="closeSheet">Schließen</button></div>' :
      '<div class="btns"><button class="btn ghost" data-act="closeSheet">Abbrechen</button><button class="btn good ' + (S().money >= it.price ? '' : 'off') + '" data-act="colBuy" data-col="' + c.id + '" data-i="' + it.i + '">Ersteigern · ' + BE.fmt(it.price) + '</button></div>'));
  return false;
};
BE.act.colBuy = function (d) {
  var c = COLBY[d.col], it = c.items[+d.i];
  if (colOwned(c).some(function (o) { return o.i === it.i; })) return false;
  if (!BE.spend(it.price)) { BE.toast('Nicht genug Geld', true); return false; }
  colOwned(c).push({ i: it.i, paid: it.price, ts: BE.now() }); BE.stat('buys'); BE.buzz(18); BE.closeSheet();
  BE.toast(it.name + ' ersteigert!' + (colOwned(c).length >= c.n ? ' Set komplett: +5 %!' : ''));
};
BE.views.col = {
  title: function (id) { return COLBY[id].name; },
  render: function (id) {
    var c = COLBY[id], own = colOwned(c), pct = own.length / c.n * 100;
    var h = '<div class="card"><div class="row"><b style="font-size:20px">' + own.length + ' von ' + c.n + '</b><span class="pill ' + (own.length >= c.n ? 'gold' : 'acc') + '">' + (own.length >= c.n ? 'Set komplett +5 %' : 'Set +5 %') + '</span></div>' +
      '<div class="bar" style="margin:10px 0 8px"><i style="width:' + pct + '%"></i></div><div class="lbl">Sammlungswert: <b>' + BE.fmt(colValue(c)) + '</b></div></div><div class="cgrid">';
    c.items.forEach(function (it) {
      var has = own.some(function (o) { return o.i === it.i; });
      h += '<div class="citem tappable ' + (has ? 'owned' : 'locked') + '" data-act="colInfo" data-col="' + c.id + '" data-i="' + it.i + '"><div class="art">' + cart(c, it) + '</div>' +
        '<div class="n">' + BE.esc(it.name) + '</div><div class="p">' + (has ? 'Im Besitz' : BE.fmtK(it.price)) + '</div>' + (has ? '<div class="ok">✓</div>' : '') + '</div>';
    });
    return h + '</div>';
  }
};

/* ---------- Tab "Gegenstände" ---------- */
function tile(k, label, svg) {
  return '<div class="tile tappable" data-act="openStore" data-v="' + k + '" style="padding:10px 6px"><div class="art">' + svg + '</div><div class="t" style="font-size:13px">' + label + '</div><div class="lbl" style="font-size:11px">' + ownedList(k).length + ' im Besitz</div></div>';
}
BE.tabs.items = {
  title: 'Gegenstände', sub: 'Autos, Flugzeuge, Yachten und mehr',
  render: function () {
    var h = '<div class="grid3">' + tile('garage', 'Garage', A.car('hyper', '#ff6b00')) + tile('hangar', 'Flughalle', A.plane('jet')) + tile('port', 'Hafen', A.yacht('motor', '#1d3a8a')) + '</div>';
    h += '<div class="cover tappable" data-act="openStore" data-v="islands" style="margin-top:12px;min-height:120px"><div class="bg">' + A.island('palm').replace('xMidYMid meet', 'xMidYMid slice') + '</div><h4>Inseln</h4><p>Eigene Insel mit Resort · ' + S().islands.length + ' im Besitz</p></div>';
    h += '<div class="card tight" style="font-size:13px;line-height:1.6"><b>Deine Boni</b><br>🚗 Autos: <b class="good">+' + (BE.carBonus() * 100).toFixed(1).replace('.', ',') + ' %</b> Unternehmen · ✈️ Flugzeuge: <b class="good">−' + (BE.planeDiscount() * 100).toFixed(1).replace('.', ',') + ' %</b> Ausbaukosten · 🛥️ Yachten: <b class="good">+' + (BE.yachtBonus() * 100).toFixed(0) + ' %</b> Mieten · 🗂️ Sammlungen: <b class="good">+' + ((BE.collMult() - 1) * 100).toFixed(1).replace('.', ',') + ' %</b> alles</div>';
    h += '<h3>Sammlungen</h3><div class="grid2">';
    COLS.forEach(function (c) {
      var n = colOwned(c).length;
      h += '<div class="tile tappable" data-act="colOpen" data-id="' + c.id + '"><div class="art" style="height:84px">' + cart(c, c.items[Math.min(c.n - 1, Math.max(0, n - 1))]) + '</div><div class="t">' + c.name + '</div><div class="lbl">' + n + ' von ' + c.n + '</div><div class="bar" style="margin-top:8px;height:5px"><i style="width:' + (n / c.n * 100) + '%"></i></div></div>';
    });
    return h + '</div>';
  }
};
BE.items = { STORES: STORES, COLS: COLS, value: value };
})();
