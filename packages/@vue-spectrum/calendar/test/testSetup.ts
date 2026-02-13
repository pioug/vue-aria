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

type DateLike = {
  year: number,
  month: number,
  day: number
};

type MockState = {
  kind: 'calendar' | 'range',
  isDisabled?: boolean,
  isReadOnly?: boolean,
  visibleRange: {
    start: MockCalendarDate
  },
  timeZone: string,
  isValueInvalid: boolean,
  focusNextPage: () => void,
  focusPreviousPage: () => void,
  setFocused: (_isFocused: boolean) => void,
  selectDate: (date: DateLike) => void,
  getSelectedDate: () => DateLike | null,
  getSelectedRange: () => {start: DateLike, end: DateLike} | null
};

class MockCalendarDate {
  calendar: {identifier: string; getDaysInMonth: (date: DateLike) => number};
  era: string;
  year: number;
  month: number;
  day: number;

  constructor(year: number, month: number, day = 1) {
    this.calendar = {
      identifier: 'gregory',
      getDaysInMonth: (date: DateLike) => daysInMonth(date.year, date.month)
    };
    this.era = 'AD';
    this.year = year;
    this.month = month;
    this.day = day;
  }

  add(duration: {months?: number; days?: number}) {
    let base = new Date(Date.UTC(this.year, this.month - 1, this.day));
    if (duration.months) {
      base.setUTCMonth(base.getUTCMonth() + duration.months);
    }
    if (duration.days) {
      base.setUTCDate(base.getUTCDate() + duration.days);
    }

    return new MockCalendarDate(
      base.getUTCFullYear(),
      base.getUTCMonth() + 1,
      base.getUTCDate()
    );
  }

  subtract(duration: {months?: number; days?: number}) {
    return this.add({
      months: duration.months ? -duration.months : 0,
      days: duration.days ? -duration.days : 0
    });
  }

  toDate(_timeZone?: string) {
    return new Date(Date.UTC(this.year, this.month - 1, this.day));
  }
}

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
});

const CELL_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
});

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

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function compareDate(a: DateLike, b: DateLike) {
  if (a.year !== b.year) {
    return a.year - b.year;
  }

  if (a.month !== b.month) {
    return a.month - b.month;
  }

  return a.day - b.day;
}

