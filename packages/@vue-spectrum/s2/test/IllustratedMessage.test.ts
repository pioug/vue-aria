import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { IllustratedMessage } from "../src/IllustratedMessage";

describe("@vue-spectrum/s2 IllustratedMessage", () => {
  it("renders baseline attrs and slot content", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            IllustratedMessage,
            null,
            {
              default: () => [
                h("svg", { "data-testid": "illustration" }, [h("path")]),
                h("h3", "No results"),
                h("p", "Try a different query."),
              ],
            }
          ),
      },
    });

    const message = wrapper.get(".s2-IllustratedMessage");
    expect(message.classes()).toContain("spectrum-IllustratedMessage");
    expect(wrapper.find('[data-testid="illustration"]').exists()).toBe(true);
    expect(message.text()).toContain("No results");
    expect(message.text()).toContain("Try a different query.");
  });
});
