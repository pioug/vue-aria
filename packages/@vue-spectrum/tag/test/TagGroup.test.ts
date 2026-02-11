import { render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
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

  it("supports aria-label on each tag item", () => {
    const tree = renderComponent();

    const tagGroup = tree.getByRole("grid", { name: "tag group" });
    const firstRow = tagGroup.querySelector('[role="row"]');
    const firstCell = firstRow?.querySelector('[role="gridcell"]');

    expect(firstCell?.getAttribute("aria-label")).toBe("Tag 1");
  });

  it("renders empty state", () => {
    const tree = renderComponent({
      items: [],
      emptyStateLabel: "No tags available",
    });

    expect(tree.getByText("No tags available")).toBeTruthy();
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

  it("exports Item alias", () => {
    expect(Item).toBe(Tag);
  });
});
