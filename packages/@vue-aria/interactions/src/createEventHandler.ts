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
    const event = Object.create(e) as BaseEvent<T> & T;
    Object.defineProperties(event, {
      type: { value: e.type, enumerable: true },
      target: { value: e.target, enumerable: true },
      currentTarget: { value: e.currentTarget, enumerable: true },
    });
    Object.defineProperties(event, {
      preventDefault: { value() {
        e.preventDefault();
      } },
      isDefaultPrevented: { value() {
        return e.defaultPrevented;
      } },
      stopPropagation: { value() {
        shouldStopPropagation = true;
      } },
      continuePropagation: { value() {
        shouldStopPropagation = false;
      } },
      isPropagationStopped: { value() {
        return shouldStopPropagation;
      } },
    });

    handler(event);

    if (shouldStopPropagation) {
      e.stopPropagation();
    }
  };
}
