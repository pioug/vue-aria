import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { Heading } from "@vue-spectrum/text";
import { describe, expect, it } from "vitest";
import { IllustratedMessage } from "../src";

describe("IllustratedMessage SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "IllustratedMessageSSRApp",
      setup() {
        return () =>
          h(IllustratedMessage, null, {
            default: () => h(Heading, null, () => "Message"),
          });
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html).toContain("spectrum-IllustratedMessage");
    expect(html).toContain("Message");
  });
});
