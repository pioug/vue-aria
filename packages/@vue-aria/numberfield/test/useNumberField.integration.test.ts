import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useNumberField } from "../src";
import { useNumberFieldState } from "@vue-aria/numberfield-state";

describe("useNumberField integration with useNumberFieldState", () => {
  it("increments via stepper press handlers", () => {
    const onChange = vi.fn();
    const input = document.createElement("input");
    const button = document.createElement("button");
    document.body.appendChild(input);
    document.body.appendChild(button);

    const scope = effectScope();
    const result = scope.run(() => {
      const state = useNumberFieldState({
        locale: "en-US",
        defaultValue: 2,
        onChange,
      });
      return useNumberField({ "aria-label": "Quantity" }, state as any, { current: input });
    })!;

    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "mouse",
      target: button,
    });

    expect(onChange).toHaveBeenCalled();
    scope.stop();
    input.remove();
    button.remove();
  });
});
