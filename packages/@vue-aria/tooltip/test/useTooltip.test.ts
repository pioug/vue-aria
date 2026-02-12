import { describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useTooltip, useTooltipTrigger } from "../src";

function createTooltipState() {
  const isOpen = ref(false);
  const open = vi.fn((immediate?: boolean) => {
    void immediate;
    isOpen.value = true;
  });
  const close = vi.fn((immediate?: boolean) => {
    void immediate;
    isOpen.value = false;
  });

  return {
    isOpen,
    open,
    close,
  };
}

function attachHandlers(
  element: HTMLElement,
  props: Record<string, unknown>
): void {
  for (const [key, value] of Object.entries(props)) {
    if (!key.startsWith("on") || typeof value !== "function") {
      continue;
    }

    element.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
  }
}

describe("useTooltip", () => {
  it("returns tooltip role and hover behavior", () => {
    const tooltipElement = document.createElement("div");
    document.body.appendChild(tooltipElement);

    const state = createTooltipState();

    const scope = effectScope();
    let tooltip!: ReturnType<typeof useTooltip>;

    scope.run(() => {
      tooltip = useTooltip({}, state);
    });

    attachHandlers(tooltipElement, tooltip.tooltipProps.value);

    expect(tooltip.tooltipProps.value.role).toBe("tooltip");

    tooltipElement.dispatchEvent(
      new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" })
    );
    expect(state.open).toHaveBeenCalledWith(true);

    tooltipElement.dispatchEvent(
      new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse" })
    );
    expect(state.close).toHaveBeenCalled();

    scope.stop();
    tooltipElement.remove();
  });
});

describe("useTooltipTrigger", () => {
  it("wires aria-describedby to the tooltip id when open", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);

    const state = createTooltipState();

    const scope = effectScope();
    let tooltipTrigger!: ReturnType<typeof useTooltipTrigger>;

    scope.run(() => {
      tooltipTrigger = useTooltipTrigger({}, state, trigger);
    });

    expect(tooltipTrigger.triggerProps.value["aria-describedby"]).toBeUndefined();

    state.isOpen.value = true;

    expect(tooltipTrigger.triggerProps.value["aria-describedby"]).toBe(
      tooltipTrigger.tooltipProps.value.id
    );

    scope.stop();
    trigger.remove();
  });

  it("opens on hover and closes on hover end", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);

    const state = createTooltipState();

    const scope = effectScope();
    let tooltipTrigger!: ReturnType<typeof useTooltipTrigger>;

    scope.run(() => {
      tooltipTrigger = useTooltipTrigger(
        {
          delay: 0,
        },
        state,
        trigger
      );
    });

    attachHandlers(trigger, tooltipTrigger.triggerProps.value);

    trigger.dispatchEvent(
      new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" })
    );
    expect(state.open).toHaveBeenCalledWith(false);

    trigger.dispatchEvent(
      new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse" })
    );
    expect(state.close).toHaveBeenCalled();

    scope.stop();
    trigger.remove();
  });

  it("closes other active tooltips before opening a new one", () => {
    const firstTrigger = document.createElement("button");
    const secondTrigger = document.createElement("button");
    document.body.appendChild(firstTrigger);
    document.body.appendChild(secondTrigger);

    const firstState = createTooltipState();
    const secondState = createTooltipState();

    const scope = effectScope();
    let firstTooltipTrigger!: ReturnType<typeof useTooltipTrigger>;
    let secondTooltipTrigger!: ReturnType<typeof useTooltipTrigger>;

    scope.run(() => {
      firstTooltipTrigger = useTooltipTrigger(
        {
          delay: 0,
        },
        firstState,
        firstTrigger
      );
      secondTooltipTrigger = useTooltipTrigger(
        {
          delay: 0,
        },
        secondState,
        secondTrigger
      );
    });

    attachHandlers(firstTrigger, firstTooltipTrigger.triggerProps.value);
    attachHandlers(secondTrigger, secondTooltipTrigger.triggerProps.value);

    firstTrigger.dispatchEvent(
      new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" })
    );
    expect(firstState.open).toHaveBeenCalledWith(false);

    secondTrigger.dispatchEvent(
      new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" })
    );

    expect(firstState.close).toHaveBeenCalledWith(true);
    expect(secondState.open).toHaveBeenCalledWith(false);

    scope.stop();
    firstTrigger.remove();
    secondTrigger.remove();
  });

  it("uses a 1500ms default hover delay when delay is not provided", () => {
    vi.useFakeTimers();
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);

    const state = createTooltipState();
    const scope = effectScope();
    let tooltipTrigger!: ReturnType<typeof useTooltipTrigger>;

    try {
      scope.run(() => {
        tooltipTrigger = useTooltipTrigger({}, state, trigger);
      });

      attachHandlers(trigger, tooltipTrigger.triggerProps.value);

      trigger.dispatchEvent(
        new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" })
      );
      expect(state.open).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1499);
      expect(state.open).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(state.open).toHaveBeenCalledWith(false);
    } finally {
      scope.stop();
      trigger.remove();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("opens on focus and closes on blur", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);

    const state = createTooltipState();

    const scope = effectScope();
    let tooltipTrigger!: ReturnType<typeof useTooltipTrigger>;

    scope.run(() => {
      tooltipTrigger = useTooltipTrigger({}, state, trigger);
    });

    attachHandlers(trigger, tooltipTrigger.triggerProps.value);

    trigger.focus();
    trigger.dispatchEvent(new FocusEvent("focus"));
    expect(state.open).toHaveBeenCalledWith(true);

    trigger.dispatchEvent(new FocusEvent("blur"));
    expect(state.close).toHaveBeenCalledWith(true);

    scope.stop();
    trigger.remove();
  });

  it("closes on press start by default", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);

    const state = createTooltipState();

    const scope = effectScope();
    let tooltipTrigger!: ReturnType<typeof useTooltipTrigger>;

    scope.run(() => {
      tooltipTrigger = useTooltipTrigger({}, state, trigger);
    });

    attachHandlers(trigger, tooltipTrigger.triggerProps.value);

    state.isOpen.value = true;

    trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(state.close).toHaveBeenCalledWith(true);

    scope.stop();
    trigger.remove();
  });

  it("does not close on press when shouldCloseOnPress is false", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);

    const state = createTooltipState();

    const scope = effectScope();
    let tooltipTrigger!: ReturnType<typeof useTooltipTrigger>;

    scope.run(() => {
      tooltipTrigger = useTooltipTrigger(
        {
          shouldCloseOnPress: false,
        },
        state,
        trigger
      );
    });

    attachHandlers(trigger, tooltipTrigger.triggerProps.value);

    state.isOpen.value = true;

    trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(state.close).not.toHaveBeenCalled();

    scope.stop();
    trigger.remove();
  });

  it("closes on escape when open", async () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);

    const state = createTooltipState();
    state.isOpen.value = true;

    const scope = effectScope();

    scope.run(() => {
      useTooltipTrigger({}, state, trigger);
    });

    await nextTick();

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      })
    );

    expect(state.close).toHaveBeenCalledWith(true);

    scope.stop();
    trigger.remove();
  });
});
