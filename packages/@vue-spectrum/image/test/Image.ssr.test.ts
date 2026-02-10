import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Image } from "../src";

describe("Image SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "ImageSSRApp",
      setup() {
        return () =>
          h(Image, {
            src: "https://i.imgur.com/Z7AzH2c.png",
            alt: "Sky and roof",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Image");
    expect(html).toContain("Sky and roof");
  });
});
