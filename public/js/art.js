/* Business Empire – selbstgezeichnete SVG-Grafiken (alles Eigenentwürfe mit Fantasienamen) */
(function () {
'use strict';
var BE = window.BE;
var A = BE.art = {};
var uidN = 0;
function uid() { return 'a' + (++uidN); }
function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
function shade(h, a) {
  var c = hex(h).map(function (v) { return Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a); });
  return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, v)).toString(16)).slice(-2); }).join('');
}
A.shade = shade;
function svg(vb, inner, extra) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" preserveAspectRatio="xMidYMid meet"' + (extra || '') + '>' + inner + '</svg>'; }
function lg(id, c1, c2, vert) {
  return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert === false ? 1 : 0) + '" y2="' + (vert === false ? 0 : 1) + '"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient>';
}

/* ================= AUTOS ================= */
var WIN = '<stop offset="0" stop-color="#9fd0ff"/><stop offset="1" stop-color="#1d2f55"/>';
var CARS = {
  mini: { body: 'M32 80 L32 64 Q34 56 46 54 L68 52 Q82 29 114 28 L150 28 Q172 29 184 50 L200 54 Q214 58 214 68 L214 80 Z',
    win: 'M80 51 Q90 34 114 33 L148 33 Q164 35 174 50 Z', pil: [[130, 33, 51]], w: [64, 182], r: 16, head: [210, 64], tail: [34, 64] },
  sedan: { body: 'M20 80 L22 64 Q24 57 40 55 L84 52 Q100 31 134 30 L164 31 Q186 35 196 52 L222 57 Q233 62 233 72 L233 80 Z',
    win: 'M92 52 Q104 36 134 35 L160 36 Q176 40 186 52 Z', pil: [[138, 35, 52]], w: [58, 190], r: 16.5, head: [229, 66], tail: [22, 66] },
  suv: { body: 'M24 82 L24 62 Q26 54 40 52 L62 50 L70 31 Q74 26 84 26 L168 26 Q178 26 184 35 L198 52 L220 56 Q230 60 230 70 L230 82 Z',
    win: 'M78 49 L85 32 L120 32 L120 49 Z M126 49 L126 32 L165 32 L177 49 Z', pil: [], w: [60, 192], r: 19, head: [226, 66], tail: [26, 66] },
  coupe: { body: 'M14 80 L18 66 Q24 59 44 57 L90 53 Q110 36 142 34 Q164 35 178 48 L214 56 Q234 60 234 72 L234 80 Z',
    win: 'M104 53 Q118 40 142 39 Q158 40 169 49 Z', pil: [[140, 39, 53]], w: [56, 192], r: 17, head: [230, 66], tail: [16, 68] },
  conv: { body: 'M14 80 L18 66 Q26 60 50 58 L96 56 L136 54 L148 42 L156 42 L178 54 L214 58 Q234 62 234 72 L234 80 Z',
    win: 'M138 54 L149 41 L155 41 L169 54 Z', pil: [], w: [56, 192], r: 17, head: [230, 68], tail: [16, 69],
    extra: '<path d="M96 56 Q100 44 112 44 Q124 44 126 56 Z" fill="#2a1d1a"/><path d="M60 56 Q64 46 74 46 Q84 46 86 56 Z" fill="#2a1d1a"/><circle cx="108" cy="42" r="5" fill="#e8c9a0"/>' },
  hyper: { body: 'M12 82 L16 70 Q40 64 80 60 L120 46 Q142 40 172 46 L224 64 Q238 68 238 76 L238 82 Z',
    win: 'M122 58 L136 46 Q150 44 166 50 L182 60 Z', pil: [], w: [58, 194], r: 17, head: [234, 70], tail: [14, 72],
    back: '<path d="M10 54 L46 50 L46 55 L10 59 Z" fill="#12151f"/><rect x="26" y="55" width="3" height="14" fill="#12151f"/><rect x="40" y="55" width="3" height="12" fill="#12151f"/>',
    extra: '<path d="M96 70 L118 64 L128 70 Z" fill="rgba(0,0,0,.35)"/>' },
  retro: { body: 'M22 82 Q16 68 28 62 L56 58 Q68 38 104 36 L140 36 Q164 38 174 56 L204 60 Q226 64 226 78 L226 82 Z',
    win: 'M78 56 Q88 42 108 40 L138 40 Q154 42 160 56 Z', pil: [[124, 40, 56]], w: [58, 184], r: 17, head: [222, 68], tail: [24, 68], white: true,
    extra: '<rect x="16" y="76" width="22" height="5" rx="2.5" fill="#e9edf7"/><rect x="214" y="76" width="18" height="5" rx="2.5" fill="#e9edf7"/>' },
  van: { body: 'M22 82 L22 40 Q22 30 34 30 L150 30 Q168 30 178 46 L196 58 L222 62 Q232 66 232 74 L232 82 Z',
    win: 'M34 38 L34 54 L70 54 L70 38 Z M78 38 L78 54 L114 54 L114 38 Z M124 38 L124 54 L158 54 L168 54 L158 38 Z', pil: [], w: [58, 190], r: 17, head: [228, 70], tail: [24, 70] }
};
A.car = function (kind, color, o) {
  o = o || {}; var K = CARS[kind] || CARS.sedan, g = uid(), gw = uid(), c = color || '#d33';
  var wy = 80 - K.r * 0.25 + 3;
  var s = '<defs>' + lg(g, shade(c, .32), shade(c, -.32)) + '<linearGradient id="' + gw + '" x1="0" y1="0" x2="0" y2="1">' + WIN + '</linearGradient></defs>';
  s += '<ellipse cx="124" cy="96" rx="104" ry="6.5" fill="rgba(0,0,0,.4)"/>';
  if (K.back) s += K.back;
  s += '<path d="' + K.body + '" fill="url(#' + g + ')"/>';
  if (K.extra && kind !== 'retro') s += K.extra;
  s += '<path d="' + K.win + '" fill="url(#' + gw + ')"/>';
  (K.pil || []).forEach(function (p) { s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[0] + '" y2="' + p[2] + '" stroke="' + shade(c, -.3) + '" stroke-width="3"/>'; });
  s += '<path d="' + K.body + '" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.3"/>';
  s += '<path d="M' + (K.w[0] + 24) + ' ' + (wy - 4) + ' L' + (K.w[1] - 24) + ' ' + (wy - 4) + '" stroke="rgba(0,0,0,.22)" stroke-width="2"/>';
  if (kind === 'retro' && K.extra) s += K.extra;
  s += '<ellipse cx="' + K.head[0] + '" cy="' + K.head[1] + '" rx="5" ry="3.4" fill="#fff6c8"/><ellipse cx="' + K.tail[0] + '" cy="' + K.tail[1] + '" rx="3.6" ry="3" fill="#ff3b3b"/>';
  K.w.forEach(function (x) {
    var r = K.r;
    s += '<circle cx="' + x + '" cy="' + wy + '" r="' + (r + 4) + '" fill="#0c0f18"/>';
    s += '<circle cx="' + x + '" cy="' + wy + '" r="' + r + '" fill="#161923"/>';
    s += '<circle cx="' + x + '" cy="' + wy + '" r="' + (r * .64) + '" fill="' + (K.white ? '#f3f5fb' : '#cfd5e6') + '" stroke="#7d86a3" stroke-width="1.4"/>';
    for (var i = 0; i < 5; i++) {
      var a = i * 72 * Math.PI / 180;
      s += '<line x1="' + x + '" y1="' + wy + '" x2="' + (x + Math.cos(a) * r * .6).toFixed(1) + '" y2="' + (wy + Math.sin(a) * r * .6).toFixed(1) + '" stroke="#7d86a3" stroke-width="1.6"/>';
    }
    s += '<circle cx="' + x + '" cy="' + wy + '" r="' + (r * .16) + '" fill="#4a5068"/>';
  });
  return svg('0 0 240 110', s);
};

