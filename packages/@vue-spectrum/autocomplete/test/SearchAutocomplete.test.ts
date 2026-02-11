import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  SearchAutocomplete,
  SearchAutocompleteItem,
  SearchAutocompleteSection,
  type SpectrumSearchAutocompleteItemData,
} from "../src";

const items: SpectrumSearchAutocompleteItemData[] = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(SearchAutocomplete, {
    props: {
      label: "Test",
      defaultItems: items,
      ...props,
    },
  });
}

describe("SearchAutocomplete", () => {
  it("renders correctly", () => {
    const tree = renderComponent();
    const searchAutocomplete = tree.getByRole("combobox");

    expect(searchAutocomplete).toBeTruthy();
    expect(tree.getByText("Test")).toBeTruthy();
    expect(searchAutocomplete.getAttribute("autocorrect")).toBe("off");
    expect(searchAutocomplete.getAttribute("spellcheck")).toBe("false");
    expect(searchAutocomplete.getAttribute("autocomplete")).toBe("off");
  });

  it("supports custom icon", () => {
    const tree = renderComponent({
      icon: "icon",
    });

    expect(tree.container.textContent).toContain("icon");
  });

  it("supports no icon", () => {
    const tree = renderComponent({
      icon: "",
    });

    expect(tree.queryByTestId("searchicon")).toBeNull();
  });

  it("opens on typing and filters options", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox");

    await user.click(input);
    await user.keyboard("Tw");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options).toHaveLength(1);
    expect(options[0]?.textContent).toContain("Two");
  });

  it("opens on ArrowDown and commits selection with Enter", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const onSubmit = vi.fn();
    const tree = renderComponent({
      onSelectionChange,
      onSubmit,
    });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    input.focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(input.value).toBe("One");
    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect(onSubmit).toHaveBeenCalledWith("One", "1");
    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("submits free text on Enter when no item is focused", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const tree = renderComponent({
      onSubmit,
      defaultItems: [],
    });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("custom");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("custom", null);
  });

  it("clears input when clear button is pressed", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const tree = renderComponent({
      defaultInputValue: "Two",
      onClear,
    });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    const clearButton = tree.getByLabelText("Clear search");
    await user.click(clearButton);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      isDisabled: true,
    });

    const input = tree.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("renders loading indicators", () => {
    const tree = renderComponent({
      defaultOpen: true,
      loadingState: "loading",
      defaultItems: [],
    });

    expect(tree.getAllByRole("progressbar").length).toBeGreaterThan(0);
  });

  it("fires onLoadMore when listbox scrolls near the end", () => {
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

  it("supports static slot syntax with SearchAutocompleteItem and SearchAutocompleteSection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const App = defineComponent({
      name: "SearchAutocompleteSlotApp",
      setup() {
        return () =>
          h(
            SearchAutocomplete,
            {
              label: "Test",
              onSelectionChange,
            },
            {
              default: () => [
                h(SearchAutocompleteSection, { id: "favorites", title: "Favorites" }, {
                  default: () => [
                    h(SearchAutocompleteItem, { id: "fav-1" }, () => "One"),
                    h(SearchAutocompleteItem, { id: "fav-2", isDisabled: true }, () => "Two"),
                  ],
                }),
                h(SearchAutocompleteItem, { id: "other-1" }, () => "Three"),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox");

    await user.click(input);
    await user.keyboard("{ArrowDown}");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options).toHaveLength(3);
    expect(options[1]?.getAttribute("aria-disabled")).toBe("true");

    await user.click(options[2] as Element);
    expect(onSelectionChange).toHaveBeenCalledWith("other-1");
    expect((tree.getByRole("combobox") as HTMLInputElement).value).toBe("Three");
  });
});
