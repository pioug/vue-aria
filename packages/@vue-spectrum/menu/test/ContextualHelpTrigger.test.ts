import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { Dialog } from "@vue-spectrum/dialog";
import { ContextualHelpTrigger } from "../src";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await nextTick();
}

describe("ContextualHelpTrigger", () => {
  it("renders only the trigger content when available", async () => {
    const tree = render(ContextualHelpTrigger, {
      props: {
        isUnavailable: false,
      },
      slots: {
        default: () => [
          h("button", { type: "button" }, "Menu item"),
          h(Dialog, null, {
            default: () => "Help content",
          }),
        ],
      },
    });

    expect(tree.getByRole("button", { name: "Menu item" })).toBeTruthy();
    await flushOverlay();
    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
  });

  it("opens dialog content when unavailable", async () => {
    const user = userEvent.setup({ skipHover: true });
    const tree = render(ContextualHelpTrigger, {
      props: {
        isUnavailable: true,
      },
      slots: {
        default: () => [
          h("button", { type: "button" }, "Unavailable item"),
          h(Dialog, null, {
            default: () => "Help content",
          }),
        ],
      },
    });

    await user.click(tree.getByRole("button", { name: "Unavailable item" }));
    await flushOverlay();

    const dialog = document.body.querySelector("[role=\"dialog\"]");
    expect(dialog).not.toBeNull();
    expect(document.body.textContent).toContain("Help content");
  });

  it("opens on hover when unavailable", async () => {
    const tree = render(ContextualHelpTrigger, {
      props: {
        isUnavailable: true,
      },
      slots: {
        default: () => [
          h("button", { type: "button" }, "Unavailable item"),
          h(Dialog, null, {
            default: () => "Hover help content",
          }),
        ],
      },
    });

    const trigger = tree.getByRole("button", { name: "Unavailable item" });
    fireEvent.mouseEnter(trigger);
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.textContent).toContain("Hover help content");
  });

  it("opens on ArrowRight when unavailable", async () => {
    const tree = render(ContextualHelpTrigger, {
      props: {
        isUnavailable: true,
      },
      slots: {
        default: () => [
          h("button", { type: "button" }, "Unavailable item"),
          h(Dialog, null, {
            default: () => "Keyboard help content",
          }),
        ],
      },
    });

    const trigger = tree.getByRole("button", { name: "Unavailable item" });
    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.textContent).toContain("Keyboard help content");
  });

  it("does not open on hover when available", async () => {
    const tree = render(ContextualHelpTrigger, {
      props: {
        isUnavailable: false,
      },
      slots: {
        default: () => [
          h("button", { type: "button" }, "Available item"),
          h(Dialog, null, {
            default: () => "Help content",
          }),
        ],
      },
    });

    const trigger = tree.getByRole("button", { name: "Available item" });
    fireEvent.mouseEnter(trigger);
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
  });

  it("does not open on ArrowRight when available", async () => {
    const tree = render(ContextualHelpTrigger, {
      props: {
        isUnavailable: false,
      },
      slots: {
        default: () => [
          h("button", { type: "button" }, "Available item"),
          h(Dialog, null, {
            default: () => "Help content",
          }),
        ],
      },
    });

    const trigger = tree.getByRole("button", { name: "Available item" });
    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
  });
});
