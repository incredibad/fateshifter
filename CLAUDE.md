# EsperGen

Random Commander generator for Magic: The Gathering Commander format.

## Versioning

**SUSPENDED — do not bump versions until explicitly told to resume.**

When versioning resumes: bump `frontend/package.json` and `backend/package.json` (keep them in sync) before every commit.

- Bug fixes and visual/UI changes → patch bump (1.x.**Y**)
- New features or behaviour changes → minor bump (1.**Y**.0)

## Changelog

**Always update `CHANGELOG.md` before every commit.** Add an entry under the correct version heading (create one if it doesn't exist, using the format `## [x.y.z] — YYYY-MM-DD`) that describes the change concisely. Use `### Added`, `### Changed`, or `### Fixed` sub-sections.

This is non-negotiable — no commit should go out without a changelog entry.

## Pushing

**Do not push proactively.** Only push to the remote repository when the user explicitly asks you to.

## Troubleshooting

**When the user reports a bug or error, ask targeted questions before analysing code.** Don't spend time reading through files and speculating about root causes when a single question — "what does the network tab show?", "what's the exact error message?", "does it fail immediately or after a delay?" — would narrow it down in seconds. Treat the user as the fastest diagnostic tool available.

## Branching workflow

- **`dev`** is the active development branch. All commits go here.
- **`main`** is stable and release-tagged. Only merge `dev` → `main` when the user confirms changes are tested and ready to ship.
- When the user asks to "push changes", push to `dev`.
- When the user asks to cut a release, merge `dev` into `main`, push `main`, then create a GitHub release using `curl` with the token from `~/.git-credentials`. The release title must be **only the version number** (e.g. `v1.5.9`). The body should list all changes since the previous release, drawn from `CHANGELOG.md`.

## Stack

- **Frontend**: React 18 + Vite + React Router (CSS Modules)
- **Backend**: Node.js + Express (ESM)
- **Database**: PostgreSQL 16
- **Port**: 7283 (production), backend dev on 3001

## Project structure

```
backend/src/
  index.js          # Express server entry
  db/index.js       # PostgreSQL pool + initDb()
  middleware/requireAuth.js
  routes/
    auth.js         # /api/auth/* (login, logout, setup, change-password)
    commanders.js   # /api/commanders CRUD
    generate.js     # /api/generate?colors=W,U,B
frontend/src/
  App.jsx           # Auth routing
  lib/api.js        # fetch wrapper
  lib/authContext.jsx
  pages/
    Generator.jsx   # Colour picker + random roll
    Settings.jsx    # Commander CRUD + account
    Login.jsx
  components/
    Layout.jsx / AppNav.jsx
```

## Development

```bash
# Backend (from backend/)
npm install
PORT=3001 DATABASE_URL=postgres://... npm run dev

# Frontend (from frontend/)
npm install
npm run dev      # proxies /api → localhost:3001
```

## Data model

```sql
commanders (id, name, color_identity TEXT[], partner_type TEXT, partner_with_name TEXT)
-- partner_type: 'none' | 'partner' | 'partner_with' | 'friends_forever'
-- color_identity: subset of ['W','U','B','R','G']
-- Colorless commanders have color_identity = '{}'
```

## Generator logic

- `color_identity <@ selectedColors` (PostgreSQL array containment) — colorless always matches
- Partner pairs: generic Partner and Friends Forever pair with any of the same type
- Partner With: pairs where `A.partner_with_name = B.name` (both must be eligible)
