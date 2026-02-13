import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { SSRProvider, useIsSSR, useSSRSafeId } from "../src";

const Test = defineComponent({
  name: "SsrIdProbe",
  setup() {
    const id = useSSRSafeId();
    return () => h("div", { "data-testid": "test", id });
  },
});

describe("SSRProvider", () => {
  it("generates consistent unique ids", () => {
    const App = defineComponent({
      setup() {
        return () => h(SSRProvider, null, {
          default: () => [h(Test), h(Test)],
        });
      },
    });

    const wrapper = mount(App);
    const divs = wrapper.findAll('[data-testid="test"]');

    expect(divs).toHaveLength(2);
    expect(divs[0].attributes("id")).toBe("react-aria-1");
    expect(divs[1].attributes("id")).toBe("react-aria-2");
  });

  it("generates deterministic unique ids with nested providers", () => {
    const App = defineComponent({
      setup() {
        return () => h(SSRProvider, null, {
          default: () => [
            h(Test),
            h(SSRProvider, null, { default: () => [h(Test), h(SSRProvider, null, { default: () => h(Test) })] }),
            h(Test),
            h(SSRProvider, null, { default: () => h(Test) }),
          ],
        });
      },
    });

    const wrapper = mount(App);
    const ids = wrapper.findAll('[data-testid="test"]').map((node) => node.attributes("id"));

    expect(ids).toEqual([
      "react-aria-1",
      "react-aria-2-1",
      "react-aria-2-2-1",
      "react-aria-3",
      "react-aria-4-1",
    ]);
  });

  it("generates a random prefix outside SSRProvider in production mode", () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const wrapper = mount(Test);
    const id = wrapper.get('[data-testid="test"]').attributes("id");

    expect(id).toMatch(/^react-aria\d+-\d+$/);
    process.env.NODE_ENV = env;
  });

  it("does not generate a random prefix outside SSRProvider in test mode", () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";

    const wrapper = mount(Test);
    const id = wrapper.get('[data-testid="test"]').attributes("id");

    expect(id).toMatch(/^react-aria-\d+$/);
    process.env.NODE_ENV = env;
  });

  it("returns SSR state during server render", async () => {
    const Probe = defineComponent({
      setup() {
        const isSSR = useIsSSR();
        return () => h("div", { "data-testid": "state" }, isSSR ? "ssr" : "client");
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(SSRProvider, null, { default: () => h(Probe) });
      },
    });

    const ssrApp = createSSRApp(App);
    const html = await renderToString(ssrApp);
    expect(html).toContain("ssr");
  });

  it("returns client state without provider in browser environments", () => {
    const Probe = defineComponent({
      setup() {
        const isSSR = useIsSSR();
        return () => h("div", { "data-testid": "state" }, isSSR ? "ssr" : "client");
      },
    });

    const wrapper = mount(Probe);
    expect(wrapper.get('[data-testid="state"]').text()).toBe("client");
  });
});
