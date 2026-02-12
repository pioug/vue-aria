/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {defineComponent, inject, onMounted, provide, readonly, ref, type InjectionKey, type PropType, type Ref, type VNode} from 'vue';

interface SSRContextValue {
  prefix: string;
  current: number;
}

const defaultContext: SSRContextValue = {
  prefix: String(Math.round(Math.random() * 10_000_000_000)),
  current: 0
};

const SSR_CONTEXT: InjectionKey<SSRContextValue> = Symbol('SSRContext');
const IS_SSR_CONTEXT: InjectionKey<Ref<boolean>> = Symbol('IsSSRContext');

function useCounter(context: SSRContextValue, isDisabled = false): number | null {
  if (isDisabled) {
    return null;
  }
  context.current += 1;
  return context.current;
}

export interface SSRProviderProps {
  children?: VNode[] | VNode;
}

/**
 * Wraps app sections to ensure deterministic ids across server render + hydration.
 */
export const SSRProvider = defineComponent({
  name: 'SSRProvider',
  props: {
    children: {
      type: [Array, Object] as PropType<VNode[] | VNode>,
      required: false,
      default: undefined
    }
  },
  setup(props, {slots}) {
    const parent = inject(SSR_CONTEXT, defaultContext);
    const counter = useCounter(parent, parent === defaultContext);
    const value: SSRContextValue = {
      prefix: parent === defaultContext ? '' : `${parent.prefix}-${counter}`,
      current: 0
    };
    provide(SSR_CONTEXT, value);

    const isSSR = ref(true);
    if (typeof window !== 'undefined') {
      onMounted(() => {
        isSSR.value = false;
      });
    }
    provide(IS_SSR_CONTEXT, readonly(isSSR));

    return () => slots.default?.() ?? props.children ?? null;
  }
});

function useLegacySSRSafeId(defaultId?: string): string {
  const context = inject(SSR_CONTEXT, defaultContext);
  const counter = useCounter(context, Boolean(defaultId));
  const prefix = context === defaultContext && process.env.NODE_ENV === 'test'
    ? 'react-aria'
    : `react-aria${context.prefix}`;

  return defaultId ?? `${prefix}-${counter}`;
}

/** @private */
export const useSSRSafeId = useLegacySSRSafeId;

/**
 * Returns whether rendering is currently server-side or pre-hydration.
 */
export function useIsSSR(): boolean {
  const isSSR = inject(IS_SSR_CONTEXT, null);
  if (isSSR) {
    return isSSR.value;
  }

  return typeof window === 'undefined';
}
