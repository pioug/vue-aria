import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Checkbox } from "../src/Checkbox";
import { CheckboxGroup } from "../src/CheckboxGroup";

describe("@vue-spectrum/s2 CheckboxGroup", () => {
  it("renders baseline attrs and emits value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            CheckboxGroup,
            {
              "aria-label": "Pets",
              onChange,
              orientation: "horizontal",
            },
            {
              default: () => [
                h(Checkbox, { value: "dogs" }, { default: () => "Dogs" }),
                h(Checkbox, { value: "cats" }, { default: () => "Cats" }),
              ],
            }
          ),
      },
    });

    const group = wrapper.get(".s2-CheckboxGroup");
    expect(group.attributes("role")).toBe("group");
    expect(group.classes()).toContain("spectrum-FieldGroup-group--horizontal");

    const dogsInput = wrapper.get('input[value="dogs"]');
    await user.click(dogsInput.element);
    expect(onChange).toHaveBeenCalledWith(["dogs"]);
    expect((dogsInput.element as HTMLInputElement).checked).toBe(true);
  });
});
