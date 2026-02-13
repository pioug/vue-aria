import { describe, expect, it } from "vitest";
import type { Key } from "@vue-aria/collections";
import { createTableState } from "./helpers";
import { getCellId, getColumnHeaderId, getRowLabelledBy, gridIds } from "../src/utils";

describe("table utils", () => {
  it("throws when grid id is unknown", () => {
    const state = createTableState();
    expect(() =>
      getColumnHeaderId(state, "name")
    ).toThrowError("Unknown grid");
  });

  it("generates normalized column and cell ids", () => {
    const state = createTableState();
    gridIds.set(state, "table-grid");

    expect(getColumnHeaderId(state, "column key" as Key)).toBe(
      "table-grid-columnkey"
    );
    expect(getCellId(state, "row key" as Key, "column key" as Key)).toBe(
      "table-grid-rowkey-columnkey"
    );
  });

  it("builds row labelledby from row header cells", () => {
    const state = createTableState();
    gridIds.set(state, "table-grid");

    expect(getRowLabelledBy(state, "row-1")).toBe("table-grid-row-1-name");
  });
});
