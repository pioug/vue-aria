import { effectScope } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { menuData } from "../src/utils";
import { useMenu } from "../src/useMenu";

function createCollection() {
  const keys = ["a", "b"];
  return {
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

function createManager(collection: ReturnType<typeof createCollection>, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    selectionMode: "single",
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
    ...overrides,
  } as any;
}

function createKeyEvent(target: HTMLElement, key: string) {
  return {
    key,
    target,
    currentTarget: target,
    altKey: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as KeyboardEvent;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useMenu", () => {
  it("returns menu role props and stores shared menu data", () => {
    const collection = createCollection();
    const selectionManager = createManager(collection);
    const state = {
      collection,
      disabledKeys: new Set(),
      selectionManager,
    };
    const ref = { current: document.createElement("ul") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let menuProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuProps } = useMenu(
        {
          "aria-label": "Actions",
          onAction: () => {},
          onClose: () => {},
        },
        state as any,
        ref
      ));
    });

    expect(menuProps.role).toBe("menu");
    expect(menuData.get(state as object)?.onAction).toBeTypeOf("function");
    expect(menuData.get(state as object)?.onClose).toBeTypeOf("function");

    scope.stop();
    ref.current?.remove();
  });

  it("does not delegate Escape key when virtual focus is disabled", () => {
    const clearSelection = vi.fn();
    const collection = createCollection();
    const selectionManager = createManager(collection, { clearSelection });
    const state = {
      collection,
      disabledKeys: new Set(),
      selectionManager,
    };
    const ref = { current: document.createElement("ul") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let menuProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuProps } = useMenu({ "aria-label": "Actions" }, state as any, ref));
    });

    const onKeydown = menuProps.onKeydown as ((event: KeyboardEvent) => void) | undefined;
    onKeydown?.(createKeyEvent(ref.current as HTMLElement, "Escape"));
    expect(clearSelection).not.toHaveBeenCalled();

    scope.stop();
    ref.current?.remove();
  });

  it("warns when aria-label and aria-labelledby are both missing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const collection = createCollection();
    const selectionManager = createManager(collection);
    const state = {
      collection,
      disabledKeys: new Set(),
      selectionManager,
    };
    const ref = { current: document.createElement("ul") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    scope.run(() => {
      useMenu({}, state as any, ref);
    });

    expect(warnSpy).toHaveBeenCalled();

    scope.stop();
    ref.current?.remove();
  });
});
