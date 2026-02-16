import { describe, expect, it } from "vitest";
import { Heading, Keyboard, Text } from "../src";

describe("Text", () => {
  it("re-exports text primitives", () => {
    expect(typeof Text).toBe("function");
    expect(typeof Heading).toBe("function");
    expect(typeof Keyboard).toBe("function");
  });
});
