import { computed, ref, toValue, watchEffect } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { nodeContains } from "@vue-aria/utils";
import { useLocale } from "@vue-aria/i18n";
import {
  calculatePosition,
  getRect,
  type Placement,
  type PlacementAxis,
  type PositionResult,
} from "./calculatePosition";
import { useCloseOnScroll } from "./useCloseOnScroll";

interface ScrollAnchor {
  type: "top" | "bottom";
  offset: number;
}

export interface UseOverlayPositionOptions {
  targetRef: MaybeReactive<Element | null | undefined>;
  overlayRef: MaybeReactive<HTMLElement | null | undefined>;
  arrowRef?: MaybeReactive<HTMLElement | null | undefined>;
  scrollRef?: MaybeReactive<HTMLElement | null | undefined>;
  placement?: MaybeReactive<Placement | undefined>;
  containerPadding?: MaybeReactive<number | undefined>;
  shouldFlip?: MaybeReactive<boolean | undefined>;
  boundaryElement?: MaybeReactive<Element | null | undefined>;
  offset?: MaybeReactive<number | undefined>;
  crossOffset?: MaybeReactive<number | undefined>;
  shouldUpdatePosition?: MaybeReactive<boolean | undefined>;
  isOpen?: MaybeReactive<boolean | undefined>;
  onClose?: (() => void) | null;
  maxHeight?: MaybeReactive<number | undefined>;
  arrowSize?: MaybeReactive<number | undefined>;
  arrowBoundaryOffset?: MaybeReactive<number | undefined>;
}

export interface UseOverlayPositionResult {
  overlayProps: ReadonlyRef<Record<string, unknown>>;
  arrowProps: ReadonlyRef<Record<string, unknown>>;
  placement: ReadonlyRef<PlacementAxis | null>;
  triggerAnchorPoint: ReadonlyRef<{ x: number; y: number } | null>;
  updatePosition: () => void;
}

function resolveBoolean(
  value: MaybeReactive<boolean | undefined> | undefined,
  fallback: boolean
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return Boolean(toValue(value));
}

function resolveNumber(
  value: MaybeReactive<number | undefined> | undefined,
  fallback: number
): number {
  if (value === undefined) {
    return fallback;
  }

  return toValue(value) ?? fallback;
}

function resolvePlacement(value: MaybeReactive<Placement | undefined> | undefined): Placement {
  if (value === undefined) {
    return "bottom";
  }

  return toValue(value) ?? "bottom";
}

function useResize(onResize: () => void): void {
  watchEffect((onCleanup) => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("resize", onResize, false);
    onCleanup(() => {
      window.removeEventListener("resize", onResize, false);
    });
  });
}

function useElementResize(
  elementRef: MaybeReactive<Element | null | undefined>,
  onResize: () => void
): void {
  watchEffect((onCleanup) => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const element = toValue(elementRef);
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(() => {
      onResize();
    });

    observer.observe(element);

    onCleanup(() => {
      observer.disconnect();
    });
  });
}

function translateRTL(position: Placement, direction: "ltr" | "rtl"): Placement {
  if (direction === "rtl") {
    return position.replace("start", "right").replace("end", "left") as Placement;
  }

  return position.replace("start", "left").replace("end", "right") as Placement;
}

