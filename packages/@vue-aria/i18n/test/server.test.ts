import { describe, expect, it } from "vitest";
import { getPackageLocalizationScript } from "../src/server";

describe("i18n server", () => {
  it("generates script with localized strings", () => {
    const res = getPackageLocalizationScript("en-US", {
      "@react-aria/button": { test: "foo" },
      "@react-aria/checkbox": { test: "foo" },
    });

    expect(res).toBe("window[Symbol.for('react-aria.i18n.locale')]=\"en-US\";{let A=\"foo\";window[Symbol.for('react-aria.i18n.strings')]={'@react-aria/button':{test:A},'@react-aria/checkbox':{test:A}};}");
  });
});
