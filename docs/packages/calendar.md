# @vue-aria/calendar

`@vue-aria/calendar` ports the upstream `@react-aria/calendar` behavior layer for single-date and range calendars, including grid and cell semantics.

## API

- `useCalendar`
- `useRangeCalendar`
- `useCalendarGrid`
- `useCalendarCell`

## Features

- Keyboard navigation and grid semantics for calendar cells.
- Visible range paging with `visible` and `single` page behavior.
- Locale-sensitive first day of week and RTL arrow-key behavior.
- Range selection support, including drag and touch interactions.
- Built-in selected/visible range announcements via live announcer integration.
- Custom calendar-system support via `createCalendar`.

## Anatomy

- Calendar wrapper (application region + heading + previous/next buttons)
- Calendar grid (`useCalendarGrid`)
- Calendar cell (`useCalendarCell`)
- Shared button primitive for month paging

`useCalendarGrid` and `useCalendarCell` are shared between `Calendar` and `RangeCalendar`. The primary difference is state and root hook choice (`useCalendarState` + `useCalendar` vs `useRangeCalendarState` + `useRangeCalendar`).

## Date and Time Values

Calendar values are represented with `@internationalized/date` objects. `useCalendar` and `useRangeCalendar` support date-only values as well as values with time components.

When a `CalendarDateTime`/`ZonedDateTime`-like value is provided, emitted values preserve time fields while updating only the date portion.

## Example

A complete implementation is composed from three pieces:

- Root calendar hook (`useCalendar` or `useRangeCalendar`)
- Grid rendering (`useCalendarGrid`)
- Cell rendering (`useCalendarCell`)

### `Calendar`

```ts
import { createCalendar } from "@internationalized/date";
import { useCalendarState } from "@vue-aria/calendar-state";
import { useCalendar } from "@vue-aria/calendar";

const state = useCalendarState({
  locale: "en-US",
  createCalendar,
  visibleDuration: { months: 1 },
});

const aria = useCalendar(
  {
    "aria-label": "Event date",
  },
  state
);
```

### `CalendarGrid`

```ts
import { useCalendarGrid } from "@vue-aria/calendar";

const grid = useCalendarGrid(
  {
    firstDayOfWeek: "mon",
  },
  state
);

// grid.gridProps
// grid.headerProps
// grid.weekDays
// grid.weeksInMonth
```

### `CalendarCell`

```ts
import { useCalendarCell } from "@vue-aria/calendar";

const cellRef = { current: null as HTMLElement | null };
const date = state.getDatesInWeek(0)[0]!;
const cell = useCalendarCell({ date }, state, cellRef);

// cell.cellProps
// cell.buttonProps
// cell.formattedDate
```

### `RangeCalendar`

```ts
import { createCalendar } from "@internationalized/date";
import { useRangeCalendarState } from "@vue-aria/calendar-state";
import { useRangeCalendar } from "@vue-aria/calendar";

const rangeState = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  visibleDuration: { months: 2 },
});

const rootRef = { current: null as HTMLElement | null };
const rangeAria = useRangeCalendar(
  {
    "aria-label": "Trip dates",
  },
  rangeState,
  rootRef
);
```

### `Button`

The previous/next controls are typically implemented with `useButton` and shared with the rest of your component library.

```ts
import { useButton } from "@vue-aria/button";

function useCalendarNavButton() {
  const ref = { current: null as HTMLButtonElement | null };
  const { buttonProps } = useButton({}, ref);
  return { ref, buttonProps };
}
```

## Base Style Parity Snippet

```css
.calendar {
  width: 220px;
}

.header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 8px;
}

.header h2 {
  flex: 1;
  margin: 0;
}

.calendar table {
  width: 100%;
}

.cell {
  cursor: default;
  text-align: center;
}

.selected {
  background: var(--blue);
  color: #fff;
}

.unavailable {
  color: var(--spectrum-global-color-red-600);
}

.disabled {
  color: gray;
}
```

## Styled Examples

- Calendar + Tailwind: <https://codesandbox.io/s/objective-shape-8r4utm?file=/src/Calendar.js> (multiple visible months)
- Calendar + Styled Components: <https://codesandbox.io/s/stupefied-almeida-01yvsp?file=/src/WeekView.js> (week-view styling)
- Calendar + CSS Modules: <https://codesandbox.io/s/affectionate-rosalind-tdm323?file=/src/Calendar.js> (custom month/year controls)
- RangeCalendar + Tailwind: <https://codesandbox.io/s/objective-shape-8r4utm?file=/src/RangeCalendar.js> (multi-month range UI)

## Usage

### Value

`useCalendarState` and `useRangeCalendarState` support both controlled (`value`) and uncontrolled (`defaultValue`) usage. `RangeCalendar` values use `{ start, end }` objects.

