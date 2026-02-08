import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTypeSelect } from "../src";

describe("useTypeSelect", () => {
  it("focuses key using keyboard delegate search", () => {
    const focusedKey = ref<string | number | null>(null);
    const setFocusedKey = vi.fn((key: string | number) => {
      focusedKey.value = key;
    });
    const onTypeSelect = vi.fn();

    const scope = effectScope();
    let typeSelect!: ReturnType<typeof useTypeSelect>;

    scope.run(() => {
      typeSelect = useTypeSelect({
        keyboardDelegate: {
          getKeyForSearch: (search) => {
            if (search.toLowerCase() === "a") {
              return "apple";
            }
            return null;
          },
        },
        focusedKey,
        setFocusedKey,
        onTypeSelect,
      });
    });

    const currentTarget = document.createElement("div");
    const target = document.createElement("span");
    currentTarget.appendChild(target);

    typeSelect.typeSelectProps.onKeydownCapture?.({
      key: "a",
      ctrlKey: false,
      metaKey: false,
      currentTarget,
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(setFocusedKey).toHaveBeenCalledWith("apple");
    expect(onTypeSelect).toHaveBeenCalledWith("apple");
    expect(focusedKey.value).toBe("apple");

    scope.stop();
  });

  it("clears typeahead buffer after timeout", () => {
    vi.useFakeTimers();

    const focusedKey = ref<string | number | null>(null);
    const setFocusedKey = vi.fn((key: string | number) => {
      focusedKey.value = key;
    });

    const scope = effectScope();
    let typeSelect!: ReturnType<typeof useTypeSelect>;

    scope.run(() => {
      typeSelect = useTypeSelect({
        keyboardDelegate: {
          getKeyForSearch: (search) => {
            if (search.toLowerCase() === "ab") {
              return "ab-key";
            }
            return null;
          },
        },
        focusedKey,
        setFocusedKey,
      });
    });

    const currentTarget = document.createElement("div");
    const target = document.createElement("span");
    currentTarget.appendChild(target);

    typeSelect.typeSelectProps.onKeydownCapture?.({
      key: "a",
      ctrlKey: false,
      metaKey: false,
      currentTarget,
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    vi.advanceTimersByTime(1001);

    typeSelect.typeSelectProps.onKeydownCapture?.({
      key: "b",
      ctrlKey: false,
      metaKey: false,
      currentTarget,
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(setFocusedKey).not.toHaveBeenCalledWith("ab-key");

    scope.stop();
    vi.useRealTimers();
  });

  it("ignores control/meta combinations and outside targets", () => {
    const focusedKey = ref<string | number | null>(null);
    const setFocusedKey = vi.fn();

    const scope = effectScope();
    let typeSelect!: ReturnType<typeof useTypeSelect>;

    scope.run(() => {
      typeSelect = useTypeSelect({
        keyboardDelegate: {
          getKeyForSearch: () => "key",
        },
        focusedKey,
        setFocusedKey,
      });
    });

    const currentTarget = document.createElement("div");
    const inside = document.createElement("span");
    const outside = document.createElement("span");
    currentTarget.appendChild(inside);

    typeSelect.typeSelectProps.onKeydownCapture?.({
      key: "k",
      ctrlKey: true,
      metaKey: false,
      currentTarget,
      target: inside,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    typeSelect.typeSelectProps.onKeydownCapture?.({
      key: "k",
      ctrlKey: false,
      metaKey: false,
      currentTarget,
      target: outside,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(setFocusedKey).not.toHaveBeenCalled();

    scope.stop();
  });
});
