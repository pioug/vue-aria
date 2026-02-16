import { describe, expect, it } from "vitest";
import * as exported from "../src";

describe("@vue-types", () => {
  it("has exportable definitions", () => {
    expect(typeof exported).toBe("object");
  });
});
