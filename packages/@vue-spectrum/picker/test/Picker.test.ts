import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
import { Item } from "../src/Item";
import { Picker } from "../src/Picker";
import { Section } from "../src/Section";

const items = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

function renderPicker(props: Record<string, unknown> = {}) {
  return mount(Picker as any, {
    props: {
      ariaLabel: "Picker",
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

describe("Picker", () => {
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

  it("renders trigger and placeholder", () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    expect(trigger.attributes("aria-haspopup")).toBe("listbox");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(wrapper.text()).toContain("Select…");
  });

  it("opens on trigger press and selects an option", async () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      onSelectionChange,
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(options).toHaveLength(3);

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "2";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(wrapper.text()).toContain("Two");
  });

  it("opens on ArrowDown and focuses the first option", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("keydown", { key: "ArrowDown" });
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    const options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(3);
    expect(document.activeElement).toBe(options[0]);
  });

  it("opens on ArrowUp and focuses the last option", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("keydown", { key: "ArrowUp" });
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    const options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(listbox).toBeTruthy();
    expect(options).toHaveLength(3);
    expect(document.activeElement).toBe(options[2]);
  });

  it("opens on Space keydown", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("keydown", { key: " " });
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("opens on Enter keydown", async () => {
    const wrapper = renderPicker();
    const trigger = wrapper.get("button");

    await trigger.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("supports selecting items with falsy keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        items: [
          { key: "", label: "Empty" },
          { key: 0, label: "Zero" },
          { key: "three", label: "Three" },
        ],
        onSelectionChange,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    expect(trigger.text()).toContain("Select…");

    await trigger.trigger("click");
    await nextTick();

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.calls[0]?.[0]).toBe("");
    expect(wrapper.text()).toContain("Empty");

    await wrapper.get("button").trigger("click");
    await nextTick();

    (select.element as HTMLSelectElement).value = "0";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(String(onSelectionChange.mock.calls[1]?.[0])).toBe("0");
    expect(wrapper.text()).toContain("Zero");
  });

  it("supports closed arrow-key navigation to falsy keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        items: [
          { key: "1", label: "One" },
          { key: "", label: "Empty" },
          { key: "3", label: "Three" },
        ],
        defaultSelectedKey: "1",
        onSelectionChange,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    expect(wrapper.text()).toContain("One");

    await trigger.trigger("keydown", { key: "ArrowRight" });
    await trigger.trigger("keyup", { key: "ArrowRight" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("");
    expect(wrapper.text()).toContain("Empty");
  });

  it("supports closed type-to-select without opening the menu", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      onSelectionChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("keydown", { key: "T" });
    await trigger.trigger("keyup", { key: "T" });
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(wrapper.text()).toContain("Two");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("closes when trigger is pressed while open", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      onOpenChange,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.attributes("aria-controls")).toBeUndefined();
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports controlled selectedKey updates", async () => {
    const wrapper = renderPicker({
      selectedKey: "1",
    });

    expect(wrapper.text()).toContain("One");

    await wrapper.setProps({
      selectedKey: "3",
    });
    await nextTick();

    expect(wrapper.text()).toContain("Three");
  });

  it("keeps controlled selectedKey value on selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      selectedKey: "1",
      onSelectionChange,
    });

    expect(wrapper.text()).toContain("One");

    await wrapper.get("button").trigger("click");
    await nextTick();

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "2";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(wrapper.text()).toContain("One");
  });

  it("updates uncontrolled defaultSelectedKey value on selection", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderPicker({
      defaultSelectedKey: "1",
      onSelectionChange,
    });

    expect(wrapper.text()).toContain("One");

    await wrapper.get("button").trigger("click");
    await nextTick();

    const select = wrapper.get("select");
    (select.element as HTMLSelectElement).value = "2";
    await select.trigger("change");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(wrapper.text()).toContain("Two");
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      isOpen: true,
      onOpenChange,
    });

    await nextTick();

    const trigger = wrapper.get("button");
    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);
    expect(onOpenChange).not.toHaveBeenCalled();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports default open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      defaultOpen: true,
      onOpenChange,
    });

    await nextTick();

    const trigger = wrapper.get("button");
    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(listbox?.id);
    expect(onOpenChange).not.toHaveBeenCalled();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.attributes("aria-controls")).toBeUndefined();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes default open state on escape", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      defaultOpen: true,
      onOpenChange,
    });

    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(listbox).toBeTruthy();

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape", bubbles: true }));
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("false");
    expect(wrapper.get("button").attributes("aria-controls")).toBeUndefined();
  });

  it("does not close on escape in controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderPicker({
      isOpen: true,
      onOpenChange,
    });

    await nextTick();

    const listbox = document.body.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(listbox).toBeTruthy();

    listbox?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    listbox?.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape", bubbles: true }));
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes when clicking outside", async () => {
    const wrapper = renderPicker();

    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");

    const underlay = document.body.querySelector(".spectrum-Underlay") as HTMLElement | null;
    expect(underlay).toBeTruthy();
    underlay?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("supports hidden select form attributes and default value", () => {
    const wrapper = renderPicker({
      name: "picker",
      form: "picker-form",
      defaultSelectedKey: "2",
    });

    const select = wrapper.get('select[name="picker"]');
    expect(select.attributes("form")).toBe("picker-form");
    expect((select.element as HTMLSelectElement).value).toBe("2");
  });

  it("submits empty option value by default", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { id: "picker-form" }, [
              h(Picker as any, {
                ariaLabel: "Picker",
                name: "picker",
                items,
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const form = wrapper.get("form").element as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("picker")).toBe("");
  });

  it("submits default selected option value", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { id: "picker-form" }, [
              h(Picker as any, {
                ariaLabel: "Picker",
                name: "picker",
                items,
                defaultSelectedKey: "2",
              }),
            ]);
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const form = wrapper.get("form").element as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("picker")).toBe("2");
  });

  it("supports hidden select autocomplete attribute", () => {
    const wrapper = renderPicker({
      label: "Test",
      autoComplete: "address-level1",
    });

    const select = wrapper.get("select");
    expect(select.attributes("autocomplete")).toBe("address-level1");
  });

  it("focuses trigger when clicking the label", async () => {
    const wrapper = renderPicker({
      label: "Test",
    });

    const label = wrapper.get(".spectrum-FieldLabel");
    await label.trigger("click");
    await nextTick();

    expect(document.activeElement).toBe(wrapper.get("button").element);
  });

  it("calls onFocus and onBlur for the closed trigger", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const wrapper = renderPicker({
      onFocus,
      onBlur,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("focus");
    await trigger.trigger("blur");
    await nextTick();

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("focuses the trigger when autoFocus is true", async () => {
    const wrapper = renderPicker({
      autoFocus: true,
    });

    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(wrapper.get("button").element);
  });

  it("respects disabled state", async () => {
    const wrapper = renderPicker({
      isDisabled: true,
    });

    const trigger = wrapper.get("button");
    expect(trigger.attributes("disabled")).toBeDefined();

    await trigger.trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("does not open on mouse down when disabled", async () => {
    const wrapper = renderPicker({
      isDisabled: true,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("mousedown");
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("does not open on space key when disabled", async () => {
    const wrapper = renderPicker({
      isDisabled: true,
    });

    const trigger = wrapper.get("button");
    await trigger.trigger("keydown", { key: " " });
    await trigger.trigger("keyup", { key: " " });
    await nextTick();

    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("shows a loading spinner on the trigger when loading with no items", async () => {
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
        items: [],
        isLoading: true,
      },
      attachTo: document.body,
    });

    const trigger = wrapper.get("button");
    const progressbar = trigger.get('[role="progressbar"]');

    expect(progressbar.attributes("aria-label")).toBe("Loading…");
    expect(progressbar.attributes("aria-valuenow")).toBeUndefined();
    expect(trigger.attributes("aria-describedby")).toBe(progressbar.attributes("id"));

    await wrapper.setProps({
      isLoading: false,
    });
    await nextTick();

    expect(trigger.find('[role="progressbar"]').exists()).toBe(false);
    expect(trigger.attributes("aria-describedby")).toBeUndefined();
  });

  it("shows a loading-more spinner in the open listbox when isLoading is true", async () => {
    const wrapper = renderPicker({
      isLoading: true,
    });

    await wrapper.get("button").trigger("click");
    await nextTick();

    let options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(options).toHaveLength(4);

    let progressbar = options[3]?.querySelector('[role="progressbar"]') as HTMLElement | null;
    expect(progressbar).toBeTruthy();
    expect(progressbar?.getAttribute("aria-label")).toBe("Loading more…");
    expect(progressbar?.getAttribute("aria-valuenow")).toBeNull();

    await wrapper.setProps({
      isLoading: false,
    });
    await nextTick();

    options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(options).toHaveLength(3);
    expect(document.body.querySelector('[role="progressbar"]')).toBeNull();
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
      const wrapper = mount(Picker as any, {
        props: {
          ariaLabel: "Picker",
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

  it("supports RouterProvider links on items", async () => {
    const navigate = vi.fn();
    const useHref = (href: string) => (href.startsWith("http") ? href : `/base${href}`);
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
                  Picker as any,
                  {
                    ariaLabel: "Picker",
                  },
                  {
                    default: () => [
                      h(
                        Item as any,
                        { id: "one", href: "/one", routerOptions: { foo: "bar" } },
                        { default: () => "One" }
                      ),
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

    options[0]?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(navigate).toHaveBeenCalledWith("/one", { foo: "bar" });

    navigate.mockReset();
    options[1]?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();

    expect(navigate).not.toHaveBeenCalled();
  });

  it.each(["mouse", "keyboard"] as const)(
    "supports plain link items with %s interaction without selecting",
    async (interactionType) => {
      const restoreNavigation = preventLinkNavigation();
      try {
        const onSelectionChange = vi.fn();
        const wrapper = mount(Picker as any, {
          props: {
            ariaLabel: "Picker",
            onSelectionChange,
          },
          slots: {
            default: () => [
              h(Item as any, { id: "one", href: "https://google.com" }, { default: () => "One" }),
              h(Item as any, { id: "two", href: "https://adobe.com" }, { default: () => "Two" }),
            ],
          },
          attachTo: document.body,
        });

        await wrapper.get("button").trigger("click");
        await nextTick();

        const options = Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
        expect(options).toHaveLength(2);
        expect(options[0]?.tagName).toBe("A");
        expect(options[1]?.tagName).toBe("A");

        if (interactionType === "mouse") {
          options[0]?.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
            })
          );
        } else {
          options[0]?.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "Enter",
              bubbles: true,
              cancelable: true,
            })
          );
          options[0]?.dispatchEvent(
            new KeyboardEvent("keyup", {
              key: "Enter",
              bubbles: true,
              cancelable: true,
            })
          );
        }
        await nextTick();

        expect(onSelectionChange).not.toHaveBeenCalled();
        expect(wrapper.get("button").text()).toContain("Select…");
      } finally {
        restoreNavigation();
      }
    }
  );

  it("supports slot-defined items and sections", async () => {
    const wrapper = mount(Picker as any, {
      props: {
        ariaLabel: "Picker",
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

    const options = Array.from(document.body.querySelectorAll('[role="option"]'));
    expect(options).toHaveLength(3);
    expect(document.body.textContent).toContain("Numbers");
  });
});
