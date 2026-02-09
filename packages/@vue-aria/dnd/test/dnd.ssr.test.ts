import { describe, expect, it } from "vitest";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "@vue/server-renderer";
import { useDrag } from "../src/useDrag";
import { useDrop } from "../src/useDrop";

describe("useDrag/useDrop SSR", () => {
  it("renders without throwing", async () => {
    const App = defineComponent({
      setup() {
        const dropRef = ref<HTMLElement | null>(null);
        const { dragProps } = useDrag({
          getItems: () => [{ "text/plain": "hello world" }],
        });
        const { dropProps } = useDrop({
          ref: dropRef,
        });

        return () =>
          h("div", [
            h("button", dragProps, "Drag me"),
            h("div", { ...dropProps, ref: dropRef }, "Drop here"),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("Drag me");
    expect(html).toContain("Drop here");
  });
});
