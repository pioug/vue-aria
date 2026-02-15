import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, provide, ref } from "vue";
import { FormValidationContext } from "@vue-aria/form-state";
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
import { ComboBox } from "../src/ComboBox";
import { Item } from "../src/Item";
import { Section } from "../src/Section";

const items = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

function renderComboBox(props: Record<string, unknown> = {}) {
  return mount(ComboBox as any, {
    props: {
      label: "Test",
      items,
      ...props,
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

let restoreScrollIntoView: (() => void) | null = null;

describe("ComboBox", () => {
  beforeAll(() => {
    const prototype = window.HTMLElement.prototype as HTMLElement & { scrollIntoView?: (arg?: unknown) => void };
    const original = prototype.scrollIntoView;

    Object.defineProperty(prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    restoreScrollIntoView = () => {
      if (original) {
        Object.defineProperty(prototype, "scrollIntoView", {
          configurable: true,
          writable: true,
          value: original,
        });
        return;
      }

      delete (prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView;
    };
  });

  afterAll(() => {
    restoreScrollIntoView?.();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders input, trigger button, and label", () => {
    const wrapper = renderComboBox();
    const input = wrapper.get('input[role="combobox"]');

    expect(input).toBeTruthy();
    expect(input.attributes("autocorrect")).toBe("off");
    expect(input.attributes("spellcheck")).toBe("false");
    expect(input.attributes("autocomplete")).toBe("off");
    expect(wrapper.get("button")).toBeTruthy();
    expect(wrapper.text()).toContain("Test");
  });

  it("renders placeholder text and logs the deprecation warning", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const wrapper = renderComboBox({
        placeholder: "Search options",
      });

      expect(wrapper.get('input[role="combobox"]').attributes("placeholder")).toBe("Search options");
      expect(warnSpy).toHaveBeenCalledWith(
        "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/ComboBox.html#help-text"
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("supports ariaLabel when no visible label is provided", () => {
    const wrapper = renderComboBox({
      label: undefined,
      ariaLabel: "Framework",
    });

    expect(wrapper.find("label").exists()).toBe(false);
    expect(wrapper.get('input[role="combobox"]').attributes("aria-label")).toBe("Framework");
  });

  it("opens with trigger click and selects an option", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      onSelectionChange,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const listbox = wrapper.get('[role="listbox"]');
    expect(listbox).toBeTruthy();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);

    await options[1]?.trigger("click");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Two");
  });

  it("supports controlled selectedKey updates", async () => {
    const wrapper = renderComboBox({
      selectedKey: "1",
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("One");

    await wrapper.setProps({
      selectedKey: "3",
    });
    await nextTick();
    await nextTick();

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Three");
  });

  it("keeps input text controlled when inputValue is provided", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      inputValue: "Two",
      defaultSelectedKey: "2",
      onInputChange,
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.setValue("");
    await nextTick();
    await nextTick();

    expect(onInputChange).toHaveBeenCalledWith("");
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect((input.element as HTMLInputElement).value).toBe("Two");
  });

  it("clears selection only after controlled inputValue is updated", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      inputValue: "Two",
      defaultSelectedKey: "2",
      onInputChange,
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Two");

    await input.setValue("");
    await nextTick();
    await nextTick();

    expect(onInputChange).toHaveBeenCalledWith("");
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect((input.element as HTMLInputElement).value).toBe("Two");

    await wrapper.setProps({
      inputValue: "",
    });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("");
    expect(onSelectionChange).toHaveBeenCalledWith(null);
    expect(wrapper.findAll('[role="option"]')[0]?.attributes("aria-selected")).toBe("false");
  });

  it("does not fire onSelectionChange when inputValue and selectedKey are controlled", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      inputValue: "Two",
      selectedKey: "2",
      onInputChange,
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.setValue("");
    await nextTick();
    await nextTick();

    expect(onInputChange).toHaveBeenCalledWith("");
    expect(onSelectionChange).not.toHaveBeenCalled();

    await wrapper.setProps({
      inputValue: "",
      selectedKey: null,
    });
    await nextTick();
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("emits null selection when controlled selectedKey input is cleared", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      selectedKey: "2",
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    await input.setValue("");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith(null);

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(options[1]?.attributes("aria-selected")).toBe("true");
  });

  it("does not update combobox state when inputValue and selectedKey are controlled", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      selectedKey: "2",
      inputValue: "T",
      onInputChange,
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("T");

    await input.setValue("Tw");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("T");
    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(onInputChange).toHaveBeenLastCalledWith("Tw");
    expect(onSelectionChange).not.toHaveBeenCalled();

    const threeOption = wrapper.findAll('[role="option"]').find((option) => option.text() === "Three");
    expect(threeOption).toBeDefined();
    await threeOption!.trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("T");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("3");
    expect(onInputChange).toHaveBeenCalledTimes(1);
  });

  it("closes after selection when selectedKey and inputValue are controlled", async () => {
    const wrapper = renderComboBox({
      selectedKey: "2",
      inputValue: "T",
    });
    const input = wrapper.get('input[role="combobox"]');

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    const threeOption = wrapper.findAll('[role="option"]').find((option) => option.text() === "Three");
    expect(threeOption).toBeDefined();
    await threeOption!.trigger("click");
    await nextTick();
    await nextTick();

    await wrapper.setProps({
      selectedKey: "3",
      inputValue: "Three",
    });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Three");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("calls onOpenChange when selecting an already-selected item in selectedKey-controlled mode", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderComboBox({
      selectedKey: "2",
      onOpenChange,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true, "manual");

    const selectedOption = wrapper
      .findAll('[role="option"]')
      .find((option) => option.attributes("aria-selected") === "true");
    expect(selectedOption).toBeDefined();
    await selectedOption!.trigger("click");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("closes the menu when clicking an already-selected option in uncontrolled mode", async () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
    });

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    const selectedOption = wrapper
      .findAll('[role="option"]')
      .find((option) => option.attributes("aria-selected") === "true");
    expect(selectedOption).toBeDefined();

    await selectedOption!.trigger("click");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("resets input text when reselecting the selected option with click", async () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("Tw");
    await nextTick();
    await nextTick();

    const selectedOption = wrapper
      .findAll('[role="option"]')
      .find((option) => option.attributes("aria-selected") === "true");
    expect(selectedOption).toBeDefined();

    await selectedOption!.trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Two");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("resets input text when reselecting the selected option with Enter", async () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("Tw");
    await nextTick();
    await nextTick();

    const selectedOption = wrapper
      .findAll('[role="option"]')
      .find((option) => option.attributes("aria-selected") === "true");
    expect(selectedOption).toBeDefined();

    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();
    expect(input.attributes("aria-activedescendant")).toBe(selectedOption?.attributes("id"));

    await input.trigger("keydown", { key: "Enter" });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Two");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("closes the menu when the page scrolls", async () => {
    const wrapper = renderComboBox();

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    document.body.dispatchEvent(new Event("scroll", { bubbles: true }));
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("updates when selectedKey and inputValue controlled props change together", async () => {
    const wrapper = renderComboBox({
      selectedKey: "2",
      inputValue: "Two",
    });
    const input = wrapper.get('input[role="combobox"]');

    expect((input.element as HTMLInputElement).value).toBe("Two");

    await wrapper.setProps({
      selectedKey: "1",
      inputValue: "One",
    });
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("One");

    await wrapper.setProps({
      selectedKey: null,
      inputValue: "",
    });
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("does not update controlled inputValue when only selectedKey changes", async () => {
    const wrapper = renderComboBox({
      selectedKey: "2",
      inputValue: "Two",
    });
    const input = wrapper.get('input[role="combobox"]');

    expect((input.element as HTMLInputElement).value).toBe("Two");

    await wrapper.setProps({
      selectedKey: "1",
      inputValue: "Two",
    });
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Two");

    await wrapper.setProps({
      selectedKey: null,
      inputValue: "Two",
    });
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Two");
  });

  it("updates the input field when inputValue prop changes", async () => {
    const wrapper = renderComboBox({
      inputValue: "T",
    });
    const input = wrapper.get('input[role="combobox"]');

    expect((input.element as HTMLInputElement).value).toBe("T");

    await wrapper.setProps({
      inputValue: "Tw",
    });
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Tw");
  });

  it("updates selectedKey but not inputValue when inputValue is controlled", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      defaultSelectedKey: "3",
      inputValue: "T",
      onInputChange,
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("T");

    await input.setValue("Tw");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("T");
    expect(onInputChange).toHaveBeenLastCalledWith("Tw");
    expect(onSelectionChange).not.toHaveBeenCalled();

    const twoOption = wrapper.findAll('[role="option"]').find((option) => option.text() === "Two");
    expect(twoOption).toBeDefined();
    await twoOption!.trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("T");
    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(onInputChange).toHaveBeenLastCalledWith("Two");
  });

  it("updates the input field when selectedKey prop changes", async () => {
    const onInputChange = vi.fn();
    const wrapper = renderComboBox({
      selectedKey: "2",
      onInputChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    expect((input.element as HTMLInputElement).value).toBe("Two");

    await wrapper.setProps({
      selectedKey: "1",
    });
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("One");
    expect(onInputChange).toHaveBeenLastCalledWith("One");

    await wrapper.setProps({
      selectedKey: null,
    });
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("");
    expect(onInputChange).toHaveBeenLastCalledWith("");
  });

  it("updates inputValue state but not selectedKey when selectedKey is controlled", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      selectedKey: "2",
      onInputChange,
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Two");

    await input.setValue("Th");
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Th");
    expect(onInputChange).toHaveBeenLastCalledWith("Th");
    expect(onSelectionChange).not.toHaveBeenCalled();

    const threeOption = wrapper.findAll('[role="option"]').find((option) => option.text() === "Three");
    expect(threeOption).toBeDefined();
    await threeOption!.trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Th");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("3");
  });

  it("sets aria-invalid semantics when validationState is invalid", () => {
    const wrapper = renderComboBox({
      validationState: "invalid",
    });

    expect(wrapper.get('input[role="combobox"]').attributes("aria-invalid")).toBe("true");
    expect(wrapper.classes()).toContain("is-invalid");
  });

  it("supports native required semantics with validationBehavior native", () => {
    const wrapper = renderComboBox({
      isRequired: true,
      validationBehavior: "native",
    });

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("required")).toBeDefined();
  });

  it("supports validate function in aria mode", () => {
    const wrapper = renderComboBox({
      defaultInputValue: "Foo",
      validate: ({ inputValue }: { inputValue: string; selectedKey: string | number | null }) =>
        inputValue === "Foo" ? "Invalid option" : null,
    });

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.get(".spectrum-HelpText.is-invalid").text()).toContain("Invalid option");
  });

  it("clears aria validate errors after selecting a valid option", async () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
      validate: ({ selectedKey }: { inputValue: string; selectedKey: string | number | null }) =>
        selectedKey === "2" ? "Invalid option" : null,
    });
    const input = wrapper.get('input[role="combobox"]');

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.get(".spectrum-HelpText.is-invalid").text()).toContain("Invalid option");

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[0]?.trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("One");
    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(wrapper.find(".spectrum-HelpText.is-invalid").exists()).toBe(false);
  });

  it("supports server validation in aria mode", () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      framework: "Invalid option.",
    });

    const wrapper = mount(
      defineComponent({
        setup() {
          provide(FormValidationContext, serverErrors);
          return () =>
            h(ComboBox as any, {
              label: "Test",
              name: "framework",
              items,
            });
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.get(".spectrum-HelpText.is-invalid").text()).toContain("Invalid option.");
  });

  it("clears server validation in aria mode after a valid blur commit", async () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      framework: "Invalid option.",
    });

    const wrapper = mount(
      defineComponent({
        setup() {
          provide(FormValidationContext, serverErrors);
          return () =>
            h(ComboBox as any, {
              label: "Test",
              name: "framework",
              items,
            });
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.get(".spectrum-HelpText.is-invalid").text()).toContain("Invalid option.");

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[0]?.trigger("click");
    await nextTick();
    await nextTick();

    await input.trigger("blur");
    await nextTick();
    await nextTick();

    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(wrapper.find(".spectrum-HelpText.is-invalid").exists()).toBe(false);
  });

  it("supports validate function in native mode", async () => {
    const wrapper = renderComboBox({
      validationBehavior: "native",
      validate: ({ selectedKey }: { inputValue: string; selectedKey: string | number | null }) =>
        selectedKey === "1" ? null : "Invalid option",
    });
    const input = wrapper.get('input[role="combobox"]');
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).validity.valid).toBe(false);
    expect((input.element as HTMLInputElement).validationMessage).toContain("Invalid option");

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[0]?.trigger("click");
    await nextTick();
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).validity.valid).toBe(true);
  });

  it("supports server validation in native mode", async () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      framework: "Invalid option.",
    });

    const wrapper = mount(
      defineComponent({
        setup() {
          provide(FormValidationContext, serverErrors);
          return () =>
            h(ComboBox as any, {
              label: "Test",
              name: "framework",
              items,
              validationBehavior: "native",
            });
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[role="combobox"]');
    await nextTick();
    expect((input.element as HTMLInputElement).validity.valid).toBe(false);
    expect((input.element as HTMLInputElement).validationMessage).toContain("Invalid option.");
  });

  it("supports custom native error messages", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { "data-test": "form" }, [
              h(ComboBox as any, {
                label: "Test",
                items,
                isRequired: true,
                validationBehavior: "native",
                errorMessage: (validation: { validationDetails: ValidityState | null }) =>
                  validation.validationDetails?.valueMissing ? "Please enter a value" : null,
              }),
            ]);
        },
      }),
      { attachTo: document.body }
    );

    const form = wrapper.get('[data-test="form"]').element as HTMLFormElement;
    const input = wrapper.get('input[role="combobox"]');
    await nextTick();

    expect(input.attributes("aria-describedby")).toBeUndefined();
    form.checkValidity();
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).validity.valid).toBe(false);
    expect((input.element as HTMLInputElement).validationMessage).toContain("Please enter a value");
  });

  it("supports matching defaultSelectedKey and defaultInputValue", () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
      defaultInputValue: "Two",
      formValue: "key",
      name: "selection",
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Two");
    expect((wrapper.get('input[type=\"hidden\"]').element as HTMLInputElement).value).toBe("2");
  });

  it("keeps defaultInputValue when it differs from defaultSelectedKey text", () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
      defaultInputValue: "Custom value",
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Custom value");
  });

  it("does not set selectedKey from defaultInputValue alone", () => {
    const wrapper = renderComboBox({
      defaultInputValue: "Two",
      formValue: "key",
      name: "selection",
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Two");
    expect((wrapper.get('input[type=\"hidden\"]').element as HTMLInputElement).value).toBe("");
  });

  it("sets the input value from defaultSelectedKey", () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Two");
  });

  it("keeps controlled selectedKey value on selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      selectedKey: "1",
      onSelectionChange,
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("One");

    await wrapper.get("button").trigger("click");
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[1]?.trigger("click");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("One");
  });

  it("updates uncontrolled defaultSelectedKey value on selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      defaultSelectedKey: "1",
      onSelectionChange,
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("One");

    await wrapper.get("button").trigger("click");
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[1]?.trigger("click");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Two");
  });

  it("updates input text and selected key freely in uncontrolled mode", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      onInputChange,
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    await input.setValue("Two");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Two");
    expect(onInputChange).toHaveBeenLastCalledWith("Two");
    expect(onSelectionChange).not.toHaveBeenCalled();

    await input.setValue("");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("");
    expect(onInputChange).toHaveBeenLastCalledWith("");
    expect(onSelectionChange).not.toHaveBeenCalled();

    const listbox = wrapper.get('[role="listbox"]');
    const options = listbox.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(options[1]?.text()).toBe("Two");
    expect(options[1]?.attributes("aria-selected")).toBe("false");

    await options[1]?.trigger("click");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(onInputChange).toHaveBeenLastCalledWith("Two");
    expect((input.element as HTMLInputElement).value).toBe("Two");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("clears selection when all input text is deleted in uncontrolled mode", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        onSelectionChange,
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("o");
    await nextTick();
    await nextTick();

    const initialOptions = wrapper.findAll('[role="option"]');
    expect(initialOptions.length).toBeGreaterThan(0);
    await initialOptions[0]!.trigger("click");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith("one");
    expect((input.element as HTMLInputElement).value).toBe("One");

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await input.setValue("");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("propagates name and form attributes to the input", () => {
    const wrapper = renderComboBox({
      name: "combobox-name",
      form: "combobox-form",
    });

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("name")).toBe("combobox-name");
    expect(input.attributes("form")).toBe("combobox-form");
  });

  it("supports formValue key with hidden-input submission", async () => {
    const wrapper = renderComboBox({
      name: "framework",
      form: "framework-form",
      formValue: "key",
      defaultSelectedKey: "2",
    });

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("name")).toBeUndefined();
    expect(input.attributes("form")).toBeUndefined();

    const hiddenInput = wrapper.get('input[type="hidden"][name="framework"]');
    expect(hiddenInput.attributes("form")).toBe("framework-form");
    expect((hiddenInput.element as HTMLInputElement).value).toBe("2");

    await wrapper.get("button").trigger("click");
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[2]?.trigger("click");
    await nextTick();
    await nextTick();

    expect((wrapper.get('input[type="hidden"][name="framework"]').element as HTMLInputElement).value).toBe("3");
    expect((input.element as HTMLInputElement).value).toBe("Three");
  });

  it("supports form reset", async () => {
    const wrapper = mount(defineComponent({
      setup() {
        return () =>
          h("form", [
            h(ComboBox as any, {
              label: "Test",
              name: "test",
              items,
            }),
            h("input", {
              type: "reset",
              "data-test": "reset",
            }),
          ]);
      },
    }), {
      attachTo: document.body,
    });

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("name")).toBe("test");

    await input.trigger("focus");
    await input.setValue("Tw");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    const targetOption = options.find((option) => option.text().includes("Two"));
    expect(targetOption).toBeTruthy();
    await targetOption?.trigger("click");
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Two");

    await wrapper.get('[data-test="reset"]').trigger("click");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("forces text form submission when allowsCustomValue is true", () => {
    const wrapper = renderComboBox({
      name: "framework",
      formValue: "key",
      allowsCustomValue: true,
    });

    expect(wrapper.get('input[role="combobox"]').attributes("name")).toBe("framework");
    expect(wrapper.find('input[type="hidden"][name="framework"]').exists()).toBe(false);
  });

  it("supports switching formValue between text and key", async () => {
    const wrapper = renderComboBox({
      name: "test",
      selectedKey: "2",
    });

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("name")).toBe("test");
    expect((input.element as HTMLInputElement).value).toBe("Two");
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false);

    await wrapper.setProps({
      formValue: "key",
    });
    await nextTick();
    await nextTick();

    expect(input.attributes("name")).toBeUndefined();
    const hiddenInput = wrapper.get('input[type="hidden"][name="test"]');
    expect((hiddenInput.element as HTMLInputElement).value).toBe("2");
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderComboBox({
      isOpen: true,
      onOpenChange,
    });

    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();

    await wrapper.get("button").trigger("click");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports default open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderComboBox({
      defaultOpen: true,
      onOpenChange,
    });

    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();

    await wrapper.get("button").trigger("click");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("focuses input when autoFocus is true", async () => {
    const wrapper = renderComboBox({
      autoFocus: true,
    });

    await nextTick();

    expect(document.activeElement).toBe(wrapper.get('input[role="combobox"]').element);
  });

  it("supports slot-defined items and sections", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Test",
      },
      slots: {
        default: () => [
          h(Section as any, { title: "Numbers" }, {
            default: () => [
              h(Item as any, { id: "one" }, { default: () => "One" }),
              h(Item as any, { id: "two" }, { default: () => "Two" }),
            ],
          }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
    expect(wrapper.text()).toContain("Numbers");
  });

  it("supports RouterProvider links on items", async () => {
    const navigate = vi.fn();
    const useHref = (href: string) => (href.startsWith("http") ? href : `/base${href}`);
    const restoreNavigation = preventLinkNavigation();

    try {
      const wrapper = mount(
        defineComponent({
          setup() {
            return () =>
              h(
                Provider as any,
                {
                  theme,
                  router: { navigate, useHref },
                },
                () =>
                  h(
                    ComboBox as any,
                    {
                      label: "Links",
                    },
                    {
                      default: () => [
                        h(Item as any, { id: "one", href: "/one", routerOptions: { foo: "bar" } }, { default: () => "One" }),
                        h(Item as any, { id: "two", href: "https://adobe.com" }, { default: () => "Two" }),
                      ],
                    }
                  )
              );
          },
        }),
        {
          attachTo: document.body,
        }
      );

      await wrapper.get("button").trigger("click");
      await nextTick();

      const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
      expect(options).toHaveLength(2);
      expect(options[0]?.tagName).toBe("A");
      expect(options[0]?.getAttribute("href")).toBe("/base/one");

      options[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await nextTick();
      expect(navigate).toHaveBeenCalledWith("/one", { foo: "bar" });

      navigate.mockReset();
      options[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await nextTick();
      expect(navigate).not.toHaveBeenCalled();
    } finally {
      restoreNavigation();
    }
  });

  it("shows all options on trigger-open when defaultInputValue is set", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        defaultInputValue: "Tw",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
  });

  it("shows all options on ArrowDown-open when defaultInputValue is set", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        defaultInputValue: "Tw",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
  });

  it("shows all options on ArrowUp-open when defaultInputValue is set", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        defaultInputValue: "Tw",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowUp" });
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
  });

  it("shows a filtered list when input value changes after opening", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        defaultInputValue: "Tw",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3);

    await input.setValue("o");
    await nextTick();
    await nextTick();

    expect(wrapper.findAll('[role="option"]')).toHaveLength(2);
  });

  it("keeps controlled filtered items when opened from the trigger", async () => {
    const sourceItems = [
      { key: "1", label: "One" },
      { key: "2", label: "Two" },
      { key: "3", label: "Three" },
    ];

    const wrapper = mount(
      defineComponent({
        setup() {
          const filteredItems = ref(
            sourceItems.filter((item) => item.label.includes("Tw"))
          );

          const onInputChange = (value: string) => {
            filteredItems.value = sourceItems.filter((item) =>
              item.label.includes(value)
            );
          };

          return () =>
            h(ComboBox as any, {
              label: "Filter",
              items: filteredItems.value,
              defaultInputValue: "Tw",
              onInputChange,
            });
        },
      }),
      {
        attachTo: document.body,
      }
    );

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0]?.text()).toContain("Two");
  });

  it("opens when typing by default", async () => {
    const wrapper = renderComboBox();
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("T");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
  });

  it("reports manual trigger on button-open via onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderComboBox({
      onOpenChange,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true, "manual");
  });

  it("calls onKeyDown for keyboard input events", async () => {
    const onKeyDown = vi.fn();
    const wrapper = renderComboBox({
      onKeyDown,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("keydown", { key: "ArrowDown" });

    expect(onKeyDown).toHaveBeenCalled();
  });

  it("reports input trigger on typing-open via onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderComboBox({
      onOpenChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("T");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true, "input");
  });

  it("closes the menu when no items match typed input", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("One");
    await nextTick();
    await nextTick();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    const initialOptions = wrapper.findAll('[role="option"]');
    expect(initialOptions).toHaveLength(1);

    await input.setValue("Onez");
    await nextTick();
    await nextTick();
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("does not open the menu when no items match typed input", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        onOpenChange,
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("X");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("does not match any items when input is only a space", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue(" ");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("keeps menu open and clears active option when input is cleared with menuTrigger focus", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        menuTrigger: "focus",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("o");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(input.attributes("aria-activedescendant")).toBeUndefined();

    await input.setValue("");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(options).toHaveLength(3);
    expect(input.attributes("aria-activedescendant")).toBeUndefined();
  });

  it("keeps menu open when input is cleared with default menuTrigger", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("o");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await input.setValue("");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
  });

  it("clears active option when input no longer exactly matches with allowsCustomValue", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        allowsCustomValue: true,
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("Two");
    await nextTick();
    await nextTick();

    let options = wrapper.findAll('[role="option"]');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(options).toHaveLength(1);
    expect(options[0]?.text()).toBe("Two");
    expect(input.attributes("aria-activedescendant")).toBeUndefined();

    await input.setValue("Tw");
    await nextTick();
    await nextTick();

    options = wrapper.findAll('[role="option"]');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(options).toHaveLength(1);
    expect(options[0]?.text()).toBe("Two");
    expect(input.attributes("aria-activedescendant")).toBeUndefined();
  });

  it("does not apply default filtering when controlled items are provided", async () => {
    const wrapper = renderComboBox();
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("One");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(options).toHaveLength(3);
  });

  it("updates controlled items with custom filtering on input change", async () => {
    const sourceItems = [
      { id: "1", name: "The first item" },
      { id: "2", name: "The second item" },
      { id: "3", name: "The third item" },
    ];

    const wrapper = mount(
      defineComponent({
        setup() {
          const filteredItems = ref(sourceItems);

          const onInputChange = (value: string) => {
            filteredItems.value = sourceItems.filter((item) =>
              item.name.includes(value)
            );
          };

          return () =>
            h(ComboBox as any, {
              label: "Combobox",
              items: filteredItems.value,
              onInputChange,
            });
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const input = wrapper.get('input[role="combobox"]');
    await input.trigger("focus");
    await input.setValue("second");
    await nextTick();
    await nextTick();

    const listbox = wrapper.get('[role="listbox"]');
    const options = listbox.findAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0]?.text()).toContain("The second item");
  });

  it("updates the rendered option list when controlled items prop changes", async () => {
    const initialItems = [
      { id: "1", name: "Aardvark" },
      { id: "2", name: "Kangaroo" },
      { id: "3", name: "Snake" },
    ];
    const updatedItems = [
      { id: "1", name: "New Text" },
      { id: "2", name: "Item 2" },
      { id: "3", name: "Item 3" },
    ];

    const wrapper = mount(defineComponent({
      props: {
        items: {
          type: Array,
          required: true,
        },
      },
      setup(componentProps) {
        return () =>
          h(ComboBox as any, {
            label: "Combobox",
            items: componentProps.items,
          });
      },
    }), {
      props: {
        items: initialItems,
      },
      attachTo: document.body,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    let options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(options[0]?.text()).toContain("Aardvark");
    expect(options[1]?.text()).toContain("Kangaroo");
    expect(options[2]?.text()).toContain("Snake");

    await wrapper.setProps({
      items: updatedItems,
    });
    await nextTick();
    await nextTick();

    options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(options[0]?.text()).toContain("New Text");
    expect(options[1]?.text()).toContain("Item 2");
    expect(options[2]?.text()).toContain("Item 3");
  });

  it("updates mapped slot items when list props change", async () => {
    const initialItems = [
      { id: "1", name: "Aardvark" },
      { id: "2", name: "Kangaroo" },
      { id: "3", name: "Snake" },
    ];
    const updatedItems = [
      { id: "1", name: "New Text" },
      { id: "2", name: "Item 2" },
      { id: "3", name: "Item 3" },
    ];

    const wrapper = mount(defineComponent({
      props: {
        listItems: {
          type: Array,
          required: false,
          default: () => initialItems,
        },
      },
      setup(componentProps) {
        return () =>
          h(ComboBox as any, { label: "Combobox" }, {
            default: () =>
              (componentProps.listItems as Array<{ id: string; name: string }>).map((item) =>
                h(Item as any, { id: item.id }, { default: () => item.name })
              ),
          });
      },
    }), {
      attachTo: document.body,
    });

    const input = wrapper.get('input[role="combobox"]');
    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    let options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(options[0]?.text()).toContain("Aardvark");
    expect(options[1]?.text()).toContain("Kangaroo");
    expect(options[2]?.text()).toContain("Snake");

    await options[0]?.trigger("click");
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Aardvark");

    const outside = document.createElement("button");
    document.body.append(outside);
    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();

    await wrapper.setProps({
      listItems: updatedItems,
    });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("New Text");

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(options[0]?.text()).toContain("New Text");
    expect(options[1]?.text()).toContain("Item 2");
    expect(options[2]?.text()).toContain("Item 3");
  });

  it("updates selected input text when controlled item labels change while blurred", async () => {
    const initialItems = [
      { id: "1", name: "Aardvark" },
      { id: "2", name: "Kangaroo" },
      { id: "3", name: "Snake" },
    ];
    const updatedItems = [
      { id: "1", name: "New Text" },
      { id: "2", name: "Item 2" },
      { id: "3", name: "Item 3" },
    ];

    const wrapper = mount(defineComponent({
      props: {
        items: {
          type: Array,
          required: true,
        },
      },
      setup(componentProps) {
        return () =>
          h(ComboBox as any, {
            label: "Combobox",
            items: componentProps.items,
          });
      },
    }), {
      props: {
        items: initialItems,
      },
      attachTo: document.body,
    });

    const input = wrapper.get('input[role="combobox"]');
    await input.trigger("focus");
    await input.setValue("Aar");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[0]?.trigger("click");
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Aardvark");

    const outside = document.createElement("button");
    document.body.append(outside);
    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    await wrapper.setProps({
      items: updatedItems,
    });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("New Text");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("does not update selected input text when controlled item labels change while focused", async () => {
    const initialItems = [
      { id: "1", name: "Aardvark" },
      { id: "2", name: "Kangaroo" },
      { id: "3", name: "Snake" },
    ];
    const updatedItems = [
      { id: "1", name: "New Text" },
      { id: "2", name: "Item 2" },
      { id: "3", name: "Item 3" },
    ];

    const wrapper = mount(defineComponent({
      props: {
        items: {
          type: Array,
          required: true,
        },
      },
      setup(componentProps) {
        return () =>
          h(ComboBox as any, {
            label: "Combobox",
            items: componentProps.items,
          });
      },
    }), {
      props: {
        items: initialItems,
      },
      attachTo: document.body,
    });

    const input = wrapper.get('input[role="combobox"]');
    await input.trigger("focus");
    await input.setValue("Aar");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[0]?.trigger("click");
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Aardvark");

    await input.trigger("focus");
    await nextTick();

    await wrapper.setProps({
      items: updatedItems,
    });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Aardvark");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("does not open when typing with menuTrigger manual", async () => {
    const wrapper = renderComboBox({
      menuTrigger: "manual",
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("T");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("opens all options on button press when menuTrigger is manual", async () => {
    const wrapper = renderComboBox({
      menuTrigger: "manual",
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(options).toHaveLength(3);
  });

  it("opens when focused with menuTrigger focus", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderComboBox({
      menuTrigger: "focus",
      onOpenChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true, "focus");
  });

  it("shows all options on focus-open when menuTrigger is focus and defaultInputValue is set", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        menuTrigger: "focus",
        defaultInputValue: "Tw",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
  });

  it("calls onFocus and onBlur for outside focus transitions", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const wrapper = renderComboBox({
      onFocus,
      onBlur,
    });
    const input = wrapper.get('input[role="combobox"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    await input.trigger("focus");
    expect(onFocus).toHaveBeenCalledTimes(1);

    await input.trigger("blur", { relatedTarget: outside });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("propagates blur transitions to parent focus handlers", async () => {
    const onBlur = vi.fn();
    const outerFocusOut = vi.fn();
    const wrapper = mount(defineComponent({
      setup() {
        return () =>
          h("div", { onFocusout: outerFocusOut }, [
            h(
              ComboBox as any,
              {
                label: "Test",
                autoFocus: true,
                onBlur,
              },
              {
                default: () => [
                  h(Item as any, { id: "1" }, { default: () => "One" }),
                  h(Item as any, { id: "2" }, { default: () => "Two" }),
                  h(Item as any, { id: "3" }, { default: () => "Three" }),
                ],
              }
            ),
            h("button", { "data-test": "outside" }, "Second focus"),
          ]);
      },
    }), {
      attachTo: document.body,
    });

    const input = wrapper.get('input[role="combobox"]');
    const outside = wrapper.get('[data-test="outside"]');
    await nextTick();

    expect(document.activeElement).toBe(input.element);
    expect(onBlur).toHaveBeenCalledTimes(0);
    expect(outerFocusOut).toHaveBeenCalledTimes(0);

    (outside.element as HTMLButtonElement).focus();
    await nextTick();

    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(outerFocusOut).toHaveBeenCalledTimes(1);
  });

  it("does not call onBlur when moving focus to the trigger button", async () => {
    const onBlur = vi.fn();
    const wrapper = renderComboBox({
      onBlur,
    });
    const input = wrapper.get('input[role="combobox"]');
    const button = wrapper.get("button");

    await input.trigger("focus");
    await input.trigger("blur", { relatedTarget: button.element });

    expect(onBlur).not.toHaveBeenCalled();
  });

  it("opens with ArrowDown and focuses the first option", async () => {
    const wrapper = renderComboBox();
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(input.attributes("aria-activedescendant")).toBe(options[0]?.attributes("id"));
  });

  it("opens with ArrowUp and focuses the last option", async () => {
    const wrapper = renderComboBox();
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowUp" });
    await nextTick();
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(input.attributes("aria-activedescendant")).toBe(options[2]?.attributes("id"));
  });

  it("clears aria-activedescendant on ArrowLeft and ArrowRight", async () => {
    for (const key of ["ArrowRight", "ArrowLeft"] as const) {
      const wrapper = renderComboBox();
      const input = wrapper.get('input[role="combobox"]');

      await input.trigger("focus");
      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBeDefined();

      await input.trigger("keydown", { key });
      await nextTick();
      expect(input.attributes("aria-activedescendant")).toBeUndefined();

      wrapper.unmount();
    }
  });

  it("commits focused option on Enter and closes the menu", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(input.attributes("aria-activedescendant")).toBeTruthy();

    await input.trigger("keydown", { key: "Enter" });
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect((input.element as HTMLInputElement).value).toBe("One");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("closes the menu on Enter with allowsCustomValue when no option is focused", async () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const onKeyDown = vi.fn();
    const wrapper = renderComboBox({
      allowsCustomValue: true,
      selectedKey: "2",
      onSelectionChange,
      onOpenChange,
      onKeyDown,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("On");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await input.trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBeUndefined();

    await input.trigger("keydown", { key: "Enter" });
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect(onKeyDown).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith(null);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("closes the menu on Enter for an already-selected option without emitting selection change", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      selectedKey: "2",
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("Tw");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    await input.trigger("keydown", { key: "Enter" });
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("commits focused option on Tab and closes the menu", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await input.trigger("keydown", { key: "Tab" });
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect((input.element as HTMLInputElement).value).toBe("One");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("commits focused option on Tab while focus moves to the next control", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    document.body.append(nextButton);

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    await input.trigger("keydown", { key: "Tab" });
    nextButton.focus();
    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(nextButton);
    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect((input.element as HTMLInputElement).value).toBe("One");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("commits focused option on Shift+Tab and closes the menu", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await input.trigger("keydown", { key: "Tab", shiftKey: true });
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect((input.element as HTMLInputElement).value).toBe("One");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("commits focused option on Shift+Tab while focus moves to the previous control", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');
    const previousButton = document.createElement("button");
    previousButton.textContent = "Previous";
    document.body.append(previousButton);

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    await input.trigger("keydown", { key: "Tab", shiftKey: true });
    previousButton.focus();
    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(previousButton);
    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect((input.element as HTMLInputElement).value).toBe("One");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("resets input value and closes the menu when pressing Escape", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        defaultSelectedKey: "two",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("Th");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect((input.element as HTMLInputElement).value).toBe("Th");

    await input.trigger("keydown", { key: "Escape" });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Two");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("retains selected key on blur when input value matches the selected item", async () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
      formValue: "key",
      name: "selection",
    });
    const input = wrapper.get('input[role="combobox"]');
    const hiddenInput = wrapper.get('input[type="hidden"][name="selection"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    expect((hiddenInput.element as HTMLInputElement).value).toBe("2");

    await input.trigger("focus");
    await input.setValue("Tw");
    await nextTick();
    await nextTick();

    await input.setValue("Two");
    await nextTick();
    await nextTick();

    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    expect((hiddenInput.element as HTMLInputElement).value).toBe("2");
  });

  it("commits custom value on blur when allowsCustomValue and selectedKey are controlled", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      allowsCustomValue: true,
      selectedKey: "2",
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    await input.trigger("focus");
    await input.setValue("Twx");
    await nextTick();
    await nextTick();

    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith(null);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("does not change selected key on blur when allowsCustomValue and input still matches", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      allowsCustomValue: true,
      selectedKey: "2",
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    await input.trigger("focus");
    await nextTick();

    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("does not change selected key on Tab when allowsCustomValue and selectedKey are controlled", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      allowsCustomValue: true,
      selectedKey: "2",
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await nextTick();

    await input.trigger("keydown", { key: "Tab" });
    await nextTick();
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("does not change selected key on Enter when allowsCustomValue and selectedKey are controlled", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      allowsCustomValue: true,
      selectedKey: "2",
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await nextTick();

    await input.trigger("keydown", { key: "Enter" });
    await nextTick();
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("resets to selected item text on blur when typed value no longer matches", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
      onInputChange,
      onSelectionChange,
    });
    const input = wrapper.get('input[role="combobox"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    expect((input.element as HTMLInputElement).value).toBe("Two");

    await input.trigger("focus");
    await input.setValue("Twx");
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Twx");

    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Two");
    expect(onInputChange).toHaveBeenLastCalledWith("Two");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("does not open the menu on blur when unmatched input is entered", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        onInputChange,
        onSelectionChange,
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    await input.trigger("focus");
    await input.setValue("On");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await input.setValue("");
    await nextTick();
    await nextTick();

    await input.setValue("z");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect((input.element as HTMLInputElement).value).toBe("z");

    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect((input.element as HTMLInputElement).value).toBe("");
    expect(onInputChange).toHaveBeenLastCalledWith("");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("clears unmatched input on blur when menuTrigger is manual", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        menuTrigger: "manual",
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    await input.trigger("focus");
    await input.setValue("z");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("z");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);

    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("does not select the focused option on blur", async () => {
    const onInputChange = vi.fn();
    const onSelectionChange = vi.fn();
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        onInputChange,
        onSelectionChange,
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    expect((input.element as HTMLInputElement).value).toBe("");

    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    const listbox = wrapper.get('[role="listbox"]');
    const options = listbox.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect((input.element as HTMLInputElement).getAttribute("aria-activedescendant")).toBe(
      options[0]?.attributes("id")
    );

    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect((input.element as HTMLInputElement).value).toBe("");
    expect(onInputChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("keeps input focus when mousing down on an option", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        onSelectionChange,
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await wrapper.get("button").trigger("click");
    await nextTick();
    await nextTick();

    (input.element as HTMLInputElement).focus();
    await input.trigger("focus");
    await nextTick();

    expect(document.activeElement).toBe(input.element);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    const firstOption = wrapper.findAll('[role="option"]')[0];
    expect(firstOption).toBeDefined();

    const mouseDown = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    firstOption!.element.dispatchEvent(mouseDown);
    await nextTick();

    expect(document.activeElement).toBe(input.element);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("respects disabled state", async () => {
    const wrapper = renderComboBox({
      isDisabled: true,
    });

    const input = wrapper.get('input[role="combobox"]');
    const button = wrapper.get("button");
    expect(input.attributes("disabled")).toBeDefined();
    expect(button.attributes("disabled")).toBeDefined();

    await button.trigger("click");
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("respects read-only state", async () => {
    const wrapper = renderComboBox({
      isReadOnly: true,
    });

    const input = wrapper.get('input[role="combobox"]');
    const button = wrapper.get("button");
    expect(input.attributes("readonly")).toBeDefined();
    expect(button.attributes("disabled")).toBeDefined();

    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);

    await button.trigger("click");
    await nextTick();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("respects disabledKeys for option interaction", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderComboBox({
      disabledKeys: new Set(["2"]),
      onSelectionChange,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(options[1]?.attributes("aria-disabled")).toBe("true");

    await options[1]?.trigger("click");
    await nextTick();
    await nextTick();

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).not.toBe("Two");
  });

  it("does not select a disabled option on matching typed input", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        disabledKeys: new Set(["two"]),
        onSelectionChange,
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("Two");
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(input.attributes("aria-activedescendant")).toBeUndefined();
  });

  it("clears input on blur when value matches a disabled option", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Filter",
        disabledKeys: new Set(["two"]),
        onSelectionChange,
      },
      slots: {
        default: () => [
          h(Item as any, { id: "one" }, { default: () => "One" }),
          h(Item as any, { id: "two" }, { default: () => "Two" }),
          h(Item as any, { id: "three" }, { default: () => "Three" }),
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input[role="combobox"]');
    const outside = document.createElement("button");
    document.body.append(outside);

    await input.trigger("focus");
    await input.setValue("Two");
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("Two");

    await input.trigger("blur", { relatedTarget: outside });
    await nextTick();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("does not open on space key when disabled", async () => {
    const wrapper = renderComboBox({
      isDisabled: true,
    });

    const button = wrapper.get("button");
    await button.trigger("keydown", { key: " " });
    await button.trigger("keyup", { key: " " });
    await nextTick();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("fires onLoadMore when scrolling near the end of an open listbox", async () => {
    const maxHeight = 200;
    const clientHeightSpy = vi
      .spyOn(window.HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return maxHeight;
        }
        return 48;
      });
    const scrollHeightSpy = vi
      .spyOn(window.HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 4800;
        }
        return 48;
      });

    try {
      const onLoadMore = vi.fn();
      const wrapper = mount(ComboBox as any, {
        props: {
          label: "Load More",
          maxHeight,
          onLoadMore,
          items: Array.from({ length: 100 }, (_, index) => ({
            key: `item-${index + 1}`,
            label: `Item ${index + 1}`,
          })),
        },
        attachTo: document.body,
      });

      await wrapper.get("button").trigger("click");
      await nextTick();

      const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
      expect(listbox).toBeTruthy();

      if (listbox) {
        listbox.scrollTop = 1500;
        listbox.dispatchEvent(new Event("scroll", { bubbles: true }));
        listbox.scrollTop = 5000;
        listbox.dispatchEvent(new Event("scroll", { bubbles: true }));
      }
      await nextTick();

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("fires onLoadMore when opening an underfilled listbox", async () => {
    const maxHeight = 200;
    const clientHeightSpy = vi
      .spyOn(window.HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return maxHeight;
        }
        return 48;
      });
    const scrollHeightSpy = vi
      .spyOn(window.HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 120;
        }
        return 48;
      });

    try {
      const onLoadMore = vi.fn();
      const wrapper = renderComboBox({
        maxHeight,
        onLoadMore,
      });

      await wrapper.get("button").trigger("click");
      await nextTick();
      await nextTick();

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("does not refire onLoadMore when reopening an unchanged underfilled listbox", async () => {
    const maxHeight = 200;
    const clientHeightSpy = vi
      .spyOn(window.HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return maxHeight;
        }
        return 48;
      });
    const scrollHeightSpy = vi
      .spyOn(window.HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 120;
        }
        return 48;
      });

    try {
      const onLoadMore = vi.fn();
      const wrapper = renderComboBox({
        maxHeight,
        onLoadMore,
      });

      await wrapper.get("button").trigger("click");
      await nextTick();
      await nextTick();
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      await wrapper.get("button").trigger("click");
      await nextTick();
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false);

      await wrapper.get("button").trigger("click");
      await nextTick();
      await nextTick();

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("shows a loading-more spinner in the open listbox when loadingState is loadingMore", async () => {
    const wrapper = renderComboBox({
      loadingState: "loadingMore",
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    let options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(4);

    let progressbar = options[3]?.find('[role="progressbar"]');
    expect(progressbar?.exists()).toBe(true);
    expect(progressbar?.attributes("aria-label")).toBe("Loading more…");

    await wrapper.setProps({
      loadingState: "idle",
    });
    await nextTick();

    options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false);
  });

  it("shows a loading placeholder in the open listbox when loadingState is loading with no items", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Async",
        items: [],
        loadingState: "loading",
      },
      attachTo: document.body,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.exists()).toBe(true);

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(1);

    const progressbar = options[0]?.find('[role="progressbar"]');
    expect(progressbar?.exists()).toBe(true);
    expect(progressbar?.attributes("aria-label")).toBe("Loading…");
  });

  it("shows a no-results placeholder for async empty lists when not loading", async () => {
    const wrapper = mount(ComboBox as any, {
      props: {
        label: "Async",
        items: [],
        loadingState: "idle",
      },
      attachTo: document.body,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.exists()).toBe(true);

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0]?.text()).toContain("No results");
    expect(options[0]?.find('[role="progressbar"]').exists()).toBe(false);
  });
});
