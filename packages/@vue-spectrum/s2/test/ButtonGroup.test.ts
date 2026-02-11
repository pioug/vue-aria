import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Button } from "../src/Button";
import { ButtonGroup } from "../src/ButtonGroup";

describe("@vue-spectrum/s2 ButtonGroup", () => {
  it("renders group attrs and propagates disabled state to child buttons", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            ButtonGroup,
            {
              size: "L",
              isDisabled: true,
            },
            {
              default: () =>
                h(
                  Button,
                  {},
                  {
                    default: () => "One",
                  }
                ),
            }
          ),
      },
    });

    const group = wrapper.get(".s2-ButtonGroup");
    expect(group.attributes("data-s2-size")).toBe("L");

    const button = wrapper.get("button");
    expect(button.classes()).toContain("is-disabled");
  });
});
