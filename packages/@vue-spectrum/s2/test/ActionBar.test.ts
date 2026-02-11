import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { ActionBar } from "../src/ActionBar";
import { Provider } from "../src/Provider";

const items = [
  { key: "edit", label: "Edit" },
  { key: "copy", label: "Copy" },
];

describe("@vue-spectrum/s2 ActionBar", () => {
  it("renders baseline class with toolbar semantics", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ActionBar, {
            selectedItemCount: 1,
            items,
          }),
      },
    });

    await wrapper.vm.$nextTick();

    wrapper.get(".s2-ActionBar");
    expect(wrapper.get('[role="toolbar"]').attributes("aria-label")).toBe("Actions");
  });

  it("calls onClearSelection from clear button", async () => {
    const user = userEvent.setup();
    const onClearSelection = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ActionBar, {
            selectedItemCount: 1,
            items,
            onClearSelection,
          }),
      },
    });

    await wrapper.vm.$nextTick();
    await user.click(wrapper.get('[aria-label="Clear selection"]').element);
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });
});
