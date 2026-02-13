import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { mergeRefs } from "../src/mergeRefs";

describe("mergeRefs", () => {
  it("merges object refs", () => {
    const ref1 = ref<HTMLElement | null>(null);
    const ref2 = ref<HTMLElement | null>(null);
    const node = document.createElement("div");

    const merged = mergeRefs(ref1, ref2) as (value: HTMLElement | null) => void;
    merged(node);

    expect(ref1.value).toBe(node);
    expect(ref2.value).toBe(node);
  });

  it("calls cleanup function when present", () => {
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);
    const objectRef = ref<HTMLElement | null>(null);
    const node = document.createElement("div");

    const merged = mergeRefs(objectRef, callback) as (value: HTMLElement | null) => void | (() => void);
    const dispose = merged(node);

    expect(callback).toHaveBeenCalledWith(node);
    expect(objectRef.value).toBe(node);

    if (typeof dispose === "function") {
      dispose();
    }

    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
