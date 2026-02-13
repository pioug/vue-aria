import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useSelectableCollection } from "../src/useSelectableCollection";
import type { Key, MultipleSelectionManager } from "@vue-aria/selection-state";
import type { KeyboardDelegate } from "../src/types";

vi.mock("@vue-aria/i18n", () => ({
  useLocale: () => ref({ locale: "en-US", direction: "ltr" }),
}));

const { focusSafely } = vi.hoisted(() => ({
  focusSafely: vi.fn(),
}));
vi.mock("@vue-aria/interactions", () => ({
  getInteractionModality: () => "keyboard",
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
});
