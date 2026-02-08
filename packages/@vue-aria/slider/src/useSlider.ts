import { computed, ref, toValue, watchEffect } from "vue";
import { useLabel } from "@vue-aria/label";
import { useMove } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { getSliderThumbId, sliderData } from "./utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

type Orientation = "horizontal" | "vertical";
type Direction = "ltr" | "rtl";

export interface UseSliderState {
  values: MaybeReactive<readonly number[]>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  setThumbDragging: (index: number, isDragging: boolean) => void;
  isThumbDragging: (index: number) => boolean;
  getThumbPercent: (index: number) => number;
  setThumbPercent: (index: number, percent: number) => void;
  setThumbValue: (index: number, value: number) => void;
  getPercentValue: (percent: number) => number;
  setFocusedThumb: (index: number | undefined) => void;
}

export interface UseSliderOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  orientation?: MaybeReactive<Orientation | undefined>;
  direction?: MaybeReactive<Direction | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  "aria-details"?: MaybeReactive<string | undefined>;
}

export interface UseSliderResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  groupProps: ReadonlyRef<Record<string, unknown>>;
  trackProps: ReadonlyRef<Record<string, unknown>>;
  outputProps: ReadonlyRef<Record<string, unknown>>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

function resolveOrientation(
  value: MaybeReactive<Orientation | undefined> | undefined
): Orientation {
  if (value === undefined) {
    return "horizontal";
  }
  return toValue(value) ?? "horizontal";
}

function resolveDirection(
  value: MaybeReactive<Direction | undefined> | undefined
): Direction {
  if (value === undefined) {
    return "ltr";
  }
  return toValue(value) ?? "ltr";
}

function findClosestThumb(values: readonly number[], targetValue: number): number {
  const split = values.findIndex((value) => targetValue - value < 0);
  if (split === 0) {
    return 0;
  }
  if (split === -1) {
    return values.length - 1;
  }

  const lastLeft = values[split - 1];
  const firstRight = values[split];
  if (Math.abs(lastLeft - targetValue) < Math.abs(firstRight - targetValue)) {
    return split - 1;
  }
  return split;
}