/* ================= FLUGZEUGE ================= */
function sky(id, a, b) { return '<rect width="260" height="130" fill="url(#' + id + ')"/>'; }
var PLANES = {
  prop: function (c, t) {
    return '<path d="M44 66 L22 30 L46 30 L72 60 Z" fill="' + t + '"/><path d="M40 68 L14 72 L58 74 Z" fill="' + t + '"/>' +
      '<path d="M96 70 L80 102 L122 102 L138 72 Z" fill="' + shade(c, -.25) + '"/>' +
      '<path d="M26 66 Q28 56 62 54 L176 50 Q214 50 226 60 Q230 66 216 74 L64 76 Q30 76 26 66 Z" fill="' + c + '"/>' +
      '<path d="M26 66 Q28 56 62 54 L176 50 Q214 50 226 60 Q230 66 216 74 L64 76 Q30 76 26 66 Z" fill="none" stroke="rgba(255,255,255,.35)"/>' +
      '<path d="M118 55 L172 52 L184 64 L120 66 Z" fill="#14233f"/><path d="M122 56 L150 54 L146 61 L121 62 Z" fill="rgba(160,210,255,.45)"/>' +
      '<rect x="60" y="64" width="150" height="4" fill="' + t + '"/>' +
      '<rect x="228" y="34" width="5" height="62" rx="2.5" fill="rgba(30,30,40,.55)"/><circle cx="226" cy="64" r="6" fill="' + t + '"/>' +
      '<line x1="150" y1="76" x2="150" y2="94" stroke="#222" stroke-width="3"/><circle cx="150" cy="97" r="6" fill="#111"/><line x1="86" y1="76" x2="90" y2="94" stroke="#222" stroke-width="3"/><circle cx="90" cy="97" r="6" fill="#111"/>';
  },
  twin: function (c, t) {
    return PLANES.prop(c, t) +
      '<rect x="88" y="78" width="46" height="14" rx="7" fill="' + shade(c, -.3) + '"/><rect x="188" y="78" width="4" height="0"/><rect x="132" y="82" width="6" height="30" rx="3" fill="rgba(30,30,40,.5)"/>' +
      '<ellipse cx="205" cy="86" rx="3" ry="26" fill="rgba(30,30,40,.4)"/>';
  },
  jet: function (c, t) {
    return '<path d="M44 62 L24 22 L48 22 L82 56 Z" fill="' + t + '"/><path d="M26 22 L10 18 L52 24 Z" fill="' + t + '"/>' +
      '<path d="M130 72 L88 108 L112 108 L176 74 Z" fill="' + shade(c, -.28) + '"/>' +
      '<path d="M12 64 Q48 56 140 54 Q214 54 244 68 Q214 78 140 78 Q48 76 12 68 Z" fill="' + c + '"/>' +
      '<path d="M12 64 Q48 56 140 54 Q214 54 244 68 Q214 78 140 78 Q48 76 12 68 Z" fill="none" stroke="rgba(255,255,255,.4)"/>' +
      '<path d="M196 58 Q216 58 232 66 L200 68 Z" fill="#14233f"/>' +
      '<g fill="#14233f">' + [100, 112, 124, 136, 148, 160, 172].map(function (x) { return '<rect x="' + x + '" y="62" width="6" height="6" rx="2"/>'; }).join('') + '</g>' +
      '<rect x="50" y="68" width="170" height="3" fill="' + t + '"/>' +
      '<rect x="58" y="52" width="34" height="14" rx="7" fill="' + shade(c, -.2) + '"/><ellipse cx="60" cy="59" rx="4" ry="6" fill="#222"/>';
  },
  heli: function (c, t) {
    return '<path d="M58 68 L22 58 L22 50 L62 58 Z" fill="' + c + '"/><path d="M24 62 L14 36 L24 36 L32 58 Z" fill="' + t + '"/><ellipse cx="22" cy="46" rx="2" ry="14" fill="rgba(30,30,40,.5)"/>' +
      '<path d="M54 74 Q50 52 96 46 L172 46 Q216 50 218 80 Q216 94 180 94 L80 94 Q56 92 54 74 Z" fill="' + c + '"/>' +
      '<path d="M150 50 Q200 52 210 78 L150 78 Z" fill="#14233f"/><path d="M158 54 Q190 56 198 70 L160 70 Z" fill="rgba(160,210,255,.4)"/>' +
      '<rect x="70" y="64" width="30" height="14" rx="3" fill="#14233f"/><rect x="104" y="64" width="30" height="14" rx="3" fill="#14233f"/>' +
      '<rect x="76" y="82" width="110" height="4" fill="' + t + '"/>' +
      '<rect x="112" y="36" width="12" height="12" fill="#333"/><rect x="26" y="40" width="200" height="4" rx="2" fill="rgba(30,30,40,.7)"/><ellipse cx="126" cy="42" rx="110" ry="4" fill="rgba(30,30,40,.15)"/>' +
      '<line x1="86" y1="94" x2="80" y2="108" stroke="#222" stroke-width="3"/><line x1="170" y1="94" x2="176" y2="108" stroke="#222" stroke-width="3"/><rect x="62" y="106" width="130" height="5" rx="2.5" fill="#222"/>';
  },
  airliner: function (c, t) {
    return '<path d="M42 62 L18 14 L46 14 L84 54 Z" fill="' + t + '"/><path d="M30 14 L8 12 L54 16 Z" fill="' + shade(c, -.2) + '"/>' +
      '<path d="M140 72 L70 112 L102 112 L196 76 Z" fill="' + shade(c, -.25) + '"/>' +
      '<path d="M8 62 Q30 50 80 50 L180 50 Q236 50 252 66 Q236 80 180 80 L80 80 Q30 78 8 66 Z" fill="' + c + '"/>' +
      '<path d="M8 62 Q30 50 80 50 L180 50 Q236 50 252 66 Q236 80 180 80 L80 80 Q30 78 8 66 Z" fill="none" stroke="rgba(255,255,255,.4)"/>' +
      '<path d="M216 55 Q236 56 246 64 L214 64 Z" fill="#14233f"/>' +
      '<g fill="#14233f">' + [60, 72, 84, 96, 108, 120, 132, 144, 156, 168, 180, 192].map(function (x) { return '<rect x="' + x + '" y="61" width="5" height="5" rx="2"/>'; }).join('') + '</g>' +
      '<rect x="24" y="70" width="210" height="4" fill="' + t + '"/>' +
      '<rect x="112" y="76" width="40" height="16" rx="8" fill="' + shade(c, -.32) + '"/><ellipse cx="114" cy="84" rx="4" ry="8" fill="#222"/>';
  },
  sea: function (c, t) {
    return PLANES.prop(c, t).replace(/<line x1="150"[^>]*>.*?<circle cx="90" cy="97" r="6" fill="#111"\/>/, '') +
      '<rect x="66" y="98" width="92" height="9" rx="4.5" fill="' + shade(c, -.3) + '"/><rect x="170" y="98" width="38" height="9" rx="4.5" fill="' + shade(c, -.3) + '"/>' +
      '<line x1="96" y1="76" x2="98" y2="98" stroke="#555" stroke-width="3"/><line x1="140" y1="76" x2="138" y2="98" stroke="#555" stroke-width="3"/><line x1="190" y1="74" x2="190" y2="98" stroke="#555" stroke-width="3"/>';
  },
  super: function (c, t) {
    return '<path d="M42 64 L26 28 L52 28 L84 60 Z" fill="' + t + '"/>' +
      '<path d="M170 70 L56 108 L104 108 L212 72 Z" fill="' + shade(c, -.28) + '"/>' +
      '<path d="M10 70 L150 58 Q214 56 254 70 Q214 76 150 78 L10 74 Z" fill="' + c + '"/>' +
      '<path d="M10 70 L150 58 Q214 56 254 70 Q214 76 150 78 L10 74 Z" fill="none" stroke="rgba(255,255,255,.45)"/>' +
      '<path d="M170 60 Q196 59 214 65 L176 68 Z" fill="#14233f"/>' +
      '<path d="M8 66 L2 62 L22 68 Z" fill="#ffb347"/><path d="M8 74 L0 78 L22 72 Z" fill="#ff7a2d"/>';
  }
};
A.plane = function (kind, color, trim) {
  var g = uid(), c = color || '#eef2ff', t = trim || '#2f6bff';
  var fn = PLANES[kind] || PLANES.jet;
  return svg('0 0 260 124', '<defs>' + lg(g, '#4a8dff', '#cfe6ff') + '</defs><rect width="260" height="124" fill="url(#' + g + ')"/>' +
    '<ellipse cx="60" cy="26" rx="30" ry="9" fill="rgba(255,255,255,.55)"/><ellipse cx="84" cy="20" rx="20" ry="8" fill="rgba(255,255,255,.55)"/><ellipse cx="214" cy="104" rx="36" ry="9" fill="rgba(255,255,255,.4)"/>' +
    fn(c, t));
};

