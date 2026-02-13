import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useMeter } from "../src";

describe("useMeter", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => useMeter(props))!;
    scope.stop();
    return result;
  };

  it("returns meter role fallback token list", () => {
    const { meterProps } = run({ "aria-label": "Storage" });
    expect(meterProps.role).toBe("meter progressbar");
    expect(meterProps["aria-valuemin"]).toBe(0);
    expect(meterProps["aria-valuemax"]).toBe(100);
  });

  it("forwards computed value attributes", () => {
    const { meterProps } = run({ value: 25, "aria-label": "Storage" });
    expect(meterProps["aria-valuenow"]).toBe(25);
    expect(meterProps["aria-valuetext"]).toBe("25%");
  });
});
