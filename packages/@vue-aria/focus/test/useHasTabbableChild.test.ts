import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useHasTabbableChild } from "../src/useHasTabbableChild";

describe("useHasTabbableChild", () => {
  it("returns true when root has tabbable child", async () => {
    const root = document.createElement("div");
    const child = document.createElement("button");
    root.appendChild(child);

    const ref = { current: root as Element | null };

    const scope = effectScope();
    const result = scope.run(() => useHasTabbableChild(ref))!;

    await Promise.resolve();
    expect(result).toBe(true);

    scope.stop();
  });

  it("returns false when disabled", async () => {
    const root = document.createElement("div");
    const child = document.createElement("button");
    root.appendChild(child);

    const ref = { current: root as Element | null };

    const scope = effectScope();
    const result = scope.run(() => useHasTabbableChild(ref, { isDisabled: true }))!;

    await Promise.resolve();
    expect(result).toBe(false);

    scope.stop();
  });
});
