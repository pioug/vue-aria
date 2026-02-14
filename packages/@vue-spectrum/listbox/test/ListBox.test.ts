import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Item } from "../src/Item";
import { ListBox } from "../src/ListBox";
import { Section } from "../src/Section";

function renderListBox(props: Record<string, unknown> = {}) {
  return mount(ListBox as any, {
    props: {
      ariaLabel: "ListBox",
      ...props,
    },
    slots: {
      default: () => [
        h(Section as any, { title: "Heading 1" }, {
          default: () => [
            h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
            h(Item as any, { key: "Bar" }, { default: () => "Bar" }),
            h(Item as any, { key: "Baz" }, { default: () => "Baz" }),
          ],
        }),
        h(Section as any, { title: "Heading 2" }, {
          default: () => [
            h(Item as any, { key: "Blah" }, { default: () => "Blah" }),
            h(Item as any, { key: "Bleh" }, { default: () => "Bleh" }),
          ],
        }),
      ],
    },
    attachTo: document.body,
  });
}

describe("ListBox", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders sections and options", () => {
    const wrapper = renderListBox();

    const listbox = wrapper.get('[role="listbox"]');
    expect(listbox.attributes("aria-label")).toBe("ListBox");
    expect(wrapper.findAll('[role="group"]')).toHaveLength(2);
    expect(wrapper.findAll('[role="option"]')).toHaveLength(5);
    expect(wrapper.findAll('[role="presentation"].spectrum-Menu-divider')).toHaveLength(1);
  });

  it("supports single selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "single",
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    await options[4]?.trigger("click");

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(options[4]?.attributes("aria-selected")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(1);
  });

  it("supports multiple selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "multiple",
      onSelectionChange,
    });

    const listbox = wrapper.get('[role="listbox"]');
    expect(listbox.attributes("aria-multiselectable")).toBe("true");

    const options = wrapper.findAll('[role="option"]');
    await options[1]?.trigger("click");
    await options[3]?.trigger("click");

    expect(options[1]?.attributes("aria-selected")).toBe("true");
    expect(options[3]?.attributes("aria-selected")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });

  it("respects disabled keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "single",
      disabledKeys: ["Baz"],
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    await options[2]?.trigger("click");

    expect(options[2]?.attributes("aria-disabled")).toBe("true");
    expect(options[2]?.attributes("aria-selected")).toBe("false");
    expect(onSelectionChange).toHaveBeenCalledTimes(0);
  });
});
