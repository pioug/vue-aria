import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Image } from "@vue-spectrum/image";
import { Heading, Text } from "@vue-spectrum/text";
import { Content } from "@vue-spectrum/view";
import { Card } from "../src";

describe("Card SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "CardSSRApp",
      setup() {
        return () =>
          h(
            Card,
            {},
            {
              default: () => [
                h(Image, { src: "https://i.imgur.com/Z7AzH2c.jpg" }),
                h(Heading, () => "Title"),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Card");
  });
});
