import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { SearchField } from "../src/SearchField";

describe("@vue-spectrum/s2 SearchField", () => {
  it("renders baseline attrs and default search icon", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(SearchField, {
            label: "Search",
            size: "L",
            defaultValue: "alpha",
          }),
      },
    });

    const root = wrapper.get(".s2-SearchField");
    expect(root.classes()).toContain("s2-SearchField--L");
    expect(wrapper.get("input").element).toBeInstanceOf(HTMLInputElement);
  });

  it("submits and clears values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onClear = vi.fn();

    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(SearchField, {
            defaultValue: "query",
            "aria-label": "Search docs",
            onSubmit,
            onClear,
          }),
      },
    });

    const input = wrapper.get("input");
    await input.trigger("keydown", { key: "Enter" });
    expect(onSubmit).toHaveBeenCalled();

    const clearButton = wrapper.get('[aria-label="Clear search"]');
    await user.click(clearButton.element);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
