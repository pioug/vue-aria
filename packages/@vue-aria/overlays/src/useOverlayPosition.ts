import { calculatePosition, getRect, type PositionResult } from "./calculatePosition";
import { nodeContains } from "@vue-aria/utils";
import { computed, onScopeDispose, ref, toValue, watch, watchEffect } from "vue";
import { useCloseOnScroll } from "./useCloseOnScroll";
import { useLocale } from "@vue-aria/i18n";
import type { Placement, PlacementAxis } from "./types";

type MaybeGetter<T> = T | (() => T);

export interface AriaPositionProps {
  arrowSize?: MaybeGetter<number | undefined>;
  boundaryElement?: MaybeGetter<Element | null | undefined>;
  targetRef: MaybeGetter<{ current: Element | null }>;
  overlayRef: MaybeGetter<{ current: Element | null }>;
  arrowRef?: MaybeGetter<{ current: Element | null } | undefined>;
  scrollRef?: MaybeGetter<{ current: Element | null } | undefined>;
  shouldUpdatePosition?: MaybeGetter<boolean | undefined>;
  onClose?: MaybeGetter<(() => void) | null | undefined>;
  maxHeight?: MaybeGetter<number | undefined>;
  arrowBoundaryOffset?: MaybeGetter<number | undefined>;
  placement?: MaybeGetter<Placement | undefined>;
  containerPadding?: MaybeGetter<number | undefined>;
  shouldFlip?: MaybeGetter<boolean | undefined>;
  offset?: MaybeGetter<number | undefined>;
  crossOffset?: MaybeGetter<number | undefined>;
  isOpen?: MaybeGetter<boolean | undefined>;
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

function readValue<T>(value: MaybeGetter<T> | undefined): T | undefined {
  return toValue(value as any) as T | undefined;
}

function readValueOr<T>(value: MaybeGetter<T | undefined> | undefined, fallback: T): T {
  return readValue(value) ?? fallback;
}

export function useOverlayPosition(props: AriaPositionProps): PositionAria {
  const locale = useLocale();

  const getTargetRef = (): { current: Element | null } | null => readValue(props.targetRef) ?? null;
  const getOverlayRef = (): { current: Element | null } | null => readValue(props.overlayRef) ?? null;
  const getArrowRef = (): { current: Element | null } | null => readValue(props.arrowRef) ?? null;
  const getScrollRef = (overlayRef: { current: Element | null } | null): { current: Element | null } | null =>
    readValue(props.scrollRef) ?? overlayRef;
  const getPlacement = (): Placement => readValueOr(props.placement, "bottom" as Placement);
  const getContainerPadding = (): number => readValueOr(props.containerPadding, 12);
  const getShouldFlip = (): boolean => readValueOr(props.shouldFlip, true);
  const getBoundaryElement = (): Element | null =>
    readValue(props.boundaryElement) ?? (typeof document !== "undefined" ? document.body : null);
  const getOffset = (): number => readValueOr(props.offset, 0);
  const getCrossOffset = (): number => readValueOr(props.crossOffset, 0);
  const getShouldUpdatePosition = (): boolean => readValueOr(props.shouldUpdatePosition, true);
  const getIsOpen = (): boolean => readValueOr(props.isOpen, true);
  const getOnClose = (): (() => void) | null => readValue(props.onClose) ?? null;
  const getMaxHeight = (): number | undefined => readValue(props.maxHeight);
  const getArrowBoundaryOffset = (): number => readValueOr(props.arrowBoundaryOffset, 0);
  const getArrowSize = (): number | undefined => readValue(props.arrowSize);

  const position = ref<PositionResult | null>(null);
  const isResizing = ref(false);
  const lastScale = ref(visualViewport?.scale);

  watch(
    () => getIsOpen(),
    (open) => {
      if (open) {
        lastScale.value = visualViewport?.scale;
      }
    },
    { immediate: true }
  );

  const updatePosition = () => {
    const shouldUpdatePosition = getShouldUpdatePosition();
    const isOpen = getIsOpen();
    const overlayRef = getOverlayRef();
    const targetRef = getTargetRef();
    const boundaryElement = getBoundaryElement();

    if (
      shouldUpdatePosition === false ||
      !isOpen ||
      !overlayRef?.current ||
      !targetRef?.current ||
      !boundaryElement
    ) {
      return;
    }

    if (visualViewport?.scale !== lastScale.value) {
      return;
    }

    const placement = getPlacement();
    const containerPadding = getContainerPadding();
    const shouldFlip = getShouldFlip();
    const offset = getOffset();
    const crossOffset = getCrossOffset();
    const maxHeight = getMaxHeight();
    const arrowBoundaryOffset = getArrowBoundaryOffset();
    const arrowRef = getArrowRef();
    const scrollRef = getScrollRef(overlayRef);

    let anchor: ScrollAnchor | null = null;
    if (scrollRef?.current && nodeContains(scrollRef.current, document.activeElement)) {
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
    if (!maxHeight) {
      overlay.style.top = "0px";
      overlay.style.bottom = "";
      overlay.style.maxHeight = `${window.visualViewport?.height ?? window.innerHeight}px`;
    }

    const nextPosition = calculatePosition({
      placement: translateRTL(placement, locale.value.direction) as Placement,
      overlayNode: overlayRef.current,
      targetNode: targetRef.current,
      scrollNode: scrollRef?.current || overlayRef.current,
      padding: containerPadding,
      shouldFlip,
      boundaryElement,
      offset,
      crossOffset,
      maxHeight,
      arrowSize: getArrowSize() ?? (arrowRef?.current ? getRect(arrowRef.current, true).width : 0),
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

    if (arrowRef?.current instanceof HTMLElement) {
      arrowRef.current.style.left = nextPosition.arrowOffsetLeft != null ? `${nextPosition.arrowOffsetLeft}px` : "";
      arrowRef.current.style.top = nextPosition.arrowOffsetTop != null ? `${nextPosition.arrowOffsetTop}px` : "";
    }

    if (anchor && document.activeElement && scrollRef?.current) {
      const anchorRect = document.activeElement.getBoundingClientRect();
      const scrollRect = scrollRef.current.getBoundingClientRect();
      const newOffset = anchorRect[anchor.type] - scrollRect[anchor.type];
      scrollRef.current.scrollTop += newOffset - anchor.offset;
    }

    position.value = nextPosition;
  };

  watchEffect(() => {
    const overlayRef = getOverlayRef();
    const targetRef = getTargetRef();
    const arrowRef = getArrowRef();
    const scrollRef = getScrollRef(overlayRef);

    void getShouldUpdatePosition();
    void getPlacement();
    void overlayRef?.current;
    void targetRef?.current;
    void arrowRef?.current;
    void scrollRef?.current;
    void getContainerPadding();
    void getShouldFlip();
    void getBoundaryElement();
    void getOffset();
    void getCrossOffset();
    void getIsOpen();
    void locale.value.direction;
    void getMaxHeight();
    void getArrowBoundaryOffset();
    void getArrowSize();
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
      getOnClose()?.();
    }
  };

  useCloseOnScroll({
    get triggerRef() {
      return getTargetRef() ?? { current: null };
    },
    get isOpen() {
      return getIsOpen();
    },
    get onClose() {
      return getOnClose() ? close : null;
    },
  });

  const overlayStyle = computed(() => ({
    position: position.value ? "absolute" : "fixed",
    top: !position.value ? 0 : undefined,
    left: !position.value ? 0 : undefined,
    zIndex: 100000,
    ...position.value?.position,
    maxHeight: position.value?.maxHeight ?? "100vh",
  }));

  const overlayProps: Record<string, unknown> = {};
  Object.defineProperty(overlayProps, "style", {
    enumerable: true,
    get: () => overlayStyle.value,
  });

  const arrowProps: Record<string, unknown> = {
    "aria-hidden": "true",
    role: "presentation",
  };
  Object.defineProperty(arrowProps, "style", {
    enumerable: true,
    get: () => ({
      left: position.value?.arrowOffsetLeft,
      top: position.value?.arrowOffsetTop,
    }),
  });

  return {
    overlayProps,
    arrowProps,
    get placement() {
      return position.value?.placement ?? null;
    },
    get triggerAnchorPoint() {
      return position.value?.triggerAnchorPoint ?? null;
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
