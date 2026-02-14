import { beforeEach, describe, expect, it, vi } from "vitest";
import { listMap } from "../src/utils";

const {
  useSelectableListMock,
  useGridSelectionAnnouncementMock,
  useHighlightSelectionDescriptionMock,
  useHasTabbableChildMock,
} = vi.hoisted(() => ({
  useSelectableListMock: vi.fn(() => ({
    listProps: {
      onKeydown: vi.fn(),
      tabIndex: -1,
    },
  })),
  useGridSelectionAnnouncementMock: vi.fn(),
  useHighlightSelectionDescriptionMock: vi.fn(() => ({
    "aria-describedby": "gridlist-description",
  })),
  useHasTabbableChildMock: vi.fn(() => false),
}));

vi.mock("@vue-aria/selection", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/selection")>(
    "@vue-aria/selection"
  );
  return {
    ...actual,
    useSelectableList: useSelectableListMock,
  };
});

vi.mock("@vue-aria/grid", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/grid")>(
    "@vue-aria/grid"
  );
  return {
    ...actual,
    useGridSelectionAnnouncement: useGridSelectionAnnouncementMock,
    useHighlightSelectionDescription: useHighlightSelectionDescriptionMock,
  };
});

vi.mock("@vue-aria/focus", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/focus")>(
    "@vue-aria/focus"
  );
  return {
    ...actual,
    useHasTabbableChild: useHasTabbableChildMock,
  };
});

import { useGridList } from "../src/useGridList";

function createState(overrides: Record<string, unknown> = {}) {
  return {
    collection: {
      size: 2,
      getFirstKey: vi.fn(() => null),
      getKeyAfter: vi.fn(() => null),
      getItem: vi.fn(() => null),
      getChildren: vi.fn(() => []),
      [Symbol.iterator]: function * iterator() {},
    },
    disabledKeys: new Set<string>(),
    selectionManager: {
      selectionMode: "multiple",
      selectionBehavior: "replace",
    },
    ...overrides,
  };
}

describe("useGridList", () => {
  beforeEach(() => {
    useSelectableListMock.mockClear();
    useGridSelectionAnnouncementMock.mockClear();
    useHighlightSelectionDescriptionMock.mockClear();
    useHasTabbableChildMock.mockReset();
    useHasTabbableChildMock.mockReturnValue(false);
  });

  it("returns grid props and stores shared list metadata", () => {
    const state = createState();
    const onAction = vi.fn();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { gridProps } = useGridList(
      {
        "aria-label": "Grid list",
        onAction,
      },
      state as any,
      ref
    );

    expect(gridProps.role).toBe("grid");
    expect(gridProps["aria-multiselectable"]).toBe("true");
    expect(gridProps.id).toBeTruthy();
    expect(gridProps["aria-describedby"]).toBe("gridlist-description");
    expect(useGridSelectionAnnouncementMock).toHaveBeenCalledTimes(1);

    const selectableCall = ((useSelectableListMock as any).mock.calls[0]?.[0]) as any;
    expect(selectableCall.selectionManager).toBe(state.selectionManager);
    expect(selectableCall.collection).toBe(state.collection);
    expect(selectableCall.ref).toBe(ref);

    const shared = listMap.get(state as object);
    expect(shared?.onAction).toBe(onAction);
    expect(shared?.keyboardNavigationBehavior).toBe("arrow");

    ref.current?.remove();
  });

  it("sets aria row and column counts for virtualized lists", () => {
    const state = createState();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { gridProps } = useGridList(
      {
        "aria-label": "Virtualized grid list",
        isVirtualized: true,
      },
      state as any,
      ref
    );

    expect(gridProps["aria-rowcount"]).toBe(2);
    expect(gridProps["aria-colcount"]).toBe(1);
    ref.current?.remove();
  });

  it("makes empty collections tabbable when there is no tabbable child", () => {
    const state = createState({
      collection: {
        size: 0,
        getFirstKey: vi.fn(() => null),
        getKeyAfter: vi.fn(() => null),
        getItem: vi.fn(() => null),
        getChildren: vi.fn(() => []),
        [Symbol.iterator]: function * iterator() {},
      },
    });
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { gridProps } = useGridList(
      {
        "aria-label": "Empty grid list",
      },
      state as any,
      ref
    );

    expect(gridProps.tabIndex).toBe(0);
    expect(useSelectableListMock).toHaveBeenCalledTimes(1);
    ref.current?.remove();
  });

  it("warns when no aria-label or aria-labelledby is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const state = createState();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    useGridList({}, state as any, ref);

    expect(warn).toHaveBeenCalledWith(
      "An aria-label or aria-labelledby prop is required for accessibility."
    );
    warn.mockRestore();
    ref.current?.remove();
  });
});
