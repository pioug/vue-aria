import { describe, expect, it } from "vitest";
import { useLink } from "../src/useLink";

describe("useLink", () => {
  it("handles defaults", () => {
    const { linkProps } = useLink({});

    expect(linkProps.value.role).toBeUndefined();
    expect(linkProps.value.tabindex).toBe(0);
    expect(typeof linkProps.value.onKeydown).toBe("function");
  });

  it("handles custom element type", () => {
    const { linkProps } = useLink({ elementType: "div" });

    expect(linkProps.value.role).toBe("link");
    expect(linkProps.value.tabindex).toBe(0);
  });

  it("handles isDisabled", () => {
    const { linkProps } = useLink({ elementType: "span", isDisabled: true });

    expect(linkProps.value.role).toBe("link");
    expect(linkProps.value["aria-disabled"]).toBe(true);
    expect(linkProps.value.tabindex).toBeUndefined();
    expect(typeof linkProps.value.onKeydown).toBe("function");
  });
});
