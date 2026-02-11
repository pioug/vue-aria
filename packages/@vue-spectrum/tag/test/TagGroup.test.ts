import { render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Form } from "@vue-spectrum/form";
import { Item, Tag, TagGroup, type SpectrumTagItemData } from "../src";

const items: SpectrumTagItemData[] = [
  { key: "1", label: "Tag 1", "aria-label": "Tag 1" },
  { key: "2", label: "Tag 2", "aria-label": "Tag 2" },
  { key: "3", label: "Tag 3", "aria-label": "Tag 3" },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(TagGroup, {
    props: {
      items,
      "aria-label": "tag group",
      ...props,
    },
  });
}

describe("TagGroup", () => {
  it("has correct accessibility roles", () => {
    const tree = renderComponent();

    const tagGroup = tree.getByRole("grid", { name: "tag group" });
    expect(tagGroup).toBeTruthy();

    const tags = tree.getAllByRole("row");
    const cells = tree.getAllByRole("gridcell");
    expect(tags).toHaveLength(3);
    expect(cells).toHaveLength(3);
  });

  it("has correct initial tab index", () => {
    const tree = renderComponent();
    const tags = tree.getAllByRole("row");

    expect(tags[0].getAttribute("tabindex")).toBe("0");
    expect(tags[1].getAttribute("tabindex")).toBe("-1");
    expect(tags[2].getAttribute("tabindex")).toBe("-1");
  });

  it("supports keyboard navigation in LTR", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ direction: "ltr" });
    const tags = tree.getAllByRole("row");

    tags[0]?.focus();
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tags[1]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tags[2]);
  });

  it("supports keyboard navigation in RTL", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ direction: "rtl" });
    const tags = tree.getAllByRole("row");

    tags[0]?.focus();
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tags[2]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tags[0]);
  });

  it("is focusable with Tab and then tabs to the next control", async () => {
    const user = userEvent.setup();

    const App = defineComponent({
      name: "TagGroupTabHarness",
      setup() {
        return () =>
          h("div", null, [
            h("button", { type: "button", "aria-label": "Before" }, "Before"),
            h(TagGroup, {
              "aria-label": "tag group",
              items,
            }),
            h("button", { type: "button", "aria-label": "After" }, "After"),
          ]);
      },
    });

    const tree = render(App);
    const before = tree.getByRole("button", { name: "Before" });
    const after = tree.getByRole("button", { name: "After" });
    const tags = tree.getAllByRole("row");

    (before as HTMLButtonElement).focus();
    expect(document.activeElement).toBe(before);

    await user.tab();
    expect(document.activeElement).toBe(tags[0]);

    await user.tab();
    expect(document.activeElement).toBe(after);
  });

  it("remembers the last focused tag when tabbing away and back", async () => {
    const user = userEvent.setup();

    const App = defineComponent({
      name: "TagGroupRememberFocusHarness",
      setup() {
        return () =>
          h("div", null, [
            h("button", { type: "button", "aria-label": "Before" }, "Before"),
            h(TagGroup, {
              "aria-label": "tag group",
              items,
            }),
            h("button", { type: "button", "aria-label": "After" }, "After"),
          ]);
      },
    });

    const tree = render(App);
    const tags = tree.getAllByRole("row");
    const before = tree.getByRole("button", { name: "Before" });
    const after = tree.getByRole("button", { name: "After" });

    (before as HTMLButtonElement).focus();
    await user.tab();
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tags[1]);

    await user.tab();
    expect(document.activeElement).toBe(after);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(tags[1]);
  });

  it("skips disabled keys when navigating", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ disabledKeys: ["2"] });
    const tags = tree.getAllByRole("row");

    tags[0]?.focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(tags[2]);
  });

  it("calls onRemove with deleted key and updates visible rows", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    const tree = renderComponent({
      allowsRemoving: true,
      onRemove,
    });

    const tags = tree.getAllByRole("row");
    tags[1]?.focus();

    await user.keyboard("{Delete}");

    expect(onRemove).toHaveBeenCalledTimes(1);
    const removedSet = onRemove.mock.calls[0]?.[0] as Set<string>;
    expect(Array.from(removedSet)).toEqual(["2"]);

    expect(tree.getAllByRole("row")).toHaveLength(2);
  });

  it("moves focus to the next available tag after removal", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      allowsRemoving: true,
    });

    let tags = tree.getAllByRole("row");
    (tags[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard("{Delete}");
    await nextTick();

    tags = tree.getAllByRole("row");
    expect(tags).toHaveLength(2);
    expect(document.activeElement).toBe(tags[0]);
    expect(tags[0]?.textContent).toContain("Tag 2");
  });

  it("focuses the tag grid when the last tag is removed", async () => {
    const user = userEvent.setup();
    const tree = render(TagGroup, {
      props: {
        items: [{ key: "only", label: "Only tag", "aria-label": "Only tag" }],
        allowsRemoving: true,
        "aria-label": "tag group",
      },
    });

    const tag = tree.getByRole("row");
    (tag as HTMLElement).focus();
    await user.keyboard("{Delete}");
    await nextTick();

    expect(tree.queryAllByRole("row")).toHaveLength(0);
    const grid = tree.getByRole("grid", { name: "tag group" });
    expect(document.activeElement).toBe(grid);
  });

  it("supports aria-label on each tag item", () => {
    const tree = renderComponent();

    const tagGroup = tree.getByRole("grid", { name: "tag group" });
    const firstRow = tagGroup.querySelector('[role="row"]');
    const firstCell = firstRow?.querySelector('[role="gridcell"]');

    expect(firstCell?.getAttribute("aria-label")).toBe("Tag 1");
  });

  it("renders label and description semantics", () => {
    const tree = render(TagGroup, {
      props: {
        label: "Tag labels",
        description: "Pick one or more tags",
        items: [{ key: "1", label: "Tag 1" }],
      },
    });

    const grid = tree.getByRole("grid", { name: "Tag labels" });
    const description = tree.getByText("Pick one or more tags");
    const describedBy = grid.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy?.includes(description.id)).toBe(true);
  });

  it("supports Form.validationErrors by name", () => {
    const App = defineComponent({
      name: "TagGroupFormValidationHarness",
      setup() {
        return () =>
          h(
            Form,
            {
              validationErrors: {
                tags: "Select at least one tag",
              },
            },
            {
              default: () => [
                h(TagGroup, {
                  name: "tags",
                  label: "Tag labels",
                  items: [{ key: "1", label: "Tag 1" }],
                }),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const grid = tree.getByRole("grid", { name: "Tag labels" });
    const message = tree.getByText("Select at least one tag");
    const describedBy = grid.getAttribute("aria-describedby");

    expect(grid.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toBeTruthy();
    expect(describedBy?.includes(message.id)).toBe(true);
  });

  it("renders empty state", () => {
    const tree = renderComponent({
      items: [],
      emptyStateLabel: "No tags available",
    });

    expect(tree.getByText("No tags available")).toBeTruthy();
  });

  it("supports custom empty state rendering", () => {
    const tree = render(TagGroup, {
      props: {
        items: [],
        "aria-label": "tag group",
        renderEmptyState: () => h("span", null, "No tags. Click to add."),
      },
    });

    expect(tree.getByText("No tags. Click to add.")).toBeTruthy();
  });

  it("allows tabbing to focusable content in a custom empty state", async () => {
    const user = userEvent.setup();
    const tree = render(TagGroup, {
      props: {
        items: [],
        "aria-label": "tag group",
        renderEmptyState: () => h("a", { href: "#empty-link" }, "Empty link"),
      },
    });

    const link = tree.getByRole("link", { name: "Empty link" });
    await user.tab();
    expect(document.activeElement).toBe(link);
  });

  it("supports static slot syntax with Tag", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    const App = defineComponent({
      name: "TagGroupSlotHarness",
      setup() {
        return () =>
          h(
            TagGroup,
            {
              "aria-label": "tag group",
              allowsRemoving: true,
              onRemove,
            },
            {
              default: () => [
                h(Tag, { id: "one" }, () => "Tag 1"),
                h(Tag, { id: "two", isDisabled: true }, () => "Tag 2"),
                h(Tag, { id: "three" }, () => "Tag 3"),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const tags = tree.getAllByRole("row");

    expect(tags).toHaveLength(3);
    expect(tags[1].getAttribute("aria-disabled")).toBe("true");

    tags[2]?.focus();
    await user.keyboard("{Backspace}");

    expect(onRemove).toHaveBeenCalledTimes(1);
    const removedSet = onRemove.mock.calls[0]?.[0] as Set<string>;
    expect(Array.from(removedSet)).toEqual(["three"]);
  });

  it("limits visible tags with maxRows and toggles show all / show less", async () => {
    const user = userEvent.setup();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-Tag")) {
          const text = this.textContent ?? "";
          if (text.includes("Tag 1")) {
            return { top: 10 } as DOMRect;
          }
          if (text.includes("Tag 2")) {
            return { top: 10 } as DOMRect;
          }
          if (text.includes("Tag 3")) {
            return { top: 20 } as DOMRect;
          }
          if (text.includes("Tag 4")) {
            return { top: 20 } as DOMRect;
          }
          if (text.includes("Tag 5")) {
            return { top: 30 } as DOMRect;
          }
          if (text.includes("Tag 6")) {
            return { top: 30 } as DOMRect;
          }
          if (text.includes("Tag 7")) {
            return { top: 40 } as DOMRect;
          }
        }

        return { top: 0 } as DOMRect;
      });

    try {
      const sevenItems: SpectrumTagItemData[] = [
        { key: "1", label: "Tag 1" },
        { key: "2", label: "Tag 2" },
        { key: "3", label: "Tag 3" },
        { key: "4", label: "Tag 4" },
        { key: "5", label: "Tag 5" },
        { key: "6", label: "Tag 6" },
        { key: "7", label: "Tag 7" },
      ];

      const tree = render(TagGroup, {
        props: {
          items: sevenItems,
          maxRows: 2,
          "aria-label": "tag group",
        },
      });

      await nextTick();
      await nextTick();

      expect(tree.getAllByRole("gridcell")).toHaveLength(4);
      const toggle = tree.getByRole("button", { name: "Show all (7)" });
      expect(toggle).toBeTruthy();

      await user.click(toggle);
      expect(tree.getAllByRole("gridcell")).toHaveLength(7);
      expect(tree.getByRole("button", { name: "Show less" })).toBeTruthy();

      await user.click(tree.getByRole("button", { name: "Show less" }));
      expect(tree.getAllByRole("gridcell")).toHaveLength(4);
      expect(tree.getByRole("button", { name: "Show all (7)" })).toBeTruthy();
    } finally {
      rectSpy.mockRestore();
    }
  });

  it("does not render maxRows toggle when tags fit within row limit", async () => {
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => ({ top: 10 } as DOMRect));

    try {
      const tree = render(TagGroup, {
        props: {
          items: [
            { key: "1", label: "Tag 1" },
            { key: "2", label: "Tag 2" },
          ],
          maxRows: 2,
          "aria-label": "tag group",
        },
      });

      await nextTick();
      await nextTick();

      expect(tree.getAllByRole("gridcell")).toHaveLength(2);
      expect(tree.queryByRole("button", { name: "Show all (2)" })).toBeNull();
      expect(tree.queryByRole("button", { name: "Show less" })).toBeNull();
    } finally {
      rectSpy.mockRestore();
    }
  });

  it("supports action button and labels the action group", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    const tree = render(TagGroup, {
      props: {
        items,
        "aria-label": "tag group",
        actionLabel: "Clear",
        onAction,
      },
    });

    const actionButton = tree.getByRole("button", { name: "Clear" });
    await user.click(actionButton);
    expect(onAction).toHaveBeenCalledTimes(1);

    const actionGroup = tree.getByRole("group");
    const tagGroup = tree.getByRole("grid", { name: "tag group" });
    expect(actionGroup.getAttribute("aria-label")).toBe("Actions");
    expect(actionGroup.getAttribute("aria-labelledby")).toContain(
      tagGroup.getAttribute("id") as string
    );
  });

  it("supports keyboard tab navigation to and from custom action button", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    const App = defineComponent({
      name: "TagGroupActionKeyboardHarness",
      setup() {
        return () =>
          h("div", null, [
            h("button", { type: "button", "aria-label": "Before" }, "Before"),
            h(TagGroup, {
              items,
              "aria-label": "tag group",
              actionLabel: "Clear",
              onAction,
            }),
          ]);
      },
    });

    const tree = render(App);
    const before = tree.getByRole("button", { name: "Before" });
    const tags = tree.getAllByRole("row");
    const actionButton = tree.getByRole("button", { name: "Clear" });

    (before as HTMLButtonElement).focus();
    await user.tab();
    expect(document.activeElement).toBe(tags[0]);

    await user.tab();
    expect(document.activeElement).toBe(actionButton);

    await user.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledTimes(1);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tags[1]);

    await user.tab();
    expect(document.activeElement).toBe(actionButton);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(tags[1]);
  });

  it("supports keyboard navigation across maxRows toggle and custom action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-Tag")) {
          const text = this.textContent ?? "";
          if (text.includes("Tag 1")) {
            return { top: 10 } as DOMRect;
          }
          if (text.includes("Tag 2")) {
            return { top: 10 } as DOMRect;
          }
          if (text.includes("Tag 3")) {
            return { top: 20 } as DOMRect;
          }
          if (text.includes("Tag 4")) {
            return { top: 20 } as DOMRect;
          }
          if (text.includes("Tag 5")) {
            return { top: 30 } as DOMRect;
          }
          if (text.includes("Tag 6")) {
            return { top: 30 } as DOMRect;
          }
          if (text.includes("Tag 7")) {
            return { top: 40 } as DOMRect;
          }
        }

        return { top: 0 } as DOMRect;
      });

    try {
      const sevenItems: SpectrumTagItemData[] = [
        { key: "1", label: "Tag 1" },
        { key: "2", label: "Tag 2" },
        { key: "3", label: "Tag 3" },
        { key: "4", label: "Tag 4" },
        { key: "5", label: "Tag 5" },
        { key: "6", label: "Tag 6" },
        { key: "7", label: "Tag 7" },
      ];

      const App = defineComponent({
        name: "TagGroupToggleAndActionKeyboardHarness",
        setup() {
          return () =>
            h("div", null, [
              h("button", { type: "button", "aria-label": "Before" }, "Before"),
              h(TagGroup, {
                items: sevenItems,
                maxRows: 2,
                "aria-label": "tag group",
                actionLabel: "Clear",
                onAction,
              }),
            ]);
        },
      });

      const tree = render(App);
      await nextTick();
      await nextTick();

      const before = tree.getByRole("button", { name: "Before" });
      const tags = tree.getAllByRole("row");
      const showAllButton = tree.getByRole("button", { name: "Show all (7)" });
      const actionButton = tree.getByRole("button", { name: "Clear" });

      expect(tags.length).toBeGreaterThan(0);
      expect(tree.getAllByRole("gridcell")).toHaveLength(4);

      (before as HTMLButtonElement).focus();
      await user.tab();
      expect(document.activeElement).toBe(tags[0]);

      await user.tab();
      expect(document.activeElement).toBe(showAllButton);

      await user.tab();
      expect(document.activeElement).toBe(actionButton);

      await user.keyboard("{Enter}");
      expect(onAction).toHaveBeenCalledTimes(1);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(showAllButton);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(tags[0]);
    } finally {
      rectSpy.mockRestore();
    }
  });

  it("supports data attributes on tag group and tag items", () => {
    const App = defineComponent({
      name: "TagGroupDataAttributesHarness",
      setup() {
        return () =>
          h(
            TagGroup,
            {
              "aria-label": "tag group",
              "data-foo": "group",
            },
            {
              default: () => [
                h(Tag, { id: "one", "data-foo": "one" }, () => "Tag 1"),
                h(Tag, { id: "two", "data-foo": "two" }, () => "Tag 2"),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const grid = tree.getByRole("grid", { name: "tag group" });
    const rows = tree.getAllByRole("row");

    expect(grid.getAttribute("data-foo")).toBe("group");
    expect(rows[0]?.getAttribute("data-foo")).toBe("one");
    expect(rows[1]?.getAttribute("data-foo")).toBe("two");
  });

  it("supports link-style tag items via href", async () => {
    const user = userEvent.setup();
    const linkClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    try {
      const App = defineComponent({
        name: "TagGroupLinksHarness",
        setup() {
          return () =>
            h(
              TagGroup,
              {
                "aria-label": "tag group",
              },
              {
                default: () => [
                  h(Tag, { id: "one", href: "https://example.com/one" }, () => "One"),
                  h(Tag, { id: "two", href: "https://example.com/two" }, () => "Two"),
                ],
              }
            );
        },
      });

      const tree = render(App);
      const rows = tree.getAllByRole("row");
      expect(rows[0]?.tagName).toBe("DIV");
      expect(rows[1]?.tagName).toBe("DIV");
      expect(rows[0]?.getAttribute("data-href")).toBe("https://example.com/one");
      expect(rows[1]?.getAttribute("data-href")).toBe("https://example.com/two");

      await user.click(rows[0] as HTMLElement);
      expect(linkClickSpy).toHaveBeenCalledTimes(1);
    } finally {
      linkClickSpy.mockRestore();
    }
  });

  it("supports UNSAFE_className passthrough on static tag items", () => {
    const App = defineComponent({
      name: "TagGroupClassNameHarness",
      setup() {
        return () =>
          h(
            TagGroup,
            {
              "aria-label": "tag group",
            },
            {
              default: () => [h(Tag, { id: "one", UNSAFE_className: "test-class" }, () => "Tag 1")],
            }
          );
      },
    });

    const tree = render(App);
    const row = tree.getByRole("row", { name: "Tag 1" });
    expect(row.className).toContain("spectrum-Tag");
    expect(row.className).toContain("test-class");
  });

  it("exports Item alias", () => {
    expect(Item).toBe(Tag);
  });
});
