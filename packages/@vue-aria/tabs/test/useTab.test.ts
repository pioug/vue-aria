import { beforeEach, describe, expect, it, vi } from "vitest";
import { tabsIds } from "../src/utils";

const { useSelectableItemMock, useFocusableMock } = vi.hoisted(() => ({
  useSelectableItemMock: vi.fn<any>(() => ({
    itemProps: {
      tabIndex: 0,
    },
    isPressed: false,
  })),
  useFocusableMock: vi.fn<any>(() => ({
    focusableProps: {
      onFocus: vi.fn(),
    },
  })),
}));

vi.mock("@vue-aria/selection", () => ({
  useSelectableItem: useSelectableItemMock,
}));

vi.mock("@vue-aria/interactions", () => ({
  useFocusable: useFocusableMock,
}));

import { useTab } from "../src/useTab";

function createState(overrides: Record<string, unknown> = {}) {
  return {
    selectedKey: "tab 1",
    isDisabled: false,
    selectionManager: {
      isDisabled: vi.fn(() => false),
    },
    collection: {
      getItem: vi.fn(() => ({
        props: {
          id: "user-provided-id",
          "aria-label": "History tab",
          href: "/history",
        },
      })),
    },
    ...overrides,
  };
}

describe("useTab", () => {
  beforeEach(() => {
    useSelectableItemMock.mockReset();
    useSelectableItemMock.mockReturnValue({
      itemProps: {
        tabIndex: 0,
      },
      isPressed: false,
    });
    useFocusableMock.mockReset();
    useFocusableMock.mockReturnValue({
      focusableProps: {
        onFocus: vi.fn(),
      },
    });
  });

  it("returns selected tab props linked to tabpanel ids", () => {
    const state = createState();
    tabsIds.set(state as any, "tabs-id");
    const ref = { current: document.createElement("button") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { tabProps, isSelected, isDisabled, isPressed } = useTab(
      { key: "tab 1" },
      state as any,
      ref
    );

    expect(useSelectableItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "tab 1",
        ref,
        isDisabled: false,
        linkBehavior: "selection",
      })
    );
    expect(tabProps.id).toBe("tabs-id-tab-tab1");
    expect(tabProps.role).toBe("tab");
    expect(tabProps["aria-selected"]).toBe(true);
    expect(tabProps["aria-controls"]).toBe("tabs-id-tabpanel-tab1");
    expect(tabProps["aria-disabled"]).toBeUndefined();
    expect(tabProps.tabIndex).toBe(0);
    expect(isSelected).toBe(true);
    expect(isDisabled).toBe(false);
    expect(isPressed).toBe(false);

    const focusableRef = useFocusableMock.mock.calls[0]?.[1] as
      | { value: HTMLElement | null }
      | undefined;
    expect(focusableRef).toBeDefined();
    if (!focusableRef) {
      throw new Error("Expected useFocusable ref argument");
    }
    expect(focusableRef.value).toBe(ref.current);
    const replacement = document.createElement("a");
    focusableRef.value = replacement;
    expect(ref.current).toBe(replacement);

    ref.current?.remove();
  });

  it("returns disabled tab props when disabled from state or props", () => {
    useSelectableItemMock.mockReturnValueOnce({
      itemProps: {},
      isPressed: false,
    });
    const state = createState({
      selectedKey: "tab 1",
      selectionManager: {
        isDisabled: vi.fn((key: string) => key === "tab-2"),
      },
    });
    tabsIds.set(state as any, "tabs-id");
    const ref = { current: document.createElement("button") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { tabProps, isSelected, isDisabled } = useTab(
      { key: "tab-2", isDisabled: true },
      state as any,
      ref
    );

    expect(tabProps["aria-selected"]).toBe(false);
    expect(tabProps["aria-controls"]).toBeUndefined();
    expect(tabProps["aria-disabled"]).toBe(true);
    expect(tabProps.tabIndex).toBeUndefined();
    expect(isSelected).toBe(false);
    expect(isDisabled).toBe(true);

    ref.current?.remove();
  });
});
