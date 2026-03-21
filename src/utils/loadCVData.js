/**
 * loadCVData.js
 *
 * Loads and exposes typed slices of cv.json for Astro components to consume
 * at build time.  The cv.json path is resolved in this order:
 *
 *   1. `cvDataPath` field in `cvkit.config.json` at the repo root
 *   2. `./cv.json` at the repo root (default)
 *
 * The file is read once per Astro build; all component imports share the same
 * in-process cached result.
 *
 * @module loadCVData
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the absolute path to cv.json, consulting cvkit.config.json first.
 *
 * @returns {string} Absolute path to the cv.json file.
 */
function resolveCVPath() {
  const root = process.cwd();
  const configPath = path.resolve(root, 'cvkit.config.json');

  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (cfg.cvDataPath) {
        return path.resolve(root, cfg.cvDataPath);
      }
    } catch {
      // malformed config — fall through to default
    }
  }

  return path.resolve(root, 'cv.json');
}

// ---------------------------------------------------------------------------
// Load & cache
// ---------------------------------------------------------------------------

/** @type {import('@cvkit/schema').CVData | null} */
let _cache = null;

/**
 * Load cv.json from disk (cached after first call).
 *
 * @returns {import('@cvkit/schema').CVData} The full CV data object.
 * @throws {Error} If cv.json does not exist or cannot be parsed.
 */
export function loadCVData() {
  if (_cache) return _cache;

  const cvPath = resolveCVPath();

  if (!fs.existsSync(cvPath)) {
    throw new Error(
      `cv.json not found at ${cvPath}.\n` +
        'Run `cvkit build --format json --output cv.json` in your cvkit setup ' +
        'and copy (or symlink) the result to the root of this repo.',
    );
  }

  const raw = fs.readFileSync(cvPath, 'utf-8');
  _cache = /** @type {import('@cvkit/schema').CVData} */ (JSON.parse(raw));
  return _cache;
}

// ---------------------------------------------------------------------------
// Typed data slices (one export per component family)
// ---------------------------------------------------------------------------

/**
 * Basic profile info for ProfileCard.
 *
 * @returns {import('@cvkit/schema').Basics} cv.basics
 */
export function getBasics() {
  return loadCVData().basics ?? { name: '' };
}

/**
 * Work-history entries for ExperienceTimeline.
 *
 * @returns {import('@cvkit/schema').WorkEntry[]} cv.work
 */
export function getWork() {
  return loadCVData().work ?? [];
}

/**
 * Education entries for the Education section.
 *
 * @returns {import('@cvkit/schema').EducationEntry[]} cv.education
 */
export function getEducation() {
  return loadCVData().education ?? [];
}

/**
 * Publications for PublicationsTable.
 * Sorted descending by year, then by title.
 *
 * @returns {import('@cvkit/schema').Publication[]} cv.publications
 */
export function getPublications() {
  const pubs = loadCVData().publications ?? [];
  return [...pubs].sort((a, b) => {
    if ((b.year ?? 0) !== (a.year ?? 0)) return (b.year ?? 0) - (a.year ?? 0);
    return (a.title ?? '').localeCompare(b.title ?? '');
  });
}

/**
 * Software / GitHub repos for the Software section.
 * Sorted descending by star count.
 *
 * @returns {import('@cvkit/schema').Software[]} cv.software
 */
export function getSoftware() {
  const sw = loadCVData().software ?? [];
  return [...sw].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
}

/**
 * Skill categories for SkillsRadar.
 *
 * @returns {import('@cvkit/schema').Skill[]} cv.skills
 */
export function getSkills() {
  return loadCVData().skills ?? [];
}

/**
 * Citation metrics for QuickStats / CitationChart.
 *
 * @returns {import('@cvkit/schema').CitationMetrics | undefined} cv.citationMetrics
 */
export function getCitationMetrics() {
  return loadCVData().citationMetrics;
}

/**
 * Publications per year — derived metric used by CitationChart.
 * Returns an array sorted ascending by year.
 *
 * @returns {{ year: number; count: number; citations: number }[]}
 */
export function getPublicationsByYear() {
  const pubs = loadCVData().publications ?? [];
  /** @type {Map<number, { count: number; citations: number }>} */
  const map = new Map();

  for (const pub of pubs) {
    if (!pub.year) continue;
    const entry = map.get(pub.year) ?? { count: 0, citations: 0 };
    entry.count += 1;
    entry.citations += pub.citationCount ?? 0;
    map.set(pub.year, entry);
  }

  return Array.from(map.entries())
    .map(([year, { count, citations }]) => ({ year, count, citations }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Unique co-authors derived from cv.publications, with co-authorship frequency.
 * Excludes the CV owner by matching against cv.basics.name.
 *
 * @returns {{ name: string; count: number }[]} sorted descending by co-authorship count
 */
export function getCoauthors() {
  const data = loadCVData();
  const ownerName = (data.basics?.name ?? '').toLowerCase();
  /** @type {Map<string, number>} */
  const freq = new Map();

  for (const pub of data.publications ?? []) {
    for (const author of pub.authors ?? []) {
      if (!author.name) continue;
      if (author.name.toLowerCase().includes(ownerName.split(' ').pop() ?? '')) continue;
      freq.set(author.name, (freq.get(author.name) ?? 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
