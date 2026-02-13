import { describe, expect, it } from "vitest";
import { isCtrlKeyPressed, willOpenKeyboard } from "../src";

describe("keyboard helpers", () => {
  it("uses ctrl key on non-mac environments", () => {
    expect(isCtrlKeyPressed({ altKey: false, ctrlKey: true, metaKey: false })).toBe(true);
  });

  it("detects whether target opens software keyboard", () => {
    const textInput = document.createElement("input");
    textInput.type = "text";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const textarea = document.createElement("textarea");

    expect(willOpenKeyboard(textInput)).toBe(true);
    expect(willOpenKeyboard(checkbox)).toBe(false);
    expect(willOpenKeyboard(textarea)).toBe(true);
  });
});
