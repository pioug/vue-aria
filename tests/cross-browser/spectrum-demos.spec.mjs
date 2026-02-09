import { expect, test } from "@playwright/test";

test.describe("spectrum docs demos", () => {
  test("provider demo toggles color scheme and scale classes", async ({ page }) => {
    await page.goto("/spectrum/cross-browser-demos.html");

    const root = page.getByTestId("spectrum-provider-root");
    const scheme = page.getByTestId("spectrum-scheme");
    const scale = page.getByTestId("spectrum-scale");

    await expect(scheme).toHaveText("light");
    await expect(scale).toHaveText("medium");
    await expect(root).toHaveAttribute("class", /spectrum--light/);
    await expect(root).toHaveAttribute("class", /spectrum--medium/);

    await page.getByTestId("toggle-scheme").click();
    await expect(scheme).toHaveText("dark");
    await expect(root).toHaveAttribute("class", /spectrum--dark/);

    await page.getByTestId("toggle-scale").click();
    await expect(scale).toHaveText("large");
    await expect(root).toHaveAttribute("class", /spectrum--large/);
  });

  test("icon and illustration demos expose expected aria attributes", async ({ page }) => {
    await page.goto("/spectrum/cross-browser-demos.html");

    const labelledIcon = page.getByTestId("spectrum-icon-labelled");
    await expect(labelledIcon).toHaveAttribute("role", "img");
    await expect(labelledIcon).toHaveAttribute("aria-label", "workflow icon");
    await expect(labelledIcon).not.toHaveAttribute("aria-hidden", "true");

    const hiddenIcon = page.getByTestId("spectrum-icon-hidden");
    await expect(hiddenIcon).toHaveAttribute("aria-hidden", "true");
    await expect(hiddenIcon).not.toHaveAttribute("aria-label", /.+/);

    const labelledIllustration = page.getByTestId("spectrum-illustration-labelled");
    await expect(labelledIllustration).toHaveAttribute("role", "img");
    await expect(labelledIllustration).toHaveAttribute("aria-label", "sample illustration");

    const unlabelledIllustration = page.getByTestId("spectrum-illustration-unlabelled");
    await expect(unlabelledIllustration).not.toHaveAttribute("role", /.+/);
    await expect(unlabelledIllustration).not.toHaveAttribute("aria-label", /.+/);
  });

  test("ui icon demo updates scale with provider scale", async ({ page }) => {
    await page.goto("/spectrum/cross-browser-demos.html");

    const uiIcon = page.getByTestId("spectrum-ui-icon");
    const uiScale = page.getByTestId("spectrum-ui-icon-scale");

    await expect(uiScale).toHaveText("M");
    await expect(uiIcon).toHaveAttribute("scale", "M");

    await page.getByTestId("toggle-scale").click();

    await expect(uiScale).toHaveText("L");
    await expect(uiIcon).toHaveAttribute("scale", "L");
  });
});
