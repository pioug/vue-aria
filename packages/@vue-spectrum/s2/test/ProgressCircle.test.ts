import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ProgressCircle } from "../src/ProgressCircle";

describe("@vue-spectrum/s2 ProgressCircle", () => {
  it("renders baseline attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ProgressCircle, {
            "aria-label": "Loading circle",
            value: 75,
            size: "L",
          }),
      },
    });

    const progressCircle = wrapper.get(".s2-ProgressCircle");
    expect(progressCircle.attributes("role")).toBe("progressbar");
    expect(progressCircle.attributes("aria-valuenow")).toBe("75");
    expect(progressCircle.classes()).toContain("spectrum-CircleLoader--large");
  });
});
