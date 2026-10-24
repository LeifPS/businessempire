/* Business Empire – Seed-Markt: Kurse sind reine Funktionen der Zeit.
   Alle Spieler sehen zur selben Zeit exakt dieselben Kurse (ohne Server). */
(function () {
'use strict';
var BE = window.BE;
var SEASON = 's1';
/* Perioden (Minuten) und Gewichte der Rauschschichten: langsam → schnell */
var OCT = [[43200, .55], [7200, .38], [1440, .16], [360, .08], [90, .04], [20, .02], [5, .01], [1.5, .004]];

function lat(seed, i) {
  var h = (seed ^ Math.imul(i | 0, 0x9E3779B1)) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 2147483648 - 1;
}
function vnoise(seed, x) {
  var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  var a = lat(seed, i), b = lat(seed, i + 1);
  return a + (b - a) * u;
}
function smooth(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }

var SEED_MKT = BE.hash(SEASON + 'mkt'), SEED_MKT2 = BE.hash(SEASON + 'mkt2');
var assets = {};      // id → Asset
var list = [];
var evCache = {};

var M = BE.market = {
  /* Asset registrieren: {id,name,base,vol,beta,kind} */
  register: function (arr) {
    arr.forEach(function (a) {
      a.seed = BE.hash(SEASON + a.id);
      assets[a.id] = a; list.push(a);
    });
    evCache = {};
  },
  get: function (id) { return assets[id]; },

  /* Marktstimmung (−1 … +1), Zyklen von mehreren Tagen */
  sentiment: function (t) {
    var tm = t / 60000;
    return vnoise(SEED_MKT, tm / (10 * 1440)) * 0.34 + vnoise(SEED_MKT2, tm / (2.5 * 1440)) * 0.1;
  },
  mood: function (t) {
    var s = M.sentiment(t), tr = s - M.sentiment(t - 24 * 3600000);
    if (s > 0.16 || (s > 0.04 && tr > 0.02)) return { k: 'hype', label: 'Bullenmarkt', s: s, cls: 'good' };
    if (s < -0.16 || (s < -0.04 && tr < -0.02)) return { k: 'crash', label: 'Bärenmarkt', s: s, cls: 'bad' };
    return { k: 'flat', label: 'Seitwärts', s: s, cls: 'acc' };
  },

  /* Tagesereignisse aus dem Datums-Seed */
  dayEvents: function (d) {
    if (evCache[d]) return evCache[d];
    var r = BE.rng(BE.hash(SEASON + 'ev' + d)), evs = [];
    var stocks = list.filter(function (a) { return a.kind === 'stock'; });
    var coins = list.filter(function (a) { return a.kind === 'crypto'; });
    function pick(arr, n, big) {
      for (var i = 0; i < n && arr.length; i++) {
        var a = arr[Math.floor(r() * arr.length)];
        var sign = r() < 0.5 ? -1 : 1;
        var mag = sign * (big ? 0.07 + r() * 0.22 : 0.025 + r() * 0.075);
        evs.push({ id: a.id, name: a.name, kind: a.kind, mag: mag, start: d * 1440 + Math.floor(r() * 20 * 60), v: Math.floor(r() * 3) });
      }
    }
    pick(stocks, 2, false); pick(coins, 2, true);
    var map = {}; evs.forEach(function (e) { (map[e.id] = map[e.id] || []).push(e); });
    evCache[d] = { list: evs, map: map };
    return evCache[d];
  },
  evTerm: function (a, t) {
    var tm = t / 60000, d = Math.floor(t / 86400000), s = 0;
    for (var dd = d - 2; dd <= d; dd++) {
      var l = M.dayEvents(dd).map[a.id]; if (!l) continue;
      for (var i = 0; i < l.length; i++) {
        var e = l[i], x = tm - e.start; if (x <= 0) continue;
        var ramp = smooth(x / 40), decay = x < 720 ? 1 : Math.max(0, 1 - (x - 720) / 2160);
        s += e.mag * ramp * decay;
      }
    }
    return s;
  },
  logp: function (a, t) {
    var tm = t / 60000, v = 0;
    for (var k = 0; k < OCT.length; k++) v += vnoise(a.seed + k * 7919, tm / OCT[k][0]) * OCT[k][1];
    return v * a.vol + a.beta * M.sentiment(t) + M.evTerm(a, t);
  },
  price: function (a, t) { return a.base * Math.exp(M.logp(a, t)); },
  change: function (a, t, span) {
    var p0 = M.price(a, t - span), p1 = M.price(a, t);
    return { abs: p1 - p0, pct: (p1 / p0 - 1) * 100 };
  },
  series: function (a, t, span, n) {
    var out = [];
    for (var i = 0; i <= n; i++) out.push(M.price(a, t - span + span * i / n));
    return out;
  },

  /* Nachrichten der letzten Stunden */
  news: function (t) {
    var out = [], d = Math.floor(t / 86400000), tm = t / 60000;
    for (var dd = d; dd >= d - 1; dd--) {
      M.dayEvents(dd).list.forEach(function (e) {
        if (e.start <= tm) out.push({ at: e.start * 60000, text: M.headline(e), good: e.mag > 0, id: e.id });
      });
    }
    out.sort(function (a, b) { return b.at - a.at; });
    return out;
  },
  headline: function (e) {
    var pos = e.kind === 'stock'
      ? ['hat ein Rekordquartal hingelegt', 'gewinnt einen Großauftrag', 'wird von Analysten hochgestuft']
      : ['wird von Großinvestoren gekauft', 'sorgt für riesigen Hype', 'wird bei einer Börse gelistet'];
    var neg = e.kind === 'stock'
      ? ['steckt in einem Skandal', 'verfehlt die Prognose', 'muss Produkte zurückrufen']
      : ['wurde Ziel eines Hacks', 'droht Regulierung', 'erlebt einen Panikverkauf'];
    return e.name + ' ' + (e.mag > 0 ? pos : neg)[e.v];
  },
  /* Seed des Tages (Anzeige) */
  daySeed: function (t) {
    var d = new Date(t), k = d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate();
    return '#' + ('0000' + (BE.hash(SEASON + k) & 0xffff).toString(16)).slice(-4).toUpperCase();
  },
  /* Sparkline-Pfad (SVG) */
  spark: function (arr, w, h, up) {
    var mn = Math.min.apply(null, arr), mx = Math.max.apply(null, arr), rg = (mx - mn) || 1;
    var pts = arr.map(function (v, i) {
      return (i / (arr.length - 1) * w).toFixed(1) + ',' + (h - 3 - (v - mn) / rg * (h - 6)).toFixed(1);
    }).join(' ');
    var c = up ? 'var(--good)' : 'var(--bad)';
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><polyline points="' + pts + '" fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  },
  /* großes Diagramm */
  chart: function (arr, up, id) {
    var w = 340, h = 170, pad = 10;
    var mn = Math.min.apply(null, arr), mx = Math.max.apply(null, arr), rg = (mx - mn) || 1;
    var pts = arr.map(function (v, i) { return [pad + i / (arr.length - 1) * (w - 2 * pad), 14 + (1 - (v - mn) / rg) * (h - 34)]; });
    var line = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var area = 'M' + pts[0][0] + ',' + h + ' L' + line.replace(/ /g, ' L') + ' L' + pts[pts.length - 1][0] + ',' + h + ' Z';
    var c = up ? '#3ddc97' : '#ff6b6b', last = pts[pts.length - 1];
    var grid = [0.2, 0.5, 0.8].map(function (f) { return '<line x1="0" x2="' + w + '" y1="' + (h * f).toFixed(0) + '" y2="' + (h * f).toFixed(0) + '" stroke="rgba(143,155,204,.12)"/>'; }).join('');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><defs><linearGradient id="cg' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '" stop-opacity=".35"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#cg' + id + ')"/><polyline points="' + line + '" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="4.5" fill="' + c + '"/></svg>';
  }
};
})();
