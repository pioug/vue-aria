import { describe, expect, it } from "vitest";
import * as Overlays from "../src";

describe("Overlays", () => {
  it("re-exports overlay hooks", () => {
    expect(typeof Overlays).toBe("object");
    expect(Object.keys(Overlays).length).toBeGreaterThan(0);
  });
});
