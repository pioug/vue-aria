import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useCheckboxGroupState } from "@vue-aria/checkbox-state";
import { useCheckboxGroup, useCheckboxGroupItem } from "../src";

function createEvent(checked: boolean): Event {
  const event = new Event("change", { bubbles: true });
  Object.defineProperty(event, "target", {
    value: {
      checked,
    },
  });
  return event;
}

describe("useCheckboxGroup + useCheckboxGroupItem", () => {
  it("handles defaults and selection updates", () => {
    const onChangeSpy = vi.fn();
    const state = useCheckboxGroupState({ label: "Favorite Pet", onChange: onChangeSpy } as any);
    const scope = effectScope();
    const group = scope.run(() => useCheckboxGroup({ label: "Favorite Pet" }, state))!;
    const ref = { current: document.createElement("input") };
    const dragons = scope.run(() =>
      useCheckboxGroupItem({ value: "dragons", children: "Dragons" }, state, ref)
    )!;

    expect(group.groupProps.role).toBe("group");
    expect(dragons.inputProps.name).toBeUndefined();
    expect(state.isSelected("dragons")).toBe(false);

    (dragons.inputProps.onChange as (event: Event) => void)(createEvent(true));

    expect(onChangeSpy).toHaveBeenCalledWith(["dragons"]);
    expect(state.isSelected("dragons")).toBe(true);
    scope.stop();
  });

  it("applies name to items from group props", () => {
    const state = useCheckboxGroupState();
    const scope = effectScope();
    scope.run(() => useCheckboxGroup({ label: "Favorite Pet", name: "awesome-react-aria" }, state));

    const one = scope.run(() =>
      useCheckboxGroupItem({ value: "dogs", children: "Dogs" }, state, {
        current: document.createElement("input"),
      })
    )!;
    const two = scope.run(() =>
      useCheckboxGroupItem({ value: "cats", children: "Cats" }, state, {
        current: document.createElement("input"),
      })
    )!;

    expect(one.inputProps.name).toBe("awesome-react-aria");
    expect(two.inputProps.name).toBe("awesome-react-aria");
    scope.stop();
  });

  it("supports labeling", () => {
    const state = useCheckboxGroupState();
    const scope = effectScope();
    const group = scope.run(() => useCheckboxGroup({ label: "Favorite Pet" }, state))!;

    expect(group.labelProps.id).toBeDefined();
    expect(group.groupProps["aria-labelledby"]).toContain(group.labelProps.id);
    scope.stop();
  });

  it("sets aria-disabled and disables items", () => {
    const state = useCheckboxGroupState({ isDisabled: true });
    const scope = effectScope();
    const group = scope.run(() => useCheckboxGroup({ label: "Favorite Pet", isDisabled: true }, state))!;
    const item = scope.run(() =>
      useCheckboxGroupItem({ value: "dragons", children: "Dragons" }, state, {
        current: document.createElement("input"),
      })
    )!;

    expect(group.groupProps["aria-disabled"]).toBe(true);
    expect(item.inputProps.disabled).toBe(true);
    scope.stop();
  });

  it("sets aria-readonly on readonly items and blocks change", () => {
    const groupOnChangeSpy = vi.fn();
    const itemOnChangeSpy = vi.fn();
    const state = useCheckboxGroupState({
      isReadOnly: true,
      onChange: groupOnChangeSpy,
    });
    const scope = effectScope();
    const item = scope.run(() =>
      useCheckboxGroupItem(
        { value: "dragons", children: "Dragons", onChange: itemOnChangeSpy },
        state,
        {
          current: document.createElement("input"),
        }
      )
    )!;

    expect(item.inputProps["aria-readonly"]).toBe(true);
    (item.inputProps.onChange as (event: Event) => void)(createEvent(true));

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(itemOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(state.isSelected("dragons")).toBe(false);
    scope.stop();
  });

  it("re-validates required groups in realtime", () => {
    const state = useCheckboxGroupState({ isRequired: true });
    const scope = effectScope();
    scope.run(() => useCheckboxGroup({ label: "Favorite Pet", isRequired: true }, state));
    const dragons = scope.run(() =>
      useCheckboxGroupItem({ value: "dragons", children: "Dragons" }, state, {
        current: document.createElement("input"),
      })
    )!;

    expect(state.isInvalid).toBe(true);
    (dragons.inputProps.onChange as (event: Event) => void)(createEvent(true));
    expect(state.isInvalid).toBe(false);
    (dragons.inputProps.onChange as (event: Event) => void)(createEvent(false));
    expect(state.isInvalid).toBe(true);
    scope.stop();
  });
});
