import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { Content, Header } from "@vue-spectrum/view";
import { describe, expect, it } from "vitest";
import { InlineAlert } from "../src";

describe("InlineAlert SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "InlineAlertSSRApp",
      setup() {
        return () =>
          h(InlineAlert, null, {
            default: () => [
              h(Header, null, () => "Title"),
              h(Content, null, () => "Content"),
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-InLineAlert");
    expect(html).toContain("Title");
    expect(html).toContain("Content");
  });
});
