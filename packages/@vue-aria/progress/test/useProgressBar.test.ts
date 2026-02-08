import { describe, expect, it } from "vitest";
import { useProgressBar } from "../src/useProgressBar";

describe("useProgressBar", () => {
  it("returns default progress bar semantics", () => {
    const { progressBarProps } = useProgressBar({});

    expect(progressBarProps.value.role).toBe("progressbar");
    expect(progressBarProps.value["aria-valuemin"]).toBe(0);
    expect(progressBarProps.value["aria-valuemax"]).toBe(100);
    expect(progressBarProps.value["aria-valuenow"]).toBe(0);
    expect(progressBarProps.value["aria-valuetext"]).toBe("0%");
    expect(progressBarProps.value["aria-label"]).toBeUndefined();
    expect(progressBarProps.value["aria-labelledby"]).toBeUndefined();
  });

  it("supports visible labeling", () => {
    const { progressBarProps, labelProps } = useProgressBar({ label: "Test" });

    expect(labelProps.value.id).toBeDefined();
    expect(progressBarProps.value["aria-labelledby"]).toBe(labelProps.value.id);
  });

  it("supports value formatting", () => {
    const { progressBarProps } = useProgressBar({
      value: 25,
      "aria-label": "mandatory label",
    });

    expect(progressBarProps.value["aria-valuenow"]).toBe(25);
    expect(progressBarProps.value["aria-valuetext"]).toBe("25%");
  });

  it("supports indeterminate mode", () => {
    const { progressBarProps } = useProgressBar({
      isIndeterminate: true,
      "aria-label": "mandatory label",
    });

    expect(progressBarProps.value["aria-valuemin"]).toBe(0);
    expect(progressBarProps.value["aria-valuemax"]).toBe(100);
    expect(progressBarProps.value["aria-valuenow"]).toBeUndefined();
    expect(progressBarProps.value["aria-valuetext"]).toBeUndefined();
  });

  it("supports custom text value", () => {
    const { progressBarProps } = useProgressBar({
      value: 25,
      valueLabel: "¥25",
      "aria-label": "mandatory label",
    });

    expect(progressBarProps.value["aria-valuenow"]).toBe(25);
    expect(progressBarProps.value["aria-valuetext"]).toBe("¥25");
  });

  it("supports custom label content", () => {
    const { progressBarProps, labelProps } = useProgressBar({
      label: "React test",
      value: 25,
    });

    expect(progressBarProps.value["aria-labelledby"]).toBe(labelProps.value.id);
  });
});
