import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { ActionMenu } from "../src/ActionMenu";
import { Item } from "../src/Item";
import { Tooltip } from "@vue-spectrum/tooltip";
import { TooltipTrigger } from "@vue-spectrum/tooltip";
import { setInteractionModality } from "@vue-aria/interactions";

describe("ActionMenu", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders default aria-label and handles action", async () => {
    const onAction = vi.fn();
    const wrapper = mount(ActionMenu as any, {
      props: {
        onAction,
      },
      slots: {
        default: () => [
          h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
          h(Item as any, { key: "Bar" }, { default: () => "Bar" }),
          h(Item as any, { key: "Baz" }, { default: () => "Baz" }),
        ],
      },
      attachTo: document.body,
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("More actions");

    await button.trigger("click");

    const menuItem = document.body.querySelector('[role="menuitem"]') as HTMLElement | null;
    expect(menuItem?.textContent).toContain("Foo");

    menuItem?.click();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("supports custom aria-label", () => {
    const wrapper = mount(ActionMenu as any, {
      props: {
        ariaLabel: "Custom Aria Label",
      },
      slots: {
        default: () => [
          h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.get("button").attributes("aria-label")).toBe("Custom Aria Label");
  });

  it("renders menu popover in a provided portal container", async () => {
    const portalContainer = document.createElement("div");
    document.body.appendChild(portalContainer);

    const wrapper = mount(ActionMenu as any, {
      props: {
        portalContainer,
      },
      slots: {
        default: () => [h(Item as any, { key: "Foo" }, { default: () => "Foo" })],
      },
      attachTo: document.body,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const popover = portalContainer.querySelector(".spectrum-Menu-popover");
    expect(popover).toBeTruthy();
    expect(document.body.querySelectorAll(".spectrum-Menu-popover")).toHaveLength(1);
  });

  it("is disabled", async () => {
    const onAction = vi.fn();
    const wrapper = mount(ActionMenu as any, {
      props: {
        isDisabled: true,
        onAction,
      },
      slots: {
        default: () => [h(Item as any, { key: "Foo" }, { default: () => "Foo" })],
      },
      attachTo: document.body,
    });

    const button = wrapper.get("button");
    expect(button.attributes("disabled")).toBeDefined();

    await button.trigger("click");
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(onAction).not.toHaveBeenCalled();
  });

  it("supports autofocus", async () => {
    const wrapper = mount(ActionMenu as any, {
      props: {
        autoFocus: true,
      },
      slots: {
        default: () => [h(Item as any, { key: "Foo" }, { default: () => "Foo" })],
      },
      attachTo: document.body,
    });

    await nextTick();
    expect(document.activeElement).toBe(wrapper.get("button").element);
  });

  it("supports a controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(ActionMenu as any, {
      props: {
        isOpen: true,
        onOpenChange,
      },
      slots: {
        default: () => [h(Item as any, { key: "Foo" }, { default: () => "Foo" })],
      },
      attachTo: document.body,
    });

    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    await wrapper.get("button").trigger("click");
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
  });

  it("supports an uncontrolled default open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(ActionMenu as any, {
      props: {
        defaultOpen: true,
        onOpenChange,
      },
      slots: {
        default: () => [h(Item as any, { key: "Foo" }, { default: () => "Foo" })],
      },
      attachTo: document.body,
    });

    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledTimes(0);

    const triggerButton = wrapper.get("button");
    await triggerButton.trigger("click");

    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(triggerButton.attributes("aria-expanded")).toBe("false");
  });

  describe("with tooltips", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("closes tooltip when opening menu with pointer interaction", async () => {
      const wrapper = mount(TooltipTrigger as any, {
        props: {
          delay: 0,
        },
        slots: {
          default: () => [
            h(ActionMenu as any, null, {
              default: () => [
                h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
                h(Item as any, { key: "Bar" }, { default: () => "Bar" }),
                h(Item as any, { key: "Baz" }, { default: () => "Baz" }),
              ],
            }),
            h(Tooltip as any, null, {
              default: () => "A whale of a tale.",
            }),
          ],
        },
        attachTo: document.body,
      });

      const button = wrapper.get("button");
      setInteractionModality("pointer");
      await button.trigger("mouseenter");
      await button.trigger("mousemove");
      await nextTick();

      expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy();

      await button.trigger("mousedown");
      await button.trigger("mouseup");
      await button.trigger("click");
      vi.runAllTimers();
      await nextTick();

      expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
      const menu = document.body.querySelector('[role="menu"]');
      expect(menu).toBeTruthy();
      expect(menu?.getAttribute("aria-labelledby")).toBe(button.attributes("id"));
    });

    it("closes tooltip when opening menu with keyboard interaction", async () => {
      const wrapper = mount(TooltipTrigger as any, {
        props: {
          delay: 0,
        },
        slots: {
          default: () => [
            h(ActionMenu as any, null, {
              default: () => [
                h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
                h(Item as any, { key: "Bar" }, { default: () => "Bar" }),
                h(Item as any, { key: "Baz" }, { default: () => "Baz" }),
              ],
            }),
            h(Tooltip as any, null, {
              default: () => "A whale of a tale.",
            }),
          ],
        },
        attachTo: document.body,
      });

      const button = wrapper.get("button");
      await button.trigger("focus");
      await nextTick();
      expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy();

      await button.trigger("keydown", { key: "Enter" });
      await button.trigger("keyup", { key: "Enter" });
      vi.runAllTimers();
      await nextTick();

      expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
      const menu = document.body.querySelector('[role="menu"]');
      expect(menu).toBeTruthy();
      expect(menu?.getAttribute("aria-labelledby")).toBe(button.attributes("id"));
    });
  });
});
