## [0.9.2] — 2026-05-25

### Changed

- Global grain overlay added (`body::after` fixed pseudo-element with SVG feTurbulence noise) — breaks up every smooth surface in the UI
- Nav sidebar: layered inset shadows simulate a thick stone wall edge; logo and nav item text get a carved drop-shadow
- Roll button: clean gradient broken up with a diagonal light/shadow overlay layer; gold text gets a carved glow+shadow
- Section labels get a carved text-shadow
- Reel viewport: chiseled inset border shadows; diagonal scratch-line `::before`; four-corner darkening vignette `::after` for a worn stone frame look

## [0.9.1] — 2026-05-25

### Changed

- Border radius reduced to near-zero (`--radius: 0px`, `--radius-lg: 1px`) for a hewn-stone / carved aesthetic
- Inputs and text areas have a deep inset shadow (`inset 0 2px 6px rgba(0,0,0,0.55)`) so they read as chiselled slots
- Modal sheet border updated to warm gold tint with subtle inset highlight
- Nav sidebar has a soft inset right-edge shadow suggesting thick stone wall depth
- Heavier elevation shadows across all panels
- Tempt Fate button: sparkle SVG replaced with Elder Futhark rune trio `ᛉᛏᛉ` (Algiz–Tiwaz–Algiz)

## [0.9.0] — 2026-05-25

### Changed

