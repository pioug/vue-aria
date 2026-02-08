import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useListBox, useListBoxState } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useListBox", () => {
  it("returns listbox semantics", () => {
    const scope = effectScope();
    let listBox!: ReturnType<typeof useListBox>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
        selectionMode: "multiple",
      });

      listBox = useListBox(
        {
          "aria-label": "Options",
        },
        state,
        ref(null)
      );
    });

    expect(listBox.listBoxProps.value.role).toBe("listbox");
    expect(listBox.listBoxProps.value["aria-multiselectable"]).toBe("true");

    scope.stop();
  });

  it("moves focus and selection with keyboard navigation in single mode", () => {
    const scope = effectScope();
    const optionA = document.createElement("div");
    const optionB = document.createElement("div");
    document.body.append(optionA, optionB);

    let listBox!: ReturnType<typeof useListBox>;
    let state!: ReturnType<typeof useListBoxState>;

    scope.run(() => {
      state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
        selectionMode: "single",
      });

      state.registerOption("a", optionA);
      state.registerOption("b", optionB);

      listBox = useListBox(
        {
          "aria-label": "Options",
        },
        state,
        ref(null)
      );
    });

    state.setFocusedKey("a");

    const preventDefault = vi.fn();
    (
      listBox.listBoxProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowDown",
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(state.focusedKey.value).toBe("b");
    expect(state.selectedKeys.value.has("b")).toBe(true);

    scope.stop();
    optionA.remove();
    optionB.remove();
  });

  it("skips disabled options during keyboard navigation", () => {
    const scope = effectScope();
    const optionA = document.createElement("div");
    const optionB = document.createElement("div");
    const optionC = document.createElement("div");
    document.body.append(optionA, optionB, optionC);

    let listBox!: ReturnType<typeof useListBox>;
    let state!: ReturnType<typeof useListBoxState>;

    scope.run(() => {
      state = useListBoxState({
        collection: [{ key: "a" }, { key: "b", isDisabled: true }, { key: "c" }],
        selectionMode: "single",
      });

      state.registerOption("a", optionA);
      state.registerOption("b", optionB);
      state.registerOption("c", optionC);

      listBox = useListBox(
        {
          "aria-label": "Options",
        },
        state,
        ref(null)
      );
    });

    state.setFocusedKey("a");

    const preventDefault = vi.fn();
    (
      listBox.listBoxProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowDown",
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(state.focusedKey.value).toBe("c");
    expect(state.selectedKeys.value.has("c")).toBe(true);

    scope.stop();
    optionA.remove();
    optionB.remove();
    optionC.remove();
  });

  it("supports typeahead focus behavior through listbox props", () => {
    const scope = effectScope();
    let listBox!: ReturnType<typeof useListBox>;
    let state!: ReturnType<typeof useListBoxState>;

    scope.run(() => {
      state = useListBoxState({
        collection: [
          { key: "apple", textValue: "Apple" },
          { key: "banana", textValue: "Banana", isDisabled: true },
          { key: "cherry", textValue: "Cherry" },
        ],
        selectionMode: "single",
      });

      listBox = useListBox(
        {
          "aria-label": "Options",
        },
        state,
        ref(null)
      );
    });

    const currentTarget = document.createElement("div");
    const target = document.createElement("span");
    currentTarget.appendChild(target);

    (
      listBox.listBoxProps.value.onKeydownCapture as (event: KeyboardEvent) => void
    )({
      key: "c",
      ctrlKey: false,
      metaKey: false,
      currentTarget,
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.focusedKey.value).toBe("cherry");

    (
      listBox.listBoxProps.value.onKeydownCapture as (event: KeyboardEvent) => void
    )({
      key: "b",
      ctrlKey: false,
      metaKey: false,
      currentTarget,
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.focusedKey.value).toBe("cherry");

    scope.stop();
  });

  it("forwards focus callbacks", () => {
    const scope = effectScope();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onFocusChange = vi.fn();
    let listBox!: ReturnType<typeof useListBox>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "a" }],
      });
      listBox = useListBox(
        {
          "aria-label": "Options",
          onFocus,
          onBlur,
          onFocusChange,
        },
        state,
        ref(null)
      );
    });

    (listBox.listBoxProps.value.onFocus as (event: FocusEvent) => void)(
      {} as FocusEvent
    );
    (listBox.listBoxProps.value.onBlur as (event: FocusEvent) => void)(
      {} as FocusEvent
    );

    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
    expect(onFocusChange).toHaveBeenCalledWith(true);
    expect(onFocusChange).toHaveBeenCalledWith(false);

    scope.stop();
  });
});
