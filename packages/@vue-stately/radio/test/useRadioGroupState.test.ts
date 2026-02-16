import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useRadioGroupState } from "../src";

describe("useRadioGroupState", () => {
  it("handles defaults", () => {
    const onChange = vi.fn();
    const state = useRadioGroupState({ onChange });

    expect(state.selectedValue).toBe(null);
    expect(state.name).toMatch(/^radio-group-/);

    state.setSelectedValue("cats");
    expect(state.selectedValue).toBe("cats");
    expect(onChange).toHaveBeenCalledWith("cats");
  });

  it("respects disabled and readonly", () => {
    const disabled = useRadioGroupState({ isDisabled: true, defaultValue: "dogs" });
    disabled.setSelectedValue("cats");
    expect(disabled.selectedValue).toBe("dogs");

    const readOnly = useRadioGroupState({ isReadOnly: true, defaultValue: "dogs" });
    readOnly.setSelectedValue("cats");
    expect(readOnly.selectedValue).toBe("dogs");
  });

  it("marks required group invalid when no value is selected", () => {
    const state = useRadioGroupState({ isRequired: true });
    expect(state.isInvalid).toBe(true);
    state.setSelectedValue("dragons");
    expect(state.isInvalid).toBe(false);
  });

  it("supports validate function in aria mode", () => {
    const state = useRadioGroupState({
      defaultValue: "dragons",
      validate: (value: string | null) => (value === "dragons" ? "Too scary" : null),
    } as any);

    expect(state.displayValidation.isInvalid).toBe(true);
    expect(state.displayValidation.validationErrors).toContain("Too scary");

    state.setSelectedValue("dogs");
    expect(state.displayValidation.isInvalid).toBe(false);
  });

  it("queues native validation updates until commit", async () => {
    const state = useRadioGroupState({ validationBehavior: "native" });

    state.updateValidation({
      isInvalid: true,
      validationErrors: ["Invalid radio group"],
      validationDetails: null,
    });

    expect(state.isInvalid).toBe(false);
    state.commitValidation();
    await nextTick();
    expect(state.isInvalid).toBe(true);
  });
});
