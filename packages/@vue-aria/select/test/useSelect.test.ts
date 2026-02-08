import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useSelect, useSelectState } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useSelect", () => {
  it("returns trigger and value semantics", () => {
    const scope = effectScope();
    const triggerElement = document.createElement("button");
    document.body.appendChild(triggerElement);

    let select!: ReturnType<typeof useSelect>;

    scope.run(() => {
      const state = useSelectState({
        collection: [{ key: "one" }, { key: "two" }],
        defaultSelectedKey: "one",
      });
      select = useSelect(
        {
          "aria-label": "Select option",
        },
        state,
        ref(triggerElement)
      );
    });

    expect(select.triggerProps.value.role).toBe("button");
    expect(select.triggerProps.value["aria-haspopup"]).toBe("listbox");
    expect(select.valueProps.value.id).toBeTypeOf("string");

    scope.stop();
    triggerElement.remove();
  });

  it("toggles menu on click and selection keys", () => {
    const scope = effectScope();
    const triggerElement = document.createElement("button");
    document.body.appendChild(triggerElement);

    let select!: ReturnType<typeof useSelect>;
    let state!: ReturnType<typeof useSelectState>;

    scope.run(() => {
      state = useSelectState({
        collection: [{ key: "one" }, { key: "two" }],
        defaultSelectedKey: "one",
      });
      select = useSelect(
        {
          "aria-label": "Select option",
        },
        state,
        ref(triggerElement)
      );
    });

    (select.triggerProps.value.onClick as () => void)();
    expect(state.isOpen.value).toBe(true);

    (
      select.triggerProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowDown",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);
    expect(state.selectedKey.value).toBe("two");

    (
      select.triggerProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "Escape",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);
    expect(state.isOpen.value).toBe(false);

    scope.stop();
    triggerElement.remove();
  });

  it("forwards focus callbacks", () => {
    const scope = effectScope();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onFocusChange = vi.fn();
    const triggerElement = document.createElement("button");
    document.body.appendChild(triggerElement);

    let select!: ReturnType<typeof useSelect>;
    let state!: ReturnType<typeof useSelectState>;

    scope.run(() => {
      state = useSelectState({
        collection: [{ key: "one" }, { key: "two" }],
      });
      select = useSelect(
        {
          "aria-label": "Select option",
          onFocus,
          onBlur,
          onFocusChange,
        },
        state,
        ref(triggerElement)
      );
    });

    (select.triggerProps.value.onFocus as (event: FocusEvent) => void)(
      {} as FocusEvent
    );
    expect(onFocus).toHaveBeenCalled();
    expect(onFocusChange).toHaveBeenCalledWith(true);
    expect(state.isFocused.value).toBe(true);

    (select.triggerProps.value.onBlur as (event: FocusEvent) => void)(
      {} as FocusEvent
    );
    expect(onBlur).toHaveBeenCalled();
    expect(onFocusChange).toHaveBeenCalledWith(false);
    expect(state.isFocused.value).toBe(false);

    scope.stop();
    triggerElement.remove();
  });
});
