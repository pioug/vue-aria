import { describe, expect, it } from "vitest";
import { getRowId, listMap, normalizeKey } from "../src/utils";

describe("gridlist utils", () => {
  it("normalizes string and numeric keys", () => {
    expect(normalizeKey(" row 1 ")).toBe("row1");
    expect(normalizeKey(42)).toBe("42");
  });

  it("builds row ids from shared list map data", () => {
    const state = {};
    listMap.set(state, {
      id: "list-id",
      keyboardNavigationBehavior: "arrow",
    });

    expect(getRowId(state, "row 1")).toBe("list-id-row1");
  });

  it("throws when row id is requested without shared list data", () => {
    expect(() => getRowId({}, "row-1")).toThrowError("Unknown list");
  });
});
