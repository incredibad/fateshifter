## [0.8.2] — 2026-05-25

### Changed

- Mana pip icons on the list detail screen reduced to 14 px

## [0.8.1] — 2026-05-25

### Fixed

- Reel frame heights and animation offset now always derived from the same synchronous `clientHeight` measurement at roll time (via CSS custom property `--frame-height`), eliminating the race condition where a ResizeObserver firing mid-animation produced misaligned frames and an upward jump

### Changed

- Partner pair cards now stack diagonally (front card bottom-left, back card top-right) with no rotation, so both names and mana costs are visible
- Single and partner card sizes increased to fill more of the slot window (single: 300 px wide; pair cards: 250 px wide)

## [0.8.0] — 2026-05-25

### Added

- Default filter per list — set a default colour identity on each list's detail page; the Generator applies it automatically when that list is selected

### Changed

- Slot window always fills all remaining vertical space on the Generator page (dynamic height via ResizeObserver; reel frame height matches viewport at roll time)
- Result name and colour pips below the slot window removed — card art is the only result display
- "Tempt Fate" button: fuchsia-to-indigo gradient, pulsing glow animation, shimmer sweep, hover lifts and kills animations
- No-results message rendered inside the reel viewport instead of below it

### Fixed

- Preset dropdown panel no longer clipped by the accordion's overflow:hidden — panel now renders via React portal with fixed positioning

## [0.7.4] — 2026-05-25

### Changed

- Logo pie uses correct MTG colour codes (White #F8F6D8, Blue #0E68AB, Black #150B00, Red #D3202A, Green #00733E, Colorless #CAC5C0) with wider gaps between slices
- Logo wordmark font changed to Black Ops One (bold, subtly distressed, sans-serif)
- Favicon updated to match the pie logo
- Page title updated to "Fateshifter"

## [0.7.3] — 2026-05-25

### Changed

- Slot window is now 1.5× taller (450 px); card art scaled up to match
- "Tempt Fate" button has a gradient, glow, and lift-on-hover effect; full width on mobile
- Removed page heading from the Fateshifter page

## [0.7.2] — 2026-05-25

### Changed

- Renamed "Fate Shifter" to "Fateshifter" throughout (logo, nav, page heading)
- Roll button now reads "✦ Tempt Fate" (was "⚄ Roll Commander / Roll Again")
- Filters accordion collapses automatically when a roll begins
- Reduced vertical spacing on the Generator page; added dividers between sections

## [0.7.1] — 2026-05-25

### Fixed

- Colorless filter now correctly returns only colorless commanders; previously an empty colour array serialised to an empty string which the backend misread as "any"

## [0.7.0] — 2026-05-25

### Added

- Collapsible sidebar nav with hamburger button on mobile; fixed top bar (52 px) so page content is no longer pushed below the nav
- Version number shown at the bottom of the nav sidebar
- Filters accordion on Generator page — colour identity and preset controls are hidden by default and toggle open via a button inline with the list selector
- Searchable preset dropdown replaces the pill grid; type to filter all 32 presets
- "Any" colour identity option — no colour filter applied, returns all commanders in the list; this is now the default

### Changed

- Renamed "Generator" / "Commander Generator" to "Fate Shifter" throughout
- Nav logo replaced with a six-slice MTG-colour pie SVG and Cinzel Decorative wordmark

## [0.6.0] — 2026-05-25

### Added

- Configurable spin duration in Settings — a range slider (1–15 s) persisted to the database; Generator reads the saved value on load

## [0.5.0] — 2026-05-25

### Added

- Slot machine animation on the Generator page — all valid candidates are fetched upfront, a result is picked (excluding the previous roll), and the reel scrolls through shuffled card art before decelerating to the winner over 5 seconds
- Partner pairs displayed as cascading overlapping cards (EDHREC style) in the reel
- Swipe-up gesture on mobile triggers a roll
- Result name and colour identity shown below the reel once animation completes
- New `GET /api/generate/candidates` endpoint returns all valid singles and pairs for a list + colour filter

### Changed

- Roll button label changes to "Roll Again" after the first result

## [0.4.3] — 2026-05-25

### Fixed

- Generator crash "Cannot access 'pool' before initialization" — local variable named `pool` inside the route handler shadowed the imported db pool via temporal dead zone

## [0.4.2] — 2026-05-25

### Fixed

- Autocomplete dropdown shows a spinner while searching Scryfall and "No results" when nothing matches, instead of an empty box

## [0.4.1] — 2026-05-25

### Fixed

- Autocomplete dropdown in Add Commander modal no longer gets clipped by the modal's overflow boundary

## [0.4.0] — 2026-05-25

### Added

- Card artwork stored in database (`image_uri`) at import/add time from Scryfall border_crop (handles double-faced commanders)
- Art thumbnail column in list detail table — click any thumbnail to change artwork
- Artwork picker modal: infinite-scroll grid of all Scryfall printings for that card, set name and year shown below each, current printing highlighted, saves immediately on selection

## [0.3.1] — 2026-05-25

### Changed

- Generator will not repeat the same commander or pairing on consecutive rolls; if only one valid result exists it is returned as normal

## [0.3.0] — 2026-05-25

### Added

- Export List button on list detail page — opens a modal with all commander names one per line and a Copy to Clipboard button

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
