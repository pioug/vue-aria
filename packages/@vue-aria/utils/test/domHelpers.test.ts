import { afterEach, describe, expect, it } from "vitest";
import { disableShadowDOM, enableShadowDOM } from "@vue-aria/flags";
import { getActiveElement, getOwnerWindow } from "../src";

describe("getOwnerWindow", () => {
  afterEach(() => {
    disableShadowDOM();
  });

  it("returns window for null or undefined", () => {
    enableShadowDOM();
    expect(getOwnerWindow(null)).toBe(window);
    expect(getOwnerWindow(undefined)).toBe(window);
  });

  it("returns owner window for in-document elements", () => {
    enableShadowDOM();
    const div = document.createElement("div");
    document.body.appendChild(div);
    expect(getOwnerWindow(div)).toBe(window);
    div.remove();
  });
});

describe("getActiveElement", () => {
  afterEach(() => {
    disableShadowDOM();
  });

  it("returns active element in light DOM", () => {
    enableShadowDOM();
    const btn = document.createElement("button");
    document.body.appendChild(btn);
    btn.focus();
    expect(getActiveElement()).toBe(btn);
    btn.remove();
  });

  it("returns active element within nested shadow roots", () => {
    enableShadowDOM();

    const outerHost = document.createElement("div");
    const outerShadow = outerHost.attachShadow({ mode: "open" });
    const innerHost = document.createElement("div");
    outerShadow.appendChild(innerHost);

    const innerShadow = innerHost.attachShadow({ mode: "open" });
    const input = document.createElement("input");
    innerShadow.appendChild(input);

    document.body.appendChild(outerHost);
    input.focus();

    expect(getActiveElement()).toBe(input);

    outerHost.remove();
  });
});
