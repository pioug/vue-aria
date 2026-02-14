import { CalendarDate, createCalendar } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { effectScope, defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@vue-aria/i18n";
import { useDateFieldState } from "@vue-aria/datepicker-state";
import { hookData, useDateField } from "../src/useDateField";
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

  it("moves focus to the previous segment when deleting a placeholder", () => {
    const scope = effectScope();
    const focusPrevious = vi.fn();

    scope.run(() => {
      const state = useDateFieldState({
        locale: "en-US",
        createCalendar,
      });

      hookData.set(state, {
        focusManager: {
          focusNext: vi.fn(),
          focusPrevious,
          focusFirst: vi.fn(),
          focusLast: vi.fn(),
        },
      });

      const month = state.segments.find((segment) => segment.type === "month")!;
      const segment = useDateSegment(month, state, {
        current: document.createElement("div"),
      });

      const event = new KeyboardEvent("keydown", { key: "Backspace" });
      (segment.segmentProps as any).onKeyDown(event);
    });

    expect(focusPrevious).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("uses numeric input mode for editable numeric segments", () => {
    const scope = effectScope();
    let segmentProps!: ReturnType<typeof useDateSegment>;

    scope.run(() => {
      const state = useDateFieldState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 6, 15),
      });

      hookData.set(state, {
        focusManager: {
          focusNext: vi.fn(),
          focusPrevious: vi.fn(),
          focusFirst: vi.fn(),
          focusLast: vi.fn(),
        },
      });

      const year = state.segments.find((segment) => segment.type === "year")!;
      segmentProps = useDateSegment(year, state, {
        current: document.createElement("div"),
      });
    });

    const style = (segmentProps.segmentProps.style ?? {}) as Record<string, string>;
    expect(segmentProps.segmentProps.inputMode).toBe("numeric");
    expect(style.caretColor).toBe("transparent");
    scope.stop();
  });

  it("applies RTL embed styles in an RTL locale context", () => {
    let segmentProps!: ReturnType<typeof useDateSegment>;

    const Host = defineComponent({
      setup() {
        const state = useDateFieldState({
          locale: "ar-EG",
          createCalendar,
          defaultValue: new CalendarDate(2024, 6, 15),
        });

        hookData.set(state, {
          focusManager: {
            focusNext: vi.fn(),
            focusPrevious: vi.fn(),
            focusFirst: vi.fn(),
            focusLast: vi.fn(),
          },
        });

        const year = state.segments.find((segment) => segment.type === "year")!;
        segmentProps = useDateSegment(year, state, {
          current: document.createElement("div"),
        });

        return () => h("div");
      },
    });

    const wrapper = mount(I18nProvider, {
      props: { locale: "ar-EG" },
      slots: {
        default: () => h(Host),
      },
    });

    const style = (segmentProps.segmentProps.style ?? {}) as Record<string, string>;
    expect(style.unicodeBidi).toBe("embed");
    expect(style.direction).toBe("ltr");
    wrapper.unmount();
  });
});
