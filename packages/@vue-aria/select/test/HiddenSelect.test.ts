import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { HiddenSelect } from "../src/HiddenSelect";
import { selectData } from "../src/useSelect";

function createLargeState() {
  return {
    collection: {
      size: 500,
      getKeys: () => [][Symbol.iterator](),
      getItem: () => null,
    },
    selectionManager: {
      selectionMode: "single",
    },
    value: "a",
    defaultValue: "a",
    setValue: () => {},
  } as any;
}

function createLargeMultiState() {
  return {
    collection: {
      size: 500,
      getKeys: () => [][Symbol.iterator](),
      getItem: () => null,
    },
    selectionManager: {
      selectionMode: "multiple",
    },
    value: ["a", "b"],
    defaultValue: ["a", "b"],
    setValue: () => {},
  } as any;
}

describe("HiddenSelect component", () => {
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
});
