# Fateshifter

Fateshifter is a self-hosted web application for randomly generating Magic: The Gathering Commander decks from your own curated lists. Rather than picking a commander yourself, you build lists of eligible commanders and let Fateshifter roll one at random — accounting for colour identity filters, partner mechanics, and the full breadth of MTG's pairing rules.

## Key Capabilities

**Commander Lists**: The application lets you maintain multiple named lists of commanders, each with its own default colour identity filter. Commanders are added individually via Scryfall autocomplete (auto-filling colour identity, partner type, and card art) or in bulk by pasting a list of names — unmatched entries get fuzzy-match suggestions for review before import.

**Colour Identity Filtering**: The Generator page provides individual colour pip toggles, a Colorless option, and a searchable preset dropdown covering all 32 standard colour combinations. Filters are applied at roll time so you can switch freely without re-importing. Each list can store a default filter that loads automatically on selection, and the last used list is remembered across sessions.

**Partner Mechanic Support**: All MTG partner variants are handled correctly — generic Partner, Partner With (named pairs), Friends Forever, Choose a Background / Background, Doctor's Companion, and Time Lord Doctor. Colorless cards that can choose their colour at deck-build time (such as Clara Oswald and Faceless One) use a gap-of-one rule: the pair is valid under any filter where the fixed partner leaves at most one colour gap.

**Slot Machine Roll**: Clicking Tempt Fate triggers a reel animation that scrolls through card art from your eligible pool before landing on the result. Landing fires a spring-physics bounce and a shimmer reveal sweep. Spin duration is configurable in Settings (1–15 s). A swipe-up gesture on mobile also triggers a roll, and consecutive rolls will not repeat the same commander or pair.

**Visual Theme**: The interface uses an arcane void aesthetic — deep violet backgrounds, rough organic borders rendered via SVG turbulence displacement filters, a floating Elder Futhark rune field in the reel viewport, and Raleway/Inter typography.

## Deployment

The recommended installation method uses Docker Compose. Fateshifter runs as a single container with PostgreSQL bundled inside — no separate database service is required.

```yaml
services:
  fateshifter:
    image: incredibad/fateshifter:latest
    container_name: fateshifter
    restart: unless-stopped
    environment:
      SESSION_SECRET: change-this-secret
      POSTGRES_PASSWORD: change-this-password
    ports:
      - "7283:7283"
    volumes:
      - fateshifter_data:/var/lib/postgresql/data

volumes:
  fateshifter_data:
```

On first run, navigate to the app and complete the admin account setup. The application runs on port `7283` by default.

## Tech Stack

The backend is Node.js with Express (ESM modules), using PostgreSQL 16 for persistence and `express-session` with `connect-pg-simple` for session storage. The frontend is React 18 with Vite and CSS Modules, using Framer Motion for the reel animation and React Router for navigation. Card data is sourced from the Scryfall API at import time.
