import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useObjectRef } from "../src/useObjectRef";

describe("useObjectRef", () => {
  it("mirrors assigned values to object refs", () => {
    const forwarded = ref<HTMLInputElement | null>(null);
    const objectRef = useObjectRef(forwarded);
    const input = document.createElement("input");

    objectRef.value = input;

    expect(forwarded.value).toBe(input);
    expect(objectRef.value).toBe(input);
  });

  it("supports callback refs with cleanup", () => {
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);

    const objectRef = useObjectRef<HTMLInputElement>(callback);
    const input = document.createElement("input");
    objectRef.value = input;

    expect(callback).toHaveBeenCalledWith(input);

    objectRef.value = null;
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
