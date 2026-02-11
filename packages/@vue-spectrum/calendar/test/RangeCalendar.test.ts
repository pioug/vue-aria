import { render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RangeCalendar } from "../src";

function getDayButton(grid: HTMLElement, day: string): HTMLElement {
  const candidates = within(grid).getAllByRole("button");
  const button = candidates.find((candidate) => candidate.textContent === day);
  if (!button) {
    throw new Error(`Missing day button ${day}`);
  }

  return button;
}

describe("RangeCalendar", () => {
  it("selects a range after two date clicks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(RangeCalendar, {
      props: {
        onChange,
        defaultValue: null,
      },
    });

    const grid = tree.getByRole("grid");
    await user.click(getDayButton(grid, "5"));
    await user.click(getDayButton(grid, "10"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0]?.[0];
    expect(range?.start?.toString().endsWith("-05")).toBe(true);
    expect(range?.end?.toString().endsWith("-10")).toBe(true);
  });
});
