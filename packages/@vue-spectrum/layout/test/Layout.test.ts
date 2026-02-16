import { describe, expect, it } from "vitest";
import {
  GridLayout,
  ListLayout,
  TableLayout,
  WaterfallLayout,
} from "../src";

describe("Layout", () => {
  it("re-exports layout classes", () => {
    expect(typeof GridLayout).toBe("function");
    expect(typeof ListLayout).toBe("function");
    expect(typeof TableLayout).toBe("function");
    expect(typeof WaterfallLayout).toBe("function");
  });
});
