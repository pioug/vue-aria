import { describe, expect, it } from "vitest";
import { useProgressCircle } from "../src/useProgressCircle";

describe("useProgressCircle", () => {
  it("returns progress circle semantics via progressbar attributes", () => {
    const { progressCircleProps } = useProgressCircle({
      label: "Upload",
      value: 60,
    });

    expect(progressCircleProps.value.role).toBe("progressbar");
    expect(progressCircleProps.value["aria-valuemin"]).toBe(0);
    expect(progressCircleProps.value["aria-valuemax"]).toBe(100);
    expect(progressCircleProps.value["aria-valuenow"]).toBe(60);
    expect(progressCircleProps.value["aria-valuetext"]).toBe("60%");
  });

  it("supports indeterminate circles", () => {
    const { progressCircleProps } = useProgressCircle({
      isIndeterminate: true,
      "aria-label": "Loading",
    });

    expect(progressCircleProps.value["aria-valuenow"]).toBeUndefined();
    expect(progressCircleProps.value["aria-valuetext"]).toBeUndefined();
  });
});
