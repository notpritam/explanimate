#!/usr/bin/env node
// ABOUTME: Generic Playwright UI gate for explanimate scenes: no canvas, no overlap, no button text overflow.
// ABOUTME: Usage: pnpm check:scene-ui <scene-id> [--w 1280] [--h 720]

import { mkdirSync } from "node:fs";
import { createServer } from "vite";
import { chromium } from "playwright";

function parseArgs(argv) {
  const opts = { ids: [], w: 1280, h: 720 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--w") opts.w = Number(argv[++i]);
    else if (arg === "--h") opts.h = Number(argv[++i]);
    else if (!arg.startsWith("-")) opts.ids.push(arg);
  }
  return opts;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function overlaps(a, b) {
  return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

async function assertSceneOverlay(page, id) {
  const overlay = page.locator("[data-scene-annotation-ui]");
  if ((await overlay.count()) === 0) return;

  await page.locator("[data-scene-replay-inline]").waitFor({ timeout: 2_000 });
  await page.locator("[data-scene-feedback-toggle]").waitFor({ timeout: 2_000 });

  const initialMode = await overlay.getAttribute("data-scene-mode");
  assert(initialMode === "idle", `${id}: annotation overlay must start idle`);

  const stageBox = await page.locator("[data-stage-root]").first().boundingBox();
  assert(stageBox, `${id}: missing stage box`);
  await page.mouse.click(stageBox.x + stageBox.width / 2, stageBox.y + stageBox.height / 2);
  assert((await page.locator("[data-scene-comment]").count()) === 0, `${id}: normal scene click created a comment`);

  await page.locator("[data-scene-feedback-toggle]").click();
  await page.locator("[data-scene-arm-comment]").click();
  assert((await overlay.getAttribute("data-scene-mode")) === "comment", `${id}: comment mode did not arm`);
  await page.mouse.click(stageBox.x + stageBox.width * 0.38, stageBox.y + stageBox.height * 0.42);
  assert((await page.locator("[data-scene-comment]").count()) === 1, `${id}: armed comment was not created`);
  assert((await overlay.getAttribute("data-scene-mode")) === "idle", `${id}: comment mode did not return to idle`);

  await page.locator("[data-scene-arm-highlight]").click();
  assert((await overlay.getAttribute("data-scene-mode")) === "highlight", `${id}: highlight mode did not arm`);
  await page.mouse.move(stageBox.x + stageBox.width * 0.48, stageBox.y + stageBox.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(stageBox.x + stageBox.width * 0.62, stageBox.y + stageBox.height * 0.56, { steps: 4 });
  await page.mouse.up();
  assert((await page.locator("[data-scene-highlight]").count()) === 1, `${id}: armed highlight was not created`);
  assert((await overlay.getAttribute("data-scene-mode")) === "idle", `${id}: highlight mode did not return to idle`);

  await page.locator("[data-scene-edit]").first().click();
  await page.locator("textarea").fill("Edited annotation");
  await page.locator("[data-scene-save-edit]").click();
  await page.locator("[data-scene-remove]").nth(1).click();
  assert((await page.locator("[data-scene-highlight]").count()) === 0, `${id}: remove did not delete annotation`);

  await page.locator("[data-scene-replay]").click();
  await page.waitForTimeout(2400);
  assert((await overlay.getAttribute("data-scene-mode")) === "idle", `${id}: replay left annotation mode armed`);
}

const opts = parseArgs(process.argv.slice(2));
if (opts.ids.length === 0) {
  console.error("usage: pnpm check:scene-ui <scene-id> [--w 1280] [--h 720]");
  process.exit(1);
}

let server = null;
let browser = null;

try {
  server = await createServer({ server: { port: 0 }, logLevel: "silent" });
  await server.listen();
  const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, "");

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: opts.w, height: opts.h } });
  mkdirSync("shots", { recursive: true });

  for (const id of opts.ids) {
    await page.goto(`${baseUrl}/#/scene/${id}`, { waitUntil: "networkidle" });
    await page.locator('[data-scene-ready="true"]').first().waitFor({ timeout: 10_000 });
    await page.evaluate(() => document.fonts.ready);

    const canvasElements = await page.locator("[data-stage-root] canvas").count();
    assert(canvasElements === 0, `${id}: scene surfaces must not contain canvas`);
    await assertSceneOverlay(page, id);

    const criticalBoxes = await page.locator("[data-ui-critical], [data-review-critical]").evaluateAll((nodes) =>
      nodes.map((node, index) => {
        const rect = node.getBoundingClientRect();
        return { index, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }),
    );
    for (let i = 0; i < criticalBoxes.length; i += 1) {
      for (let j = i + 1; j < criticalBoxes.length; j += 1) {
        assert(
          !overlaps(criticalBoxes[i], criticalBoxes[j]),
          `${id}: critical sections ${criticalBoxes[i].index} and ${criticalBoxes[j].index} overlap`,
        );
      }
    }

    const overflowingButtons = await page.locator("button").evaluateAll((buttons) =>
      buttons
        .filter((button) => button.getClientRects().length > 0)
        .filter((button) => button.scrollWidth > button.clientWidth || button.scrollHeight > button.clientHeight)
        .map((button) => button.textContent?.trim() ?? ""),
    );
    assert(overflowingButtons.length === 0, `${id}: button text overflows: ${overflowingButtons.join(", ")}`);

    await page.screenshot({ path: `shots/${id}-ui.png`, fullPage: false });
    console.log(`✓ shots/${id}-ui.png`);
  }
} finally {
  if (browser) await browser.close();
  if (server) await server.close();
}
