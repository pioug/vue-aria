import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
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

  it("keeps defaultInputValue when it differs from defaultSelectedKey text", () => {
    const wrapper = renderComboBox({
      defaultSelectedKey: "2",
      defaultInputValue: "Custom value",
    });

    expect((wrapper.get('input[role="combobox"]').element as HTMLInputElement).value).toBe("Custom value");
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

  it("forces text form submission when allowsCustomValue is true", () => {
    const wrapper = renderComboBox({
      name: "framework",
      formValue: "key",
      allowsCustomValue: true,
    });

    expect(wrapper.get('input[role="combobox"]').attributes("name")).toBe("framework");
    expect(wrapper.find('input[type="hidden"][name="framework"]').exists()).toBe(false);
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
