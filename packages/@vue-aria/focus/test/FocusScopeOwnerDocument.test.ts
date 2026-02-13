import { mount } from "@vue/test-utils";
import { h } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { FocusScope } from "../src";

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
});
