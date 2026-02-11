import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { parseDate } from "@internationalized/date";
import { describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "../src";

function getDayButton(grid: HTMLElement, day: string): HTMLElement {
  const candidates = within(grid).getAllByRole("button");
  const button = candidates.find((candidate) => candidate.textContent === day);

  if (!button) {
    throw new Error(`Missing day button ${day}`);
  }

  return button;
}

describe("DateRangePicker", () => {
  it("selects a date range from the calendar popover", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(DateRangePicker, {
      props: {
        label: "Date range",
        onChange,
      },
    });

    await user.click(tree.getByRole("button"));
    const dialog = tree.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    await user.click(getDayButton(grid, "5"));
    await user.click(getDayButton(grid, "10"));

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall?.start?.toString().endsWith("-05")).toBe(true);
    expect(lastCall?.end?.toString().endsWith("-10")).toBe(true);
  });

  it("emits range changes without mutating value in controlled mode", async () => {
    const onChange = vi.fn();
    const tree = render(DateRangePicker, {
      props: {
        label: "Date range",
        value: {
          start: parseDate("2019-06-05"),
          end: parseDate("2019-06-10"),
        },
        onChange,
      },
    });

    const input = tree.container.querySelector("input.is-start") as HTMLInputElement;
    await fireEvent.update(input, "2019-06-08");

    expect(onChange).toHaveBeenCalledTimes(1);
    const call = onChange.mock.calls[0]?.[0];
    expect(call?.start?.toString()).toBe("2019-06-08");
    expect(call?.end?.toString()).toBe("2019-06-10");
  });
});
