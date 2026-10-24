/* Business Empire – Immobilien weltweit (Miete pro Stunde, schwankende Marktpreise) */
(function () {
'use strict';
var BE = window.BE, S = function () { return BE.S; };
var SELL_FEE = 0.06;

var TYPES = [
  { k: 'garage', name: 'Garagenbox', art: 'garage', price: [9000, 16000], y: .0120 },
  { k: 'tiny', name: 'Tiny House', art: 'tiny', price: [24000, 52000], y: .0115 },
  { k: 'flat', name: 'Etagenwohnung', art: 'flat', price: [58000, 160000], y: .0110 },
  { k: 'row', name: 'Reihenhaus', art: 'row', price: [120000, 320000], y: .0105 },
  { k: 'loft', name: 'Stadt-Loft', art: 'loft', price: [260000, 700000], y: .0100 },
  { k: 'villa', name: 'Villa', art: 'villa', price: [650000, 2400000], y: .0095 },
  { k: 'farm', name: 'Landgut', art: 'farm', price: [900000, 3600000], y: .0105 },
  { k: 'penthouse', name: 'Penthouse', art: 'penthouse', price: [1800000, 6500000], y: .0090 },
  { k: 'beach', name: 'Strandhaus', art: 'beach', price: [3500000, 14000000], y: .0088 },
  { k: 'castle', name: 'Schloss', art: 'castle', price: [12000000, 60000000], y: .0082 },
  { k: 'sky', name: 'Wolkenkratzer', art: 'sky', price: [40000000, 220000000], y: .0095 }
];
var CITIES = ['Mexiko-Stadt, Mexiko', 'Montgomery, Alabama', 'Lissabon, Portugal', 'Leipzig, Deutschland', 'Tallinn, Estland', 'Porto, Portugal', 'Krakau, Polen',
  'Nairobi, Kenia', 'Bangkok, Thailand', 'Medellín, Kolumbien', 'Osaka, Japan', 'Lyon, Frankreich', 'Valencia, Spanien', 'Denver, Colorado', 'Seattle, Washington',
  'Zürich, Schweiz', 'Kapstadt, Südafrika', 'Sydney, Australien', 'Dubai, VAE', 'Singapur', 'Monaco', 'Kyoto, Japan', 'Edinburgh, Schottland', 'Toskana, Italien',
  'Santorini, Griechenland', 'Malibu, Kalifornien', 'Bali, Indonesien', 'Miami, Florida', 'Hamburg, Deutschland', 'München, Deutschland', 'Tokio, Japan', 'New York, USA', 'London, England'];
var COLORS = ['#d9c7a8', '#c8d6e8', '#e8c8c8', '#cfe8c8', '#e8dcc0', '#d0c8e8', '#f0d9b5', '#c9e3e0'];
var LIST = [];
TYPES.forEach(function (t, ti) {
  for (var j = 0; j < 3; j++) {
    var i = LIST.length, f = j / 2;
    var price = Math.round(t.price[0] * Math.pow(t.price[1] / t.price[0], f) / 100) * 100 || 1;
    LIST.push({ id: 'E' + i, kind: 'estate', name: t.name, type: t, city: CITIES[i % CITIES.length], base: price, vol: .03, beta: .15, color: COLORS[(i * 3) % COLORS.length] });
  }
});
BE.market.register(LIST);
var BY = {}; LIST.forEach(function (a) { BY[a.id] = a; });
var E = BE.estate = { LIST: LIST, BY: BY };
E.price = function (a, t) { var p = BE.market.price(a, t || BE.now()), q = p >= 1e6 ? 1000 : 100; return Math.round(p / q) * q; };
E.rent = function (a, t) { return E.price(a, t) * a.type.y; };
E.owns = function (id) { return S().estates.indexOf(id) >= 0; };
E.value = function (now) { var v = 0; S().estates.forEach(function (id) { v += E.price(BY[id], now); }); return v; };
E.rentHour = function (now) {
  var h = 0; S().estates.forEach(function (id) { h += E.rent(BY[id], now); });
  return h * (BE.yachtBonus ? 1 + BE.yachtBonus() : 1);
};
BE.parts.push({ id: 'estate', cat: 'real', worth: function (n) { return E.value(n); }, hour: function (n) { return E.rentHour(n); } });

var artCache = {};
function art(a) { return artCache[a.id] || (artCache[a.id] = BE.art.house(a.type.art, a.color, a.id).replace('xMidYMid meet', 'xMidYMid slice')); }

BE.act.estBuy = function (d) {
  var a = BY[d.id], p = E.price(a);
  if (E.owns(a.id)) return false;
  if (!BE.spend(p)) { BE.toast('Nicht genug Geld', true); return false; }
  S().estates.push(a.id); BE.stat('buys'); BE.buzz(14); BE.toast(a.name + ' in ' + a.city.split(',')[0] + ' gekauft!');
};
BE.act.estSell = function (d) {
  var a = BY[d.id], got = Math.round(E.price(a) * (1 - SELL_FEE));
  BE.ask('Immobilie verkaufen?', a.name + ' in ' + a.city + ' bringt dir ' + BE.fmt(got) + ' (6 % Verkaufskosten).', 'Verkaufen', function () {
    var i = S().estates.indexOf(a.id); if (i < 0) return;
    S().estates.splice(i, 1); BE.add(got); BE.toast('Verkauft für ' + BE.fmt(got)); BE.dirtyCalc(); BE.refresh(); BE.save();
  }, true);
  return false;
};
BE.act.estSort = function (d) { BE.ui.estSort = d.k; };

function card(a, mine) {
  var p = E.price(a), rent = E.rent(a) * (BE.yachtBonus ? 1 + BE.yachtBonus() : 1) * BE.global(), c = BE.market.change(a, BE.now(), 86400000);
  return '<div class="offer"><div class="pic">' + art(a) + '<div class="tag"><div><div class="nm">' + a.name + '</div><div style="font-size:12.5px;opacity:.9">📍 ' + a.city + '</div></div><div class="pr">' + BE.fmt(p) + '</div></div></div>' +
    '<div class="bd"><div class="perk">Miete <b>+' + BE.fmt(rent) + ' / Std.</b><br>Wert 24 Std.: <span class="' + (c.pct >= 0 ? 'good' : 'bad') + '">' + BE.pct(c.pct) + '</span></div>' +
    (mine ? '<button class="btn sm ghost" data-act="estSell" data-id="' + a.id + '">Verkaufen</button>'
      : '<button class="btn ' + (S().money >= p ? 'good' : 'off') + '" data-act="estBuy" data-id="' + a.id + '">Kaufen</button>') + '</div></div>';
}
BE.views.estMarket = {
  title: 'Immobilienmarkt',
  render: function () {
    var k = BE.ui.estSort || 'hi', arr = LIST.filter(function (a) { return !E.owns(a.id); });
    arr.sort(function (a, b) { return k === 'hi' ? E.price(b) - E.price(a) : E.price(a) - E.price(b); });
    return '<div class="chips"><button class="' + (k === 'hi' ? 'on' : '') + '" data-act="estSort" data-k="hi">Teuerste zuerst</button><button class="' + (k === 'lo' ? 'on' : '') + '" data-act="estSort" data-k="lo">Günstigste zuerst</button></div>' +
      (arr.length ? arr.map(function (a) { return card(a, false); }).join('') : '<div class="empty"><div class="e">🏆</div>Du besitzt den ganzen Markt!</div>');
  }
};
BE.views.estMine = {
  title: 'Meine Immobilien',
  render: function () {
    var ids = S().estates, now = BE.now();
    var h = '<div class="card"><div class="row"><div><div class="lbl">Gesamtwert</div><div style="font-size:24px;font-weight:800">' + BE.fmt(E.value(now)) + '</div></div>' +
      '<div style="text-align:right"><div class="lbl">Mieten pro Stunde</div><div style="font-size:24px;font-weight:800" class="good">' + BE.fmt(E.rentHour(now) * BE.global()) + '</div></div></div></div>';
    if (!ids.length) return h + '<div class="empty"><div class="e">🏠</div>Du besitzt noch keine Immobilien.</div><button class="btn full" data-act="open" data-v="estMarket">Zum Immobilienmarkt</button>';
    return h + ids.map(function (id) { return card(BY[id], true); }).join('');
  }
};
BE.invest = BE.invest || {};
BE.invest.immo = function () {
  var now = BE.now();
  return '<div class="card" style="text-align:center;background:linear-gradient(180deg,#223a7a,#141b34)"><div class="big" style="font-size:36px">' + BE.fmt2(E.rentHour(now) * BE.global()) + '</div><div class="lbl">Mieteinnahmen pro Stunde</div></div>' +
    '<div class="cover tappable" data-act="open" data-v="estMarket" style="min-height:160px"><div class="bg">' + BE.art.house('villa', '#e8dcc0', 'cover1').replace('xMidYMid meet', 'xMidYMid slice') + '</div><h4>Immobilienmarkt</h4><p>Kaufe Immobilien auf der ganzen Welt und erziele Mieteinnahmen!</p></div>' +
    '<div class="cover tappable" data-act="open" data-v="estMine" style="min-height:160px"><div class="bg">' + BE.art.house('beach', '#cfe8c8', 'cover2').replace('xMidYMid meet', 'xMidYMid slice') + '</div><h4>Meine Immobilie</h4><p>Liste meiner Immobilien · ' + S().estates.length + ' im Besitz</p></div>';
};
})();
