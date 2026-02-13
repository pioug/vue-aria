import { describe, expect, it } from "vitest";
import { filterDOMProps } from "../src/filterDOMProps";

describe("filterDOMProps", () => {
  it("keeps dom/data/aria props and strips unknown keys", () => {
    const props = filterDOMProps({
      id: "field",
      role: "group",
      class: "example",
      style: { color: "red" },
      autoFocus: true,
      autofocus: true,
      slot: "trigger",
      "data-test": "ok",
      "aria-label": "Calendar",
      customProp: "ignored",
      another: 123,
    });

    expect(props).toEqual({
      id: "field",
      role: "group",
      class: "example",
      style: { color: "red" },
      autoFocus: true,
      autofocus: true,
      slot: "trigger",
      "data-test": "ok",
      "aria-label": "Calendar",
    });
  });

  it("supports non-labelable mode", () => {
    const props = filterDOMProps(
      {
        "aria-label": "Label",
        "aria-labelledby": "field-label",
        "aria-live": "polite",
        "data-test": "ok",
      },
      { labelable: false }
    );

    expect(props).toEqual({
      "aria-live": "polite",
      "data-test": "ok",
    });
  });
});
