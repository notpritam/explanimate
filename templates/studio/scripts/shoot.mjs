#!/usr/bin/env node
// ABOUTME: Screenshot scenes for the verify loop — boots Vite on a free port, drives Playwright, writes shots/<id>.png.
// ABOUTME: Usage: pnpm shoot <scene-id…|--all> [--settle 2500] [--out shots] [--w 1280] [--h 720] [--url <running-server>]

import { mkdirSync } from "node:fs";
import { createServer } from "vite";
import { chromium } from "playwright";

function parseArgs(argv) {
  const opts = { ids: [], all: false, settle: 2500, out: "shots", w: 1280, h: 720, url: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all") opts.all = true;
    else if (a === "--settle") opts.settle = Number(argv[++i]);
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--w") opts.w = Number(argv[++i]);
    else if (a === "--h") opts.h = Number(argv[++i]);
    else if (a === "--url") opts.url = argv[++i];
    else if (!a.startsWith("-")) opts.ids.push(a);
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.all && opts.ids.length === 0) {
  console.error("usage: pnpm shoot <scene-id…|--all> [--settle ms] [--out dir] [--w px] [--h px] [--url url]");
  process.exit(1);
}

let server = null;
let browser = null;

try {
  let baseUrl = opts.url;
  if (!baseUrl) {
    server = await createServer({ server: { port: 0 }, logLevel: "silent" });
    await server.listen();
    baseUrl = server.resolvedUrls.local[0];
  }
  baseUrl = baseUrl.replace(/\/$/, "");

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: opts.w, height: opts.h } });
  await page.addInitScript(() => {
    window.__EXPLANIMATE_SHOT__ = true;
  });

  let ids = opts.ids;
  if (opts.all) {
    await page.goto(`${baseUrl}/#/`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => Array.isArray(window.__SCENES__));
    ids = await page.evaluate(() => window.__SCENES__);
    if (ids.length === 0) {
      console.error("no scenes registered in src/scenes/registry.ts");
      process.exit(1);
    }
  }

  mkdirSync(opts.out, { recursive: true });

  for (const id of ids) {
    await page.goto(`${baseUrl}/#/scene/${id}?shot=1`, { waitUntil: "networkidle" });
    const ready = page.locator('[data-scene-ready="true"]');
    try {
      await ready.first().waitFor({ timeout: 10_000 });
    } catch {
      console.error(`✗ ${id}: no [data-scene-ready] stage appeared — is the id registered? (10s timeout)`);
      process.exitCode = 1;
      continue;
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(opts.settle);
    const path = `${opts.out}/${id}.png`;
    await page.locator("[data-stage-root]").first().screenshot({ path });
    console.log(`✓ ${path}`);
  }
} finally {
  if (browser) await browser.close();
  if (server) await server.close();
}
