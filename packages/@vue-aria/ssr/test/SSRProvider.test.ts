import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { SSRProvider, useSSRSafeId } from "../src";

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
    expect(divs[0].attributes("id")).toMatch(/^react-aria/);
    expect(divs[0].attributes("id")).not.toBe(divs[1].attributes("id"));
  });

  it("generates unique ids with nested providers", () => {
    const App = defineComponent({
      setup() {
        return () => h(SSRProvider, null, {
          default: () => [
            h(Test),
            h(SSRProvider, null, { default: () => [h(Test), h(SSRProvider, null, { default: () => h(Test) })] }),
            h(Test),
          ],
        });
      },
    });

    const wrapper = mount(App);
    const ids = wrapper.findAll('[data-testid="test"]').map((node) => node.attributes("id"));

    expect(new Set(ids).size).toBe(ids.length);
  });
});
