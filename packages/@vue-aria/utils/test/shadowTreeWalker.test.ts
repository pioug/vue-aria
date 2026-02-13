import { afterEach, describe, expect, it, vi } from "vitest";
import { disableShadowDOM, enableShadowDOM } from "@vue-aria/flags";
import { createShadowTreeWalker } from "../src/shadowdom/ShadowTreeWalker";

function appendFlatTree(root: Element | ShadowRoot, suffix = "") {
  root.innerHTML = `
    <div id="div-one${suffix}"></div>
    <input id="input-one${suffix}" />
    <div id="div-two${suffix}"></div>
    <input id="input-two${suffix}" />
    <div id="div-three${suffix}"></div>
    <input id="input-three${suffix}" />
    <div id="div-four${suffix}"></div>
  `;
}

function createInputOnlyFilter() {
  return (node: Node) => {
    if (node instanceof HTMLElement && node.tagName === "INPUT") {
      return NodeFilter.FILTER_ACCEPT;
    }

    return NodeFilter.FILTER_SKIP;
  };
}

describe("ShadowTreeWalker", () => {
  afterEach(() => {
    disableShadowDOM();
    document.body.innerHTML = "";
  });

  it("walks through the dom like native tree walker in non-shadow mode", () => {
    appendFlatTree(document.body);

    const filterFn = createInputOnlyFilter();
    const nativeWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ALL,
      filterFn as unknown as NodeFilter
    );
    const walker = createShadowTreeWalker(
      document,
      document.body,
      undefined,
      filterFn as unknown as NodeFilter
    );

    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.firstChild()).toBe(nativeWalker.firstChild());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.nextNode()).toBe(nativeWalker.nextNode());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.previousNode()).toBe(nativeWalker.previousNode());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.lastChild()).toBe(nativeWalker.lastChild());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
  });

  it("walks through nested dom with filter object and matching calls", () => {
    document.body.innerHTML = `
      <div id="div-one">
        <input id="input-one" />
        <div id="div-two">
          <input id="input-two" />
          <div id="div-three"></div>
        </div>
        <input id="input-three" />
        <div id="div-four"></div>
      </div>
    `;

    const nativeFilter = { acceptNode: vi.fn(createInputOnlyFilter()) };
    const shadowFilter = { acceptNode: vi.fn(createInputOnlyFilter()) };
    const nativeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ALL, nativeFilter);
    const walker = createShadowTreeWalker(document, document.body, undefined, shadowFilter);

    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.firstChild()).toBe(nativeWalker.firstChild());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.nextNode()).toBe(nativeWalker.nextNode());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.previousNode()).toBe(nativeWalker.previousNode());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.lastChild()).toBe(nativeWalker.lastChild());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);

    expect(shadowFilter.acceptNode).toHaveBeenCalledTimes(nativeFilter.acceptNode.mock.calls.length);
    for (let i = 0; i < nativeFilter.acceptNode.mock.calls.length; i++) {
      expect(shadowFilter.acceptNode.mock.calls[i][0]).toBe(nativeFilter.acceptNode.mock.calls[i][0]);
    }
  });

  it("walks through a root shadow dom and matches native traversal", () => {
    enableShadowDOM();

    const host = document.createElement("div");
    host.id = "host";
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: "open" });
    appendFlatTree(shadowRoot);

    const filterFn = createInputOnlyFilter();
    const nativeWalker = document.createTreeWalker(
      shadowRoot,
      NodeFilter.SHOW_ALL,
      filterFn as unknown as NodeFilter
    );
    const walker = createShadowTreeWalker(
      document,
      document.body,
      undefined,
      filterFn as unknown as NodeFilter
    );

    expect(walker.firstChild()).toBe(nativeWalker.firstChild());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.firstChild()).toBe(nativeWalker.firstChild());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.nextNode()).toBe(nativeWalker.nextNode());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.previousNode()).toBe(nativeWalker.previousNode());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.lastChild()).toBe(nativeWalker.lastChild());
    expect(walker.currentNode).toBe(nativeWalker.currentNode);
    expect(walker.lastChild()).toBe(nativeWalker.lastChild());
  });
});
