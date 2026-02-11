import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ProgressBar } from "../src/ProgressBar";

describe("@vue-spectrum/s2 ProgressBar", () => {
  it("renders baseline attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ProgressBar, {
            label: "Loading",
            value: 40,
          }),
      },
    });

    const progressBar = wrapper.get(".s2-ProgressBar");
    expect(progressBar.attributes("role")).toBe("progressbar");
    expect(progressBar.attributes("aria-valuenow")).toBe("40");
    expect(progressBar.text()).toContain("Loading");
  });
});
