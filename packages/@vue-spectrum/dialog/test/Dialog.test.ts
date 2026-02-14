import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "../src/Dialog";
import { Heading } from "../src/Heading";
import { Header } from "../src/Header";
import { Content } from "../src/Content";
import { Footer } from "../src/Footer";
import { ButtonGroup } from "../src/ButtonGroup";

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

  it("applies large class for modal dialogs by default", () => {
    const wrapper = mount(Dialog as any, {
      props: {
        type: "modal",
      },
      slots: {
        default: () => "contents",
      },
    });

    expect(wrapper.get("section").classes()).toContain("spectrum-Dialog--large");
  });

  it("applies small class for popover dialogs by default", () => {
    const wrapper = mount(Dialog as any, {
      props: {
        type: "popover",
      },
      slots: {
        default: () => "contents",
      },
    });

    expect(wrapper.get("section").classes()).toContain("spectrum-Dialog--small");
  });

  it("applies fullscreen class variants", () => {
    const fullscreen = mount(Dialog as any, {
      props: {
        type: "fullscreen",
      },
      slots: {
        default: () => "contents",
      },
    });

    const takeover = mount(Dialog as any, {
      props: {
        type: "fullscreenTakeover",
      },
      slots: {
        default: () => "contents",
      },
    });

    expect(fullscreen.get("section").classes()).toContain("spectrum-Dialog--fullscreen");
    expect(takeover.get("section").classes()).toContain("spectrum-Dialog--fullscreenTakeover");
  });

  it("applies dismissable class when enabled", () => {
    const wrapper = mount(Dialog as any, {
      props: {
        isDismissable: true,
      },
      slots: {
        default: () => "contents",
      },
    });

    expect(wrapper.get("section").classes()).toContain("spectrum-Dialog--dismissable");
  });

  it("respects explicit alertdialog role", () => {
    const wrapper = mount(Dialog as any, {
      props: {
        role: "alertdialog",
      },
      slots: {
        default: () => "contents",
      },
    });

    expect(wrapper.get("section").attributes("role")).toBe("alertdialog");
  });

  it("applies UNSAFE_className and UNSAFE_style to the dialog root", () => {
    const wrapper = mount(Dialog as any, {
      props: {
        UNSAFE_className: "custom-dialog",
        UNSAFE_style: {
          borderWidth: "2px",
          borderStyle: "solid",
        },
      },
      slots: {
        default: () => "contents",
      },
    });

    const root = wrapper.get("section.custom-dialog");
    expect(root.attributes("style")).toContain("border-width: 2px");
    expect(root.attributes("style")).toContain("border-style: solid");
  });

  it("wires Heading ids to dialog aria-labelledby", () => {
    const wrapper = mount(
      {
        components: { Dialog, Heading },
        template: `
          <Dialog>
            <Heading>Dialog title</Heading>
            <p>Dialog body</p>
          </Dialog>
        `,
      },
      { attachTo: document.body }
    );

    const dialog = wrapper.get('[role="dialog"]');
    const heading = wrapper.get(".spectrum-Dialog-heading");
    expect(heading.attributes("id")).toBeTruthy();
    expect(dialog.attributes("aria-labelledby")).toBe(heading.attributes("id"));
  });

  it("renders composition slot class wrappers", () => {
    const wrapper = mount(
      {
        components: { Dialog, Header, Content, Footer, ButtonGroup },
        template: `
          <Dialog>
            <Header>Header</Header>
            <Content>Body</Content>
            <Footer>
              <ButtonGroup>
                <button>Confirm</button>
              </ButtonGroup>
            </Footer>
          </Dialog>
        `,
      },
      { attachTo: document.body }
    );

    expect(wrapper.find(".spectrum-Dialog-header").exists()).toBe(true);
    expect(wrapper.find(".spectrum-Dialog-content").exists()).toBe(true);
    expect(wrapper.find(".spectrum-Dialog-footer").exists()).toBe(true);
    expect(wrapper.find(".spectrum-Dialog-buttonGroup").exists()).toBe(true);
    expect(wrapper.find(".spectrum-Dialog-buttonGroup--noFooter").exists()).toBe(false);
  });

  it("applies noFooter button-group class when outside Footer", () => {
    const wrapper = mount(
      {
        components: { Dialog, ButtonGroup },
        template: `
          <Dialog>
            <ButtonGroup>
              <button>Confirm</button>
            </ButtonGroup>
          </Dialog>
        `,
      },
      { attachTo: document.body }
    );

    expect(wrapper.find(".spectrum-Dialog-buttonGroup").exists()).toBe(true);
    expect(wrapper.find(".spectrum-Dialog-buttonGroup--noFooter").exists()).toBe(true);
  });
});
