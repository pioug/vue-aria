import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import {
  provideOverlayProvider,
  useModal,
  useModalProvider,
} from "../src";

const InnerModal = defineComponent({
  name: "InnerModal",
  setup() {
    provideOverlayProvider();
    const { modalProviderProps } = useModalProvider();
    const { modalProps } = useModal();

    return () =>
      h(
        "div",
        {
          "data-testid": "inner-modal-provider",
          ...modalProviderProps.value,
        },
        [
          h("div", {
            "data-testid": "inner-modal",
            ...modalProps.value,
          }),
        ]
      );
  },
});

const Modal = defineComponent({
  name: "Modal",
  props: {
    showInner: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    provideOverlayProvider();
    const { modalProviderProps } = useModalProvider();
    const { modalProps } = useModal({
      isDisabled: computed(() => props.isDisabled),
    });

    return () =>
      h(
        "div",
        {
          "data-testid": "modal-provider",
          ...modalProviderProps.value,
        },
        [
          h("div", {
            "data-testid": "modal",
            ...modalProps.value,
          }),
          props.showInner ? h(InnerModal) : null,
        ]
      );
  },
});

const Example = defineComponent({
  name: "Example",
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    showInner: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    provideOverlayProvider();
    const { modalProviderProps } = useModalProvider();

    return () =>
      h(
        "div",
        {
          "data-testid": "root-provider",
          ...modalProviderProps.value,
        },
        [
          "Root provider",
          props.showModal
            ? h(Modal, {
                showInner: props.showInner,
                isDisabled: props.isDisabled,
              })
            : null,
        ]
      );
  },
});

describe("useModal", () => {
  it("sets aria-hidden on parent provider when modal mounts", async () => {
    const wrapper = mount(Example);

    expect(wrapper.get('[data-testid="root-provider"]').attributes("aria-hidden")).toBeUndefined();

    await wrapper.setProps({ showModal: true });

    expect(wrapper.get('[data-testid="root-provider"]').attributes("aria-hidden")).toBe("true");
    expect(wrapper.get('[data-testid="modal-provider"]').attributes("aria-hidden")).toBeUndefined();

    await wrapper.setProps({ showModal: false });

    expect(wrapper.get('[data-testid="root-provider"]').attributes("aria-hidden")).toBeUndefined();
  });

  it("supports nested modals", async () => {
    const wrapper = mount(Example, {
      props: {
        showModal: true,
      },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.get('[data-testid="root-provider"]').attributes("aria-hidden")).toBe("true");
    expect(wrapper.get('[data-testid="modal-provider"]').attributes("aria-hidden")).toBeUndefined();

    await wrapper.setProps({ showInner: true });

    expect(wrapper.get('[data-testid="root-provider"]').attributes("aria-hidden")).toBe("true");
    expect(wrapper.get('[data-testid="modal-provider"]').attributes("aria-hidden")).toBe("true");
    expect(wrapper.get('[data-testid="inner-modal-provider"]').attributes("aria-hidden")).toBeUndefined();

    await wrapper.setProps({ showInner: false });

    expect(wrapper.get('[data-testid="root-provider"]').attributes("aria-hidden")).toBe("true");
    expect(wrapper.get('[data-testid="modal-provider"]').attributes("aria-hidden")).toBeUndefined();
  });

  it("supports disabled modal behavior", async () => {
    const wrapper = mount(Example, {
      props: {
        showModal: true,
        isDisabled: true,
      },
    });

    expect(wrapper.get('[data-testid="modal"]').attributes("data-ismodal")).toBe("false");
    expect(wrapper.get('[data-testid="root-provider"]').attributes("aria-hidden")).toBeUndefined();

    await wrapper.setProps({ isDisabled: false });

    expect(wrapper.get('[data-testid="modal"]').attributes("data-ismodal")).toBe("true");
    expect(wrapper.get('[data-testid="root-provider"]').attributes("aria-hidden")).toBe("true");
  });

  it("throws when no modal provider exists", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const BrokenModal = defineComponent({
      setup() {
        useModal();
        return () => h("div");
      },
    });

    expect(() => mount(BrokenModal)).toThrowError("Modal is not contained within a provider");
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });
});
