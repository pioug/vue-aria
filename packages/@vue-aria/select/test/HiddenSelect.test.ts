import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { HiddenSelect } from "../src/HiddenSelect";
import { selectData } from "../src/useSelect";

function makeItems(size: number) {
  return Array.from({ length: size }, (_, index) => ({
    key: String(index + 1),
    textValue: String(index + 1),
    type: "item",
  }));
}

function createCollection(items: Array<{ key: string; textValue: string; type: string }>) {
  return {
    size: items.length,
    getKeys: () => items.map((item) => item.key)[Symbol.iterator](),
    getItem: (key: string) => items.find((item) => item.key === key) ?? null,
  };
}

function createLargeState() {
  return {
    collection: createCollection(makeItems(500)),
    selectionManager: {
      selectionMode: "single",
    },
    value: "a",
    defaultValue: "a",
    setValue: () => {},
    commitValidation: () => {},
    displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
  } as any;
}

function createLargeMultiState() {
  return {
    collection: createCollection(makeItems(500)),
    selectionManager: {
      selectionMode: "multiple",
    },
    value: ["a", "b"],
    defaultValue: ["a", "b"],
    setValue: () => {},
    commitValidation: () => {},
    displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
  } as any;
}

function createSmallState() {
  return {
    collection: createCollection(makeItems(5)),
    selectionManager: {
      selectionMode: "single",
    },
    value: null,
    defaultValue: null,
    setValue: vi.fn(),
    commitValidation: () => {},
    displayValidation: { isInvalid: false, validationErrors: [], validationDetails: null },
  } as any;
}

describe("HiddenSelect component", () => {
  it("renders hidden select for small collections with no selected key", () => {
    const state = createSmallState();

    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        triggerRef: { current: document.createElement("button") },
      },
    });

    expect(wrapper.find("[data-testid='hidden-select-container']").exists()).toBe(true);
    expect(wrapper.find("select").exists()).toBe(true);
  });

  it("updates state value when hidden select changes (autofill path)", async () => {
    const state = createSmallState();
    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        label: "select",
        triggerRef: { current: document.createElement("button") },
      },
    });

    const select = wrapper.find("select");
    (select.element as HTMLSelectElement).value = "5";
    await select.trigger("change");

    expect(state.setValue).toHaveBeenCalledWith("5");
  });

  it("always includes data-a11y-ignore on hidden select container", () => {
    const state = createSmallState();
    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        triggerRef: { current: document.createElement("button") },
      },
    });

    const container = wrapper.get("[data-testid='hidden-select-container']");
    expect(container.attributes("data-a11y-ignore")).toBe("aria-hidden-focus");
  });

  it("always includes data-react-aria-prevent-focus on hidden select container", () => {
    const state = createSmallState();
    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        triggerRef: { current: document.createElement("button") },
      },
    });

    const container = wrapper.get("[data-testid='hidden-select-container']");
    expect(container.attributes("data-react-aria-prevent-focus")).toBeDefined();
  });

  it("renders hidden input fallback for large collections with a name and no selected key", () => {
    const state = {
      ...createLargeState(),
      value: null,
      defaultValue: null,
    } as any;

    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        name: "select",
        triggerRef: { current: document.createElement("button") },
      },
    });

    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("name")).toBe("select");
  });

  it("uses selectData name fallback for large-collection hidden input rendering", () => {
    const state = createLargeState();
    state.value = null;
    state.defaultValue = null;
    selectData.set(state as object, {
      name: "fallback-name",
    });

    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        triggerRef: { current: document.createElement("button") },
      },
    });

    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("name")).toBe("fallback-name");
  });

  it("keeps initial form data value when collection is empty", () => {
    const state = {
      collection: createCollection([]),
      selectionManager: {
        selectionMode: "single",
      },
      value: "value",
      defaultValue: "value",
      setValue: () => {},
    } as any;

    const form = document.createElement("form");
    document.body.appendChild(form);
    const wrapper = mount(HiddenSelect, {
      attachTo: form,
      props: {
        state,
        name: "select",
        triggerRef: { current: document.createElement("button") },
      },
    });

    const formData = new FormData(form);
    expect(formData.get("select")).toBe("value");

    wrapper.unmount();
    form.remove();
  });

  it("keeps initial form data value with selectData name fallback when collection is empty", () => {
    const state = {
      collection: createCollection([]),
      selectionManager: {
        selectionMode: "single",
      },
      value: "value",
      defaultValue: "value",
      setValue: () => {},
    } as any;
    selectData.set(state as object, {
      name: "fallback-name",
    });

    const form = document.createElement("form");
    document.body.appendChild(form);
    const wrapper = mount(HiddenSelect, {
      attachTo: form,
      props: {
        state,
        triggerRef: { current: document.createElement("button") },
      },
    });

    const formData = new FormData(form);
    expect(formData.get("fallback-name")).toBe("value");

    wrapper.unmount();
    form.remove();
  });

  it("renders hidden input fallback for large collections", () => {
    const state = createLargeState();
    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        name: "choice",
        triggerRef: { current: document.createElement("button") },
      },
    });

    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("type")).toBe("hidden");
  });

  it("uses hidden text input with required when native validation is enabled", () => {
    const state = createLargeState();
    selectData.set(state as object, {
      validationBehavior: "native",
      isRequired: true,
    });

    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        name: "choice",
        triggerRef: { current: document.createElement("button") },
      },
    });

    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("text");
    expect(input.attributes("required")).toBeDefined();
  });

  it("marks only the first hidden text input as required for multi-value native validation", () => {
    const state = createLargeMultiState();
    selectData.set(state as object, {
      validationBehavior: "native",
      isRequired: true,
    });

    const wrapper = mount(HiddenSelect, {
      props: {
        state,
        name: "choice",
        triggerRef: { current: document.createElement("button") },
      },
    });

    const inputs = wrapper.findAll("input");
    expect(inputs).toHaveLength(2);
    expect(inputs[0].attributes("required")).toBeDefined();
    expect(inputs[1].attributes("required")).toBeUndefined();
  });

  it("focuses trigger when native invalid fires on hidden input fallback", async () => {
    const state = createLargeState();
    state.value = "";
    state.defaultValue = "";
    state.commitValidation = vi.fn();
    selectData.set(state as object, {
      validationBehavior: "native",
      isRequired: true,
    });

    const trigger = document.createElement("button");
    const focusSpy = vi.spyOn(trigger, "focus");
    const form = document.createElement("form");
    document.body.appendChild(form);
    const wrapper = mount(HiddenSelect, {
      attachTo: form,
      props: {
        state,
        name: "choice",
        triggerRef: { current: trigger },
      },
    });

    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("text");
    await nextTick();
    input.element.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(state.commitValidation).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    form.remove();
  });
});
