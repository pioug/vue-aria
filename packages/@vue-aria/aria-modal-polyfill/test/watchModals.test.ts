import { afterEach, describe, expect, it } from "vitest";
import { watchModals } from "../src";

function flushMutations() {
  return Promise.resolve().then(() => Promise.resolve());
}

function createModalContainer(id: string) {
  const container = document.createElement("div");
  container.dataset.container = id;
  const modal = document.createElement("div");
  modal.dataset.ismodal = "true";
  modal.setAttribute("role", "dialog");
  modal.tabIndex = -1;
  container.append(modal);
  return { container, modal };
}

describe("watchModals", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hides non-modal content while a modal is mounted and restores it on removal", async () => {
    const root = document.createElement("div");
    root.id = "root";
    const content = document.createElement("main");
    content.textContent = "page content";
    root.append(content);
    document.body.append(root);

    const stopWatching = watchModals("#root", { document });
    const { container, modal } = createModalContainer("modal-1");
    root.append(container);
    await flushMutations();

    expect(content.getAttribute("aria-hidden")).toBe("true");
    expect(modal.getAttribute("aria-hidden")).toBeNull();

    root.removeChild(container);
    await flushMutations();
    expect(content.getAttribute("aria-hidden")).toBeNull();

    stopWatching();
  });

  it("tracks nested modal containers and restores previous hidden state", async () => {
    const root = document.createElement("div");
    root.id = "root";
    const content = document.createElement("section");
    content.textContent = "outside";
    root.append(content);
    document.body.append(root);

    const stopWatching = watchModals("#root", { document });

    const outer = createModalContainer("outer");
    root.append(outer.container);
    await flushMutations();
    expect(content.getAttribute("aria-hidden")).toBe("true");

    const inner = createModalContainer("inner");
    root.append(inner.container);
    await flushMutations();
    expect(outer.container.getAttribute("aria-hidden")).toBe("true");

    root.removeChild(inner.container);
    await flushMutations();
    expect(outer.container.getAttribute("aria-hidden")).toBeNull();
    expect(content.getAttribute("aria-hidden")).toBe("true");

    root.removeChild(outer.container);
    await flushMutations();
    expect(content.getAttribute("aria-hidden")).toBeNull();

    stopWatching();
  });

  it("keeps live announcer visible while a modal is open", async () => {
    const root = document.createElement("div");
    root.id = "root";
    const content = document.createElement("div");
    content.textContent = "outside";
    root.append(content);

    const liveAnnouncer = document.createElement("div");
    liveAnnouncer.dataset.liveAnnouncer = "true";
    liveAnnouncer.textContent = "announcer";
    document.body.append(liveAnnouncer);
    document.body.append(root);

    const stopWatching = watchModals("#root", { document });
    const { container } = createModalContainer("modal-1");
    root.append(container);
    await flushMutations();

    expect(content.getAttribute("aria-hidden")).toBe("true");
    expect(liveAnnouncer.getAttribute("aria-hidden")).toBeNull();

    stopWatching();
  });

  it("returns no-op cleanup when selector is not found or document is missing", () => {
    const stopMissingSelector = watchModals(".does-not-exist", { document });
    expect(() => stopMissingSelector()).not.toThrow();

    const stopMissingDocument = watchModals("body", { document: undefined });
    expect(() => stopMissingDocument()).not.toThrow();
  });
});