/* ================= YACHTEN ================= */
function waves(y, id, c1, c2) {
  var p = 'M0 ' + y;
  for (var x = 0; x < 320; x += 40) p += ' q10 -6 20 0 t20 0';
  p += ' L320 140 L0 140 Z';
  return '<path d="' + p + '" fill="url(#' + id + ')"/><path d="' + p.replace(/L320 140 L0 140 Z/, '') + '" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>';
}
var YACHTS = {
  motor: function (c) {
    return '<path d="M14 80 L282 80 Q262 104 222 106 L52 106 Q26 102 14 80 Z" fill="' + shade(c, -.35) + '"/><path d="M14 80 L282 80 L276 88 L20 88 Z" fill="' + c + '"/>' +
      '<path d="M56 80 L66 60 L226 60 L250 80 Z" fill="#f4f6fb"/><path d="M92 60 L100 42 L198 42 L214 60 Z" fill="#fff"/><path d="M122 42 L128 28 L174 28 L180 42 Z" fill="#f4f6fb"/>' +
      '<g fill="#1d2f55">' + [74, 94, 114, 134, 154, 174, 194].map(function (x) { return '<rect x="' + x + '" y="66" width="14" height="8" rx="2"/>'; }).join('') + '</g>' +
      '<g fill="#1d2f55">' + [110, 130, 150, 170].map(function (x) { return '<rect x="' + x + '" y="47" width="14" height="7" rx="2"/>'; }).join('') + '</g>' +
      '<rect x="130" y="32" width="38" height="6" rx="2" fill="#1d2f55"/><line x1="152" y1="28" x2="152" y2="10" stroke="#ccc" stroke-width="2"/><circle cx="152" cy="9" r="3" fill="#ccc"/>';
  },
  sail: function (c) {
    return '<path d="M60 84 L250 84 Q232 104 200 106 L96 106 Q70 102 60 84 Z" fill="' + shade(c, -.2) + '"/><path d="M60 84 L250 84 L246 90 L64 90 Z" fill="#fff"/>' +
      '<rect x="150" y="14" width="3" height="72" fill="#cfd3dd"/>' +
      '<path d="M146 20 Q96 56 78 82 L146 82 Z" fill="#fff"/><path d="M156 18 Q196 50 222 82 L156 82 Z" fill="#f2f4fa"/><path d="M150 14 L190 82 L156 82 Z" fill="rgba(79,140,255,.18)"/>' +
      '<path d="M146 20 L146 82" stroke="#cfd3dd" stroke-width="1"/>' +
      '<rect x="120" y="76" width="34" height="8" rx="3" fill="' + c + '"/>';
  },
  mega: function (c) {
    return '<path d="M6 76 L296 76 Q274 106 230 108 L40 108 Q16 102 6 76 Z" fill="' + shade(c, -.4) + '"/><path d="M6 76 L296 76 L290 86 L12 86 Z" fill="' + c + '"/>' +
      '<path d="M30 76 L42 58 L252 58 L272 76 Z" fill="#fff"/><path d="M52 58 L62 40 L226 40 L244 58 Z" fill="#f4f6fb"/><path d="M76 40 L86 24 L190 24 L204 40 Z" fill="#fff"/><path d="M108 24 L116 10 L160 10 L168 24 Z" fill="#f4f6fb"/>' +
      '<g fill="#1d2f55">' + [50, 68, 86, 104, 122, 140, 158, 176, 194, 212, 230].map(function (x) { return '<rect x="' + x + '" y="63" width="12" height="7" rx="2"/>'; }).join('') + '</g>' +
      '<g fill="#1d2f55">' + [70, 88, 106, 124, 142, 160, 178, 196].map(function (x) { return '<rect x="' + x + '" y="45" width="12" height="7" rx="2"/>'; }).join('') + '</g>' +
      '<g fill="#1d2f55">' + [92, 110, 128, 146, 164].map(function (x) { return '<rect x="' + x + '" y="29" width="12" height="6" rx="2"/>'; }).join('') + '</g>' +
      '<circle cx="48" cy="52" r="15" fill="#2a8f6d"/><circle cx="48" cy="52" r="11" fill="none" stroke="#fff" stroke-width="2"/><text x="48" y="57" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="Arial">H</text>' +
      '<line x1="138" y1="10" x2="138" y2="-2" stroke="#ccc" stroke-width="2"/><rect x="236" y="66" width="30" height="9" rx="4" fill="#ff7a2d"/>';
  },
  cat: function (c) {
    return '<path d="M30 84 L130 84 Q122 104 100 106 L44 106 Q32 100 30 84 Z" fill="' + shade(c, -.3) + '"/><path d="M160 84 L270 84 Q262 104 240 106 L176 106 Q164 100 160 84 Z" fill="' + shade(c, -.3) + '"/>' +
      '<rect x="40" y="72" width="220" height="14" rx="4" fill="' + c + '"/><path d="M62 72 L74 48 L226 48 L246 72 Z" fill="#fff"/><path d="M100 48 L108 30 L198 30 L208 48 Z" fill="#f4f6fb"/>' +
      '<g fill="#1d2f55">' + [84, 106, 128, 150, 172, 194].map(function (x) { return '<rect x="' + x + '" y="54" width="14" height="9" rx="2"/>'; }).join('') + '</g>' +
      '<g fill="#1d2f55">' + [118, 140, 162].map(function (x) { return '<rect x="' + x + '" y="35" width="14" height="7" rx="2"/>'; }).join('') + '</g>';
  }
};
A.yacht = function (kind, color) {
  var g = uid(), w = uid(), c = color || '#1d3a8a', fn = YACHTS[kind] || YACHTS.motor;
  return svg('0 0 300 130', '<defs>' + lg(g, '#ffb88a', '#fde7c9') + lg(w, '#1c7fb3', '#0a3a63') + '</defs><rect width="300" height="130" fill="url(#' + g + ')"/>' +
    '<circle cx="236" cy="38" r="20" fill="#fff4cf" opacity=".9"/><rect y="84" width="300" height="46" fill="url(#' + w + ')"/>' + fn(c) + waves(100, w) +
    '<path d="M0 108 q20 -5 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 L300 130 L0 130 Z" fill="rgba(10,58,99,.55)"/>');
};

