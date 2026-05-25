## [0.2.1] — 2026-05-25

### Fixed

- Friends Forever cards detected as generic Partner because Scryfall stores the ability as keyword `"Partner"` only; detection now checks oracle text as a fallback

## [0.2.0] — 2026-05-25

### Changed

- Generator now returns a single result (either a commander or a partner pair, not both)
- Singles must exactly match the selected colour identity; partner pairs must union to exactly the selected colours

## [0.1.1] — 2026-05-25

### Changed

- Bundled PostgreSQL into the app container; single-container deployment, no separate postgres service required

## [0.1.0] — 2026-05-25

### Added

- Generator page with colour identity picker (individual pips + named presets) and Roll button
- Single commander and partner pair results
- Multiple named lists with commander counts
- Bulk import via textarea with Scryfall fuzzy matching and unmatched review flow
- Scryfall autocomplete for adding individual commanders (auto-fills colour identity and partner type)
- Full partner mechanic support: Partner, Partner With, Friends Forever, Choose a Background, Background, Doctor's Companion, Time Lord Doctor
- Lists page for creating, renaming, and deleting lists
- List detail page with search, add, bulk import, and remove per commander
- Settings page with Change Password
- Single-user session auth (bcryptjs + express-session)
- Docker multi-stage build; Docker Hub CI/CD via GitHub Actions (dev + main branches)
