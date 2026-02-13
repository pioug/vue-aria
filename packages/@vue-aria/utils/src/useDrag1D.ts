import { ref, type Ref } from "vue";
import { getOffset, type Orientation } from "./getOffset";
import { nodeContains } from "./shadowdom/DOMFunctions";

interface UseDrag1DProps {
  containerRef: Ref<HTMLElement | null | undefined>;
  reverse?: boolean;
  orientation?: Orientation;
  onHover?: (hovered: boolean) => void;
  onDrag?: (dragging: boolean) => void;
  onPositionChange?: (position: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onIncrementToMax?: () => void;
  onDecrementToMin?: () => void;
  onCollapseToggle?: () => void;
}

const draggingElements: HTMLElement[] = [];

export function useDrag1D(props: UseDrag1DProps) {
  const {
    containerRef,
    reverse,
    orientation,
    onHover,
    onDrag,
    onPositionChange,
    onIncrement,
    onDecrement,
    onIncrementToMax,
    onDecrementToMin,
    onCollapseToggle,
  } = props;

  const getPosition = (e: MouseEvent) => orientation === "horizontal" ? e.clientX : e.clientY;

  const getNextOffset = (e: MouseEvent) => {
    if (!containerRef.value) {
      return 0;
    }
    const containerOffset = getOffset(containerRef.value, reverse, orientation);
    const mouseOffset = getPosition(e);
    return reverse ? containerOffset - mouseOffset : mouseOffset - containerOffset;
  };

  const dragging = ref(false);
  const prevPosition = ref(0);

  const onMouseDragged = (e: MouseEvent) => {
    e.preventDefault();
    const nextOffset = getNextOffset(e);

    if (!dragging.value) {
      dragging.value = true;
      onDrag?.(true);
      onPositionChange?.(nextOffset);
    }

    if (prevPosition.value === nextOffset) {
      return;
    }

    prevPosition.value = nextOffset;
    onPositionChange?.(nextOffset);
  };

  const onMouseUp = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    dragging.value = false;

    const nextOffset = getNextOffset(e);
    onDrag?.(false);
    onPositionChange?.(nextOffset);

    draggingElements.splice(draggingElements.indexOf(target), 1);
    window.removeEventListener("mouseup", onMouseUp, false);
    window.removeEventListener("mousemove", onMouseDragged, false);
  };

  const onMouseDown = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (draggingElements.some((elt) => nodeContains(target, elt))) {
      return;
    }

    draggingElements.push(target);
    window.addEventListener("mousemove", onMouseDragged, false);
    window.addEventListener("mouseup", onMouseUp, false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Left":
      case "ArrowLeft":
        if (orientation === "horizontal") {
          e.preventDefault();
          if (onDecrement && !reverse) {
            onDecrement();
          } else if (onIncrement && reverse) {
            onIncrement();
          }
        }
        break;
      case "Up":
      case "ArrowUp":
        if (orientation === "vertical") {
          e.preventDefault();
          if (onDecrement && !reverse) {
            onDecrement();
          } else if (onIncrement && reverse) {
            onIncrement();
          }
        }
        break;
      case "Right":
      case "ArrowRight":
        if (orientation === "horizontal") {
          e.preventDefault();
          if (onIncrement && !reverse) {
            onIncrement();
          } else if (onDecrement && reverse) {
            onDecrement();
          }
        }
        break;
      case "Down":
      case "ArrowDown":
        if (orientation === "vertical") {
          e.preventDefault();
          if (onIncrement && !reverse) {
            onIncrement();
          } else if (onDecrement && reverse) {
            onDecrement();
          }
        }
        break;
      case "Home":
        e.preventDefault();
        onDecrementToMin?.();
        break;
      case "End":
        e.preventDefault();
        onIncrementToMax?.();
        break;
      case "Enter":
        e.preventDefault();
        onCollapseToggle?.();
        break;
      default:
        break;
    }
  };

  return {
    onMouseDown,
    onMouseEnter: () => onHover?.(true),
    onMouseOut: () => onHover?.(false),
    onKeyDown,
  };
}
