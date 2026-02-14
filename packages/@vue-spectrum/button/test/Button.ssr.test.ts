import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { ActionButton, Button, FieldButton, LogicButton } from "../src";

describe("Button SSR", () => {
  it.each([
    { name: "ActionButton", component: ActionButton },
    { name: "Button", component: Button },
    { name: "FieldButton", component: FieldButton },
    { name: "LogicButton", component: LogicButton },
  ])("$name renders without errors", async ({ component }) => {
    const app = createSSRApp({
      render() {
        return h(component as any, null, { default: () => "Button" });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
