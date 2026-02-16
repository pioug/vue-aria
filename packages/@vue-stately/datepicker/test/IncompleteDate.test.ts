import {
  CalendarDateTime,
  createCalendar,
} from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { IncompleteDate } from "../src/IncompleteDate";
import { getPlaceholder } from "../src/placeholders";

describe("IncompleteDate", () => {
  it("tracks completion and resolves to a full value", () => {
    const calendar = createCalendar("gregory");
    const placeholder = new CalendarDateTime(2000, 1, 1, 8, 0, 0);

    let value = new IncompleteDate(calendar, "h12");
    value = value.set("year", 2024, placeholder);
    value = value.set("month", 5, placeholder);
    value = value.set("day", 7, placeholder);
    value = value.set("hour", 9, placeholder);
    value = value.set("minute", 30, placeholder);

    expect(
      value.isComplete(["year", "month", "day", "hour", "minute", "dayPeriod"])
    ).toBe(true);
    expect(value.toValue(placeholder).toString()).toBe("2024-05-07T09:30:00");
  });

  it("rounds minute cycles for page-style increments", () => {
    const calendar = createCalendar("gregory");
    const placeholder = new CalendarDateTime(2024, 1, 1, 10, 7, 0);
    const value = new IncompleteDate(calendar, "h23", placeholder);

    const plusPage = value.cycle("minute", 15, placeholder, ["hour", "minute"]);
    const minusPage = plusPage.cycle(
      "minute",
      -15,
      placeholder,
      ["hour", "minute"]
    );

    expect(plusPage.minute).toBe(15);
    expect(minusPage.minute).toBe(0);
  });
});

describe("getPlaceholder", () => {
  it("returns localized date placeholders and fallback time placeholders", () => {
    expect(getPlaceholder("year", "2024", "de-DE")).toBe("jjjj");
    expect(getPlaceholder("dayPeriod", "AM", "en-US")).toBe("AM");
    expect(getPlaceholder("hour", "09", "en-US")).toBe("––");
  });
});
