import {
  computed,
  defineComponent,
  inject,
  provide,
  type PropType,
} from "vue";
import type { ReadonlyRef } from "@vue-aria/types";
import { mergeProps } from "@vue-aria/utils";

export type SlotProps = Record<string, unknown>;
export type SlotMap = Record<string, SlotProps>;

const SLOT_CONTEXT_SYMBOL: unique symbol = Symbol("vue-spectrum-slots");

function mergeSlotMaps(parentSlots: SlotMap, localSlots: SlotMap): SlotMap {
  const merged: SlotMap = {};
  const slotKeys = new Set([
    ...Object.keys(parentSlots),
    ...Object.keys(localSlots),
  ]);

  for (const slotKey of slotKeys) {
    merged[slotKey] = mergeProps(
      parentSlots[slotKey] ?? {},
      localSlots[slotKey] ?? {}
    );
  }

  return merged;
}

export function useSlotProps<T extends Record<string, unknown>>(
  props: T & { id?: string; slot?: string },
  defaultSlot?: string
): T {
  const slotName = (props.slot as string | undefined) ?? defaultSlot;
  if (!slotName) {
    return props;
  }

  const slotContext = inject<ReadonlyRef<SlotMap> | null>(
    SLOT_CONTEXT_SYMBOL,
    null
  );
  if (!slotContext) {
    return props;
  }

  const slotProps = slotContext.value[slotName] ?? {};
  return mergeProps(props, mergeProps(slotProps, { id: props.id })) as T;
}

export function cssModuleToSlots(
  cssModule: Record<string, string>
): Record<string, { UNSAFE_className: string }> {
  return Object.keys(cssModule).reduce(
    (acc, slotName) => {
      acc[slotName] = { UNSAFE_className: cssModule[slotName] };
      return acc;
    },
    {} as Record<string, { UNSAFE_className: string }>
  );
}

export const SlotProvider = defineComponent({
  name: "SlotProvider",
  props: {
    slots: {
      type: Object as PropType<SlotMap | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const parentSlots = inject<ReadonlyRef<SlotMap> | null>(
      SLOT_CONTEXT_SYMBOL,
      null
    );

    const mergedSlots = computed<SlotMap>(() =>
      mergeSlotMaps(parentSlots?.value ?? {}, props.slots ?? {})
    );

    provide(SLOT_CONTEXT_SYMBOL, mergedSlots);

    return () => slots.default?.();
  },
});

export const ClearSlots = defineComponent({
  name: "ClearSlots",
  setup(_, { slots }) {
    const emptySlots = computed<SlotMap>(() => ({}));
    provide(SLOT_CONTEXT_SYMBOL, emptySlots);

    return () => slots.default?.();
  },
});
