# iCV — Interactive Curriculum Vitae

A one-click, GitHub-Pages-hosted CV that auto-pulls your professional data and lets you arrange interactive components via a single YAML file.

## 1 · Create your own CV (no command line required)

1. **Use this template**  →  Click the green **"Use this template"** button on GitHub and choose *Create a new repository*.
2. In the new repo, go to **Settings → Pages** and pick **"GitHub Actions"** as the source (one-time step to enable Pages).  
   You only need to do this once per repo.
3. Open **`icv.config.yaml`** in the web editor and fill in your account IDs (GitHub, ORCiD, Google Scholar, …).
4. Commit the changes.  
   GitHub Actions will build and publish your site at:
   ```
   https://<your-username>.github.io/<your-repo>/
   ```
5. Share the link—done!

> Tip: every time you edit `icv.config.yaml`, your site rebuilds automatically.  A monthly scheduled build keeps stats (e.g. citations) up to date.

---

## 2 · How it works

| Layer | What it does |
|-------|--------------|
| GitHub Action | Runs `scripts/fetch-data.js` (grabs JSON from public APIs) then builds with Astro |
| Astro | Reads **`icv.config.yaml`**, pre-renders one static route per tab, and bundles interactive "islands" |
| YAML config | Controls theme, tabs, components, and which data sources to harvest |

### Available components

Component key | Description
--------------|------------
`profile_card` | Name, avatar, tagline
`quick_stats` | h-index, GitHub stars, years experience, etc.
`experience_timeline` | Scrollable work & education timeline
`skills_radar` | Radar/bar chart of skill categories
`publications_table` | Filterable publications list with DOI links
`citation_chart` | Citations-per-year line chart
`github_heatmap` | 365-day contribution calendar (SVG)
`coauthor_network` | Force-directed graph of co-authors (opt-in)

Each component can receive **properties** in the YAML if you need fine control, e.g.
```yaml
components:
  - citation_chart:
      start_year: 2015
      color: "#1f77b4"
```

---

## 3 · Local development (optional)

For those comfortable with Node & npm:

```bash
# clone your repo
npm install
npm run dev  # open http://localhost:4321
```

---

## 4 · Roadmap

- Implement data fetchers for each source (GitHub, ORCiD, Google Scholar, LinkedIn, Semantic Scholar)
- Replace placeholder components with fully-styled versions
- Theme switcher (light / dark / auto)
- One-click PDF export via print CSS
- CLI: `npx create-icv` for even faster setup

Contributions & feedback welcome — feel free to open issues or PRs! :rocket: 