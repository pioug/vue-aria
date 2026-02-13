import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useListState } from "@vue-aria/list-state";
import { useActionGroupItem } from "../src";

describe("useActionGroupItem", () => {
  it("maps roles/checked state and updates focus/selection handlers", () => {
    const scope = effectScope();
    scope.run(() => {
      const state = useListState({
        selectionMode: "single",
        items: [{ id: "a" }, { id: "b" }],
        getKey: (item: { id: string }) => item.id,
      });

      const { buttonProps } = useActionGroupItem({ key: "a" }, state);
      expect(buttonProps.role).toBe("radio");
      expect(buttonProps["aria-checked"]).toBe(false);
      expect(buttonProps.tabIndex).toBe(0);

      (buttonProps.onFocus as () => void)();
      expect(state.selectionManager.focusedKey).toBe("a");

      (buttonProps.onPress as () => void)();
      expect(state.selectionManager.isSelected("a")).toBe(true);
    });
    scope.stop();
  });

  it("omits role and checked state when selection mode is none", () => {
    const scope = effectScope();
    scope.run(() => {
      const state = useListState({
        selectionMode: "none",
        items: [{ id: "a" }],
        getKey: (item: { id: string }) => item.id,
      });

      const { buttonProps } = useActionGroupItem({ key: "a" }, state);
      expect(buttonProps.role).toBeUndefined();
      expect(buttonProps["aria-checked"]).toBeUndefined();
    });
    scope.stop();
  });
});
