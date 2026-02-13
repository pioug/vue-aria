import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useListState } from "@vue-aria/list-state";
import { useActionGroup } from "../src";

describe("useActionGroup", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => {
      const ref = { current: null as Element | null };
      const state = useListState(props as any);
      return useActionGroup(props as any, state as any, ref);
    })!;
    scope.stop();
    return result;
  };

  it("handles defaults", () => {
    const { actionGroupProps } = run({});
    expect(actionGroupProps.role).toBe("toolbar");
  });

  it("handles vertical orientation", () => {
    const { actionGroupProps } = run({ orientation: "vertical" });
    expect(actionGroupProps["aria-orientation"]).toBe("vertical");
  });

  it("handles selection mode none", () => {
    const { actionGroupProps } = run({ selectionMode: "none" });
    expect(actionGroupProps.role).toBe("toolbar");
    expect(actionGroupProps["aria-orientation"]).toBe("horizontal");
  });

  it("handles selection mode single", () => {
    const { actionGroupProps } = run({ selectionMode: "single" });
    expect(actionGroupProps.role).toBe("radiogroup");
  });

  it("handles selection mode multiple", () => {
    const { actionGroupProps } = run({ selectionMode: "multiple" });
    expect(actionGroupProps.role).toBe("toolbar");
    expect(actionGroupProps["aria-orientation"]).toBe("horizontal");
  });

  it("handles isDisabled", () => {
    const { actionGroupProps } = run({ isDisabled: true });
    expect(actionGroupProps["aria-disabled"]).toBeTruthy();
  });
});
