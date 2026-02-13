import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useTypeSelect } from "../src/useTypeSelect";
import type { KeyboardDelegate } from "../src/types";
import type { Key } from "@vue-aria/collections";

function createKeyboardDelegate(getKeyForSearch?: KeyboardDelegate["getKeyForSearch"]): KeyboardDelegate {
  return {
    getKeyBelow: () => null,
    getKeyAbove: () => null,
    getFirstKey: () => null,
    getLastKey: () => null,
    getKeyPageBelow: () => null,
    getKeyPageAbove: () => null,
    getKeyForSearch,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useTypeSelect", () => {
  it("focuses the key returned by keyboardDelegate search", () => {
    const setFocusedKey = vi.fn<(key: Key) => void>();
    const onTypeSelect = vi.fn<(key: Key) => void>();
    const getKeyForSearch = vi
      .fn<(search: string, fromKey?: Key) => Key | null>()
      .mockImplementation((search) => (search === "a" ? "alpha" : null));

    let onKeydownCapture: ((event: KeyboardEvent) => void) | undefined;
    const scope = effectScope();
    scope.run(() => {
      ({ typeSelectProps: { onKeydownCapture } } = useTypeSelect({
        keyboardDelegate: createKeyboardDelegate(getKeyForSearch),
        selectionManager: {
          focusedKey: null,
          setFocusedKey,
        },
        onTypeSelect,
      }));
    });

    const target = document.createElement("div");
    const event = new KeyboardEvent("keydown", { key: "a", bubbles: true });
    Object.defineProperty(event, "currentTarget", { value: target });
    Object.defineProperty(event, "target", { value: target });

    onKeydownCapture?.(event);

    expect(getKeyForSearch).toHaveBeenCalledWith("a", undefined);
    expect(setFocusedKey).toHaveBeenCalledWith("alpha");
    expect(onTypeSelect).toHaveBeenCalledWith("alpha");

    scope.stop();
  });

  it("ignores leading space and prevents propagation for in-progress typeahead", () => {
    const setFocusedKey = vi.fn<(key: Key) => void>();
    const getKeyForSearch = vi
      .fn<(search: string, fromKey?: Key) => Key | null>()
      .mockReturnValue("alpha");

    let onKeydownCapture: ((event: KeyboardEvent) => void) | undefined;
    const scope = effectScope();
    scope.run(() => {
      ({ typeSelectProps: { onKeydownCapture } } = useTypeSelect({
        keyboardDelegate: createKeyboardDelegate(getKeyForSearch),
        selectionManager: {
          focusedKey: "current",
          setFocusedKey,
        },
      }));
    });

    const target = document.createElement("div");

    const firstSpace = new KeyboardEvent("keydown", { key: " ", bubbles: true });
    Object.defineProperty(firstSpace, "currentTarget", { value: target });
    Object.defineProperty(firstSpace, "target", { value: target });
    onKeydownCapture?.(firstSpace);
    expect(getKeyForSearch).not.toHaveBeenCalled();

    const letter = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
    Object.defineProperty(letter, "currentTarget", { value: target });
    Object.defineProperty(letter, "target", { value: target });
    onKeydownCapture?.(letter);

    const trailingSpace = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    Object.defineProperty(trailingSpace, "currentTarget", { value: target });
    Object.defineProperty(trailingSpace, "target", { value: target });

    const stopPropagation = vi.fn();
    Object.defineProperty(trailingSpace, "stopPropagation", { value: stopPropagation });

    onKeydownCapture?.(trailingSpace);
    expect(trailingSpace.defaultPrevented).toBe(true);
    expect(stopPropagation).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("clears search after debounce timeout", () => {
    vi.useFakeTimers();

    const setFocusedKey = vi.fn<(key: Key) => void>();
    const getKeyForSearch = vi
      .fn<(search: string, fromKey?: Key) => Key | null>()
      .mockImplementation((search) => (search === "a" || search === "b" ? "alpha" : null));

    let onKeydownCapture: ((event: KeyboardEvent) => void) | undefined;
    const scope = effectScope();
    scope.run(() => {
      ({ typeSelectProps: { onKeydownCapture } } = useTypeSelect({
        keyboardDelegate: createKeyboardDelegate(getKeyForSearch),
        selectionManager: {
          focusedKey: null,
          setFocusedKey,
        },
      }));
    });

    const target = document.createElement("div");

    const first = new KeyboardEvent("keydown", { key: "a", bubbles: true });
    Object.defineProperty(first, "currentTarget", { value: target });
    Object.defineProperty(first, "target", { value: target });
    onKeydownCapture?.(first);

    vi.advanceTimersByTime(1001);

    const second = new KeyboardEvent("keydown", { key: "b", bubbles: true });
    Object.defineProperty(second, "currentTarget", { value: target });
    Object.defineProperty(second, "target", { value: target });
    onKeydownCapture?.(second);

    expect(getKeyForSearch).toHaveBeenNthCalledWith(1, "a", undefined);
    expect(getKeyForSearch).toHaveBeenNthCalledWith(2, "b", undefined);

    scope.stop();
  });
});