function isSameDate(a: DateLike | null | undefined, b: DateLike | null | undefined) {
  if (!a || !b) {
    return false;
  }

  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function toDateLike(value: unknown, fallback: DateLike): DateLike {
  let maybeDate = value as Partial<DateLike> | null | undefined;
  if (!maybeDate || typeof maybeDate.year !== 'number' || typeof maybeDate.month !== 'number' || typeof maybeDate.day !== 'number') {
    return fallback;
  }

  return {
    year: maybeDate.year,
    month: maybeDate.month,
    day: maybeDate.day
  };
}

function getVisibleStartFromSelection(selection: DateLike, visibleMonths: number, alignment?: string) {
  let offset = 0;
  if (visibleMonths > 1) {
    if (alignment === 'start') {
      offset = 0;
    } else if (alignment === 'end') {
      offset = -(visibleMonths - 1);
    } else {
      offset = -Math.floor(visibleMonths / 2);
    }
  }

  let date = new Date(Date.UTC(selection.year, selection.month - 1 + offset, 1));
  return new MockCalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

function getMonthTitle(date: DateLike) {
  return MONTH_FORMATTER.format(new Date(Date.UTC(date.year, date.month - 1, 1)));
}

function getCellLabel(date: DateLike, isSelected: boolean) {
  let label = CELL_FORMATTER.format(new Date(Date.UTC(date.year, date.month - 1, date.day)));
  return isSelected ? `${label} selected` : label;
}

function useMockCalendarState(props: Record<string, unknown>): MockState {
  let visibleMonths = typeof props.visibleDuration === 'object' && props.visibleDuration && typeof (props.visibleDuration as Record<string, unknown>).months === 'number'
    ? (props.visibleDuration as {months: number}).months
    : 1;
  let defaultSelection = toDateLike(props.defaultValue, {year: 2019, month: 6, day: 5});
  let controlledSelection = props.value ? toDateLike(props.value, defaultSelection) : null;
  let [selectedDate, setSelectedDate] = React.useState<DateLike | null>(controlledSelection ?? defaultSelection);
  let currentSelection = controlledSelection ?? selectedDate;
  let [visibleStart, setVisibleStart] = React.useState<MockCalendarDate>(() => getVisibleStartFromSelection(
    currentSelection ?? defaultSelection,
    visibleMonths,
    typeof props.selectionAlignment === 'string' ? props.selectionAlignment : undefined
  ));

  return {
    kind: 'calendar',
    isDisabled: Boolean(props.isDisabled),
    isReadOnly: Boolean(props.isReadOnly),
    visibleRange: {start: visibleStart},
    timeZone: 'UTC',
    isValueInvalid: false,
    focusNextPage() {
      setVisibleStart((prev) => prev.add({months: visibleMonths}));
    },
    focusPreviousPage() {
      setVisibleStart((prev) => prev.add({months: -visibleMonths}));
    },
    setFocused(_isFocused: boolean) {
      // no-op for test shim
    },
    selectDate(date: DateLike) {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      if (!controlledSelection) {
        setSelectedDate(date);
      }

      if (typeof props.onChange === 'function') {
        props.onChange(date);
      }
    },
    getSelectedDate() {
      return currentSelection ?? null;
    },
    getSelectedRange() {
      return null;
    }
  };
}

function useMockRangeCalendarState(props: Record<string, unknown>): MockState {
  let visibleMonths = typeof props.visibleDuration === 'object' && props.visibleDuration && typeof (props.visibleDuration as Record<string, unknown>).months === 'number'
    ? (props.visibleDuration as {months: number}).months
    : 1;

  let fallbackRange = {
    start: {year: 2019, month: 6, day: 5},
    end: {year: 2019, month: 6, day: 10}
  };
  let defaultRange = props.defaultValue && typeof props.defaultValue === 'object'
    ? {
        start: toDateLike((props.defaultValue as {start?: unknown}).start, fallbackRange.start),
        end: toDateLike((props.defaultValue as {end?: unknown}).end, fallbackRange.end)
      }
    : fallbackRange;
  let controlledRange = props.value && typeof props.value === 'object'
    ? {
        start: toDateLike((props.value as {start?: unknown}).start, defaultRange.start),
        end: toDateLike((props.value as {end?: unknown}).end, defaultRange.end)
      }
    : null;
  let [selectedRange, setSelectedRange] = React.useState<{start: DateLike, end: DateLike} | null>(controlledRange ?? defaultRange);
  let currentRange = controlledRange ?? selectedRange;
  let [visibleStart, setVisibleStart] = React.useState<MockCalendarDate>(() => getVisibleStartFromSelection(
    currentRange?.start ?? defaultRange.start,
    visibleMonths,
    typeof props.selectionAlignment === 'string' ? props.selectionAlignment : undefined
  ));

  return {
    kind: 'range',
    isDisabled: Boolean(props.isDisabled),
    isReadOnly: Boolean(props.isReadOnly),
    visibleRange: {start: visibleStart},
    timeZone: 'UTC',
    isValueInvalid: false,
    focusNextPage() {
      setVisibleStart((prev) => prev.add({months: visibleMonths}));
    },
    focusPreviousPage() {
      setVisibleStart((prev) => prev.add({months: -visibleMonths}));
    },
    setFocused(_isFocused: boolean) {
      // no-op for test shim
    },
    selectDate(date: DateLike) {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      let nextRange = {
        start: date,
        end: date
      };

      if (!controlledRange) {
        setSelectedRange(nextRange);
      }

      if (typeof props.onChange === 'function') {
        props.onChange(nextRange);
      }
    },
    getSelectedDate() {
      return null;
    },
    getSelectedRange() {
      return currentRange;
    }
  };
}

vi.mock('@vue-stately/calendar', () => ({
  useCalendarState: (props: Record<string, unknown>) => useMockCalendarState(props),
  useRangeCalendarState: (props: Record<string, unknown>) => useMockRangeCalendarState(props)
}));

vi.mock('@vue-aria/calendar', () => ({
  useCalendar: (props: Record<string, unknown>, state: MockState) => ({
    calendarProps: {
      role: 'application',
      'aria-label': getMonthTitle(state.visibleRange.start)
    },
    prevButtonProps: {
      'aria-label': 'Previous',
      isDisabled: Boolean(props.isDisabled),
      onPress: () => state.focusPreviousPage()
    },
    nextButtonProps: {
      'aria-label': 'Next',
      isDisabled: Boolean(props.isDisabled),
      onPress: () => state.focusNextPage()
    },
    errorMessageProps: {}
  }),
  useRangeCalendar: (props: Record<string, unknown>, state: MockState) => ({
    calendarProps: {
      role: 'application',
      'aria-label': getMonthTitle(state.visibleRange.start)
    },
    prevButtonProps: {
      'aria-label': 'Previous',
      isDisabled: Boolean(props.isDisabled),
      onPress: () => state.focusPreviousPage()
    },
    nextButtonProps: {
      'aria-label': 'Next',
      isDisabled: Boolean(props.isDisabled),
      onPress: () => state.focusNextPage()
    },
    errorMessageProps: {}
  })
}));

vi.mock('../src/CalendarMonth', () => ({
  CalendarMonth: (props: {
    state: MockState,
    startDate: DateLike,
    autoFocus?: boolean
  }) => {
    let {state, startDate, autoFocus} = props;
    let selectedDate = state.getSelectedDate();
    let selectedRange = state.getSelectedRange();
    let days = daysInMonth(startDate.year, startDate.month);

    React.useEffect(() => {
      if (!autoFocus) {
        return;
      }

      let dayToFocus = selectedDate?.day ?? selectedRange?.start.day ?? 1;
      let target = document.querySelector<HTMLButtonElement>(`[data-date="${startDate.year}-${startDate.month}-${dayToFocus}"]`);
      target?.focus();
    }, [autoFocus, selectedDate, selectedRange, startDate.day, startDate.month, startDate.year]);

    return React.createElement(
      'table',
      {
        role: 'grid',
        'aria-label': getMonthTitle(startDate),
        'aria-disabled': state.isDisabled ? 'true' : undefined
      },
      React.createElement(
        'tbody',
        null,
        React.createElement(
          'tr',
          null,
          Array.from({length: days}, (_, index) => index + 1).map((day) => {
            let date = {
              year: startDate.year,
              month: startDate.month,
              day
            };
            let isSelected = state.kind === 'calendar'
              ? isSameDate(selectedDate, date)
              : Boolean(
                selectedRange &&
                compareDate(date, selectedRange.start) >= 0 &&
                compareDate(date, selectedRange.end) <= 0
              );
            let label = getCellLabel(date, isSelected);

            return React.createElement(
              'td',
              {
                key: `${date.year}-${date.month}-${date.day}`,
                role: 'gridcell',
                'aria-selected': isSelected ? 'true' : 'false',
                'aria-disabled': state.isDisabled ? 'true' : undefined
              },
              React.createElement(
                'button',
                {
                  type: 'button',
                  'data-date': `${date.year}-${date.month}-${date.day}`,
                  disabled: Boolean(state.isDisabled),
                  tabIndex: isSelected ? 0 : -1,
                  'aria-label': label,
                  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
                    if (event.key === 'ArrowLeft') {
                      event.preventDefault();
                      let previous = event.currentTarget.parentElement?.previousElementSibling?.querySelector<HTMLButtonElement>('button');
                      previous?.focus();
                    }

                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      state.selectDate(date);
                    }
                  },
                  onClick: () => state.selectDate(date)
                },
                day
              )
            );
          })
        )
      )
    );
  }
}));

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({
    children,
    onPress,
    isDisabled,
    UNSAFE_className,
    isQuiet: _isQuiet,
    ...props
  }: {children?: React.ReactNode; onPress?: () => void; isDisabled?: boolean; UNSAFE_className?: string} & Record<string, unknown>) =>
    React.createElement('button', {
      ...props,
      type: 'button',
      className: UNSAFE_className,
      disabled: Boolean(isDisabled),
      onClick: () => {
        if (!isDisabled) {
          onPress?.();
        }
      }
    }, children)
}));

vi.mock('@vue-spectrum/label', () => ({
  HelpText: ({errorMessage, errorMessageProps}: {errorMessage?: React.ReactNode; errorMessageProps?: Record<string, unknown>}) =>
    React.createElement('div', errorMessageProps, errorMessage)
}));

vi.mock('@vue-aria/visually-hidden', () => ({
  VisuallyHidden: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useDateFormatter: () => ({
    format: (value: Date) => MONTH_FORMATTER.format(value)
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

vi.mock('@vue-spectrum/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-spectrum/utils')>('@vue-spectrum/utils');
  return {
    ...actual,
    classNames,
    createDOMRef: <T,>(ref: {current: T | null}) => ({
      UNSAFE_getDOMNode: () => ref.current
    }),
    useStyleProps: (props: Record<string, unknown> = {}) => ({
      styleProps: {
        className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined,
        style: props.UNSAFE_style
      }
    })
  };
});

vi.mock('@vue-aria/live-announcer', () => ({
  announce: vi.fn()
}));
