import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { menuData } from "../src/utils";
import { useMenuItem } from "../src/useMenuItem";

function createCollection() {
  const keys = ["a", "b"];
  return {
    getKeys() {
      return keys.values();
    },
    getItem(key: string) {
      return {
        key,
        type: "item",
        value: null,
        level: 0,
        hasChildNodes: false,
        rendered: key,
        textValue: key,
        index: keys.indexOf(key),
        parentKey: null,
        prevKey: null,
        nextKey: null,
        firstChildKey: null,
        lastChildKey: null,
        props: {},
        colSpan: null,
        colIndex: null,
        childNodes: [],
      } as any;
    },
    getFirstKey() {
      return keys[0];
    },
    getLastKey() {
      return keys[keys.length - 1];
    },
    getKeyBefore(key: string) {
      const index = keys.indexOf(key);
      return index > 0 ? keys[index - 1] : null;
    },
    getKeyAfter(key: string) {
      const index = keys.indexOf(key);
      return index >= 0 && index < keys.length - 1 ? keys[index + 1] : null;
    },
  };
}

function createCollectionWithKeys(keys: string[]) {
  return {
    getKeys() {
      return keys.values();
    },
    getItem(key: string) {
      return {
        key,
        type: "item",
        value: null,
        level: 0,
        hasChildNodes: false,
        rendered: key,
        textValue: key,
        index: keys.indexOf(key),
        parentKey: null,
        prevKey: null,
        nextKey: null,
        firstChildKey: null,
        lastChildKey: null,
        props: {},
        colSpan: null,
        colIndex: null,
        childNodes: [],
      } as any;
    },
    getFirstKey() {
      return keys[0];
    },
    getLastKey() {
      return keys[keys.length - 1];
    },
    getKeyBefore(key: string) {
      const index = keys.indexOf(key);
      return index > 0 ? keys[index - 1] : null;
    },
    getKeyAfter(key: string) {
      const index = keys.indexOf(key);
      return index >= 0 && index < keys.length - 1 ? keys[index + 1] : null;
    },
  };
}

function createManager(selectionMode: "none" | "single" | "multiple" = "none") {
  const collection = createCollection();
  return {
    selectionMode,
    selectionBehavior: "toggle",
    disallowEmptySelection: false,
    selectedKeys: new Set(),
    isEmpty: false,
    isSelectAll: false,
    firstSelectedKey: null,
    lastSelectedKey: null,
    disabledKeys: new Set(),
    disabledBehavior: "all",
    isFocused: false,
    focusedKey: null,
    collection,
    isSelected: () => false,
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
  } as any;
}

