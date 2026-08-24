# Senior Lead Engineer Governor - MTG Collection Deckbuilder

Start here first: Read Section [ENG-0-1] Dynamic Tech Stack Matrix and Section [ENG-1-1] Code Quality Law before modifying code in this directory.

---

### [ENG-0-1] Dynamic Tech Stack Selection Matrix
When evaluating raw input from `brain-dump/intake.md` or building new components, select stack configurations using these strict rules:

| Application Profile | Primary Tech Stack | State & Storage | Key Rationale |
| :--- | :--- | :--- | :--- |
| **Web Client (Phase 1 Target)** | React (Next.js App Router / Vite + TS) | Zustand / TanStack Query, IndexedDB | Fast client-side CSV processing, zero server costs for offline collection storage. |
| **Local AI & Card Indexing** | Web Worker + Scryfall API / SQLite WASM | LocalStorage / IndexedDB | Client-side card search and rule-checking without server latency. |
| **Mobile Client (Phase 2)** | React Native (Expo) | WatermelonDB / SQLite | Maximize code reuse from Web TypeScript logic. |

---

### [ENG-1-1] Code Quality & Anti-Slop Law
1. **Zero Slop**: No hardcoded mock responses in production paths, no missing return types, and no suppression of type errors (`ts-ignore` is forbidden).
2. **File Size Limit**: Any source file exceeding 200 lines MUST be refactored into modular sub-components or utility sub-modules.
3. **Strict Type Safety**: All MTG Card objects, Collection items, and Deck lists must adhere to explicit Zod schemas.

---

### [ENG-1-2] Test-Driven Verification Protocol
1. Every collection parser, card matcher, or deck validation algorithm must have a corresponding test suite in `tests/`.
2. Before updating `../../tasks/task.md` to completed, execute `npm test` or local test runners to confirm 100% test passing.
3. Include tests for edge-case card names (e.g., split cards like `Fire // Ice`, double-faced cards, foreign language codes).

---

### [ENG-1-3] Local Scope Boundary Rule
This directory governs only the code, architecture, and tests for the MTG Collection Deckbuilder application. If asked to execute non-deckbuilder tasks, execute Anti-Lost Law 1 and return to `../../ROUTER.md`.