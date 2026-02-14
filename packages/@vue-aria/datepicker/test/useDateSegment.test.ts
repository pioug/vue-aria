import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useDateFieldState } from "@vue-aria/datepicker-state";
import { useDateField } from "../src/useDateField";
import { useDateSegment } from "../src/useDateSegment";

describe("useDateSegment", () => {
  it("hides literal segments from assistive technologies", () => {
    const scope = effectScope();
    let literalProps!: ReturnType<typeof useDateSegment>;
    let editableProps!: ReturnType<typeof useDateSegment>;

    scope.run(() => {
      const state = useDateFieldState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 6, 15),
      });

      useDateField(
        {
          "aria-label": "Date",
        },
        state,
        { current: document.createElement("div") }
      );

      const literal = state.segments.find((segment) => segment.type === "literal")!;
      const year = state.segments.find((segment) => segment.type === "year")!;

      literalProps = useDateSegment(literal, state, {
        current: document.createElement("div"),
      });
      editableProps = useDateSegment(year, state, {
        current: document.createElement("div"),
      });
    });

    expect(literalProps.segmentProps["aria-hidden"]).toBe(true);
    expect(editableProps.segmentProps.role).toBe("spinbutton");
    scope.stop();
  });
});
