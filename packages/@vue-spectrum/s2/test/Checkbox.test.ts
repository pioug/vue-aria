import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Checkbox } from "../src/Checkbox";

describe("@vue-spectrum/s2 Checkbox", () => {
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
            Checkbox,
            {
              onChange,
            },
            {
              default: () => "Subscribe",
            }
          ),
      },
    });

    const checkbox = wrapper.get(".s2-Checkbox");
    expect(checkbox.classes()).toContain("spectrum-Checkbox");
    expect(checkbox.text()).toContain("Subscribe");

    const input = wrapper.get('input[type="checkbox"]');
    expect((input.element as HTMLInputElement).checked).toBe(false);
    await user.click(input.element);
    expect(onChange).toHaveBeenCalledWith(true);
    expect((input.element as HTMLInputElement).checked).toBe(true);
  });
});
