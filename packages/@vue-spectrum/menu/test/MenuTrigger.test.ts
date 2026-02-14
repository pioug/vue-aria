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

  it("exposes trigger dom node and focus handle", async () => {
    const wrapper = renderMenuTrigger();
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect((wrapper.vm as any).UNSAFE_getDOMNode()).toBe(trigger.element);
    (wrapper.vm as any).focus();
    await Promise.resolve();
    expect(document.activeElement).toBe(trigger.element);
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
});
