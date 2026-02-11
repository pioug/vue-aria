import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  ComboBox,
  ComboBoxItem,
  ComboBoxSection,
  type SpectrumComboBoxItemData,
} from "../src";

const items: SpectrumComboBoxItemData[] = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/ComboBox.html#help-text";

function renderComponent(props: Record<string, unknown> = {}) {
  return render(ComboBox, {
    props: {
      label: "Test",
      items,
      ...props,
    },
  });
}

describe("ComboBox", () => {
  it("renders correctly", () => {
    const tree = renderComponent();
    expect(tree.getByRole("combobox")).toBeTruthy();
    expect(tree.getByRole("button")).toBeTruthy();
    expect(tree.getByText("Test")).toBeTruthy();
  });

  it("renders with placeholder text and shows warning", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const tree = renderComponent({ placeholder: "Test placeholder" });
      const combobox = tree.getByRole("combobox") as HTMLInputElement;

      expect(combobox.placeholder).toBe("Test placeholder");
      expect(spyWarn).toHaveBeenCalledWith(PLACEHOLDER_DEPRECATION_WARNING);
    } finally {
      spyWarn.mockRestore();
    }
  });

  it("propagates the name attribute", () => {
    const tree = renderComponent({ name: "test-name" });

    const combobox = tree.getByRole("combobox");
    expect(combobox.getAttribute("name")).toBe("test-name");
  });

  it("opens with button press and closes on second press", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();

    const button = tree.getByRole("button");
    await user.click(button);

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);

    await user.click(button);
    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("opens with ArrowDown and commits selection with Enter", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({ onSelectionChange });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    input.focus();
    await user.keyboard("{ArrowDown}");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(input.getAttribute("aria-expanded")).toBe("true");

    await user.keyboard("{Enter}");

    expect(input.value).toBe("One");
    expect(tree.queryByRole("listbox")).toBeNull();
    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect(options[0]?.id).toContain("option");
  });

  it("filters by input text", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "th");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]?.textContent).toContain("Three");
  });

  it("supports controlled selectedKey", () => {
    const tree = renderComponent({
      selectedKey: "2",
    });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Two");
  });

  it("does not open when disabled or readOnly", async () => {
    const user = userEvent.setup();

    const disabledTree = renderComponent({ isDisabled: true });
    await user.click(
      within(disabledTree.container as HTMLElement).getByRole("button") as HTMLElement
    );
    expect(disabledTree.queryByRole("listbox")).toBeNull();

    const readOnlyTree = renderComponent({ isReadOnly: true });
    await user.click(
      within(readOnlyTree.container as HTMLElement).getByRole("button") as HTMLElement
    );
    expect(readOnlyTree.queryByRole("listbox")).toBeNull();
  });

  it("renders loading state and fires onLoadMore", () => {
    const onLoadMore = vi.fn();
    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 1200;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 300;
        }
        return 0;
      });

    try {
      const tree = renderComponent({
        defaultOpen: true,
        loadingState: "idle",
        onLoadMore,
      });

      const listbox = tree.getByRole("listbox");
      (listbox as HTMLElement).scrollTop = 2000;
      fireEvent.scroll(listbox);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("renders loading indicator", () => {
    const tree = renderComponent({
      defaultOpen: true,
      loadingState: "loadingMore",
    });

    expect(tree.getByRole("progressbar")).toBeTruthy();
  });

  it("supports static slot syntax with ComboBoxItem and ComboBoxSection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const App = defineComponent({
      name: "ComboBoxSlotApp",
      setup() {
        return () =>
          h(
            ComboBox,
            {
              label: "Test",
              onSelectionChange,
            },
            {
              default: () => [
                h(ComboBoxSection, { id: "favorites", title: "Favorites" }, {
                  default: () => [
                    h(ComboBoxItem, { id: "fav-1" }, () => "One"),
                    h(ComboBoxItem, { id: "fav-2", isDisabled: true }, () => "Two"),
                  ],
                }),
                h(ComboBoxItem, { id: "other-1" }, () => "Three"),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const button = tree.getByRole("button");

    await user.click(button);
    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options).toHaveLength(3);
    expect(options[1]?.getAttribute("aria-disabled")).toBe("true");

    await user.click(options[2] as Element);
    expect(onSelectionChange).toHaveBeenCalledWith("other-1");
    expect((tree.getByRole("combobox") as HTMLInputElement).value).toBe("Three");
  });

  it("renders grouped section semantics from static slot sections", async () => {
    const user = userEvent.setup();

    const App = defineComponent({
      name: "ComboBoxGroupedSectionsApp",
      setup() {
        return () =>
          h(ComboBox, { label: "Test" }, {
            default: () => [
              h(ComboBoxSection, { id: "first", title: "Favorites" }, {
                default: () => [
                  h(ComboBoxItem, { id: "fav-1" }, () => "One"),
                  h(ComboBoxItem, { id: "fav-2" }, () => "Two"),
                ],
              }),
              h(ComboBoxSection, { id: "second", title: "Others" }, {
                default: () => [
                  h(ComboBoxItem, { id: "other-1" }, () => "Three"),
                ],
              }),
            ],
          });
      },
    });

    const tree = render(App);
    await user.click(tree.getByRole("button"));

    const listbox = tree.getByRole("listbox");
    const groups = within(listbox).getAllByRole("group");
    expect(groups).toHaveLength(2);
    expect(tree.getByText("Favorites")).toBeTruthy();
    expect(tree.getByText("Others")).toBeTruthy();
    expect(within(groups[0] as HTMLElement).getAllByRole("option")).toHaveLength(2);
    expect(within(groups[1] as HTMLElement).getAllByRole("option")).toHaveLength(1);
  });

  it("keeps section groups in sync with filtering results", async () => {
    const user = userEvent.setup();

    const App = defineComponent({
      name: "ComboBoxFilteredSectionsApp",
      setup() {
        return () =>
          h(ComboBox, { label: "Test" }, {
            default: () => [
              h(ComboBoxSection, { id: "first", title: "Favorites" }, {
                default: () => [
                  h(ComboBoxItem, { id: "fav-1" }, () => "One"),
                  h(ComboBoxItem, { id: "fav-2" }, () => "Two"),
                ],
              }),
              h(ComboBoxSection, { id: "second", title: "Others" }, {
                default: () => [
                  h(ComboBoxItem, { id: "other-1" }, () => "Three"),
                ],
              }),
            ],
          });
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "thr");

    const listbox = tree.getByRole("listbox");
    const groups = within(listbox).getAllByRole("group");
    const options = within(listbox).getAllByRole("option");
    expect(groups).toHaveLength(1);
    expect(options).toHaveLength(1);
    expect(tree.getByText("Others")).toBeTruthy();
    expect(tree.queryByText("Favorites")).toBeNull();
    expect(options[0]?.textContent).toContain("Three");
  });

  it("uses section aria-label when section title is omitted", async () => {
    const user = userEvent.setup();

    const App = defineComponent({
      name: "ComboBoxSectionAriaLabelApp",
      setup() {
        return () =>
          h(ComboBox, { label: "Test" }, {
            default: () => [
              h(ComboBoxSection, { id: "untitled", "aria-label": "Ungrouped items" }, {
                default: () => [
                  h(ComboBoxItem, { id: "one" }, () => "One"),
                ],
              }),
            ],
          });
      },
    });

    const tree = render(App);
    await user.click(tree.getByRole("button"));

    const listbox = tree.getByRole("listbox");
    const group = within(listbox).getByRole("group");
    expect(group.getAttribute("aria-label")).toBe("Ungrouped items");
    expect(group.getAttribute("aria-labelledby")).toBeNull();
  });
});