describe("useMenuItem", () => {
  it("derives role from selection mode", () => {
    const ref = { current: document.createElement("li") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const singleManager = createManager("single");
    const singleState = {
      collection: singleManager.collection,
      disabledKeys: new Set(),
      selectionManager: singleManager,
    };

    const multiManager = createManager("multiple");
    const multiState = {
      collection: multiManager.collection,
      disabledKeys: new Set(),
      selectionManager: multiManager,
    };

    let singleRole: unknown;
    let multiRole: unknown;
    const scope = effectScope();
    scope.run(() => {
      singleRole = useMenuItem({ key: "a" }, singleState as any, ref).menuItemProps.role;
      multiRole = useMenuItem({ key: "a" }, multiState as any, ref).menuItemProps.role;
    });

    expect(singleRole).toBe("menuitemradio");
    expect(multiRole).toBe("menuitemcheckbox");

    scope.stop();
    ref.current?.remove();
  });

  it("calls local and shared actions and closes by default", () => {
    const localAction = vi.fn();
    const sharedAction = vi.fn();
    const onClose = vi.fn();
    const manager = createManager("none");
    const state = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };
    menuData.set(state as object, {
      onAction: sharedAction,
      onClose,
    });

    const ref = { current: document.createElement("li") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    let onClick: ((event: MouseEvent) => void) | undefined;
    const scope = effectScope();
    scope.run(() => {
      const { menuItemProps } = useMenuItem({ key: "a", onAction: localAction }, state as any, ref);
      onClick = menuItemProps.onClick as ((event: MouseEvent) => void) | undefined;
    });

    onClick?.({ currentTarget: ref.current, target: ref.current } as MouseEvent);

    expect(localAction).toHaveBeenCalledWith("a");
    expect(sharedAction).toHaveBeenCalledWith("a");
    expect(onClose).toHaveBeenCalled();

    scope.stop();
    ref.current?.remove();
  });

  it("respects shouldCloseOnSelect override and emits virtualized aria metadata", () => {
    const onClose = vi.fn();
    const manager = createManager("single");
    const state = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };
    menuData.set(state as object, { onClose });

    const ref = { current: document.createElement("li") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    let menuItemProps: Record<string, unknown> = {};
    const scope = effectScope();
    scope.run(() => {
      ({ menuItemProps } = useMenuItem(
        { key: "a", shouldCloseOnSelect: false, isVirtualized: true },
        state as any,
        ref
      ));
    });

    const onClick = menuItemProps.onClick as ((event: MouseEvent) => void) | undefined;
    onClick?.({ currentTarget: ref.current, target: ref.current } as MouseEvent);

    expect(menuItemProps["aria-posinset"]).toBe(1);
    expect(menuItemProps["aria-setsize"]).toBe(2);
    expect(onClose).not.toHaveBeenCalled();

    scope.stop();
    ref.current?.remove();
  });

  it("emits 1-based aria-posinset and full aria-setsize for virtualized items", () => {
    const collection = createCollectionWithKeys(["a", "b", "c"]);
    const manager = {
      ...createManager("single"),
      collection,
    } as any;
    const state = {
      collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };

    const refs = [
      { current: document.createElement("li") as HTMLElement | null },
      { current: document.createElement("li") as HTMLElement | null },
      { current: document.createElement("li") as HTMLElement | null },
    ];
    document.body.appendChild(refs[0].current as HTMLElement);
    document.body.appendChild(refs[1].current as HTMLElement);
    document.body.appendChild(refs[2].current as HTMLElement);

    const scope = effectScope();
    let firstProps: Record<string, unknown> = {};
    let secondProps: Record<string, unknown> = {};
    let thirdProps: Record<string, unknown> = {};
    scope.run(() => {
      firstProps = useMenuItem({ key: "a", isVirtualized: true }, state as any, refs[0]).menuItemProps;
      secondProps = useMenuItem({ key: "b", isVirtualized: true }, state as any, refs[1]).menuItemProps;
      thirdProps = useMenuItem({ key: "c", isVirtualized: true }, state as any, refs[2]).menuItemProps;
    });

    expect(firstProps["aria-posinset"]).toBe(1);
    expect(secondProps["aria-posinset"]).toBe(2);
    expect(thirdProps["aria-posinset"]).toBe(3);
    expect(firstProps["aria-setsize"]).toBe(3);
    expect(secondProps["aria-setsize"]).toBe(3);
    expect(thirdProps["aria-setsize"]).toBe(3);

    scope.stop();
    refs[0].current?.remove();
    refs[1].current?.remove();
    refs[2].current?.remove();
  });

  it("closes on Enter keyboard activation when selection mode is none", () => {
    const localAction = vi.fn();
    const onClose = vi.fn();
    const manager = createManager("none");
    const state = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };
    menuData.set(state as object, { onClose });

    const ref = { current: document.createElement("li") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    let menuItemProps: Record<string, unknown> = {};
    const scope = effectScope();
    scope.run(() => {
      ({ menuItemProps } = useMenuItem({ key: "a", onAction: localAction }, state as any, ref));
    });

    ref.current!.onclick = menuItemProps.onClick as ((event: MouseEvent) => void) | null;
    const onKeyDown = (menuItemProps.onKeyDown ?? menuItemProps.onKeydown) as ((event: any) => void) | undefined;
    onKeyDown?.({
      key: "Enter",
      repeat: false,
      target: ref.current,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      continuePropagation: vi.fn(),
    });

    expect(localAction).toHaveBeenCalledWith("a");
    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
    ref.current?.remove();
  });

  it("does not close on Space keyboard activation in multiple selection mode", () => {
    const localAction = vi.fn();
    const onClose = vi.fn();
    const manager = createManager("multiple");
    const state = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };
    menuData.set(state as object, { onClose });

    const ref = { current: document.createElement("li") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    let menuItemProps: Record<string, unknown> = {};
    const scope = effectScope();
    scope.run(() => {
      ({ menuItemProps } = useMenuItem({ key: "a", onAction: localAction }, state as any, ref));
    });

    ref.current!.onclick = menuItemProps.onClick as ((event: MouseEvent) => void) | null;
    const onKeyDown = (menuItemProps.onKeyDown ?? menuItemProps.onKeydown) as ((event: any) => void) | undefined;
    onKeyDown?.({
      key: " ",
      repeat: false,
      target: ref.current,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      continuePropagation: vi.fn(),
    });

    expect(localAction).toHaveBeenCalledWith("a");
    expect(onClose).not.toHaveBeenCalled();

    scope.stop();
    ref.current?.remove();
  });
});
