import { describe, expect, it } from "vitest";
import { ErrorBoundary, generatePowerset } from "../src";

describe("Story utils", () => {
  it("supports helper exports", () => {
    expect(typeof ErrorBoundary).toBe("function");
    expect(generatePowerset([1, 2])).toEqual([[], [1], [2], [1, 2]]);
  });
});
