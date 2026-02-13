import { mount } from "@vue/test-utils";
import { defineComponent, h, onMounted } from "vue";
import { describe, expect, it } from "vitest";
import { FocusScope, useFocusManager, type FocusManager } from "../src";

describe("FocusScope behavior", () => {
  it("auto focuses the first focusable element when autoFocus is enabled", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { autoFocus: true },
      slots: {
        default: () => [
          h("div"),
          h("button", { id: "first" }, "First"),
          h("button", { id: "second" }, "Second"),
        ],
      },
    });

    expect(document.activeElement).toBe(wrapper.get("#first").element);
    wrapper.unmount();
  });

  it("restores focus to the previously focused element when unmounted with restoreFocus", () => {
    const outside = document.createElement("button");
    outside.id = "outside-focus";
    document.body.appendChild(outside);
    outside.focus();

    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { autoFocus: true, restoreFocus: true },
      slots: {
        default: () => [h("button", { id: "inside-focus" }, "Inside")],
      },
    });

    expect(document.activeElement).toBe(wrapper.get("#inside-focus").element);
    wrapper.unmount();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it("supports focus manager next/previous traversal with wrap", () => {
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
        default: () => [
          h("button", { id: "first" }, "First"),
          h("button", { id: "second" }, "Second"),
          h(Probe),
        ],
      },
    });

    const first = wrapper.get("#first").element as HTMLButtonElement;
    const second = wrapper.get("#second").element as HTMLButtonElement;

    manager?.focusFirst();
    expect(document.activeElement).toBe(first);

    manager?.focusNext();
    expect(document.activeElement).toBe(second);

    manager?.focusNext({ wrap: true });
    expect(document.activeElement).toBe(first);

    manager?.focusPrevious({ wrap: true });
    expect(document.activeElement).toBe(second);
    wrapper.unmount();
  });

  it("respects accept filter in focus manager traversal", () => {
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
        default: () => [
          h("button", { id: "first", "data-accept": "no" }, "First"),
          h("button", { id: "second", "data-accept": "yes" }, "Second"),
          h(Probe),
        ],
      },
    });

    manager?.focusFirst({
      accept: (node) => (node as HTMLElement).dataset.accept === "yes",
    });
    expect(document.activeElement).toBe(wrapper.get("#second").element);
    wrapper.unmount();
  });

  it("contains tab focus within the scope when contain is enabled", async () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("input", { id: "input2" }),
          h("input", { id: "input3" }),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    const input2 = wrapper.get("#input2").element as HTMLInputElement;
    const input3 = wrapper.get("#input3").element as HTMLInputElement;

    input1.focus();
    expect(document.activeElement).toBe(input1);

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }
      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    tabFromActive(false);
    expect(document.activeElement).toBe(input2);
    tabFromActive(false);
    expect(document.activeElement).toBe(input3);
    tabFromActive(false);
    expect(document.activeElement).toBe(input1);

    tabFromActive(true);
    expect(document.activeElement).toBe(input3);
    tabFromActive(true);
    expect(document.activeElement).toBe(input2);

    wrapper.unmount();
  });

  it("does not wrap focus for contain when modifier keys are pressed", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("input", { id: "input2" }),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    input1.focus();
    expect(document.activeElement).toBe(input1);

    input1.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
    );

    expect(document.activeElement).toBe(input1);
    wrapper.unmount();
  });
});
