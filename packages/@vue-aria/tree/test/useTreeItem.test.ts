import { beforeEach, describe, expect, it, vi } from "vitest";

const { useGridListItemMock, useLocalizedStringFormatterMock } = vi.hoisted(() => ({
  useGridListItemMock: vi.fn(() => ({
    rowProps: {
      id: "row-id",
      "aria-expanded": true,
    },
    gridCellProps: {
      role: "gridcell",
    },
    descriptionProps: {
      id: "description-id",
    },
    isPressed: false,
    isSelected: false,
    isFocused: false,
    isDisabled: false,
    allowsSelection: true,
    hasAction: false,
  })),
  useLocalizedStringFormatterMock: vi.fn(() => ({
    format: (key: string) => (key === "collapse" ? "Collapse" : "Expand"),
  })),
}));

vi.mock("@vue-aria/gridlist", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/gridlist")>(
    "@vue-aria/gridlist"
  );
  return {
    ...actual,
    useGridListItem: useGridListItemMock,
  };
});

vi.mock("@vue-aria/i18n", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/i18n")>(
    "@vue-aria/i18n"
  );
  return {
    ...actual,
    useLocalizedStringFormatter: useLocalizedStringFormatterMock,
  };
});

import { useTreeItem } from "../src/useTreeItem";

describe("useTreeItem", () => {
  beforeEach(() => {
    useGridListItemMock.mockClear();
    useLocalizedStringFormatterMock.mockClear();
    useGridListItemMock.mockReturnValue({
      rowProps: {
        id: "row-id",
        "aria-expanded": true,
      },
      gridCellProps: {
        role: "gridcell",
      },
      descriptionProps: {
        id: "description-id",
      },
      isPressed: false,
      isSelected: false,
      isFocused: false,
      isDisabled: false,
      allowsSelection: true,
      hasAction: false,
    });
  });

  it("returns expand button props and toggles expanded state", () => {
    const toggleKey = vi.fn();
    const setFocused = vi.fn();
    const setFocusedKey = vi.fn();
    const state = {
      toggleKey,
      selectionManager: {
        setFocused,
        setFocusedKey,
      },
    };
    const node = { key: "item-1" } as any;

    const result = useTreeItem(
      {
        node,
      },
      state as any,
      { current: document.createElement("div") as HTMLElement | null }
    );

    expect(useGridListItemMock).toHaveBeenCalledWith(
      {
        node,
      },
      state,
      { current: expect.any(HTMLElement) }
    );
    expect(result.expandButtonProps["aria-label"]).toBe("Collapse");
    expect(result.expandButtonProps["aria-labelledby"]).toContain("row-id");

    (result.expandButtonProps.onPress as () => void)();
    expect(toggleKey).toHaveBeenCalledWith("item-1");
    expect(setFocused).toHaveBeenCalledWith(true);
    expect(setFocusedKey).toHaveBeenCalledWith("item-1");
  });

  it("does not toggle when the row is disabled", () => {
    useGridListItemMock.mockReturnValueOnce({
      rowProps: {
        id: "row-id",
        "aria-expanded": false,
      },
      gridCellProps: {
        role: "gridcell",
      },
      descriptionProps: {
        id: "description-id",
      },
      isPressed: false,
      isSelected: false,
      isFocused: false,
      isDisabled: true,
      allowsSelection: false,
      hasAction: false,
    });

    const state = {
      toggleKey: vi.fn(),
      selectionManager: {
        setFocused: vi.fn(),
        setFocusedKey: vi.fn(),
      },
    };

    const result = useTreeItem(
      {
        node: { key: "item-1" } as any,
      },
      state as any,
      { current: document.createElement("div") as HTMLElement | null }
    );

    expect(result.expandButtonProps["aria-label"]).toBe("Expand");
    (result.expandButtonProps.onPress as () => void)();
    expect(state.toggleKey).not.toHaveBeenCalled();
  });
});
