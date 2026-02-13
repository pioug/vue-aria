import { calculatePosition, getRect, type PositionResult } from "./calculatePosition";
import { nodeContains } from "@vue-aria/utils";
import { computed, onScopeDispose, ref, watch, watchEffect } from "vue";
import { useCloseOnScroll } from "./useCloseOnScroll";
import { useLocale } from "@vue-aria/i18n";
import type { Placement, PlacementAxis, PositionProps } from "./types";

export interface AriaPositionProps extends PositionProps {
  arrowSize?: number;
  boundaryElement?: Element;
  targetRef: { current: Element | null };
  overlayRef: { current: Element | null };
  arrowRef?: { current: Element | null };
  scrollRef?: { current: Element | null };
  shouldUpdatePosition?: boolean;
  onClose?: (() => void) | null;
  maxHeight?: number;
  arrowBoundaryOffset?: number;
}

export interface PositionAria {
  overlayProps: Record<string, unknown>;
  arrowProps: Record<string, unknown>;
  placement: PlacementAxis | null;
  triggerAnchorPoint: { x: number; y: number } | null;
  updatePosition(): void;
}

interface ScrollAnchor {
  type: "top" | "bottom";
  offset: number;
}

const visualViewport = typeof document !== "undefined" ? window.visualViewport : null;

export function useOverlayPosition(props: AriaPositionProps): PositionAria {
  const locale = useLocale();
  const {
    arrowSize,
    targetRef,
    overlayRef,
    arrowRef,
    scrollRef = overlayRef,
    placement = "bottom" as Placement,
    containerPadding = 12,
    shouldFlip = true,
    boundaryElement = typeof document !== "undefined" ? document.body : null,
    offset = 0,
    crossOffset = 0,
    shouldUpdatePosition = true,
    isOpen = true,
    onClose,
    maxHeight,
    arrowBoundaryOffset = 0,
  } = props;

  const position = ref<PositionResult | null>(null);
  const isResizing = ref(false);
  const lastScale = ref(visualViewport?.scale);

  watch(
    () => isOpen,
    (open) => {
      if (open) {
        lastScale.value = visualViewport?.scale;
      }
    },
    { immediate: true }
  );

  const updatePosition = () => {
    if (
      shouldUpdatePosition === false ||
      !isOpen ||
      !overlayRef.current ||
      !targetRef.current ||
      !boundaryElement
    ) {
      return;
    }

    if (visualViewport?.scale !== lastScale.value) {
      return;
    }

    let anchor: ScrollAnchor | null = null;
    if (scrollRef.current && nodeContains(scrollRef.current, document.activeElement)) {
      const anchorRect = document.activeElement?.getBoundingClientRect();
      const scrollRect = scrollRef.current.getBoundingClientRect();
      anchor = {
        type: "top",
        offset: (anchorRect?.top ?? 0) - scrollRect.top,
      };
      if (anchor.offset > scrollRect.height / 2) {
        anchor.type = "bottom";
        anchor.offset = (anchorRect?.bottom ?? 0) - scrollRect.bottom;
      }
    }

    const overlay = overlayRef.current as HTMLElement;
    if (!maxHeight && overlayRef.current) {
      overlay.style.top = "0px";
      overlay.style.bottom = "";
      overlay.style.maxHeight = `${window.visualViewport?.height ?? window.innerHeight}px`;
    }

    const nextPosition = calculatePosition({
      placement: translateRTL(placement, locale.value.direction) as Placement,
      overlayNode: overlayRef.current,
      targetNode: targetRef.current,
      scrollNode: scrollRef.current || overlayRef.current,
      padding: containerPadding,
      shouldFlip,
      boundaryElement,
      offset,
      crossOffset,
      maxHeight,
      arrowSize: arrowSize ?? (arrowRef?.current ? getRect(arrowRef.current, true).width : 0),
      arrowBoundaryOffset,
    });

    if (!nextPosition.position) {
      return;
    }

    overlay.style.top = "";
    overlay.style.bottom = "";
    overlay.style.left = "";
    overlay.style.right = "";

    Object.keys(nextPosition.position).forEach((key) => {
      (overlay.style as unknown as Record<string, string>)[key] = `${(nextPosition.position as Record<string, number>)[key]}px`;
    });
    overlay.style.maxHeight = nextPosition.maxHeight != null ? `${nextPosition.maxHeight}px` : "";

    if (anchor && document.activeElement && scrollRef.current) {
      const anchorRect = document.activeElement.getBoundingClientRect();
      const scrollRect = scrollRef.current.getBoundingClientRect();
      const newOffset = anchorRect[anchor.type] - scrollRect[anchor.type];
      scrollRef.current.scrollTop += newOffset - anchor.offset;
    }

    position.value = nextPosition;
  };

  watchEffect(() => {
    void shouldUpdatePosition;
    void placement;
    void overlayRef.current;
    void targetRef.current;
    void arrowRef?.current;
    void scrollRef.current;
    void containerPadding;
    void shouldFlip;
    void boundaryElement;
    void offset;
    void crossOffset;
    void isOpen;
    void locale.value.direction;
    void maxHeight;
    void arrowBoundaryOffset;
    void arrowSize;
    updatePosition();
  });

  if (typeof window !== "undefined") {
    const onWindowResize = () => updatePosition();
    window.addEventListener("resize", onWindowResize, false);
    onScopeDispose(() => {
      window.removeEventListener("resize", onWindowResize, false);
    });
  }

  const onViewportResize = () => {
    isResizing.value = true;
    updatePosition();
    setTimeout(() => {
      isResizing.value = false;
    }, 500);
  };

  const onViewportScroll = () => {
    if (isResizing.value) {
      onViewportResize();
    }
  };

  visualViewport?.addEventListener("resize", onViewportResize);
  visualViewport?.addEventListener("scroll", onViewportScroll);
  onScopeDispose(() => {
    visualViewport?.removeEventListener("resize", onViewportResize);
    visualViewport?.removeEventListener("scroll", onViewportScroll);
  });

  const close = () => {
    if (!isResizing.value) {
      onClose?.();
    }
  };

  useCloseOnScroll({
    triggerRef: targetRef,
    isOpen,
    onClose: onClose ? close : null,
  });

  const overlayStyle = computed(() => ({
    position: position.value ? "absolute" : "fixed",
    top: !position.value ? 0 : undefined,
    left: !position.value ? 0 : undefined,
    zIndex: 100000,
    ...position.value?.position,
    maxHeight: position.value?.maxHeight ?? "100vh",
  }));

  return {
    overlayProps: {
      style: overlayStyle.value,
    },
    placement: position.value?.placement ?? null,
    triggerAnchorPoint: position.value?.triggerAnchorPoint ?? null,
    arrowProps: {
      "aria-hidden": "true",
      role: "presentation",
      style: {
        left: position.value?.arrowOffsetLeft,
        top: position.value?.arrowOffsetTop,
      },
    },
    updatePosition,
  };
}

function translateRTL(position: string, direction: string): string {
  if (direction === "rtl") {
    return position.replace("start", "right").replace("end", "left");
  }
  return position.replace("start", "left").replace("end", "right");
}
