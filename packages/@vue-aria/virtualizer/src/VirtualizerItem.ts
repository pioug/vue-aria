import {
  computed,
  defineComponent,
  h,
  ref,
  type CSSProperties,
  type PropType,
} from "vue";
import { useLocale } from "@vue-aria/i18n";
import { mergeProps } from "@vue-aria/utils";
import type { LayoutInfo } from "@vue-aria/virtualizer-state";
import { useVirtualizerItem } from "./useVirtualizerItem";
import type { VirtualizerItemVirtualizer } from "./useVirtualizerItem";
import type { Direction } from "./utils";

const layoutStyleCache = new WeakMap<LayoutInfo, CSSProperties>();

export function layoutInfoToStyle(
  layoutInfo: LayoutInfo,
  dir: Direction,
  parent?: LayoutInfo | null
): CSSProperties {
  const xProperty = dir === "rtl" ? "right" : "left";
  const cached = layoutStyleCache.get(layoutInfo);
  if (cached && cached[xProperty] != null) {
    if (!parent) {
      return cached;
    }

    const top = layoutInfo.rect.y - parent.rect.y;
    const x = layoutInfo.rect.x - parent.rect.x;
    if (cached.top === top && cached[xProperty] === x) {
      return cached;
    }
  }

  const shouldOffsetByParent = !(parent?.allowOverflow && layoutInfo.isSticky);
  const rectStyles: Record<string, number | undefined> = {
    top: layoutInfo.rect.y - (parent && shouldOffsetByParent ? parent.rect.y : 0),
    [xProperty]:
      layoutInfo.rect.x - (parent && shouldOffsetByParent ? parent.rect.x : 0),
    width: layoutInfo.rect.width,
    height: layoutInfo.rect.height,
  };

  for (const [key, value] of Object.entries(rectStyles)) {
    if (!Number.isFinite(value)) {
      rectStyles[key] = undefined;
    }
  }

  const style: CSSProperties = {
    position: layoutInfo.isSticky ? "sticky" : "absolute",
    display: layoutInfo.isSticky ? "inline-block" : undefined,
    overflow: layoutInfo.allowOverflow ? "visible" : "hidden",
    opacity: layoutInfo.opacity,
    zIndex: layoutInfo.zIndex,
    transform: layoutInfo.transform ?? undefined,
    contain: "size layout style",
    ...rectStyles,
  };

  layoutStyleCache.set(layoutInfo, style);
  return style;
}

export const VirtualizerItem = defineComponent({
  name: "VirtualizerItem",
  props: {
    layoutInfo: {
      type: Object as PropType<LayoutInfo>,
      required: true,
    },
    virtualizer: {
      type: Object as PropType<VirtualizerItemVirtualizer>,
      required: true,
    },
    parent: {
      type: Object as PropType<LayoutInfo | null | undefined>,
      default: undefined,
    },
    style: {
      type: Object as PropType<CSSProperties | undefined>,
      default: undefined,
    },
    className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const locale = useLocale();
    const elementRef = ref<HTMLElement | null>(null);

    useVirtualizerItem({
      layoutInfo: computed(() => props.layoutInfo),
      virtualizer: computed(() => props.virtualizer),
      ref: elementRef,
    });

    const style = computed<CSSProperties>(() => ({
      ...layoutInfoToStyle(
        props.layoutInfo,
        locale.value.direction,
        props.parent ?? null
      ),
      ...(props.style ?? {}),
    }));

    return () =>
      h(
        "div",
        mergeProps(attrs as Record<string, unknown>, {
          role: "presentation",
          ref: elementRef,
          class: props.className,
          style: style.value,
        }),
        slots.default?.()
      );
  },
});
