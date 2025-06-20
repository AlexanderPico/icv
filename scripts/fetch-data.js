#!/usr/bin/env node

/*
 * Placeholder for the automated data fetching script.
 * In future, this script will:
 *   1. Read icv.config.yaml
 *   2. Call public APIs (LinkedIn, ORCiD, Google Scholar, GitHub…)
 *   3. Save results to data/auto/*.json for Astro to consume.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');

const pdf = fs.readdirSync(DATA_DIR).find((f) => f.toLowerCase().endsWith('.pdf'));

if (pdf) {
  console.log('[fetch-data] Found Profile PDF, extracting experience…');
  execSync('npm run extract-linkedin', { stdio: 'inherit' });
} else {
  console.log('[fetch-data] No Profile PDF found — skipping LinkedIn extraction');
} 