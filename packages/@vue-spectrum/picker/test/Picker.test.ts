import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
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

describe("Picker", () => {
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
