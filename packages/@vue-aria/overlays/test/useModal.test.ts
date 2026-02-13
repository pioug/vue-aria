import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, type PropType } from "vue";
import { describe, expect, it } from "vitest";
import { OverlayContainer, OverlayProvider, useModal } from "../src/useModal";

const ModalDOM = defineComponent({
  name: "ModalDOM",
  setup(_, { slots }) {
    const { modalProps } = useModal();
    return () => h("div", { ...modalProps, "data-testid": "modal" }, slots.default?.());
  },
});

const Modal = defineComponent({
  name: "Modal",
  props: {
    container: Object as PropType<Element | null>,
  },
  setup(props, { slots }) {
    return () =>
      h(
        OverlayContainer,
        { portalContainer: props.container as Element | null },
        {
          default: () => [h(ModalDOM, null, slots)],
        }
      );
  },
});

const Example = defineComponent({
  name: "Example",
  props: {
    showModal: Boolean,
    container: Object as PropType<Element | null>,
  },
  setup(props, { slots }) {
    return () =>
      h(OverlayProvider, { "data-testid": "root-provider" }, {
        default: () => [
          "This is the root provider.",
          props.showModal
            ? h(Modal, { container: props.container as Element | null }, slots)
            : null,
        ],
      });
  },
});

describe("useModal", () => {
  it("sets aria-hidden on parent provider while modal is open", async () => {
    const wrapper = mount(Example, {
      props: { showModal: false },
      attachTo: document.body,
    });

    const rootProvider = wrapper.get("[data-testid='root-provider']");
    expect(rootProvider.attributes("aria-hidden")).toBeUndefined();

    await wrapper.setProps({ showModal: true });
    await nextTick();

    expect(rootProvider.attributes("aria-hidden")).toBe("true");

    await wrapper.setProps({ showModal: false });
    await nextTick();

    expect(rootProvider.attributes("aria-hidden")).toBeUndefined();
    wrapper.unmount();
  });
});
