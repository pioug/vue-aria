import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  ListBox,
  ListBoxOption,
  ListBoxSection,
  type SpectrumListBoxItemData,
} from "../src";

const sectionedItems: SpectrumListBoxItemData[] = [
  {
    key: "section-1",
    heading: "Heading 1",
    items: [
      { key: "foo", label: "Foo" },
      { key: "bar", label: "Bar" },
      { key: "baz", label: "Baz" },
    ],
  },
  {
    key: "section-2",
    heading: "Heading 2",
    items: [
      { key: "blah", label: "Blah" },
      { key: "bleh", label: "Bleh" },
    ],
  },
  {
    key: "section-3",
    heading: "Heading 3",
    items: [
      { key: "foo-bar", label: "Foo Bar" },
      { key: "foo-baz", label: "Foo Baz" },
    ],
  },
];

const itemsWithFalsySectionId: SpectrumListBoxItemData[] = [
  {
    key: 0,
    heading: "Heading 1",
    items: [
      { key: 1, label: "Foo" },
      { key: 2, label: "Bar" },
    ],
  },
  {
    key: "",
    heading: "Heading 2",
    items: [
      { key: 3, label: "Blah" },
      { key: 4, label: "Bleh" },
    ],
  },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(ListBox, {
    props: {
      items: sectionedItems,
      "aria-label": "listbox-test",
      ...props,
    },
  });
}

function findOptionByText(listbox: HTMLElement, text: string): HTMLElement {
  const label = within(listbox).getByText(text);
  const option = label.closest('[role="option"]');
  if (!option) {
    throw new Error(`Option not found for ${text}`);
  }

  return option as HTMLElement;
}

