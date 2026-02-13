import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useRadioGroupState } from "@vue-aria/radio-state";
import { useRadio, useRadioGroup } from "../src";

describe("useRadio + useRadioGroup", () => {
  it("handles defaults", () => {
    const state = useRadioGroupState({});
    const scope = effectScope();
    scope.run(() => useRadioGroup({ label: "Favorite Pet" }, state));
    const radio = scope.run(() =>
      useRadio(
        { value: "dragons", children: "Dragons" },
        state,
        { current: document.createElement("input") }
      )
    )!;

    expect(radio.inputProps.type).toBe("radio");
    expect(radio.inputProps.checked).toBe(false);
    expect(radio.inputProps.tabIndex).toBe(0);
    scope.stop();
  });

  it("updates state from change event", () => {
    const state = useRadioGroupState({});
    const scope = effectScope();
    scope.run(() => useRadioGroup({ label: "Favorite Pet" }, state));
    const radio = scope.run(() =>
      useRadio(
        { value: "dragons", children: "Dragons" },
        state,
        { current: document.createElement("input") }
      )
    )!;

    const event = new Event("change", { bubbles: true });
    (radio.inputProps.onChange as (event: Event) => void)(event);
    expect(state.selectedValue).toBe("dragons");
    scope.stop();
  });

  it("handles selected and last-focused tab index behavior", () => {
    const state = useRadioGroupState({ defaultValue: "cats" });
    state.setLastFocusedValue("dragons");
    const scope = effectScope();
    scope.run(() => useRadioGroup({ label: "Favorite Pet" }, state));
    const cats = scope.run(() =>
      useRadio(
        { value: "cats", children: "Cats" },
        state,
        { current: document.createElement("input") }
      )
    )!;
    const dragons = scope.run(() =>
      useRadio(
        { value: "dragons", children: "Dragons" },
        state,
        { current: document.createElement("input") }
      )
    )!;

    expect(cats.inputProps.tabIndex).toBe(0);
    expect(dragons.inputProps.tabIndex).toBe(-1);
    scope.stop();
  });

  it("supports group keyboard navigation", () => {
    const state = useRadioGroupState({ defaultValue: "dogs" });
    const scope = effectScope();
    const group = scope.run(() => useRadioGroup({ label: "Favorite Pet" }, state))!;

    const root = document.createElement("div");
    const one = document.createElement("input");
    one.type = "radio";
    one.value = "dogs";
    const two = document.createElement("input");
    two.type = "radio";
    two.value = "cats";
    root.append(one, two);

    const event = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true });
    Object.defineProperty(event, "currentTarget", { value: root });
    Object.defineProperty(event, "target", { value: one });

    (group.radioGroupProps.onKeydown as (event: KeyboardEvent) => void)(event);
    expect(state.selectedValue).toBe("cats");
    scope.stop();
  });

  it("sets readonly/required/disabled attrs on group", () => {
    const state = useRadioGroupState({});
    const scope = effectScope();
    const group = scope.run(() =>
      useRadioGroup(
        {
          label: "Favorite Pet",
          isReadOnly: true,
          isRequired: true,
          isDisabled: true,
          orientation: "horizontal",
        },
        state
      )
    )!;

    expect(group.radioGroupProps.role).toBe("radiogroup");
    expect(group.radioGroupProps["aria-readonly"]).toBe(true);
    expect(group.radioGroupProps["aria-required"]).toBe(true);
    expect(group.radioGroupProps["aria-disabled"]).toBe(true);
    expect(group.radioGroupProps["aria-orientation"]).toBe("horizontal");
    scope.stop();
  });
});
