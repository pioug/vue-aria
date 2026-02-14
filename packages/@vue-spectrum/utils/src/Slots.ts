import { mergeProps } from "@vue-aria/utils";
import type { ReadonlyRef } from "@vue-aria/types";
import { computed, defineComponent, inject, provide, type PropType } from "vue";

interface SlotProps {
  slot?: string;
}

type SlotMap = Record<string, Record<string, unknown>>;

const SlotContextSymbol = Symbol("vue-spectrum-slot-context");

export function useSlotProps<T extends Record<string, unknown> & { id?: string }>(
  props: T,
  defaultSlot?: string
): T {
  const slot = (props as SlotProps).slot || defaultSlot;
  const context = inject<ReadonlyRef<SlotMap> | null>(SlotContextSymbol, null);
  const slotProps = (slot ? context?.value[slot] : undefined) ?? {};

  return mergeProps(props, mergeProps(slotProps, { id: props.id })) as T;
}

export function cssModuleToSlots(
  cssModule: Record<string, string>
): Record<string, { UNSAFE_className: string }> {
  return Object.keys(cssModule).reduce<Record<string, { UNSAFE_className: string }>>((acc, slot) => {
    acc[slot] = { UNSAFE_className: cssModule[slot] };
    return acc;
  }, {});
}

export const SlotProvider = defineComponent({
  name: "SlotProvider",
  props: {
    slots: {
      type: Object as PropType<SlotMap | undefined>,
      required: false,
    },
  },
  setup(props, { slots }) {
    const parentSlots = inject<ReadonlyRef<SlotMap> | null>(SlotContextSymbol, null);
    const value = computed<SlotMap>(() => {
      const inherited = parentSlots?.value ?? {};
      const own = props.slots ?? {};
      const keys = new Set([...Object.keys(inherited), ...Object.keys(own)]);
      const merged: SlotMap = {};

      for (const key of keys) {
        merged[key] = mergeProps(inherited[key] ?? {}, own[key] ?? {});
      }

      return merged;
    });

    provide(SlotContextSymbol, value);
    return () => slots.default?.();
  },
});

export const ClearSlots = defineComponent({
  name: "ClearSlots",
  setup(_, { slots }) {
    const value = computed<SlotMap>(() => ({}));
    provide(SlotContextSymbol, value);
    return () => slots.default?.();
  },
});
