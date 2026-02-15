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

function renderTypeaheadListBox(props: Record<string, unknown> = {}) {
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
        h(Section as any, { title: "Heading 3" }, {
          default: () => [
            h(Item as any, { key: "Foo Bar" }, { default: () => "Foo Bar" }),
            h(Item as any, { key: "Foo Baz" }, { default: () => "Foo Baz" }),
          ],
        }),
      ],
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

  it("supports multiple default selected keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "multiple",
      defaultSelectedKeys: ["Foo", "Bar"],
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    expect(options[0]?.attributes("aria-selected")).toBe("true");
    expect(options[1]?.attributes("aria-selected")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(2);

    await options[4]?.trigger("click");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(options[4]?.attributes("aria-selected")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(3);
  });

  it("supports controlled selected keys in multiple mode", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "multiple",
      selectedKeys: ["Foo", "Bar"],
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    expect(options[0]?.attributes("aria-selected")).toBe("true");
    expect(options[1]?.attributes("aria-selected")).toBe("true");

    await options[4]?.trigger("click");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(options[0]?.attributes("aria-selected")).toBe("true");
    expect(options[1]?.attributes("aria-selected")).toBe("true");
    expect(options[4]?.attributes("aria-selected")).toBe("false");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(2);
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

  it("skips disabled options during keyboard navigation", async () => {
    const wrapper = renderListBox({
      selectionMode: "single",
      disabledKeys: ["Baz"],
    });
    const listbox = wrapper.get('[role="listbox"]');
    (listbox.element as HTMLElement).focus();
    await nextTick();

    expect((document.activeElement as HTMLElement | null)?.getAttribute("data-key")).toBe("Foo");

    (document.activeElement as HTMLElement | null)?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await nextTick();
    expect((document.activeElement as HTMLElement | null)?.getAttribute("data-key")).toBe("Bar");

    (document.activeElement as HTMLElement | null)?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await nextTick();
    expect((document.activeElement as HTMLElement | null)?.getAttribute("data-key")).toBe("Blah");

    (document.activeElement as HTMLElement | null)?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    await nextTick();
    expect((document.activeElement as HTMLElement | null)?.getAttribute("data-key")).toBe("Bar");

    (document.activeElement as HTMLElement | null)?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    await nextTick();
    expect((document.activeElement as HTMLElement | null)?.getAttribute("data-key")).toBe("Foo");
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

  it("allows keyboard focus changes with ArrowDown and ArrowUp", async () => {
    const wrapper = renderListBox({
      autoFocus: "first",
    });
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(document.activeElement).toBe(options[0]?.element);

    (options[0]?.element as HTMLElement | undefined)?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
    );
    await nextTick();
    expect(document.activeElement).toBe(options[1]?.element);

    (options[1]?.element as HTMLElement | undefined)?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })
    );
    await nextTick();
    expect(document.activeElement).toBe(options[0]?.element);
  });

  it("supports single-selection activation with Space key", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "single",
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    await options[4]?.trigger("keydown", { key: " " });
    await options[4]?.trigger("keyup", { key: " " });

    expect(options[4]?.attributes("aria-selected")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(1);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.calls[0]?.[0]?.has("Bleh")).toBe(true);
  });

  it("supports deselection in multiple selection mode", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "multiple",
      defaultSelectedKeys: ["Foo", "Bar"],
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    expect(options[0]?.attributes("aria-selected")).toBe("true");
    expect(options[1]?.attributes("aria-selected")).toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(2);

    await options[0]?.trigger("click");

    expect(options[0]?.attributes("aria-selected")).toBe("false");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(1);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.calls[0]?.[0]?.has("Foo")).toBe(false);
    expect(onSelectionChange.mock.calls[0]?.[0]?.has("Bar")).toBe(true);
  });

  it('does not clear multiple selection on Escape when escapeKeyBehavior is "none"', async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "multiple",
      escapeKeyBehavior: "none",
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    await options[3]?.trigger("click");
    await options[1]?.trigger("click");

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(options[3]?.attributes("aria-selected")).toBe("true");
    expect(options[1]?.attributes("aria-selected")).toBe("true");

    await wrapper.get('[role="listbox"]').trigger("keydown", { key: "Escape" });

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(options[3]?.attributes("aria-selected")).toBe("true");
    expect(options[1]?.attributes("aria-selected")).toBe("true");
  });

  it("does not render selection checkmarks when selectionMode is not set", () => {
    const wrapper = renderListBox({
      selectedKeys: ["Foo"],
    });

    expect(wrapper.findAll('[role="option"]')).toHaveLength(5);
    expect(wrapper.findAll('[role="img"]')).toHaveLength(0);
  });

  it("prevents selection when selectionMode is none", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderListBox({
      selectionMode: "none",
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="option"]');
    await options[3]?.trigger("click");
    await options[4]?.trigger("keydown", { key: " " });
    await options[1]?.trigger("keydown", { key: "Enter" });

    expect(options[3]?.attributes("aria-selected")).not.toBe("true");
    expect(options[4]?.attributes("aria-selected")).not.toBe("true");
    expect(options[1]?.attributes("aria-selected")).not.toBe("true");
    expect(wrapper.findAll('[role="img"]')).toHaveLength(0);
    expect(onSelectionChange).toHaveBeenCalledTimes(0);
  });

  it("supports typeahead focus by typing letters in rapid succession", async () => {
    const wrapper = renderListBox({
      autoFocus: "first",
    });
    await nextTick();

    const listbox = wrapper.get('[role="listbox"]');
    const options = wrapper.findAll('[role="option"]');
    expect(document.activeElement).toBe(options[0]?.element);

    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "B", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[1]?.element);

    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "L", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[3]?.element);

    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "E", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[4]?.element);
  });

  it("resets typeahead search text after a timeout", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderListBox({
        autoFocus: "first",
      });
      await nextTick();

      const listbox = wrapper.get('[role="listbox"]');
      const options = wrapper.findAll('[role="option"]');
      expect(document.activeElement).toBe(options[0]?.element);

      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "B", bubbles: true }));
      await nextTick();
      expect(document.activeElement).toBe(options[1]?.element);

      vi.runAllTimers();
      await nextTick();

      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "B", bubbles: true }));
      await nextTick();
      expect(document.activeElement).toBe(options[1]?.element);
    } finally {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("wraps typeahead search when no later match exists", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = renderListBox({
        autoFocus: "first",
      });
      await nextTick();

      const listbox = wrapper.get('[role="listbox"]');
      const options = wrapper.findAll('[role="option"]');
      expect(document.activeElement).toBe(options[0]?.element);

      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "B", bubbles: true }));
      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "L", bubbles: true }));
      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "E", bubbles: true }));
      await nextTick();
      expect(document.activeElement).toBe(options[4]?.element);

      vi.runAllTimers();
      await nextTick();

      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "B", bubbles: true }));
      await nextTick();
      expect(document.activeElement).toBe(options[4]?.element);
    } finally {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("supports the space character in typeahead search", async () => {
    const wrapper = renderTypeaheadListBox({
      autoFocus: "first",
    });
    await nextTick();

    const listbox = wrapper.get('[role="listbox"]');
    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(7);
    expect(document.activeElement).toBe(options[0]?.element);

    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "F", bubbles: true }));
    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "O", bubbles: true }));
    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "O", bubbles: true }));
    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[5]?.element);

    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "B", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[5]?.element);

    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "A", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[5]?.element);

    (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "Z", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(options[6]?.element);
  });

  it("supports Space selection after typeahead search times out", async () => {
    vi.useFakeTimers();
    try {
      const onSelectionChange = vi.fn();
      const wrapper = renderTypeaheadListBox({
        autoFocus: "first",
        selectionMode: "single",
        onSelectionChange,
      });
      await nextTick();

      const listbox = wrapper.get('[role="listbox"]');
      const options = wrapper.findAll('[role="option"]');
      expect(options).toHaveLength(7);
      expect(document.activeElement).toBe(options[0]?.element);

      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "F", bubbles: true }));
      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "O", bubbles: true }));
      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "O", bubbles: true }));
      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      (listbox.element as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "B", bubbles: true }));
      await nextTick();

      expect(document.activeElement).toBe(options[5]?.element);
      expect((document.activeElement as HTMLElement | null)?.getAttribute("aria-selected")).toBe("false");
      expect(wrapper.findAll('[role="img"]')).toHaveLength(0);
      expect(onSelectionChange).toHaveBeenCalledTimes(0);

      vi.runAllTimers();
      await nextTick();

      const activeElement = document.activeElement as HTMLElement | null;
      activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      activeElement?.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
      await nextTick();

      expect((document.activeElement as HTMLElement | null)?.getAttribute("aria-selected")).toBe("true");
      expect(wrapper.findAll('[role="img"]')).toHaveLength(1);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange.mock.calls[0]?.[0]?.has("Foo Bar")).toBe(true);
    } finally {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("supports link items with selectionMode none", async () => {
    const restoreNavigation = preventLinkNavigation();
    try {
      const wrapper = mount(ListBox as any, {
        props: {
          ariaLabel: "ListBox",
          selectionMode: "none",
        },
        slots: {
          default: () => [
            h(Item as any, { key: "one", href: "https://google.com" }, { default: () => "One" }),
            h(Item as any, { key: "two", href: "https://adobe.com" }, { default: () => "Two" }),
          ],
        },
        attachTo: document.body,
      });

      const options = wrapper.findAll('[role="option"]');
      expect(options).toHaveLength(2);
      for (const option of options) {
        expect(option.element.tagName).toBe("A");
        expect(option.attributes("href")).toBeTruthy();
      }

      await options[0]?.trigger("click");
      expect(options[0]?.attributes("aria-selected")).not.toBe("true");
    } finally {
      restoreNavigation();
    }
  });

  it.each(["single", "multiple"] as const)(
    "supports link items with selectionMode %s without selecting them",
    async (selectionMode) => {
      const restoreNavigation = preventLinkNavigation();
      try {
        const wrapper = mount(ListBox as any, {
          props: {
            ariaLabel: "ListBox",
            selectionMode,
          },
          slots: {
            default: () => [
              h(Item as any, { key: "one", href: "https://google.com" }, { default: () => "One" }),
              h(Item as any, { key: "two", href: "https://adobe.com" }, { default: () => "Two" }),
            ],
          },
          attachTo: document.body,
        });

        const options = wrapper.findAll('[role="option"]');
        expect(options).toHaveLength(2);
        await options[0]?.trigger("click");
        await options[1]?.trigger("click");

        expect(options[0]?.attributes("aria-selected")).not.toBe("true");
        expect(options[1]?.attributes("aria-selected")).not.toBe("true");
      } finally {
        restoreNavigation();
      }
    }
  );

  it("supports keyboard Enter activation on links without selecting", async () => {
    const restoreNavigation = preventLinkNavigation();
    try {
      const wrapper = mount(ListBox as any, {
        props: {
          ariaLabel: "ListBox",
          selectionMode: "single",
        },
        slots: {
          default: () => [
            h(Item as any, { key: "one", href: "https://google.com" }, { default: () => "One" }),
            h(Item as any, { key: "two", href: "https://adobe.com" }, { default: () => "Two" }),
          ],
        },
        attachTo: document.body,
      });

      const options = wrapper.findAll('[role="option"]');
      await options[0]?.trigger("keydown", { key: "Enter" });
      await options[0]?.trigger("keyup", { key: "Enter" });

      expect(options[0]?.attributes("aria-selected")).not.toBe("true");
    } finally {
      restoreNavigation();
    }
  });

  it("supports aria-label attribute", () => {
    const wrapper = renderListBox({
      "aria-label": "Test",
      ariaLabel: undefined,
    });

    expect(wrapper.get('[role="listbox"]').attributes("aria-label")).toBe("Test");
  });

  it("warns when no aria-label or aria-labelledby is provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      mount(ListBox as any, {
        slots: {
          default: () => [h(Item as any, { key: "Foo" }, { default: () => "Foo" })],
        },
        attachTo: document.body,
      });

      expect(warnSpy).toHaveBeenCalledWith(
        "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("supports custom data attributes on listbox", () => {
    const wrapper = renderListBox({
      "data-testid": "test",
    });

    expect(wrapper.get('[role="listbox"]').attributes("data-testid")).toBe("test");
  });

  it("supports custom data attributes on items", () => {
    const wrapper = mount(ListBox as any, {
      props: {
        ariaLabel: "ListBox",
      },
      slots: {
        default: () => [
          h(Item as any, { key: 0, "data-name": "Foo" }, { default: () => "Foo" }),
          h(Item as any, { key: 1, "data-name": "Bar" }, { default: () => "Bar" }),
        ],
      },
      attachTo: document.body,
    });

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(2);
    expect(options[0]?.attributes("data-name")).toBe("Foo");
  });

  it("does not override generated option id with custom item id", () => {
    const wrapper = mount(ListBox as any, {
      props: {
        ariaLabel: "ListBox",
      },
      slots: {
        default: () => [
          h(Item as any, { key: 0, id: "Foo" }, { default: () => "Foo" }),
          h(Item as any, { key: 1, id: "Bar" }, { default: () => "Bar" }),
        ],
      },
      attachTo: document.body,
    });

    const option = wrapper.findAll('[role="option"]')[0];
    expect(option).toBeTruthy();
    expect(option?.attributes("id")).not.toBe("Foo");
  });

  it("supports aria-label on sections and items", () => {
    const wrapper = mount(ListBox as any, {
      props: {
        ariaLabel: "ListBox",
      },
      slots: {
        default: () => [
          h(Section as any, { "aria-label": "Section" }, {
            default: () => [
              h(Item as any, { key: "item", "aria-label": "Item" }, {
                default: () => h("svg"),
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const group = wrapper.get('[role="group"]');
    expect(group.attributes("aria-label")).toBe("Section");

    const option = wrapper.get('[role="option"]');
    expect(option.attributes("aria-label")).toBe("Item");
    expect(option.attributes("aria-labelledby")).toBeUndefined();
    expect(option.attributes("aria-describedby")).toBeUndefined();
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
