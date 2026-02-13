import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useSeparator } from "../src";

describe("useSeparator", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => useSeparator(props))!;
    scope.stop();
    return result;
  };

  it("defaults to role=separator without aria-orientation", () => {
    const { separatorProps } = run({});
    expect(separatorProps.role).toBe("separator");
    expect(separatorProps["aria-orientation"]).toBeUndefined();
  });

  it("sets aria-orientation for vertical separators", () => {
    const { separatorProps } = run({ orientation: "vertical" });
    expect(separatorProps.role).toBe("separator");
    expect(separatorProps["aria-orientation"]).toBe("vertical");
  });

  it("does not set role for hr elements", () => {
    const { separatorProps } = run({ elementType: "hr" });
    expect(separatorProps.role).toBeUndefined();
  });
});
