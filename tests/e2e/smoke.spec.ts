import { test, expect } from "@playwright/test";

test("home page loads with hero content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sailors Football Academy" })).toBeVisible();
  await expect(page.getByText("#KASITEMPUR").first()).toBeVisible();
});

// Requires a seeded database (see prisma/seed.ts — creates the "home-kit"
// product this test targets directly rather than clicking through the grid).
test("add a product to cart and reach checkout", async ({ page }) => {
  await page.goto("/store/home-kit");
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page.getByRole("button", { name: /add to cart/i })).toHaveText(/added/i);

  await page.getByRole("button", { name: /open cart/i }).click();
  await page.getByRole("link", { name: /checkout/i }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByText("Sailors Home Kit")).toBeVisible();
});

// Requires a reachable database — the final step's Server Action creates an
// Application row via Prisma.
test("enrolment form can be filled out and submitted", async ({ page }) => {
  await page.goto("/enrol");

  await page.getByLabel("Player's Full Name").fill("Ahmad Test Player");
  await page.getByLabel("Date of Birth").fill("2015-06-15");
  await page.getByLabel("Gender").selectOption("Male");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Guardian's Full Name").fill("Siti Test Guardian");
  await page.getByLabel("Phone Number").fill("012-3456789");
  await page.getByLabel("Email Address").fill("siti.test@example.com");
  await page.getByLabel("Home Address").fill("123 Jalan Test, Bandar Rimbayu, Klang");
  await page.getByLabel("Emergency Contact Name").fill("Ali Test Emergency");
  await page.getByLabel("Emergency Contact Phone").fill("019-8765432");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel(/I have read and agree/i).check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: /submit application/i }).click();
  await expect(page.getByRole("heading", { name: /application submitted/i })).toBeVisible({ timeout: 10_000 });
});
