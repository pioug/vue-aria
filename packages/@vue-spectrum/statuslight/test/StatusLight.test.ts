import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { StatusLight } from "../src";

describe("StatusLight", () => {
  it("renders default content and supports id", () => {
    const wrapper = mount(StatusLight, {
      props: {
        id: "status-light",
      } as Record<string, unknown>,
      slots: {
        default: () => "StatusLight of Love",
      },
    });

    expect(wrapper.attributes("id")).toBe("status-light");
    expect(wrapper.text()).toContain("StatusLight of Love");
  });

  it("supports variant with aria-label and status role", () => {
    const wrapper = mount(StatusLight, {
      props: {
        id: "status-light",
        variant: "celery",
        role: "status",
        "aria-label": "StatusLight of Love",
      } as Record<string, unknown>,
    });

    expect(wrapper.attributes("id")).toBe("status-light");
    expect(wrapper.attributes("aria-label")).toBe("StatusLight of Love");
    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.classes()).toContain("spectrum-StatusLight--celery");
  });

  it("warns if no children and no aria-label", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    mount(StatusLight, {
      props: {
        id: "status-light",
        variant: "celery",
      } as Record<string, unknown>,
    });

    expect(spyWarn).toHaveBeenCalledWith(
      "If no children are provided, an aria-label must be specified"
    );
    spyWarn.mockRestore();
  });

  it("warns if a label is provided without a role", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    mount(StatusLight, {
      props: {
        id: "status-light",
        variant: "celery",
        "aria-label": "test",
      } as Record<string, unknown>,
    });

    expect(spyWarn).toHaveBeenCalledWith("A labelled StatusLight must have a role.");
    spyWarn.mockRestore();
  });

  it("supports disabled styling", () => {
    const wrapper = mount(StatusLight, {
      props: {
        id: "status-light",
        isDisabled: true,
      } as Record<string, unknown>,
      slots: {
        default: () => "StatusLight of Love",
      },
    });

    expect(wrapper.attributes("id")).toBe("status-light");
    expect(wrapper.classes()).toContain("is-disabled");
  });

  it("exposes UNSAFE_getDOMNode through component refs", () => {
    const statusRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "StatusLightRefTestApp",
      setup() {
        return () =>
          h(
            StatusLight,
            {
              ref: statusRef,
            },
            () => "StatusLight of Love"
          );
      },
    });

    const wrapper = mount(App);
    const statusLight = wrapper.findComponent(StatusLight);
    expect(statusRef.value?.UNSAFE_getDOMNode()).toBe(statusLight.element);
  });
});
