import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { CloseButton } from "../src/CloseButton";

describe("@vue-spectrum/s2 CloseButton", () => {
  it("renders baseline close button attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(CloseButton, {
            size: "L",
          }),
      },
    });

    const button = wrapper.get("button");
    expect(button.classes()).toContain("s2-CloseButton");
    expect(button.attributes("data-s2-size")).toBe("L");
    expect(button.attributes("aria-label")).toBe("Dismiss");
    expect(button.text()).toContain("×");
  });

  it("supports press handling and disabled state", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();

    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(CloseButton, {
            onPress,
            isDisabled: true,
          }),
      },
    });

    const button = wrapper.get("button");
    expect(button.classes()).toContain("is-disabled");

    await user.click(button.element);
    expect(onPress).not.toHaveBeenCalled();
  });
});
