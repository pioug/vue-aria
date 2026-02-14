import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Item } from "../src/Item";
import { Menu } from "../src/Menu";
import { MenuTrigger } from "../src/MenuTrigger";

function renderMenuTrigger(
  props: Record<string, unknown> = {},
  menuProps: Record<string, unknown> = {}
) {
  return mount(MenuTrigger as any, {
    props,
    slots: {
      default: () => [
        h("button", { "data-testid": "trigger" }, "Menu Button"),
        h(Menu as any, { ariaLabel: "Menu", ...menuProps }, {
          default: () => [
            h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
            h(Item as any, { key: "Bar" }, { default: () => "Bar" }),
            h(Item as any, { key: "Baz" }, { default: () => "Baz" }),
          ],
        }),
      ],
    },
    attachTo: document.body,
  });
}

describe("MenuTrigger", () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  const getMenuItems = (selectionMode?: "single" | "multiple") => {
    const role = selectionMode === "single"
      ? "menuitemradio"
      : selectionMode === "multiple"
        ? "menuitemcheckbox"
        : "menuitem";
    return Array.from(document.body.querySelectorAll(`[role="${role}"]`)) as HTMLElement[];
  };

  it("opens and closes menu on trigger click", async () => {
    const wrapper = renderMenuTrigger();
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await trigger.trigger("click");
    const menu = document.body.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");

    await trigger.trigger("click");
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderMenuTrigger({
      isOpen: true,
      onOpenChange,
    });

    const trigger = wrapper.get('[data-testid="trigger"]');
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();

    await trigger.trigger("click");

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("supports uncontrolled default open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderMenuTrigger({
      defaultOpen: true,
      onOpenChange,
    });

    const trigger = wrapper.get('[data-testid="trigger"]');
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledTimes(0);

    await trigger.trigger("click");

    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("does not close on item selection when closeOnSelect is false", async () => {
    const onOpenChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderMenuTrigger(
      {
        closeOnSelect: false,
        onOpenChange,
      },
      {
        selectionMode: "single",
        onSelectionChange,
      }
    );
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    await trigger.trigger("click");
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    const firstItem = document.body.querySelector('[role="menuitemradio"]') as HTMLElement | null;
    firstItem?.click();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("calls user menu onClose when selecting an item", async () => {
    const onClose = vi.fn();
    const wrapper = renderMenuTrigger({}, { onClose });
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    await trigger.trigger("click");
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();

    const firstItem = document.body.querySelector('[role="menuitem"]') as HTMLElement | null;
    firstItem?.click();
    await wrapper.vm.$nextTick();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("does not show selection checkmarks when selectionMode is not defined", async () => {
    const wrapper = renderMenuTrigger({}, {
      selectedKeys: ["Foo"],
    });
    const trigger = wrapper.get('[data-testid="trigger"]');

    await trigger.trigger("click");

    expect(document.body.querySelectorAll('[role="menuitem"]')).toHaveLength(3);
    expect(document.body.querySelectorAll('[role="img"]')).toHaveLength(0);
  });

  it("exposes trigger dom node and focus handle", async () => {
    const wrapper = renderMenuTrigger();
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect((wrapper.vm as any).UNSAFE_getDOMNode()).toBe(trigger.element);
    (wrapper.vm as any).focus();
    await Promise.resolve();
    expect(document.activeElement).toBe(trigger.element);
  });

  it("renders menu popover in a provided portal container", async () => {
    const portalContainer = document.createElement("div");
    portalContainer.setAttribute("data-testid", "portal-container");
    document.body.appendChild(portalContainer);

    const wrapper = renderMenuTrigger({
      portalContainer,
    });
    const trigger = wrapper.get('[data-testid="trigger"]');

    await trigger.trigger("click");
    await wrapper.vm.$nextTick();

    const popover = portalContainer.querySelector(".spectrum-Menu-popover");
    expect(popover).toBeTruthy();
    expect(document.body.querySelectorAll(".spectrum-Menu-popover")).toHaveLength(1);
  });

  it("does not open menu on click when trigger is longPress", async () => {
    const wrapper = renderMenuTrigger({
      trigger: "longPress",
    });
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await trigger.trigger("click");

    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("opens menu on Alt+ArrowDown when trigger is longPress", async () => {
    const wrapper = renderMenuTrigger({
      trigger: "longPress",
    });
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await trigger.trigger("keydown", { key: "ArrowDown", altKey: true });
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("opens menu on Alt+ArrowUp when trigger is longPress", async () => {
    const wrapper = renderMenuTrigger({
      trigger: "longPress",
    });
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await trigger.trigger("keydown", { key: "ArrowUp", altKey: true });
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("opens menu on long press when trigger is longPress", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderMenuTrigger({
        trigger: "longPress",
      });
      const trigger = wrapper.get('[data-testid="trigger"]');

      expect(document.body.querySelector('[role="menu"]')).toBeNull();

      trigger.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, detail: 1 }));
      await vi.advanceTimersByTimeAsync(600);
      await wrapper.vm.$nextTick();

      expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
      expect(trigger.attributes("aria-expanded")).toBe("true");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not open menu on short press when trigger is longPress", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderMenuTrigger({
        trigger: "longPress",
      });
      const trigger = wrapper.get('[data-testid="trigger"]');

      expect(document.body.querySelector('[role="menu"]')).toBeNull();

      trigger.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, detail: 1 }));
      await vi.advanceTimersByTimeAsync(300);
      await trigger.trigger("mouseup", { button: 0 });
      await wrapper.vm.$nextTick();

      expect(document.body.querySelector('[role="menu"]')).toBeNull();
      expect(trigger.attributes("aria-expanded")).toBe("false");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not open menu on Enter or Space when trigger is longPress", async () => {
    const wrapper = renderMenuTrigger({
      trigger: "longPress",
    });
    const trigger = wrapper.get('[data-testid="trigger"]');

    await trigger.trigger("keydown", { key: "Enter" });
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await trigger.trigger("keydown", { key: " " });
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("focuses the selected item when opening with Alt+Arrow keys in longPress mode", async () => {
    const wrapper = renderMenuTrigger(
      { trigger: "longPress" },
      { selectionMode: "single", selectedKeys: ["Bar"] }
    );
    const trigger = wrapper.get('[data-testid="trigger"]');

    await trigger.trigger("keydown", { key: "ArrowUp", altKey: true });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect((document.activeElement as HTMLElement | null)?.textContent).toContain("Bar");

    const menu = document.body.querySelector('[role="menu"]') as HTMLElement | null;
    menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await trigger.trigger("keydown", { key: "ArrowDown", altKey: true });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect((document.activeElement as HTMLElement | null)?.textContent).toContain("Bar");
    expect(getMenuItems("single")).toHaveLength(3);
  });

  it("focuses the selected item when opening from a long press", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderMenuTrigger(
        { trigger: "longPress" },
        { selectionMode: "single", selectedKeys: ["Bar"] }
      );
      const trigger = wrapper.get('[data-testid="trigger"]');

      trigger.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, detail: 1 }));
      await vi.advanceTimersByTimeAsync(600);
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect((document.activeElement as HTMLElement | null)?.textContent).toContain("Bar");
      expect(getMenuItems("single")).toHaveLength(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it("focuses first/last menu items from Alt+ArrowDown/Alt+ArrowUp in longPress mode", async () => {
    const upWrapper = renderMenuTrigger({ trigger: "longPress" });
    const upTrigger = upWrapper.get('[data-testid="trigger"]');

    await upTrigger.trigger("keydown", { key: "ArrowUp", altKey: true });
    await upWrapper.vm.$nextTick();
    await upWrapper.vm.$nextTick();
    expect((document.activeElement as HTMLElement | null)?.textContent).toContain("Baz");

    const upMenu = document.body.querySelector('[role="menu"]') as HTMLElement | null;
    upMenu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await upWrapper.vm.$nextTick();

    document.body.innerHTML = "";

    const downWrapper = renderMenuTrigger({ trigger: "longPress" });
    const downTrigger = downWrapper.get('[data-testid="trigger"]');

    await downTrigger.trigger("keydown", { key: "ArrowDown", altKey: true });
    await downWrapper.vm.$nextTick();
    await downWrapper.vm.$nextTick();
    expect((document.activeElement as HTMLElement | null)?.textContent).toContain("Foo");
    expect(getMenuItems()).toHaveLength(3);
  });
});
