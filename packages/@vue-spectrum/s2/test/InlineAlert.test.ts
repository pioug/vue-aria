import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { InlineAlert } from "../src/InlineAlert";

describe("@vue-spectrum/s2 InlineAlert", () => {
  it("renders baseline attrs and variant styles", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            InlineAlert,
            {
              variant: "notice",
            },
            {
              default: () => [
                h("h3", "Attention"),
                h("p", "Review required"),
              ],
            }
          ),
      },
    });

    const alert = wrapper.get(".s2-InlineAlert");
    expect(alert.attributes("role")).toBe("alert");
    expect(alert.classes()).toContain("spectrum-InLineAlert--notice");
    expect(alert.text()).toContain("Attention");
    expect(alert.text()).toContain("Review required");
  });
});
