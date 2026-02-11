import { parseDate } from "@internationalized/date";
import { render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../src";

function getDayButton(grid: HTMLElement, day: string): HTMLElement {
  const candidates = within(grid).getAllByRole("button");
  const button = candidates.find((candidate) => candidate.textContent === day);

  if (!button) {
    throw new Error(`Missing day button ${day}`);
  }

  return button;
}

describe("DatePickerBase", () => {
  it("opens and closes the popover from the trigger button", async () => {
    const user = userEvent.setup();
    const tree = render(DatePicker, {
      props: {
        label: "Date",
      },
    });

    expect(tree.queryByRole("dialog")).toBeNull();

    await user.click(tree.getByRole("button"));
    expect(tree.getByRole("dialog")).toBeTruthy();

    await user.click(document.body);
    expect(tree.queryByRole("dialog")).toBeNull();
  });

  it("selects a date and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(DatePicker, {
      props: {
        label: "Date",
        defaultValue: parseDate("2019-06-05"),
        onChange,
      },
    });

    await user.click(tree.getByRole("button"));
    const dialog = tree.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    await user.click(getDayButton(grid, "17"));

    const input = tree.container.querySelector("input[type=\"date\"]") as HTMLInputElement;
    expect(input.value).toBe("2019-06-17");
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
