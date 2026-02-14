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

## Example

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

## Styled Example References

- Calendar + Tailwind: <https://codesandbox.io/s/objective-shape-8r4utm?file=/src/Calendar.js>
- Calendar + Styled Components: <https://codesandbox.io/s/stupefied-almeida-01yvsp?file=/src/WeekView.js>
- Calendar + CSS Modules: <https://codesandbox.io/s/affectionate-rosalind-tdm323?file=/src/Calendar.js>
- RangeCalendar + Tailwind: <https://codesandbox.io/s/objective-shape-8r4utm?file=/src/RangeCalendar.js>

## Usage Notes

### Value

- `useCalendarState` and `useRangeCalendarState` accept controlled (`value`) and uncontrolled (`defaultValue`) usage.
- Date values come from `@internationalized/date` objects (`CalendarDate`, `CalendarDateTime`, `ZonedDateTime`).

### Events

- `onChange` fires when selection commits.
- `onFocusChange` can control `focusedValue` for externally managed focus behavior.

### International Calendars

- Calendars are locale-aware and support Unicode calendar locale extensions (e.g. `hi-IN-u-ca-indian`).
- Output values preserve the input value type/calendar behavior from state hooks.

### Custom Calendar Systems

- Use a custom `createCalendar(identifier)` implementation to support business calendars (e.g. 4-5-4 fiscal).
- The calendar implementation should satisfy the `Calendar` interface from `@internationalized/date`.

### Validation And Availability

- `minValue` / `maxValue` constrain selectable dates.
- `isDateUnavailable` marks dates as unavailable but keeps them keyboard-focusable.
- Range mode supports `allowsNonContiguousRanges` for selecting around blocked dates.

### Accessibility And I18n

- Provide `aria-label` or `aria-labelledby` on `useCalendar` / `useRangeCalendar`.
- RTL locales automatically mirror left/right arrow behavior in grid navigation.
- Live-announcer text is localized via copied upstream `intl` messages.

## Notes

- Current package status: in progress.
- Locale strings are copied from upstream `@react-aria/calendar/intl`.
- `Spectrum S2` is out of scope unless explicitly requested.
