import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { NumberField } from "../src/NumberField";

describe("@vue-spectrum/s2 NumberField", () => {
  it("renders baseline attrs with step buttons", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(NumberField, {
            "aria-label": "Amount",
            defaultValue: 2,
            size: "M",
          }),
      },
    });

    const root = wrapper.get(".s2-NumberField");
    expect(root.classes()).toContain("s2-NumberField--M");
    expect(wrapper.findAll('[role="button"]').length).toBe(2);
  });

  it("emits value changes from input and step buttons", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(NumberField, {
            "aria-label": "Amount",
            defaultValue: 1,
            step: 2,
            onChange,
          }),
      },
    });

    const input = wrapper.get('input[type="text"]');
    await input.setValue("7");
    await input.trigger("blur");
    expect(onChange).toHaveBeenCalled();

    const [incrementButton] = wrapper.findAll('[role="button"]');
    await user.click(incrementButton!.element);
    expect(onChange).toHaveBeenLastCalledWith(9);
  });
});
