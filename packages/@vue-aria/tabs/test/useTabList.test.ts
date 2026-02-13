import { describe, expect, it, vi, beforeEach } from "vitest";
import { tabsIds } from "../src/utils";

const { localeRef, useSelectableCollectionMock } = vi.hoisted(() => ({
  localeRef: {
    value: {
      locale: "en-US",
      direction: "ltr" as "ltr" | "rtl",
    },
  },
  useSelectableCollectionMock: vi.fn<any>(() => ({
    collectionProps: {
      onKeydown: vi.fn(),
    },
  })),
}));

vi.mock("@vue-aria/i18n", () => ({
  useLocale: () => localeRef,
}));

vi.mock("@vue-aria/selection", () => ({
  useSelectableCollection: useSelectableCollectionMock,
}));

import { useTabList } from "../src/useTabList";

function createState() {
  const keys = ["a", "b"];
  return {
    collection: {
      getFirstKey: () => keys[0],
      getLastKey: () => keys[keys.length - 1],
      getKeyAfter(key: string) {
        const index = keys.indexOf(key);
        return index >= 0 && index < keys.length - 1 ? keys[index + 1] : null;
      },
      getKeyBefore(key: string) {
        const index = keys.indexOf(key);
        return index > 0 ? keys[index - 1] : null;
      },
      getItem: () => ({ props: {} }),
    },
    selectionManager: {},
    disabledKeys: new Set<string>(),
  };
}

describe("useTabList", () => {
  beforeEach(() => {
    localeRef.value = { locale: "en-US", direction: "ltr" };
    useSelectableCollectionMock.mockClear();
  });

  it("returns tablist props and automatic keyboard activation by default", () => {
    const state = createState();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { tabListProps } = useTabList(
      { "aria-label": "History tabs" },
      state as any,
      ref
    );

    expect(useSelectableCollectionMock).toHaveBeenCalledTimes(1);
    expect(useSelectableCollectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ref,
        scrollRef: ref,
        selectionManager: state.selectionManager,
        selectOnFocus: true,
        disallowEmptySelection: true,
        linkBehavior: "selection",
      })
    );

    expect(tabListProps.role).toBe("tablist");
    expect(tabListProps["aria-orientation"]).toBe("horizontal");
    expect(tabListProps["aria-label"]).toBe("History tabs");
    expect(tabListProps.tabIndex).toBeUndefined();
    expect(tabsIds.get(state as any)).toBeTypeOf("string");

    ref.current?.remove();
  });

  it("respects manual keyboard activation and rtl keyboard delegate", () => {
    localeRef.value = { locale: "ar-AE", direction: "rtl" };
    const state = createState();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    useTabList(
      {
        keyboardActivation: "manual",
        orientation: "horizontal",
      },
      state as any,
      ref
    );

    const delegate = (useSelectableCollectionMock.mock.calls[0]?.[0] as any)?.keyboardDelegate;
    expect(useSelectableCollectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        selectOnFocus: false,
      })
    );
    expect(delegate.getKeyRightOf("a")).toBe("b");
    expect(delegate.getKeyLeftOf("a")).toBe("b");

    ref.current?.remove();
  });
});
