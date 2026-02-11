import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Radio } from "../src/Radio";
import { RadioGroup } from "../src/RadioGroup";

describe("@vue-spectrum/s2 RadioGroup", () => {
  it("renders baseline attrs and emits selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
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
              onChange,
              orientation: "horizontal",
            },
            {
              default: () => [
                h(Radio, { value: "dogs" }, { default: () => "Dogs" }),
                h(Radio, { value: "cats" }, { default: () => "Cats" }),
              ],
            }
          ),
      },
    });

    const group = wrapper.get(".s2-RadioGroup");
    expect(group.attributes("role")).toBe("radiogroup");
    expect(group.classes()).toContain("spectrum-FieldGroup-group--horizontal");

    await user.click(wrapper.get('label.s2-Radio input[value="dogs"]').element);
    expect(onChange).toHaveBeenCalledWith("dogs");
    expect(
      (wrapper.get('label.s2-Radio input[value="dogs"]').element as HTMLInputElement).checked
    ).toBe(true);
  });
});
