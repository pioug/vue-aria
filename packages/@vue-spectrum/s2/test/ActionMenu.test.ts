import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { ActionMenu } from "../src/ActionMenu";

describe("@vue-spectrum/s2 ActionMenu", () => {
  it("renders baseline attrs with default trigger aria-label", () => {
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ActionMenu, {
            items: [{ key: "edit", label: "Edit" }],
            size: "L",
            menuSize: "S",
          }),
      },
    });

    const menu = wrapper.get(".s2-ActionMenu");
    expect(menu.attributes("data-s2-size")).toBe("L");
    expect(menu.attributes("data-s2-menu-size")).toBe("S");

    const trigger = wrapper.get("button");
    expect(trigger.attributes("aria-label")).toBe("More actions");
  });

  it("opens menu and emits action callbacks", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ActionMenu, {
            items: [
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" },
            ],
            onAction,
        }),
      },
    });

    try {
      const trigger = wrapper.get("button");
      await user.click(trigger.element);

      const editItem = document.body.querySelector('[role="menuitem"]');
      expect(editItem).not.toBeNull();
      await user.click(editItem as Element);

      expect(onAction).toHaveBeenCalledWith("edit");
    } finally {
      wrapper.unmount();
    }
  });
});
