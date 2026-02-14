import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Item } from "../src/Item";
import { Menu } from "../src/Menu";
import { Section } from "../src/Section";

function renderMenu(props: Record<string, unknown> = {}) {
  return mount(Menu as any, {
    props: {
      ariaLabel: "Menu",
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

describe("Menu", () => {
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

  it("renders sections and menu items", () => {
    const wrapper = renderMenu();
    const menu = wrapper.get('[role="menu"]');

    expect(menu.attributes("aria-label")).toBe("Menu");
    expect(wrapper.findAll('[role="group"]')).toHaveLength(2);
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(1);

    const items = wrapper.findAll('[role="menuitem"]');
    expect(items).toHaveLength(5);
    expect(wrapper.text()).toContain("Foo");
    expect(wrapper.text()).toContain("Bar");
    expect(wrapper.text()).toContain("Baz");
    expect(wrapper.text()).toContain("Blah");
    expect(wrapper.text()).toContain("Bleh");
  });

  it("supports single selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderMenu({
      selectionMode: "single",
      onSelectionChange,
    });

    const items = wrapper.findAll('[role="menuitemradio"]');
    expect(items).toHaveLength(5);

    await items[4]?.trigger("click");

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(items[4]?.attributes("aria-checked")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(1);
  });

  it("respects disabled keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderMenu({
      selectionMode: "single",
      disabledKeys: ["Baz"],
      onSelectionChange,
    });

    const items = wrapper.findAll('[role="menuitemradio"]');
    await items[2]?.trigger("click");

    expect(items[2]?.attributes("aria-disabled")).toBe("true");
    expect(items[2]?.attributes("aria-checked")).toBe("false");
    expect(onSelectionChange).toHaveBeenCalledTimes(0);
  });

  it("wraps keyboard focus when shouldFocusWrap is enabled", async () => {
    const wrapper = renderMenu({
      shouldFocusWrap: true,
    });
    await nextTick();

    const items = wrapper.findAll('[role="menuitem"]');
    expect(items).toHaveLength(5);
    const menu = wrapper.get('[role="menu"]');
    (menu.element as HTMLElement).focus();
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

  it("supports multiple selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderMenu({
      selectionMode: "multiple",
      onSelectionChange,
    });

    const items = wrapper.findAll('[role="menuitemcheckbox"]');
    expect(items).toHaveLength(5);

    await items[3]?.trigger("click");
    await items[1]?.trigger("click");

    expect(items[3]?.attributes("aria-checked")).toBe("true");
    expect(items[1]?.attributes("aria-checked")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(2);
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });

  it("supports multiple default selected keys", () => {
    const wrapper = renderMenu({
      selectionMode: "multiple",
      defaultSelectedKeys: ["Foo", "Bar"],
    });

    const items = wrapper.findAll('[role="menuitemcheckbox"]');
    expect(items).toHaveLength(5);
    expect(items[0]?.attributes("aria-checked")).toBe("true");
    expect(items[1]?.attributes("aria-checked")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(2);
  });

  it("does not render selection checkmarks when selectionMode is not set", () => {
    const wrapper = renderMenu({
      selectedKeys: ["Foo"],
    });

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(5);
    expect(wrapper.findAll('[role="img"]')).toHaveLength(0);
  });

  it("supports onAction with a static list", async () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = mount(Menu as any, {
      props: {
        ariaLabel: "Menu",
        onSelectionChange,
        onAction,
      },
      slots: {
        default: () => [
          h(Item as any, { key: "One" }, { default: () => "One" }),
          h(Item as any, { key: "Two" }, { default: () => "Two" }),
          h(Item as any, { key: "Three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });

    const items = wrapper.findAll('[role="menuitem"]');
    expect(items).toHaveLength(3);

    await items[0]?.trigger("click");
    await items[1]?.trigger("click");
    await items[2]?.trigger("click");

    expect(onAction).toHaveBeenNthCalledWith(1, "One");
    expect(onAction).toHaveBeenNthCalledWith(2, "Two");
    expect(onAction).toHaveBeenNthCalledWith(3, "Three");
    expect(onSelectionChange).toHaveBeenCalledTimes(0);
  });

  it("supports onAction with a data-driven list", async () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = mount(Menu as any, {
      props: {
        ariaLabel: "Menu",
        onSelectionChange,
        onAction,
        items: [
          { key: "One", name: "One" },
          { key: "Two", name: "Two" },
          { key: "Three", name: "Three" },
        ],
      },
      attachTo: document.body,
    });

    const items = wrapper.findAll('[role="menuitem"]');
    expect(items).toHaveLength(3);

    await items[0]?.trigger("click");
    await items[1]?.trigger("click");
    await items[2]?.trigger("click");

    expect(onAction).toHaveBeenNthCalledWith(1, "One");
    expect(onAction).toHaveBeenNthCalledWith(2, "Two");
    expect(onAction).toHaveBeenNthCalledWith(3, "Three");
    expect(onSelectionChange).toHaveBeenCalledTimes(0);
  });

  it("supports onAction on menu and menu items", async () => {
    const onAction = vi.fn();
    const itemAction = vi.fn();
    const wrapper = mount(Menu as any, {
      props: {
        ariaLabel: "Menu",
        onAction,
      },
      slots: {
        default: () => [
          h(Item as any, { key: "cat", onAction: itemAction }, { default: () => "Cat" }),
          h(Item as any, { key: "dog" }, { default: () => "Dog" }),
          h(Item as any, { key: "kangaroo" }, { default: () => "Kangaroo" }),
        ],
      },
      attachTo: document.body,
    });

    const items = wrapper.findAll('[role="menuitem"]');
    expect(items).toHaveLength(3);

    await items[0]?.trigger("click");

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenLastCalledWith("cat");
    expect(itemAction).toHaveBeenCalledTimes(1);
  });

  it("supports onAction on section items and menu", async () => {
    const onAction = vi.fn();
    const itemAction = vi.fn();
    const wrapper = mount(Menu as any, {
      props: {
        ariaLabel: "Menu",
        onAction,
      },
      slots: {
        default: () => [
          h(Section as any, { title: "Animals" }, {
            default: () => [
              h(Item as any, { key: "cat", onAction: itemAction }, { default: () => "Cat" }),
              h(Item as any, { key: "dog" }, { default: () => "Dog" }),
              h(Item as any, { key: "kangaroo" }, { default: () => "Kangaroo" }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const items = wrapper.findAll('[role="menuitem"]');
    expect(items).toHaveLength(3);

    await items[0]?.trigger("click");

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenLastCalledWith("cat");
    expect(itemAction).toHaveBeenCalledTimes(1);
  });

  it("supports aria-label on sections and items", () => {
    const wrapper = mount(Menu as any, {
      props: {
        ariaLabel: "Menu",
      },
      slots: {
        default: () => [
          h(Section as any, { ariaLabel: "Section" }, {
            default: () => [
              h(Item as any, { key: "item", ariaLabel: "Item" }, {
                default: () => h("span", { "aria-hidden": "true" }, "I"),
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const group = wrapper.get('[role="group"]');
    expect(group.attributes("aria-label")).toBe("Section");

    const menuItem = wrapper.get('[role="menuitem"]');
    expect(menuItem.attributes("aria-label")).toBe("Item");
    expect(menuItem.attributes("aria-labelledby")).toBeUndefined();
    expect(menuItem.attributes("aria-describedby")).toBeUndefined();
  });

  it("warns if aria-label and aria-labelledby are missing", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(Menu as any, {
      slots: {
        default: () => [h(Item as any, { key: "One" }, { default: () => "One" })],
      },
      attachTo: document.body,
    });

    expect(spyWarn).toHaveBeenCalledWith("An aria-label or aria-labelledby prop is required for accessibility.");
    spyWarn.mockRestore();
  });

  it("supports custom data attributes", () => {
    const wrapper = mount(Menu as any, {
      props: {
        ariaLabel: "Menu",
      },
      attrs: {
        "data-testid": "menu-test",
      },
      slots: {
        default: () => [h(Item as any, { key: "One" }, { default: () => "One" })],
      },
      attachTo: document.body,
    });

    const menu = wrapper.get('[role="menu"]');
    expect(menu.attributes("data-testid")).toBe("menu-test");
  });
});
