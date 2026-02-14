import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { ComboBox } from "../src/ComboBox";
import { Item } from "../src/Item";
import { Section } from "../src/Section";

const items = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

function renderComboBox(props: Record<string, unknown> = {}) {
  return mount(ComboBox as any, {
    props: {
      label: "Test",
      items,
      ...props,
    },
    attachTo: document.body,
  });
}

let restoreScrollIntoView: (() => void) | null = null;

describe("ComboBox", () => {
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

  it("renders input, trigger button, and label", () => {
    const wrapper = renderComboBox();

    expect(wrapper.get('input[role="combobox"]')).toBeTruthy();
    expect(wrapper.get("button")).toBeTruthy();
    expect(wrapper.text()).toContain("Test");
  });

  it("opens with trigger click and selects an option", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      onSelectionChange,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const listbox = wrapper.get('[role="listbox"]');
    expect(listbox).toBeTruthy();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);

    await options[1]?.trigger("click");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Two");
  });

  it("supports controlled selectedKey updates", async () => {
    const wrapper = renderComboBox({
      selectedKey: "1",
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("One");

    await wrapper.setProps({
      selectedKey: "3",
    });
    await nextTick();
    await nextTick();

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Three");
  });

  it("keeps controlled selectedKey value on selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      selectedKey: "1",
      onSelectionChange,
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("One");

    await wrapper.get("button").trigger("click");
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[1]?.trigger("click");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("One");
  });

  it("propagates name and form attributes to the input", () => {
    const wrapper = renderComboBox({
      name: "combobox-name",
      form: "combobox-form",
    });

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("name")).toBe("combobox-name");
    expect(input.attributes("form")).toBe("combobox-form");
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderComboBox({
      isOpen: true,
      onOpenChange,
    });

    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();

    await wrapper.get("button").trigger("click");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports default open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderComboBox({
      defaultOpen: true,
      onOpenChange,
    });

    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();

    await wrapper.get("button").trigger("click");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("focuses input when autoFocus is true", async () => {
    const wrapper = renderComboBox({
      autoFocus: true,
    });

    await nextTick();

    expect(document.activeElement).toBe(wrapper.get('input[role="combobox"]').element);
  });

  it("supports slot-defined items and sections", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Test",
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

    expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
    expect(wrapper.text()).toContain("Numbers");
  });

  it("respects disabled state", async () => {
    const wrapper = renderComboBox({
      isDisabled: true,
    });

    const input = wrapper.get('input[role="combobox"]');
    const button = wrapper.get("button");
    expect(input.attributes("disabled")).toBeDefined();
    expect(button.attributes("disabled")).toBeDefined();

    await button.trigger("click");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("does not open on space key when disabled", async () => {
    const wrapper = renderComboBox({
      isDisabled: true,
    });

    const button = wrapper.get("button");
    await button.trigger("keydown", { key: " " });
    await button.trigger("keyup", { key: " " });
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });
});
