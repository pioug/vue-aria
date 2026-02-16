import { describe, expect, it } from "vitest";
import { pointerMap, testSetup, User } from "../src";

describe("Test utils", () => {
  it("re-exports testing utilities", () => {
    expect(typeof testSetup).toBe("function");
    expect(typeof User).toBe("function");
    expect(typeof pointerMap).toBe("object");
  });
});
