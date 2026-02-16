import { describe, expect, it } from "vitest";
import { useTag, useTagGroup } from "../src";

describe("Tag", () => {
  it("re-exports tag hooks", () => {
    expect(typeof useTag).toBe("function");
    expect(typeof useTagGroup).toBe("function");
  });
});
