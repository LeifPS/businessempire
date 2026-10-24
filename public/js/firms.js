/* Business Empire – Unternehmen: gründen, ausbauen, fusionieren, Boost */
(function () {
'use strict';
var BE = window.BE, S = function () { return BE.S; };
var MAX_FIRMS = 10, MAX_LV = 10, MAX_LV_FUSED = 12;

var TYPES = [
  { id: 'lemon', name: 'Limonadenstand', cost: 499, hour: 32, ico: 'cup', bg: '#f5a623' },
  { id: 'snack', name: 'Imbiss', cost: 1799, hour: 118, ico: 'burger', bg: '#ff7a45' },
  { id: 'shop', name: 'Geschäft', cost: 4899, hour: 300, ico: 'basket', bg: '#25c485' },
  { id: 'taxi', name: 'Taxiunternehmen', cost: 9999, hour: 650, ico: 'taxi', bg: '#f0b90b' },
  { id: 'ship', name: 'Reederei', cost: 19899, hour: 1350, ico: 'truck', bg: '#ef8a5a' },
  { id: 'fab', name: 'Fabrik', cost: 24999, hour: 1750, ico: 'factory', bg: '#3f7fbf' },
  { id: 'bau', name: 'Bauunternehmen', cost: 35400, hour: 2550, ico: 'crane', bg: '#e8455a' },
  { id: 'auto', name: 'Autohaus', cost: 40000, hour: 3000, ico: 'car', bg: '#4a5068' },
  { id: 'soft', name: 'Software-Studio', cost: 120000, hour: 9600, ico: 'code', bg: '#6a5cff' },
  { id: 'hotel', name: 'Hotelkette', cost: 400000, hour: 34000, ico: 'hotel', bg: '#2aa7b8' },
  { id: 'space', name: 'Raumfahrt', cost: 3500000, hour: 330000, ico: 'rocket', bg: '#8f7bff' },
  { id: 'bank', name: 'Großbank', cost: 18000000, hour: 1900000, ico: 'bank', bg: '#c9a227' }
];
var BY = {}; TYPES.forEach(function (t) { BY[t.id] = t; });
var F = BE.firms = { TYPES: TYPES, BY: BY, MAX: MAX_FIRMS, MAXLV: MAX_LV };

F.owned = function (tid) { return S().firms.filter(function (f) { return f.t === tid; }).length; };
F.price = function (t) { return Math.round(t.cost * Math.pow(1.15, F.owned(t.id))); };
F.lvFactor = function (f) { return (1 + 0.6 * (f.lv - 1)) * Math.pow(1.25, f.fu || 0); };
F.income = function (f) { return BY[f.t].hour * F.lvFactor(f); };
F.upCost = function (f) {
  var t = BY[f.t], disc = BE.planeDiscount ? BE.planeDiscount() : 0;
  return Math.round(t.cost * 0.55 * Math.pow(1.55, f.lv - 1) * (1 - disc));
};
F.baseHour = function () {
  var h = 0; S().firms.forEach(function (f) { h += F.income(f); });
  var m = (BE.carBonus ? 1 + BE.carBonus() : 1) * BE.mod('firm');
  if (S().boostUntil > Date.now()) m *= 1.3;
  return h * m;
};
F.boostCost = function () { return Math.max(500, Math.round(F.baseHour() / (S().boostUntil > Date.now() ? 1.3 : 1) * BE.global() * 1.5)); };

BE.parts.push({
  id: 'firm', cat: 'firm',
  worth: function () { var v = 0; S().firms.forEach(function (f) { v += f.inv; }); return v; },
  hour: function () { return F.baseHour(); }
});

function perkLine(t) { return '+' + BE.fmt(t.hour * BE.global()) + ' pro Stunde'; }

/* ---------- Aktionen ---------- */
BE.act.firmNew = function (d) {
  var t = BY[d.id], p = F.price(t);
  if (S().firms.length >= MAX_FIRMS) { BE.toast('Du hast bereits ' + MAX_FIRMS + ' Unternehmen. Verkaufe oder fusioniere eines.', true); return false; }
  BE.sheet('<div class="row" style="justify-content:flex-start;gap:14px;margin-bottom:12px"><div class="ico round" style="width:64px;height:64px">' + BE.art.icon(t.ico, '#fff', t.bg) + '</div>' +
    '<div><h4 style="margin:0">' + t.name + '</h4><div class="lbl">Level 1 · ' + perkLine(t) + '</div></div></div>' +
    '<p>Ausbau bis Level ' + MAX_LV + ' möglich (+60 % Einnahmen pro Level). Zwei gleiche Unternehmen kannst du später fusionieren.</p>' +
    '<div class="btns"><button class="btn ghost" data-act="closeSheet">Abbrechen</button><button class="btn good ' + (S().money >= p ? '' : 'off') + '" data-act="firmBuy" data-id="' + t.id + '">Gründen · ' + BE.fmt(p) + '</button></div>');
  return false;
};
BE.act.firmBuy = function (d) {
  var t = BY[d.id], p = F.price(t);
  if (S().firms.length >= MAX_FIRMS || !BE.spend(p)) { BE.toast('Nicht genug Geld', true); return; }
  S().firms.push({ t: t.id, lv: 1, fu: 0, inv: p });
  BE.stat('buys'); BE.buzz(12); BE.closeSheet(); BE.toast(t.name + ' gegründet!');
  if (BE.stack.length) BE.back();
};
BE.act.firmUp = function (d) {
  var f = S().firms[+d.i]; if (!f || f.lv >= MAX_LV) return false;
  var c = F.upCost(f);
  if (!BE.spend(c)) { BE.toast('Nicht genug Geld', true); return false; }
  f.lv++; f.inv += c; BE.stat('upg'); BE.buzz(10);
  BE.toast(BY[f.t].name + ' auf Level ' + f.lv);
};
BE.act.firmSell = function (d) {
  var f = S().firms[+d.i]; if (!f) return false;
  var back = Math.round(f.inv * 0.6);
  BE.ask('Unternehmen verkaufen?', BY[f.t].name + ' (Level ' + f.lv + ') bringt dir ' + BE.fmt(back) + ' (60 % der Investition).', 'Verkaufen', function () {
    var i = S().firms.indexOf(f); if (i < 0) return;
    S().firms.splice(i, 1); BE.add(back); BE.toast('Verkauft für ' + BE.fmt(back)); BE.dirtyCalc(); BE.refresh(); BE.save();
  }, true);
  return false;
};
BE.act.boost = function () {
  if (S().boostUntil > Date.now()) return false;
  var c = F.boostCost();
  if (!BE.spend(c)) { BE.toast('Nicht genug Geld für den Boost', true); return false; }
  S().boostUntil = Date.now() + 4 * 3600 * 1000; BE.toast('+30 % Unternehmenseinnahmen für 4 Std.'); BE.buzz(14);
};
BE.act.fuse = function (d) {
  var a = S().firms[+d.a], b = S().firms[+d.b]; if (!a || !b || a === b || a.t !== b.t) return false;
  var lv = Math.min(MAX_LV_FUSED, a.lv + b.lv), fu = Math.max(a.fu || 0, b.fu || 0) + 1, inv = a.inv + b.inv;
  S().firms = S().firms.filter(function (f) { return f !== a && f !== b; });
  S().firms.push({ t: a.t, lv: lv, fu: fu, inv: inv });
  BE.stat('fusions'); BE.buzz(20); BE.toast('Fusion! ' + BY[a.t].name + ' jetzt Level ' + lv);
};

/* ---------- Ansichten ---------- */
function firmRow(f, i) {
  var t = BY[f.t], maxed = f.lv >= MAX_LV, c = maxed ? 0 : F.upCost(f);
  return '<div class="card tight"><div class="biz row" style="gap:12px"><div class="ico round">' + BE.art.icon(t.ico, '#fff', t.bg) + '</div>' +
    '<div style="flex:1;min-width:0"><div style="font-weight:800">' + t.name + ' <span class="pill acc">Lv ' + f.lv + '</span>' + (f.fu ? ' <span class="pill gold">Fusion ×' + f.fu + '</span>' : '') + '</div>' +
    '<div class="lbl">+' + BE.fmt(F.income(f) * BE.global()) + ' / Std.</div></div></div>' +
    '<div class="row" style="margin-top:10px;gap:8px">' +
    '<button class="btn sm ghost" data-act="firmSell" data-i="' + i + '">Verkaufen</button>' +
    (maxed ? '<span class="pill gold">Maximal ausgebaut</span>' : '<button class="btn sm ' + (S().money >= c ? 'good' : 'off') + '" data-act="firmUp" data-i="' + i + '" style="flex:1">Ausbauen · ' + BE.fmt(c) + '</button>') + '</div></div>';
}
BE.tabs.firm = {
  title: 'Unternehmen', sub: 'Baue dein Imperium auf',
  render: function () {
    var s = S(), boost = s.boostUntil > Date.now(), n = s.firms.length;
    var h = '<div class="card"><div class="big" id="fIncome">' + BE.fmt(BE.calc().parts.firm * BE.calc().g) + '</div><div class="lbl good" style="font-weight:700">Einnahmen pro Stunde insgesamt</div>' +
      '<div class="row" style="margin-top:14px;gap:10px">' + (boost
        ? '<span class="pill good">⚡ Boost +30 % · noch ' + BE.dur(s.boostUntil - Date.now()) + '</span>'
        : '<button class="btn sm gold" data-act="boost" style="flex:1">⚡ Boost +30 % für 4 Std. · ' + BE.fmt(F.boostCost()) + '</button>') + '</div></div>' +
      '<div class="grid2" style="margin-bottom:14px"><button class="btn" data-act="open" data-v="newFirm" style="padding:16px 8px;white-space:normal">Gründe ein Unternehmen</button>' +
      '<button class="btn ghost" data-act="open" data-v="merge" style="padding:16px 8px;white-space:normal">Unternehmens­fusionen</button></div>' +
      '<h3>Meine Unternehmen <span class="more" style="color:var(--mut)">' + n + '/' + MAX_FIRMS + '</span></h3>';
    if (!n) h += '<div class="empty"><div class="e">🏢</div>Du besitzt noch keine Unternehmen.<br>Gründe dein erstes, es verdient auch, wenn du offline bist.</div>';
    else s.firms.forEach(function (f, i) { h += firmRow(f, i); });
    return h;
  }
};
BE.act.open = function (d) { BE.open(d.v, d.arg); return false; };

BE.views.newFirm = {
  title: 'Neues Unternehmen',
  render: function () {
    var h = '<p class="lbl" style="margin:4px 4px 14px">Wähle eine Geschäftskategorie. Der Preis steigt mit jedem Unternehmen derselben Art um 15 %. Platz: ' + S().firms.length + '/' + MAX_FIRMS + '</p><div class="grid2">';
    TYPES.forEach(function (t) {
      var p = F.price(t);
      h += '<div class="tile tappable" data-act="firmNew" data-id="' + t.id + '" style="text-align:left;padding:16px"><div class="ico round" style="width:54px;height:54px">' + BE.art.icon(t.ico, '#fff', t.bg) + '</div>' +
        '<div style="font-weight:800;margin-top:22px">' + t.name + '</div><div class="lbl ' + (S().money >= p ? 'good' : '') + '">Ab ' + BE.fmt(p) + '</div></div>';
    });
    return h + '</div>';
  }
};
BE.views.merge = {
  title: 'Fusionen',
  render: function () {
    var s = S(), groups = {};
    s.firms.forEach(function (f, i) { (groups[f.t] = groups[f.t] || []).push(i); });
    var h = '<div class="card"><b>So funktioniert es</b><div class="lbl" style="margin-top:6px;line-height:1.5">Zwei Unternehmen derselben Art verschmelzen zu einem. Die Levels addieren sich (bis Level ' + MAX_LV_FUSED + ') und der Konzern verdient zusätzlich <b class="good">+25 %</b>. Dazu wird ein Platz frei.</div></div>';
    var any = false;
    Object.keys(groups).forEach(function (tid) {
      var idx = groups[tid]; if (idx.length < 2) return;
      idx.sort(function (a, b) { return s.firms[a].lv - s.firms[b].lv; });
      var a = s.firms[idx[0]], b = s.firms[idx[1]], t = BY[tid], lv = Math.min(MAX_LV_FUSED, a.lv + b.lv);
      var before = F.income(a) + F.income(b), fu = Math.max(a.fu || 0, b.fu || 0) + 1;
      var after = t.hour * (1 + 0.6 * (lv - 1)) * Math.pow(1.25, fu);
      any = true;
      h += '<div class="card"><div class="row" style="justify-content:flex-start;gap:12px"><div class="ico round">' + BE.art.icon(t.ico, '#fff', t.bg) + '</div><div style="flex:1"><b>' + t.name + '</b><div class="lbl">Lv ' + a.lv + ' + Lv ' + b.lv + ' → <b>Lv ' + lv + '</b></div></div></div>' +
        '<div class="lbl" style="margin:10px 0">Einnahmen: ' + BE.fmt(before * BE.global()) + ' → <b class="' + (after >= before ? 'good' : 'bad') + '">' + BE.fmt(after * BE.global()) + ' / Std.</b></div>' +
        '<button class="btn full" data-act="fuse" data-a="' + idx[0] + '" data-b="' + idx[1] + '">Fusionieren</button></div>';
    });
    if (!any) h += '<div class="empty"><div class="e">🤝</div>Noch keine Fusion möglich.<br>Du brauchst zwei Unternehmen derselben Art.</div>';
    return h;
  }
};
})();
