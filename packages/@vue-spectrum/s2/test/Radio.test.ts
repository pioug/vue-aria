import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Radio } from "../src/Radio";
import { RadioGroup } from "../src/RadioGroup";

describe("@vue-spectrum/s2 Radio", () => {
  it("renders baseline attrs inside a group", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            RadioGroup,
            {
              "aria-label": "Pets",
            },
            {
              default: () => [
                h(
                  Radio,
                  {
                    value: "dogs",
                  },
                  {
                    default: () => "Dogs",
                  }
                ),
              ],
            }
          ),
      },
    });

    const radio = wrapper.get(".s2-Radio");
    expect(radio.classes()).toContain("spectrum-Radio");
    expect(radio.text()).toContain("Dogs");
    expect(wrapper.get('input[type="radio"]').attributes("value")).toBe("dogs");
  });
});
