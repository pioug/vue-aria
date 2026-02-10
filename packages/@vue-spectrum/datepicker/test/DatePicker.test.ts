import { parseDate, parseTime } from "@internationalized/date";
import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateField, DatePicker, DateRangePicker, TimeField } from "../src";

function getDayButton(grid: HTMLElement, day: string): HTMLElement {
  const candidates = within(grid).getAllByRole("button");
  const button = candidates.find((candidate) => candidate.textContent === day);

  if (!button) {
    throw new Error(`Missing day button ${day}`);
  }

  return button;
}

describe("DateField", () => {
  it("renders with default value and emits parsed date on input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(DateField, {
      props: {
        label: "Date",
        defaultValue: parseDate("2019-06-05"),
        onChange,
      },
    });

    const input = tree.container.querySelector("input[type=\"date\"]") as HTMLInputElement;
    expect(input.value).toBe("2019-06-05");

    await user.click(input);
    await fireEvent.update(input, "2019-06-17");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("2019-06-17");
  });
});

describe("TimeField", () => {
  it("renders with second granularity and emits parsed time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(TimeField, {
      props: {
        label: "Time",
        granularity: "second",
        defaultValue: parseTime("14:30:45"),
        onChange,
      },
    });

    const input = tree.container.querySelector("input[type=\"time\"]") as HTMLInputElement;
    expect(input.value).toBe("14:30:45");

    await user.click(input);
    await fireEvent.update(input, "09:15:30");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("09:15:30");
  });
});

describe("DatePicker", () => {
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

  it("selects a date from the calendar and calls onChange", async () => {
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
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("2019-06-17");
    expect(tree.queryByRole("dialog")).toBeNull();
  });

  it("keeps display value stable in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(DatePicker, {
      props: {
        label: "Date",
        value: parseDate("2019-06-05"),
        onChange,
      },
    });

    await user.click(tree.getByRole("button"));
    const dialog = tree.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");
    await user.click(getDayButton(grid, "17"));

    const input = tree.container.querySelector("input[type=\"date\"]") as HTMLInputElement;
    expect(input.value).toBe("2019-06-05");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("2019-06-17");
  });
});

describe("DateRangePicker", () => {
  it("renders start and end date inputs", () => {
    const tree = render(DateRangePicker, {
      props: {
        label: "Date range",
      },
    });

    const inputs = tree.container.querySelectorAll("input[type=\"date\"]");
    expect(inputs).toHaveLength(2);
    expect(tree.getByTestId("date-range-dash")).toBeTruthy();
  });

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
