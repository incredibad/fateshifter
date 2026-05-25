## [0.8.21] — 2026-05-25

### Changed

- Reel scroll speed is now constant (4 cards/sec) regardless of spin duration — frame count scales with duration so longer spins show more cards, not slower cards

## [0.8.20] — 2026-05-25

### Changed

- Bounce distance reduced to 30% of card height (was 50%)

## [0.8.19] — 2026-05-25

### Changed

- Bounce distance scaled to 50% of card height (dynamic via `--card-w`); spring-back overshoot scaled proportionally; duration extended to 0.6 s

## [0.8.18] — 2026-05-25

### Changed

- Removed card pulse animation — bounce only on landing
- Default spin duration halved to 2.5 s

## [0.8.17] — 2026-05-25

### Fixed

- Bounce animation now fires at the exact moment the spin ends — removed 200 ms post-spin buffer and apply the bounce class directly to the DOM before the React re-render

## [0.8.16] — 2026-05-25

### Changed

- Spin easing changed to `linear` — dead stop, no deceleration at all

## [0.8.15] — 2026-05-25

### Changed

- Spin easing changed to `cubic-bezier(0,0,0.95,1)` — nearly linear with the barest hint of ease at the end; eliminates the long deceleration tail so the bounce fires almost immediately on stop

## [0.8.14] — 2026-05-25

### Changed

- Spin deceleration sharpened (`cubic-bezier(0,0,0.65,1)`) for a harder stop
- Result frame bounces 16 px downward on landing then springs back (0.48 s ease-out), giving a physical impact feel; scale pulse plays simultaneously on the inner card

## [0.8.13] — 2026-05-25

### Changed

- First card pulse shortened to 0.3 s and scaled up to ×1.08 (brightness 120%) for a sharper snap; continuous pulse follows at 0.65 s

## [0.8.12] — 2026-05-25

### Changed

- Vignette reduced from 28% to 10% on each edge so it no longer overlaps card art
- Card pulse: first pulse is larger (scale ×1.04, brightness 115%) and timed to peak at ~0.95 s — aligned with the LTR card shimmer peak; subsequent pulses revert to the gentle continuous loop (scale ×1.018, brightness 107%)

## [0.8.11] — 2026-05-25

### Changed

- Slot spin easing changed from `cubic-bezier(0,0,0.15,1)` to `cubic-bezier(0,0,0.4,1)` — same fast launch but the slow-approach tail at the end is compressed so cards settle decisively rather than drifting in

## [0.8.10] — 2026-05-25

### Added

- Result card(s) pulse continuously after the reel settles — gentle 2.8 s ease-in-out scale (×1.018) + brightness cycle applied to the frame container so pair cards move as a unit

### Changed

- LTR shimmer delay reduced from 0.8 s to 0.55 s so it overlaps the tail of the RTL sweep by ~0.2 s

## [0.8.9] — 2026-05-25

### Changed

- Shimmer reveal: wider, softer gradient (feathers from 15%–85% rather than 30%–68%); both sweeps slowed to 0.75 s with ease-in-out
- Second shimmer (LTR) now clips to the card area via an overflow:hidden wrapper sized/positioned to match the card, with matching border-radius

## [0.8.8] — 2026-05-25

### Changed

- Shimmer reveal is now two sequential white sweeps: right-to-left fires immediately on roll completion, left-to-right follows 0.65 s later; both are pure white (purple tint removed)

## [0.8.7] — 2026-05-25

### Added

- Shimmer reveal animation on roll completion: a white-purple diagonal streak sweeps across the slot window once as the result settles; replays automatically on each roll

## [0.8.6] — 2026-05-25

### Changed

- Card size in the slot window is now dynamic: a ResizeObserver computes `min(viewportWidth − 60, (viewportHeight − 60) × 63/88)` and sets `--card-w` on the viewport element; all card styles (single, pair front/back, placeholder, border-radius) derive from this variable so cards fill the available space with 30 px clearance on the binding edge
- Removed hardcoded mobile card-size overrides (now handled automatically)

## [0.8.5] — 2026-05-25

### Added

- Star field background in the slot window: 360 twinkling stars across 5 independent layers, each with its own animation timing, mixing white and MTG-accent colours (purple, gold, cyan, pink); large stars have a soft glow blur
- Slot window background changed from flat dark to a deep-space radial gradient
- Pulsing purple inset glow on the slot window during a spin

## [0.8.4] — 2026-05-25

### Changed

- Autocomplete shows up to 20 results and scrolls after 10 rows
- Selected card artwork in the add modal is larger (86×120 px)
- Bulk import matched list: mana pips moved to the right side of each row
- Search input is hidden and a warning shown when a list has no commanders
- Divider added between the list controls and the search/table area
- Mobile: action buttons and default filter select are tidier — buttons stretch to fill width, filter select is unconstrained

## [0.8.3] — 2026-05-25

### Changed

- Commander search in the add modal now uses Scryfall's search API (`name:` substring matching) instead of autocomplete, fixing cards like "Avatar Kyoshi, Earthbender" that weren't reachable by searching a non-leading word in the name
- Autocomplete dropdown shows a card art thumbnail next to each suggestion
- Selected card preview in the add modal shows artwork instead of mana pips
- Bulk import matched list shows card art thumbnails instead of mana pips; resolved unmatched items show art once a suggestion is accepted

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
