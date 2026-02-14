import { describe, expect, it } from "vitest";
import { intlMessages } from "../src/intlMessages";

describe("tree intlMessages", () => {
  it("includes upstream localized expand/collapse strings", () => {
    expect(intlMessages["en-US"]).toEqual({
      expand: "Expand",
      collapse: "Collapse",
    });
    expect(intlMessages["ar-AE"]).toEqual({
      collapse: "طي",
      expand: "تمديد",
    });
    expect(intlMessages["fr-FR"]).toEqual({
      collapse: "Réduire",
      expand: "Développer",
    });
  });

  it("contains the full upstream locale set", () => {
    expect(Object.keys(intlMessages).length).toBeGreaterThanOrEqual(34);
  });
});
