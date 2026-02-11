import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ComboBox } from "../src/ComboBox";

describe("@vue-spectrum/s2 ComboBox", () => {
  it("renders baseline attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ComboBox, {
            label: "Option",
            size: "L",
            items: [
              { key: "1", label: "One" },
              { key: "2", label: "Two" },
            ],
          }),
      },
    });

    const root = wrapper.get(".s2-ComboBox");
    expect(root.classes()).toContain("s2-ComboBox--L");
    expect(wrapper.get('[role="combobox"]').element).toBeInstanceOf(HTMLInputElement);
  });

  it("opens listbox and emits selection changes", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ComboBox, {
            label: "Option",
            items: [
              { key: "1", label: "One" },
              { key: "2", label: "Two" },
            ],
            onSelectionChange,
          }),
      },
    });

    const button = wrapper.get("button");
    await user.click(button.element);
    expect(wrapper.get('[role="listbox"]').element).toBeInstanceOf(HTMLElement);

    const firstOption = wrapper.get('[role="option"]');
    await user.click(firstOption.element);
    expect(onSelectionChange).toHaveBeenCalledWith("1");
  });
});
