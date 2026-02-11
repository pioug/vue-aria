import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { ContextualHelp } from "../src/ContextualHelp";
import { DropZone } from "../src/DropZone";
import { Form } from "../src/Form";
import { Provider } from "../src/Provider";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("@vue-spectrum/s2 Form + ContextualHelp + DropZone", () => {
  it("renders S2 form baseline class", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Form,
            {
              "aria-label": "Example form",
              "data-testid": "form",
            },
            {
              default: () => h("input", { name: "name" }),
            }
          ),
      },
    });

    await wrapper.vm.$nextTick();
    const form = wrapper.get("[data-testid=\"form\"]");
    expect(form.element.tagName).toBe("FORM");
    expect(form.classes()).toContain("s2-Form");
  });

  it("opens contextual help popover", async () => {
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(ContextualHelp, null, {
            default: () => h("h3", null, "Help title"),
          }),
      },
    });

    await wrapper.vm.$nextTick();
    wrapper.get(".s2-ContextualHelp");
    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    wrapper.unmount();
  });

  it("renders dropzone baseline class", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            DropZone,
            {
              "data-testid": "dropzone",
            },
            {
              default: () => h("div", null, "Drop files"),
            }
          ),
      },
    });

    await wrapper.vm.$nextTick();
    const dropzone = wrapper.get("[data-testid=\"dropzone\"]");
    expect(dropzone.classes()).toContain("s2-DropZone");
    expect(dropzone.text()).toContain("Drop files");
  });
});
