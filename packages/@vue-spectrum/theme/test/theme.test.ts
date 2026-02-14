import { describe, expect, it } from "vitest";
import { theme } from "../src";

describe("@vue-spectrum/theme", () => {
  it("exports a provider-compatible default theme map", () => {
    expect(theme.global?.spectrum).toBe("spectrum");
    expect(theme.light?.["spectrum--light"]).toBe("spectrum--light");
    expect(theme.dark?.["spectrum--dark"]).toBe("spectrum--darkest");
    expect(theme.medium?.["spectrum--medium"]).toBe("spectrum--medium");
    expect(theme.large?.["spectrum--large"]).toBe("spectrum--large");
  });
});
