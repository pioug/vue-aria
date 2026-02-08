import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useListBox, useListBoxState, useOption } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useOption", () => {
  it("returns option semantics and slot ids", () => {
    const scope = effectScope();
    const optionElement = document.createElement("div");
    document.body.appendChild(optionElement);

    let option!: ReturnType<typeof useOption>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
        selectionMode: "single",
      });
      useListBox({ "aria-label": "Options" }, state, ref(null));
      option = useOption({ key: "a" }, state, ref(optionElement));
    });

    expect(option.optionProps.value.role).toBe("option");
    expect(option.optionProps.value["aria-selected"]).toBe(false);
    expect(option.optionProps.value.id).toBeTypeOf("string");
    expect(option.labelProps.value.id).toBeTypeOf("string");
    expect(option.descriptionProps.value.id).toBeTypeOf("string");

    scope.stop();
    optionElement.remove();
  });

  it("selects and triggers action on press by default", () => {
    const scope = effectScope();
    const optionElement = document.createElement("div");
    document.body.appendChild(optionElement);

    const onAction = vi.fn();
    let option!: ReturnType<typeof useOption>;
    let state!: ReturnType<typeof useListBoxState>;

    scope.run(() => {
      state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
        selectionMode: "single",
      });
      useListBox({ "aria-label": "Options", onAction }, state, ref(null));
      option = useOption({ key: "a" }, state, ref(optionElement));
    });

    (option.optionProps.value.onMouseDown as () => void)();

    expect(state.selectedKeys.value.has("a")).toBe(true);
    expect(onAction).toHaveBeenCalledWith("a");

    scope.stop();
    optionElement.remove();
  });

  it("supports press-up selection behavior", () => {
    const scope = effectScope();
    const optionElement = document.createElement("div");
    document.body.appendChild(optionElement);

    let option!: ReturnType<typeof useOption>;
    let state!: ReturnType<typeof useListBoxState>;

    scope.run(() => {
      state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
        selectionMode: "single",
      });
      useListBox(
        {
          "aria-label": "Options",
          shouldSelectOnPressUp: true,
        },
        state,
        ref(null)
      );
      option = useOption({ key: "b" }, state, ref(optionElement));
    });

    (option.optionProps.value.onMouseDown as () => void)();
    expect(state.selectedKeys.value.has("b")).toBe(false);
    expect(option.isPressed.value).toBe(true);

    (option.optionProps.value.onMouseUp as () => void)();
    expect(state.selectedKeys.value.has("b")).toBe(true);
    expect(option.isPressed.value).toBe(false);

    scope.stop();
    optionElement.remove();
  });

  it("does not allow selection when disabled", () => {
    const scope = effectScope();
    const optionElement = document.createElement("div");
    document.body.appendChild(optionElement);

    let option!: ReturnType<typeof useOption>;
    let state!: ReturnType<typeof useListBoxState>;

    scope.run(() => {
      state = useListBoxState({
        collection: [{ key: "a", isDisabled: true }, { key: "b" }],
        selectionMode: "single",
      });
      useListBox({ "aria-label": "Options" }, state, ref(null));
      option = useOption({ key: "a" }, state, ref(optionElement));
    });

    (option.optionProps.value.onMouseDown as () => void)();

    expect(option.isDisabled.value).toBe(true);
    expect(state.selectedKeys.value.size).toBe(0);

    scope.stop();
    optionElement.remove();
  });

  it("adds virtualized position metadata", () => {
    const scope = effectScope();
    const optionElement = document.createElement("div");
    document.body.appendChild(optionElement);

    let option!: ReturnType<typeof useOption>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }, { key: "c" }],
        selectionMode: "single",
      });
      useListBox(
        {
          "aria-label": "Options",
          isVirtualized: true,
        },
        state,
        ref(null)
      );
      option = useOption({ key: "b" }, state, ref(optionElement));
    });

    expect(option.optionProps.value["aria-posinset"]).toBe(2);
    expect(option.optionProps.value["aria-setsize"]).toBe(3);

    scope.stop();
    optionElement.remove();
  });
});
