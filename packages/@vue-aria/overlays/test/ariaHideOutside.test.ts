import { describe, expect, it } from "vitest";
import { ariaHideOutside } from "../src/ariaHideOutside";

describe("ariaHideOutside", () => {
  it("hides everything except provided element and restores on revert", () => {
    const checkboxOne = document.createElement("input");
    checkboxOne.type = "checkbox";
    const button = document.createElement("button");
    button.textContent = "Button";
    const checkboxTwo = document.createElement("input");
    checkboxTwo.type = "checkbox";

    document.body.append(checkboxOne, button, checkboxTwo);

    const revert = ariaHideOutside([button]);

    expect(checkboxOne.getAttribute("aria-hidden")).toBe("true");
    expect(checkboxTwo.getAttribute("aria-hidden")).toBe("true");
    expect(button.hasAttribute("aria-hidden")).toBe(false);

    revert();

    expect(checkboxOne.hasAttribute("aria-hidden")).toBe(false);
    expect(checkboxTwo.hasAttribute("aria-hidden")).toBe(false);

    checkboxOne.remove();
    checkboxTwo.remove();
    button.remove();
  });
});
