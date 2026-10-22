# AGENTS.md

Serverless Telegram Mini App event manager. No backend, no database: JSON files in `docs/` are the data layer, GitHub Pages serves them. UI text is Russian.

## Working rules (required by the owner)

- **Concept first.** Перед любой задачей сначала сверяйся с концепцией и архитектурой решения — `CONCEPT.md`. Решение не должно им противоречить; если задача конфликтует с концепцией — остановись и уточни у владельца.
- **Questions immediately.** Все возникающие вопросы задавай владельцу проекта сразу (инструментом `question`), не принимай самостоятельных решений по неоднозначным местам.
- Общение с владельцем — на русском языке.

## Packages

- `admin/` — React + Vite + Tailwind local admin panel (dev port 5173). Edits data in browser localStorage; can publish to GitHub via Contents API.
- `miniapp/` — React + Vite + Tailwind Telegram Mini App (dev port 5174). Reads JSON from GitHub Pages; caches to localStorage as fallback.
- `shared/` — `types.ts` with the schema for all three databases (`EventsDatabase`, `PlacesDatabase`, `OtherCitiesDatabase`), category enums/labels, and the scout report schema (`ScoutReport`). Not a workspace package.
- `docs/` — the "database": `events.json`, `places.json`, `other-cities.json`. Deployed as-is alongside the miniapp build.
- `reports/` — outputs of the event scout agent (see `CONCEPT.md` §2).

## Event scout pipeline

- Concept and data flow: `CONCEPT.md` (source of truth; check it before any task here).
- `scout.config.json` — sites (with `allEventsRelevant` flags), French theme keywords, city. Edit this to change what gets scanned.
- Custom agent `scout` — definition `.opencode/agents/scout.md` (canonical, in repo). Discovery quirk: a session started in the parent directory (`/Users/vvershin/tgAdmin`) does not see nested `.opencode` dirs, so **each** agent `.md` file needs its own symlink at `/Users/vvershin/tgAdmin/.opencode/agents/<name>.md` → `../../tgAdmin/.opencode/agents/<name>.md`.
- Do NOT add a `permissions` frontmatter block to agent definitions in this OpenCode build — it breaks all tool access for the agent (verified 2026-10-22). Restrict behavior via the agent's prompt.
- Run it with `opencode run --agent scout` from the repo root, or launch the `scout` subagent from a session.
- Report files `reports/scout-report-<date>.json` must match `ScoutReport` in `shared/types.ts`; if you change one, change the other.
- Admin has a 4th tab «Импорт отчета» (`ScoutImportTab`): uploads a scout report, edits/deletes rows (reuses `EventEditor`), and «Выгрузить в базу» merges rows into the events database via `admin/src/utils/scoutImport.ts`. Mapping: report `url` → `registrationUrl`; duplicate = same date + (same `registrationUrl` or same title); same url on a new date is a new series date, not a duplicate. Duplicate rows are filtered out at upload and never shown in the import table (skip count in the header); `mergeEvents` still dedupes at export as a safety net. Publishing stays on the events tab GitHub button.
- The same tab has «✨ В Telegram» (`admin/src/utils/telegram.ts`): builds the «la semaine française» digest for the current Mon–Sun week from checked rows (French day names, ✨ markers, HTML hyperlinks on titles, auto-split at 4096 chars) and sends it straight from the browser via the Bot API. Bot token + chat id live in localStorage `telegram_settings` (`TelegramSettingsModal`, opens on first click).

Root `package.json` declares workspaces `admin` + `miniapp`, but docs and CI install per-package (`cd admin && npm install`, `cd miniapp && npm install`).

## Commands

```bash
cd admin && npm run dev      # admin panel, http://localhost:5173
cd miniapp && npm run dev    # mini app, http://localhost:5174
cd admin && npm run build    # tsc && vite build — this is the only check
cd miniapp && npm run build
```

There are no tests, linter, or formatter. `npm run build` (which runs `tsc`) is the verification step; both tsconfigs include `../shared`, so typecheck covers shared types. CI uses Node 24.

Do not use root `npm run deploy` — it references a nonexistent `export-data` script and is broken.

## Publishing data

Two flows exist:

1. Real flow (preferred): the admin panel's GitHub integration (`admin/src/utils/github.ts`) PUTs `docs/*.json` via the GitHub Contents API using a PAT stored in browser localStorage (`github_settings`). No local git step needed.
2. Manual flow from README: export JSON from the admin UI and copy it into `docs/` before committing.

Push to `main` triggers `.github/workflows/deploy.yml`: builds `miniapp/` with hardcoded prod env vars, copies the three `docs/*.json` into `miniapp/dist/`, deploys to GitHub Pages (production: `https://vvershin.github.io/mef/`). Schema/type changes must stay compatible with the JSON already deployed in `docs/`.

## Gotchas

- `@shared` path alias is configured in both tsconfigs and vite configs but is **unused**; all source imports use relative paths like `../../shared/types`. The admin vite alias points to a bogus `/shared` path — don't adopt the alias without fixing it.
- Miniapp data URLs come from env vars `VITE_EVENTS_URL`, `VITE_PLACES_URL`, `VITE_OTHER_CITIES_URL`. Prod values are hardcoded in `deploy.yml` and as fallbacks in `miniapp/src/api/*.ts` (the `events.ts` fallback is a broken placeholder). `miniapp/.env` is gitignored.
- The miniapp loads `https://telegram.org/js/telegram-web-app.js` in `index.html`; it also runs as a plain site in a normal browser for local dev.
- localStorage keys: admin data lives under `events_database`, `places_database`, `other_cities_database`; miniapp caches under `events_cache` etc.
- README.md / QUICK_START.md are partially outdated (describe one data file and manual export; code has three data files and the GitHub API publish flow). Trust the code.

## Schema changes

Category values and their Russian labels live in `shared/types.ts` (`EventCategory`/`CATEGORY_LABELS`, `PlaceCategory`/`PLACE_CATEGORY_LABELS`). Changing them affects existing data in `docs/*.json` — keep both in sync.