/* ================= INSELN ================= */
function palm(x, y, s, lean) {
  s = s || 1; lean = lean || 0;
  var top = [x + lean * 12 * s, y - 46 * s];
  return '<path d="M' + x + ' ' + y + ' Q' + (x + lean * 4 * s) + ' ' + (y - 26 * s) + ' ' + top[0] + ' ' + top[1] + '" stroke="#7a5a35" stroke-width="' + (3.2 * s) + '" fill="none" stroke-linecap="round"/>' +
    [[-24, -4], [-16, -14], [0, -18], [16, -14], [24, -4]].map(function (l) {
      return '<path d="M' + top[0] + ' ' + top[1] + ' Q' + (top[0] + l[0] * s * .6) + ' ' + (top[1] + l[1] * s - 8 * s) + ' ' + (top[0] + l[0] * s) + ' ' + (top[1] + (l[1] + 14) * s) + '" stroke="#2f9e5b" stroke-width="' + (5 * s) + '" fill="none" stroke-linecap="round"/>';
    }).join('');
}
function hut(x, y, c) {
  return '<path d="M' + (x - 11) + ' ' + y + ' L' + (x - 11) + ' ' + (y - 9) + ' L' + x + ' ' + (y - 19) + ' L' + (x + 11) + ' ' + (y - 9) + ' L' + (x + 11) + ' ' + y + ' Z" fill="' + (c || '#e8d5b5') + '"/><path d="M' + (x - 14) + ' ' + (y - 8) + ' L' + x + ' ' + (y - 22) + ' L' + (x + 14) + ' ' + (y - 8) + ' Z" fill="#a8663a"/>';
}
var ISLANDS = {
  palm: function () {
    return '<ellipse cx="150" cy="116" rx="112" ry="22" fill="#f1dfae"/><ellipse cx="150" cy="108" rx="96" ry="22" fill="#eed89b"/><path d="M62 108 Q150 62 238 108 Q150 124 62 108 Z" fill="#3fae6a"/><path d="M90 100 Q150 76 210 100 Q150 112 90 100 Z" fill="#53c27d"/>' +
      palm(112, 100, 1.2, -1) + palm(176, 98, 1.45, 1) + palm(206, 104, 1, 1) + hut(146, 106) + hut(166, 110, '#f6e7c8');
  },
  rock: function () {
    return '<path d="M30 124 L58 74 L84 86 L110 50 L146 76 L176 44 L214 82 L248 70 L272 124 Z" fill="#8a7d70"/><path d="M110 50 L146 76 L128 124 L90 124 Z" fill="#6d6256"/><path d="M176 44 L214 82 L200 124 L160 124 Z" fill="#6d6256"/>' +
      '<path d="M96 70 Q146 54 196 70 L210 82 Q146 70 84 82 Z" fill="#5fa86a"/><rect x="118" y="52" width="58" height="18" fill="#fff"/><rect x="104" y="58" width="22" height="12" fill="#f4f6fb"/><rect x="124" y="56" width="8" height="8" fill="#1d2f55"/><rect x="138" y="56" width="8" height="8" fill="#1d2f55"/><rect x="152" y="56" width="8" height="8" fill="#1d2f55"/><rect x="170" y="62" width="30" height="5" rx="2" fill="#60c3ff"/>';
  },
  atoll: function () {
    return '<ellipse cx="150" cy="104" rx="128" ry="40" fill="#f1dfae"/><ellipse cx="150" cy="104" rx="104" ry="30" fill="#3fd6c4"/><ellipse cx="150" cy="104" rx="84" ry="22" fill="#79eadc"/>' +
      '<path d="M68 82 Q150 60 232 82" stroke="#3fae6a" stroke-width="10" fill="none" stroke-linecap="round" opacity=".9"/>' + palm(60, 100, 1, 1) + palm(240, 100, 1, -1) + palm(150, 74, .9, 0) +
      [96, 124, 152, 180, 204].map(function (x, i) { return '<path d="M' + (x - 9) + ' ' + (110 + (i % 2) * 6) + ' L' + x + ' ' + (100 + (i % 2) * 6) + ' L' + (x + 9) + ' ' + (110 + (i % 2) * 6) + ' Z" fill="#a8663a"/><rect x="' + (x - 7) + '" y="' + (110 + (i % 2) * 6) + '" width="14" height="6" fill="#e8d5b5"/>'; }).join('');
  },
  volcano: function () {
    return '<ellipse cx="150" cy="124" rx="120" ry="16" fill="#3a3340"/><path d="M40 124 L120 48 L146 40 L176 48 L262 124 Z" fill="#4f4658"/><path d="M120 48 L146 40 L176 48 L150 58 Z" fill="#2a2430"/>' +
      '<path d="M146 44 Q140 70 128 124 L156 124 Q154 80 150 46 Z" fill="#ff7a2d"/><path d="M158 48 Q166 76 176 124 L190 124 Q176 78 164 48 Z" fill="#ff9d47" opacity=".8"/>' +
      '<circle cx="150" cy="28" r="12" fill="rgba(60,50,70,.55)"/><circle cx="162" cy="16" r="9" fill="rgba(60,50,70,.4)"/>' + palm(58, 120, .9, 1) + palm(250, 120, .9, -1);
  },
  forest: function () {
    var pine = function (x, y, s) { return '<path d="M' + x + ' ' + (y - 40 * s) + ' L' + (x - 12 * s) + ' ' + (y - 12 * s) + ' L' + (x - 6 * s) + ' ' + (y - 12 * s) + ' L' + (x - 16 * s) + ' ' + y + ' L' + (x + 16 * s) + ' ' + y + ' L' + (x + 6 * s) + ' ' + (y - 12 * s) + ' L' + (x + 12 * s) + ' ' + (y - 12 * s) + ' Z" fill="#2c7a4b"/>'; };
    return '<path d="M20 124 Q60 78 120 90 Q160 56 214 84 Q262 82 282 124 Z" fill="#6f8a73"/><path d="M40 124 Q90 92 140 100 Q190 80 250 124 Z" fill="#3f8f5a"/>' +
      pine(86, 112, 1.2) + pine(112, 106, 1) + pine(150, 100, 1.4) + pine(190, 104, 1.1) + pine(220, 110, 1.2) + '<path d="M120 84 L146 62 L172 84 Z" fill="#fff" opacity=".9"/>';
  },
  arch: function () {
    return ISLANDS.palm().replace(/translate/g, '') +
      '<ellipse cx="46" cy="118" rx="30" ry="9" fill="#f1dfae"/><path d="M22 116 Q46 98 70 116 Z" fill="#3fae6a"/>' + palm(46, 112, .7, 1) +
      '<ellipse cx="262" cy="124" rx="26" ry="8" fill="#f1dfae"/><path d="M240 122 Q262 106 284 122 Z" fill="#3fae6a"/>' + palm(262, 118, .6, -1);
  }
};
A.island = function (kind) {
  var s = uid(), w = uid();
  return svg('0 0 300 160', '<defs>' + lg(s, '#59b8ff', '#d7f1ff') + lg(w, '#19c3c8', '#0b6f94') + '</defs><rect width="300" height="160" fill="url(#' + s + ')"/>' +
    '<ellipse cx="70" cy="34" rx="34" ry="9" fill="rgba(255,255,255,.65)"/><ellipse cx="236" cy="24" rx="26" ry="7" fill="rgba(255,255,255,.55)"/>' +
    '<rect y="92" width="300" height="68" fill="url(#' + w + ')"/>' + (ISLANDS[kind] || ISLANDS.palm)() +
    '<path d="M0 134 q18 -6 36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 L300 160 L0 160 Z" fill="rgba(7,80,120,.5)"/>');
};

