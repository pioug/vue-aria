import { describe, expect, it, vi } from "vitest";
import { listMap } from "../src/utils";

const { useGridSelectionCheckboxMock } = vi.hoisted(() => ({
  useGridSelectionCheckboxMock: vi.fn(() => ({
    checkboxProps: {
      id: "checkbox-id",
      "aria-label": "Select",
      isSelected: false,
      isDisabled: false,
      onChange: vi.fn(),
    },
  })),
}));

vi.mock("@vue-aria/grid", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/grid")>("@vue-aria/grid");
  return {
    ...actual,
    useGridSelectionCheckbox: useGridSelectionCheckboxMock,
  };
});

import { useGridListSelectionCheckbox } from "../src/useGridListSelectionCheckbox";

describe("useGridListSelectionCheckbox", () => {
  it("extends checkbox labeling with the row id", () => {
    const state = {
      collection: {
        size: 1,
      },
      selectionManager: {},
    };
    listMap.set(state, {
      id: "list-id",
      keyboardNavigationBehavior: "arrow",
    });

    const { checkboxProps } = useGridListSelectionCheckbox(
      {
        key: "row 1",
      },
      state as any
    );

    expect(useGridSelectionCheckboxMock).toHaveBeenCalledWith(
      { key: "row 1" },
      state
    );
    expect(checkboxProps["aria-labelledby"]).toBe("checkbox-id list-id-row1");
  });

  it("supports tree-state objects as consumers", () => {
    const state = {
      collection: {
        size: 1,
      },
      selectionManager: {},
      expandedKeys: new Set<string>(),
      toggleKey: vi.fn(),
      setExpandedKeys: vi.fn(),
    };
    listMap.set(state, {
      id: "tree-id",
      keyboardNavigationBehavior: "arrow",
    });

    const { checkboxProps } = useGridListSelectionCheckbox(
      {
        key: "branch 1",
      },
      state as any
    );

    expect(useGridSelectionCheckboxMock).toHaveBeenCalledWith(
      { key: "branch 1" },
      state
    );
    expect(checkboxProps["aria-labelledby"]).toBe("checkbox-id tree-id-branch1");
  });
});
