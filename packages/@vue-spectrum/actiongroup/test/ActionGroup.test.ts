import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { ActionGroup, Item } from "../src";

describe("ActionGroup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("renders action buttons from children", () => {
    const wrapper = mount(ActionGroup as any, {
      slots: {
        default: () => [
          h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" }),
          h(Item as any, { key: "align", textValue: "Align" }, { default: () => "Align" }),
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.findAll("button")).toHaveLength(2);
  });

  it("renders action buttons from items with render function", () => {
    const items = [
      { key: "edit", textValue: "Edit" },
      { key: "align", textValue: "Align" },
    ];

    const wrapper = mount(ActionGroup as any, {
      props: {
        items,
        children: (item: { key: string; textValue: string }) =>
          h(Item as any, { key: item.key, textValue: item.textValue }, { default: () => item.textValue }),
      },
      attachTo: document.body,
    });

    expect(wrapper.find('button[aria-label="Edit"]').exists()).toBe(true);
    expect(wrapper.find('button[aria-label="Align"]').exists()).toBe(true);
  });

  it("calls onAction with key", async () => {
    const onAction = vi.fn();
    const wrapper = mount(ActionGroup as any, {
      props: {
        onAction,
      },
      slots: {
        default: () => [
          h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" }),
          h(Item as any, { key: "align", textValue: "Align" }, { default: () => "Align" }),
        ],
      },
      attachTo: document.body,
    });

    await wrapper.get('button[aria-label="Align"]').trigger("click");

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("align");
  });

  it("supports single selection mode", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(ActionGroup as any, {
      props: {
        selectionMode: "single",
        onSelectionChange,
      },
      slots: {
        default: () => [
          h(Item as any, { key: "left", textValue: "Left" }, { default: () => "Left" }),
          h(Item as any, { key: "right", textValue: "Right" }, { default: () => "Right" }),
        ],
      },
      attachTo: document.body,
    });

    await wrapper.get('button[aria-label="Left"]').trigger("click");

    expect(wrapper.get('button[aria-label="Left"]').attributes("aria-checked")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it("respects disabledKeys", () => {
    const wrapper = mount(ActionGroup as any, {
      props: {
        disabledKeys: ["edit"],
      },
      slots: {
        default: () => [
          h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" }),
          h(Item as any, { key: "align", textValue: "Align" }, { default: () => "Align" }),
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.get('button[aria-label="Edit"]').attributes("disabled")).toBe("disabled");
    expect(wrapper.get('button[aria-label="Align"]').attributes("disabled")).toBeUndefined();
  });
});
