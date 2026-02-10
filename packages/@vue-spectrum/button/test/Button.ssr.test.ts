import { createSSRApp, defineComponent, h, type Component } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ActionButton, Button, FieldButton, LogicButton } from "../src";

describe("Button SSR", () => {
  it.each([
    ["ActionButton", ActionButton],
    ["Button", Button],
    ["FieldButton", FieldButton],
    ["LogicButton", LogicButton],
  ])("%s renders without errors", async (_name, component) => {
    const App = defineComponent({
      name: "ButtonSSRApp",
      setup() {
        return () => h(component as Component, null, () => "Button");
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("Button");
  });
});
