import { useMove, setInteractionModality } from "@vue-aria/interactions";
import { useLabel } from "@vue-aria/label";
import { useLocale } from "@vue-aria/i18n";
import { clamp, mergeProps, useGlobalListeners } from "@vue-aria/utils";
import { getSliderThumbId, setSliderData } from "./utils";

export interface AriaSliderProps {
  orientation?: "horizontal" | "vertical";
  isDisabled?: boolean;
  label?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
}

export interface SliderState {
  values: number[];
  isThumbDragging: (index: number) => boolean;
  isThumbEditable: (index: number) => boolean;
  getThumbPercent: (index: number) => number;
  getPercentValue: (percent: number) => number;
  setThumbDragging: (index: number, isDragging: boolean) => void;
  setThumbPercent: (index: number, percent: number) => void;
  setThumbValue: (index: number, value: number) => void;
  setFocusedThumb: (index: number) => void;
}

export interface SliderAria {
  labelProps: Record<string, unknown>;
  groupProps: Record<string, unknown>;
  trackProps: Record<string, unknown>;
  outputProps: Record<string, unknown>;
}

export function useSlider(
  props: AriaSliderProps,
  state: SliderState,
  trackRef: { current: Element | null }
): SliderAria {
  const { labelProps, fieldProps } = useLabel(props);
  const isVertical = props.orientation === "vertical";
  const locale = useLocale();

  setSliderData(state as object, {
    id: (labelProps.id ?? fieldProps.id) as string,
    "aria-describedby": props["aria-describedby"],
    "aria-details": props["aria-details"],
  });

  const { addGlobalListener, removeGlobalListener } = useGlobalListeners();

  let realTimeTrackDraggingIndex: number | null = null;
  let currentPointer: number | null | undefined;
  let currentPosition: number | null = null;

  const reverseX = locale.value.direction === "rtl";

  const onUpTrack = (event: any) => {
    const id = event.pointerId ?? event.changedTouches?.[0]?.identifier;
    if (id === currentPointer) {
      if (realTimeTrackDraggingIndex != null) {
        state.setThumbDragging(realTimeTrackDraggingIndex, false);
        realTimeTrackDraggingIndex = null;
      }

      removeGlobalListener(window, "mouseup", onUpTrack as EventListener, false);
      removeGlobalListener(window, "touchend", onUpTrack as EventListener, false);
      removeGlobalListener(window, "pointerup", onUpTrack as EventListener, false);
    }
  };

  const onDownTrack = (event: Event, id: number | undefined, clientX: number, clientY: number) => {
    if (
      !trackRef.current ||
      props.isDisabled ||
      !state.values.every((_, index) => !state.isThumbDragging(index))
    ) {
      return;
    }

    const { height, width, top, left } = trackRef.current.getBoundingClientRect();
    const size = isVertical ? height : width;
    const trackPosition = isVertical ? top : left;
    const clickPosition = isVertical ? clientY : clientX;
    const offset = clickPosition - trackPosition;

    let percent = offset / size;
    if (locale.value.direction === "rtl" || isVertical) {
      percent = 1 - percent;
    }

    const value = state.getPercentValue(percent);
    const split = state.values.findIndex((thumbValue) => value - thumbValue < 0);

    let closestThumb: number;
    if (split === 0) {
      closestThumb = split;
    } else if (split === -1) {
      closestThumb = state.values.length - 1;
    } else {
      const lastLeft = state.values[split - 1];
      const firstRight = state.values[split];
      closestThumb =
        Math.abs(lastLeft - value) < Math.abs(firstRight - value) ? split - 1 : split;
    }

    if (closestThumb >= 0 && state.isThumbEditable(closestThumb)) {
      event.preventDefault();

      realTimeTrackDraggingIndex = closestThumb;
      state.setFocusedThumb(closestThumb);
      currentPointer = id;

      state.setThumbDragging(closestThumb, true);
      state.setThumbValue(closestThumb, value);

      addGlobalListener(window, "mouseup", onUpTrack as EventListener, false);
      addGlobalListener(window, "touchend", onUpTrack as EventListener, false);
      addGlobalListener(window, "pointerup", onUpTrack as EventListener, false);
    } else {
      realTimeTrackDraggingIndex = null;
    }
  };

  const { moveProps } = useMove({
    onMoveStart() {
      currentPosition = null;
    },
    onMove({ deltaX, deltaY }) {
      if (!trackRef.current) {
        return;
      }

      const { height, width } = trackRef.current.getBoundingClientRect();
      const size = isVertical ? height : width;

      if (currentPosition == null && realTimeTrackDraggingIndex != null) {
        currentPosition = state.getThumbPercent(realTimeTrackDraggingIndex) * size;
      }

      let delta = isVertical ? deltaY : deltaX;
      if (isVertical || reverseX) {
        delta = -delta;
      }

      currentPosition = (currentPosition ?? 0) + delta;

      if (realTimeTrackDraggingIndex != null) {
        const percent = clamp((currentPosition ?? 0) / size, 0, 1);
        state.setThumbPercent(realTimeTrackDraggingIndex, percent);
      }
    },
    onMoveEnd() {
      if (realTimeTrackDraggingIndex != null) {
        state.setThumbDragging(realTimeTrackDraggingIndex, false);
        realTimeTrackDraggingIndex = null;
      }
    },
  });

  if ("htmlFor" in labelProps && labelProps.htmlFor) {
    delete labelProps.htmlFor;
    labelProps.onClick = () => {
      document.getElementById(getSliderThumbId(state as object, 0))?.focus();
      setInteractionModality("keyboard");
    };
  }

  return {
    labelProps,
    groupProps: {
      role: "group",
      ...fieldProps,
    },
    trackProps: mergeProps(
      {
        onMousedown(event: MouseEvent) {
          if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey) {
            return;
          }
          onDownTrack(event, undefined, event.clientX, event.clientY);
        },
        onPointerdown(event: PointerEvent) {
          if (
            event.pointerType === "mouse" &&
            (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey)
          ) {
            return;
          }

          onDownTrack(event, event.pointerId, event.clientX, event.clientY);
        },
        onTouchstart(event: TouchEvent) {
          onDownTrack(
            event,
            event.changedTouches[0]?.identifier,
            event.changedTouches[0]?.clientX,
            event.changedTouches[0]?.clientY
          );
        },
        style: {
          position: "relative",
          touchAction: "none",
        },
      },
      moveProps
    ),
    outputProps: {
      htmlFor: state.values.map((_, index) => getSliderThumbId(state as object, index)).join(" "),
      "aria-live": "off",
    },
  };
}
