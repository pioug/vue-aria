interface EventWithContinuePropagation extends Event {
  continuePropagation?: () => void;
}

export function createEventHandler<T extends Event>(
  handler?: (event: EventWithContinuePropagation & T) => void
): ((event: T) => void) | undefined {
  if (!handler) {
    return undefined;
  }

  return (event: T) => {
    let shouldStopPropagation = true;
    const wrapped = Object.create(event) as EventWithContinuePropagation & T;
    wrapped.continuePropagation = () => {
      shouldStopPropagation = false;
    };

    handler(wrapped);

    if (shouldStopPropagation) {
      event.stopPropagation();
    }
  };
}
