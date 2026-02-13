import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useTextField } from "../src";

describe("useTextField hook", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() =>
      useTextField(props as any, { current: document.createElement("input") })
    )!;
    scope.stop();
    return result.inputProps;
  };

  it("returns default textfield props when no props are provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const props = run({});
    expect(props.type).toBe("text");
    expect(props.disabled).toBe(false);
    expect(props.readOnly).toBe(false);
    expect(props["aria-invalid"]).toBeUndefined();
    expect(props["aria-required"]).toBeUndefined();
    expect(typeof props.onChange).toBe("function");
    expect(warn).toHaveBeenLastCalledWith(
      "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );
    warn.mockRestore();
  });

  it("applies type when defined", () => {
    const props = run({ type: "search", "aria-label": "mandatory label" });
    expect(props.type).toBe("search");
  });

  it("applies disabled state", () => {
    expect(run({ isDisabled: true, "aria-label": "mandatory label" }).disabled).toBe(true);
    expect(run({ isDisabled: false, "aria-label": "mandatory label" }).disabled).toBe(false);
  });

  it("applies required state", () => {
    expect(run({ isRequired: true, "aria-label": "mandatory label" })["aria-required"]).toBe(true);
    expect(run({ isRequired: false, "aria-label": "mandatory label" })["aria-required"]).toBeUndefined();
  });

  it("applies readonly state", () => {
    expect(run({ isReadOnly: true, "aria-label": "mandatory label" }).readOnly).toBe(true);
    expect(run({ isReadOnly: false, "aria-label": "mandatory label" }).readOnly).toBe(false);
  });

  it("applies validation state", () => {
    expect(run({ validationState: "invalid", "aria-label": "mandatory label" })["aria-invalid"]).toBe(true);
    expect(run({ validationState: "valid", "aria-label": "mandatory label" })["aria-invalid"]).toBeUndefined();
  });

  it("applies autoCapitalize", () => {
    expect(run({ autoCapitalize: "on", "aria-label": "mandatory label" }).autoCapitalize).toBe("on");
    expect(run({ autoCapitalize: "off", "aria-label": "mandatory label" }).autoCapitalize).toBe("off");
  });

  it("calls user onChange with value", () => {
    const onChange = vi.fn();
    const props = run({ onChange, "aria-label": "mandatory label" });
    (props.onChange as (event: Event) => void)({
      target: {
        value: "1",
      },
    } as unknown as Event);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("omits type/pattern when inputElementType is textarea", () => {
    const props = run({ type: "search", pattern: "pattern", inputElementType: "textarea" });
    expect(props.type).toBeUndefined();
    expect(props.pattern).toBeUndefined();
  });
});
