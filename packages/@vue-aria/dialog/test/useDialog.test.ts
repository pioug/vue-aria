import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, onMounted, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useDialog } from "../src";

const Example = defineComponent({
  props: {
    role: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const dialogRef = ref<HTMLElement | null>(null);
    const { dialogProps } = useDialog(
      {
        role: () => props.role as "dialog" | "alertdialog" | undefined,
      },
      dialogRef
    );

    return () =>
      h(
        "div",
        {
          ref: dialogRef,
          "data-testid": "test",
          ...dialogProps.value,
        },
        slots.default?.()
      );
  },
});

describe("useDialog", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it('has role="dialog" by default', () => {
    const wrapper = mount(Example, { attachTo: document.body });
    expect(wrapper.get('[data-testid="test"]').attributes("role")).toBe("dialog");
  });

  it('accepts role="alertdialog"', () => {
    const wrapper = mount(Example, {
      attachTo: document.body,
      props: {
        role: "alertdialog",
      },
    });
    expect(wrapper.get('[data-testid="test"]').attributes("role")).toBe("alertdialog");
  });

  it("focuses the dialog on mount", async () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    const wrapper = mount(Example, { attachTo: document.body });
    const dialog = wrapper.get('[data-testid="test"]').element;
    await wrapper.vm.$nextTick();

    expect(wrapper.get('[data-testid="test"]').attributes("tabindex")).toBe("-1");
    expect(focusSpy.mock.instances).toContain(dialog);
    focusSpy.mockRestore();
  });

  it("does not steal focus from focused content inside", async () => {
    const AutoFocusInput = defineComponent({
      setup() {
        const inputRef = ref<HTMLInputElement | null>(null);

        onMounted(() => {
          inputRef.value?.focus();
        });

        return () =>
          h("input", {
            ref: inputRef,
            "data-testid": "input",
          });
      },
    });

    const wrapper = mount(Example, {
      attachTo: document.body,
      slots: {
        default: () => h(AutoFocusInput),
      },
    });

    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(wrapper.get('[data-testid="input"]').element);
  });
});
