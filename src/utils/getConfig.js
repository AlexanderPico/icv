import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export function getConfig() {
  const filePath = path.resolve(process.cwd(), 'icv.config.yaml');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw);
} 