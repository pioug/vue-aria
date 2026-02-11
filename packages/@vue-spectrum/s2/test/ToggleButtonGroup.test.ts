import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ToggleButton } from "../src/ToggleButton";
import { ToggleButtonGroup } from "../src/ToggleButtonGroup";

describe("@vue-spectrum/s2 ToggleButtonGroup", () => {
  it("can disable all toggle buttons from the group", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            ToggleButtonGroup,
            {
              size: "M",
              isDisabled: true,
            },
            {
              default: () => [
                h(
                  ToggleButton,
                  {},
                  {
                    default: () => "Bold",
                  }
                ),
                h(
                  ToggleButton,
                  {},
                  {
                    default: () => "Italic",
                  }
                ),
                h(
                  ToggleButton,
                  {},
                  {
                    default: () => "Underline",
                  }
                ),
              ],
            }
          ),
      },
    });

    const group = wrapper.get(".s2-ToggleButtonGroup");
    expect(group.attributes("data-s2-size")).toBe("M");

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0]?.classes()).toContain("is-disabled");
    expect(buttons[1]?.classes()).toContain("is-disabled");
    expect(buttons[2]?.classes()).toContain("is-disabled");
  });

  it("propagates quiet and emphasized style defaults", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            ToggleButtonGroup,
            {
              isQuiet: true,
              isEmphasized: true,
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
    expect(button.classes()).toContain("spectrum-ActionButton--quiet");
    expect(button.classes()).toContain("spectrum-ActionButton--emphasized");
  });
});
