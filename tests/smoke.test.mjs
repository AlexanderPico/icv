import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import yaml from 'js-yaml';

import { getConfig } from '../src/utils/getConfig.js';
import { loadCVData } from '../src/utils/loadCVData.js';

const componentIndex = await readFile(new URL('../src/components/index.js', import.meta.url), 'utf8');

function exportedComponentNames() {
  return new Set(
    [...componentIndex.matchAll(/export\s+\{\s+default\s+as\s+([A-Za-z0-9_]+)\s+\}/g)].map(
      ([, name]) => name,
    ),
  );
}

test('icv config loads with at least one tab and every tab has routable components', () => {
  const config = getConfig();
  const components = exportedComponentNames();

  assert.ok(Array.isArray(config.tabs), 'config.tabs should be an array');
  assert.ok(config.tabs.length > 0, 'config should define at least one tab');

  const ids = new Set();
  for (const tab of config.tabs) {
    assert.match(tab.id, /^[a-z0-9-]+$/, `tab id should be a URL-safe slug: ${tab.id}`);
    assert.ok(!ids.has(tab.id), `tab id should be unique: ${tab.id}`);
    ids.add(tab.id);
    assert.ok(tab.label, `tab ${tab.id} should have a label`);
    assert.ok(Array.isArray(tab.components), `tab ${tab.id} should list components`);
    assert.ok(tab.components.length > 0, `tab ${tab.id} should include at least one component`);

    for (const entry of tab.components) {
      const name = typeof entry === 'string' ? entry : Object.keys(entry)[0];
      assert.ok(components.has(name), `tab ${tab.id} references unknown component: ${name}`);
    }
  }
});

test('checked-in cv data has the profile fields needed for a useful static build', () => {
  const data = loadCVData();

  assert.ok(data.basics?.name, 'cv.json should include basics.name');
  assert.ok(data.basics?.summary, 'cv.json should include basics.summary');
  assert.ok(Array.isArray(data.publications), 'cv.json should include a publications array');
  assert.ok(data.publications.length > 0, 'cv.json should include at least one publication');
  assert.ok(Array.isArray(data.software), 'cv.json should include a software array');
});

test('icv.config.yaml remains parseable as YAML', async () => {
  const raw = await readFile(new URL('../icv.config.yaml', import.meta.url), 'utf8');
  const parsed = yaml.load(raw);
  assert.equal(parsed.theme, 'auto');
});

test('repo documents and wires the stable smoke-test CI path', async () => {
  const workflowRaw = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const workflow = yaml.load(workflowRaw);
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');

  assert.equal(workflow.name, 'CI');
  assert.ok(workflow.on.push, 'ci workflow should run on push');
  assert.ok(workflow.on.pull_request, 'ci workflow should run on pull_request');

  const steps = workflow.jobs?.validate?.steps ?? [];
  const runCommands = steps.flatMap((step) => (typeof step.run === 'string' ? [step.run] : []));
  assert.ok(runCommands.includes('npm ci'), 'ci workflow should install deps with npm ci');
  assert.ok(runCommands.includes('npm test'), 'ci workflow should run npm test');
  assert.ok(runCommands.includes('npm run build'), 'ci workflow should run npm run build');

  assert.match(readme, /npm test/, 'README should document npm test');
  assert.match(readme, /pull requests?/i, 'README should mention pull request CI coverage');
});
