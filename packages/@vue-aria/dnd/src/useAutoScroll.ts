import { RefObject } from "vue";

export interface AutoScrollAria {
  scrollProps?: Record<string, unknown>;
}

export function useAutoScroll(_ref: RefObject<Element | null>): AutoScrollAria {
  return {};
}
