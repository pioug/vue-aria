import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import {
  ActionGroup,
  ActionGroupItem,
  Item,
  type SpectrumActionGroupItemData,
} from "../src";

const items: SpectrumActionGroupItemData[] = [
  { key: "one", label: "One" },
  { key: "two", label: "Two" },
  { key: "three", label: "Three" },
];

function renderComponent(
  props: Record<string, unknown> = {},
  providerProps: Record<string, unknown> = {}
) {
  const App = defineComponent({
    name: "ActionGroupTestApp",
    setup() {
      return () =>
        h(
          Provider,
          {
            theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
            ...providerProps,
          },
          {
            default: () =>
              h(ActionGroup, {
                items,
                "aria-label": "actiongroup-test",
                ...props,
              }),
          }
        );
    },
  });

  return render(App);
}

describe("ActionGroup", () => {
  it("handles defaults", () => {
    const tree = renderComponent();

    expect(tree.getByRole("toolbar", { name: "actiongroup-test" })).toBeTruthy();

    const buttons = tree.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0].textContent).toContain("One");
    expect(buttons[1].textContent).toContain("Two");
    expect(buttons[2].textContent).toContain("Three");
  });

  it("handles vertical orientation", () => {
    const tree = renderComponent({
      orientation: "vertical",
      "data-testid": "test-group",
    });

    const group = tree.getByTestId("test-group");
    expect(group.getAttribute("aria-orientation")).toBe("vertical");
    expect(group.className).toContain("spectrum-ActionGroup--vertical");
  });

  it("supports aria-labelledby on the action group", () => {
    const App = defineComponent({
      name: "ActionGroupAriaLabelledByHarness",
      setup() {
        return () =>
          h("div", null, [
            h("span", { id: "actiongroup-label" }, "Action group label"),
            h(
              Provider,
              { theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP },
              {
                default: () =>
                  h(ActionGroup, {
                    items,
                    "aria-labelledby": "actiongroup-label",
                  }),
              }
            ),
          ]);
      },
    });

    const tree = render(App);
    const group = tree.getByRole("toolbar", { name: "Action group label" });
    expect(group.getAttribute("aria-labelledby")).toBe("actiongroup-label");
  });

  it("supports aria-describedby on the action group", () => {
    const App = defineComponent({
      name: "ActionGroupAriaDescribedByHarness",
      setup() {
        return () =>
          h("div", null, [
            h("p", { id: "actiongroup-description" }, "Helpful description"),
            h(
              Provider,
              { theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP },
              {
                default: () =>
                  h(ActionGroup, {
                    items,
                    "aria-label": "actiongroup-test",
                    "aria-describedby": "actiongroup-description",
                  }),
              }
            ),
          ]);
      },
    });

    const tree = render(App);
    const group = tree.getByRole("toolbar", { name: "actiongroup-test" });
    expect(group.getAttribute("aria-describedby")).toBe("actiongroup-description");
  });

  it("handles disabled single-selection mode", () => {
    const tree = renderComponent({
      selectionMode: "single",
      isDisabled: true,
    });

    const group = tree.getByRole("radiogroup", { name: "actiongroup-test" });
    expect(group.getAttribute("aria-disabled")).toBe("true");

    const options = tree.getAllByRole("radio");
    for (const option of options) {
      expect(option.getAttribute("disabled")).not.toBeNull();
    }
  });

  it("shifts button focus in the correct direction for LTR", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({}, { locale: "de-DE" });
    const buttons = tree.getAllByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(buttons[0]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(buttons[1]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(buttons[0]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(buttons[2]);
  });

  it("shifts button focus in the correct direction for RTL", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({}, { locale: "ar-AE" });
    const buttons = tree.getAllByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(buttons[0]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(buttons[2]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("skips disabled keys while navigating", async () => {
    const user = userEvent.setup();
    const tree = renderComponent(
      {
        disabledKeys: ["two"],
      },
      { locale: "de-DE" }
    );

    const buttons = tree.getAllByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(buttons[0]);
    expect(buttons[1].getAttribute("disabled")).not.toBeNull();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(buttons[2]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("is focusable from Shift+Tab", async () => {
    const user = userEvent.setup();

    const App = defineComponent({
      name: "ActionGroupShiftTabHarness",
      setup() {
        return () =>
          h("div", null, [
            h("button", { type: "button", "aria-label": "Before" }, "Before"),
            h(
              Provider,
              {
                theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
              },
              {
                default: () =>
                  h(ActionGroup, {
                    items,
                    "aria-label": "actiongroup-test",
                  }),
              }
            ),
            h("button", { type: "button", "aria-label": "After" }, "After"),
          ]);
      },
    });

    const tree = render(App);
    const before = tree.getByRole("button", { name: "Before" });
    const after = tree.getByRole("button", { name: "After" });
    const group = tree.getByRole("toolbar", { name: "actiongroup-test" });
    const actionButtons = within(group).getAllByRole("button");

    (after as HTMLButtonElement).focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(actionButtons[2]);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(before);
  });

  it("remembers the last focused item when tabbing away and back", async () => {
    const user = userEvent.setup();

    const App = defineComponent({
      name: "ActionGroupRememberFocusHarness",
      setup() {
        return () =>
          h("div", null, [
            h("button", { type: "button", "aria-label": "Before" }, "Before"),
            h(
              Provider,
              {
                theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
              },
              {
                default: () =>
                  h(ActionGroup, {
                    items,
                    "aria-label": "actiongroup-test",
                  }),
              }
            ),
            h("button", { type: "button", "aria-label": "After" }, "After"),
          ]);
      },
    });

    const tree = render(App);
    const before = tree.getByRole("button", { name: "Before" });
    const after = tree.getByRole("button", { name: "After" });
    const group = tree.getByRole("toolbar", { name: "actiongroup-test" });
    const actionButtons = within(group).getAllByRole("button");

    (before as HTMLButtonElement).focus();
    await user.tab();
    expect(document.activeElement).toBe(actionButtons[0]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(actionButtons[1]);

    await user.tab();
    expect(document.activeElement).toBe(after);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(actionButtons[1]);
  });

  it("supports onAction and selection callbacks", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "single",
      onAction,
      onSelectionChange,
    });

    const options = tree.getAllByRole("radio");

    await user.click(options[0]);
    expect(onAction).toHaveBeenLastCalledWith("one");
    expect(Array.from(onSelectionChange.mock.calls[0][0] as Set<string>)).toEqual(["one"]);
    expect(options[0].getAttribute("aria-checked")).toBe("true");

    await user.click(options[1]);
    expect(onAction).toHaveBeenLastCalledWith("two");
    expect(Array.from(onSelectionChange.mock.calls[1][0] as Set<string>)).toEqual(["two"]);
    expect(options[1].getAttribute("aria-checked")).toBe("true");
  });

  it("does not select all items on Cmd/Ctrl+A in multiple selection mode", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "multiple",
      onSelectionChange,
    });

    const options = tree.getAllByRole("checkbox");
    await user.click(options[0] as Element);
    expect(options[0].getAttribute("aria-checked")).toBe("true");

    const callsBefore = onSelectionChange.mock.calls.length;
    const group = tree.getByRole("toolbar", { name: "actiongroup-test" });
    fireEvent.keyDown(group, { key: "a", metaKey: true, ctrlKey: true });
    fireEvent.keyUp(group, { key: "a", metaKey: true, ctrlKey: true });

    expect(onSelectionChange.mock.calls.length).toBe(callsBefore);
    expect(options[0].getAttribute("aria-checked")).toBe("true");
    expect(options[1].getAttribute("aria-checked")).toBe("false");
    expect(options[2].getAttribute("aria-checked")).toBe("false");
  });

  it("supports buttonLabelBehavior=hide with icon-only class and aria-label fallback", () => {
    const customItems: SpectrumActionGroupItemData[] = [
      { key: "one", label: "One", "aria-label": "Edit item" },
      { key: "two", label: "Two" },
    ];

    const tree = renderComponent({
      items: customItems,
      buttonLabelBehavior: "hide",
    });

    const buttons = tree.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.className).toContain("spectrum-ActionGroup-item--iconOnly");
    expect(buttons[1]?.className).toContain("spectrum-ActionGroup-item--iconOnly");
    expect(buttons[0]?.getAttribute("aria-label")).toBe("Edit item");
    expect(buttons[1]?.getAttribute("aria-label")).toBe("Two");
  });

  it("supports buttonLabelBehavior=collapse by collapsing labels before overflowing", async () => {
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionGroup")) {
          return 250;
        }

        return 0;
      });
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionButton")) {
          if (this.classList.contains("spectrum-ActionGroup-item--iconOnly")) {
            return 40;
          }

          return 120;
        }

        return 0;
      });

    try {
      const tree = renderComponent({
        overflowMode: "collapse",
        buttonLabelBehavior: "collapse",
      });
      await nextTick();
      await nextTick();
      await nextTick();

      const buttons = tree.getAllByRole("button");
      expect(buttons).toHaveLength(3);
      expect(tree.queryByRole("button", { name: "More actions" })).toBeNull();
      expect(buttons[0]?.className).toContain("spectrum-ActionGroup-item--iconOnly");
      expect(buttons[1]?.className).toContain("spectrum-ActionGroup-item--iconOnly");
      expect(buttons[2]?.className).toContain("spectrum-ActionGroup-item--iconOnly");
      expect(buttons[0]?.getAttribute("aria-label")).toBe("One");
      expect(buttons[1]?.getAttribute("aria-label")).toBe("Two");
      expect(buttons[2]?.getAttribute("aria-label")).toBe("Three");
    } finally {
      clientWidthSpy.mockRestore();
      offsetWidthSpy.mockRestore();
    }
  });

  it("restores button labels for collapse behavior when space increases", async () => {
    let width = 250;
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionGroup")) {
          return width;
        }

        return 0;
      });
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionButton")) {
          if (this.classList.contains("spectrum-ActionGroup-item--iconOnly")) {
            return 40;
          }

          return 120;
        }

        return 0;
      });

    try {
      const tree = renderComponent({
        overflowMode: "collapse",
        buttonLabelBehavior: "collapse",
      });
      await nextTick();
      await nextTick();
      await nextTick();

      let buttons = tree.getAllByRole("button");
      expect(buttons[0]?.className).toContain("spectrum-ActionGroup-item--iconOnly");

      width = 800;
      window.dispatchEvent(new Event("resize"));
      await nextTick();
      await nextTick();
      await nextTick();

      buttons = tree.getAllByRole("button");
      expect(buttons[0]?.className).not.toContain("spectrum-ActionGroup-item--iconOnly");
      expect(buttons[1]?.className).not.toContain("spectrum-ActionGroup-item--iconOnly");
      expect(buttons[2]?.className).not.toContain("spectrum-ActionGroup-item--iconOnly");
    } finally {
      clientWidthSpy.mockRestore();
      offsetWidthSpy.mockRestore();
    }
  });

  it("collapses overflowing items into an overflow menu", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionGroup")) {
          return 220;
        }

        return 0;
      });
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionButton")) {
          return 100;
        }

        return 0;
      });

    try {
      const tree = renderComponent({
        overflowMode: "collapse",
        onAction,
      });
      await nextTick();
      await nextTick();

      const buttons = tree.getAllByRole("button");
      expect(buttons).toHaveLength(2);
      expect(buttons[0]?.textContent).toContain("One");
      expect(buttons[1]?.textContent).toContain("More");

      await user.click(buttons[1] as HTMLElement);
      const menu = tree.getByRole("menu");
      expect(menu).toBeTruthy();
      expect(tree.getByRole("menuitem", { name: "Two" })).toBeTruthy();

      await user.click(tree.getByRole("menuitem", { name: "Three" }));
      expect(onAction).toHaveBeenCalledWith("three");
    } finally {
      clientWidthSpy.mockRestore();
      offsetWidthSpy.mockRestore();
    }
  });

  it("collapses all items into the menu when selection mode is enabled", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionGroup")) {
          return 120;
        }

        return 0;
      });
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionButton")) {
          return 100;
        }

        return 0;
      });

    try {
      const tree = renderComponent({
        overflowMode: "collapse",
        selectionMode: "single",
        defaultSelectedKeys: ["two"],
        onSelectionChange,
      });
      await nextTick();
      await nextTick();

      expect(tree.queryByRole("radiogroup")).toBeNull();
      const menuButton = tree.getByRole("button", { name: "actiongroup-test" });
      expect(menuButton).toBeTruthy();

      await user.click(menuButton);
      const menuItems = tree.getAllByRole("menuitemradio");
      expect(menuItems).toHaveLength(3);
      expect(
        tree.getByRole("menuitemradio", { name: "Two" }).getAttribute("aria-checked")
      ).toBe("true");

      await user.click(tree.getByRole("menuitemradio", { name: "Three" }));
      expect(onSelectionChange).toHaveBeenCalled();
      const lastSelection = onSelectionChange.mock.calls[
        onSelectionChange.mock.calls.length - 1
      ]?.[0] as Set<string>;
      expect(Array.from(lastSelection)).toEqual(["three"]);
    } finally {
      clientWidthSpy.mockRestore();
      offsetWidthSpy.mockRestore();
    }
  });

  it("passes aria-labelledby to the overflow menu button when fully collapsed", async () => {
    const externalLabel = document.createElement("span");
    externalLabel.id = "external-actiongroup-label";
    externalLabel.textContent = "External actiongroup";
    document.body.append(externalLabel);

    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionGroup")) {
          return 220;
        }

        return 0;
      });
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionButton")) {
          return 100;
        }

        return 0;
      });

    try {
      const tree = renderComponent({
        overflowMode: "collapse",
        selectionMode: "single",
        ariaLabel: undefined,
        ariaLabelledby: "external-actiongroup-label",
      });
      await nextTick();
      await nextTick();

      const menuButton = tree.getByRole("button");
      expect(menuButton.getAttribute("aria-label")).toBeNull();
      expect(menuButton.getAttribute("aria-labelledby")).toBe(
        "external-actiongroup-label"
      );
    } finally {
      externalLabel.remove();
      clientWidthSpy.mockRestore();
      offsetWidthSpy.mockRestore();
    }
  });

  it("attaches a user provided ref", async () => {
    const groupRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(null);

    const App = defineComponent({
      name: "ActionGroupRefHarness",
      setup() {
        return () =>
          h(
            Provider,
            {
              theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
            },
            {
              default: () =>
                h(ActionGroup, {
                  ref: groupRef,
                  "aria-label": "actiongroup-test",
                  items,
                }),
            }
          );
      },
    });

    const tree = render(App);
    await nextTick();

    const group = tree.getByRole("toolbar", { name: "actiongroup-test" });
    expect(groupRef.value?.UNSAFE_getDOMNode()).toBe(group);
  });

  it("supports static slot syntax with ActionGroupItem", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    const App = defineComponent({
      name: "ActionGroupSlotHarness",
      setup() {
        return () =>
          h(
            Provider,
            {
              theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
            },
            {
              default: () =>
                h(
                  ActionGroup,
                  {
                    "aria-label": "actiongroup-test",
                    onAction,
                  },
                  {
                    default: () => [
                      h(ActionGroupItem, { id: "first" }, () => "First"),
                      h(ActionGroupItem, { id: "second", isDisabled: true }, () => "Second"),
                      h(ActionGroupItem, { id: "third" }, () => "Third"),
                    ],
                  }
                ),
            }
          );
      },
    });

    const tree = render(App);
    const buttons = tree.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[1]?.getAttribute("disabled")).not.toBeNull();

    await user.click(buttons[2] as HTMLElement);
    expect(onAction).toHaveBeenCalledWith("third");
  });

  it("supports data attributes on static ActionGroupItem nodes", () => {
    const App = defineComponent({
      name: "ActionGroupItemDataAttributesHarness",
      setup() {
        return () =>
          h(
            Provider,
            {
              theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
            },
            {
              default: () =>
                h(
                  ActionGroup,
                  {
                    "aria-label": "actiongroup-test",
                  },
                  {
                    default: () => [
                      h(ActionGroupItem, { id: "one", "data-testid": "item-one" }, () => "One"),
                      h(ActionGroupItem, { id: "two", "data-testid": "item-two" }, () => "Two"),
                    ],
                  }
                ),
            }
          );
      },
    });

    const tree = render(App);
    const buttons = tree.getAllByRole("button");
    expect(buttons[0]?.getAttribute("data-testid")).toBe("item-one");
    expect(buttons[1]?.getAttribute("data-testid")).toBe("item-two");
  });

  it("exports Item alias", () => {
    expect(Item).toBe(ActionGroupItem);
  });
});
