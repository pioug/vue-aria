import { describe, expect, it } from "vitest";
import { useGridRowGroup } from "../src/useGridRowGroup";

describe("useGridRowGroup", () => {
  it("returns rowgroup role props", () => {
    const { rowGroupProps } = useGridRowGroup();
    expect(rowGroupProps.role).toBe("rowgroup");
  });
});
