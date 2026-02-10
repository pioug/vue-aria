import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Avatar } from "../src";

describe("Avatar SSR", () => {
  it("renders without errors", async () => {
    const App = defineComponent({
      name: "AvatarSSRApp",
      setup() {
        return () =>
          h(Avatar, {
            src: "http://localhost/some_image.png",
            alt: "User avatar",
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Avatar");
    expect(html).toContain("User avatar");
  });
});
