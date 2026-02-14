import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
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

  it("supports uncontrolled default selected keys in single mode", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "single",
      defaultSelectedKeys: ["Blah"],
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    expect(options[3]?.attributes("aria-selected")).toBe("true");

    await options[4]?.trigger("click");

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(options[3]?.attributes("aria-selected")).toBe("false");
    expect(options[4]?.attributes("aria-selected")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(1);
  });

  it("supports controlled selected keys in single mode", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "single",
      selectedKeys: ["Blah"],
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    expect(options[3]?.attributes("aria-selected")).toBe("true");

    await options[4]?.trigger("click");

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(options[3]?.attributes("aria-selected")).toBe("true");
    expect(options[4]?.attributes("aria-selected")).toBe("false");
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

  it("wraps keyboard focus when shouldFocusWrap is enabled", async () => {
    const wrapper = renderListBox({
      shouldFocusWrap: true,
    });
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(5);
    const listbox = wrapper.get('[role="listbox"]');
    (listbox.element as HTMLElement).focus();
    await nextTick();
    expect((document.activeElement as HTMLElement | null)?.getAttribute("data-key")).toBe("Foo");

    (document.activeElement as HTMLElement | null)?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    await nextTick();
    const focusedAfterUp = document.activeElement as HTMLElement | null;
    expect(focusedAfterUp?.getAttribute("data-key")).toBe("Bleh");

    focusedAfterUp?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await nextTick();
    expect((document.activeElement as HTMLElement | null)?.getAttribute("data-key")).toBe("Foo");
  });

  it("does not render selection checkmarks when selectionMode is not set", () => {
    const wrapper = renderListBox({
      selectedKeys: ["Foo"],
    });

    expect(wrapper.findAll('[role="option"]')).toHaveLength(5);
    expect(wrapper.findAll('[role="img"]')).toHaveLength(0);
  });

  it("renders correctly with falsy section and item keys", () => {
    const wrapper = mount(ListBox as any, {
      props: {
        ariaLabel: "ListBox",
      },
      slots: {
        default: () => [
          h(Section as any, { key: 0, title: "Heading 1" }, {
            default: () => [
              h(Item as any, { key: 1 }, { default: () => "Foo" }),
              h(Item as any, { key: 2 }, { default: () => "Bar" }),
            ],
          }),
          h(Section as any, { key: "", title: "Heading 2" }, {
            default: () => [
              h(Item as any, { key: 3 }, { default: () => "Blah" }),
              h(Item as any, { key: 4 }, { default: () => "Bleh" }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.findAll('[role="group"]')).toHaveLength(2);
    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(4);
    expect(wrapper.text()).toContain("Foo");
    expect(wrapper.text()).toContain("Bar");
    expect(wrapper.text()).toContain("Blah");
    expect(wrapper.text()).toContain("Bleh");
  });
});
