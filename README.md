# Business Empire

Idle-Tycoon fürs Handy im Browser: klicken, Firmen gründen, Aktien, Krypto, Immobilien, Autos, Flugzeuge, Yachten, Inseln und Sammlungen. Alles auf Deutsch, in Euro, ohne Werbung.

## Besonderheiten
- **Seed-Märkte:** Aktien-, Krypto- und Immobilienkurse sind reine Funktionen der Uhrzeit – alle Spieler sehen zur selben Zeit dieselben Kurse und Tagesnachrichten.
- **Weltrangliste:** Cloudflare Worker + Durable Object (SQLite), Spieler wählen nur einen Namen.
- **Grafiken:** komplett selbst gezeichnete SVGs (`public/js/art.js`), erfundene Namen.
- Kein Build-Schritt: statische Dateien in `public/`, Backend in `src/worker.js`.

## Entwickeln
```
npm install
npm run dev      # http://127.0.0.1:8787
npm run deploy   # manuell nach Cloudflare
```

## Automatisches Deployen (einmalig einrichten)
Variante A (empfohlen): Im Cloudflare-Dashboard unter *Workers & Pages → Create → Import a repository* dieses Repo verbinden. Danach wird bei jedem Push auf `main` automatisch deployt.

Variante B: In den GitHub-Repo-Secrets `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID` setzen – dann deployt `.github/workflows/deploy.yml`.
