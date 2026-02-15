import { mount } from "@vue/test-utils";
import { FormValidationContext } from "@vue-aria/form-state";
import { setInteractionModality } from "@vue-aria/interactions";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, provide, ref } from "vue";
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
import { Item } from "../src/Item";
import { Picker } from "../src/Picker";
import { Section } from "../src/Section";

const items = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

function renderPicker(props: Record<string, unknown> = {}) {
  return mount(Picker as any, {
    props: {
      ariaLabel: "Picker",
      items,
      ...props,
    },
    attachTo: document.body,
  });
}

function preventLinkNavigation(): () => void {
  const clickHandler = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a")) {
      event.preventDefault();
    }
  };

  document.addEventListener("click", clickHandler, true);
  return () => {
    document.removeEventListener("click", clickHandler, true);
  };
}

let restoreScrollIntoView: (() => void) | null = null;

describe("Picker", () => {
  beforeAll(() => {
    const prototype = window.HTMLElement.prototype as HTMLElement & { scrollIntoView?: (arg?: unknown) => void };
    const original = prototype.scrollIntoView;

    Object.defineProperty(prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    restoreScrollIntoView = () => {
      if (original) {
        Object.defineProperty(prototype, "scrollIntoView", {
          configurable: true,
          writable: true,
          value: original,
        });
        return;
      }

      delete (prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView;
    };
  });

  afterAll(() => {
    restoreScrollIntoView?.();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders trigger and placeholder", () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    expect(trigger.attributes("aria-haspopup")).toBe("listbox");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(wrapper.text()).toContain("Select…");
  });

  it("opens on mouse down", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("mousedown", { button: 0 });
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("opens on trigger press and selects an option", async () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      onSelectionChange,
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(options).toHaveLength(3);

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "2";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(wrapper.text()).toContain("Two");
  });

  it("opens on ArrowDown and focuses the first option", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("keydown", { key: "ArrowDown" });
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    const options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(3);
    expect(document.activeElement).toBe(options[0]);
  });

  it("opens on ArrowUp and focuses the last option", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("keydown", { key: "ArrowUp" });
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    const options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(3);
    expect(document.activeElement).toBe(options[2]);
  });

  it("opens on Space keydown", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("keydown", { key: " " });
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("opens on Enter keydown", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("supports selecting items with falsy keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        items: [
          { key: "", label: "Empty" },
          { key: 0, label: "Zero" },
          { key: "three", label: "Three" },
        ],
        onSelectionChange,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    expect(trigger.text()).toContain("Select…");

    await trigger.trigger("click");
    await nextTick();

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.calls[0]?.[0]).toBe("");
    expect(wrapper.text()).toContain("Empty");

    await wrapper.get("button").trigger("click");
    await nextTick();

    (select.element as HTMLSelectElement).value = "0";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(String(onSelectionChange.mock.calls[1]?.[0])).toBe("0");
    expect(wrapper.text()).toContain("Zero");
  });

  it("supports closed arrow-key navigation to falsy keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        items: [
          { key: "1", label: "One" },
          { key: "", label: "Empty" },
          { key: "3", label: "Three" },
        ],
        defaultSelectedKey: "1",
        onSelectionChange,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    expect(wrapper.text()).toContain("One");

    await trigger.trigger("keydown", { key: "ArrowRight" });
    await trigger.trigger("keyup", { key: "ArrowRight" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("");
    expect(wrapper.text()).toContain("Empty");
  });

  it("skips disabled options during open keyboard navigation", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        items: [
          { key: "1", label: "One" },
          { key: "2", label: "Two", isDisabled: true },
          { key: "3", label: "Three" },
        ],
        onSelectionChange,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await trigger.trigger("keyup", { key: "ArrowDown" });
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(3);
    expect(options[1]?.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(options[0]);

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown", bubbles: true }));
    await nextTick();

    expect(document.activeElement).toBe(options[2]);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
  });

  it("moves selection with closed ArrowLeft and ArrowRight keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      onSelectionChange,
    });

    const trigger = wrapper.get("button");
    (trigger.element as HTMLElement).focus();
    await nextTick();

    expect(wrapper.text()).toContain("Select…");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    await trigger.trigger("keydown", { key: "ArrowLeft" });
    await trigger.trigger("keyup", { key: "ArrowLeft" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect(wrapper.text()).toContain("One");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    await trigger.trigger("keydown", { key: "ArrowLeft" });
    await trigger.trigger("keyup", { key: "ArrowLeft" });
    await nextTick();

    expect(wrapper.text()).toContain("One");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    await trigger.trigger("keydown", { key: "ArrowRight" });
    await trigger.trigger("keyup", { key: "ArrowRight" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenLastCalledWith("2");
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain("Two");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    await trigger.trigger("keydown", { key: "ArrowRight" });
    await trigger.trigger("keyup", { key: "ArrowRight" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenLastCalledWith("3");
    expect(onSelectionChange).toHaveBeenCalledTimes(3);
    expect(wrapper.text()).toContain("Three");

    await trigger.trigger("keydown", { key: "ArrowRight" });
    await trigger.trigger("keyup", { key: "ArrowRight" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(3);
    expect(wrapper.text()).toContain("Three");

    await trigger.trigger("keydown", { key: "ArrowLeft" });
    await trigger.trigger("keyup", { key: "ArrowLeft" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenLastCalledWith("2");
    expect(onSelectionChange).toHaveBeenCalledTimes(4);
    expect(wrapper.text()).toContain("Two");

    await trigger.trigger("keydown", { key: "ArrowLeft" });
    await trigger.trigger("keyup", { key: "ArrowLeft" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenLastCalledWith("1");
    expect(onSelectionChange).toHaveBeenCalledTimes(5);
    expect(wrapper.text()).toContain("One");
  });

  it("supports closed type-to-select without opening the menu", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      onSelectionChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("keydown", { key: "T" });
    await trigger.trigger("keyup", { key: "T" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(wrapper.text()).toContain("Two");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("supports rapid closed type-to-select sequences", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      onSelectionChange,
    });

    const trigger = wrapper.get("button");
    (trigger.element as HTMLElement).focus();
    await nextTick();

    await trigger.trigger("keydown", { key: "t" });
    await trigger.trigger("keyup", { key: "t" });
    await nextTick();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith("2");
    expect(wrapper.text()).toContain("Two");

    await trigger.trigger("keydown", { key: "h" });
    await trigger.trigger("keyup", { key: "h" });
    await nextTick();
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).toHaveBeenLastCalledWith("3");
    expect(wrapper.text()).toContain("Three");
  });

  it("resets closed type-to-select search text after timeout", async () => {
    vi.useFakeTimers();
    try {
      const onSelectionChange = vi.fn();
      const wrapper = renderPicker({
        onSelectionChange,
      });

      const trigger = wrapper.get("button");
      (trigger.element as HTMLElement).focus();
      await nextTick();

      await trigger.trigger("keydown", { key: "t" });
      await trigger.trigger("keyup", { key: "t" });
      await nextTick();
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith("2");
      expect(wrapper.text()).toContain("Two");

      vi.runAllTimers();
      await nextTick();

      await trigger.trigger("keydown", { key: "h" });
      await trigger.trigger("keyup", { key: "h" });
      await nextTick();
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toContain("Two");
    } finally {
      vi.useRealTimers();
    }
  });

  it("wraps closed type-to-select matching from the start", async () => {
    vi.useFakeTimers();
    try {
      const onSelectionChange = vi.fn();
      const wrapper = renderPicker({
        onSelectionChange,
      });

      const trigger = wrapper.get("button");
      (trigger.element as HTMLElement).focus();
      await nextTick();

      await trigger.trigger("keydown", { key: "t" });
      await trigger.trigger("keyup", { key: "t" });
      await nextTick();
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith("2");
      expect(wrapper.text()).toContain("Two");

      vi.runAllTimers();
      await nextTick();

      await trigger.trigger("keydown", { key: "o" });
      await trigger.trigger("keyup", { key: "o" });
      await nextTick();
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(onSelectionChange).toHaveBeenLastCalledWith("1");
      expect(wrapper.text()).toContain("One");
    } finally {
      vi.useRealTimers();
    }
  });

  it("supports open type-to-select focus movement", async () => {
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        items: [
          { key: "1", label: "One" },
          { key: "2", label: "Two" },
          { key: "3", label: "Three" },
          { key: "", label: "None" },
        ],
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await trigger.trigger("keyup", { key: "ArrowDown" });
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(4);
    expect(document.activeElement).toBe(options[0]);

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "t", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "t", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[1]);

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "h", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "h", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[2]);
  });

  it("selects the focused option with Space when open", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      onSelectionChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await trigger.trigger("keyup", { key: "ArrowDown" });
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(3);
    expect(document.activeElement).toBe(options[0]);

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[1]);

    options[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    options[1]?.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith("2");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.text()).toContain("Two");
  });

  it("selects the focused option with Enter when open", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      onSelectionChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await trigger.trigger("keyup", { key: "ArrowDown" });
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(3);
    expect(document.activeElement).toBe(options[0]);

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[1]);

    options[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    options[1]?.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith("2");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.text()).toContain("Two");
  });

  it("closes when trigger is pressed while open", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.attributes("aria-controls")).toBeUndefined();
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports controlled selectedKey updates", async () => {
    const wrapper = renderPicker({
      selectedKey: "1",
    });

    expect(wrapper.text()).toContain("One");

    await wrapper.setProps({
      selectedKey: "3",
    });
    await nextTick();

    expect(wrapper.text()).toContain("Three");
  });

  it("keeps controlled selectedKey value on selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      selectedKey: "1",
      onSelectionChange,
    });

    expect(wrapper.text()).toContain("One");

    await wrapper.get("button").trigger("click");
    await nextTick();

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "2";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(wrapper.text()).toContain("One");
  });

  it("updates uncontrolled defaultSelectedKey value on selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      defaultSelectedKey: "1",
      onSelectionChange,
    });

    expect(wrapper.text()).toContain("One");

    await wrapper.get("button").trigger("click");
    await nextTick();

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "2";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(wrapper.text()).toContain("Two");
  });

  it("does not emit selection changes when selecting an already selected option", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      defaultSelectedKey: "2",
      onSelectionChange,
    });

    const trigger = wrapper.get("button");
    expect(trigger.text()).toContain("Two");

    await trigger.trigger("click");
    await nextTick();

    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(options).toHaveLength(3);
    expect(options[1]?.getAttribute("aria-selected")).toBe("true");
    expect(options[1]?.getAttribute("tabindex")).toBe("0");

    options[1]?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.text()).toContain("Two");
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      isOpen: true,
      onOpenChange,
    });

    await nextTick();

    const trigger = wrapper.get("button");
    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);
    expect(onOpenChange).not.toHaveBeenCalled();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports default open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      defaultOpen: true,
      onOpenChange,
    });

    await nextTick();

    const trigger = wrapper.get("button");
    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);
    expect(onOpenChange).not.toHaveBeenCalled();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.attributes("aria-controls")).toBeUndefined();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("scrolls the selected option into view when opening", async () => {
    const scrollIntoViewMock = (window.HTMLElement.prototype.scrollIntoView as unknown as ReturnType<typeof vi.fn>);
    scrollIntoViewMock.mockClear();

    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        selectedKey: "4",
        items: [
          { key: "1", label: "One" },
          { key: "2", label: "Two" },
          { key: "3", label: "Three" },
          { key: "4", label: "Four" },
        ],
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await nextTick();

    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(options).toHaveLength(4);
    expect(options[3]?.getAttribute("aria-selected")).toBe("true");
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it("closes default open state on escape", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      defaultOpen: true,
      onOpenChange,
    });

    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(listbox).toBeTruthy();

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape", bubbles: true }));
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("false");
    expect(wrapper.get("button").attributes("aria-controls")).toBeUndefined();
  });

  it("does not close on escape in controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      isOpen: true,
      onOpenChange,
    });

    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(listbox).toBeTruthy();

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape", bubbles: true }));
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not clear selection when closing with Escape", async () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      label: "Test",
      onSelectionChange,
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    expect(trigger.text()).toContain("Select…");
    expect(onOpenChange).toHaveBeenCalledTimes(0);

    await trigger.trigger("click");
    await nextTick();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "3";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("3");
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(trigger.text()).toContain("Three");

    await trigger.trigger("click");
    await nextTick();
    expect(onOpenChange).toHaveBeenCalledTimes(3);
    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape", bubbles: true }));
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledTimes(4);
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.text()).toContain("Three");
  });

  it("closes when clicking outside", async () => {
    const wrapper = renderPicker();

    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");

    const underlay = document.body.querySelector(".spectrum-Underlay") as HTMLElement | null;
    expect(underlay).toBeTruthy();
    underlay?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("closes when focus blurs away while open", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    (trigger.element as HTMLElement).focus();
    await nextTick();

    await trigger.trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(onOpenChange).toHaveBeenCalledWith(true);

    (document.activeElement as HTMLElement | null)?.blur();
    await nextTick();
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.activeElement).toBe(trigger.element);
  });

  it("renders hidden dismiss controls and closes when activated", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      label: "Test",
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const dismissButtons = Array.from(
      document.body.querySelectorAll('button[aria-label="Dismiss"]')
    ) as HTMLButtonElement[];
    expect(dismissButtons).toHaveLength(2);

    dismissButtons[0]?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps focus in the picker overlay when tabbing while open", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Provider as any, { theme }, () => [
              h("input", {
                "data-testid": "before-input",
              }),
              h(Picker as any, {
                label: "Test",
                onOpenChange,
              }, {
                default: () => [
                  h(Item as any, { id: "one" }, { default: () => "One" }),
                  h(Item as any, { id: "two" }, { default: () => "Two" }),
                  h(Item as any, { id: "three" }, { default: () => "Three" }),
                ],
              }),
              h("input", {
                "data-testid": "after-input",
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const trigger = wrapper.get('button[aria-haspopup="listbox"]');
    (trigger.element as HTMLElement).focus();
    await nextTick();
    await trigger.trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(listbox).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);

    (trigger.element as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
      })
    );
    (trigger.element as HTMLElement).dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "Tab",
        bubbles: true,
      })
    );
    await nextTick();

    const openListbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(openListbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(openListbox?.id);
    expect(document.activeElement).toBe(openListbox);
  });

  it("supports hidden select form attributes and default value", () => {
    const wrapper = renderPicker({
      name: "picker",
      form: "picker-form",
      defaultSelectedKey: "2",
    });

    const select = wrapper.get('select[name="picker"]');
    expect(select.attributes("form")).toBe("picker-form");
    expect((select.element as HTMLSelectElement).value).toBe("2");
  });

  it("submits empty option value by default", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { id: "picker-form" }, [
              h(Picker as any, {
                ariaLabel: "Picker",
                name: "picker",
                items,
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const form = wrapper.get("form").element as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("picker")).toBe("");
  });

  it("submits default selected option value", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { id: "picker-form" }, [
              h(Picker as any, {
                ariaLabel: "Picker",
                name: "picker",
                items,
                defaultSelectedKey: "2",
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const form = wrapper.get("form").element as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("picker")).toBe("2");
  });

  it("supports form reset to default selected option", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", null, [
              h(Picker as any, {
                ariaLabel: "Picker",
                name: "picker",
                items,
                defaultSelectedKey: "1",
              }),
              h("input", {
                type: "reset",
                "data-testid": "reset",
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const trigger = wrapper.get("button");
    const select = wrapper.get('select[name="picker"]');
    expect(trigger.text()).toContain("One");
    expect((select.element as HTMLSelectElement).value).toBe("1");

    await trigger.trigger("click");
    await nextTick();
    (select.element as HTMLSelectElement).value = "2";
    await select.trigger("change");
    await nextTick();
    expect(trigger.text()).toContain("Two");

    await wrapper.get('[data-testid="reset"]').trigger("click");
    await nextTick();

    expect((select.element as HTMLSelectElement).value).toBe("1");
    expect(trigger.text()).toContain("One");
  });

  it("supports required hidden select semantics", () => {
    const wrapper = renderPicker({
      name: "picker",
      isRequired: true,
      validationBehavior: "native",
    });

    const select = wrapper.get('select[name="picker"]');
    expect(select.attributes("required")).toBeDefined();
  });

  it("supports help text description", () => {
    const wrapper = renderPicker({
      label: "Test",
      description: "Please select an item.",
    });
    const trigger = wrapper.get("button");
    const description = wrapper.get(".spectrum-HelpText");

    expect(description.text()).toContain("Please select an item.");
    expect(trigger.attributes("aria-describedby")).toBe(description.attributes("id"));
  });

  it("supports controlled invalid error messages", () => {
    const wrapper = renderPicker({
      label: "Test",
      isInvalid: true,
      errorMessage: "Please select a valid item.",
    });
    const trigger = wrapper.get("button");
    const error = wrapper.get(".spectrum-HelpText.is-invalid");

    expect(error.text()).toContain("Please select a valid item.");
    expect(trigger.attributes("aria-describedby")).toBe(error.attributes("id"));
  });

  it("supports native required validation flow", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { "data-testid": "form" }, [
              h(Picker as any, {
                label: "Test",
                name: "picker",
                items,
                isRequired: true,
                validationBehavior: "native",
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const trigger = wrapper.get("button");
    const select = wrapper.get('select[name="picker"]');

    expect(select.attributes("required")).toBeDefined();
    expect(trigger.attributes("aria-describedby")).toBeUndefined();
    expect((select.element as HTMLSelectElement).validity.valid).toBe(false);

    await nextTick();
    await nextTick();
    (select.element as HTMLSelectElement).checkValidity();
    (select.element as HTMLSelectElement).dispatchEvent(
      new Event("invalid", {
        bubbles: false,
        cancelable: true,
      })
    );
    await nextTick();
    await nextTick();

    const describedBy = trigger.attributes("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`#${describedBy}`).text()).toContain("Constraints not satisfied");
    expect(document.activeElement).toBe(trigger.element);

    await trigger.trigger("click");
    await nextTick();
    (select.element as HTMLSelectElement).value = "1";
    await select.trigger("change");
    await nextTick();
    await nextTick();
    await trigger.trigger("blur");
    await nextTick();
    await nextTick();

    expect(trigger.attributes("aria-describedby")).toBeUndefined();
  });

  it("supports native validate callback flow", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { "data-testid": "form" }, [
              h(Picker as any, {
                label: "Test",
                name: "picker",
                items,
                defaultSelectedKey: "2",
                validationBehavior: "native",
                validate: (value: string | null) => (value === "2" ? "Invalid value" : null),
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const trigger = wrapper.get("button");
    const select = wrapper.get('select[name="picker"]');
    await nextTick();
    await nextTick();

    expect(trigger.attributes("aria-describedby")).toBeUndefined();
    expect((select.element as HTMLSelectElement).validity.valid).toBe(false);

    (select.element as HTMLSelectElement).checkValidity();
    (select.element as HTMLSelectElement).dispatchEvent(
      new Event("invalid", {
        bubbles: false,
        cancelable: true,
      })
    );
    await nextTick();
    await nextTick();

    const describedBy = trigger.attributes("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`#${describedBy}`).text()).toContain("Invalid value");
    expect(document.activeElement).toBe(trigger.element);

    await trigger.trigger("click");
    await nextTick();
    (select.element as HTMLSelectElement).value = "1";
    await select.trigger("change");
    await nextTick();
    await nextTick();
    await trigger.trigger("blur");
    await nextTick();
    await nextTick();

    expect(trigger.attributes("aria-describedby")).toBeUndefined();
  });

  it("supports native server validation", async () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      picker: "Invalid value.",
    });
    const wrapper = mount(
      defineComponent({
        setup() {
          provide(FormValidationContext, serverErrors);
          return () =>
            h(Picker as any, {
              label: "Test",
              name: "picker",
              items,
              validationBehavior: "native",
            });
        },
      }),
      { attachTo: document.body }
    );

    const trigger = wrapper.get("button");
    const select = wrapper.get('select[name="picker"]');
    await nextTick();
    await nextTick();

    let describedBy = trigger.attributes("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`#${describedBy}`).text()).toContain("Invalid value.");
    expect((select.element as HTMLSelectElement).validity.valid).toBe(false);

    await trigger.trigger("click");
    await nextTick();
    (select.element as HTMLSelectElement).value = "1";
    await select.trigger("change");
    await nextTick();
    await nextTick();
    await trigger.trigger("blur");
    await nextTick();
    await nextTick();

    describedBy = trigger.attributes("aria-describedby");
    expect(describedBy).toBeUndefined();
    expect((select.element as HTMLSelectElement).validity.valid).toBe(true);
  });

  it("supports custom native error messages", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { "data-testid": "form" }, [
              h(Picker as any, {
                label: "Test",
                name: "picker",
                items,
                isRequired: true,
                validationBehavior: "native",
                errorMessage: (validation: { validationDetails: ValidityState | null }) =>
                  validation.validationDetails?.valueMissing ? "Please enter a value" : null,
              }),
            ]);
        },
      }),
      { attachTo: document.body }
    );

    const trigger = wrapper.get("button");
    const select = wrapper.get('select[name="picker"]');

    expect(trigger.attributes("aria-describedby")).toBeUndefined();
    await nextTick();
    await nextTick();
    (select.element as HTMLSelectElement).checkValidity();
    (select.element as HTMLSelectElement).dispatchEvent(
      new Event("invalid", {
        bubbles: false,
        cancelable: true,
      })
    );
    await nextTick();
    await nextTick();

    const describedBy = trigger.attributes("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`#${describedBy}`).text()).toContain("Please enter a value");
    expect((select.element as HTMLSelectElement).validity.valid).toBe(false);
    expect((select.element as HTMLSelectElement).validationMessage).toContain("Please enter a value");
  });

  it("clears native validation state on form reset", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", null, [
              h(Picker as any, {
                label: "Test",
                name: "picker",
                items,
                isRequired: true,
                validationBehavior: "native",
              }),
              h("button", {
                type: "reset",
                "data-testid": "reset",
              }, "Reset"),
            ]);
        },
      }),
      { attachTo: document.body }
    );

    const trigger = wrapper.get("button");
    const select = wrapper.get('select[name="picker"]');

    await nextTick();
    await nextTick();
    (select.element as HTMLSelectElement).checkValidity();
    (select.element as HTMLSelectElement).dispatchEvent(
      new Event("invalid", {
        bubbles: false,
        cancelable: true,
      })
    );
    await nextTick();
    await nextTick();
    expect(trigger.attributes("aria-describedby")).toBeTruthy();

    await trigger.trigger("click");
    await nextTick();
    (select.element as HTMLSelectElement).value = "1";
    await select.trigger("change");
    await nextTick();
    await nextTick();
    expect(trigger.attributes("aria-describedby")).toBeUndefined();

    await wrapper.get('[data-testid="reset"]').trigger("click");
    await nextTick();
    await nextTick();
    expect(trigger.attributes("aria-describedby")).toBeUndefined();
  });

  it("supports aria validate callback flow", async () => {
    const wrapper = renderPicker({
      name: "picker",
      defaultSelectedKey: "2",
      validate: (value: string | null) => (value === "2" ? "Invalid value" : null),
    });
    const trigger = wrapper.get("button");
    const select = wrapper.get('select[name="picker"]');
    const error = wrapper.get(".spectrum-HelpText.is-invalid");

    expect(trigger.attributes("aria-describedby")).toBe(error.attributes("id"));
    expect(error.text()).toContain("Invalid value");
    expect((select.element as HTMLSelectElement).validity.valid).toBe(true);

    await trigger.trigger("click");
    await nextTick();
    (select.element as HTMLSelectElement).value = "1";
    await select.trigger("change");
    await nextTick();
    await nextTick();

    expect(trigger.attributes("aria-describedby")).toBeUndefined();
    expect(wrapper.find(".spectrum-HelpText.is-invalid").exists()).toBe(false);
  });

  it("supports aria server validation", async () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      picker: "Invalid value",
    });
    const wrapper = mount(
      defineComponent({
        setup() {
          provide(FormValidationContext, serverErrors);
          return () =>
            h(Picker as any, {
              label: "Test",
              name: "picker",
              items,
            });
        },
      }),
      { attachTo: document.body }
    );

    const trigger = wrapper.get("button");
    let describedBy = trigger.attributes("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`#${describedBy}`).text()).toContain("Invalid value");

    await trigger.trigger("click");
    await nextTick();
    const select = wrapper.get('select[name="picker"]');
    (select.element as HTMLSelectElement).value = "1";
    await select.trigger("change");
    await nextTick();
    await nextTick();

    describedBy = trigger.attributes("aria-describedby");
    expect(describedBy).toBeUndefined();
    expect(wrapper.find(".spectrum-HelpText.is-invalid").exists()).toBe(false);
  });

  it("supports hidden select autocomplete attribute", () => {
    const wrapper = renderPicker({
      label: "Test",
      autoComplete: "address-level1",
    });

    const select = wrapper.get("select");
    expect(select.attributes("autocomplete")).toBe("address-level1");
  });

  it("supports labeling via aria-label", () => {
    const wrapper = renderPicker({
      ariaLabel: "Test label",
    });

    const trigger = wrapper.get("button");
    expect(trigger.attributes("aria-label")).toBe("Test label");
  });

  it("supports labeling via a visible label", async () => {
    const wrapper = renderPicker({
      label: "Test",
    });

    const trigger = wrapper.get("button");
    const label = wrapper.get(".spectrum-FieldLabel");
    const value = wrapper.get(".spectrum-Dropdown-label");
    const labelId = label.attributes("id");
    const valueId = value.attributes("id");
    expect(labelId).toBeTruthy();
    expect(valueId).toBeTruthy();
    expect(trigger.attributes("aria-labelledby")).toContain(labelId ?? "");
    expect(trigger.attributes("aria-labelledby")).toContain(valueId ?? "");

    await trigger.trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(listbox?.getAttribute("aria-labelledby")).toContain(labelId ?? "");
  });

  it("supports labeling via aria-labelledby", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("div", null, [
              h("span", { id: "picker-labelledby" }, "External label"),
              h(Picker as any, {
                ariaLabelledby: "picker-labelledby",
                items,
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const trigger = wrapper.get("button");
    expect(trigger.attributes("aria-labelledby")).toContain("picker-labelledby");
  });

  it("supports combined aria-label and aria-labelledby labeling", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("div", null, [
              h("span", { id: "picker-labelledby" }, "External label"),
              h(Picker as any, {
                ariaLabel: "Fallback label",
                ariaLabelledby: "picker-labelledby",
                items,
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const trigger = wrapper.get("button");
    expect(trigger.attributes("aria-labelledby")).toContain("picker-labelledby");
  });

  it("focuses trigger when clicking the label", async () => {
    const wrapper = renderPicker({
      label: "Test",
    });

    const label = wrapper.get(".spectrum-FieldLabel");
    await label.trigger("click");
    await nextTick();

    expect(document.activeElement).toBe(wrapper.get("button").element);
  });

  it("calls onFocus and onBlur for the closed trigger", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const wrapper = renderPicker({
      onFocus,
      onBlur,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("focus");
    await trigger.trigger("blur");
    await nextTick();

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("does not call onBlur when selecting an item", async () => {
    const onBlur = vi.fn();
    const wrapper = renderPicker({
      onBlur,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "2";
    await select.trigger("change");
    await nextTick();

    expect(wrapper.text()).toContain("Two");
    expect(onBlur).toHaveBeenCalledTimes(0);
  });

  it("focuses the trigger when autoFocus is true", async () => {
    const wrapper = renderPicker({
      autoFocus: true,
    });

    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(wrapper.get("button").element);
  });

  it("respects disabled state", async () => {
    const wrapper = renderPicker({
      isDisabled: true,
    });

    const trigger = wrapper.get("button");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("does not open on mouse down when disabled", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      isDisabled: true,
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("mousedown");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(trigger.element);
  });

  it("does not open on space key when disabled", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      isDisabled: true,
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("keydown", { key: " " });
    await trigger.trigger("keyup", { key: " " });
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(trigger.element);
  });

  it("shows a loading spinner on the trigger when loading with no items", async () => {
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        items: [],
        isLoading: true,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    const progressbar = trigger.get('[role="progressbar"]');

    expect(progressbar.attributes("aria-label")).toBe("Loading…");
    expect(progressbar.attributes("aria-valuenow")).toBeUndefined();
    expect(trigger.attributes("aria-describedby")).toBe(progressbar.attributes("id"));

    await wrapper.setProps({
      isLoading: false,
    });
    await nextTick();

    expect(trigger.find('[role="progressbar"]').exists()).toBe(false);
    expect(trigger.attributes("aria-describedby")).toBeUndefined();
  });

  it("shows a loading-more spinner in the open listbox when isLoading is true", async () => {
    const wrapper = renderPicker({
      isLoading: true,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    let options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(options).toHaveLength(4);

    let progressbar = options[3]?.querySelector('[role="progressbar"]') as HTMLElement | null;
    expect(progressbar).toBeTruthy();
    expect(progressbar?.getAttribute("aria-label")).toBe("Loading more…");
    expect(progressbar?.getAttribute("aria-valuenow")).toBeNull();

    await wrapper.setProps({
      isLoading: false,
    });
    await nextTick();

    options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(options).toHaveLength(3);
    expect(document.body.querySelector('[role="progressbar"]')).toBeNull();
  });

  it("fires onLoadMore when scrolling near the end of an open listbox", async () => {
    const maxHeight = 200;
    const clientHeightSpy = vi
      .spyOn(window.HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return maxHeight;
        }
        return 48;
      });
    const scrollHeightSpy = vi
      .spyOn(window.HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 4800;
        }
        return 48;
      });

    try {
      const onLoadMore = vi.fn();
      const wrapper = mount(Picker as any, {
        props: {
          ariaLabel: "Picker",
          maxHeight,
          onLoadMore,
          items: Array.from({ length: 100 }, (_, index) => ({
            key: `item-${index + 1}`,
            label: `Item ${index + 1}`,
          })),
        },
        attachTo: document.body,
      });

      await wrapper.get("button").trigger("click");
      await nextTick();

      const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
      expect(listbox).toBeTruthy();

      if (listbox) {
        listbox.scrollTop = 1500;
        listbox.dispatchEvent(new Event("scroll", { bubbles: true }));
        listbox.scrollTop = 5000;
        listbox.dispatchEvent(new Event("scroll", { bubbles: true }));
      }
      await nextTick();

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("supports RouterProvider links on items", async () => {
    const navigate = vi.fn();
    const useHref = (href: string) => (href.startsWith("http") ? href : `/base${href}`);
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                router: { navigate, useHref },
              },
              () =>
                h(
                  Picker as any,
                  {
                    ariaLabel: "Picker",
                  },
                  {
                    default: () => [
                      h(
                        Item as any,
                        { id: "one", href: "/one", routerOptions: { foo: "bar" } },
                        { default: () => "One" }
                      ),
                      h(Item as any, { id: "two", href: "https://adobe.com" }, { default: () => "Two" }),
                    ],
                  }
                )
            );
        },
      }),
      {
        attachTo: document.body,
      }
    );

    await wrapper.get("button").trigger("click");
    await nextTick();

    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(options).toHaveLength(2);
    expect(options[0]?.tagName).toBe("A");
    expect(options[0]?.getAttribute("href")).toBe("/base/one");

    options[0]?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(navigate).toHaveBeenCalledWith("/one", { foo: "bar" });

    navigate.mockReset();
    options[1]?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(navigate).not.toHaveBeenCalled();
  });

  it.each(["mouse", "keyboard"] as const)(
    "supports plain link items with %s interaction without selecting",
    async (interactionType) => {
      const restoreNavigation = preventLinkNavigation();
      try {
        const onSelectionChange = vi.fn();
        const wrapper = mount(Picker as any, {
          props: {
            ariaLabel: "Picker",
            onSelectionChange,
          },
          slots: {
            default: () => [
              h(Item as any, { id: "one", href: "https://google.com" }, { default: () => "One" }),
              h(Item as any, { id: "two", href: "https://adobe.com" }, { default: () => "Two" }),
            ],
          },
          attachTo: document.body,
        });

        await wrapper.get("button").trigger("click");
        await nextTick();

        const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
        expect(options).toHaveLength(2);
        expect(options[0]?.tagName).toBe("A");
        expect(options[1]?.tagName).toBe("A");

        if (interactionType === "mouse") {
          options[0]?.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
            })
          );
        } else {
          options[0]?.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "Enter",
              bubbles: true,
              cancelable: true,
            })
          );
          options[0]?.dispatchEvent(
            new KeyboardEvent("keyup", {
              key: "Enter",
              bubbles: true,
              cancelable: true,
            })
          );
        }
        await nextTick();

        expect(onSelectionChange).not.toHaveBeenCalled();
        expect(wrapper.get("button").text()).toContain("Select…");
        expect(document.body.querySelector('[role="listbox"]')).toBeNull();
      } finally {
        restoreNavigation();
      }
    }
  );

  it("supports slot-defined items and sections", async () => {
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
      },
      slots: {
        default: () => [
          h(Section as any, { title: "Numbers" }, {
            default: () => [
              h(Item as any, { id: "one" }, { default: () => "One" }),
              h(Item as any, { id: "two" }, { default: () => "Two" }),
            ],
          }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(options).toHaveLength(3);
    expect(document.body.textContent).toContain("Numbers");
  });

  it("supports complex section labeling and option descriptions", async () => {
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
      },
      slots: {
        default: () => [
          h(Section as any, { title: "Section 1" }, {
            default: () => [
              h(Item as any, { id: "copy", textValue: "Copy" }, {
                default: () => h("span", null, "Copy"),
              }),
              h(Item as any, { id: "cut", textValue: "Cut" }, {
                default: () => h("span", null, "Cut"),
              }),
            ],
          }),
          h(Section as any, { title: "Section 2" }, {
            default: () => [
              h(Item as any, { id: "puppy", textValue: "Puppy" }, {
                default: () => [
                  h("span", null, "Puppy"),
                  h("span", { slot: "description" }, "Puppy description"),
                ],
              }),
              h(Item as any, { id: "doggo", textValue: "Doggo" }, {
                default: () => h("span", null, "Doggo"),
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const sections = Array.from(document.body.querySelectorAll('[role="group"]')) as HTMLElement[];
    const headings = Array.from(document.body.querySelectorAll(".spectrum-Menu-sectionHeading")) as HTMLElement[];
    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(sections).toHaveLength(2);
    expect(headings).toHaveLength(2);
    expect(options).toHaveLength(4);

    expect(headings[0]?.textContent).toContain("Section 1");
    expect(headings[1]?.textContent).toContain("Section 2");
    expect(sections[0]?.getAttribute("aria-labelledby")).toBe(headings[0]?.id);
    expect(sections[1]?.getAttribute("aria-labelledby")).toBe(headings[1]?.id);

    const firstLabel = options[0]?.querySelector(".spectrum-Menu-itemLabel") as HTMLElement | null;
    expect(firstLabel).toBeTruthy();
    expect(options[0]?.getAttribute("aria-labelledby")).toContain(firstLabel?.id ?? "");

    const puppyOption = options.find((option) => option.textContent?.includes("Puppy")) as HTMLElement | undefined;
    const puppyDescription = puppyOption?.querySelector(".spectrum-Menu-description") as HTMLElement | null;
    expect(puppyOption).toBeTruthy();
    expect(puppyDescription).toBeTruthy();
    expect(puppyOption?.getAttribute("aria-describedby")).toContain(puppyDescription?.id ?? "");
  });

  it("focuses options on hover when open", async () => {
    const wrapper = renderPicker();

    await wrapper.get("button").trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(3);

    setInteractionModality("pointer");
    options[1]?.dispatchEvent(
      new MouseEvent("mouseenter", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();
    setInteractionModality("keyboard");

    expect(document.activeElement).toBe(options[1]);
  });
});
