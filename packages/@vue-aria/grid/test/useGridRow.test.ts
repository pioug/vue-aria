import { beforeEach, describe, expect, it, vi } from "vitest";
import { gridMap } from "../src/utils";

const { useSelectableItemMock } = vi.hoisted(() => ({
  useSelectableItemMock: vi.fn<any>(() => ({
    itemProps: {
      tabIndex: 0,
    },
    isPressed: false,
    isSelected: false,
    isFocused: false,
    isDisabled: false,
    allowsSelection: true,
    hasAction: true,
  })),
}));

vi.mock("@vue-aria/selection", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/selection")>(
    "@vue-aria/selection"
  );
  return {
    ...actual,
    useSelectableItem: useSelectableItemMock,
  };
});

import { useGridRow } from "../src/useGridRow";

function createState(overrides: Record<string, unknown> = {}) {
  return {
    collection: {
      size: 1,
    },
    selectionManager: {
      selectionMode: "single",
      isSelected: vi.fn(() => true),
      isDisabled: vi.fn(() => false),
    },
    ...overrides,
  };
}

describe("useGridRow", () => {
  beforeEach(() => {
    useSelectableItemMock.mockReset();
    useSelectableItemMock.mockReturnValue({
      itemProps: {
        tabIndex: 0,
      },
      isPressed: false,
      isSelected: false,
      isFocused: false,
      isDisabled: false,
      allowsSelection: true,
      hasAction: true,
    });
  });

  it("returns row props and wires actions from gridMap", () => {
    const onRowAction = vi.fn();
    const onNodeAction = vi.fn();
    const state = createState();
    const node = {
      key: "row-1",
      index: 0,
      props: {
        onAction: onNodeAction,
      },
    };
    const ref = { current: document.createElement("div") as HTMLElement | null };
    gridMap.set(state as any, {
      actions: {
        onRowAction,
      },
      shouldSelectOnPressUp: true,
    });

    const { rowProps } = useGridRow(
      {
        node: node as any,
        isVirtualized: true,
      },
      state as any,
      ref
    );

    expect(useSelectableItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "row-1",
        shouldSelectOnPressUp: true,
        isDisabled: false,
      })
    );

    const passedAction = (useSelectableItemMock.mock.calls[0]?.[0] as any)?.onAction as
      | (() => void)
      | undefined;
    expect(passedAction).toBeTypeOf("function");
    passedAction?.();
    expect(onRowAction).toHaveBeenCalledWith("row-1");
    expect(onNodeAction).toHaveBeenCalledTimes(1);

    expect(rowProps.role).toBe("row");
    expect(rowProps["aria-selected"]).toBe(true);
    expect(rowProps["aria-rowindex"]).toBe(1);
  });

  it("does not set aria-selected in selectionMode none and disables empty collection rows", () => {
    const state = createState({
      collection: {
        size: 0,
      },
      selectionManager: {
        selectionMode: "none",
        isSelected: vi.fn(() => false),
        isDisabled: vi.fn(() => false),
      },
    });

    useSelectableItemMock.mockReturnValueOnce({
      itemProps: {},
      isPressed: false,
      isSelected: false,
      isFocused: false,
      isDisabled: true,
      allowsSelection: false,
      hasAction: false,
    });

    const { rowProps } = useGridRow(
      {
        node: {
          key: "row-1",
          index: 0,
        } as any,
      },
      state as any,
      { current: document.createElement("div") as HTMLElement | null }
    );

    expect(useSelectableItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isDisabled: true,
      })
    );
    expect(rowProps["aria-selected"]).toBeUndefined();
    expect(rowProps["aria-disabled"]).toBe(true);
  });

  it("updates aria-selected from the latest selection manager state", () => {
    const isSelected = vi.fn(() => false);
    const selectionManager = {
      selectionMode: "single",
      isSelected,
    };
    const state = createState({
      selectionManager,
    });

    const { rowProps } = useGridRow(
      {
        node: {
          key: "row-1",
          index: 0,
        } as any,
      },
      state as any,
      { current: document.createElement("div") as HTMLElement | null }
    );

    expect(rowProps["aria-selected"]).toBe(false);

    isSelected.mockReturnValue(true);
    expect(rowProps["aria-selected"]).toBe(true);
  });

  it("updates aria-disabled from the latest selection manager state", () => {
    const isDisabled = vi.fn(() => false);
    const state = createState({
      selectionManager: {
        selectionMode: "single",
        isSelected: vi.fn(() => false),
        isDisabled,
      },
    });

    const { rowProps } = useGridRow(
      {
        node: {
          key: "row-1",
          index: 0,
        } as any,
      },
      state as any,
      { current: document.createElement("div") as HTMLElement | null }
    );

    expect(rowProps["aria-disabled"]).toBeUndefined();

    isDisabled.mockReturnValue(true);
    expect(rowProps["aria-disabled"]).toBe(true);
  });
});
