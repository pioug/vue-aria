import { mount } from "@vue/test-utils";
import { defineComponent, h, onMounted } from "vue";
import { describe, expect, it } from "vitest";
import { FocusScope, useFocusManager, type FocusManager } from "../src";

function mountScope(nodes: () => ReturnType<typeof h>[]) {
  let manager: FocusManager | undefined;

  const Probe = defineComponent({
    setup() {
      onMounted(() => {
        manager = useFocusManager();
      });
      return () => null;
    },
  });

  const wrapper = mount(FocusScope, {
    attachTo: document.body,
    slots: {
      default: () => [...nodes(), h(Probe)],
    },
  });

  return {
    wrapper,
    getManager: () => manager,
  };
}

describe("FocusScope focus manager parity", () => {
  it("moves focus forward without wrap", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "item1", tabIndex: -1 }),
      h("div", { id: "item2", tabIndex: -1 }),
      h("div", { id: "item3", tabIndex: -1 }),
    ]);
    const manager = getManager();

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item2 = wrapper.get("#item2").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item1.focus();
    manager?.focusNext();
    expect(document.activeElement).toBe(item2);

    manager?.focusNext();
    expect(document.activeElement).toBe(item3);

    manager?.focusNext();
    expect(document.activeElement).toBe(item3);
    wrapper.unmount();
  });

  it("moves focus forward with wrap", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "item1", tabIndex: -1 }),
      h("div", { id: "item2", tabIndex: -1 }),
      h("div", { id: "item3", tabIndex: -1 }),
    ]);
    const manager = getManager();

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item2 = wrapper.get("#item2").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item1.focus();
    manager?.focusNext({ wrap: true });
    expect(document.activeElement).toBe(item2);

    manager?.focusNext({ wrap: true });
    expect(document.activeElement).toBe(item3);

    manager?.focusNext({ wrap: true });
    expect(document.activeElement).toBe(item1);
    wrapper.unmount();
  });

  it("moves focus forward to tabbable items only", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "item1", tabIndex: 0 }),
      h("div", { id: "item2", tabIndex: -1 }),
      h("div", { style: { display: "none" } }),
      h("div", { style: { visibility: "hidden" } }),
      h("div", { style: { visibility: "collapse" } }),
      h("div", { id: "item3", tabIndex: 0 }),
    ]);
    const manager = getManager();

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item1.focus();
    manager?.focusNext({ tabbable: true });
    expect(document.activeElement).toBe(item3);
    wrapper.unmount();
  });

  it("respects the from option for forward tabbable traversal", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "group1", role: "group" }, [
        h("div", { id: "item1", tabIndex: -1 }),
        h("div", { id: "item2", tabIndex: 0 }),
        h("div", { style: { display: "none" } }),
      ]),
      h("div", { id: "group2", role: "group" }, [
        h("div", { style: { visibility: "hidden" } }),
        h("div", { style: { visibility: "collapse" } }),
        h("div", { id: "item3", tabIndex: 0 }),
      ]),
    ]);
    const manager = getManager();

    const group1 = wrapper.get("#group1").element as HTMLDivElement;
    const group2 = wrapper.get("#group2").element as HTMLDivElement;
    const item2 = wrapper.get("#item2").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    manager?.focusNext({ from: group2, tabbable: true });
    expect(document.activeElement).toBe(item3);

    manager?.focusNext({ from: group1, tabbable: true });
    expect(document.activeElement).toBe(item2);
    wrapper.unmount();
  });

  it("moves focus backward without wrap", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "item1", tabIndex: -1 }),
      h("div", { id: "item2", tabIndex: -1 }),
      h("div", { id: "item3", tabIndex: -1 }),
    ]);
    const manager = getManager();

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item2 = wrapper.get("#item2").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item3.focus();
    manager?.focusPrevious();
    expect(document.activeElement).toBe(item2);

    manager?.focusPrevious();
    expect(document.activeElement).toBe(item1);

    manager?.focusPrevious();
    expect(document.activeElement).toBe(item1);
    wrapper.unmount();
  });

  it("moves focus backward with wrap", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "item1", tabIndex: -1 }),
      h("div", { id: "item2", tabIndex: -1 }),
      h("div", { id: "item3", tabIndex: -1 }),
    ]);
    const manager = getManager();

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item2 = wrapper.get("#item2").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item3.focus();
    manager?.focusPrevious({ wrap: true });
    expect(document.activeElement).toBe(item2);

    manager?.focusPrevious({ wrap: true });
    expect(document.activeElement).toBe(item1);

    manager?.focusPrevious({ wrap: true });
    expect(document.activeElement).toBe(item3);
    wrapper.unmount();
  });

  it("moves focus backward to tabbable items only", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "item1", tabIndex: 0 }),
      h("div", { id: "item2", tabIndex: -1 }),
      h("div", { style: { display: "none" } }),
      h("div", { style: { visibility: "hidden" } }),
      h("div", { style: { visibility: "collapse" } }),
      h("div", { id: "item3", tabIndex: 0 }),
    ]);
    const manager = getManager();

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item3.focus();
    manager?.focusPrevious({ tabbable: true });
    expect(document.activeElement).toBe(item1);
    wrapper.unmount();
  });

  it("skips filtered nodes while moving backward with wrap", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "item1", tabIndex: -1 }),
      h("div", { id: "item2", tabIndex: -1, "data-skip": "" }),
      h("div", { id: "item3", tabIndex: -1 }),
    ]);
    const manager = getManager();

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item1.focus();
    manager?.focusPrevious({
      wrap: true,
      accept: (element) => !element.hasAttribute("data-skip"),
    });
    expect(document.activeElement).toBe(item3);

    manager?.focusPrevious({
      wrap: true,
      accept: (element) => !element.hasAttribute("data-skip"),
    });
    expect(document.activeElement).toBe(item1);
    wrapper.unmount();
  });

  it("respects the from option for backward tabbable traversal", () => {
    const { wrapper, getManager } = mountScope(() => [
      h("div", { id: "group1", role: "group" }, [
        h("div", { id: "item1", tabIndex: 0 }),
        h("div", { id: "item2", tabIndex: -1 }),
        h("div", { style: { display: "none" } }),
      ]),
      h("div", { id: "group2", role: "group" }, [
        h("div", { style: { visibility: "hidden" } }),
        h("div", { style: { visibility: "collapse" } }),
        h("div", { id: "item3", tabIndex: 0 }),
      ]),
    ]);
    const manager = getManager();

    const group1 = wrapper.get("#group1").element as HTMLDivElement;
    const group2 = wrapper.get("#group2").element as HTMLDivElement;
    const item1 = wrapper.get("#item1").element as HTMLDivElement;

    manager?.focusPrevious({ from: group2, tabbable: true });
    expect(document.activeElement).toBe(item1);

    manager?.focusPrevious({ from: group1, tabbable: true });
    expect(document.activeElement).toBe(item1);
    wrapper.unmount();
  });
});
