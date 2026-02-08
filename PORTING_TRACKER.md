# React Aria -> Vue Port Tracker

This is the master checklist for parity with React Aria behavior in Vue.

## 0) Dependency baseline

- [x] Added upstream i18n/date primitives:
  `@internationalized/date`, `@internationalized/message`,
  `@internationalized/number`, `@internationalized/string`
- [x] Added accessibility/runtime helpers:
  `aria-hidden`, `clsx`
- [x] Added test parity tooling:
  `@testing-library/vue`, `@testing-library/user-event`, `vitest`, `jsdom`
- [ ] Add package-specific deps only when a ported hook actually needs them

## 1) Foundation

- [x] `mergeProps`
- [x] `useId`
- [ ] Deterministic SSR id strategy (`SSRProvider` equivalent)
- [ ] DOM prop filtering utilities (`filterDOMProps` equivalent)
- [ ] Locale + direction provider (`I18nProvider` equivalent)
- [ ] Announcer/live region infrastructure
- [ ] Collection builder helpers (nodes, sections, keys)
- [ ] Keyboard delegate infrastructure
- [ ] Router integration abstraction (link navigation)

## 2) Interactions (`@react-aria/interactions` + focus)

- [x] `useFocusVisible`
- [x] `useFocusRing`
- [x] `usePress`
- [x] `useHover`
- [x] `useFocus`
- [x] `useFocusWithin`
- [x] `useKeyboard`
- [ ] `useLongPress`
- [ ] `useMove`
- [ ] `useInteractOutside`
- [ ] Press responder edge cases (cancel on scroll, pointer capture nuances)
- [ ] Virtual click/screen-reader interaction parity tests

## 3) Core semantics

- [x] `useButton`
- [ ] `useToggleButton`
- [x] `useLink`
- [ ] `useLabel`
- [ ] `useSeparator`
- [ ] `VisuallyHidden` helper/component
- [ ] `useDescription` + `useErrorMessage` helpers

## 4) Text and number inputs

- [ ] `useTextField`
- [ ] `useSearchField`
- [ ] `useNumberField`
- [ ] `useTextArea` behavior parity
- [ ] Spinbutton semantics parity
- [ ] Input validation state + aria-invalid wiring

## 5) Selection controls

- [ ] `useCheckbox`
- [ ] `useCheckboxGroup`
- [ ] `useRadio`
- [ ] `useRadioGroup`
- [ ] `useSwitch`
- [ ] `useSlider`
- [ ] `useSliderThumb`
- [ ] `useSliderState` parity adapters

## 6) Date and time

- [ ] `useDateField`
- [ ] `useDateSegment`
- [ ] `useDatePicker`
- [ ] `useDateRangePicker`
- [ ] `useCalendar`
- [ ] `useCalendarCell`
- [ ] `useRangeCalendar`
- [ ] `useTimeField`
- [ ] International calendar + timezone behavior parity

## 7) Collections and lists

- [ ] `useListBox`
- [ ] `useOption`
- [ ] `useListBoxSection`
- [ ] `useSelect`
- [ ] `useComboBox`
- [ ] `useAutocomplete`-style behavior parity
- [ ] Typeahead behavior parity
- [ ] Single vs multi-select behavior parity

## 8) Menus and actions

- [ ] `useMenu`
- [ ] `useMenuItem`
- [ ] `useMenuSection`
- [ ] `useMenuTrigger`
- [ ] Submenu trigger/placement behavior parity
- [ ] Context menu behavior parity
- [ ] Action vs selection menu item semantics

## 9) Tabs, disclosure, navigation

- [ ] `useTabs`
- [ ] `useTabList`
- [ ] `useTab`
- [ ] `useTabPanel`
- [ ] `useDisclosure`
- [ ] `useDisclosureGroup`
- [ ] `useAccordion`-style behavior parity
- [ ] `useBreadcrumbItem`

## 10) Overlays and dialogs

- [ ] `useOverlay`
- [ ] `useOverlayTrigger`
- [ ] `useOverlayPosition`
- [ ] `useModal`
- [ ] `useModalOverlay`
- [ ] `usePopover`
- [ ] `useDialog`
- [ ] `useTooltip`
- [ ] `useTooltipTrigger`
- [ ] Focus containment/restore parity
- [ ] Scroll locking parity (`usePreventScroll` equivalent)

## 11) Grids, tables, trees

- [ ] `useGridList`
- [ ] `useGridListItem`
- [ ] `useGrid`
- [ ] `useGridCell`
- [ ] `useTable`
- [ ] `useTableCell`
- [ ] `useTableColumnHeader`
- [ ] `useTableRow`
- [ ] `useTree`
- [ ] `useTreeItem`
- [ ] Row/column keyboard navigation delegates

## 12) Drag and drop + virtualizer

- [ ] Drag source hooks parity
- [ ] Drop target hooks parity
- [ ] Keyboard drag and drop parity
- [ ] Announcements for drag/drop accessibility
- [ ] Virtualizer infrastructure parity
- [ ] Windowing + measurement + keyboard nav parity

## 13) Feedback and status

- [ ] `useProgressBar`
- [ ] `useProgressCircle`
- [ ] `useMeter`
- [ ] `useToast` / `useToastRegion`
- [ ] Live region status updates parity

## 14) React Stately parity layer (or Vue-native equivalents)

- [ ] Toggle state
- [ ] Overlay trigger state
- [ ] List state
- [ ] Multiple selection state
- [ ] Single selection state
- [ ] Tree state
- [ ] Table state
- [ ] ComboBox state
- [ ] Select state
- [ ] Menu trigger state
- [ ] Tabs state
- [ ] Calendar state
- [ ] Date picker state
- [ ] Range calendar state
- [ ] Slider state

## 15) Quality gates

- [ ] Hook-level unit tests
- [ ] Keyboard interaction tests
- [ ] Screen reader behavior checks
- [ ] SSR hydration tests
- [ ] RTL/i18n tests
- [ ] Cross-browser checks (Chromium, WebKit, Firefox)
- [ ] Documentation + examples for each hook
