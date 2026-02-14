import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
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
});