export function useOverlayPosition(
  options: UseOverlayPositionOptions
): UseOverlayPositionResult {
  const locale = useLocale();
  const position = ref<PositionResult | null>(null);
  const lastScale = ref<number | undefined>(
    typeof document !== "undefined" ? window.visualViewport?.scale : undefined
  );
  const isResizing = ref(false);

  watchEffect(() => {
    if (resolveBoolean(options.isOpen, true)) {
      lastScale.value =
        typeof document !== "undefined" ? window.visualViewport?.scale : undefined;
    }
  });

  const updatePosition = (): void => {
    if (typeof window === "undefined") {
      return;
    }

    const target = toValue(options.targetRef);
    const overlay = toValue(options.overlayRef);
    const boundaryElement =
      options.boundaryElement === undefined
        ? typeof document !== "undefined"
          ? document.body
          : null
        : toValue(options.boundaryElement);

    if (
      resolveBoolean(options.shouldUpdatePosition, true) === false ||
      !resolveBoolean(options.isOpen, true) ||
      !overlay ||
      !target ||
      !boundaryElement
    ) {
      return;
    }

    if (window.visualViewport?.scale !== lastScale.value) {
      return;
    }

    const scrollNode = toValue(options.scrollRef) ?? overlay;

    let anchor: ScrollAnchor | null = null;
    if (nodeContains(scrollNode, document.activeElement)) {
      const anchorRect = document.activeElement?.getBoundingClientRect();
      const scrollRect = scrollNode.getBoundingClientRect();
      anchor = {
        type: "top",
        offset: (anchorRect?.top ?? 0) - scrollRect.top,
      };

      if (anchor.offset > scrollRect.height / 2) {
        anchor.type = "bottom";
        anchor.offset = (anchorRect?.bottom ?? 0) - scrollRect.bottom;
      }
    }

    if (options.maxHeight === undefined) {
      overlay.style.top = "0px";
      overlay.style.bottom = "";
      overlay.style.maxHeight = `${window.visualViewport?.height ?? window.innerHeight}px`;
    }

    const arrowRef = toValue(options.arrowRef);
    const result = calculatePosition({
      placement: translateRTL(resolvePlacement(options.placement), locale.value.direction),
      overlayNode: overlay,
      targetNode: target,
      scrollNode,
      padding: resolveNumber(options.containerPadding, 12),
      shouldFlip: resolveBoolean(options.shouldFlip, true),
      boundaryElement,
      offset: resolveNumber(options.offset, 0),
      crossOffset: resolveNumber(options.crossOffset, 0),
      maxHeight: toValue(options.maxHeight) ?? undefined,
      arrowSize: resolveNumber(
        options.arrowSize,
        arrowRef ? getRect(arrowRef, true).width : 0
      ),
      arrowBoundaryOffset: resolveNumber(options.arrowBoundaryOffset, 0),
    });

    overlay.style.top = "";
    overlay.style.bottom = "";
    overlay.style.left = "";
    overlay.style.right = "";

    for (const key of Object.keys(result.position) as Array<keyof typeof result.position>) {
      const value = result.position[key];
      if (value != null) {
        overlay.style[key] = `${value}px`;
      }
    }

    overlay.style.maxHeight = result.maxHeight != null ? `${result.maxHeight}px` : "";

    if (anchor && document.activeElement) {
      const anchorRect = document.activeElement.getBoundingClientRect();
      const scrollRect = scrollNode.getBoundingClientRect();
      const newOffset =
        anchor.type === "top"
          ? anchorRect.top - scrollRect.top
          : anchorRect.bottom - scrollRect.bottom;

      scrollNode.scrollTop += newOffset - anchor.offset;
    }

    position.value = result;
  };

  watchEffect(
    () => {
      updatePosition();
    },
    { flush: "sync" }
  );

  useResize(updatePosition);
  useElementResize(options.overlayRef, updatePosition);
  useElementResize(options.targetRef, updatePosition);

  watchEffect((onCleanup) => {
    if (typeof window === "undefined") {
      return;
    }

    const visualViewport = window.visualViewport;
    if (!visualViewport) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    const onResize = (): void => {
      isResizing.value = true;
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        isResizing.value = false;
      }, 500);

      updatePosition();
    };

    const onScroll = (): void => {
      if (isResizing.value) {
        onResize();
      }
    };

    visualViewport.addEventListener("resize", onResize);
    visualViewport.addEventListener("scroll", onScroll);

    onCleanup(() => {
      clearTimeout(timeout);
      visualViewport.removeEventListener("resize", onResize);
      visualViewport.removeEventListener("scroll", onScroll);
    });
  });

  const close = (): void => {
    if (!isResizing.value) {
      options.onClose?.();
    }
  };

  useCloseOnScroll({
    triggerRef: options.targetRef,
    isOpen: options.isOpen === undefined ? true : options.isOpen,
    onClose: options.onClose ? close : null,
  });

  return {
    overlayProps: computed<Record<string, unknown>>(() => ({
      style: {
        position: position.value ? "absolute" : "fixed",
        top: !position.value ? 0 : undefined,
        left: !position.value ? 0 : undefined,
        zIndex: 100000,
        ...position.value?.position,
        maxHeight: position.value?.maxHeight ?? "100vh",
      },
    })),
    placement: computed(() => position.value?.placement ?? null),
    triggerAnchorPoint: computed(() => position.value?.triggerAnchorPoint ?? null),
    arrowProps: computed<Record<string, unknown>>(() => ({
      "aria-hidden": "true",
      role: "presentation",
      style: {
        left: position.value?.arrowOffsetLeft,
        top: position.value?.arrowOffsetTop,
      },
    })),
    updatePosition,
  };
}
