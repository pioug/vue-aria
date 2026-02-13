import { describe, expect, it, vi } from "vitest";
import { getFocusableTreeWalker } from "../src/FocusScope";
import {
  dispatchVirtualBlur,
  dispatchVirtualFocus,
  getVirtuallyFocusedElement,
  moveVirtualFocus,
} from "../src/virtualFocus";

describe("virtualFocus", () => {
  it("dispatchVirtualFocus and dispatchVirtualBlur emit focus events", () => {
    const from = document.createElement("button");
    const to = document.createElement("button");
    document.body.append(from, to);

    const onFocus = vi.fn();
    const onFocusIn = vi.fn();
    const onBlur = vi.fn();
    const onFocusOut = vi.fn();

    to.addEventListener("focus", onFocus);
    to.addEventListener("focusin", onFocusIn);
    from.addEventListener("blur", onBlur);
    from.addEventListener("focusout", onFocusOut);

    dispatchVirtualFocus(to, from);
    dispatchVirtualBlur(from, to);

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocusIn).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onFocusOut).toHaveBeenCalledTimes(1);

    from.remove();
    to.remove();
  });

  it("moveVirtualFocus shifts virtual focus events", () => {
    const from = document.createElement("button");
    const to = document.createElement("button");
    document.body.append(from, to);
    from.focus();

    const blurSpy = vi.fn();
    const focusSpy = vi.fn();
    from.addEventListener("blur", blurSpy);
    to.addEventListener("focus", focusSpy);

    moveVirtualFocus(to);

    expect(blurSpy).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledTimes(1);

    from.remove();
    to.remove();
  });

  it("returns active descendant when set", () => {
    const input = document.createElement("input");
    const option = document.createElement("div");
    option.id = "active-option";
    input.setAttribute("aria-activedescendant", option.id);
    document.body.append(input, option);
    input.focus();

    expect(getVirtuallyFocusedElement(document)).toBe(option);

    input.remove();
    option.remove();
  });
});

describe("getFocusableTreeWalker", () => {
  it("iterates tabbable descendants", () => {
    const root = document.createElement("div");
    const buttonA = document.createElement("button");
    const div = document.createElement("div");
    const buttonB = document.createElement("button");

    root.append(buttonA, div, buttonB);
    document.body.appendChild(root);

    const walker = getFocusableTreeWalker(root, { tabbable: true });
    walker.currentNode = root;

    expect(walker.nextNode()).toBe(buttonA);
    expect(walker.nextNode()).toBe(buttonB);

    root.remove();
  });
});
