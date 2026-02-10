import { parseDate } from "@internationalized/date";
import { render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar, RangeCalendar } from "../src";

function getDayButton(grid: HTMLElement, day: string): HTMLElement {
  const candidates = within(grid).getAllByRole("button");
  const button = candidates.find(
    (candidate) => candidate.textContent === day
  );
  if (!button) {
    throw new Error(`Missing day button ${day}`);
  }

  return button;
}

describe("Calendar", () => {
  it("renders with default value and selection semantics", () => {
    const tree = render(Calendar, {
      props: {
        defaultValue: parseDate("2019-06-05"),
      },
    });

    const heading = tree.getByRole("heading", { level: 2 });
    expect(heading.textContent).toContain("2019-06");

    const selectedDate = tree.getByLabelText("Selected date, 2019-06-05");
    expect(selectedDate.parentElement?.getAttribute("role")).toBe("gridcell");
    expect(selectedDate.parentElement?.getAttribute("aria-selected")).toBe("true");
  });

  it("selects a date on click in uncontrolled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(Calendar, {
      props: {
        defaultValue: parseDate("2019-06-05"),
        onChange,
      },
    });

    const grid = tree.getByRole("grid");
    await user.click(getDayButton(grid, "17"));

    const selectedDate = tree.getByLabelText("Selected date, 2019-06-17");
    expect(selectedDate).toBeTruthy();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("2019-06-17");
  });

  it("calls onChange without mutating selection in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(Calendar, {
      props: {
        value: parseDate("2019-06-05"),
        onChange,
      },
    });

    const grid = tree.getByRole("grid");
    await user.click(getDayButton(grid, "17"));

    expect(tree.getByLabelText("Selected date, 2019-06-05")).toBeTruthy();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("2019-06-17");
  });

  it("navigates visible month with previous and next controls", async () => {
    const user = userEvent.setup();
    const tree = render(Calendar, {
      props: {
        defaultValue: parseDate("2019-06-05"),
      },
    });

    const heading = tree.getByRole("heading", { level: 2 });
    expect(heading.textContent).toContain("2019-06");

    await user.click(tree.getByLabelText("Next"));
    expect(tree.getByRole("heading", { level: 2 }).textContent).toContain("2019-07");

    await user.click(tree.getByLabelText("Previous"));
    expect(tree.getByRole("heading", { level: 2 }).textContent).toContain("2019-06");
  });

  it("does not select new dates when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(Calendar, {
      props: {
        defaultValue: parseDate("2019-06-05"),
        onChange,
        isDisabled: true,
      },
    });

    const grid = tree.getByRole("grid");
    await user.click(getDayButton(grid, "17"));

    expect(
      tree.getByRole("application").getAttribute("data-selected-description")
    ).toBe("Selected date: 2019-06-05");
    expect(onChange).not.toHaveBeenCalled();
  });
});

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
