export interface BaseEvent<T extends Event> {
  readonly type: string;
  readonly target: EventTarget | null;
  readonly currentTarget: EventTarget | null;
  preventDefault(): void;
  isDefaultPrevented(): boolean;
  stopPropagation(): void;
  continuePropagation(): void;
  isPropagationStopped(): boolean;
}

export function createEventHandler<T extends Event>(
  handler?: (e: BaseEvent<T>) => void
): ((e: T) => void) | undefined {
  if (!handler) {
    return undefined;
  }

  let shouldStopPropagation = true;
  return (e: T) => {
    const event: BaseEvent<T> = {
      type: e.type,
      target: e.target,
      currentTarget: e.currentTarget,
      preventDefault() {
        e.preventDefault();
      },
      isDefaultPrevented() {
        return e.defaultPrevented;
      },
      stopPropagation() {
        shouldStopPropagation = true;
      },
      continuePropagation() {
        shouldStopPropagation = false;
      },
      isPropagationStopped() {
        return shouldStopPropagation;
      },
    };

    handler(event);

    if (shouldStopPropagation) {
      e.stopPropagation();
    }
  };
}
