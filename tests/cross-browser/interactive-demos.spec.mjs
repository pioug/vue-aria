import { expect, test } from "@playwright/test";

test.describe("interactive docs demos", () => {
  test("press demo handles pointer and keyboard activation", async ({ page }) => {
    await page.goto("/porting/cross-browser-demos.html");

    const target = page.getByTestId("press-target");
    const count = page.getByTestId("press-count");
    const pointerType = page.getByTestId("press-pointer-type");

    await expect(count).toHaveText("0");
    await expect(pointerType).toHaveText("none");

    await target.click();
    await expect(count).toHaveText("1");
    await expect(pointerType).toHaveText("mouse");

    await target.focus();
    await page.keyboard.press("Enter");
    await expect(count).toHaveText("2");
    await expect(pointerType).toHaveText("keyboard");

    await page.keyboard.press("Space");
    await expect(count).toHaveText("3");
    await expect(pointerType).toHaveText("keyboard");
  });

  test("tabs demo supports keyboard navigation and click selection", async ({ page }) => {
    await page.goto("/porting/cross-browser-demos.html");

    const overviewTab = page.getByTestId("tab-overview");
    const apiTab = page.getByTestId("tab-api");
    const statusTab = page.getByTestId("tab-status");
    const panel = page.getByTestId("tabs-panel");

    await expect(overviewTab).toHaveAttribute("aria-selected", "true");
    await expect(panel).toContainText("Overview panel content");

    await overviewTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(apiTab).toHaveAttribute("aria-selected", "true");
    await expect(panel).toContainText("API panel content");

    await page.keyboard.press("End");
    await expect(statusTab).toHaveAttribute("aria-selected", "true");
    await expect(panel).toContainText("Status panel content");

    await page.keyboard.press("Home");
    await expect(overviewTab).toHaveAttribute("aria-selected", "true");
    await expect(panel).toContainText("Overview panel content");

    await statusTab.click();
    await expect(statusTab).toHaveAttribute("aria-selected", "true");
    await expect(panel).toContainText("Status panel content");
  });
});
