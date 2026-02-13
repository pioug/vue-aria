import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useProgressBar } from "../src";

describe("useProgressBar", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => useProgressBar(props))!;
    scope.stop();
    return result;
  };

  it("returns default props when no props are provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { progressBarProps } = run({});
    expect(progressBarProps.role).toBe("progressbar");
    expect(progressBarProps["aria-valuemin"]).toBe(0);
    expect(progressBarProps["aria-valuemax"]).toBe(100);
    expect(progressBarProps["aria-valuenow"]).toBe(0);
    expect(progressBarProps["aria-valuetext"]).toBe("0%");
    expect(progressBarProps["aria-label"]).toBeUndefined();
    expect(progressBarProps["aria-labelledby"]).toBeUndefined();
    expect(warn).toHaveBeenLastCalledWith(
      "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );
    warn.mockRestore();
  });

  it("supports labeling", () => {
    const { progressBarProps, labelProps } = run({ label: "Test" });
    expect(labelProps.id).toBeDefined();
    expect(progressBarProps["aria-labelledby"]).toBe(labelProps.id);
  });

  it("supports explicit values", () => {
    const { progressBarProps } = run({ value: 25, "aria-label": "mandatory label" });
    expect(progressBarProps["aria-valuenow"]).toBe(25);
    expect(progressBarProps["aria-valuetext"]).toBe("25%");
  });

  it("supports indeterminate mode", () => {
    const { progressBarProps } = run({ isIndeterminate: true, "aria-label": "mandatory label" });
    expect(progressBarProps["aria-valuemin"]).toBe(0);
    expect(progressBarProps["aria-valuemax"]).toBe(100);
    expect(progressBarProps["aria-valuenow"]).toBeUndefined();
    expect(progressBarProps["aria-valuetext"]).toBeUndefined();
  });

  it("supports custom value labels", () => {
    const { progressBarProps } = run({ value: 25, valueLabel: "¥25" });
    expect(progressBarProps["aria-valuenow"]).toBe(25);
    expect(progressBarProps["aria-valuetext"]).toBe("¥25");
  });
});
