import { describe, expect, it } from "vitest";
import { useToggleGroupState } from "../src/useToggleGroupState";

describe("useToggleGroupState", () => {
  it("toggles keys in multiple mode", () => {
    const state = useToggleGroupState({ selectionMode: "multiple" });

    state.toggleKey("a");
    state.toggleKey("b");

    expect(state.selectedKeys.has("a")).toBe(true);
    expect(state.selectedKeys.has("b")).toBe(true);

    state.toggleKey("a");
    expect(state.selectedKeys.has("a")).toBe(false);
  });

  it("enforces single selection", () => {
    const state = useToggleGroupState({ selectionMode: "single" });

    state.toggleKey("a");
    state.toggleKey("b");

    expect(state.selectedKeys.has("a")).toBe(false);
    expect(state.selectedKeys.has("b")).toBe(true);
  });
});
