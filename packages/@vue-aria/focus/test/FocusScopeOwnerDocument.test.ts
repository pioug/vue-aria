import { mount } from "@vue/test-utils";
import { defineComponent, h, onMounted } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { FocusScope, useFocusManager } from "../src";

describe("FocusScope owner document behavior", () => {
  let iframe: HTMLIFrameElement | null = null;

  afterEach(() => {
    iframe?.remove();
    iframe = null;
  });

  function setupIframeRoot() {
    iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    const iframeDocument = iframe.contentWindow!.document;
    const root = iframeDocument.createElement("div");
    iframeDocument.body.appendChild(root);
    return { iframeDocument, root };
  }

  it("contains focus within scope inside iframe owner document", () => {
    const { iframeDocument, root } = setupIframeRoot();

    const wrapper = mount(FocusScope, {
      attachTo: root,
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

    const tabFromActive = (shiftKey = false) => {
      const active = iframeDocument.activeElement as HTMLElement | null;
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

    input1.focus();
    expect(iframeDocument.activeElement).toBe(input1);

    tabFromActive(false);
    expect(iframeDocument.activeElement).toBe(input2);
    tabFromActive(false);
    expect(iframeDocument.activeElement).toBe(input3);
    tabFromActive(false);
    expect(iframeDocument.activeElement).toBe(input1);

    tabFromActive(true);
    expect(iframeDocument.activeElement).toBe(input3);
    tabFromActive(true);
    expect(iframeDocument.activeElement).toBe(input2);
    tabFromActive(true);
    expect(iframeDocument.activeElement).toBe(input1);

    wrapper.unmount();
  });

  it("restores focus to previously focused element outside iframe on unmount", () => {
    const outside = document.createElement("button");
    outside.id = "outside-focus";
    document.body.appendChild(outside);
    outside.focus();

    const { iframeDocument, root } = setupIframeRoot();

    const wrapper = mount(FocusScope, {
      attachTo: root,
      props: { autoFocus: true, restoreFocus: true },
      slots: {
        default: () => [h("input", { id: "inside-focus" })],
      },
    });

    const inside = wrapper.get("#inside-focus").element as HTMLInputElement;
    expect(iframeDocument.activeElement).toBe(inside);

    wrapper.unmount();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it("keeps focus on target element when focus shifts inside iframe scope", () => {
    const { iframeDocument, root } = setupIframeRoot();

    const wrapper = mount(FocusScope, {
      attachTo: root,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("input", { id: "input2" }),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    const input2 = wrapper.get("#input2").element as HTMLInputElement;

    input1.focus();
    input1.dispatchEvent(new FocusEvent("focusin", { bubbles: true, relatedTarget: null }));
    expect(iframeDocument.activeElement).toBe(input1);

    input2.focus();
    input1.dispatchEvent(new FocusEvent("blur", { bubbles: true, relatedTarget: null }));
    expect(iframeDocument.activeElement).toBe(input2);

    wrapper.unmount();
  });

  it("auto focuses the first tabbable element in iframe scope on mount", () => {
    const { iframeDocument, root } = setupIframeRoot();

    const wrapper = mount(FocusScope, {
      attachTo: root,
      props: { autoFocus: true },
      slots: {
        default: () => [
          h("div"),
          h("input", { id: "input1" }),
          h("input", { id: "input2" }),
          h("input", { id: "input3" }),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    expect(iframeDocument.activeElement).toBe(input1);
    wrapper.unmount();
  });

  it("does nothing when something is already focused in iframe scope", () => {
    const { iframeDocument, root } = setupIframeRoot();

    const FocusInside = defineComponent({
      setup() {
        onMounted(() => {
          const target = iframeDocument.getElementById("input2");
          if (target instanceof HTMLElement) {
            target.focus();
          }
        });
        return () => null;
      },
    });

    const wrapper = mount(FocusScope, {
      attachTo: root,
      props: { autoFocus: true },
      slots: {
        default: () => [
          h("div"),
          h("input", { id: "input1" }),
          h("input", { id: "input2" }),
          h("input", { id: "input3" }),
          h(FocusInside),
        ],
      },
    });

    const input2 = wrapper.get("#input2").element as HTMLInputElement;
    expect(iframeDocument.activeElement).toBe(input2);
    wrapper.unmount();
  });

  it("moves focus forward via focus manager inside iframe scope", () => {
    const { iframeDocument, root } = setupIframeRoot();

    const Item = defineComponent({
      props: {
        id: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        const manager = useFocusManager();
        return () =>
          h("div", {
            id: props.id,
            tabIndex: -1,
            role: "button",
            onClick: () => manager?.focusNext(),
          });
      },
    });

    const wrapper = mount(FocusScope, {
      attachTo: root,
      slots: {
        default: () => [
          h(Item, { id: "item1" }),
          h(Item, { id: "item2" }),
          h(Item, { id: "item3" }),
        ],
      },
    });

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item2 = wrapper.get("#item2").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item1.focus();
    item1.click();
    expect(iframeDocument.activeElement).toBe(item2);

    item2.click();
    expect(iframeDocument.activeElement).toBe(item3);

    item3.click();
    expect(iframeDocument.activeElement).toBe(item3);

    wrapper.unmount();
  });

  it("moves focus forward with wrap via focus manager inside iframe scope", () => {
    const { iframeDocument, root } = setupIframeRoot();

    const Item = defineComponent({
      props: {
        id: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        const manager = useFocusManager();
        return () =>
          h("div", {
            id: props.id,
            tabIndex: -1,
            role: "button",
            onClick: () => manager?.focusNext({ wrap: true }),
          });
      },
    });

    const wrapper = mount(FocusScope, {
      attachTo: root,
      slots: {
        default: () => [
          h(Item, { id: "item1" }),
          h(Item, { id: "item2" }),
          h(Item, { id: "item3" }),
        ],
      },
    });

    const item1 = wrapper.get("#item1").element as HTMLDivElement;
    const item2 = wrapper.get("#item2").element as HTMLDivElement;
    const item3 = wrapper.get("#item3").element as HTMLDivElement;

    item1.focus();
    item1.click();
    expect(iframeDocument.activeElement).toBe(item2);

    item2.click();
    expect(iframeDocument.activeElement).toBe(item3);

    item3.click();
    expect(iframeDocument.activeElement).toBe(item1);

    wrapper.unmount();
  });
});