- **Theme overhaul — dungeon / arcane aesthetic**
  - Color palette shifted from cool blue-black to warm stone charcoal; borders and elevation rings tinted warm gold instead of white
  - Accent color changed from purple (#a855f7) to aged gold (#c9a84c) — affects nav active states, input focus rings, dropdowns, and all interactive highlights
  - Text palette updated to parchment tones (#e8dcc8 / #9a896a / #5a4a32)
  - Google Fonts: Black Ops One replaced with Cinzel + Cinzel Decorative; Cinzel applied to nav items, section labels, modal titles, and the roll button; Cinzel Decorative on the wordmark logo
  - Logo wordmark color changed to gold with a soft glow
  - Roll button redesigned: dark carved-stone base, gold text, gold-tinted border, gold shimmer sweep, amber glow pulse
  - Reel viewport background shifted to warmer deep dark with a subtle purple-stone core
  - Logo SVG slice strokes updated to match new nav background

## [0.8.46] — 2026-05-25

### Fixed

- Runes no longer flash bright on page load — `animation-fill-mode: backwards` applied so the 0% keyframe (dim opacity) is active during each rune's delay period instead of defaulting to full opacity

## [0.8.45] — 2026-05-25

### Fixed

- Rune drift animations now work: keyframes moved to global `index.css` so inline `animation:` strings can reference them by name (CSS Modules scopes keyframes defined inside module files)
- Card size restored to original clearance (60 px) — 120 px clearance was too aggressive
- Rune opacity reduced further for subtlety (peak 0.15–0.40, floor 0.02–0.08)

## [0.8.44] — 2026-05-25

### Changed

- Slot viewport padding increased (card clearance 60 px → 120 px)
- Spinning glow animation on the reel viewport removed
- Card drop shadows strengthened with a subtle purple ambient glow
- Partner card shimmer now applies to each card individually rather than one shared overlay (prevents bleed into the blank diagonal corner)
- Floating background elements replaced: sparkle characters (✦ ✧ ✩) replaced with 45 glowing Elder Futhark runes; each rune drifts slowly via one of five organic float-path animations, fades in and out, and larger runes slowly rotate

## [0.8.43] — 2026-05-25

### Changed

- Reverted Tempt Fate button to pulsing fuchsia-indigo gradient with shimmer sweep; sparkle SVG kept, ✦ prefix removed from label

## [0.8.42] — 2026-05-25

### Changed

- Tempt Fate button: faithfully extracted default-state styles from original uiverse CSS — dark `::before` fill with inset bevel, dots_border ring, white sparkle stroke, gradient text; removed `✦` prefix from button label

## [0.8.41] — 2026-05-25

### Fixed

- Tempt Fate button border changed from dashed to solid

## [0.8.40] — 2026-05-25

### Changed

- Tempt Fate button: replaced conic-gradient border (creates wedge shapes on rectangles) with simple `dashed` border — matches reference appearance, can be swapped for rotating animation later

## [0.8.39] — 2026-05-25

### Fixed

- Tempt Fate button: border-radius increased to 10px (was inheriting 4px from `--radius`), dots switched to `repeating-conic-gradient` so they tile evenly around the border instead of a single wedge, inset bevel shadow added

## [0.8.38] — 2026-05-25

### Changed

- Tempt Fate button rewritten: dark background with static dots border using CSS gradient-border technique (`conic-gradient border-box` + `linear-gradient padding-box`); no z-index complexity; animation to follow

## [0.8.37] — 2026-05-25

### Fixed

- Tempt Fate button: rotating dots border now visible — `isolation: isolate` + explicit z-index layering (dots z-1, dark bg z-2, glow z-3, content z-10) so `::before` covers the dot interior leaving only the 1px outer ring; switched to flex layout for correct sparkle+text side-by-side alignment

## [0.8.36] — 2026-05-25

### Fixed

- Tempt Fate button CSS reworked: scoped to `#temptFateBtn` ID in global CSS, using original uiverse class names so styles apply correctly

## [0.8.35] — 2026-05-25

### Changed

- Tempt Fate button redesigned: dark background with rotating purple dots border (idle), purple radial glow + ring on hover, sparkle SVG with staggered twinkle animation on hover; no size change on hover

## [0.8.34] — 2026-05-25

### Fixed

- Shimmer skew direction corrected: card skewX(-30deg) sweeps top-left→bottom-right; window skewX(30deg) sweeps bottom-right→top-left

## [0.8.33] — 2026-05-25

### Changed

- Card shimmer: skewX(30deg) — band runs top-left to bottom-right, sweeps left→right
- Window shimmer: skewX(-30deg) — band runs bottom-right to top-left, sweeps right→left; both at 30° from vertical

## [0.8.32] — 2026-05-25

### Changed

- Card shimmer rotated 30° clockwise (`skewX(20deg)`); window shimmer mirrored in the opposite direction (`skewX(-20deg)`)

## [0.8.31] — 2026-05-25

### Changed

- Card sheen now does a double pass — a second sweep follows 0.2 s behind the first at slightly lower opacity, giving a twin-flash of light

## [0.8.30] — 2026-05-25

### Changed

- Shimmer reworked: window sweep is now a subtle ambient pass (0.26 peak); card sheen is a smooth bell curve with a warm-white tint (0.88 peak), no flat plateau; both sweeps slowed to 0.95 s; skew reduced to 10 deg

## [0.8.29] — 2026-05-25

### Changed

- Reel spins downward (cards fall from above); result is now at the start of the strip
- Bounce direction flipped to match — card overshoots downward then springs up to rest

## [0.8.28] — 2026-05-25

### Changed

- Bounce animation replaced with Framer Motion spring physics (`stiffness: 400, damping: 10`) — natural oscillation replaces hand-crafted CSS keyframes

## [0.8.27] — 2026-05-25

### Fixed

- Bounce direction inverted — card now bounces upward (matching its direction of travel) then falls back to rest, not downward

## [0.8.26] — 2026-05-25

### Fixed

- Bounce no longer overshoots above the card's rest position — upward phases return to exactly 0

## [0.8.25] — 2026-05-25

### Changed

- Star field replaced with 65 iconic ✦ ✧ ✩ sparkle characters at varying sizes, colours (white/purple/gold/cyan/pink), and timings; larger stars slowly spin via CSS `rotate`; all twinkle with scale pulse

## [0.8.24] — 2026-05-25

### Fixed

- Bounce timing: switched from setTimeout to `transitionend` listener so it fires at the exact frame the spin animation ends
- Bounce physics: per-keyframe `ease-in` on downward segments (accelerating fall) and `ease-out` on upward segments (decelerating rise to apex)

## [0.8.23] — 2026-05-25

### Changed

- Scroll speed increased to 12 fps (was 8)
- Bounce reworked: 4 decaying bounces with consistent ~55% damping ratio each time; timing intervals compress proportionally; duration 0.85 s linear

## [0.8.22] — 2026-05-25

### Changed

- Scroll speed doubled to 8 cards/sec

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
