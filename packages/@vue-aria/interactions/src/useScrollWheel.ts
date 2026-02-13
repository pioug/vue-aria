import type { Ref } from "vue";
import { useEvent } from "@vue-aria/utils";

export interface ScrollWheelProps {
  onScroll?: (delta: { deltaX: number; deltaY: number }) => void;
  isDisabled?: boolean;
}

export function useScrollWheel(
  props: ScrollWheelProps,
  ref: Ref<HTMLElement | null | undefined>
): void {
  const { onScroll, isDisabled } = props;

  const onScrollHandler = (event: WheelEvent) => {
    if (event.ctrlKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onScroll?.({ deltaX: event.deltaX, deltaY: event.deltaY });
  };

  useEvent(ref as Ref<EventTarget | null | undefined>, "wheel", isDisabled ? undefined : onScrollHandler);
}
