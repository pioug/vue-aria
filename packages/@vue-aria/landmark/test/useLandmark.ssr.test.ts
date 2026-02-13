// @vitest-environment node

import { describe, expect, it } from "vitest";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { useLandmark } from "../src";

const Main = defineComponent({
  name: "LandmarkSsrMain",
  setup() {
    const elementRef = ref<HTMLElement | null>(null);
    const refAdapter = {
      get current() {
        return elementRef.value;
      },
      set current(value: Element | null) {
        elementRef.value = value as HTMLElement | null;
      },
    };
    const { landmarkProps } = useLandmark({ role: "main" }, refAdapter);
    return () => h("main", { ...landmarkProps, ref: elementRef });
  },
});

describe("useLandmark SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(Main);
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
