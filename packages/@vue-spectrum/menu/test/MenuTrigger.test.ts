import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { ContextualHelpTrigger } from "../src/ContextualHelpTrigger";
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

function renderContextualHelpMenuTrigger(
  menuProps: Record<string, unknown> = {},
  contextualHelpProps: Record<string, unknown> = {}
) {
  return mount(MenuTrigger as any, {
    props: {
      defaultOpen: true,
    },
    slots: {
      default: () => [
        h("button", { "data-testid": "trigger" }, "Menu Button"),
        h(Menu as any, { ariaLabel: "Menu", ...menuProps }, {
          default: () => [
            h(ContextualHelpTrigger as any, contextualHelpProps, {
              default: () => [
                h(Item as any, { key: "help" }, { default: () => "Help" }),
                h("div", { role: "dialog" }, "Contextual help dialog"),
              ],
            }),
            h(Item as any, { key: "alpha" }, { default: () => "Alpha" }),
          ],
        }),
      ],
    },
    attachTo: document.body,
  });
}

function hoverWithMouse(element: HTMLElement) {
  if (typeof PointerEvent !== "undefined") {
    element.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
    element.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
  } else {
    element.dispatchEvent(new MouseEvent("pointerenter", { bubbles: true }));
    element.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
  }

  element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  element.dispatchEvent(new Event("pointerover", { bubbles: true }));
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

  it("renders contextual help submenu items with an unavailable icon", () => {
    renderContextualHelpMenuTrigger();

    const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;

    expect(helpItem).toBeTruthy();
    expect(helpItem?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(helpItem?.querySelector(".spectrum-Menu-end")).toBeTruthy();
  });

  it("allows available contextual help items to participate in selection", () => {
    renderContextualHelpMenuTrigger(
      {
        selectionMode: "single",
        selectedKeys: ["help"],
      },
      {
        isUnavailable: false,
      }
    );

    const helpItem = Array.from(document.body.querySelectorAll('[role="menuitemradio"]'))
      .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;

    expect(helpItem).toBeTruthy();
    expect(helpItem?.getAttribute("aria-haspopup")).toBeNull();
    expect(helpItem?.classList.contains("is-selected")).toBe(true);
    expect(helpItem?.querySelector(".spectrum-Menu-checkmark")).toBeTruthy();
    expect(helpItem?.querySelector(".spectrum-Menu-end")).toBeNull();
  });

  it("opens unavailable contextual help dialogs on hover", async () => {
    vi.useFakeTimers();
    try {
      renderContextualHelpMenuTrigger();

      const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;
      expect(helpItem).toBeTruthy();
      expect(document.body.querySelector('[role="dialog"]')).toBeNull();

      hoverWithMouse(helpItem as HTMLElement);
      await vi.advanceTimersByTimeAsync(250);

      expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();
      expect(document.body.textContent).toContain("Contextual help dialog");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not open contextual help dialogs on hover when available", async () => {
    vi.useFakeTimers();
    try {
      renderContextualHelpMenuTrigger({}, { isUnavailable: false });

      const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;
      expect(helpItem).toBeTruthy();
      expect(helpItem?.getAttribute("aria-haspopup")).toBeNull();
      expect(document.body.querySelector('[role="dialog"]')).toBeNull();

      hoverWithMouse(helpItem as HTMLElement);
      await vi.advanceTimersByTimeAsync(250);

      expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("opens unavailable contextual help dialogs with keyboard activation", async () => {
    const wrapper = renderContextualHelpMenuTrigger();

    const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;

    expect(helpItem).toBeTruthy();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    helpItem?.focus();
    helpItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();
    expect(document.body.textContent).toContain("Contextual help dialog");
  });

  it("opens unavailable contextual help dialogs with ArrowRight navigation", async () => {
    const wrapper = renderContextualHelpMenuTrigger();

    const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;

    expect(helpItem).toBeTruthy();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    helpItem?.focus();
    helpItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    helpItem?.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();
    expect(document.body.textContent).toContain("Contextual help dialog");
  });

  it("closes an open contextual help dialog when hovering a sibling item", async () => {
    const wrapper = renderContextualHelpMenuTrigger();

    const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;
    const siblingItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Alpha")) as HTMLElement | undefined;

    expect(helpItem).toBeTruthy();
    expect(siblingItem).toBeTruthy();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    helpItem?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();

    hoverWithMouse(siblingItem as HTMLElement);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
  });

  it("closes the root menu and contextual help dialog when clicking the underlay", async () => {
    const wrapper = renderContextualHelpMenuTrigger();
    const trigger = wrapper.get('[data-testid="trigger"]');

    const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;

    expect(helpItem).toBeTruthy();
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    helpItem?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();

    const underlay = document.body.querySelector(".spectrum-Underlay") as HTMLElement | null;
    expect(underlay).toBeTruthy();

    underlay?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    underlay?.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    underlay?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
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

  it("renders menu popover in a provided portal container on small screens", async () => {
    const screenWidthSpy = vi.spyOn(window.screen, "width", "get").mockImplementation(() => 700);
    try {
      const portalContainer = document.createElement("div");
      portalContainer.setAttribute("data-testid", "tray-portal-container");
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
    } finally {
      screenWidthSpy.mockRestore();
    }
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

  it("does not close if menu is tabbed away from", async () => {
    const wrapper = renderMenuTrigger();
    const trigger = wrapper.get('[data-testid="trigger"]');

    await trigger.trigger("click");
    await wrapper.vm.$nextTick();

    const menu = document.body.querySelector('[role="menu"]') as HTMLElement | null;
    const firstItem = document.body.querySelector('[role="menuitem"]') as HTMLElement | null;
    expect(menu).toBeTruthy();
    expect(firstItem).toBeTruthy();
    firstItem?.focus();
    expect(document.activeElement).toBe(firstItem);

    firstItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    firstItem?.dispatchEvent(new KeyboardEvent("keyup", { key: "Tab", bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="menu"]')).toBe(menu);
    expect(document.activeElement).toBe(firstItem);
  });
});
