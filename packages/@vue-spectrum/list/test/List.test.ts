import { describe, expect, it } from "vitest";
import { Item, List } from "../src";

describe("List", () => {
  it("re-exports list components", () => {
    expect(typeof List).toBe("function");
    expect(typeof Item).toBe("function");
  });
});
