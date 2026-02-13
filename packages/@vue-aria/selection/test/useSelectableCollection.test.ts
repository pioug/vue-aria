import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useSelectableCollection } from "../src/useSelectableCollection";
import type { Key, MultipleSelectionManager } from "@vue-aria/selection-state";
import type { KeyboardDelegate } from "../src/types";

vi.mock("@vue-aria/i18n", () => ({
  useLocale: () => ref({ locale: "en-US", direction: "ltr" }),
}));

const { focusSafely, getInteractionModality } = vi.hoisted(() => ({
  focusSafely: vi.fn(),
  getInteractionModality: vi.fn(() => "keyboard"),
}));
vi.mock("@vue-aria/interactions", () => ({
  getInteractionModality,
  focusSafely,
}));

function createManager(overrides: Partial<MultipleSelectionManager> = {}): MultipleSelectionManager {
  let focused = false;
  let focusedKey: Key | null = null;
  const manager: MultipleSelectionManager = {
    selectionMode: "multiple",
    selectionBehavior: "replace",
    disallowEmptySelection: false,
    selectedKeys: new Set<Key>(),
    isEmpty: true,
    isSelectAll: false,
    firstSelectedKey: null,
    lastSelectedKey: null,
    disabledKeys: new Set<Key>(),
    disabledBehavior: "all",
    get focusedKey() {
      return focusedKey;
    },
    get isFocused() {
      return focused;
    },
    childFocusStrategy: null,
    collection: {
      getItem: () => null,
      getFirstKey: () => null,
      getKeyAfter: () => null,
      getChildren: function* () {},
    },
    setFocused: vi.fn((nextFocused: boolean) => {
      focused = nextFocused;
    }),
    setFocusedKey: vi.fn((key: Key | null) => {
      focusedKey = key;
    }),
    isSelected: vi.fn(() => false),
    isSelectionEqual: vi.fn(() => false),
    extendSelection: vi.fn(),
    toggleSelection: vi.fn(),
    replaceSelection: vi.fn(),
    setSelectedKeys: vi.fn(),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
    toggleSelectAll: vi.fn(),
    select: vi.fn(),
    canSelectItem: vi.fn(() => true),
    isDisabled: vi.fn(() => false),
    isLink: vi.fn(() => false),
    getItemProps: vi.fn(() => ({})),
    ...overrides,
  };

  return manager;
}

const delegate: KeyboardDelegate = {
  getKeyBelow: () => "b",
  getKeyAbove: () => "a",
  getKeyLeftOf: () => "a",
  getKeyRightOf: () => "b",
  getFirstKey: () => "a",
  getLastKey: () => "z",
  getKeyPageBelow: () => "p",
  getKeyPageAbove: () => "o",
  getKeyForSearch: () => null,
};

