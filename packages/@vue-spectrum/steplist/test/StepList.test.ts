import { describe, expect, it } from "vitest";
import { Item, StepList, useStepList } from "../src";

describe("StepList", () => {
  it("re-exports step list API", () => {
    expect(typeof StepList).toBe("function");
    expect(typeof Item).toBe("function");
    expect(typeof useStepList).toBe("function");
  });
});
