import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Menu } from "../src/Menu";

describe("@vue-spectrum/s2 Menu", () => {
  it("renders baseline attrs and menu items", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Menu, {
            "aria-label": "Actions",
            size: "L",
            items: [
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" },
            ],
          }),
      },
    });

    await wrapper.vm.$nextTick();

    const menu = wrapper.get('.s2-Menu[role="menu"]');
    expect(menu.attributes("data-s2-size")).toBe("L");
    expect(wrapper.findAll('[role="menuitem"]').length).toBe(2);
  });

  it("emits onAction when selecting an item", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Menu, {
            "aria-label": "Actions",
            items: [
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" },
            ],
            onAction,
          }),
      },
    });

    await wrapper.vm.$nextTick();
    const firstItem = wrapper.get('[role="menuitem"]');
    await user.click(firstItem.element);
    expect(onAction).toHaveBeenCalledWith("edit");
  });
});
