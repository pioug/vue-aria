import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ActionButton } from "../src/ActionButton";
import { ActionButtonGroup } from "../src/ActionButtonGroup";

describe("@vue-spectrum/s2 ActionButtonGroup", () => {
  it("propagates group defaults to child action buttons", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            ActionButtonGroup,
            {
              size: "L",
              density: "compact",
              isQuiet: true,
              isDisabled: true,
            },
            {
              default: () => [
                h(
                  ActionButton,
                  {},
                  {
                    default: () => "Bold",
                  }
                ),
                h(
                  ActionButton,
                  {},
                  {
                    default: () => "Italic",
                  }
                ),
              ],
            }
          ),
      },
    });

    const group = wrapper.get(".s2-ActionButtonGroup");
    expect(group.attributes("data-s2-size")).toBe("L");
    expect(group.attributes("data-s2-density")).toBe("compact");

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.classes()).toContain("is-disabled");
    expect(buttons[1]?.classes()).toContain("is-disabled");
    expect(buttons[0]?.classes()).toContain("spectrum-ActionButton--quiet");
    expect(buttons[0]?.attributes("data-s2-size")).toBe("L");
  });

  it("allows child action buttons to override disabled state", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            ActionButtonGroup,
            {
              isDisabled: true,
            },
            {
              default: () => [
                h(
                  ActionButton,
                  {
                    isDisabled: false,
                  },
                  {
                    default: () => "Bold",
                  }
                ),
                h(
                  ActionButton,
                  {},
                  {
                    default: () => "Italic",
                  }
                ),
              ],
            }
          ),
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.classes()).not.toContain("is-disabled");
    expect(buttons[1]?.classes()).toContain("is-disabled");
  });
});
