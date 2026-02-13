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

import React from 'react';

function classNames(...values: Array<unknown>) {
  let classes: string[] = [];

  for (let value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      classes.push(value);
      continue;
    }

    if (typeof value === 'object') {
      for (let [key, enabled] of Object.entries(value)) {
        if (enabled) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

function mergeProps(...propsList: Array<Record<string, unknown> | undefined>) {
  let merged: Record<string, unknown> = {};

  for (let props of propsList) {
    if (!props) {
      continue;
    }

    for (let [key, value] of Object.entries(props)) {
      let previousValue = merged[key];
      if (typeof previousValue === 'function' && typeof value === 'function' && key.startsWith('on')) {
        merged[key] = (...args: unknown[]) => {
          previousValue(...args);
          value(...args);
        };
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

function mergeRefs<T = unknown>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    for (let ref of refs) {
      if (!ref) {
        continue;
      }

      if (typeof ref === 'function') {
        ref(value);
      } else if (typeof ref === 'object') {
        (ref as {current: T | null}).current = value;
      }
    }
  };
}

const dateSegments = [
  {type: 'month', text: '01', isPlaceholder: false, isEditable: true},
  {type: 'literal', text: '/', isPlaceholder: false, isEditable: false},
  {type: 'day', text: '31', isPlaceholder: false, isEditable: true},
  {type: 'literal', text: '/', isPlaceholder: false, isEditable: false},
  {type: 'year', text: '2020', isPlaceholder: false, isEditable: true}
];

const timeSegments = [
  {type: 'hour', text: '11', isPlaceholder: false, isEditable: true},
  {type: 'literal', text: ':', isPlaceholder: false, isEditable: false},
  {type: 'minute', text: '45', isPlaceholder: false, isEditable: true},
  {type: 'literal', text: ' ', isPlaceholder: false, isEditable: false},
  {type: 'dayPeriod', text: 'AM', isPlaceholder: false, isEditable: true}
];

vi.mock('@internationalized/date', async () => {
  let actual = await vi.importActual<typeof import('@internationalized/date')>('@internationalized/date');
  return {
    ...actual,
    createCalendar: () => ({
      identifier: 'gregory'
    })
  };
});

vi.mock('../src/utils', () => ({
  useFocusManagerRef: () => React.useRef(null),
  useFormatHelpText: () => '',
  useFormattedDateWidth: () => 10,
  useVisibleMonths: (maxVisibleMonths: number) => Math.max(1, Math.min(maxVisibleMonths, 1))
}));

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props,
  useProvider: () => ({scale: 'medium'})
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-spectrum/utils')>('@vue-spectrum/utils');
  return {
    ...actual,
    classNames,
    createDOMRef: <T,>(ref: {current: T | null}) => ({
      UNSAFE_getDOMNode: () => ref.current
    }),
    useValueEffect: (initialValue: boolean) => {
      let [value, setValue] = React.useState(initialValue);
      let setGeneratorValue = (generatorFactory: (currentValue: boolean) => Generator<boolean, void, boolean>) => {
        let generator = generatorFactory(value);
        let step = generator.next();
        if (!step.done) {
          setValue(step.value);
        }
      };
      return [value, setGeneratorValue] as const;
    }
  };
});

vi.mock('@vue-aria/utils', () => ({
  mergeProps,
  mergeRefs,
  useEvent: () => undefined,
  useLayoutEffect: React.useEffect,
  useResizeObserver: () => undefined
}));

vi.mock('@vue-aria/focus', () => ({
  useFocusRing: () => ({
    focusProps: {},
    isFocusVisible: false,
    isFocused: false
  }),
  createFocusManager: () => ({
    focusFirst: () => undefined
  })
}));

vi.mock('@vue-aria/interactions', () => ({
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  })
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string) => {
      if (key === 'time') {
        return 'Time';
      }
      if (key === 'startTime') {
        return 'Start time';
      }
      if (key === 'endTime') {
        return 'End time';
      }
      return key;
    }
  }),
  useDateFormatter: () => ({
    format: () => '01/31/2020',
    formatToParts: () => [{type: 'month', value: '01'}, {type: 'literal', value: '/'}, {type: 'day', value: '31'}]
  })
}));

vi.mock('@vue-spectrum/label', () => ({
  Field: ({
    children,
    label,
    labelProps,
    wrapperClassName
  }: {
    children?: React.ReactNode,
    label?: React.ReactNode,
    labelProps?: Record<string, unknown>,
    wrapperClassName?: string
  }) => React.createElement(
    'span',
    {
      className: wrapperClassName
    },
    label ? React.createElement('span', labelProps, label) : null,
    children
  )
}));

vi.mock('@vue-spectrum/button', () => ({
  FieldButton: ({
    children,
    onPress,
    isDisabled,
    UNSAFE_className,
    isQuiet: _isQuiet,
    validationState: _validationState,
    ...props
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
    UNSAFE_className?: string;
  } & Record<string, unknown>) => React.createElement(
    'button',
    {
      ...props,
      type: 'button',
      className: UNSAFE_className,
      disabled: Boolean(isDisabled),
      onClick: () => {
        if (!isDisabled) {
          onPress?.();
        }
      }
    },
    children
  )
}));

