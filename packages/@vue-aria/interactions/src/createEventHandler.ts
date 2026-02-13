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
    const event = new Proxy(e as BaseEvent<T> & T, {
      get(target, property) {
        if (property === "preventDefault") {
          return () => {
            e.preventDefault();
          };
        }

        if (property === "isDefaultPrevented") {
          return () => e.defaultPrevented;
        }

        if (property === "stopPropagation") {
          return () => {
            shouldStopPropagation = true;
          };
        }

        if (property === "continuePropagation") {
          return () => {
            shouldStopPropagation = false;
          };
        }

        if (property === "isPropagationStopped") {
          return () => shouldStopPropagation;
        }

        return Reflect.get(target, property, target);
      },
    });

    handler(event);

    if (shouldStopPropagation) {
      e.stopPropagation();
    }
  };
}
