#!/usr/bin/env node
// ABOUTME: Enforces the ABOUTME file-header convention on every source file in the repo.
// ABOUTME: A file must begin (within its first 15 lines) with >=2 lines containing "ABOUTME:".
// ABOUTME: Run with explicit paths (lint-staged) or with no args to scan the whole tree.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";

const ROOT = process.cwd();
const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const IGNORE_DIRS = new Set(["node_modules", "dist", "build", ".git", "coverage", "out", "shots"]);
// Generated / framework-owned files we do not author headers into.
const IGNORE_FILE = /(^|\/)(vite-env\.d\.ts|.*\.d\.ts|index\.html)$/;

const MIN_ABOUTME_LINES = 2;
const SCAN_LINES = 15;

function isSource(file) {
  return SOURCE_EXT.has(extname(file)) && !IGNORE_FILE.test(file);
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (isSource(full)) yield full;
  }
}

function hasHeader(file) {
  const head = readFileSync(file, "utf8").split("\n", SCAN_LINES);
  const count = head.filter((l) => l.includes("ABOUTME:")).length;
  return count >= MIN_ABOUTME_LINES;
}

const argv = process.argv.slice(2).filter(isSource);
const files = argv.length > 0 ? argv : [...walk(ROOT)];

const offenders = files.filter((f) => {
  try {
    return !hasHeader(f);
  } catch {
    return false;
  }
});

if (offenders.length > 0) {
  console.error("\n✗ Missing ABOUTME header (need >=2 lines containing 'ABOUTME:' in the first 15 lines):\n");
  for (const f of offenders) console.error("   " + relative(ROOT, f));
  console.error("\n  Header template:\n");
  console.error("   // ABOUTME: <what this file does, line 1>");
  console.error("   // ABOUTME: <continued — why it exists / key responsibility>\n");
  process.exit(1);
}

if (argv.length === 0) console.log(`✓ headers OK (${files.length} files scanned)`);
