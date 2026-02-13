import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useToastRegion } from "../src";

describe("useToastRegion", () => {
  const run = (props: Record<string, unknown>, state: any) => {
    const scope = effectScope();
    const regionElement = document.createElement("section");
    document.body.append(regionElement);
    const result = scope.run(() =>
      useToastRegion(props as any, state, { current: regionElement as HTMLElement | null })
    )!;
    return {
      ...result,
      cleanup() {
        scope.stop();
        regionElement.remove();
      },
    };
  };

  it("returns region props", () => {
    const state = {
      visibleToasts: [],
      pauseAll: vi.fn(),
      resumeAll: vi.fn(),
    };
    const { regionProps, cleanup } = run({ "aria-label": "Notifications" }, state);
    expect(regionProps.role).toBe("region");
    expect(regionProps["aria-label"]).toBe("Notifications");
    expect(regionProps.tabIndex).toBe(-1);
    expect(regionProps["data-react-aria-top-layer"]).toBe(true);
    cleanup();
  });
});
