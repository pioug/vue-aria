import { describe, expect, it } from "vitest";
import { effectScope } from "vue";
import { useViewportSize } from "../src/useViewportSize";

describe("useViewportSize", () => {
  it("returns current viewport dimensions", () => {
    const scope = effectScope();
    const size = scope.run(() => useViewportSize());

    expect(size?.value.width).toBeGreaterThanOrEqual(0);
    expect(size?.value.height).toBeGreaterThanOrEqual(0);

    scope.stop();
  });
});
