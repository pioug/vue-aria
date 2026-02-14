import { beforeEach, describe, expect, it, vi } from "vitest";
import { gridMap } from "../src/utils";
import { GridKeyboardDelegate } from "../src/GridKeyboardDelegate";

const {
  useSelectableCollectionMock,
  useGridSelectionAnnouncementMock,
  useHighlightSelectionDescriptionMock,
} = vi.hoisted(() => ({
  useSelectableCollectionMock: vi.fn(() => ({
    collectionProps: {
      onBlur: vi.fn(),
      onKeydown: vi.fn(),
    },
  })),
  useGridSelectionAnnouncementMock: vi.fn(),
  useHighlightSelectionDescriptionMock: vi.fn(() => ({
    "aria-describedby": "grid-description-id",
  })),
}));

vi.mock("@vue-aria/selection", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/selection")>(
    "@vue-aria/selection"
  );
  return {
    ...actual,
    useSelectableCollection: useSelectableCollectionMock,
  };
});

vi.mock("../src/useGridSelectionAnnouncement", () => ({
  useGridSelectionAnnouncement: useGridSelectionAnnouncementMock,
}));

vi.mock("../src/useHighlightSelectionDescription", () => ({
  useHighlightSelectionDescription: useHighlightSelectionDescriptionMock,
}));

import { useGrid } from "../src/useGrid";

function createState(overrides: Record<string, unknown> = {}) {
  return {
    collection: {
      size: 2,
      columnCount: 3,
      getItem: vi.fn(() => null),
      getFirstKey: vi.fn(() => null),
      getLastKey: vi.fn(() => null),
      getKeyAfter: vi.fn(() => null),
      getKeyBefore: vi.fn(() => null),
      getChildren: vi.fn(() => []),
    },
    disabledKeys: new Set<string>(),
    isKeyboardNavigationDisabled: false,
    selectionManager: {
      selectionMode: "multiple",
      disabledBehavior: "all",
      isFocused: false,
      setFocused: vi.fn(),
      focusedKey: null,
      firstSelectedKey: null,
      lastSelectedKey: null,
      isSelected: vi.fn(() => false),
      canSelectItem: vi.fn(() => true),
      rawSelection: new Set<string>(),
      selectedKeys: new Set<string>(),
      selectionBehavior: "replace",
    },
    ...overrides,
  };
}

describe("useGrid", () => {
  beforeEach(() => {
    useSelectableCollectionMock.mockClear();
    useGridSelectionAnnouncementMock.mockClear();
    useHighlightSelectionDescriptionMock.mockClear();
  });

  it("returns grid props and registers shared grid data", () => {
    const state = createState();
    const onRowAction = vi.fn();
    const onCellAction = vi.fn();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { gridProps } = useGrid(
      {
        "aria-label": "Data grid",
        onRowAction,
        onCellAction,
      },
      state as any,
      ref
    );

    expect(gridProps.role).toBe("grid");
    expect(gridProps["aria-multiselectable"]).toBe("true");
    expect(gridProps.id).toBeTruthy();
    expect(gridProps["aria-describedby"]).toBe("grid-description-id");

    const selectableCall = ((useSelectableCollectionMock as any).mock.calls[0]?.[0]) as any;
    expect(selectableCall.selectionManager).toBe(state.selectionManager);
    expect(selectableCall.ref).toBe(ref);
    expect(selectableCall.keyboardDelegate).toBeInstanceOf(GridKeyboardDelegate);

    const shared = gridMap.get(state as any);
    expect(shared?.actions.onRowAction).toBe(onRowAction);
    expect(shared?.actions.onCellAction).toBe(onCellAction);
    expect(useGridSelectionAnnouncementMock).toHaveBeenCalledTimes(1);

    ref.current?.remove();
  });

  it("adds virtualized row/column counts", () => {
    const state = createState();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { gridProps } = useGrid(
      {
        "aria-label": "Virtualized grid",
        isVirtualized: true,
      },
      state as any,
      ref
    );

    expect(gridProps["aria-rowcount"]).toBe(2);
    expect(gridProps["aria-colcount"]).toBe(3);
    ref.current?.remove();
  });

  it("warns when no aria-label or aria-labelledby is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const state = createState();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    useGrid({}, state as any, ref);

    expect(warn).toHaveBeenCalledWith(
      "An aria-label or aria-labelledby prop is required for accessibility."
    );
    warn.mockRestore();
    ref.current?.remove();
  });

  it("forwards selection keyboard options to selectable collection", () => {
    const state = createState();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    useGrid(
      {
        "aria-label": "Grid",
        disallowSelectAll: true,
        disallowTypeAhead: true,
        escapeKeyBehavior: "none",
      },
      state as any,
      ref
    );

    const selectableCall = ((useSelectableCollectionMock as any).mock.calls[0]?.[0]) as any;
    expect(selectableCall.disallowSelectAll).toBe(true);
    expect(selectableCall.disallowTypeAhead).toBe(true);
    expect(selectableCall.escapeKeyBehavior).toBe("none");
    ref.current?.remove();
  });

  it("forwards shouldSelectOnPressUp to shared grid data", () => {
    const state = createState();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    useGrid(
      {
        "aria-label": "Grid",
        shouldSelectOnPressUp: true,
      },
      state as any,
      ref
    );

    const shared = gridMap.get(state as any);
    expect(shared?.shouldSelectOnPressUp).toBe(true);
    ref.current?.remove();
  });
});