vi.mock('@vue-spectrum/dialog', () => ({
  DialogTrigger: ({
    children,
    isOpen,
    onOpenChange
  }: {
    children?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => {
    let [trigger, content] = React.Children.toArray(children);
    let triggerElement = trigger;
    if (React.isValidElement(triggerElement)) {
      let triggerProps = triggerElement.props as Record<string, unknown>;
      triggerElement = React.cloneElement(triggerElement, {
        ...triggerProps,
        onClick: (...args: unknown[]) => {
          (triggerProps.onClick as ((...args: unknown[]) => void) | undefined)?.(...args);
          onOpenChange?.(!isOpen);
        }
      });
    }

    return React.createElement(
      React.Fragment,
      null,
      triggerElement,
      isOpen ? content : null
    );
  },
  Dialog: ({children, ...props}: {children?: React.ReactNode} & Record<string, unknown>) =>
    React.createElement('div', {...props, role: 'dialog'}, children)
}));

vi.mock('@vue-spectrum/view', () => ({
  Content: ({children}: {children?: React.ReactNode}) => React.createElement('div', null, children)
}));

vi.mock('@vue-spectrum/layout', () => ({
  Flex: ({children}: {children?: React.ReactNode}) => React.createElement('div', null, children)
}));

vi.mock('@vue-spectrum/calendar', () => ({
  Calendar: () => React.createElement('div', {'data-testid': 'calendar'}, 'Calendar'),
  RangeCalendar: () => React.createElement('div', {'data-testid': 'range-calendar'}, 'RangeCalendar')
}));

vi.mock('@vue-stately/datepicker', () => ({
  useDateFieldState: () => ({
    segments: dateSegments,
    validationState: null,
    getDateFormatter: () => ({
      format: () => '01/31/2020'
    })
  }),
  useTimeFieldState: () => ({
    segments: timeSegments,
    validationState: null,
    getDateFormatter: () => ({
      format: () => '11:45 AM'
    })
  }),
  useDatePickerState: (props: Record<string, unknown> = {}) => {
    let [isOpen, setOpen] = React.useState(Boolean(props.defaultOpen));
    return {
      isOpen,
      setOpen,
      hasTime: false,
      granularity: 'day',
      validationState: null,
      timeValue: null,
      setTimeValue: () => undefined
    };
  },
  useDateRangePickerState: (props: Record<string, unknown> = {}) => {
    let [isOpen, setOpen] = React.useState(Boolean(props.defaultOpen));
    return {
      isOpen,
      setOpen,
      hasTime: false,
      granularity: 'day',
      validationState: null,
      timeRange: null,
      setTime: () => undefined
    };
  }
}));

vi.mock('@vue-aria/datepicker', () => ({
  useDateField: (props: Record<string, unknown>) => ({
    labelProps: {},
    fieldProps: {
      role: 'group'
    },
    inputProps: {
      type: 'text',
      'aria-label': props['aria-label'] ?? 'Date field input'
    },
    descriptionProps: {},
    errorMessageProps: {},
    isInvalid: false,
    validationErrors: [],
    validationDetails: {}
  }),
  useTimeField: (props: Record<string, unknown>) => ({
    labelProps: {},
    fieldProps: {
      role: 'group'
    },
    inputProps: {
      type: 'text',
      'aria-label': props['aria-label'] ?? 'Time field input'
    },
    descriptionProps: {},
    errorMessageProps: {},
    isInvalid: false,
    validationErrors: [],
    validationDetails: {}
  }),
  useDatePicker: (_props: Record<string, unknown>, state: {setOpen: (open: boolean) => void; isOpen: boolean}) => ({
    groupProps: {
      role: 'group'
    },
    labelProps: {},
    fieldProps: {},
    descriptionProps: {},
    errorMessageProps: {},
    buttonProps: {
      'aria-label': 'Open calendar',
      onPress: () => state.setOpen(!state.isOpen)
    },
    dialogProps: {},
    calendarProps: {},
    isInvalid: false,
    validationErrors: [],
    validationDetails: {}
  }),
  useDateRangePicker: (_props: Record<string, unknown>, state: {setOpen: (open: boolean) => void; isOpen: boolean}) => ({
    groupProps: {
      role: 'group'
    },
    labelProps: {},
    buttonProps: {
      'aria-label': 'Open range calendar',
      onPress: () => state.setOpen(!state.isOpen)
    },
    dialogProps: {},
    startFieldProps: {},
    endFieldProps: {},
    descriptionProps: {},
    errorMessageProps: {},
    calendarProps: {},
    isInvalid: false,
    validationErrors: [],
    validationDetails: {}
  }),
  useDateSegment: () => ({
    segmentProps: {
      role: 'spinbutton',
      style: {}
    }
  }),
  useDisplayNames: () => ({
    of: (value: string) => value
  })
}));
