import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  ComboBox,
  ComboBoxItem,
  ComboBoxSection,
  Item,
  Section,
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

  it("supports custom data attributes", () => {
    const tree = renderComponent({
      "data-testid": "combobox-root",
    });

    expect(tree.getByTestId("combobox-root")).toBeTruthy();
  });

  it("supports formValue=\"key\" with hidden input value", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      name: "combo-name",
      form: "test-form",
      formValue: "key",
      defaultSelectedKey: "2",
    });

    const getHiddenInput = () =>
      tree.container.querySelector(
        "input[type=\"hidden\"][name=\"combo-name\"]"
      ) as HTMLInputElement | null;

    const combobox = tree.getByRole("combobox");
    expect(combobox.getAttribute("name")).toBeNull();
    expect(combobox.getAttribute("form")).toBe("test-form");
    expect(getHiddenInput()).not.toBeNull();
    expect(getHiddenInput()?.value).toBe("2");
    expect(getHiddenInput()?.getAttribute("form")).toBe("test-form");

    const [comboTrigger] = tree.getAllByRole("button");
    await user.click(comboTrigger as HTMLElement);
    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    await user.click(options[0] as Element);

    expect(getHiddenInput()?.value).toBe("1");
  });

  it("uses text form value when allowsCustomValue is true", () => {
    const tree = renderComponent({
      name: "combo-name",
      formValue: "key",
      allowsCustomValue: true,
    });

    const combobox = tree.getByRole("combobox");
    expect(combobox.getAttribute("name")).toBe("combo-name");
    expect(
      tree.container.querySelector("input[type=\"hidden\"][name=\"combo-name\"]")
    ).toBeNull();
  });

  it("supports form reset", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "ComboBoxFormResetApp",
      setup() {
        return () =>
          h("form", {}, [
            h(ComboBox, {
              label: "Test",
              items,
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
    const combobox = tree.getByRole("combobox") as HTMLInputElement;
    expect(combobox.getAttribute("name")).toBe("test");

    const [comboTrigger] = tree.getAllByRole("button");
    await user.click(comboTrigger as HTMLElement);
    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    await user.click(options[1] as Element);
    expect(combobox.value).toBe("Two");

    await user.click(tree.getByTestId("reset"));
    expect(combobox.value).toBe("");
  });

  it("resets to defaultSelectedKey on form reset", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "ComboBoxDefaultResetApp",
      setup() {
        return () =>
          h("form", {}, [
            h(ComboBox, {
              label: "Test",
              items,
              name: "test",
              defaultSelectedKey: "1",
            }),
            h("input", {
              type: "reset",
              "data-testid": "reset",
            }),
          ]);
      },
    });

    const tree = render(App);
    const combobox = tree.getByRole("combobox") as HTMLInputElement;
    expect(combobox.value).toBe("One");

    const [comboTrigger] = tree.getAllByRole("button");
    await user.click(comboTrigger as HTMLElement);
    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    await user.click(options[2] as Element);
    expect(combobox.value).toBe("Three");

    await user.click(tree.getByTestId("reset"));
    expect(combobox.value).toBe("One");
  });

  it("opens with button press and closes on second press", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();

    const input = tree.getByRole("combobox");
    const button = tree.getByRole("button");
    await user.click(button);

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("aria-activedescendant")).toBeNull();

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

  it("opens with ArrowUp and focuses the last item", async () => {
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

  it("opens on trigger click in focus mode and keeps focus in the input", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({
      menuTrigger: "focus",
      onOpenChange,
    });
    const input = tree.getByRole("combobox");
    const button = tree.getByRole("button");

    await user.click(button);

    const listbox = await tree.findByRole("listbox");
    expect(listbox).toBeTruthy();
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(true, "focus");
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

  it("does not match any items when input is only whitespace", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox");

    await user.click(input);
    await user.type(input, " ");

    expect(tree.queryByRole("listbox")).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("does not open the menu if no items match", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox");

    await user.click(input);
    await user.type(input, "X");

    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("closes the menu when no items match after opening", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "One");
    expect(tree.getByRole("listbox")).toBeTruthy();

    await user.type(input, "z");
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
    await user.type(input, "O");

    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("clears unmatched input on blur when menuTrigger is manual", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      menuTrigger: "manual",
      onInputChange,
      onSelectionChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "No match");
    expect(tree.queryByRole("listbox")).toBeNull();
    expect(input.value).toBe("No match");

    fireEvent.blur(input, { relatedTarget: document.body });
    await Promise.resolve();

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onInputChange).toHaveBeenLastCalledWith("");
    expect(input.value).toBe("");
  });

  it("clears input on blur when value matches a disabled option", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      disabledKeys: ["3"],
      onInputChange,
      onSelectionChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "Three");
    expect(input.value).toBe("Three");

    fireEvent.blur(input, { relatedTarget: document.body });
    await Promise.resolve();

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onInputChange).toHaveBeenLastCalledWith("");
    expect(input.value).toBe("");
  });

  it("keeps menu open when clearing input with menuTrigger input", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      menuTrigger: "input",
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "Two");

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
    await user.type(input, "Two");

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
    const input = tree.getByRole("combobox");

    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(tree.getByRole("listbox")).toBeTruthy();

    await user.keyboard("{Enter}");
    expect(tree.queryByRole("listbox")).toBeNull();
    expect((input as HTMLInputElement).value).toBe("One");
  });

  it("closes menu on page scroll", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const triggerButton = tree.getByRole("button");

    await user.click(triggerButton);
    expect(tree.getByRole("listbox")).toBeTruthy();

    fireEvent.scroll(document.body);
    await Promise.resolve();

    expect(tree.queryByRole("listbox")).toBeNull();
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

  it("supports controlled selectedKey", () => {
    const tree = renderComponent({
      selectedKey: "2",
    });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Two");
  });

  it("updates the input field when controlled selectedKey changes", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "ComboBoxControlledSelectedKeyApp",
      setup() {
        const selectedKey = ref<string | number | null>("1");
        return () =>
          h("div", [
            h(ComboBox, {
              label: "Test",
              items,
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

  it("does not fire selection change when inputValue and selectedKey are both controlled", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const App = defineComponent({
      name: "ComboBoxControlledInputAndSelectionApp",
      setup() {
        const selectedKey = ref<string | number | null>("2");
        const inputValue = ref("Two");

        return () =>
          h(ComboBox, {
            label: "Test",
            items,
            selectedKey: selectedKey.value,
            inputValue: inputValue.value,
            onSelectionChange: (nextKey) => {
              onSelectionChange(nextKey);
              selectedKey.value = nextKey;
            },
            onInputChange: (nextInputValue: string) => {
              onInputChange(nextInputValue);
              inputValue.value = nextInputValue;
              if (nextInputValue === "") {
                selectedKey.value = null;
              }
            },
          });
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.clear(input);
    await Promise.resolve();

    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(onInputChange).toHaveBeenCalledWith("");
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(input.value).toBe("");
  });

  it("clears the uncontrolled selection when the input is fully cleared", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      onSelectionChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;
    const triggerButton = tree.getByRole("button");

    input.focus();
    await user.keyboard("o");
    await user.keyboard("{ArrowDown}");

    let listbox = tree.getByRole("listbox");
    let options = within(listbox).getAllByRole("option");
    expect(input.getAttribute("aria-activedescendant")).toBe(options[0]?.id);

    await user.keyboard("{Enter}");
    await user.click(triggerButton);

    listbox = tree.getByRole("listbox");
    options = within(listbox).getAllByRole("option");
    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect(options[0]?.textContent).toContain("One");
    expect(options[0]?.getAttribute("aria-selected")).toBe("true");

    await user.clear(input);
    await Promise.resolve();

    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    listbox = tree.getByRole("listbox");
    options = within(listbox).getAllByRole("option");
    expect(options[0]?.textContent).toContain("One");
    expect(options[0]?.getAttribute("aria-selected")).not.toBe("true");
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

  it("closes and resets to selected value on blur", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      defaultSelectedKey: "2",
      onInputChange,
      onSelectionChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await fireEvent.update(input, "On");

    fireEvent.blur(input, { relatedTarget: document.body });
    await Promise.resolve();

    expect(onInputChange).toHaveBeenLastCalledWith("Two");
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(input.value).toBe("Two");
    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("commits custom value on blur with allowsCustomValue and controlled selectedKey", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      allowsCustomValue: true,
      selectedKey: "2",
      onSelectionChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.clear(input);
    await user.type(input, "On");

    fireEvent.blur(input, { relatedTarget: document.body });
    await Promise.resolve();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith(null);
    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("retains selected key on blur when input value matches selected item", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      allowsCustomValue: true,
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

  it("retains selected key on Tab when input value is unchanged", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const App = defineComponent({
      name: "ComboBoxRetainSelectedKeyTabApp",
      setup() {
        return () =>
          h("div", [
            h(ComboBox, {
              label: "Test",
              items,
              allowsCustomValue: true,
              selectedKey: "2",
              onSelectionChange,
            }),
            h("button", { type: "button" }, "Next"),
          ]);
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;
    const nextButton = tree.getByRole("button", { name: "Next" });

    await user.click(input);

    fireEvent.keyDown(input, { key: "Tab" });
    (nextButton as HTMLElement).focus();
    fireEvent.keyUp(nextButton as HTMLElement, { key: "Tab" });
    await Promise.resolve();

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(input.value).toBe("Two");
  });

  it("retains selected key on Enter when input value is unchanged", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      allowsCustomValue: true,
      selectedKey: "2",
      onSelectionChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.keyboard("{Enter}");

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(input.value).toBe("Two");
  });

  it("does not select the focused item on blur", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      onInputChange,
      onSelectionChange,
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;
    const button = tree.getByRole("button");

    await user.click(button);
    await user.keyboard("{ArrowDown}");
    expect(tree.getByRole("listbox")).toBeTruthy();

    fireEvent.blur(input, { relatedTarget: document.body });
    await Promise.resolve();

    expect(tree.queryByRole("listbox")).toBeNull();
    expect(onInputChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(input.value).toBe("");
  });

  it("commits focused item on Tab and Shift+Tab while moving focus out", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const App = defineComponent({
      name: "ComboBoxTabCommitApp",
      setup() {
        return () =>
          h("div", [
            h(
              "button",
              { type: "button", "data-testid": "before-button" },
              "Before"
            ),
            h(ComboBox, {
              label: "Test",
              items,
              onInputChange,
              onSelectionChange,
            }),
            h(
              "button",
              { type: "button", "data-testid": "after-button" },
              "After"
            ),
          ]);
      },
    });

    const tree = render(App);
    const input = tree.getByRole("combobox") as HTMLInputElement;
    const triggerButton = tree.getAllByRole("button")[1] as HTMLElement;
    const beforeButton = tree.getByTestId("before-button");
    const afterButton = tree.getByTestId("after-button");

    input.focus();
    await user.click(triggerButton);
    await user.keyboard("{ArrowDown}");
    expect(tree.getByRole("listbox")).toBeTruthy();

    fireEvent.keyDown(input, { key: "Tab" });
    (afterButton as HTMLElement).focus();
    fireEvent.keyUp(afterButton as HTMLElement, { key: "Tab" });
    await Promise.resolve();

    expect(tree.queryByRole("listbox")).toBeNull();
    expect(onSelectionChange).toHaveBeenLastCalledWith("1");
    expect(onInputChange).toHaveBeenLastCalledWith("One");
    expect(input.value).toBe("One");
    expect(document.activeElement).toBe(afterButton);

    input.focus();
    await user.click(triggerButton);
    await user.keyboard("{ArrowDown}");
    expect(tree.getByRole("listbox")).toBeTruthy();

    fireEvent.keyDown(input, { key: "Tab", shiftKey: true });
    (beforeButton as HTMLElement).focus();
    fireEvent.keyUp(beforeButton as HTMLElement, { key: "Tab", shiftKey: true });
    await Promise.resolve();

    expect(tree.queryByRole("listbox")).toBeNull();
    expect(onSelectionChange).toHaveBeenLastCalledWith("1");
    expect(onInputChange).toHaveBeenLastCalledWith("One");
    expect(input.value).toBe("One");
    expect(document.activeElement).toBe(beforeButton);
  });

  it("keeps input focus while pressing a menu option with mouse down", async () => {
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
    const triggerButton = tree.getByRole("button");

    input.focus();
    await user.click(triggerButton);
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

  it("updates the input field when controlled inputValue changes", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "ComboBoxControlledInputValueApp",
      setup() {
        const inputValue = ref("One");
        return () =>
          h("div", [
            h(ComboBox, {
              label: "Test",
              items,
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

  it("does not open on keyboard when readonly and keeps value", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      isReadOnly: true,
      defaultSelectedKey: "2",
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "One");
    await user.keyboard("{ArrowDown}");

    expect(tree.queryByRole("listbox")).toBeNull();
    expect(input.value).toBe("Two");
  });

  it("keeps menu open when clearing input with menuTrigger focus", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      menuTrigger: "focus",
    });
    const input = tree.getByRole("combobox") as HTMLInputElement;

    input.focus();
    await user.type(input, "Two");

    let listbox = await tree.findByRole("listbox");
    let options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);

    await user.clear(input);

    listbox = await tree.findByRole("listbox");
    options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(input.getAttribute("aria-expanded")).toBe("true");
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

  it("exports Item and Section aliases", () => {
    expect(Item).toBe(ComboBoxItem);
    expect(Section).toBe(ComboBoxSection);
  });

  it("exposes UNSAFE_getDOMNode and focus through component refs", () => {
    const comboBoxRef = ref<{
      UNSAFE_getDOMNode?: () => HTMLElement | null;
      focus?: () => void;
    } | null>(null);

    const App = defineComponent({
      name: "ComboBoxRefApp",
      setup() {
        return () =>
          h(ComboBox, {
            ref: comboBoxRef,
            label: "Test",
            items,
          });
      },
    });

    const tree = render(App);
    const combobox = tree.getByRole("combobox");
    const root = combobox.closest(".react-spectrum-ComboBox");

    expect(root).not.toBeNull();
    expect(comboBoxRef.value?.UNSAFE_getDOMNode?.()).toBe(root);

    comboBoxRef.value?.focus?.();
    expect(document.activeElement).toBe(combobox);
  });
});
