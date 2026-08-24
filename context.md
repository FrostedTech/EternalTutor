# MTG Collection Deckbuilder - Context & Domain Rules

### [PROJ-1-0] Project Vision
An intelligent, AI-assisted Magic: The Gathering deckbuilding workspace that guarantees deck suggestions are generated **ONLY** using cards present in the user's uploaded collection.

### [PROJ-1-0.5] Resolved Tech Stack (Phase 1)
* **Database**: SQLite (PGLite / WASM) — Local, zero-server, indexed storage for fast card matching.
* **UI Framework**: React (Vite + TypeScript) with **TailwindCSS + Shadcn/ui** — Fast, modular, accessible components.
* **State Management**: Zustand + TanStack Query for client state and server-like caching.

---

### [PROJ-1-1] Domain Data Pipeline
1. **Collection Import**: User uploads CSV files (e.g., ManaBox, Moxfield, Archidekt, TCGPlayer exports) or raw text dumps.
2. **Normalization Engine**: Map incoming rows to unified collection schema:
   - `card_name`: String (canonical Scryfall name)
   - `set_code`: String (3-4 character code)
   - `collector_number`: String
   - `foil`: Boolean
   - `quantity`: Integer
   - `condition`: Enum
   - `language`: String
3. **Storage**: **SQLite (PGLite / WASM) in-browser** for fast, queryable local storage with exported backup JSON capabilities. IndexedDB retained only for non-relational blobs (images, backups).
4. **Deck Generator Engine**: LLM system prompt receives format constraints (e.g., Commander / Standard) and inventory filters, outputting valid decklists using exact owned quantities.

---

### [PROJ-1-2] Directory Blueprint
```text
mtg-collection-deckbuilder/
├── AGENTS.md            # Senior Lead Engineer Governor
├── context.md           # Domain Context (This file)
├── src/
│   ├── components/      # UI components (Uploaders, Deckviews)
│   ├── lib/
│   │   ├── parsers/     # CSV & Text parsing logic
│   │   ├── matcher/     # Inventory-to-Scryfall lookup
│   │   └── ai/          # Deckbuilder prompt orchestrator
│   └── types/           # MTG & Inventory Zod schemas
└── tests/               # Test suites

---

### [PROJ-1-4] Supported Collection Export Formats
The CSV parser auto-detects the source format by inspecting header columns.