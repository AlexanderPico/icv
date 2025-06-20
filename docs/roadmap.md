# Project Roadmap

_This file is the single source-of-truth for upcoming work.  Update it in PRs as tasks are completed or priorities change._

---

## Milestone 1 – LinkedIn → CV data pipeline  ➜  **target version: v0.1.0**

The original HTML-scraper approach was dropped in favour of a **100 % client-side workflow** where the user provides the PDF downloaded from LinkedIn.  Tasks below reflect that new direction.

- [x] **PDF extractor** – `scripts/extract-linkedin.js` reads `data/Profile.pdf`, analyses glyphs (font size, position) and emits `data/experience.json`.
- [x] **Fixture-based test-suite** – `tests/fixtures/*` contain sample PDFs and golden JSON; `npm test` validates the extractor against all fixtures.
- [ ] **CI integration** – on every push the extractor + tests run in GitHub Actions; build fails on regression.
- [x] **ExperienceTimeline component** renders from the new `experience.json` (incl. optional `location`).
- [ ] **Config option `max_items`** – allow timeline truncation via YAML.
- [ ] **Docs update** – README section "Export your LinkedIn PDF & drop it into `data/`".

---

## Milestone 2 – AI Content Refinement  ➜  **target version: v0.2.0**

- [ ] Build lightweight local-model provider in `src/ai/` (no external token).
- [ ] Add `ai` section & prompt templates to `icv.config.yaml`.
- [ ] Post-process LinkedIn descriptions → concise bullet summaries.
- [ ] Timeline component prefers AI-refined text when present.

---

## Milestone 3 – Look & Feel  ➜  **target version: v0.3.0**

- [ ] Introduce Tailwind or CSS-vars design system (light/dark/auto).
- [ ] Responsive grid & spacing utilities for existing components.
- [ ] Accessibility pass (color contrast, keyboard nav, alt text).

---

## Milestone 4 – Scholar & Publications  ➜  **target version: v0.4.0**

- [ ] Fetch publications via ORCiD, Google Scholar, Semantic Scholar.
- [ ] Generate `publications.json` (merged + de-duplicated).
- [ ] Components: `PublicationsTable`, `CitationChart`.
- [ ] Add h-index & citation totals to `QuickStats`.

---

## Milestone 5 – Automation & Polish  ➜  **target version: v1.0.0**

- [ ] CLI `npx create-icv` scaffolder.
- [ ] Scheduled build frequency controlled via YAML (`auto_refresh`).
- [ ] Print-to-PDF stylesheet & button.
- [ ] Optional analytics flag (e.g., Plausible).
- [ ] Unit tests + ESLint + Prettier hooks.

---

## Stretch / vNext

- Skills editor UI (drag sliders, writes YAML via PR).
- Co-author network graph (force-directed, WebGL fallback).
- i18n via i18next.
- External data sources (Notion, Airtable).

---

### How to update this file

1. Check off boxes (`- [x]`) in the same PR that implements the task.
2. Feel free to add, remove, or reorder tasks as priorities change.
3. Keep milestones scoped so each one can be tagged and merged independently.