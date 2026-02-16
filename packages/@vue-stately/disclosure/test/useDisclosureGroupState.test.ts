import { describe, expect, it, vi } from "vitest";
import { useDisclosureGroupState } from "../src";

describe("useDisclosureGroupState", () => {
  it("defaults to single-expanded behavior", () => {
    const state = useDisclosureGroupState({
      defaultExpandedKeys: ["one", "two"],
    });

    expect(Array.from(state.expandedKeys)).toEqual(["one"]);
  });

  it("supports controlled expansion updates", () => {
    const onExpandedChange = vi.fn();
    const state = useDisclosureGroupState({
      defaultExpandedKeys: ["one"],
      allowsMultipleExpanded: true,
      onExpandedChange,
    });

    state.toggleKey("two");
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(["one", "two"]));
    expect(state.expandedKeys).toEqual(new Set(["one", "two"]));
  });

  it("replaces expanded keys", () => {
    const state = useDisclosureGroupState({
      defaultExpandedKeys: ["one"],
      onExpandedChange: vi.fn(),
    });

    state.setExpandedKeys(new Set(["two"]));
    expect(state.expandedKeys).toEqual(new Set(["two"]));
  });
});
