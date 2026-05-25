# Fateshifter — Agent Handover

**Date:** 2026-05-25  
**Current version:** 0.8.11 (on `dev` branch, pushed)  
**Repo:** https://github.com/incredibad/fateshifter  
**Docker Hub:** incredibad/fateshifter  

---

## Project in one paragraph

Fateshifter is a single-user web app for randomly generating MTG Commander commanders. Users maintain named lists of commanders (with partner support), pick a colour identity, and roll. The app is a single Docker container (Node.js + PostgreSQL 16 bundled) served on port 7283. Frontend: React 18 + Vite + CSS Modules. Backend: Node.js + Express ESM. Auth: bcryptjs + express-session + connect-pg-simple.

---

## What was built this session (0.8.x)

### Commander search & add flow (0.8.3–0.8.4)
- Replaced Scryfall `autocomplete` with `search` API (`name:${query}+type:legendary&unique=names`) so mid-name searches like "Kyoshi" find "Avatar Kyoshi, Earthbender"
- Autocomplete dropdown now shows card art thumbnails alongside each suggestion (card data returned by search, no extra fetch)
- Selecting a card in the add modal shows artwork (86×120 px) instead of mana pips
- Bulk import matched list shows art thumbnails; mana pips on the right; resolved unmatched items show art once accepted
- Autocomplete capped at 20 results, scrollable after 10 rows
- Search input hidden with warning when a list has no commanders
- Divider between header controls and search/table on list detail page
- Mobile: action buttons stretch to fill width; default filter select unconstrained

### Slot machine visuals (0.8.5–0.8.11)
- **Star field**: 360 stars across 5 CSS layers (5 independent `@keyframes twinkle` animations), mixed white/purple/gold/cyan/pink. Stars generated once via `useMemo` using `box-shadow` trick on 1×1px divs. Deep-space radial gradient background (`#0f0a1e` → `#06060e`). Pulsing purple inset glow during spin.
- **Dynamic card size**: `ResizeObserver` on `.reelViewport` computes `--card-w = min(w−60, (h−60)×63/88)` and also sets `--frame-height`. All card elements (`.cardImg`, `.cardFront`, `.cardBack`, `.pairFrame`, `.cardPlaceholder`, all `border-radius`) derive from `--card-w`. Cards fill the viewport with 30 px clearance on the binding edge. Observer fires on mount and resize.
- **Shimmer reveal**: On `phase → 'done'`, two white diagonal sweeps play:
  1. RTL sweep (full viewport): fires at t=0, 0.75 s `ease-in-out`
  2. LTR sweep (clipped to card area): fires at t=0.55 s (0.2 s overlap), 0.75 s `ease-in-out`; wrapped in `overflow:hidden` div sized to `--card-w × card-height` with matching `border-radius`
  - Both are pure white (`rgba(255,255,255,0.55)` peak), wide soft feather (15%–85%)
  - React's conditional render removes/re-adds both divs on each roll, restarting animations
- **Card pulse**: result frame gets `framePulsing` class: `scale(1.018)` + `brightness(1.07)` at 2.8 s `ease-in-out infinite`. Applied to `.singleFrame`/`.pairFrame` container so pair cards pulse as a unit.
- **Spin easing**: `cubic-bezier(0,0,0.4,1)` — fast launch, decisive stop (was `0.15`, which had too long a slow-drift tail at the end)

---

## Key files changed this session

| File | What changed |
|---|---|
| `frontend/src/lib/scryfall.js` | `scryfallAutocomplete` → `scryfallSearch` (returns ParsedCard[], max 20) |
| `frontend/src/pages/ListDetail.jsx` | Art in dropdown/modal/import; search guard; divider; mobile layout |
| `frontend/src/pages/ListDetail.module.css` | Suggestion art, card preview img, matched art, mobile breakpoints, divider |
| `frontend/src/pages/Generator.jsx` | `StarField` component; `ResizeObserver` for `--card-w`; shimmer divs; `ReelFrame` `pulsing` prop; spin easing |
| `frontend/src/pages/Generator.module.css` | Star field styles; `.reelViewport` background; shimmer keyframes/classes; `framePulsing` |

---

## Architecture notes

### Single-container Docker
`docker-entrypoint.sh` starts PostgreSQL 16 (as `postgres` user via `su-exec`), polls `pg_isready`, creates role/db if missing, sets `DATABASE_URL`, then execs `node src/index.js`. Postgres data lives in named volume `fateshifter_data`.

### Database migrations
`backend/src/db/index.js` runs inline `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` on startup — no migration framework, just idempotent DDL.

### Partner type detection
`backend/src/lib/scryfall.js` and `frontend/src/lib/scryfall.js` both contain `parseCard()`. Friends Forever cards use keyword `"Partner"` on Scryfall, so detection checks oracle text as fallback: `/\bfriends forever\b/i`. All 7 partner mechanic types are supported.

### Colour matching (backend)
Singles: `setsEqual(color_identity, selectedColors)` — exact match only.  
Pairs: `setsEqual(setUnion(a.color_identity, b.color_identity), selectedColors)` — union must exactly equal selection.  
DB query pre-filters with `color_identity <@ $2::TEXT[]` (containment) for efficiency before the JS exact-match filter.

### Generator page — CSS custom properties on `.reelViewport`
- `--frame-height`: set by `ResizeObserver` (and again at spin-start for safety). Used to size each `.reelFrame` and compute the scroll distance.
- `--card-w`: set by same `ResizeObserver`. Used by all card/pair CSS. Fallback: `300px`.

### Versioning rule (from CLAUDE.md)
- Patch (0.x.y) for bug fixes and UI tweaks  
- Minor (0.x.0) for new features or behaviour changes  
- Bump **both** `frontend/package.json` and `backend/package.json` together before every commit

### Branches
- `dev` — active development, CI builds `incredibad/fateshifter:dev`
- `main` — release, CI builds `incredibad/fateshifter:latest`

---

## Key file map

```
fateshifter/
  CLAUDE.md                        ← project rules / versioning
  CHANGELOG.md                     ← version history
  Dockerfile                       ← multi-stage; embeds postgres16
  docker-entrypoint.sh             ← starts postgres then node
  docker-compose.yml               ← single service, port 7283

  backend/src/
    index.js                       ← express app, route mounting
    db/index.js                    ← pg pool + inline migrations
    lib/scryfall.js                ← parseCard (partner detection, image_uri)
    routes/
      auth.js                      ← login/logout/setup/change-password
      lists.js                     ← CRUD + commanders + bulk import + art update
      generate.js                  ← /candidates + / (random pick)

  frontend/src/
    lib/
      api.js                       ← all fetch wrappers
      scryfall.js                  ← scryfallSearch (returns ParsedCard[]), scryfallNamed
    pages/
      Generator.jsx / .module.css  ← slot machine, star field, shimmer, card pulse
      ListDetail.jsx / .module.css ← commander table, add modal, bulk import, art picker
      Lists.jsx / .module.css      ← list CRUD
      Settings.jsx / .module.css   ← change password, spin duration
    index.css                      ← global CSS vars (--bg, --bg2..4, --accent, etc.)
```