export function useSlider(
  options: UseSliderOptions = {},
  state: UseSliderState,
  trackRef: MaybeReactive<Element | null | undefined>
): UseSliderResult {
  const orientation = computed(() => resolveOrientation(options.orientation));
  const direction = computed(() => resolveDirection(options.direction));
  const isVertical = computed(() => orientation.value === "vertical");
  const isDisabled = computed(
    () => resolveBoolean(options.isDisabled) || resolveBoolean(state.isDisabled)
  );

  const { labelProps: baseLabelProps, fieldProps } = useLabel({
    id: options.id,
    label: options.label,
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
  });

  const groupId = computed(() => {
    if (typeof baseLabelProps.value.id === "string") {
      return baseLabelProps.value.id as string;
    }

    if (typeof fieldProps.value.id === "string") {
      return fieldProps.value.id as string;
    }

    return "";
  });

  watchEffect(() => {
    sliderData.set(state as object, {
      id: groupId.value,
      "aria-describedby":
        options["aria-describedby"] === undefined
          ? undefined
          : toValue(options["aria-describedby"]),
      "aria-details":
        options["aria-details"] === undefined
          ? undefined
          : toValue(options["aria-details"]),
    });
  });

  const activeThumbIndex = ref<number | null>(null);
  const currentPosition = ref<number | null>(null);
  const currentPointer = ref<number | null | undefined>(undefined);
  const reverseX = computed(() => direction.value === "rtl");

  const { moveProps } = useMove({
    onMoveStart: () => {
      currentPosition.value = null;
    },
    onMove: ({ deltaX = 0, deltaY = 0 }) => {
      const index = activeThumbIndex.value;
      const trackElement = toValue(trackRef);
      if (index === null || !trackElement) {
        return;
      }

      const rect = trackElement.getBoundingClientRect();
      const size = isVertical.value ? rect.height : rect.width;
      if (size <= 0) {
        return;
      }

      if (currentPosition.value === null) {
        currentPosition.value = state.getThumbPercent(index) * size;
      }

      let delta = isVertical.value ? deltaY : deltaX;
      if (isVertical.value || reverseX.value) {
        delta = -delta;
      }

      currentPosition.value += delta;
      const percent = clamp(currentPosition.value / size, 0, 1);
      state.setThumbPercent(index, percent);
    },
    onMoveEnd: () => {
      if (activeThumbIndex.value === null) {
        return;
      }
      state.setThumbDragging(activeThumbIndex.value, false);
      activeThumbIndex.value = null;
    },
  });

  const clearTrackDrag = (pointerId?: number | null) => {
    if (currentPointer.value !== undefined && pointerId !== currentPointer.value) {
      return;
    }

    if (activeThumbIndex.value !== null) {
      state.setThumbDragging(activeThumbIndex.value, false);
      activeThumbIndex.value = null;
    }
  };

  const onTrackDown = (
    event: { preventDefault?: () => void },
    pointerId: number | undefined,
    clientX: number,
    clientY: number
  ) => {
    const trackElement = toValue(trackRef);
    if (!trackElement || isDisabled.value) {
      return;
    }

    const values = [...toValue(state.values)];
    if (values.every((_, index) => !state.isThumbDragging(index))) {
      const rect = trackElement.getBoundingClientRect();
      const size = isVertical.value ? rect.height : rect.width;
      const trackPosition = isVertical.value ? rect.top : rect.left;
      const clickPosition = isVertical.value ? clientY : clientX;
      const offset = clickPosition - trackPosition;

      let percent = size <= 0 ? 0 : offset / size;
      if (reverseX.value || isVertical.value) {
        percent = 1 - percent;
      }

      const nextValue = state.getPercentValue(percent);
      const closestThumb = findClosestThumb(values, nextValue);
      if (closestThumb >= 0) {
        event.preventDefault?.();
        activeThumbIndex.value = closestThumb;
        state.setFocusedThumb(closestThumb);
        currentPointer.value = pointerId;
        state.setThumbDragging(closestThumb, true);
        state.setThumbValue(closestThumb, nextValue);
      }
    }
  };

  const labelProps = computed<Record<string, unknown>>(() => {
    const props = { ...baseLabelProps.value };
    if ("for" in props) {
      delete props.for;
    }
    if ("htmlFor" in props) {
      delete props.htmlFor;
    }

    return mergeProps(props, {
      onClick: () => {
        const thumbId = getSliderThumbId(state as object, 0);
        document.getElementById(thumbId)?.focus();
      },
    });
  });

  const groupProps = computed<Record<string, unknown>>(() => ({
    role: "group",
    ...fieldProps.value,
  }));

  const trackProps = computed<Record<string, unknown>>(() =>
    mergeProps(
      {
        onMousedown: (event: MouseEvent) => {
          if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey) {
            return;
          }
          onTrackDown(event, undefined, event.clientX, event.clientY);
        },
        onPointerdown: (event: PointerEvent) => {
          if (
            event.pointerType === "mouse" &&
            (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey)
          ) {
            return;
          }
          onTrackDown(event, event.pointerId, event.clientX, event.clientY);
        },
        onPointerup: (event: PointerEvent) => clearTrackDrag(event.pointerId),
        onPointercancel: (event: PointerEvent) => clearTrackDrag(event.pointerId),
        onMouseup: () => clearTrackDrag(undefined),
        onTouchstart: (event: TouchEvent) => {
          const touch = event.changedTouches[0];
          onTrackDown(event, touch?.identifier, touch?.clientX ?? 0, touch?.clientY ?? 0);
        },
        onTouchend: (event: TouchEvent) =>
          clearTrackDrag(event.changedTouches[0]?.identifier),
        style: {
          position: "relative",
          touchAction: "none",
        },
      },
      moveProps
    )
  );

  const outputProps = computed<Record<string, unknown>>(() => ({
    htmlFor: toValue(state.values)
      .map((_, index) => getSliderThumbId(state as object, index))
      .join(" "),
    "aria-live": "off",
  }));

  return {
    labelProps,
    groupProps,
    trackProps,
    outputProps,
  };
}
