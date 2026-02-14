import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Checkbox, CheckboxGroup } from "../src";

describe("Checkbox SSR", () => {
  it.each([
    { name: "Checkbox", component: Checkbox },
    { name: "CheckboxGroup", component: CheckboxGroup, props: { "aria-label": "Choices" } },
  ])("$name renders without errors", async ({ component, props }) => {
    const app = createSSRApp({
      render() {
        return h(component as any, props ?? null, { default: () => "Checkbox" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
