import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { StatusLight } from "../src/StatusLight";

describe("@vue-spectrum/s2 StatusLight", () => {
  it("renders baseline attrs and variant styles", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            StatusLight,
            {
              variant: "notice",
              role: "status",
            },
            {
              default: () => "Syncing",
            }
          ),
      },
    });

    const statusLight = wrapper.get(".s2-StatusLight");
    expect(statusLight.classes()).toContain("spectrum-StatusLight--notice");
    expect(statusLight.attributes("role")).toBe("status");
    expect(statusLight.text()).toContain("Syncing");
  });

  it("supports disabled state forwarding", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            StatusLight,
            {
              role: "status",
              isDisabled: true,
            },
            {
              default: () => "Offline",
            }
          ),
      },
    });

    const statusLight = wrapper.get(".s2-StatusLight");
    expect(statusLight.classes()).toContain("is-disabled");
  });
});
