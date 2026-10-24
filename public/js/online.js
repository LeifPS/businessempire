/* Business Empire – Online-Rangliste (Cloudflare Worker + Durable Object) */
(function () {
'use strict';
var BE = window.BE, S = function () { return BE.S; };
var O = BE.online = { top: [], me: null, total: 0, state: 'idle', at: 0 };
var lastPost = 0, lastWorth = -1, posting = false;

function api(path, opt) {
  return fetch('/api/' + path, opt).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
}
function cleanName(v) {
  return String(v || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
}
O.postScore = function (force) {
  var p = S().player; if (!p.name || posting) return Promise.resolve();
  var w = BE.worth().total, now = Date.now();
  if (!force && (now - lastPost < 60000 || (w === lastWorth && now - lastPost < 300000))) return Promise.resolve();
  posting = true; lastPost = now;
  return api('score', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: p.id, token: p.token, name: p.name, worth: w }) })
    .then(function (r) { lastWorth = w; posting = false; if (r && r.t) BE.skew = r.t - Date.now(); return r; })
    .catch(function () { posting = false; });
};
O.load = function () {
  O.state = O.top.length ? O.state : 'loading';
  return api('top?id=' + encodeURIComponent(S().player.id)).then(function (r) {
    O.top = r.top || []; O.me = r.me || null; O.total = r.total || 0; O.state = 'ok'; O.at = Date.now();
    if (r.t) BE.skew = r.t - Date.now();
    if (BE.stack.length && BE.stack[BE.stack.length - 1].name === 'ranking') BE.refresh();
  }).catch(function () { O.state = 'error'; if (BE.stack.length && BE.stack[BE.stack.length - 1].name === 'ranking') BE.refresh(); });
};
BE.act.setName = function () {
  BE.askText('Dein Spielername', 'So erscheinst du in der Rangliste (2–16 Zeichen).', S().player.name, function (v) {
    v = cleanName(v);
    if (v.length < 2) { BE.toast('Der Name ist zu kurz', true); return; }
    S().player.name = v; BE.save(); BE.toast('Hallo ' + v + '!');
    O.postScore(true).then(function () { return O.load(); });
    BE.refresh();
  });
  return false;
};
BE.act.rankReload = function () { O.load(); BE.toast('Wird aktualisiert …'); return false; };

BE.onSecond.push(function () {
  O.postScore(false);
  if (BE.stack.length && BE.stack[BE.stack.length - 1].name === 'ranking' && Date.now() - O.at > 30000) O.load();
});

BE.views.ranking = {
  title: 'Rangliste',
  mount: function () { O.postScore(true).then(function () { O.load(); }); if (!S().player.name) O.load(); },
  render: function () {
    var p = S().player, h = '';
    h += '<div class="card"><div class="row"><div><div class="lbl">Dein Name</div><b style="font-size:18px">' + (p.name ? BE.esc(p.name) : '–') + '</b></div>' +
      '<button class="btn sm ' + (p.name ? 'ghost' : '') + '" data-act="setName">' + (p.name ? 'Ändern' : 'Namen wählen') + '</button></div>' +
      (p.name ? '<div class="lbl" style="margin-top:10px">Dein Vermögen: <b>' + BE.fmt(BE.worth().total) + '</b></div>' : '<div class="lbl" style="margin-top:10px">Wähle einen Namen, um in der weltweiten Rangliste zu erscheinen.</div>') + '</div>';
    if (O.state === 'error' && !O.top.length) return h + '<div class="empty"><div class="e">📡</div>Die Rangliste ist gerade nicht erreichbar.<br>Du kannst trotzdem weiterspielen.</div><button class="btn ghost full" data-act="rankReload">Erneut versuchen</button>';
    if (O.state === 'loading' && !O.top.length) return h + '<div class="empty"><div class="e">⏳</div>Rangliste wird geladen …</div>';
    if (!O.top.length) return h + '<div class="empty"><div class="e">🏆</div>Noch niemand in der Rangliste.<br>Sei der Erste!</div>';
    h += '<div class="row" style="margin:6px 4px 10px"><b>Reichste Spieler</b><span class="lbl">' + BE.nf0.format(O.total) + ' Spieler</span></div>';
    var inTop = false;
    h += O.top.map(function (r, i) {
      if (r.me) inTop = true;
      return '<div class="rank ' + (r.me ? 'me' : '') + '"><div class="pos">' + (i + 1) + '</div><div class="nm">' + BE.esc(r.name) + (r.me ? ' <span class="pill acc">Du</span>' : '') + '</div><div class="v">' + BE.fmtK(r.worth) + '</div></div>';
    }).join('');
    if (!inTop && O.me) h += '<div class="lbl" style="text-align:center;margin:10px 0">···</div><div class="rank me"><div class="pos" style="width:auto;padding:0 8px">' + BE.nf0.format(O.me.rank) + '</div><div class="nm">' + BE.esc(p.name) + ' <span class="pill acc">Du</span></div><div class="v">' + BE.fmtK(O.me.worth) + '</div></div>';
    return h + '<button class="btn ghost full" data-act="rankReload" style="margin-top:12px">Aktualisieren</button>';
  }
};
})();
