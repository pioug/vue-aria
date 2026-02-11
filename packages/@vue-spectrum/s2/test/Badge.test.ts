import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Badge } from "../src/Badge";

describe("@vue-spectrum/s2 Badge", () => {
  it("renders baseline attrs and variant styles", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Badge,
            {
              variant: "positive",
            },
            {
              default: () => "Ready",
            }
          ),
      },
    });

    const badge = wrapper.get(".s2-Badge");
    expect(badge.classes()).toContain("spectrum-Badge--positive");
    expect(badge.text()).toContain("Ready");
  });
});
