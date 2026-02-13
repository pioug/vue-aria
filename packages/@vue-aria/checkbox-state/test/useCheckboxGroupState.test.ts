import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useCheckboxGroupState } from "../src";

describe("useCheckboxGroupState", () => {
  it("handles defaults", () => {
    const onChange = vi.fn();
    const state = useCheckboxGroupState({ onChange });

    expect(state.value).toEqual([]);
    expect(state.defaultValue).toEqual([]);
    expect(state.isInvalid).toBe(false);

    state.addValue("dragons");

    expect(state.value).toEqual(["dragons"]);
    expect(onChange).toHaveBeenCalledWith(["dragons"]);
  });

  it("supports default values", () => {
    const state = useCheckboxGroupState({ defaultValue: ["cats"] });
    expect(state.value).toEqual(["cats"]);
    expect(state.isSelected("cats")).toBe(true);
  });

  it("respects disabled and readonly", () => {
    const disabled = useCheckboxGroupState({ isDisabled: true, defaultValue: ["dogs"] });
    disabled.addValue("cats");
    expect(disabled.value).toEqual(["dogs"]);

    const readonly = useCheckboxGroupState({ isReadOnly: true, defaultValue: ["dogs"] });
    readonly.removeValue("dogs");
    expect(readonly.value).toEqual(["dogs"]);
  });

  it("revalidates required groups", () => {
    const state = useCheckboxGroupState({ isRequired: true });

    expect(state.isInvalid).toBe(true);

    state.addValue("dragons");
    expect(state.isInvalid).toBe(false);

    state.removeValue("dragons");
    expect(state.isInvalid).toBe(true);
  });

  it("queues native validation updates until commit", async () => {
    const state = useCheckboxGroupState({ validationBehavior: "native" });

    state.updateValidation({
      isInvalid: true,
      validationErrors: ["Invalid checkbox group"],
      validationDetails: null,
    });

    expect(state.isInvalid).toBe(false);
    state.commitValidation();
    await nextTick();
    expect(state.isInvalid).toBe(true);
  });
});