```ts
import { CalendarDate } from "@internationalized/date";
import { useCalendarState } from "@vue-aria/calendar-state";

const controlled = useCalendarState({
  locale: "en-US",
  createCalendar,
  value: new CalendarDate(2020, 2, 3),
  onChange: (next) => {
    // persist the selected date in app state
  },
});

const uncontrolled = useCalendarState({
  locale: "en-US",
  createCalendar,
  defaultValue: new CalendarDate(2020, 2, 3),
});

const controlledRange = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  value: {
    start: new CalendarDate(2020, 2, 3),
    end: new CalendarDate(2020, 2, 12),
  },
  onChange: (nextRange) => {
    // persist selected range
  },
});
```

### Events

`onChange` fires when a selection commits. `onFocusChange` lets you control the focused date and therefore the visible range.

```ts
const state = useCalendarState({
  locale: "en-US",
  createCalendar,
  focusedValue: new CalendarDate(2021, 7, 1),
  onFocusChange: (focusedDate) => {
    // keep focused month/date in sync with external state
  },
  onChange: (value) => {
    // handle committed date selection
  },
});

const rangeState = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  onChange: (range) => {
    // range.start / range.end
  },
});
```

### International Calendars

Calendars are locale-aware and can follow Unicode calendar locale extensions via `I18nProvider`.

```vue
<script setup lang="ts">
import { I18nProvider } from "@vue-aria/i18n";
</script>

<template>
  <I18nProvider locale="hi-IN-u-ca-indian">
    <!-- your Calendar component wired to useCalendar/useCalendarState -->
  </I18nProvider>
</template>
```

### Custom Calendar Systems

Use `createCalendar(identifier)` to plug in a custom calendar implementation (for example, 4-5-4 fiscal calendars).

```ts
import { GregorianCalendar } from "@internationalized/date";

class Custom454Calendar extends GregorianCalendar {
  // Implement @internationalized/date Calendar methods.
}

const state = useCalendarState({
  locale: "en-US",
  createCalendar: () => new Custom454Calendar(),
  firstDayOfWeek: "sun",
});
```

### Validation

Use `minValue` and `maxValue` to constrain selectable dates.

```ts
import { CalendarDate } from "@internationalized/date";

const state = useCalendarState({
  locale: "en-US",
  createCalendar,
  minValue: new CalendarDate(2024, 1, 1),
  maxValue: new CalendarDate(2024, 12, 31),
});
```

### Unavailable Dates

Use `isDateUnavailable` to keep dates focusable but non-selectable.

```ts
import { CalendarDate, isWeekend } from "@internationalized/date";

const state = useCalendarState({
  locale: "en-US",
  createCalendar,
  isDateUnavailable: (date) => isWeekend(date, "en-US")
    || (date.compare(new CalendarDate(2024, 6, 10)) >= 0
      && date.compare(new CalendarDate(2024, 6, 12)) <= 0),
});
```

### Non-Contiguous Range Selection

For `useRangeCalendarState`, set `allowsNonContiguousRanges` to allow ranges that span unavailable dates.

```ts
import { isWeekend } from "@internationalized/date";

const state = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  allowsNonContiguousRanges: true,
  isDateUnavailable: (date) => isWeekend(date, "en-US"),
});
```

### Focused Date Control

Use `focusedValue`, `defaultFocusedValue`, and `onFocusChange` to control which month is visible and which date is focused.

```ts
const state = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  defaultFocusedValue: new CalendarDate(2021, 7, 1),
  onFocusChange: (focusedDate) => {
    // external focus synchronization
  },
});
```

### Disabled

`isDisabled` disables navigation and date interaction.

```ts
const state = useCalendarState({
  locale: "en-US",
  createCalendar,
  isDisabled: true,
});
```

### Read Only

`isReadOnly` keeps focus/navigation behavior but prevents value mutation.

```ts
const state = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  isReadOnly: true,
  value: {
    start: new CalendarDate(2024, 6, 1),
    end: new CalendarDate(2024, 6, 8),
  },
});
```

### Custom First Day Of Week

Use `firstDayOfWeek` to override locale defaults.

```ts
const grid = useCalendarGrid(
  {
    firstDayOfWeek: "mon",
  },
  state
);
```

### Labeling

Provide `aria-label` or `aria-labelledby` to `useCalendar` and `useRangeCalendar`. A label is required for accessibility.

### Internationalization

- RTL locales automatically mirror left/right grid navigation.
- Dates and weekday names follow the current locale and calendar system.
- Live-announcer strings are localized through copied upstream `intl` messages.

## Advanced Topics

### Reducing Bundle Size

Provide a custom `createCalendar` that only returns supported calendar implementations.

```ts
import { GregorianCalendar } from "@internationalized/date";

function createGregorianOnlyCalendar(identifier: string) {
  if (identifier === "gregory") {
    return new GregorianCalendar();
  }

  throw new Error(`Unsupported calendar ${identifier}`);
}
```

## Notes

- Current package status: in progress.
- Locale strings are copied from upstream `@react-aria/calendar/intl`.
- `Spectrum S2` is out of scope unless explicitly requested.
