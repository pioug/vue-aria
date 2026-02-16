import { describe, expect, it } from "vitest";
import { Well } from "../src";

describe("Well", () => {
  it("re-exports well component", () => {
    expect(typeof Well).toBe("function");
  });
});
