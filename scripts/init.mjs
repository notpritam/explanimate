#!/usr/bin/env node
// ABOUTME: Scaffolds an explanimate studio into a consumer project by copying templates/studio.
// ABOUTME: Usage: node <skill-path>/scripts/init.mjs [target-dir] [--force]. Copies files only; prints next steps.

import { cpSync, existsSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(here, "..", "templates", "studio");

const force = process.argv.includes("--force");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const target = resolve(args[0] ?? "explanimate-studio");

if (existsSync(target) && readdirSync(target).length > 0 && !force) {
  console.error(`✗ ${target} already exists and is not empty.`);
  console.error("  Use the existing studio (it IS the project's scene gallery) or pass --force to overwrite.");
  process.exit(1);
}

const SKIP = new Set(["node_modules", "dist", "out", "shots", "pnpm-lock.yaml", ".DS_Store"]);
cpSync(TEMPLATE, target, {
  recursive: true,
  filter: (src) => !SKIP.has(basename(src)),
});

const rel = relative(process.cwd(), target) || ".";
console.log(`✓ explanimate studio scaffolded at ${rel}`);
console.log("");
console.log("Next steps:");
console.log(`  cd ${rel}`);
console.log("  pnpm install && pnpm exec playwright install chromium");
console.log("  pnpm dev           # gallery + scenes + video player");
console.log("  pnpm shoot --all   # verify the example scene renders");
