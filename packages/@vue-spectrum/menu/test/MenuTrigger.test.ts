import { mount } from "@vue/test-utils";
import { I18nProvider } from "@vue-aria/i18n";
import { Button } from "@vue-spectrum/button";
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
  contextualHelpProps: Record<string, unknown> = {},
  dialogContent: (() => unknown) | undefined = undefined
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
                dialogContent
                  ? dialogContent()
                  : h("div", { role: "dialog" }, "Contextual help dialog"),
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

function renderContextualHelpMenuTriggerWithLocale(
  locale: string,
  menuProps: Record<string, unknown> = {},
  contextualHelpProps: Record<string, unknown> = {}
) {
  return mount(I18nProvider as any, {
    props: {
      locale,
    },
    slots: {
      default: () => [
        h(MenuTrigger as any, {
          defaultOpen: true,
        }, {
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

  it("supports dragging and releasing link items", async () => {
    const onAction = vi.fn();
    const wrapper = mount(MenuTrigger as any, {
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu", onAction }, {
            default: () => [
              h(Item as any, { key: "One", href: "https://google.com" }, { default: () => "One" }),
              h(Item as any, { key: "Two", href: "https://adobe.com" }, { default: () => "Two" }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get('[data-testid="trigger"]').element as HTMLElement;
    if (typeof PointerEvent !== "undefined") {
      trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
    } else {
      trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    }
    await wrapper.vm.$nextTick();

    const items = getMenuItems();
    expect(items).toHaveLength(2);

    let clickCount = 0;
    const onWindowClick = (event: MouseEvent) => {
      clickCount += 1;
      event.preventDefault();
    };
    window.addEventListener("click", onWindowClick, true);

    try {
      items[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
      await wrapper.vm.$nextTick();

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(clickCount).toBe(1);
    } finally {
      window.removeEventListener("click", onWindowClick, true);
    }
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

  it("opens unavailable contextual help dialogs with ArrowLeft navigation in rtl", async () => {
    const wrapper = renderContextualHelpMenuTriggerWithLocale("ar-AE");

    const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;

    expect(helpItem).toBeTruthy();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    helpItem?.focus();
    helpItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    helpItem?.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();
    expect(document.body.textContent).toContain("Contextual help dialog");
  });

  it("opens unavailable contextual help dialogs with rtl keyboard traversal", async () => {
    const wrapper = renderContextualHelpMenuTriggerWithLocale("ar-AE");

    const menuItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const helpItem = menuItems.find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;
    const siblingItem = menuItems.find((item) => item.textContent?.includes("Alpha")) as HTMLElement | undefined;

    expect(helpItem).toBeTruthy();
    expect(siblingItem).toBeTruthy();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    helpItem?.focus();
    expect(document.activeElement).toBe(helpItem);

    helpItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    helpItem?.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(siblingItem);

    siblingItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    siblingItem?.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowUp", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(helpItem);

    helpItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    helpItem?.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft", bubbles: true }));
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

  it("focuses the sibling item when contextual help closes via hover", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderContextualHelpMenuTrigger();

      const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;
      const siblingItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("Alpha")) as HTMLElement | undefined;

      expect(helpItem).toBeTruthy();
      expect(siblingItem).toBeTruthy();

      hoverWithMouse(helpItem as HTMLElement);
      await vi.advanceTimersByTimeAsync(250);
      await wrapper.vm.$nextTick();
      expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();

      hoverWithMouse(siblingItem as HTMLElement);
      await vi.advanceTimersByTimeAsync(250);
      await wrapper.vm.$nextTick();

      expect(document.body.querySelector('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(siblingItem);
    } finally {
      vi.useRealTimers();
    }
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

  it("contains focus when shift-tabbing within contextual help dialogs", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderContextualHelpMenuTrigger(
        {},
        {},
        () => h("div", { role: "dialog", tabIndex: -1 }, [
          h("a", { href: "#", "data-testid": "contextual-help-link" }, "Learn more"),
        ])
      );

      const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;
      expect(helpItem).toBeTruthy();

      hoverWithMouse(helpItem as HTMLElement);
      await vi.advanceTimersByTimeAsync(250);
      await wrapper.vm.$nextTick();

      const dialog = document.body.querySelector('[role="dialog"]') as HTMLElement | null;
      const link = document.body.querySelector('[data-testid="contextual-help-link"]') as HTMLElement | null;
      expect(dialog).toBeTruthy();
      expect(link).toBeTruthy();

      dialog?.focus();
      expect(document.activeElement).toBe(dialog);

      dialog?.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }));
      await wrapper.vm.$nextTick();

      expect(document.body.querySelector('[role="dialog"]')).toBe(dialog);
      expect(document.activeElement).toBe(link);
    } finally {
      vi.useRealTimers();
    }
  });

  it("contains focus when tabbing within contextual help dialogs", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderContextualHelpMenuTrigger(
        {},
        {},
        () => h("div", { role: "dialog", tabIndex: -1 }, [
          h("a", { href: "#", "data-testid": "contextual-help-link" }, "Learn more"),
        ])
      );

      const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;
      expect(helpItem).toBeTruthy();

      hoverWithMouse(helpItem as HTMLElement);
      await vi.advanceTimersByTimeAsync(250);
      await wrapper.vm.$nextTick();

      const dialog = document.body.querySelector('[role="dialog"]') as HTMLElement | null;
      const link = document.body.querySelector('[data-testid="contextual-help-link"]') as HTMLElement | null;
      expect(dialog).toBeTruthy();
      expect(link).toBeTruthy();

      dialog?.focus();
      expect(document.activeElement).toBe(dialog);

      dialog?.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }));
      await wrapper.vm.$nextTick();

      expect(document.body.querySelector('[role="dialog"]')).toBe(dialog);
      expect(document.activeElement).toBe(link);

      link?.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }));
      await wrapper.vm.$nextTick();

      expect(document.body.querySelector('[role="dialog"]')).toBe(dialog);
      expect(document.activeElement).toBe(link);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps contextual help focus contained after reopening via hover", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderContextualHelpMenuTrigger(
        {},
        {},
        () => h("div", { role: "dialog", tabIndex: -1 }, [
          h("a", { href: "#", "data-testid": "contextual-help-link" }, "Learn more"),
        ])
      );

      const helpItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("Help")) as HTMLElement | undefined;
      const siblingItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("Alpha")) as HTMLElement | undefined;
      expect(helpItem).toBeTruthy();
      expect(siblingItem).toBeTruthy();

      helpItem?.click();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();

      hoverWithMouse(siblingItem as HTMLElement);
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect(document.body.querySelector('[role="dialog"]')).toBeNull();

      hoverWithMouse(helpItem as HTMLElement);
      await vi.advanceTimersByTimeAsync(250);
      await wrapper.vm.$nextTick();

      const dialog = document.body.querySelector('[role="dialog"]') as HTMLElement | null;
      const link = document.body.querySelector('[data-testid="contextual-help-link"]') as HTMLElement | null;
      expect(dialog).toBeTruthy();
      expect(link).toBeTruthy();

      dialog?.focus();
      expect(document.activeElement).toBe(dialog);

      dialog?.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }));
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toBe(link);

      link?.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }));
      await wrapper.vm.$nextTick();
      expect(document.body.querySelector('[role="dialog"]')).toBe(dialog);
      expect(document.activeElement).toBe(link);
    } finally {
      vi.useRealTimers();
    }
  });

  it("supports refs on both the trigger element and MenuTrigger", async () => {
    let buttonRef: HTMLElement | null = null;
    let triggerRef: any = null;

    mount({
      render() {
        return h(MenuTrigger as any, {
          ref: (value: unknown) => {
            triggerRef = value;
          },
        }, {
          default: () => [
            h("button", {
              "data-testid": "dual-ref-trigger",
              ref: (value: unknown) => {
                buttonRef = value as HTMLElement | null;
              },
            }, "Menu Button"),
            h(Menu as any, { ariaLabel: "Menu" }, {
              default: () => [
                h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
              ],
            }),
          ],
        });
      },
    }, {
      attachTo: document.body,
    });

    await Promise.resolve();

    expect(buttonRef).toBeTruthy();
    expect(triggerRef).toBeTruthy();
    expect(triggerRef.UNSAFE_getDOMNode()).toBe(buttonRef);

    triggerRef.focus();
    await Promise.resolve();
    expect(document.activeElement).toBe(buttonRef);
  });

  it("supports refs on both Button and MenuTrigger components", async () => {
    let buttonRef: any = null;
    let menuTriggerRef: any = null;

    mount({
      render() {
        return h(MenuTrigger as any, {
          ref: (value: unknown) => {
            menuTriggerRef = value;
          },
        }, {
          default: () => [
            h(Button as any, {
              ref: (value: unknown) => {
                buttonRef = value;
              },
            }, {
              default: () => "Menu Button",
            }),
            h(Menu as any, { ariaLabel: "Menu" }, {
              default: () => [
                h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
              ],
            }),
          ],
        });
      },
    }, {
      attachTo: document.body,
    });

    await Promise.resolve();

    const triggerButton = document.body.querySelector("button") as HTMLElement | null;
    expect(triggerButton).toBeTruthy();
    expect(buttonRef).toBeTruthy();
    expect(menuTriggerRef).toBeTruthy();
    expect(buttonRef.UNSAFE_getDOMNode()).toBe(triggerButton);
    expect(menuTriggerRef.UNSAFE_getDOMNode()).toBe(triggerButton);
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
