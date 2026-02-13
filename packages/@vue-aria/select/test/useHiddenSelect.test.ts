import { effectScope, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useHiddenSelect } from "../src/HiddenSelect";
import { selectData } from "../src/useSelect";

function createState(selectionMode: "single" | "multiple" = "single") {
  return {
    collection: {
      size: 2,
      getKeys: () => ["a", "b"][Symbol.iterator](),
      getItem: (key: string) => ({ key, type: "item", textValue: key.toUpperCase() }),
    },
    selectionManager: {
      selectionMode,
    },
    value: selectionMode === "multiple" ? ["a"] : "a",
    defaultValue: selectionMode === "multiple" ? ["a"] : "a",
    setValue: vi.fn(),
    commitValidation: vi.fn(),
    displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
  } as any;
}

describe("useHiddenSelect", () => {
  it("maps select props and updates single value on change", () => {
    const state = createState("single");
    const selectRef = ref<HTMLSelectElement | HTMLInputElement | null>(null);
    const triggerRef = { current: document.createElement("button") as Element | null };
    const selectElement = document.createElement("select");
    selectElement.innerHTML = `<option value="a">A</option><option value="b">B</option>`;
    selectElement.value = "b";
    selectRef.value = selectElement;

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useHiddenSelect({ name: "x", selectRef }, state, triggerRef);
    });

    (result.selectProps.onChange as (event: Event) => void)({ target: selectElement } as unknown as Event);
    expect(result.selectProps.multiple).toBe(false);
    expect(state.setValue).toHaveBeenCalledWith("b");

    scope.stop();
  });

  it("updates single value on input events", () => {
    const state = createState("single");
    const selectRef = ref<HTMLSelectElement | HTMLInputElement | null>(null);
    const triggerRef = { current: document.createElement("button") as Element | null };
    const selectElement = document.createElement("select");
    selectElement.innerHTML = `<option value="a">A</option><option value="b">B</option>`;
    selectElement.value = "b";
    selectRef.value = selectElement;

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useHiddenSelect({ name: "x", selectRef }, state, triggerRef);
    });

    (result.selectProps.onInput as (event: Event) => void)({ target: selectElement } as unknown as Event);
    expect(state.setValue).toHaveBeenCalledWith("b");

    scope.stop();
  });

  it("reads currentTarget when event target is missing", () => {
    const state = createState("single");
    const selectRef = ref<HTMLSelectElement | HTMLInputElement | null>(null);
    const triggerRef = { current: document.createElement("button") as Element | null };
    const selectElement = document.createElement("select");
    selectElement.innerHTML = `<option value="a">A</option><option value="b">B</option>`;
    selectElement.value = "b";
    selectRef.value = selectElement;

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useHiddenSelect({ name: "x", selectRef }, state, triggerRef);
    });

    (result.selectProps.onChange as (event: Event) => void)({
      currentTarget: selectElement,
    } as unknown as Event);
    expect(state.setValue).toHaveBeenCalledWith("b");

    scope.stop();
  });

  it("maps multiple mode and updates selected options", () => {
    const state = createState("multiple");
    const triggerRef = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useHiddenSelect({ name: "x" }, state, triggerRef);
    });

    const selectedOptions = [{ value: "a" }, { value: "b" }] as any;
    const target = {
      multiple: true,
      selectedOptions,
    } as HTMLSelectElement;
    (result.selectProps.onChange as (event: Event) => void)({ target } as unknown as Event);

    expect(result.selectProps.multiple).toBe(true);
    expect(state.setValue).toHaveBeenCalledWith(["a", "b"]);

    scope.stop();
  });

  it("applies native validation requirements and custom validity", async () => {
    const state = createState("single");
    state.realtimeValidation = {
      isInvalid: true,
      validationErrors: ["Selection required"],
      validationDetails: null,
    };
    const selectElement = document.createElement("select");
    const selectRef = ref<HTMLSelectElement | HTMLInputElement | null>(selectElement);
    selectData.set(state as object, {
      validationBehavior: "native",
      isRequired: true,
    });
    const triggerRef = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useHiddenSelect({ name: "x", selectRef }, state, triggerRef);
    });
    await nextTick();

    expect(result.selectProps.required).toBe(true);
    expect(selectElement.validationMessage).toBe("Selection required");

    scope.stop();
  });

  it("focuses trigger on native invalid events via form validation integration", async () => {
    const state = createState("single");
    const selectElement = document.createElement("select");
    selectElement.required = true;
    const form = document.createElement("form");
    form.appendChild(selectElement);
    document.body.appendChild(form);
    const selectRef = ref<HTMLSelectElement | HTMLInputElement | null>(selectElement);
    const trigger = document.createElement("button");
    const triggerRef = { current: trigger as Element | null };
    const focusSpy = vi.spyOn(trigger, "focus");
    selectData.set(state as object, {
      validationBehavior: "native",
      isRequired: true,
    });

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useHiddenSelect({ name: "x", selectRef }, state, triggerRef);
    });
    await nextTick();

    selectElement.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(state.commitValidation).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(result.selectProps.required).toBe(true);

    scope.stop();
    form.remove();
  });

  it("forwards hidden select focus to trigger element", () => {
    const state = createState("single");
    const selectRef = ref<HTMLSelectElement | HTMLInputElement | null>(null);
    const trigger = document.createElement("button");
    const triggerRef = { current: trigger as Element | null };
    const focusSpy = vi.spyOn(trigger, "focus");

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useHiddenSelect({ name: "x", selectRef }, state, triggerRef);
    });

    (result.selectProps.onFocus as () => void)();
    expect(focusSpy).toHaveBeenCalledTimes(1);

    scope.stop();
  });
});
