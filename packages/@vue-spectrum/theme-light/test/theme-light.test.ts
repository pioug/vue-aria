import { describe, expect, it } from "vitest";
import { theme } from "../src";

describe("@vue-spectrum/theme-light", () => {
  it("exports a light-leaning provider theme variant", () => {
    expect(theme.light?.["spectrum--light"]).toBe("spectrum--lightest");
    expect(theme.dark?.["spectrum--dark"]).toBe("spectrum--darkest");
    expect(theme.global?.spectrum).toBe("spectrum");
  });
});
