import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  provideSpectrumProvider,
} from "@vue-spectrum/provider";
import {
  Item,
  Section,
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

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead.";

function renderComponent(props: Record<string, unknown> = {}) {
  return render(SearchAutocomplete, {
    props: {
      label: "Test",
      defaultItems: items,
      ...props,
    },
  });
}

function renderWithProvider(
  component: ReturnType<typeof defineComponent>,
  options: { locale?: string } = {}
) {
  const ProviderHarness = defineComponent({
    name: "SearchAutocompleteProviderHarness",
    setup() {
      provideSpectrumProvider({
        theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
        colorScheme: "light",
        scale: "medium",
        locale: options.locale,
      });

      return () => h(component);
    },
  });

  return render(ProviderHarness);
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

  it("renders with placeholder text and shows warning", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const tree = renderComponent({ placeholder: "Test placeholder" });
      const searchAutocomplete = tree.getByRole("combobox") as HTMLInputElement;

      expect(searchAutocomplete.placeholder).toBe("Test placeholder");
      expect(spyWarn).toHaveBeenCalledWith(PLACEHOLDER_DEPRECATION_WARNING);
    } finally {
      spyWarn.mockRestore();
    }
  });

  it("propagates the name attribute", () => {
    const tree = renderComponent({ name: "test-name" });

    const searchAutocomplete = tree.getByRole("combobox");
    expect(searchAutocomplete.getAttribute("name")).toBe("test-name");
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

  it("supports custom data attributes", () => {
    const tree = renderComponent({
      "data-testid": "autocomplete-root",
    });

    expect(tree.getByTestId("autocomplete-root")).toBeTruthy();
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

  it("updates controlled items with a custom onInputChange filter", async () => {
    const user = userEvent.setup();
    const sourceItems: SpectrumSearchAutocompleteItemData[] = [
      { key: "1", label: "The first item" },
      { key: "2", label: "The second item" },
      { key: "3", label: "The third item" },
    ];

    const App = defineComponent({
      name: "SearchAutocompleteCustomFilterApp",
      setup() {
        const list = ref<SpectrumSearchAutocompleteItemData[]>(sourceItems);

        return () =>
          h(SearchAutocomplete, {
            label: "SearchAutocomplete",
            items: list.value,
            onInputChange: (value: string) => {
              list.value = sourceItems.filter((item) => item.label.includes(value));
            },
          });
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox");

    input.focus();
    await user.keyboard("second");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]?.textContent).toContain("The second item");
  });

  it("updates the visible option list when controlled items change", async () => {
    const initialItems: SpectrumSearchAutocompleteItemData[] = [
      { key: "1", label: "Aardvark" },
      { key: "2", label: "Kangaroo" },
      { key: "3", label: "Snake" },
    ];
    const nextItems: SpectrumSearchAutocompleteItemData[] = [
      { key: "1", label: "New Text" },
      { key: "2", label: "Item 2" },
      { key: "3", label: "Item 3" },
    ];
    let setItems:
      | ((nextItems: SpectrumSearchAutocompleteItemData[]) => void)
      | undefined;

    const App = defineComponent({
      name: "SearchAutocompleteControlledItemsUpdateApp",
      setup() {
        const list = ref<SpectrumSearchAutocompleteItemData[]>(initialItems);
        setItems = (nextItems: SpectrumSearchAutocompleteItemData[]) => {
          list.value = nextItems;
        };
        return () =>
          h(SearchAutocomplete, {
            label: "SearchAutocomplete",
            items: list.value,
            menuTrigger: "focus",
          });
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox");
    input.focus();
    await Promise.resolve();

    let listbox = tree.getByRole("listbox");
    let options = within(listbox).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Aardvark",
      "Kangaroo",
      "Snake",
    ]);

    setItems?.(nextItems);
    await Promise.resolve();

    listbox = tree.getByRole("listbox");
    options = within(listbox).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "New Text",
      "Item 2",
      "Item 3",
    ]);
  });

  it("updates mapped slot items and selected input text when list items change", async () => {
    const user = userEvent.setup();
    const initialItems: SpectrumSearchAutocompleteItemData[] = [
      { key: "1", label: "Aardvark" },
      { key: "2", label: "Kangaroo" },
      { key: "3", label: "Snake" },
    ];
    const nextItems: SpectrumSearchAutocompleteItemData[] = [
      { key: "1", label: "New Text" },
      { key: "2", label: "Item 2" },
      { key: "3", label: "Item 3" },
    ];
    let setItems:
      | ((nextItems: SpectrumSearchAutocompleteItemData[]) => void)
      | undefined;

    const App = defineComponent({
      name: "SearchAutocompleteMappedItemsUpdateApp",
      setup() {
        const list = ref<SpectrumSearchAutocompleteItemData[]>(initialItems);
        setItems = (updatedItems: SpectrumSearchAutocompleteItemData[]) => {
          list.value = updatedItems;
        };

        return () =>
          h(
            SearchAutocomplete,
            {
              label: "SearchAutocomplete",
              menuTrigger: "focus",
            },
            {
              default: () =>
                list.value.map((item) =>
                  h(
                    SearchAutocompleteItem,
                    {
                      key: item.key,
                    },
                    () => item.label
                  )
                ),
            }
          );
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;
    input.focus();
    await user.keyboard("a");

    let listbox = tree.getByRole("listbox");
    let options = within(listbox).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Aardvark",
      "Kangaroo",
      "Snake",
    ]);

    await user.click(options[0]!);
    expect(input.value).toBe("Aardvark");

    input.blur();
    await Promise.resolve();

    setItems?.(nextItems);
    await Promise.resolve();

    expect(input.value).toBe("New Text");

    input.focus();
    await user.clear(input);

    listbox = tree.getByRole("listbox");
    options = within(listbox).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "New Text",
      "Item 2",
      "Item 3",
    ]);
  });

  it("does not overwrite typed input when items update while focused", async () => {
    const user = userEvent.setup();
    const initialItems: SpectrumSearchAutocompleteItemData[] = [
      { key: "1", label: "Aardvark" },
      { key: "2", label: "Kangaroo" },
      { key: "3", label: "Snake" },
    ];
    const nextItems: SpectrumSearchAutocompleteItemData[] = [
      { key: "1", label: "New Text" },
      { key: "2", label: "Item 2" },
      { key: "3", label: "Item 3" },
    ];
    let setItems:
      | ((nextItems: SpectrumSearchAutocompleteItemData[]) => void)
      | undefined;

    const App = defineComponent({
      name: "SearchAutocompleteFocusedItemsUpdateApp",
      setup() {
        const list = ref<SpectrumSearchAutocompleteItemData[]>(initialItems);
        setItems = (updatedItems: SpectrumSearchAutocompleteItemData[]) => {
          list.value = updatedItems;
        };

        return () =>
          h(SearchAutocomplete, {
            label: "SearchAutocomplete",
            items: list.value,
            defaultSelectedKey: "1",
            menuTrigger: "focus",
          });
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Aardvark");

    input.focus();
    await user.clear(input);
    await user.keyboard("Aa");
    expect(input.value).toBe("Aa");

    setItems?.(nextItems);
    await Promise.resolve();

    expect(input.value).toBe("Aa");
  });

  it("updates input value and selection freely in uncontrolled mode", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const tree = renderComponent({
      onInputChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("");

    input.focus();
    await user.keyboard("T");

    let listbox = tree.getByRole("listbox");
    let options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(2);

    await user.keyboard("wo");
    expect(input.value).toBe("Two");
    expect(onInputChange).toHaveBeenLastCalledWith("Two");

    await user.clear(input);
    expect(input.value).toBe("");
    expect(onInputChange).toHaveBeenLastCalledWith("");

    listbox = tree.getByRole("listbox");
    options = within(listbox).getAllByRole("option");
    expect(options.find((option) => option.textContent === "Two")).toBeTruthy();
    expect(
      options.find((option) => option.textContent === "Two")?.getAttribute("aria-selected")
    ).not.toBe("true");

    await user.click(options[0]!);
    expect(input.value).toBe("One");
    expect(tree.queryByRole("listbox")).toBeNull();
    expect(onInputChange).toHaveBeenLastCalledWith("One");

    fireEvent.update(input, "o");
    await Promise.resolve();

    listbox = tree.getByRole("listbox");
    options = within(listbox).getAllByRole("option");
    const oneOption = options.find((option) => option.textContent === "One");
    expect(oneOption).toBeTruthy();
    expect(oneOption?.getAttribute("aria-selected")).toBe("true");

    await user.clear(input);
    expect(input.value).toBe("");
    expect(onInputChange).toHaveBeenLastCalledWith("");
  });

  it("does not set selected item from defaultInputValue", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      defaultInputValue: "Tw",
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Tw");

    input.focus();
    await user.keyboard("o");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]?.textContent).toContain("Two");
    expect(options[0]?.getAttribute("aria-selected")).toBe("false");
  });

  it("sets aria-invalid when validationState is invalid", () => {
    const tree = renderComponent({
      validationState: "invalid",
    });

    const input = tree.getByRole("combobox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid when isInvalid is true", () => {
    const tree = renderComponent({
      isInvalid: true,
    });

    const input = tree.getByRole("combobox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("applies invalid and valid state classes on the root", () => {
    const invalidTree = renderComponent({
      isInvalid: true,
    });
    const invalidRoot = invalidTree.container.querySelector(
      ".react-spectrum-SearchAutocomplete"
    );
    expect(invalidRoot?.classList.contains("is-invalid")).toBe(true);
    expect(invalidRoot?.classList.contains("is-valid")).toBe(false);

    const validTree = renderComponent({
      validationState: "valid",
    });
    const validRoot = validTree.container.querySelector(
      ".react-spectrum-SearchAutocomplete"
    );
    expect(validRoot?.classList.contains("is-valid")).toBe(true);
    expect(validRoot?.classList.contains("is-invalid")).toBe(false);
  });

  it("shows clear button when validationState is provided and input is empty", () => {
    const tree = renderComponent({
      validationState: "invalid",
    });

    expect(tree.getByLabelText("Clear search")).toBeTruthy();
  });

  it("opens on focus when menuTrigger is focus", async () => {
    const onOpenChange = vi.fn();
    const tree = renderComponent({
      menuTrigger: "focus",
      onOpenChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    input.focus();

    const listbox = await tree.findByRole("listbox");
    expect(listbox).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(true, "focus");
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
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

  it("reports manual trigger on keyboard open", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({
      onOpenChange,
    });
    const input = tree.getByRole("combobox");

    input.focus();
    await user.keyboard("{ArrowDown}");

    expect(onOpenChange).toHaveBeenCalledWith(true, "manual");
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

  it("updates the input field when controlled inputValue changes", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "SearchAutocompleteControlledInputValueApp",
      setup() {
        const inputValue = ref("One");
        return () =>
          h("div", [
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              inputValue: inputValue.value,
              onInputChange: (nextValue: string) => {
                inputValue.value = nextValue;
              },
            }),
            h(
              "button",
              {
                type: "button",
                "data-testid": "set-three",
                onClick: () => {
                  inputValue.value = "Three";
                },
              },
              "Set Three"
            ),
          ]);
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("One");

    await user.click(tree.getByTestId("set-three"));
    expect(input.value).toBe("Three");
  });

  it("updates the input field when controlled selectedKey changes", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "SearchAutocompleteControlledSelectedKeyApp",
      setup() {
        const selectedKey = ref<string | number | null>("1");
        return () =>
          h("div", [
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              selectedKey: selectedKey.value,
              onSelectionChange: (nextKey) => {
                selectedKey.value = nextKey;
              },
            }),
            h(
              "button",
              {
                type: "button",
                "data-testid": "set-three-key",
                onClick: () => {
                  selectedKey.value = "3";
                },
              },
              "Set Three Key"
            ),
          ]);
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("One");

    await user.click(tree.getByTestId("set-three-key"));
    expect(input.value).toBe("Three");
  });

  it("calls onBlur when the input loses focus", () => {
    const onBlur = vi.fn();
    const tree = renderComponent({
      onBlur,
    });
    const input = tree.getByRole("combobox");

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("closes and keeps custom input value on blur", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const tree = renderComponent({
      allowsCustomValue: true,
      onInputChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.keyboard("Thr");
    expect(tree.getByRole("listbox")).toBeTruthy();

    fireEvent.blur(input, { relatedTarget: document.body });
    await Promise.resolve();

    expect(onInputChange).toHaveBeenLastCalledWith("Thr");
    expect(input.value).toBe("Thr");
    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("retains selected key on blur when input value matches selected item", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectedKey: "2",
      onSelectionChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    fireEvent.blur(input, { relatedTarget: document.body });
    await Promise.resolve();

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(input.value).toBe("Two");
  });

  it("fires input interaction callbacks once per user action", async () => {
    const user = userEvent.setup();
    const onKeydown = vi.fn();
    const onFocus = vi.fn();
    const onInputChange = vi.fn();
    const onBlur = vi.fn();
    const App = defineComponent({
      name: "SearchAutocompleteSingleFireEventsApp",
      setup() {
        return () =>
          h("div", [
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              onKeydown,
              onFocus,
              onInputChange,
              onBlur,
            }),
            h("button", { type: "button" }, "Next"),
          ]);
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;

    input.focus();
    await user.keyboard("w");

    expect(onKeydown).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(0);

    const nextButton = tree.getByRole("button", { name: "Next" });
    fireEvent.keyDown(input, { key: "Tab" });
    (nextButton as HTMLElement).focus();
    fireEvent.keyUp(nextButton as HTMLElement, { key: "Tab" });
    await Promise.resolve();

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("keeps input focus while pressing an option with mouse down", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const onBlur = vi.fn();
    const tree = renderComponent({
      onInputChange,
      onSelectionChange,
      onOpenChange,
      onBlur,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(input);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "manual");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    await user.pointer({ target: options[0] as HTMLElement, keys: "[MouseLeft>]" });
    await Promise.resolve();

    expect(onInputChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "manual");
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(tree.getByRole("listbox")).toBeTruthy();

    await user.pointer({ target: options[0] as HTMLElement, keys: "[/MouseLeft]" });
    await Promise.resolve();

    expect(input.value).toBe("One");
    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(onInputChange).toHaveBeenCalledWith("One");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect(document.activeElement).toBe(input);
    expect(onBlur).not.toHaveBeenCalled();
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

  it("localizes clear button label with provider locale", () => {
    const App = defineComponent({
      name: "SearchAutocompleteLocalizedClearLabelHarness",
      setup() {
        return () =>
          h(SearchAutocomplete, {
            label: "Recherche",
            defaultItems: items,
            defaultInputValue: "Two",
          });
      },
    });

    const tree = renderWithProvider(App, { locale: "fr-FR" });
    expect(tree.getByLabelText("Effacer la recherche")).toBeTruthy();
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

  it("does not open when readonly and keeps existing value", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({
      isReadOnly: true,
      defaultInputValue: "Blargh",
      onOpenChange,
    });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("One");
    await user.keyboard("{ArrowDown}");

    expect(tree.queryByRole("listbox")).toBeNull();
    expect(input.value).toBe("Blargh");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("opens on ArrowUp and focuses the last item", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox");

    input.focus();
    await user.keyboard("{ArrowUp}");

    const listbox = await tree.findByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options).toHaveLength(3);
    expect(input.getAttribute("aria-activedescendant")).toBe(options[2]?.id);
  });

  it("does not open the menu if no items match", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox");

    await user.click(input);
    await user.keyboard("X");

    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("does not match any items when input is only whitespace", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox");

    await user.click(input);
    await user.keyboard(" ");

    expect(tree.queryByRole("listbox")).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes the menu when no items match after opening", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.keyboard("One");
    expect(tree.getByRole("listbox")).toBeTruthy();

    await user.keyboard("z");
    expect(tree.queryByRole("listbox")).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("does not open on input when menuTrigger is manual", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      menuTrigger: "manual",
    });
    const input = tree.getByRole("combobox");

    await user.click(input);
    await user.keyboard("T");

    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("keeps menu open when clearing input with menuTrigger input", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      menuTrigger: "input",
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.keyboard("Two");

    let listbox = await tree.findByRole("listbox");
    let options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);

    await user.clear(input);

    listbox = await tree.findByRole("listbox");
    options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
  });

  it("does not focus a disabled matching item on input", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      disabledKeys: ["2"],
    });
    const input = tree.getByRole("combobox");

    await user.click(input);
    await user.keyboard("Two");

    const listbox = await tree.findByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]?.textContent).toContain("Two");
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
  });

  it("closes menu when pressing Enter on an already selected item", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      defaultSelectedKey: "1",
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(tree.getByRole("listbox")).toBeTruthy();

    await user.keyboard("{Enter}");
    expect(tree.queryByRole("listbox")).toBeNull();
    expect(input.value).toBe("One");
  });

  it("clears aria-activedescendant on ArrowLeft and ArrowRight", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox");

    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).not.toBeNull();

    await user.keyboard("{ArrowRight}");
    expect(input.getAttribute("aria-activedescendant")).toBeNull();

    await user.keyboard("{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).not.toBeNull();

    await user.keyboard("{ArrowLeft}");
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
  });

  it("keeps menu open when clearing input with menuTrigger focus", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      menuTrigger: "focus",
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    input.focus();
    await user.keyboard("Two");

    let listbox = await tree.findByRole("listbox");
    let options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);

    await user.clear(input);

    listbox = await tree.findByRole("listbox");
    options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("supports form reset", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "SearchAutocompleteFormResetApp",
      setup() {
        return () =>
          h("form", {}, [
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              name: "test",
            }),
            h("input", {
              type: "reset",
              "data-testid": "reset",
            }),
          ]);
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.getAttribute("name")).toBe("test");

    await user.click(input);
    await user.keyboard("Tw");
    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    await user.click(options[0] as Element);
    expect(input.value).toBe("Two");

    await user.click(tree.getByTestId("reset"));
    expect(input.value).toBe("");
  });

  it("resets to defaultInputValue on form reset", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "SearchAutocompleteDefaultResetApp",
      setup() {
        return () =>
          h("form", {}, [
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              name: "test",
              defaultInputValue: "One",
            }),
            h("input", {
              type: "reset",
              "data-testid": "reset",
            }),
          ]);
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("One");

    await user.click(input);
    await user.clear(input);
    await user.type(input, "custom");
    expect(input.value).toBe("custom");

    await user.click(tree.getByTestId("reset"));
    expect(input.value).toBe("One");
  });

  it("renders loading indicators", () => {
    const tree = renderComponent({
      defaultOpen: true,
      loadingState: "loading",
      defaultItems: [],
    });

    const spinners = tree.getAllByRole("progressbar");
    expect(spinners.length).toBeGreaterThan(0);
    expect(spinners[0]?.getAttribute("aria-label")).toBe("Loading...");
  });

  it("delays input loading indicator and hides it for closed filtering state", async () => {
    vi.useFakeTimers();

    try {
      let setLoadingState: ((state: "loading" | "filtering" | "idle") => void) | undefined;
      let setMenuTrigger: ((trigger: "input" | "manual") => void) | undefined;

      const App = defineComponent({
        name: "SearchAutocompleteLoadingIndicatorStateApp",
        setup() {
          const loadingState = ref<"loading" | "filtering" | "idle">("loading");
          const menuTrigger = ref<"input" | "manual">("input");

          setLoadingState = (nextState: "loading" | "filtering" | "idle") => {
            loadingState.value = nextState;
          };
          setMenuTrigger = (nextTrigger: "input" | "manual") => {
            menuTrigger.value = nextTrigger;
          };

          return () =>
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              loadingState: loadingState.value,
              menuTrigger: menuTrigger.value,
            });
        },
      });

      const tree = render(App);

      expect(tree.queryByRole("progressbar")).toBeNull();
      vi.advanceTimersByTime(499);
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();

      vi.advanceTimersByTime(1);
      await Promise.resolve();
      expect(tree.getByRole("progressbar").getAttribute("aria-label")).toBe(
        "Loading..."
      );

      setLoadingState?.("filtering");
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();

      setMenuTrigger?.("manual");
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();

      vi.advanceTimersByTime(500);
      await Promise.resolve();
      expect(tree.getByRole("progressbar").getAttribute("aria-label")).toBe(
        "Loading..."
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("cancels pending loading indicator timer when loading ends early", async () => {
    vi.useFakeTimers();

    try {
      let setLoadingState: ((state: "loading" | "idle") => void) | undefined;

      const App = defineComponent({
        name: "SearchAutocompleteLoadingIndicatorCancelApp",
        setup() {
          const loadingState = ref<"loading" | "idle">("loading");
          setLoadingState = (nextState: "loading" | "idle") => {
            loadingState.value = nextState;
          };

          return () =>
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              loadingState: loadingState.value,
              menuTrigger: "manual",
            });
        },
      });

      const tree = render(App);
      expect(tree.queryByRole("progressbar")).toBeNull();

      vi.advanceTimersByTime(250);
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();

      setLoadingState?.("idle");
      await Promise.resolve();

      vi.advanceTimersByTime(300);
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("resets loading indicator delay when input text changes", async () => {
    vi.useFakeTimers();

    try {
      const tree = renderComponent({
        loadingState: "loading",
        menuTrigger: "manual",
      });
      const input = tree.getByRole("combobox") as HTMLInputElement;

      vi.advanceTimersByTime(250);
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();

      fireEvent.update(input, "O");
      await Promise.resolve();

      vi.advanceTimersByTime(250);
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();

      vi.advanceTimersByTime(250);
      await Promise.resolve();
      expect(tree.getByRole("progressbar").getAttribute("aria-label")).toBe(
        "Loading..."
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not reset loading indicator timer when loading changes to filtering", async () => {
    vi.useFakeTimers();

    try {
      let setLoadingState: ((state: "loading" | "filtering") => void) | undefined;

      const App = defineComponent({
        name: "SearchAutocompleteLoadingIndicatorNoResetApp",
        setup() {
          const loadingState = ref<"loading" | "filtering">("loading");
          setLoadingState = (nextState: "loading" | "filtering") => {
            loadingState.value = nextState;
          };

          return () =>
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              loadingState: loadingState.value,
              menuTrigger: "manual",
            });
        },
      });

      const tree = render(App);
      expect(tree.queryByRole("progressbar")).toBeNull();

      vi.advanceTimersByTime(250);
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();

      setLoadingState?.("filtering");
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();

      vi.advanceTimersByTime(250);
      await Promise.resolve();
      expect(tree.getByRole("progressbar").getAttribute("aria-label")).toBe(
        "Loading..."
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("hides loading indicator when loading state becomes idle", async () => {
    vi.useFakeTimers();

    try {
      let setLoadingState: ((state: "loading" | "idle") => void) | undefined;

      const App = defineComponent({
        name: "SearchAutocompleteLoadingIndicatorIdleApp",
        setup() {
          const loadingState = ref<"loading" | "idle">("loading");
          setLoadingState = (nextState: "loading" | "idle") => {
            loadingState.value = nextState;
          };

          return () =>
            h(SearchAutocomplete, {
              label: "Test",
              defaultItems: items,
              loadingState: loadingState.value,
              menuTrigger: "manual",
            });
        },
      });

      const tree = render(App);
      vi.advanceTimersByTime(500);
      await Promise.resolve();
      expect(tree.getByRole("progressbar").getAttribute("aria-label")).toBe(
        "Loading..."
      );

      setLoadingState?.("idle");
      await Promise.resolve();
      expect(tree.queryByRole("progressbar")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders loading-more spinner in the listbox with loading label", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      loadingState: "loadingMore",
    });
    const input = tree.getByRole("combobox");

    input.focus();
    await user.keyboard("o");

    const listbox = tree.getByRole("listbox");
    const spinner = within(listbox).getByRole("progressbar");
    expect(spinner.getAttribute("aria-label")).toBe("Loading more...");
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

  it("does not fire onLoadMore while loading list state is active", () => {
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
        loadingState: "loadingMore",
        onLoadMore,
      });

      const listbox = tree.getByRole("listbox");
      (listbox as HTMLElement).scrollTop = 2000;
      fireEvent.scroll(listbox);

      expect(onLoadMore).not.toHaveBeenCalled();
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("does not fire duplicate onLoadMore calls while remaining at the threshold", () => {
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
      fireEvent.scroll(listbox);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("fires onLoadMore again after scrolling away from and back to the threshold", () => {
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

      (listbox as HTMLElement).scrollTop = 0;
      fireEvent.scroll(listbox);
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      (listbox as HTMLElement).scrollTop = 2000;
      fireEvent.scroll(listbox);
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("fires onLoadMore on initial open when listbox is already at the end", async () => {
    const onLoadMore = vi.fn();
    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 300;
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

      tree.getByRole("listbox");
      await Promise.resolve();

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("does not fire onLoadMore on reopen when listbox is no longer at the end", async () => {
    const user = userEvent.setup();
    let listBoxScrollHeight = 100;
    const onLoadMore = vi.fn(() => {
      listBoxScrollHeight = 200;
    });
    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return listBoxScrollHeight;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 100;
        }
        return 0;
      });

    try {
      const tree = renderComponent({
        loadingState: "idle",
        onLoadMore,
      });
      const input = tree.getByRole("combobox") as HTMLInputElement;

      input.focus();
      await user.keyboard("{ArrowDown}");
      tree.getByRole("listbox");
      await Promise.resolve();
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      await fireEvent.blur(input);
      expect(tree.queryByRole("listbox")).toBeNull();

      input.focus();
      await user.keyboard("{ArrowDown}");
      tree.getByRole("listbox");
      await Promise.resolve();
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

  it("renders grouped section semantics from static slot sections", async () => {
    const user = userEvent.setup();

    const App = defineComponent({
      name: "SearchAutocompleteGroupedSectionsApp",
      setup() {
        return () =>
          h(SearchAutocomplete, { label: "Test" }, {
            default: () => [
              h(SearchAutocompleteSection, { id: "first", title: "Favorites" }, {
                default: () => [
                  h(SearchAutocompleteItem, { id: "fav-1" }, () => "One"),
                  h(SearchAutocompleteItem, { id: "fav-2" }, () => "Two"),
                ],
              }),
              h(SearchAutocompleteSection, { id: "second", title: "Others" }, {
                default: () => [
                  h(SearchAutocompleteItem, { id: "other-1" }, () => "Three"),
                ],
              }),
            ],
          });
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");

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
      name: "SearchAutocompleteFilteredSectionsApp",
      setup() {
        return () =>
          h(SearchAutocomplete, { label: "Test" }, {
            default: () => [
              h(SearchAutocompleteSection, { id: "first", title: "Favorites" }, {
                default: () => [
                  h(SearchAutocompleteItem, { id: "fav-1" }, () => "One"),
                  h(SearchAutocompleteItem, { id: "fav-2" }, () => "Two"),
                ],
              }),
              h(SearchAutocompleteSection, { id: "second", title: "Others" }, {
                default: () => [
                  h(SearchAutocompleteItem, { id: "other-1" }, () => "Three"),
                ],
              }),
            ],
          });
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.keyboard("thr");

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
      name: "SearchAutocompleteSectionAriaLabelApp",
      setup() {
        return () =>
          h(SearchAutocomplete, { label: "Test" }, {
            default: () => [
              h(
                SearchAutocompleteSection,
                { id: "untitled", "aria-label": "Ungrouped items" },
                {
                  default: () => [
                    h(SearchAutocompleteItem, { id: "one" }, () => "One"),
                  ],
                }
              ),
            ],
          });
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    const listbox = tree.getByRole("listbox");
    const group = within(listbox).getByRole("group");
    expect(group.getAttribute("aria-label")).toBe("Ungrouped items");
    expect(group.getAttribute("aria-labelledby")).toBeNull();
  });

  it("exports Item and Section aliases", () => {
    expect(Item).toBe(SearchAutocompleteItem);
    expect(Section).toBe(SearchAutocompleteSection);
  });

  it("exposes UNSAFE_getDOMNode and focus through component refs", async () => {
    const autocompleteRef = ref<{
      UNSAFE_getDOMNode?: () => HTMLElement | null;
      focus?: () => void;
    } | null>(null);

    const App = defineComponent({
      name: "SearchAutocompleteRefApp",
      setup() {
        return () =>
          h(SearchAutocomplete, {
            ref: autocompleteRef,
            label: "Test",
            defaultItems: items,
          });
      },
    });

    const tree = render(App);
    const root = tree.container.querySelector(".react-spectrum-SearchAutocomplete");
    expect(root).not.toBeNull();
    expect(autocompleteRef.value?.UNSAFE_getDOMNode?.()).toBe(root);

    autocompleteRef.value?.focus?.();
    expect(document.activeElement).toBe(tree.getByRole("combobox"));
  });
});
