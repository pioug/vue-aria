import { describe, expect, it } from "vitest";
import { nodeContains } from "../src/nodeContains";

describe("nodeContains", () => {
  it("returns true for contained descendants", () => {
    const parent = document.createElement("div");
    const child = document.createElement("button");
    parent.appendChild(child);

    expect(nodeContains(parent, child)).toBe(true);
  });

  it("returns false for null/non-node values", () => {
    const parent = document.createElement("div");
    const outside = document.createElement("span");

    expect(nodeContains(parent, outside)).toBe(false);
    expect(nodeContains(parent, null)).toBe(false);
    expect(nodeContains(null, outside)).toBe(false);
    expect(nodeContains(parent, "text" as unknown as EventTarget)).toBe(false);
  });
});
