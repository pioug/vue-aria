import { getScrollLeft, setScrollLeft } from "./utils";
import type { Direction, Rect, Size } from "./utils";

export interface ScrollViewProps {
  contentSize: Size;
  onVisibleRectChange: (rect: Rect) => void;
  children?: unknown;
  innerStyle?: Record<string, string | number>;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  scrollDirection?: "horizontal" | "vertical" | "both";
  ref?: { current: HTMLElement | null };
  style?: Record<string, string | number>;
}

export interface ScrollViewAria {
  isScrolling: boolean;
  scrollViewProps: Record<string, unknown>;
  contentProps: Record<string, unknown>;
}

export function useScrollView(props: ScrollViewProps, ref: { current: HTMLElement | null }): ScrollViewAria {
  const {
    contentSize,
    onVisibleRectChange,
    onScrollStart,
    onScrollEnd,
    scrollDirection = "both",
    ...otherProps
  } = props;

  const state = {
    isScrolling: false,
    scrollTop: 0,
    scrollLeft: 0,
    width: 0,
    height: 0,
    timer: 0 as ReturnType<typeof setTimeout> | 0,
  };

  const onScroll = (event: { currentTarget: HTMLElement }) => {
    if (event.currentTarget !== ref.current) return;
    if (state.isScrolling !== true) {
      state.isScrolling = true;
      onScrollStart?.();
    }

    const target = event.currentTarget;
    state.scrollTop = target.scrollTop;
    state.scrollLeft = getScrollLeft(target, "ltr");
    const width = target.clientWidth || 0;
    const height = target.clientHeight || 0;
    onVisibleRectChange({x: state.scrollLeft, y: state.scrollTop, width, height});

    clearTimeout(state.timer as number);
    state.timer = window.setTimeout(() => {
      state.isScrolling = false;
      onScrollEnd?.();
    }, 300);
  };

  const onResize = () => {
    const element = ref.current;
    if (!element) return;
    onVisibleRectChange({
      x: state.scrollLeft,
      y: state.scrollTop,
      width: Math.min(element.clientWidth || contentSize.width, contentSize.width),
      height: Math.min(element.clientHeight || contentSize.height, contentSize.height),
    });
  };

  const setScrollViewState = (direction: Direction = "ltr") => {
    if (!ref.current) return;
    state.width = ref.current.clientWidth;
    state.height = ref.current.clientHeight;
    if (state.width > 0 && state.height > 0) {
      onVisibleRectChange({
        x: getScrollLeft(ref.current, direction),
        y: ref.current.scrollTop,
        width: state.width,
        height: state.height,
      });
    }
  };

  return {
    isScrolling: state.isScrolling,
    scrollViewProps: {
      ...otherProps,
      onScroll,
      style: {
        overflow: scrollDirection === "horizontal" ? "auto hidden" : "hidden auto",
      },
      role: "presentation",
    },
    contentProps: {
      style: {
        width: contentSize.width,
        height: contentSize.height,
      },
      onResize,
      setScrollViewState,
      setScrollLeft: (value: number) => {
        const element = ref.current;
        if (element) {
          setScrollLeft(element, "ltr", value);
        }
      },
    },
  };
}

export function ScrollView(props: ScrollViewProps & { ref: { current: HTMLElement | null } }) {
  const result = useScrollView(props, props.ref);
  return {
    role: "presentation",
    props: result.scrollViewProps,
    content: {
      props: result.contentProps,
      children: props.children,
    },
  };
}
