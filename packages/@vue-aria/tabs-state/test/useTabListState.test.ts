import { describe, expect, it, vi } from "vitest";
import { useTabListState } from "../src/useTabListState";

interface TabItem {
  id: string;
  label: string;
}

function createStateProps(overrides: Record<string, unknown> = {}) {
  const items: TabItem[] = [
    { id: "tab-1", label: "One" },
    { id: "tab-2", label: "Two" },
    { id: "tab-3", label: "Three" },
  ];

  return {
    items,
    getKey: (item: TabItem) => item.id,
    getTextValue: (item: TabItem) => item.label,
    ...overrides,
  };
}

describe("useTabListState", () => {
  it("selects the first enabled tab by default", () => {
    const state = useTabListState(createStateProps());

    expect(state.selectedKey).toBe("tab-1");
    expect(state.selectionManager.focusedKey).toBe("tab-1");
  });

  it("skips disabled keys for default selection", () => {
    const state = useTabListState(
      createStateProps({ disabledKeys: ["tab-1"] })
    );

    expect(state.selectedKey).toBe("tab-2");
    expect(state.selectionManager.focusedKey).toBe("tab-2");
  });

  it("forwards only non-null selection changes", () => {
    const onSelectionChange = vi.fn();
    const state = useTabListState(
      createStateProps({
        defaultSelectedKey: "tab-1",
        onSelectionChange,
      })
    );

    state.setSelectedKey("tab-2");
    state.setSelectedKey(null);

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("tab-2");
  });

  it("exposes list disabled state", () => {
    const state = useTabListState(createStateProps({ isDisabled: true }));
    expect(state.isDisabled).toBe(true);
  });
});
