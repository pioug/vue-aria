import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useDatePickerGroup } from "../src/useDatePickerGroup";

function createKeyboardEvent(
  key: string,
  overrides: Record<string, unknown> = {}
) {
  return {
    key,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  } as unknown as KeyboardEvent;
}

describe("useDatePickerGroup", () => {
  it("opens popover on Alt+ArrowDown when state supports setOpen", () => {
    const scope = effectScope();
    const setOpen = vi.fn();
    let groupProps!: ReturnType<typeof useDatePickerGroup>;

    const container = document.createElement("div");
    const target = document.createElement("button");
    container.append(target);

    scope.run(() => {
      groupProps = useDatePickerGroup(
        {
          setOpen,
        } as any,
        { current: container }
      );
    });

    const event = createKeyboardEvent("ArrowDown", {
      altKey: true,
      currentTarget: container,
      target,
    });

    (groupProps as any).onKeyDown(event);
    expect(setOpen).toHaveBeenCalledWith(true);
    expect((event.preventDefault as any).mock.calls.length).toBeGreaterThan(0);
    scope.stop();
  });

  it("moves focus between segments with arrow keys in LTR mode", () => {
    const scope = effectScope();
    let groupProps!: ReturnType<typeof useDatePickerGroup>;

    const container = document.createElement("div");
    const first = document.createElement("button");
    const second = document.createElement("button");
    first.tabIndex = 0;
    second.tabIndex = 0;
    container.append(first, second);
    document.body.append(container);
    first.focus();

    scope.run(() => {
      groupProps = useDatePickerGroup({} as any, { current: container });
    });

    const event = createKeyboardEvent("ArrowRight", {
      currentTarget: container,
      target: first,
    });

    (groupProps as any).onKeyDown(event);
    expect(document.activeElement).toBe(second);

    container.remove();
    scope.stop();
  });

  it("skips arrow key navigation when disabled", () => {
    const scope = effectScope();
    let groupProps!: ReturnType<typeof useDatePickerGroup>;

    const container = document.createElement("div");
    const first = document.createElement("button");
    const second = document.createElement("button");
    first.tabIndex = 0;
    second.tabIndex = 0;
    container.append(first, second);
    document.body.append(container);
    first.focus();

    scope.run(() => {
      groupProps = useDatePickerGroup(
        {} as any,
        { current: container },
        true
      );
    });

    const event = createKeyboardEvent("ArrowRight", {
      currentTarget: container,
      target: first,
    });

    (groupProps as any).onKeyDown(event);
    expect(document.activeElement).toBe(first);

    container.remove();
    scope.stop();
  });
});
