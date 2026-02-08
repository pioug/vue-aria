import type { MaybeReactive } from "@vue-aria/types";

export interface DateFieldSegment {
  type: string;
  text: string;
  value?: number | string | null;
  minValue?: number;
  maxValue?: number;
  isPlaceholder?: boolean;
  placeholder?: string;
  isEditable?: boolean;
}

export interface DateFieldDisplayValidation {
  isInvalid: boolean;
  validationErrors?: string[];
  validationDetails?: unknown;
}

export interface FocusManager {
  focusFirst: () => boolean;
  focusNext: () => boolean;
  focusPrevious: () => boolean;
}

export interface DateFieldHookData {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  focusManager: FocusManager;
}

export interface UseDateFieldState {
  value?: MaybeReactive<{ toString: () => string } | null | undefined>;
  defaultValue?: MaybeReactive<{ toString: () => string } | null | undefined>;
  dateValue?: MaybeReactive<{ toString: () => string } | null | undefined>;
  maxGranularity?: MaybeReactive<string | undefined>;
  segments: MaybeReactive<readonly DateFieldSegment[]>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  displayValidation?: MaybeReactive<DateFieldDisplayValidation | undefined>;
  confirmPlaceholder: () => void;
  commitValidation: () => void;
  setValue?: (value: unknown) => void;
}

export interface UseDateSegmentState {
  segments: MaybeReactive<readonly DateFieldSegment[]>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  increment: (segmentType: string) => void;
  decrement: (segmentType: string) => void;
  incrementPage: (segmentType: string) => void;
  decrementPage: (segmentType: string) => void;
  incrementToMax: (segmentType: string) => void;
  decrementToMin: (segmentType: string) => void;
  clearSegment: (segmentType: string) => void;
  setSegment: (segmentType: string, value: number | string) => void;
}
