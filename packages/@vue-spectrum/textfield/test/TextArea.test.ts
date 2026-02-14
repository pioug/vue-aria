import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { TextArea } from "../src/TextArea";

const TEST_ID = "test-id";

describe("TextArea", () => {
  let oldScrollHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    oldScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      value: 500,
    });
  });

  afterEach(() => {
    if (oldScrollHeight === undefined) {
      delete (HTMLElement.prototype as any).scrollHeight;
    } else {
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", oldScrollHeight);
    }
    document.body.innerHTML = "";
  });

  it("renders textarea with default behavior", async () => {
    const wrapper = mount(TextArea as any, {
      attrs: {
        "aria-label": "megatron",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.element.tagName).toBe("TEXTAREA");
    expect(input.attributes("type")).toBeUndefined();

    await input.setValue("hello");
    expect((input.element as HTMLTextAreaElement).value).toBe("hello");
  });

  it("quiet variant adjusts vertical height on mount", async () => {
    const wrapper = mount(TextArea as any, {
      props: {
        isQuiet: true,
      },
      attrs: {
        "aria-label": "megatron",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    await nextTick();
    const input = wrapper.get(`[data-testid="${TEST_ID}"]`).element as HTMLTextAreaElement;
    expect(input.style.height).toBe("500px");
  });

  it("default variant adjusts height when text grows", async () => {
    const wrapper = mount(TextArea as any, {
      attrs: {
        "aria-label": "megatron",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      value: 1000,
    });

    await input.setValue("15");
    expect((input.element as HTMLTextAreaElement).style.height).toBe("1000px");
  });

  it("does not change height when a height prop is set", async () => {
    const wrapper = mount(TextArea as any, {
      props: {
        height: "size-2000",
      },
      attrs: {
        "aria-label": "megatron",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect((input.element as HTMLTextAreaElement).style.height).toBe("");
    await input.setValue("15");
    expect((input.element as HTMLTextAreaElement).style.height).toBe("");
  });

  it("supports form reset", async () => {
    const Test = defineComponent({
      setup: () => () =>
        h("form", null, [
          h(TextArea as any, { "data-testid": "area", label: "Area", defaultValue: "Devon" }),
          h("input", { type: "reset", "data-testid": "reset" }),
        ]),
    });

    const wrapper = mount(Test, { attachTo: document.body });
    const input = wrapper.get('[data-testid="area"]');
    const reset = wrapper.get('[data-testid="reset"]');

    expect((input.element as HTMLTextAreaElement).value).toBe("Devon");
    await input.setValue("Devon test");
    expect((input.element as HTMLTextAreaElement).value).toBe("Devon test");
    await reset.trigger("click");
    await nextTick();
    expect((input.element as HTMLTextAreaElement).value).toBe("");
  });
});