describe("useSelectableCollection", () => {
  beforeEach(() => {
    getInteractionModality.mockReturnValue("keyboard");
  });

  it("handles arrow navigation and focus selection", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: ref.current });

      onKeydown(event);

      expect(manager.setFocusedKey).toHaveBeenCalledWith("a", undefined);
      expect(manager.replaceSelection).toHaveBeenCalledWith("a");
    } finally {
      scope.stop();
    }
  });

  it("supports select all shortcut", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: ref.current });

      onKeydown(event);

      expect(manager.selectAll).toHaveBeenCalledTimes(1);
    } finally {
      scope.stop();
    }
  });

  it("does not select all when disallowSelectAll is enabled", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        disallowSelectAll: true,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: ref.current });

      onKeydown(event);
      expect(manager.selectAll).not.toHaveBeenCalled();
    } finally {
      scope.stop();
    }
  });

  it("prevents default on Alt+Tab keyboard events", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = {
        key: "Tab",
        altKey: true,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        target: ref.current,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as KeyboardEvent;

      onKeydown(event);
      expect((event.preventDefault as any).mock.calls.length).toBe(1);
    } finally {
      scope.stop();
    }
  });

  it("clears selection on Escape when allowed", () => {
    const manager = createManager({
      isEmpty: false,
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = {
        key: "Escape",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        target: ref.current,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as KeyboardEvent;

      onKeydown(event);

      expect(manager.clearSelection).toHaveBeenCalledTimes(1);
      expect((event.preventDefault as any).mock.calls.length).toBe(1);
      expect((event.stopPropagation as any).mock.calls.length).toBe(1);
    } finally {
      scope.stop();
    }
  });

  it("does not clear selection on Escape when escape behavior is none", () => {
    const manager = createManager({
      isEmpty: false,
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        escapeKeyBehavior: "none",
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: ref.current });

      onKeydown(event);

      expect(manager.clearSelection).not.toHaveBeenCalled();
    } finally {
      scope.stop();
    }
  });

  it("does not replace selection when navigating with ctrl+arrow", () => {
    const manager = createManager({
      focusedKey: "a",
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: ref.current });

      onKeydown(event);

      expect(manager.setFocusedKey).toHaveBeenCalledWith("b", undefined);
      expect(manager.replaceSelection).not.toHaveBeenCalled();
      expect(manager.extendSelection).not.toHaveBeenCalled();
    } finally {
      scope.stop();
    }
  });

  it("navigates and updates selection with PageDown and PageUp", () => {
    const manager = createManager({
      focusedKey: "a",
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const pageDown = new KeyboardEvent("keydown", { key: "PageDown", bubbles: true, cancelable: true });
      Object.defineProperty(pageDown, "target", { value: ref.current });
      onKeydown(pageDown);

      const pageUp = new KeyboardEvent("keydown", { key: "PageUp", bubbles: true, cancelable: true });
      Object.defineProperty(pageUp, "target", { value: ref.current });
      onKeydown(pageUp);

      expect(manager.setFocusedKey).toHaveBeenCalledWith("p", undefined);
      expect(manager.setFocusedKey).toHaveBeenCalledWith("o", undefined);
      expect(manager.replaceSelection).toHaveBeenCalledWith("p");
      expect(manager.replaceSelection).toHaveBeenCalledWith("o");
    } finally {
      scope.stop();
    }
  });

  it("wraps ArrowLeft and ArrowRight navigation in ltr when enabled", () => {
    const manager = createManager({
      focusedKey: "a",
    });
    const ref = { current: document.createElement("div") };

    const wrapDelegate: KeyboardDelegate = {
      ...delegate,
      getKeyLeftOf: () => null,
      getKeyRightOf: () => null,
      getFirstKey: () => "first",
      getLastKey: () => "last",
    };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: wrapDelegate,
        ref,
        shouldFocusWrap: true,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const left = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true });
      Object.defineProperty(left, "target", { value: ref.current });
      onKeydown(left);

      const right = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
      Object.defineProperty(right, "target", { value: ref.current });
      onKeydown(right);

      expect(manager.setFocusedKey).toHaveBeenCalledWith("last", "last");
      expect(manager.setFocusedKey).toHaveBeenCalledWith("first", "first");
      expect(manager.replaceSelection).toHaveBeenCalledWith("last");
      expect(manager.replaceSelection).toHaveBeenCalledWith("first");
    } finally {
      scope.stop();
    }
  });

  it("opens link items on keyboard navigation in selection link behavior", () => {
    const manager = createManager({
      focusedKey: "a",
      isLink: vi.fn((key: Key) => key === "b"),
      getItemProps: vi.fn(() => ({ href: "/route", routerOptions: { source: "test" } })),
    });
    const ref = { current: document.createElement("div") };
    const link = document.createElement("a");
    link.setAttribute("data-key", "b");
    link.href = "#";
    ref.current.appendChild(link);

    const linkClick = vi.fn((event: Event) => event.preventDefault());
    link.addEventListener("click", linkClick);

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        linkBehavior: "selection",
        selectOnFocus: true,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: ref.current });

      onKeydown(event);

      expect(manager.setFocusedKey).toHaveBeenCalledWith("b", undefined);
      expect(manager.replaceSelection).not.toHaveBeenCalled();
      expect(linkClick).toHaveBeenCalledTimes(1);
    } finally {
      scope.stop();
      link.remove();
    }
  });

  it("does not replace selection for link items when link behavior is override", () => {
    const manager = createManager({
      focusedKey: "a",
      isLink: vi.fn((key: Key) => key === "b"),
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        linkBehavior: "override",
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: ref.current });
      onKeydown(event);

      expect(manager.setFocusedKey).toHaveBeenCalledWith("b", undefined);
      expect(manager.replaceSelection).not.toHaveBeenCalled();
      expect(manager.extendSelection).not.toHaveBeenCalled();
    } finally {
      scope.stop();
    }
  });

  it("extends selection on shift+arrow in multiple mode", () => {
    const manager = createManager({
      focusedKey: "a",
      selectionMode: "multiple",
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: ref.current });

      onKeydown(event);

      expect(manager.setFocusedKey).toHaveBeenCalledWith("b", undefined);
      expect(manager.extendSelection).toHaveBeenCalledWith("b");
      expect(manager.replaceSelection).not.toHaveBeenCalled();
    } finally {
      scope.stop();
    }
  });

  it("extends selection with ctrl+shift on Home and End in multiple mode", () => {
    const manager = createManager({
      selectionMode: "multiple",
      focusedKey: "b",
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const homeEvent = new KeyboardEvent("keydown", {
        key: "Home",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(homeEvent, "target", { value: ref.current });
      onKeydown(homeEvent);

      const endEvent = new KeyboardEvent("keydown", {
        key: "End",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(endEvent, "target", { value: ref.current });
      onKeydown(endEvent);

      expect(manager.setFocusedKey).toHaveBeenCalledWith("a");
      expect(manager.setFocusedKey).toHaveBeenCalledWith("z");
      expect(manager.extendSelection).toHaveBeenCalledWith("a");
      expect(manager.extendSelection).toHaveBeenCalledWith("z");
      expect(manager.replaceSelection).not.toHaveBeenCalled();
    } finally {
      scope.stop();
    }
  });

  it("marks manager focused on focus events", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onFocus = collectionProps.onFocus as (event: FocusEvent) => void;
      const focusEvent = new FocusEvent("focus", { relatedTarget: null });
      Object.defineProperty(focusEvent, "currentTarget", { value: ref.current });
      Object.defineProperty(focusEvent, "target", { value: ref.current });

      onFocus(focusEvent);

      expect(manager.setFocused).toHaveBeenCalledWith(true);
      expect(manager.setFocusedKey).toHaveBeenCalledWith("a");
    } finally {
      scope.stop();
    }
  });

  it("clears focused state when already focused and focus target is outside", () => {
    const manager = createManager();
    manager.setFocused(true);

    const ref = { current: document.createElement("div") };
    const outside = document.createElement("button");
    document.body.append(ref.current, outside);

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onFocus = collectionProps.onFocus as (event: FocusEvent) => void;
      const focusEvent = new FocusEvent("focus", { relatedTarget: null });
      Object.defineProperty(focusEvent, "currentTarget", { value: ref.current });
      Object.defineProperty(focusEvent, "target", { value: outside });

      onFocus(focusEvent);
      expect(manager.setFocused).toHaveBeenCalledWith(false);
    } finally {
      scope.stop();
      ref.current.remove();
      outside.remove();
    }
  });

  it("focuses last selected key when focus enters from following element", () => {
    const manager = createManager({
      firstSelectedKey: "a",
      lastSelectedKey: "z",
    });
    const ref = { current: document.createElement("div") };
    const following = document.createElement("button");
    document.body.append(ref.current, following);

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onFocus = collectionProps.onFocus as (event: FocusEvent) => void;
      const focusEvent = new FocusEvent("focus", { relatedTarget: following });
      Object.defineProperty(focusEvent, "currentTarget", { value: ref.current });
      Object.defineProperty(focusEvent, "target", { value: ref.current });

      onFocus(focusEvent);

      expect(manager.setFocused).toHaveBeenCalledWith(true);
      expect(manager.setFocusedKey).toHaveBeenCalledWith("z");
      expect(manager.replaceSelection).not.toHaveBeenCalled();
      expect(manager.extendSelection).not.toHaveBeenCalled();
      expect(manager.toggleSelection).not.toHaveBeenCalled();
    } finally {
      scope.stop();
      ref.current.remove();
      following.remove();
    }
  });

  it("focuses first selected key when focus enters from a preceding element", () => {
    const manager = createManager({
      firstSelectedKey: "a",
      lastSelectedKey: "z",
    });
    const ref = { current: document.createElement("div") };
    const preceding = document.createElement("button");
    document.body.append(preceding, ref.current);

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onFocus = collectionProps.onFocus as (event: FocusEvent) => void;
      const focusEvent = new FocusEvent("focus", { relatedTarget: preceding });
      Object.defineProperty(focusEvent, "currentTarget", { value: ref.current });
      Object.defineProperty(focusEvent, "target", { value: ref.current });

      onFocus(focusEvent);

      expect(manager.setFocused).toHaveBeenCalledWith(true);
      expect(manager.setFocusedKey).toHaveBeenCalledWith("a");
      expect(manager.replaceSelection).not.toHaveBeenCalled();
      expect(manager.extendSelection).not.toHaveBeenCalled();
      expect(manager.toggleSelection).not.toHaveBeenCalled();
    } finally {
      scope.stop();
      ref.current.remove();
      preceding.remove();
    }
  });

  it("focuses and scrolls the focused item on keyboard focus entry", () => {
    const manager = createManager({
      focusedKey: "a",
    });
    const ref = { current: document.createElement("div") };
    const option = document.createElement("div");
    option.setAttribute("data-key", "a");
    option.tabIndex = -1;
    option.scrollIntoView = vi.fn();
    ref.current.appendChild(option);
    document.body.append(ref.current);

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onFocus = collectionProps.onFocus as (event: FocusEvent) => void;
      const focusEvent = new FocusEvent("focus", { relatedTarget: null });
      Object.defineProperty(focusEvent, "currentTarget", { value: ref.current });
      Object.defineProperty(focusEvent, "target", { value: ref.current });

      onFocus(focusEvent);

      expect(document.activeElement).toBe(option);
      expect(option.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    } finally {
      scope.stop();
      ref.current.remove();
    }
  });

  it("does not scroll focused item for non-keyboard modality", () => {
    getInteractionModality.mockReturnValue("pointer");
    const manager = createManager({
      focusedKey: "a",
    });
    const ref = { current: document.createElement("div") };
    const option = document.createElement("div");
    option.setAttribute("data-key", "a");
    option.tabIndex = -1;
    option.scrollIntoView = vi.fn();
    ref.current.appendChild(option);
    document.body.append(ref.current);

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onFocus = collectionProps.onFocus as (event: FocusEvent) => void;
      const focusEvent = new FocusEvent("focus", { relatedTarget: null });
      Object.defineProperty(focusEvent, "currentTarget", { value: ref.current });
      Object.defineProperty(focusEvent, "target", { value: ref.current });

      onFocus(focusEvent);

      expect(option.scrollIntoView).not.toHaveBeenCalled();
    } finally {
      scope.stop();
      ref.current.remove();
    }
  });

  it("does not move DOM focus to item when virtual focus is enabled", () => {
    const manager = createManager({
      focusedKey: "a",
    });
    const ref = { current: document.createElement("div") };
    const option = document.createElement("div");
    option.setAttribute("data-key", "a");
    option.tabIndex = -1;
    option.scrollIntoView = vi.fn();
    ref.current.appendChild(option);
    const outside = document.createElement("button");
    document.body.append(ref.current, outside);
    outside.focus();

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        shouldUseVirtualFocus: true,
      })
    )!;

    try {
      const onFocus = collectionProps.onFocus as (event: FocusEvent) => void;
      const focusEvent = new FocusEvent("focus", { relatedTarget: outside });
      Object.defineProperty(focusEvent, "currentTarget", { value: ref.current });
      Object.defineProperty(focusEvent, "target", { value: ref.current });

      onFocus(focusEvent);

      expect(document.activeElement).toBe(outside);
    } finally {
      scope.stop();
      ref.current.remove();
      outside.remove();
    }
  });

  it("applies autoFocus strategy and falls back to collection focus", () => {
    const manager = createManager({
      selectedKeys: new Set<Key>(),
      canSelectItem: vi.fn(() => true),
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: {
          ...delegate,
          getFirstKey: () => null,
          getLastKey: () => null,
        },
        ref,
        autoFocus: "first",
      })
    );

    try {
      expect(manager.setFocused).toHaveBeenCalledWith(true);
      expect(manager.setFocusedKey).toHaveBeenCalledWith(null);
      expect(focusSafely).toHaveBeenCalledWith(ref.current);
    } finally {
      scope.stop();
    }
  });

  it("prioritizes the first selectable selected key during autoFocus", () => {
    const focusSafelyCallsBefore = (focusSafely as any).mock.calls.length;
    const manager = createManager({
      selectedKeys: new Set<Key>(["disabled", "enabled"]),
      canSelectItem: vi.fn((key: Key) => key === "enabled"),
    });
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        autoFocus: "first",
      })
    );

    try {
      expect(manager.setFocused).toHaveBeenCalledWith(true);
      expect(manager.setFocusedKey).toHaveBeenCalledWith("enabled");
      expect((focusSafely as any).mock.calls.length).toBe(focusSafelyCallsBefore);
    } finally {
      scope.stop();
    }
  });

  it("handles virtual focus events when enabled", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        shouldUseVirtualFocus: true,
      })
    );

    try {
      ref.current.dispatchEvent(
        new CustomEvent("react-aria-focus", { detail: { focusStrategy: "first" }, bubbles: true })
      );
      expect(manager.setFocused).toHaveBeenCalledWith(true);
      expect(manager.setFocusedKey).toHaveBeenCalledWith("a");

      ref.current.dispatchEvent(
        new CustomEvent("react-aria-clear-focus", { detail: { clearFocusKey: true }, bubbles: true })
      );
      expect(manager.setFocused).toHaveBeenCalledWith(false);
      expect(manager.setFocusedKey).toHaveBeenCalledWith(null);
    } finally {
      scope.stop();
    }
  });

  it("moves focus to the last tabbable item on Tab when tab navigation is disabled", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };
    const first = document.createElement("button");
    const last = document.createElement("button");
    const outside = document.createElement("button");
    ref.current.append(first, last);
    document.body.append(ref.current, outside);
    outside.focus();

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        allowsTabNavigation: false,
      })
    )!;

    try {
      const onKeydown = collectionProps.onKeydown as (event: KeyboardEvent) => void;
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "target", { value: ref.current });

      onKeydown(event);
      expect(document.activeElement).toBe(last);
    } finally {
      scope.stop();
      ref.current.remove();
      outside.remove();
    }
  });

  it("clears focus on blur when focus leaves the collection", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };
    const outside = document.createElement("button");
    document.body.append(ref.current, outside);

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onBlur = collectionProps.onBlur as (event: FocusEvent) => void;
      const blurEvent = new FocusEvent("blur", { relatedTarget: outside });
      Object.defineProperty(blurEvent, "currentTarget", { value: ref.current });

      onBlur(blurEvent);
      expect(manager.setFocused).toHaveBeenCalledWith(false);
    } finally {
      scope.stop();
      ref.current.remove();
      outside.remove();
    }
  });

  it("does not clear focus on blur when focus remains within the collection", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };
    const inside = document.createElement("button");
    ref.current.appendChild(inside);
    document.body.append(ref.current);

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
      })
    )!;

    try {
      const onBlur = collectionProps.onBlur as (event: FocusEvent) => void;
      const blurEvent = new FocusEvent("blur", { relatedTarget: inside });
      Object.defineProperty(blurEvent, "currentTarget", { value: ref.current });

      onBlur(blurEvent);
      expect(manager.setFocused).not.toHaveBeenCalledWith(false);
    } finally {
      scope.stop();
      ref.current.remove();
    }
  });

  it("prevents default mousedown on the scroll container itself", () => {
    const manager = createManager();
    const scrollEl = document.createElement("div");
    const ref = { current: document.createElement("div") };

    const scope = effectScope();
    const { collectionProps } = scope.run(() =>
      useSelectableCollection({
        selectionManager: manager,
        keyboardDelegate: delegate,
        ref,
        scrollRef: { current: scrollEl },
      })
    )!;

    try {
      const onMousedown = collectionProps.onMousedown as (event: MouseEvent) => void;
      const event = {
        target: scrollEl,
        preventDefault: vi.fn(),
      } as unknown as MouseEvent;

      onMousedown(event);
      expect((event.preventDefault as any).mock.calls.length).toBe(1);
    } finally {
      scope.stop();
    }
  });
});
