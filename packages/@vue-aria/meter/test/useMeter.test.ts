import { describe, expect, it } from "vitest";
import { useMeter } from "../src/useMeter";

describe("useMeter", () => {
  it("returns meter semantics with progressbar fallback role", () => {
    const { meterProps } = useMeter({
      value: 25,
      "aria-label": "storage",
    });

    expect(meterProps.value.role).toBe("meter progressbar");
    expect(meterProps.value["aria-valuemin"]).toBe(0);
    expect(meterProps.value["aria-valuemax"]).toBe(100);
    expect(meterProps.value["aria-valuenow"]).toBe(25);
    expect(meterProps.value["aria-valuetext"]).toBe("25%");
  });

  it("supports visible labels", () => {
    const { meterProps, labelProps } = useMeter({
      label: "Storage usage",
      value: 25,
    });

    expect(labelProps.value.id).toBeDefined();
    expect(meterProps.value["aria-labelledby"]).toBe(labelProps.value.id);
  });

  it("supports custom valueLabel", () => {
    const { meterProps } = useMeter({
      value: 75,
      valueLabel: "75 of 100 GB",
      "aria-label": "storage",
    });

    expect(meterProps.value["aria-valuetext"]).toBe("75 of 100 GB");
  });
});