/* ================= HÄUSER ================= */
function win(x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + (c || '#ffe9a6') + '"/>'; }
var HOUSES = {
  garage: function (c) { return '<rect x="52" y="64" width="136" height="70" fill="' + c + '"/><path d="M44 66 L120 38 L196 66 Z" fill="' + shade(c, -.4) + '"/><rect x="72" y="84" width="96" height="50" rx="3" fill="#cdd3e4"/>' + [92, 102, 112, 122, 132, 142, 152].map(function (y, i) { return ''; }).join('') + [0, 1, 2, 3, 4].map(function (i) { return '<line x1="72" x2="168" y1="' + (94 + i * 9) + '" y2="' + (94 + i * 9) + '" stroke="#98a1bd" stroke-width="2"/>'; }).join(''); },
  tiny: function (c) { return '<path d="M70 134 L70 84 L120 44 L170 84 L170 134 Z" fill="' + c + '"/><path d="M60 88 L120 38 L180 88 L172 92 L120 50 L68 92 Z" fill="#3a3f55"/>' + win(88, 96, 22, 22) + '<rect x="124" y="98" width="26" height="36" rx="2" fill="#6b4a2f"/>' + '<rect x="178" y="70" width="8" height="26" fill="#6b4a2f"/>'; },
  flat: function (c) { return '<rect x="64" y="40" width="112" height="94" fill="' + c + '"/>' + [0, 1, 2, 3].map(function (r) { return [0, 1, 2].map(function (k) { return win(76 + k * 32, 50 + r * 21, 20, 13, r === 1 && k === 1 ? '#ffe9a6' : '#8fb4e8'); }).join(''); }).join('') + '<rect x="108" y="116" width="24" height="18" fill="#3a3f55"/>'; },
  row: function (c) { return [0, 1, 2].map(function (i) { var cc = [c, shade(c, .25), shade(c, -.2)][i], x = 36 + i * 56; return '<rect x="' + x + '" y="70" width="56" height="64" fill="' + cc + '"/><path d="M' + (x - 2) + ' 72 L' + (x + 28) + ' 44 L' + (x + 58) + ' 72 Z" fill="' + shade(cc, -.45) + '"/>' + win(x + 8, 82, 14, 14) + win(x + 34, 82, 14, 14) + '<rect x="' + (x + 20) + '" y="108" width="16" height="26" fill="#4a3426"/>'; }).join(''); },
  villa: function (c) { return '<rect x="40" y="78" width="160" height="56" fill="' + c + '"/><rect x="62" y="52" width="116" height="30" fill="' + shade(c, .15) + '"/><rect x="34" y="72" width="172" height="8" fill="#2d3248"/><rect x="56" y="46" width="128" height="8" fill="#2d3248"/>' + [0, 1, 2, 3].map(function (i) { return '<rect x="' + (52 + i * 36) + '" y="88" width="26" height="36" fill="#7fb7e8"/>'; }).join('') + '<rect x="76" y="60" width="88" height="16" fill="#7fb7e8"/><ellipse cx="170" cy="138" rx="46" ry="6" fill="#58c0e8"/>'; },
  penthouse: function (c) { return '<rect x="82" y="22" width="76" height="112" fill="' + c + '"/>' + [0, 1, 2, 3, 4, 5].map(function (r) { return win(90, 30 + r * 17, 60, 10, '#9ad0ff'); }).join('') + '<rect x="72" y="14" width="96" height="10" fill="#2d3248"/><ellipse cx="148" cy="12" rx="14" ry="5" fill="#58c0e8"/><rect x="108" y="116" width="24" height="18" fill="#3a3f55"/>'; },
  beach: function (c) { return '<path d="M0 118 Q120 100 240 118 L240 160 L0 160 Z" fill="#f1dfae"/><path d="M0 140 Q60 130 120 142 T240 138 L240 160 L0 160 Z" fill="#3fd6c4" opacity=".7"/><rect x="58" y="76" width="124" height="42" fill="' + c + '"/><path d="M50 78 L120 50 L190 78 Z" fill="#a8663a"/>' + win(70, 88, 24, 22, '#9ad0ff') + win(104, 88, 24, 22, '#9ad0ff') + win(138, 88, 24, 22, '#9ad0ff') + palm(34, 122, .9, 1) + palm(210, 122, .9, -1); },
  farm: function (c) { return '<rect x="60" y="78" width="90" height="56" fill="' + c + '"/><path d="M52 80 L105 46 L158 80 Z" fill="#8a3b2a"/>' + win(76, 92, 18, 18) + '<rect x="112" y="102" width="22" height="32" fill="#5a3a26"/><rect x="156" y="62" width="42" height="72" fill="#b04a3a"/><path d="M152 64 L177 40 L202 64 Z" fill="#7a2f22"/><rect x="167" y="88" width="20" height="46" fill="#f4e6d0"/><rect x="26" y="110" width="26" height="24" fill="#e0c36a"/>'; },
  castle: function (c) { return '<rect x="62" y="64" width="116" height="70" fill="' + c + '"/><rect x="42" y="40" width="34" height="94" fill="' + shade(c, -.1) + '"/><rect x="164" y="40" width="34" height="94" fill="' + shade(c, -.1) + '"/><rect x="100" y="28" width="40" height="40" fill="' + shade(c, .1) + '"/>' +
    [42, 56, 70].map(function (x) { return '<rect x="' + (x - 4) + '" y="32" width="8" height="10" fill="' + shade(c, -.1) + '"/>'; }).join('') + [166, 180, 190].map(function (x) { return '<rect x="' + x + '" y="32" width="8" height="10" fill="' + shade(c, -.1) + '"/>'; }).join('') +
    '<path d="M100 28 L120 8 L140 28 Z" fill="#7a2f3a"/><path d="M42 40 L59 18 L76 40 Z" fill="#7a2f3a"/><path d="M164 40 L181 18 L198 40 Z" fill="#7a2f3a"/><path d="M104 134 L104 110 Q120 92 136 110 L136 134 Z" fill="#3a2a22"/>' + win(52, 62, 12, 18) + win(176, 62, 12, 18) + win(112, 44, 16, 14); },
  sky: function (c) { return '<rect x="86" y="10" width="68" height="124" fill="' + c + '"/><rect x="108" y="2" width="24" height="10" fill="' + shade(c, -.2) + '"/>' + [0, 1, 2, 3, 4, 5, 6].map(function (r) { return win(92, 18 + r * 16, 56, 9, '#a9d6ff'); }).join('') + '<rect x="56" y="70" width="32" height="64" fill="' + shade(c, -.25) + '"/><rect x="152" y="60" width="32" height="74" fill="' + shade(c, -.25) + '"/>' + [0, 1, 2, 3].map(function (r) { return win(62, 78 + r * 14, 20, 7, '#cfe6ff') + win(158, 68 + r * 14, 20, 7, '#cfe6ff'); }).join('') + '<rect x="108" y="116" width="24" height="18" fill="#2d3248"/>'; },
  loft: function (c) { return '<rect x="40" y="58" width="160" height="76" fill="' + c + '"/><rect x="40" y="52" width="160" height="8" fill="#2d3248"/>' + [0, 1, 2, 3, 4].map(function (i) { return '<rect x="' + (50 + i * 30) + '" y="68" width="22" height="46" fill="#8fb4e8"/><line x1="' + (61 + i * 30) + '" x2="' + (61 + i * 30) + '" y1="68" y2="114" stroke="#2d3248" stroke-width="2"/>'; }).join('') + '<rect x="50" y="116" width="140" height="6" fill="#5a3a26"/>'; }
};
A.house = function (kind, color, seed) {
  var s = uid(), g = uid(), c = color || '#d9c7a8';
  var r = BE.rng(BE.hash(String(seed || kind)));
  var day = r() < .7;
  var sky1 = day ? '#69b7ff' : '#1d2656', sky2 = day ? '#d9efff' : '#6d5aa8';
  return svg('0 0 240 160', '<defs>' + lg(s, sky1, sky2) + lg(g, '#4aa564', '#2c6e46') + '</defs><rect width="240" height="160" fill="url(#' + s + ')"/>' +
    (day ? '<circle cx="' + (30 + r() * 40) + '" cy="30" r="14" fill="#fff4cf"/>' : '<circle cx="190" cy="28" r="12" fill="#fff4cf"/><circle cx="40" cy="26" r="1.5" fill="#fff"/><circle cx="70" cy="48" r="1.5" fill="#fff"/><circle cx="130" cy="20" r="1.5" fill="#fff"/>') +
    '<ellipse cx="60" cy="40" rx="24" ry="6" fill="rgba(255,255,255,.55)"/>' +
    '<rect y="132" width="240" height="28" fill="url(#' + g + ')"/>' + (HOUSES[kind] || HOUSES.villa)(c) +
    '<path d="M0 138 L240 138" stroke="rgba(0,0,0,.2)"/>');
};

