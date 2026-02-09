import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/packages/overview.html",
  "/packages/interactions.html",
  "/packages/overlays.html",
  "/packages/dnd.html",
  "/porting/cross-browser-demos.html",
  "/spectrum/cross-browser-demos.html",
  "/spectrum/form.html",
  "/spectrum/label.html",
  "/spectrum/text.html",
];

for (const route of routes) {
  test(`loads ${route} without console errors`, async ({ page }) => {
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
}

test("supports keyboard navigation to package links", async ({ page }) => {
  await page.goto("/packages/overview.html");
  const packageLink = page.locator("a[href*='/packages/interactions']").first();
  await expect(packageLink).toBeVisible();
  await packageLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/packages\/interactions(?:\.html)?$/);
});
