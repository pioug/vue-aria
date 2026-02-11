import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ActionButton } from "../src/ActionButton";

describe("@vue-spectrum/s2 ActionButton", () => {
  it("renders action button baseline attrs and pending state", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            ActionButton,
            {
              size: "XL",
              isPending: true,
            },
            {
              default: () => "Edit",
            }
          ),
      },
    });

    const button = wrapper.get("button");
    expect(button.classes()).toContain("s2-ActionButton");
    expect(button.attributes("data-s2-size")).toBe("XL");
    expect(button.attributes("data-s2-pending")).toBe("true");
    expect(button.classes()).toContain("is-disabled");
  });
});
