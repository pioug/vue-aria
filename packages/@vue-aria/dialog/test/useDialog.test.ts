import { defineComponent, h, nextTick, onMounted, ref } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { useDialog } from "../src";

const Example = defineComponent({
  props: {
    role: {
      type: String,
      required: false,
    },
    withInput: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const el = ref<HTMLElement | null>(null);
    const inputEl = ref<HTMLInputElement | null>(null);
    const refObj = {
      get current() {
        return el.value;
      },
      set current(value: HTMLElement | null) {
        el.value = value;
      },
    };

    onMounted(() => {
      if (props.withInput) {
        inputEl.value?.focus();
      }
    });

    const { dialogProps } = useDialog({ role: props.role as any }, refObj);

    return () =>
      h(
        "div",
        {
          ...dialogProps,
          ref: ((node: Element | null) => {
            refObj.current = node as HTMLElement | null;
          }) as any,
          "data-testid": "test",
        },
        props.withInput
          ? [h("input", { "data-testid": "input", autofocus: true, ref: inputEl as any })]
          : []
      );
  },
});

describe("useDialog", () => {
  it("has role='dialog' by default", async () => {
    const wrapper = mount(Example);
    await nextTick();
    const el = wrapper.get('[data-testid="test"]');
    expect(el.attributes("role")).toBe("dialog");
    wrapper.unmount();
  });

  it("accepts role='alertdialog'", async () => {
    const wrapper = mount(Example, { props: { role: "alertdialog" } });
    await nextTick();
    const el = wrapper.get('[data-testid="test"]');
    expect(el.attributes("role")).toBe("alertdialog");
    wrapper.unmount();
  });

  it("focuses the overlay on mount", async () => {
    const wrapper = mount(Example, { attachTo: document.body });
    await nextTick();
    const el = wrapper.get('[data-testid="test"]').element as HTMLElement;
    expect(el.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(el);
    wrapper.unmount();
  });

  it("does not steal focus when child is auto focused", async () => {
    const wrapper = mount(Example, { props: { withInput: true }, attachTo: document.body });
    await nextTick();
    const input = wrapper.get('[data-testid="input"]').element as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    wrapper.unmount();
  });
});
