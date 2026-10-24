// Business Empire – Worker: liefert die Rangliste über ein Durable Object.
// Die statischen Dateien (public/) liefert Cloudflare direkt aus (assets).
import { DurableObject } from "cloudflare:workers";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

function cleanName(v) {
  return String(v ?? "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);
}

export class Leaderboard extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      name TEXT NOT NULL,
      worth REAL NOT NULL,
      updated INTEGER NOT NULL
    )`);
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_worth ON players (worth DESC)");
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/score" && request.method === "POST") return this.score(request);
    if (url.pathname === "/api/top" && request.method === "GET") return this.top(url);
    return json({ error: "not found" }, 404);
  }

  async score(request) {
    let b;
    try { b = await request.json(); } catch { return json({ error: "bad json" }, 400); }
    const id = String(b.id ?? ""), token = String(b.token ?? ""), name = cleanName(b.name);
    let worth = Number(b.worth);
    if (!/^[a-z0-9]{8,40}$/.test(id) || token.length < 8 || token.length > 80) return json({ error: "bad id" }, 400);
    if (name.length < 2) return json({ error: "bad name" }, 400);
    if (!Number.isFinite(worth) || worth < 0) return json({ error: "bad worth" }, 400);
    worth = Math.min(worth, 1e18);

    const now = Date.now();
    const row = this.sql.exec("SELECT token, updated FROM players WHERE id = ?", id).toArray()[0];
    if (row) {
      if (row.token !== token) return json({ error: "forbidden" }, 403);
      if (now - row.updated < 5000) return json({ ok: true, t: now, skipped: true });
      this.sql.exec("UPDATE players SET name = ?, worth = ?, updated = ? WHERE id = ?", name, worth, now, id);
    } else {
      this.sql.exec("INSERT INTO players (id, token, name, worth, updated) VALUES (?, ?, ?, ?, ?)", id, token, name, worth, now);
    }
    // alte, inaktive Einträge gelegentlich aufräumen (90 Tage)
    if (Math.random() < 0.02) this.sql.exec("DELETE FROM players WHERE updated < ?", now - 90 * 86400000);
    return json({ ok: true, t: now });
  }

  top(url) {
    const me = url.searchParams.get("id") || "";
    const rows = this.sql.exec("SELECT id, name, worth FROM players ORDER BY worth DESC LIMIT 50").toArray();
    const total = this.sql.exec("SELECT COUNT(*) AS n FROM players").one().n;
    let mine = null;
    const m = me ? this.sql.exec("SELECT worth FROM players WHERE id = ?", me).toArray()[0] : null;
    if (m) {
      const rank = this.sql.exec("SELECT COUNT(*) AS n FROM players WHERE worth > ?", m.worth).one().n + 1;
      mine = { rank, worth: m.worth };
    }
    return json({
      t: Date.now(), total, me: mine,
      top: rows.map((r) => ({ name: r.name, worth: r.worth, me: r.id === me })),
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/time") return json({ t: Date.now() });
    if (url.pathname.startsWith("/api/")) {
      const stub = env.LEADERBOARD.get(env.LEADERBOARD.idFromName("global"));
      return stub.fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};
