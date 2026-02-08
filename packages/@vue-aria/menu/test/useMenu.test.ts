import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useListBoxState } from "@vue-aria/listbox";
import { useMenu } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useMenu", () => {
  it("returns menu semantics", () => {
    const scope = effectScope();
    let menu!: ReturnType<typeof useMenu>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
      });

      menu = useMenu(
        {
          "aria-label": "Actions",
        },
        state,
        ref(null)
      );
    });

    expect(menu.menuProps.value.role).toBe("menu");
    expect(menu.menuProps.value.id).toBeTypeOf("string");

    scope.stop();
  });

  it("moves focus with keyboard and wraps by default", () => {
    const scope = effectScope();
    const itemA = document.createElement("li");
    const itemB = document.createElement("li");
    document.body.append(itemA, itemB);

    let menu!: ReturnType<typeof useMenu>;
    let state!: ReturnType<typeof useListBoxState>;

    scope.run(() => {
      state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
      });
      state.registerOption("a", itemA);
      state.registerOption("b", itemB);

      menu = useMenu(
        {
          "aria-label": "Actions",
          shouldFocusWrap: true,
        },
        state,
        ref(null)
      );
    });

    state.setFocusedKey("b");

    (
      menu.menuProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowDown",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.focusedKey.value).toBe("a");

    scope.stop();
    itemA.remove();
    itemB.remove();
  });

  it("supports typeahead focus", () => {
    const scope = effectScope();
    let menu!: ReturnType<typeof useMenu>;
    let state!: ReturnType<typeof useListBoxState>;

    scope.run(() => {
      state = useListBoxState({
        collection: [
          { key: "copy", textValue: "Copy" },
          { key: "paste", textValue: "Paste" },
        ],
      });

      menu = useMenu(
        {
          "aria-label": "Actions",
        },
        state,
        ref(null)
      );
    });

    const currentTarget = document.createElement("ul");
    const target = document.createElement("li");
    currentTarget.appendChild(target);

    (
      menu.menuProps.value.onKeydownCapture as (event: KeyboardEvent) => void
    )({
      key: "p",
      ctrlKey: false,
      metaKey: false,
      currentTarget,
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.focusedKey.value).toBe("paste");

    scope.stop();
  });

  it("calls onClose on escape", () => {
    const onClose = vi.fn();
    const scope = effectScope();
    let menu!: ReturnType<typeof useMenu>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
      });

      menu = useMenu(
        {
          "aria-label": "Actions",
          onClose,
        },
        state,
        ref(null)
      );
    });

    (
      menu.menuProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "Escape",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
  });
});
