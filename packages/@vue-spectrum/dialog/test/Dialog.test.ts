import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { Dialog } from "../src";

describe("Dialog", () => {
  it("auto focuses the dialog itself", async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      slots: {
        default: () => [
          h("input", { "data-testid": "input1" }),
          h("input", { "data-testid": "input2" }),
        ],
      },
    });

    await nextTick();
    await Promise.resolve();

    const dialog = wrapper.get("[role=\"dialog\"]").element as HTMLElement;
    expect(document.activeElement).toBe(dialog);

    wrapper.unmount();
  });

  it("autofocuses an element with autofocus", async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      slots: {
        default: () => [
          h("input", { "data-testid": "input1" }),
          h("input", { "data-testid": "input2", autofocus: true }),
        ],
      },
    });

    await nextTick();
    await Promise.resolve();

    const input2 = wrapper.get("[data-testid=\"input2\"]").element as HTMLElement;
    expect(document.activeElement).toBe(input2);

    wrapper.unmount();
  });

  it("supports aria-label", () => {
    const wrapper = mount(Dialog, {
      props: {
        "aria-label": "robin",
      } as Record<string, unknown>,
      slots: {
        default: () => "contents",
      },
    });

    const dialog = wrapper.get("[role=\"dialog\"]");
    expect(dialog.attributes("aria-label")).toBe("robin");
  });

  it("does not set aria-labelledby by default", () => {
    const wrapper = mount(Dialog, {
      slots: {
        default: () => "contents",
      },
    });

    const dialog = wrapper.get("[role=\"dialog\"]");
    expect(dialog.attributes("aria-labelledby")).toBeUndefined();
  });

  it("uses aria-labelledby when provided", () => {
    const wrapper = mount(Dialog, {
      props: {
        "aria-labelledby": "batman",
      } as Record<string, unknown>,
      slots: {
        default: () => "contents",
      },
    });

    const dialog = wrapper.get("[role=\"dialog\"]");
    expect(dialog.attributes("aria-labelledby")).toBe("batman");
  });

  it("aria-label takes precedence over aria-labelledby fallback", () => {
    const wrapper = mount(Dialog, {
      props: {
        "aria-label": "robin",
      } as Record<string, unknown>,
      slots: {
        default: () => "contents",
      },
    });

    const dialog = wrapper.get("[role=\"dialog\"]");
    expect(dialog.attributes("aria-label")).toBe("robin");
    expect(dialog.attributes("aria-labelledby")).toBeUndefined();
  });

  it("links aria-labelledby to the first heading when no explicit label is provided", () => {
    const wrapper = mount(Dialog, {
      slots: {
        default: () => [
          h("h2", null, "Dialog title"),
          h("p", null, "Dialog body"),
        ],
      },
    });

    const dialog = wrapper.get("[role=\"dialog\"]");
    const labelledby = dialog.attributes("aria-labelledby");
    expect(labelledby).toBeTruthy();

    const heading = wrapper.get("h2");
    expect(heading.attributes("id")).toBe(labelledby);
  });

  it("explicit aria-labelledby takes precedence over auto heading linkage", () => {
    const wrapper = mount(Dialog, {
      props: {
        "aria-labelledby": "batman",
      } as Record<string, unknown>,
      slots: {
        default: () => [
          h("h2", null, "Dialog title"),
          h("p", null, "Dialog body"),
        ],
      },
    });

    const dialog = wrapper.get("[role=\"dialog\"]");
    expect(dialog.attributes("aria-labelledby")).toBe("batman");
  });

  it("supports custom data attributes", () => {
    const wrapper = mount(Dialog, {
      props: {
        "data-testid": "test",
      } as Record<string, unknown>,
      slots: {
        default: () => "contents",
      },
    });

    const dialog = wrapper.get("[data-testid=\"test\"]");
    expect(dialog.attributes("data-testid")).toBe("test");
  });

  it("renders dismiss button when dismissable", async () => {
    const onDismiss = vi.fn();
    const wrapper = mount(Dialog, {
      props: {
        isDismissable: true,
        onDismiss,
      },
      slots: {
        default: () => "contents",
      },
    });

    await wrapper.get("button[aria-label=\"Dismiss\"]").trigger("click");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("localizes dismiss button aria-label from provider locale", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
        locale: "fr-FR",
      },
      slots: {
        default: () => h(Dialog, { isDismissable: true }, () => "contents"),
      },
    });

    const dismissButton = wrapper.get("button.spectrum-Dialog-closeButton");
    expect(dismissButton.attributes("aria-label")).toBe("Rejeter");
  });
});
