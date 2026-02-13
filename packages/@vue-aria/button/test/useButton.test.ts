import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useButton } from "../src";

function runUseButton(props: Parameters<typeof useButton>[0]) {
  const scope = effectScope();
  const result = scope.run(() => useButton(props))!;
  scope.stop();
  return result;
}

describe("useButton", () => {
  it("handles defaults", () => {
    const props = {};
    const result = runUseButton(props);
    expect(typeof result.buttonProps.onClick).toBe("function");
  });

  it("handles elements other than button", () => {
    const props = { elementType: "a" as const };
    const result = runUseButton(props);
    expect(result.buttonProps.role).toBe("button");
    expect(result.buttonProps.tabIndex).toBe(0);
    expect(result.buttonProps["aria-disabled"]).toBeUndefined();
    expect(result.buttonProps.href).toBeUndefined();
    expect(typeof result.buttonProps.onKeydown).toBe("function");
    expect(result.buttonProps.rel).toBeUndefined();
  });

  it("handles elements other than button disabled", () => {
    const props = { elementType: "a" as const, isDisabled: true };
    const result = runUseButton(props);
    expect(result.buttonProps.role).toBe("button");
    expect(result.buttonProps.tabIndex).toBeUndefined();
    expect(result.buttonProps["aria-disabled"]).toBeTruthy();
    expect(result.buttonProps.href).toBeUndefined();
    expect(typeof result.buttonProps.onKeydown).toBe("function");
    expect(result.buttonProps.rel).toBeUndefined();
  });

  it("handles rel attribute on anchors", () => {
    const props = { elementType: "a" as const, rel: "noopener noreferrer" };
    const result = runUseButton(props);
    expect(result.buttonProps.rel).toBe("noopener noreferrer");
  });

  it("handles input elements", () => {
    const props = { elementType: "input" as const, isDisabled: true };
    const result = runUseButton(props);
    expect(result.buttonProps.role).toBe("button");
    expect(result.buttonProps.tabIndex).toBeUndefined();
    expect(result.buttonProps["aria-disabled"]).toBeUndefined();
    expect(result.buttonProps.disabled).toBeTruthy();
    expect(typeof result.buttonProps.onKeydown).toBe("function");
  });

  it("handles aria-disabled passthrough for button elements", () => {
    const props = { "aria-disabled": "true" as const };
    const result = runUseButton(props);
    expect(result.buttonProps["aria-disabled"]).toBeTruthy();
    expect(result.buttonProps.disabled).toBeUndefined();
  });
});
