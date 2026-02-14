import { describe, expect, it } from "vitest";
import { useGridListSection } from "../src/useGridListSection";

describe("useGridListSection", () => {
  it("returns row, rowheader, and rowgroup semantics", () => {
    const { rowProps, rowHeaderProps, rowGroupProps } = useGridListSection(
      {
        "aria-label": "Section label",
      },
      {} as any,
      { current: null }
    );

    expect(rowProps.role).toBe("row");
    expect(rowHeaderProps.role).toBe("rowheader");
    expect(rowGroupProps.role).toBe("rowgroup");
    expect(rowGroupProps["aria-label"]).toBe("Section label");
  });
});