/* ================= SAMMLUNGEN ================= */
A.coin = function (i) {
  var r = BE.rng(BE.hash('coin' + i)), g = uid();
  var metals = [['#e7c968', '#9a7418'], ['#dfe4f2', '#7c859e'], ['#d89a64', '#7b4521'], ['#f6e7a6', '#c79a22']];
  var m = metals[Math.min(3, Math.floor(i / 5))];
  var sym = ['★', '♛', '⚜', '✦', '❖', '☀', '⚓', '✿', '♞', '☘'][Math.floor(r() * 10)];
  return svg('0 0 80 80', '<defs><radialGradient id="' + g + '" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="' + m[0] + '"/><stop offset="1" stop-color="' + m[1] + '"/></radialGradient></defs>' +
    '<ellipse cx="40" cy="70" rx="26" ry="5" fill="rgba(0,0,0,.35)"/><circle cx="40" cy="38" r="30" fill="url(#' + g + ')"/><circle cx="40" cy="38" r="24" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/><circle cx="40" cy="38" r="27" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>' +
    '<text x="40" y="49" text-anchor="middle" font-size="30" font-family="Arial,sans-serif" fill="rgba(60,35,0,.65)">' + sym + '</text>');
};
A.painting = function (i) {
  var r = BE.rng(BE.hash('paint' + i)), g = uid();
  var pal = [['#ffb347', '#ff5e62', '#2c1b47'], ['#6dd5ed', '#2193b0', '#0f2027'], ['#f9d423', '#e65c00', '#3a1c71'], ['#a8e063', '#56ab2f', '#134e5e'], ['#fbc2eb', '#a18cd1', '#2b1055'], ['#ff9a9e', '#fad0c4', '#4b134f']][i % 6];
  var kind = i % 3, s = '';
  s += '<rect x="6" y="6" width="68" height="68" rx="3" fill="#8a6a2a"/><rect x="10" y="10" width="60" height="60" fill="#3b2a10"/><defs>' + lg(g, pal[0], pal[1]) + '</defs><rect x="13" y="13" width="54" height="54" fill="url(#' + g + ')"/>';
  if (kind === 0) s += '<circle cx="' + (30 + r() * 20) + '" cy="30" r="9" fill="' + pal[2] + '" opacity=".85"/><path d="M13 67 L13 52 Q30 38 44 52 Q56 42 67 54 L67 67 Z" fill="' + pal[2] + '"/>';
  else if (kind === 1) s += '<circle cx="40" cy="32" r="12" fill="' + pal[2] + '" opacity=".9"/><path d="M18 67 Q24 48 40 46 Q58 48 62 67 Z" fill="' + pal[2] + '"/>';
  else s += '<rect x="20" y="20" width="22" height="22" fill="' + pal[2] + '" opacity=".85"/><circle cx="52" cy="48" r="11" fill="#fff" opacity=".6"/><path d="M16 64 L36 40 L56 64 Z" fill="' + pal[2] + '" opacity=".7"/>';
  return svg('0 0 80 80', s + '<rect x="6" y="6" width="68" height="68" rx="3" fill="none" stroke="#e8c76a" stroke-width="2"/>');
};
A.unique = function (i) {
  var g = uid(), s = '';
  if (i === 0) s = '<defs>' + lg(g, '#a6f0ff', '#2b6cff') + '</defs><path d="M40 10 L64 28 L40 70 L16 28 Z" fill="url(#' + g + ')"/><path d="M16 28 L64 28 M28 10 L34 28 L40 70 M52 10 L46 28 L40 70" stroke="rgba(255,255,255,.7)" fill="none" stroke-width="1.4"/><path d="M28 10 L52 10 L64 28 L16 28 Z" fill="rgba(255,255,255,.35)"/>';
  else if (i === 1) s = '<defs>' + lg(g, '#fff0a0', '#d79a10') + '</defs><path d="M14 56 L10 26 L28 40 L40 16 L52 40 L70 26 L66 56 Z" fill="url(#' + g + ')"/><rect x="14" y="56" width="52" height="9" rx="2" fill="#b57a0c"/><circle cx="40" cy="30" r="4" fill="#ff3d5a"/><circle cx="22" cy="48" r="3" fill="#3dd1ff"/><circle cx="58" cy="48" r="3" fill="#3dff9a"/>';
  else if (i === 2) s = '<defs><radialGradient id="' + g + '" cx=".35" cy=".3"><stop offset="0" stop-color="#8b8fa3"/><stop offset="1" stop-color="#2a2d3a"/></radialGradient></defs><path d="M50 30 L72 8" stroke="#ff9d47" stroke-width="6" stroke-linecap="round" opacity=".8"/><circle cx="36" cy="46" r="24" fill="url(#' + g + ')"/><circle cx="28" cy="40" r="5" fill="rgba(0,0,0,.35)"/><circle cx="44" cy="54" r="4" fill="rgba(0,0,0,.35)"/>';
  else if (i === 3) s = '<defs>' + lg(g, '#fff4b0', '#e0a21a') + '</defs><ellipse cx="40" cy="70" rx="22" ry="5" fill="rgba(0,0,0,.35)"/><path d="M40 8 Q64 22 62 46 Q60 66 40 68 Q20 66 18 46 Q16 22 40 8 Z" fill="url(#' + g + ')"/><path d="M28 24 Q34 14 42 14" stroke="rgba(255,255,255,.7)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M24 44 L56 44" stroke="#b57a0c" stroke-width="2"/>';
  else s = '<defs>' + lg(g, '#e6c6ff', '#7b4fd6') + '</defs><circle cx="26" cy="26" r="14" fill="none" stroke="url(#' + g + ')" stroke-width="8"/><rect x="34" y="30" width="34" height="9" rx="3" fill="url(#' + g + ')" transform="rotate(35 34 30)"/><path d="M54 52 l7 7 M60 46 l7 7" stroke="#7b4fd6" stroke-width="6" stroke-linecap="round"/>';
  return svg('0 0 80 80', s);
};
A.crown = function (i) {
  var r = BE.rng(BE.hash('crown' + i)), g = uid(), kind = i % 3;
  var gem = ['#ff3d5a', '#3dd1ff', '#3dff9a', '#d36bff', '#ffd23d'][Math.floor(r() * 5)];
  var s = '<defs>' + lg(g, '#fff0a0', '#d79a10') + '</defs>';
  if (kind === 0) s += '<path d="M12 56 L8 24 L26 38 L40 14 L54 38 L72 24 L68 56 Z" fill="url(#' + g + ')"/><rect x="12" y="56" width="56" height="9" rx="2" fill="#b57a0c"/><circle cx="40" cy="32" r="5" fill="' + gem + '"/><circle cx="24" cy="48" r="3.4" fill="' + gem + '"/><circle cx="56" cy="48" r="3.4" fill="' + gem + '"/>';
  else if (kind === 1) s += '<circle cx="40" cy="48" r="20" fill="none" stroke="url(#' + g + ')" stroke-width="7"/><path d="M28 24 L40 8 L52 24 L40 36 Z" fill="' + gem + '"/><path d="M28 24 L52 24" stroke="rgba(255,255,255,.7)" stroke-width="1.4"/>';
  else s += '<path d="M14 18 Q40 74 66 18" fill="none" stroke="url(#' + g + ')" stroke-width="5" stroke-linecap="round"/>' + [20, 30, 40, 50, 60].map(function (x, k) { var y = 22 + Math.abs(k - 2) * -5 + 26 - Math.abs(2 - k) * 0; return ''; }).join('') + '<path d="M40 58 L30 46 L40 32 L50 46 Z" fill="' + gem + '"/>';
  return svg('0 0 80 80', s);
};
A.watch = function (i) {
  var r = BE.rng(BE.hash('watch' + i)), g = uid();
  var face = ['#10172e', '#f4f1e6', '#0d3b3f', '#3b0d1e', '#1c1c1c'][Math.floor(r() * 5)], bez = ['#e7c968', '#dfe4f2', '#c47a52'][i % 3];
  var dark = face === '#f4f1e6', hand = dark ? '#1a1a1a' : '#f4f1e6', h = Math.floor(r() * 12), m = Math.floor(r() * 60);
  var ha = (h * 30 + m / 2) * Math.PI / 180, ma = m * 6 * Math.PI / 180;
  return svg('0 0 80 80', '<defs>' + lg(g, shade(bez, .3), shade(bez, -.3)) + '</defs><rect x="30" y="2" width="20" height="76" rx="6" fill="#2a2d3a"/>' +
    '<circle cx="40" cy="40" r="26" fill="url(#' + g + ')"/><circle cx="40" cy="40" r="21" fill="' + face + '"/>' +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (k) { var a = k * 30 * Math.PI / 180; return '<line x1="' + (40 + Math.sin(a) * 17) + '" y1="' + (40 - Math.cos(a) * 17) + '" x2="' + (40 + Math.sin(a) * 19.5) + '" y2="' + (40 - Math.cos(a) * 19.5) + '" stroke="' + hand + '" stroke-width="1.6"/>'; }).join('') +
    '<line x1="40" y1="40" x2="' + (40 + Math.sin(ha) * 11) + '" y2="' + (40 - Math.cos(ha) * 11) + '" stroke="' + hand + '" stroke-width="3" stroke-linecap="round"/><line x1="40" y1="40" x2="' + (40 + Math.sin(ma) * 16) + '" y2="' + (40 - Math.cos(ma) * 16) + '" stroke="' + hand + '" stroke-width="2" stroke-linecap="round"/><circle cx="40" cy="40" r="2.4" fill="#ff5a5a"/>' +
    '<rect x="64" y="36" width="5" height="8" rx="2" fill="' + bez + '"/>');
};

