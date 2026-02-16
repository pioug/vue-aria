import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick, h } from "vue";
import { Item, Section, SearchAutocomplete } from "../src";

const items = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

function renderSearchAutocomplete(props: Record<string, unknown> = {}) {
  return mount(SearchAutocomplete as any, {
    props: {
      label: "Test",
      items,
      ...props,
    },
    attachTo: document.body,
  });
}

describe("SearchAutocomplete", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders input and label", () => {
    const wrapper = renderSearchAutocomplete();

    const input = wrapper.get('input[role="combobox"]');
    expect(input.attributes("autocorrect")).toBe("off");
    expect(input.attributes("spellcheck")).toBe("false");
    expect(input.attributes("autocomplete")).toBe("off");
    expect(wrapper.text()).toContain("Test");
  });

  it("supports custom icons and no icons", () => {
    const customIcon = h("span", { "data-testid": "filtericon" });
    const customWrapper = renderSearchAutocomplete({ icon: customIcon });
    expect(customWrapper.get('[data-testid="filtericon"]').exists()).toBe(true);

    const noIconWrapper = renderSearchAutocomplete({ icon: null });
    expect(noIconWrapper.find('[data-testid="searchicon"]').exists()).toBe(false);
  });

  it("opens the list and lets users select an item", async () => {
    const wrapper = renderSearchAutocomplete();
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("O");
    await nextTick();
    await nextTick();

    const listbox = wrapper.get('[role="listbox"]');
    const options = listbox.findAll('[role="option"]');
    expect(options.length).toBe(2);

    await input.trigger("keydown", { key: "ArrowDown" });
    await input.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("One");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("calls onSubmit for custom text submission", async () => {
    const onSubmit = vi.fn();
    const wrapper = renderSearchAutocomplete({ onSubmit });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("Custom");
    await input.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(onSubmit).toHaveBeenCalledWith("Custom", null);
  });

  it("clears input value with clear button", async () => {
    const onClear = vi.fn();
    const wrapper = renderSearchAutocomplete({ onClear });
    const input = wrapper.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("One");
    await nextTick();

    const clearButton = wrapper.find(".spectrum-ClearButton");
    await clearButton.trigger("click");
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("");
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("supports item sections", async () => {
    const withSection = mount(SearchAutocomplete as any, {
      props: {
        label: "Test",
      },
      slots: {
        default: () => [
          h(Section, { id: "section", title: "Section" }, () => [
            h(Item, { id: "1" }, () => "One"),
            h(Item, { id: "2" }, () => "Two"),
          ]),
        ],
      },
      attachTo: document.body,
    });
    const input = withSection.get('input[role="combobox"]');

    await input.trigger("focus");
    await input.setValue("O");
    await nextTick();
    await nextTick();

    const listbox = withSection.find('[role="listbox"]');
    expect(listbox.exists()).toBe(true);
    expect(listbox.findAll('[role="option"]').length).toBe(2);
  });
});
