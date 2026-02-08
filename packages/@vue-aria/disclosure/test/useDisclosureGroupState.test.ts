import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useDisclosureGroupState } from "../src";

describe("useDisclosureGroupState", () => {
  it("initializes with empty expandedKeys when not provided", () => {
    const state = useDisclosureGroupState({});

    expect(state.expandedKeys.value.size).toBe(0);
  });

  it("initializes with defaultExpandedKeys when provided", () => {
    const state = useDisclosureGroupState({
      defaultExpandedKeys: ["item1"],
    });

    expect(state.expandedKeys.value.has("item1")).toBe(true);
    expect(state.expandedKeys.value.has("item2")).toBe(false);
  });

  it("initializes with multiple defaultExpandedKeys when allowsMultipleExpanded is true", () => {
    const state = useDisclosureGroupState({
      defaultExpandedKeys: ["item1", "item2"],
      allowsMultipleExpanded: true,
    });

    expect(state.expandedKeys.value.has("item1")).toBe(true);
    expect(state.expandedKeys.value.has("item2")).toBe(true);
  });

  it("supports controlled expandedKeys", () => {
    const expandedKeys = ref<Iterable<string>>(["item1"]);
    const state = useDisclosureGroupState({ expandedKeys });

    expect(state.expandedKeys.value.has("item1")).toBe(true);

    expandedKeys.value = ["item2"];

    expect(state.expandedKeys.value.has("item1")).toBe(false);
    expect(state.expandedKeys.value.has("item2")).toBe(true);
  });

  it("toggles keys correctly when allowsMultipleExpanded is false", () => {
    const state = useDisclosureGroupState({});

    state.toggleKey("item1");
    expect(state.expandedKeys.value.has("item1")).toBe(true);

    state.toggleKey("item2");
    expect(state.expandedKeys.value.has("item1")).toBe(false);
    expect(state.expandedKeys.value.has("item2")).toBe(true);
  });

  it("toggles keys correctly when allowsMultipleExpanded is true", () => {
    const state = useDisclosureGroupState({
      allowsMultipleExpanded: true,
    });

    state.toggleKey("item1");
    expect(state.expandedKeys.value.has("item1")).toBe(true);

    state.toggleKey("item2");
    expect(state.expandedKeys.value.has("item1")).toBe(true);
    expect(state.expandedKeys.value.has("item2")).toBe(true);
  });

  it("calls onExpandedChange when expanded keys change", () => {
    const onExpandedChange = vi.fn();
    const state = useDisclosureGroupState({ onExpandedChange });

    state.toggleKey("item1");

    expect(onExpandedChange).toHaveBeenCalledWith(new Set(["item1"]));
  });

  it("does not expand more than one key when allowsMultipleExpanded is false", () => {
    const state = useDisclosureGroupState({});

    state.toggleKey("item1");
    state.toggleKey("item2");

    expect(state.expandedKeys.value.size).toBe(1);
    expect(state.expandedKeys.value.has("item2")).toBe(true);
  });

  it("exposes isDisabled state", () => {
    const state = useDisclosureGroupState({ isDisabled: true });

    expect(state.isDisabled.value).toBe(true);
  });
});
