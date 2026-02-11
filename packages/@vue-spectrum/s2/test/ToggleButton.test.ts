import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ActionButtonGroup } from "../src/ActionButtonGroup";
import { ToggleButton } from "../src/ToggleButton";

describe("@vue-spectrum/s2 ToggleButton", () => {
  it("renders baseline attrs and toggles selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            ToggleButton,
            {
              size: "XL",
              onChange,
            },
            {
              default: () => "Toggle",
            }
          ),
      },
    });

    const button = wrapper.get("button");
    expect(button.classes()).toContain("s2-ToggleButton");
    expect(button.attributes("data-s2-size")).toBe("XL");
    expect(button.attributes("aria-pressed")).toBe("false");

    await user.click(button.element);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(button.attributes("aria-pressed")).toBe("true");
  });

  it("inherits group disabled and style defaults", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            ActionButtonGroup,
            {
              size: "S",
              isQuiet: true,
              isDisabled: true,
            },
            {
              default: () =>
                h(
                  ToggleButton,
                  {},
                  {
                    default: () => "Bold",
                  }
                ),
            }
          ),
      },
    });

    const button = wrapper.get("button");
    expect(button.classes()).toContain("is-disabled");
    expect(button.classes()).toContain("spectrum-ActionButton--quiet");
    expect(button.attributes("data-s2-size")).toBe("S");
  });
});
