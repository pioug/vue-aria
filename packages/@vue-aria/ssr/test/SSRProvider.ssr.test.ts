// @vitest-environment node

import { describe, expect, it } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { SSRProvider, useSSRSafeId } from "../src";

const Test = defineComponent({
  name: "SsrProviderRenderProbe",
  setup() {
    const id = useSSRSafeId();
    return () => h("div", { id });
  },
});

describe("SSRProvider SSR", () => {
  it("renders without errors", async () => {
    const app = createSSRApp({
      render() {
        return h(SSRProvider, null, {
          default: () => [h(Test), h(Test)],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });

  it("renders without errors with nested providers", async () => {
    const app = createSSRApp({
      render() {
        return h(SSRProvider, null, {
          default: () => [
            h(SSRProvider, null, { default: () => h(Test) }),
            h(SSRProvider, null, { default: () => h(Test) }),
          ],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });

  it("renders without errors with deeply nested providers", async () => {
    const app = createSSRApp({
      render() {
        return h(SSRProvider, null, {
          default: () => [
            h(SSRProvider, null, {
              default: () => [
                h(Test),
                h(SSRProvider, null, { default: () => h(Test) }),
              ],
            }),
            h(SSRProvider, null, {
              default: () => h(Test),
            }),
          ],
        });
      },
    });

    await expect(renderToString(app)).resolves.toBeTypeOf("string");
  });
});
