import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { MenuTrigger } from "../src/Menu";

describe("@vue-spectrum/s2 MenuTrigger", () => {
  it("renders baseline attrs on trigger wrapper", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(MenuTrigger, {
            triggerLabel: "Menu Button",
            size: "M",
            isQuiet: true,
            items: [{ key: "edit", label: "Edit" }],
          }),
      },
    });

    await wrapper.vm.$nextTick();

    const triggerWrapper = wrapper.get(".s2-MenuTrigger");
    expect(triggerWrapper.attributes("data-s2-size")).toBe("M");
    expect(triggerWrapper.attributes("data-s2-quiet")).toBe("true");
    expect(wrapper.get('button[aria-haspopup="menu"]').text()).toContain("Menu Button");
  });

  it("opens menu and emits item action callbacks", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(MenuTrigger, {
            triggerLabel: "Menu Button",
            items: [
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" },
            ],
            onAction,
          }),
      },
    });

    try {
      await wrapper.vm.$nextTick();
      await user.click(wrapper.get('button[aria-haspopup="menu"]').element);

      const editItem = document.body.querySelector('[role="menuitem"]');
      expect(editItem).not.toBeNull();
      await user.click(editItem as Element);

      expect(onAction).toHaveBeenCalledWith("edit");
    } finally {
      wrapper.unmount();
    }
  });
});
