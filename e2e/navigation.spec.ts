import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ChicPets/);
  await expect(page.locator("header")).toBeVisible();
});

test("booking page loads", async ({ page }) => {
  await page.goto("/#/agendar");
  await expect(page.locator("text=Reserve o horário")).toBeVisible();
});

test("login page loads", async ({ page }) => {
  await page.goto("/#/login");
  await expect(page.locator("text=Painel de gestão")).toBeVisible();
});
