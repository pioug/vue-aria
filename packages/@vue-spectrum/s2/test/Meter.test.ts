import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Meter } from "../src/Meter";

describe("@vue-spectrum/s2 Meter", () => {
  it("renders baseline attrs and variant classes", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Meter, {
            label: "Usage",
            value: 66,
            variant: "critical",
          }),
      },
    });

    const meter = wrapper.get(".s2-Meter");
    expect(meter.attributes("role")).toBe("meter progressbar");
    expect(meter.attributes("aria-valuenow")).toBe("66");
    expect(meter.classes()).toContain("is-critical");
    expect(meter.text()).toContain("Usage");
  });
});
