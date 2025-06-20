#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const FIXTURES_DIR = path.resolve('tests/fixtures');
const scriptPath = path.resolve('scripts/extract-linkedin.js');

const fixtures = fs.readdirSync(FIXTURES_DIR).filter((f) => fs.statSync(path.join(FIXTURES_DIR, f)).isDirectory());

assert.ok(fixtures.length > 0, 'No fixtures found in tests/fixtures');

for (const name of fixtures) {
  const cwd = path.join(FIXTURES_DIR, name);
  const pdfPath = path.join(cwd, 'data', 'Profile.pdf');
  assert.ok(fs.existsSync(pdfPath), `Fixture ${name} missing Profile.pdf`);

  // Execute extractor in fixture directory so it writes to its local data/
  execSync(`node ${scriptPath}`, { cwd, stdio: 'inherit' });

  const out = path.join(cwd, 'data', 'experience.json');
  assert.ok(fs.existsSync(out), `experience.json not created for ${name}`);

  const { positions } = JSON.parse(fs.readFileSync(out, 'utf-8'));
  assert.ok(Array.isArray(positions) && positions.length > 0, `No positions parsed for ${name}`);

  // If fixture provides an expected JSON, compare
  const expectedPath = path.join(cwd, 'data', 'experience.expected.json');
  if (fs.existsSync(expectedPath)) {
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
    assert.deepEqual(positions, expected.positions, `Parsed positions mismatch for ${name}`);
    console.log(`✓ ${name}: parsed positions match expected (${positions.length})`);
  } else {
    console.log(`✓ ${name}: parsed ${positions.length} positions`);
  }
} 