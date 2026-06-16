import { test, expect } from "@playwright/test";

// Pre-answer the intro prefs (reduced motion + sound off) and mark the boot
// seen, so the cinematic/prompt don't gate the tests.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("az_motion_v1", "reduced");
    localStorage.setItem("az_sound_v1", "off");
    localStorage.setItem("az_boot_seen_v1", "1");
  });
});

test("title screen renders and the menu navigates to a screen", async ({ page }) => {
  await page.goto("/");
  const start = page.getByRole("link", { name: /START/ });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page).toHaveURL(/\/player$/);
  await expect(page.getByText(/Melbourne/)).toBeVisible();
});

test("deep-linking /work renders the work content and both demos", async ({ page }) => {
  await page.goto("/work");
  await expect(page.getByText("AI Command Center")).toBeVisible();
  await expect(page.getByText(/AGENT CONSOLE/)).toBeVisible();
  await expect(page.getByText(/DATASET QUALITY ANALYZER/)).toBeVisible();
});

test("every screen route is reachable and has a level heading", async ({ page }) => {
  for (const path of ["/player", "/stats", "/campaign", "/contact"]) {
    await page.goto(path);
    // the real per-route <h1> is present in the document
    await expect(page.locator("h1")).toHaveCount(1);
  }
});

test("Escape returns to the title screen", async ({ page }) => {
  await page.goto("/stats");
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);
});

test("side quest forges a custom order via specialization", async ({ page }) => {
  await page.goto("/quest");
  await page.getByRole("button", { name: /AGENTIC AI/ }).click();
  await page.getByRole("radio", { name: /RAG · KNOWLEDGE/ }).click();
  await page.getByRole("button", { name: /FORGE IT/ }).click();
  // reduced motion (set in beforeEach) skips the minigame → straight to result
  await expect(page.getByText(/ORDER COMPLETE/)).toBeVisible();
  await expect(page.getByText(/RAG RETRIEVAL/)).toBeVisible();
  await expect(page.getByRole("link", { name: /EMAIL ME/ })).toBeVisible();
});

test("contact exposes email, resume and LinkedIn (GitHub hidden)", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: /EMAIL/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /RESUME/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /LINKEDIN/ })).toBeVisible();
  await expect(page.getByText(/GITHUB/)).toHaveCount(0);
});