describe("ListBox", () => {
  it("renders sections and options", () => {
    const tree = renderComponent();
    const listbox = tree.getByRole("listbox", { name: "listbox-test" });

    expect(listbox).toBeTruthy();

    const sections = within(listbox).getAllByRole("group");
    expect(sections).toHaveLength(3);

    const headings = listbox.querySelectorAll(".spectrum-Menu-sectionHeading");
    expect(headings).toHaveLength(3);
    expect(headings[0]?.textContent).toContain("Heading 1");
    expect(headings[1]?.textContent).toContain("Heading 2");
    expect(headings[2]?.textContent).toContain("Heading 3");

    const dividers = listbox.querySelectorAll(".spectrum-Menu-divider");
    expect(dividers).toHaveLength(2);

    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(7);

    options.forEach((option, index) => {
      expect(option.getAttribute("aria-posinset")).toBe(String(index + 1));
      expect(option.getAttribute("aria-setsize")).toBe("7");
      expect(option.getAttribute("aria-selected")).toBeNull();
    });
  });

  it("renders sections with falsy section keys", () => {
    const tree = render(ListBox, {
      props: {
        items: itemsWithFalsySectionId,
        "aria-label": "listbox-falsy-id",
      },
    });

    const listbox = tree.getByRole("listbox", { name: "listbox-falsy-id" });
    const sections = within(listbox).getAllByRole("group");
    expect(sections).toHaveLength(2);

    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(4);

    expect(findOptionByText(listbox, "Foo")).toBeTruthy();
    expect(findOptionByText(listbox, "Bar")).toBeTruthy();
    expect(findOptionByText(listbox, "Blah")).toBeTruthy();
    expect(findOptionByText(listbox, "Bleh")).toBeTruthy();
  });

  it("allows moving focus with arrow keys", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      autoFocus: "first",
    });
    await Promise.resolve();
    await Promise.resolve();

    const listbox = tree.getByRole("listbox", { name: "listbox-test" });
    const options = within(listbox).getAllByRole("option");

    (options[0] as HTMLElement).focus();
    fireEvent.focus(options[0] as HTMLElement);
    expect(document.activeElement).toBe(options[0]);

    await user.keyboard("{ArrowDown}");
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(options[1]);

    await user.keyboard("{ArrowUp}");
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(options[0]);
  });

  it("wraps focus with shouldFocusWrap", async () => {
    const tree = renderComponent({
      autoFocus: "first",
      shouldFocusWrap: true,
    });
    await Promise.resolve();
    await Promise.resolve();

    const listbox = tree.getByRole("listbox", { name: "listbox-test" });
    const options = within(listbox).getAllByRole("option");

    (options[0] as HTMLElement).focus();
    fireEvent.focus(options[0] as HTMLElement);
    expect(document.activeElement).toBe(options[0]);

    fireEvent.keyDown(options[0] as HTMLElement, { key: "ArrowUp" });
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(options[6]);

    fireEvent.keyDown(options[6] as HTMLElement, { key: "ArrowDown" });
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(options[0]);
  });

  it("supports single selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "single",
      defaultSelectedKeys: ["blah"],
      autoFocus: "first",
      onSelectionChange,
    });

    const listbox = tree.getByRole("listbox", { name: "listbox-test" });
    const selected = findOptionByText(listbox, "Blah");
    expect(selected.getAttribute("aria-selected")).toBe("true");

    const nextSelected = findOptionByText(listbox, "Bleh");
    await user.click(nextSelected);

    expect(nextSelected.getAttribute("aria-selected")).toBe("true");
    expect(selected.getAttribute("aria-selected")).toBe("false");

    const checkmarks = tree.getAllByRole("img", { hidden: true });
    expect(checkmarks).toHaveLength(1);

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const keys = onSelectionChange.mock.calls[0]?.[0] as Set<string>;
    expect(keys.has("bleh")).toBe(true);
  });

  it("supports controlled single selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "single",
      selectedKeys: ["blah"],
      autoFocus: "first",
      onSelectionChange,
    });

    const listbox = tree.getByRole("listbox", { name: "listbox-test" });
    const selected = findOptionByText(listbox, "Blah");
    const nextSelected = findOptionByText(listbox, "Bleh");

    await user.click(nextSelected);

    expect(selected.getAttribute("aria-selected")).toBe("true");
    expect(nextSelected.getAttribute("aria-selected")).toBe("false");

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const keys = onSelectionChange.mock.calls[0]?.[0] as Set<string>;
    expect(keys.has("bleh")).toBe(true);
  });

  it("supports disabled keys and keyboard skip", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "single",
      disabledKeys: ["baz"],
      autoFocus: "first",
      onSelectionChange,
    });
    await Promise.resolve();

    const listbox = tree.getByRole("listbox", { name: "listbox-test" });

    const disabledOption = findOptionByText(listbox, "Baz");
    await user.click(disabledOption);

    expect(disabledOption.getAttribute("aria-disabled")).toBe("true");
    expect(disabledOption.getAttribute("aria-selected")).toBe("false");
    expect(onSelectionChange).toHaveBeenCalledTimes(0);

    const firstOption = findOptionByText(listbox, "Foo");
    const options = within(listbox).getAllByRole("option");
    (firstOption as HTMLElement).focus();
    fireEvent.focus(firstOption as HTMLElement);
    expect(document.activeElement).toBe(firstOption);

    fireEvent.keyDown(firstOption as HTMLElement, { key: "ArrowDown" });
    await Promise.resolve();
    expect(document.activeElement).toBe(options[1]);

    fireEvent.keyDown(options[1] as HTMLElement, { key: "ArrowDown" });
    await Promise.resolve();
    expect(document.activeElement).toBe(options[3]);

    fireEvent.keyDown(options[3] as HTMLElement, { key: "ArrowUp" });
    await Promise.resolve();
    expect(document.activeElement).toBe(options[1]);
  });

  it("supports multiple selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "multiple",
      onSelectionChange,
    });

    const listbox = tree.getByRole("listbox", { name: "listbox-test" });
    expect(listbox.getAttribute("aria-multiselectable")).toBe("true");

    const first = findOptionByText(listbox, "Blah");
    const second = findOptionByText(listbox, "Bar");

    await user.click(first);
    await user.click(second);

    expect(first.getAttribute("aria-selected")).toBe("true");
    expect(second.getAttribute("aria-selected")).toBe("true");

    const checkmarks = tree.getAllByRole("img", { hidden: true });
    expect(checkmarks).toHaveLength(2);

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    const keys = onSelectionChange.mock.calls[1]?.[0] as Set<string>;
    expect(keys.has("blah")).toBe(true);
    expect(keys.has("bar")).toBe(true);
  });

  it("supports static slot syntax with ListBoxOption and ListBoxSection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const onAction = vi.fn();

    const App = defineComponent({
      name: "ListBoxSlotHarness",
      setup() {
        return () =>
          h(
            ListBox,
            {
              "aria-label": "listbox-slot",
              selectionMode: "single",
              onSelectionChange,
              onAction,
            },
            {
              default: () => [
                h(ListBoxOption, { id: "alpha" }, () => "Alpha"),
                h(
                  ListBoxSection,
                  { id: "group-1", heading: "Group 1" },
                  {
                    default: () => [
                      h(ListBoxOption, { id: "beta", isDisabled: true }, () => "Beta"),
                      h(ListBoxOption, { id: "gamma" }, () => "Gamma"),
                    ],
                  }
                ),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const listbox = tree.getByRole("listbox", { name: "listbox-slot" });
    const options = within(listbox).getAllByRole("option");
    const groups = within(listbox).getAllByRole("group");

    expect(options).toHaveLength(3);
    expect(groups).toHaveLength(1);
    expect(findOptionByText(listbox, "Beta").getAttribute("aria-disabled")).toBe("true");

    await user.click(findOptionByText(listbox, "Alpha"));
    expect(onAction).toHaveBeenCalledWith("alpha");
    expect(Array.from(onSelectionChange.mock.calls[0][0] as Set<string>)).toEqual(["alpha"]);
  });
});
