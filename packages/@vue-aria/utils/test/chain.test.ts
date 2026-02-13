import { describe, expect, it, vi } from "vitest";
import { chain } from "../src/chain";

describe("chain", () => {
  it("calls callbacks in order", () => {
    const calls: string[] = [];
    const a = vi.fn(() => calls.push("a"));
    const b = vi.fn(() => calls.push("b"));

    chain(a, undefined, b)();

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["a", "b"]);
  });
});