/* ================= ICONS (Unternehmen / Aktien / Krypto) ================= */
var ICON = {
  basket: '<path d="M4 10h16l-1.6 9H5.6zM8 10l3-6M16 10l-3-6M9 14v2M12 14v2M15 14v2"/>',
  taxi: '<path d="M3 15l2-6h14l2 6v4H3zM8 9l1-3h6l1 3M6.5 18.5h.01M17.5 18.5h.01"/>',
  truck: '<path d="M2 7h11v9H2zM13 10h5l3 3v3h-8zM6 18.5h.01M17 18.5h.01"/>',
  factory: '<path d="M3 20V10l6 4v-4l6 4V6h3v14zM8 17h.01M12 17h.01M16 17h.01"/>',
  crane: '<path d="M6 21V5h10M6 9l10-4M14 5v8M14 13a2 2 0 1 0 0 4M4 21h14"/>',
  car: '<path d="M3 15l2-5h14l2 5v3H3zM6 10l1.5-3h9L18 10M7 17.5h.01M17 17.5h.01"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14"/>',
  hotel: '<path d="M3 20V8h18v12M3 14h18M7 11h3M14 11h3M10 20v-3h4v3"/>',
  rocket: '<path d="M12 3c3 2 5 5 5 9l-2 4H9l-2-4c0-4 2-7 5-9zM9 16l-3 4M15 16l3 4M12 9.5h.01"/>',
  bank: '<path d="M3 9l9-5 9 5M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
  cup: '<path d="M6 5h12l-1.5 15h-9zM8 10h8M12 3v2"/>',
  burger: '<path d="M4 11a8 8 0 0 1 16 0zM4 14h16M5 17h14a0 0 0 0 1 0 0 3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 3v4M12 3v4M15 3v4M9 17v4M12 17v4M15 17v4M3 9h4M3 12h4M3 15h4M17 9h4M17 12h4M17 15h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
  wheat: '<path d="M12 21V8M12 8c-3 0-4-2-4-4 3 0 4 2 4 4zM12 8c3 0 4-2 4-4-3 0-4 2-4 4zM12 14c-3 0-4-2-4-4 3 0 4 2 4 4zM12 14c3 0 4-2 4-4-3 0-4 2-4 4z"/>',
  cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  pad: '<path d="M6 8h12a3 3 0 0 1 3 3l-1 6a2.5 2.5 0 0 1-4 1l-2-2h-6l-2 2a2.5 2.5 0 0 1-4-1l-1-6a3 3 0 0 1 3-3zM8 11v3M6.5 12.5h3M16 12h.01M18 13.5h.01"/>',
  bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
  signal: '<path d="M5 19a10 10 0 0 1 0-14M8.500 16a6 6 0 0 1 0-8M12 12h.01M15.500 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/>',
  leaf: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"/>',
  hammer: '<path d="M14 4l6 6-3 3-6-6zM12 8L4 16l4 4 8-8"/>',
  dumbbell: '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',
  plane: '<path d="M10 14L3 11l1-2 8 1 5-6 2 1-3 7 4 3-1 2-5-1-3 5-2-1z"/>'
};
A.icon = function (name, color, bg, size) {
  var g = uid();
  return svg('0 0 48 48', '<defs>' + lg(g, shade(bg, .22), shade(bg, -.12)) + '</defs><circle cx="24" cy="24" r="24" fill="url(#' + g + ')"/><g transform="translate(9 9) scale(1.25)" fill="none" stroke="' + (color || '#fff') + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICON[name] || ICON.chip) + '</g>');
};
A.icons = ICON;
/* Krypto-Logo: Farbscheibe mit Symbol */
A.coinLogo = function (sym, c1, c2) {
  var g = uid();
  return svg('0 0 48 48', '<defs>' + lg(g, c1, c2) + '</defs><circle cx="24" cy="24" r="24" fill="url(#' + g + ')"/><circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/><text x="24" y="31" text-anchor="middle" font-size="20" font-weight="800" font-family="Arial,sans-serif" fill="#fff">' + sym + '</text>');
};
/* Hintergrundbild mit Farbverlauf (Cover) */
A.gradient = function (c1, c2, deco) {
  var g = uid();
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice"><defs>' + lg(g, c1, c2, false) + '</defs><rect width="300" height="150" fill="url(#' + g + ')"/>' + (deco || '') + '</svg>';
};
})();
