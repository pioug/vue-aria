import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { listData } from "../src/utils";
import { useOption } from "../src/useOption";
import type { ListState } from "../src/types";
import { setInteractionModality } from "@vue-aria/interactions";

function createCollection() {
  const keys = ["a", "b"];
  return {
    getItem(key: string) {
      return {
        key,
        index: keys.indexOf(key),
        props: {},
      } as any;
    },
    getFirstKey() {
      return keys[0];
    },
    getLastKey() {
      return keys[keys.length - 1];
    },
    getKeyBefore(key: string) {
      const idx = keys.indexOf(key);
      return idx > 0 ? keys[idx - 1] : null;
    },
    getKeyAfter(key: string) {
      const idx = keys.indexOf(key);
      return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : null;
    },
  };
}

function createManager(overrides: Partial<Record<string, unknown>> = {}) {
  const collection = createCollection();
  return {
    selectionMode: "multiple",
    selectionBehavior: "toggle",
    disallowEmptySelection: false,
    selectedKeys: new Set<string>(["a"]),
    isEmpty: false,
    isSelectAll: false,
    firstSelectedKey: "a",
    lastSelectedKey: "a",
    disabledKeys: new Set<string>(),
    disabledBehavior: "all",
    isFocused: true,
    focusedKey: "a",
    collection,
    isSelected: (key: string) => key === "a",
    isSelectionEqual: () => false,
    extendSelection: () => {},
    toggleSelection: () => {},
    replaceSelection: () => {},
    setSelectedKeys: () => {},
    selectAll: () => {},
    clearSelection: () => {},
    toggleSelectAll: () => {},
    select: () => {},
    canSelectItem: () => true,
    isDisabled: () => false,
    isLink: () => false,
    getItemProps: () => ({}),
    setFocused: () => {},
    setFocusedKey: () => {},
    ...overrides,
  } as any;
}

function getPointerEnterHandler(optionProps: Record<string, unknown>) {
  return (
    optionProps.onPointerenter ??
    optionProps.onPointerEnter ??
    optionProps.onMouseenter ??
    optionProps.onMouseEnter
  ) as
    | ((event: PointerEvent) => void)
    | undefined;
}

describe("useOption", () => {
  it("returns option props with virtualized metadata", () => {
    const manager = createManager();
    const state: ListState<unknown> = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };

    listData.set(state as ListState<unknown>, {
      id: "list-id",
      isVirtualized: true,
      shouldUseVirtualFocus: false,
      shouldSelectOnPressUp: false,
      shouldFocusOnHover: false,
      linkBehavior: "override",
    });

    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let optionProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ optionProps } = useOption({ key: "a" }, state, ref));
    });

    expect(optionProps.role).toBe("option");
    expect(optionProps["aria-selected"]).toBe(true);
    expect(optionProps["aria-posinset"]).toBe(1);
    expect(optionProps["aria-setsize"]).toBe(2);
    expect(optionProps.id).toBe("list-id-option-a");

    scope.stop();
    ref.current?.remove();
  });

  it("focuses hovered option when pointer modality is active and hover focus is enabled", () => {
    const focusCalls: boolean[] = [];
    const focusedKeyCalls: string[] = [];
    const manager = createManager({
      setFocused: (value: boolean) => {
        focusCalls.push(value);
      },
      setFocusedKey: (value: string) => {
        focusedKeyCalls.push(value);
      },
    });
    const state: ListState<unknown> = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };

    listData.set(state as ListState<unknown>, {
      id: "list-id",
      shouldFocusOnHover: true,
      linkBehavior: "override",
    });

    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let optionProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ optionProps } = useOption({ key: "a" }, state, ref));
    });

    setInteractionModality("pointer");
    const pointerEnter = getPointerEnterHandler(optionProps);
    expect(pointerEnter).toBeTypeOf("function");
    pointerEnter?.({
      currentTarget: ref.current,
      target: ref.current,
      pointerType: "mouse",
    } as unknown as PointerEvent);
    setInteractionModality("keyboard");

    expect(focusCalls).toEqual([true]);
    expect(focusedKeyCalls).toEqual(["a"]);

    scope.stop();
    ref.current?.remove();
  });

  it("does not focus hovered option when focus is already keyboard-visible", () => {
    const focusCalls: boolean[] = [];
    const focusedKeyCalls: string[] = [];
    const manager = createManager({
      setFocused: (value: boolean) => {
        focusCalls.push(value);
      },
      setFocusedKey: (value: string) => {
        focusedKeyCalls.push(value);
      },
    });
    const state: ListState<unknown> = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };

    listData.set(state as ListState<unknown>, {
      id: "list-id",
      shouldFocusOnHover: true,
      linkBehavior: "override",
    });

    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let optionProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ optionProps } = useOption({ key: "a" }, state, ref));
    });

    setInteractionModality("keyboard");
    const pointerEnter = getPointerEnterHandler(optionProps);
    pointerEnter?.({
      currentTarget: ref.current,
      target: ref.current,
      pointerType: "mouse",
    } as unknown as PointerEvent);

    expect(focusCalls).toEqual([]);
    expect(focusedKeyCalls).toEqual([]);

    scope.stop();
    ref.current?.remove();
  });

  it("keeps hover handlers disabled when shouldFocusOnHover is false", () => {
    const focusCalls: boolean[] = [];
    const focusedKeyCalls: string[] = [];
    const manager = createManager({
      setFocused: (value: boolean) => {
        focusCalls.push(value);
      },
      setFocusedKey: (value: string) => {
        focusedKeyCalls.push(value);
      },
    });
    const state: ListState<unknown> = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };

    listData.set(state as ListState<unknown>, {
      id: "list-id",
      shouldFocusOnHover: false,
      linkBehavior: "override",
    });

    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let optionProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ optionProps } = useOption({ key: "a" }, state, ref));
    });

    setInteractionModality("pointer");
    const pointerEnter = getPointerEnterHandler(optionProps);
    pointerEnter?.({
      currentTarget: ref.current,
      target: ref.current,
      pointerType: "mouse",
    } as unknown as PointerEvent);
    setInteractionModality("keyboard");

    expect(focusCalls).toEqual([]);
    expect(focusedKeyCalls).toEqual([]);

    scope.stop();
    ref.current?.remove();
  });
});
