import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "../src/Dialog";

describe("Dialog", () => {
  it("focuses the dialog when mounted", () => {
    const wrapper = mount(Dialog as any, {
      slots: {
        default: () => "contents",
      },
      attachTo: document.body,
    });

    const dialog = wrapper.get('[role="dialog"]');
    expect(document.activeElement).toBe(dialog.element);
  });

  it("respects aria-labelledby", () => {
    const wrapper = mount(
      {
        components: { Dialog },
        template: `
          <div>
            <Dialog aria-labelledby="batman">
              <h2>The Title</h2>
            </Dialog>
            <span id="batman">Good grammar is essential, Robin.</span>
          </div>
        `,
      },
      { attachTo: document.body }
    );

    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.attributes("aria-labelledby")).toBe("batman");
  });

  it("respects aria-label over generated labels", () => {
    const wrapper = mount(Dialog as any, {
      attrs: {
        "aria-label": "robin",
      },
      slots: {
        default: () => "<h2>The Title</h2>",
      },
      attachTo: document.body,
    });

    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.attributes("aria-label")).toBe("robin");
    expect(dialog.attributes("aria-labelledby")).toBeUndefined();
  });

  it("supports custom data attributes", () => {
    const wrapper = mount(Dialog as any, {
      attrs: {
        "data-testid": "test",
      },
      slots: {
        default: () => "contents",
      },
    });

    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.attributes("data-testid")).toBe("test");
  });

  it("renders dismiss button when dismissable", async () => {
    const onDismiss = vi.fn();
    const wrapper = mount(Dialog as any, {
      props: {
        isDismissable: true,
        onDismiss,
      },
      slots: {
        default: () => "contents",
      },
    });

    const closeButton = wrapper.get('[data-testid="dialog-close-button"]');
    await closeButton.trigger("click");
    expect(onDismiss).toHaveBeenCalled();
  });
});
