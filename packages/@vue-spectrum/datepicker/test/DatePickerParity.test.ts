import { render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DatePicker, DateRangePicker } from "../src";

function getDayButton(grid: HTMLElement, day: string): HTMLElement {
  const candidates = within(grid).getAllByRole("button");
  const button = candidates.find((candidate) => candidate.textContent === day);

  if (!button) {
    throw new Error(`Missing day button ${day}`);
  }

  return button;
}

describe("DatePicker parity behaviors", () => {
  it("supports controlled open state callbacks", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = render(DatePicker, {
      props: {
        label: "Date",
        isOpen: false,
        onOpenChange,
      },
    });

    await user.click(tree.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(tree.queryByRole("dialog")).toBeNull();

    await tree.rerender({
      label: "Date",
      isOpen: true,
      onOpenChange,
    });
    expect(tree.getByRole("dialog")).toBeTruthy();
  });

  it("keeps popover open on select when shouldCloseOnSelect is false", async () => {
    const user = userEvent.setup();
    const tree = render(DatePicker, {
      props: {
        label: "Date",
        defaultOpen: true,
        shouldCloseOnSelect: false,
      },
    });

    const dialog = tree.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");
    await user.click(getDayButton(grid, "17"));

    expect(tree.queryByRole("dialog")).not.toBeNull();
  });

  it("passes data attributes through to root element", () => {
    const tree = render(DatePicker, {
      props: {
        label: "Date",
      },
      attrs: {
        "data-testid": "date-picker-root",
      },
    });

    expect(tree.getByTestId("date-picker-root").classList.contains("react-spectrum-DatePicker")).toBe(
      true
    );
  });

  it("exposes UNSAFE_getDOMNode and focus helpers", () => {
    const pickerRef = ref<{
      focus: () => void;
      UNSAFE_getDOMNode: () => HTMLElement | null;
    } | null>(null);
    const App = defineComponent({
      setup() {
        return () =>
          h(DatePicker, {
            ref: pickerRef,
            label: "Date",
          });
      },
    });

    const wrapper = mount(App);
    const input = wrapper.get("input[type=\"date\"]").element as HTMLInputElement;

    expect(typeof pickerRef.value?.focus).toBe("function");
    expect(typeof pickerRef.value?.UNSAFE_getDOMNode).toBe("function");
    expect(pickerRef.value?.UNSAFE_getDOMNode()?.querySelector("input[type=\"date\"]")).toBe(
      input
    );
  });
});

describe("DateRangePicker parity behaviors", () => {
  it("supports controlled open state callbacks", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = render(DateRangePicker, {
      props: {
        label: "Date range",
        isOpen: false,
        onOpenChange,
      },
    });

    await user.click(tree.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(tree.queryByRole("dialog")).toBeNull();

    await tree.rerender({
      label: "Date range",
      isOpen: true,
      onOpenChange,
    });
    expect(tree.getByRole("dialog")).toBeTruthy();
  });

  it("keeps popover open on full range selection when shouldCloseOnSelect is false", async () => {
    const user = userEvent.setup();
    const tree = render(DateRangePicker, {
      props: {
        label: "Date range",
        defaultOpen: true,
        shouldCloseOnSelect: false,
      },
    });

    const dialog = tree.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");
    await user.click(getDayButton(grid, "5"));
    await user.click(getDayButton(grid, "10"));

    expect(tree.queryByRole("dialog")).not.toBeNull();
  });

  it("passes data attributes through to root element", () => {
    const tree = render(DateRangePicker, {
      props: {
        label: "Date range",
      },
      attrs: {
        "data-testid": "date-range-picker-root",
      },
    });

    expect(
      tree
        .getByTestId("date-range-picker-root")
        .classList.contains("react-spectrum-DateRangePicker")
    ).toBe(true);
  });

  it("exposes UNSAFE_getDOMNode and focus helpers", () => {
    const pickerRef = ref<{
      focus: () => void;
      UNSAFE_getDOMNode: () => HTMLElement | null;
    } | null>(null);
    const App = defineComponent({
      setup() {
        return () =>
          h(DateRangePicker, {
            ref: pickerRef,
            label: "Date range",
          });
      },
    });

    const wrapper = mount(App);
    const input = wrapper.get("input.is-start").element as HTMLInputElement;

    expect(typeof pickerRef.value?.focus).toBe("function");
    expect(typeof pickerRef.value?.UNSAFE_getDOMNode).toBe("function");
    expect(pickerRef.value?.UNSAFE_getDOMNode()?.querySelector("input.is-start")).toBe(input);
  });
});
