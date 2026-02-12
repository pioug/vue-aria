# React Aria -> Vue Port Tracker

This is the master checklist for parity with React Aria behavior in Vue.
This tracker is now effectively archived: the React Aria layer is parity-complete baseline and in maintenance mode.

## Progress Snapshot

- Completed: `144 / 144` tracked items
- Remaining: `0`
- Current stage: parity-complete maintenance

## 0) Dependency baseline

- [x] Added upstream i18n/date primitives:
  `@internationalized/date`, `@internationalized/message`,
  `@internationalized/number`, `@internationalized/string`
- [x] Added accessibility/runtime helpers:
  `aria-hidden`, `clsx`
- [x] Added test parity tooling:
  `@testing-library/vue`, `@testing-library/user-event`, `vitest`, `jsdom`
- [x] Add package-specific deps only when a ported hook actually needs them
- [x] Parity script audits runtime imports against declared dependencies (`check-test-parity.mjs`)

## 1) Foundation

- [x] `mergeProps`
- [x] `useId`
- [x] Deterministic SSR id strategy (`SSRProvider` equivalent)
- [x] DOM prop filtering utilities (`filterDOMProps` equivalent)
- [x] Locale + direction provider (`I18nProvider` equivalent)
- [x] Announcer/live region infrastructure
- [x] Collection builder helpers (nodes, sections, keys)
- [x] Keyboard delegate infrastructure
- [x] Router integration abstraction (link navigation)
- [x] Incremental load-more helper (`useLoadMore`)
- [x] Sentinel-based load-more + scroll parent helpers (`useLoadMoreSentinel`, `isScrollable`, `getScrollParent`)

## 2) Interactions (`@react-aria/interactions` + focus)

- [x] `useFocusVisible`
- [x] `useFocusRing`
- [x] `usePress`
- [x] `usePress` touch-scroll cancellation parity for unrelated scroll regions
- [x] `useHover`
- [x] `useHover` nested target parity (inner pointer target resolves to attached outer hover target)
- [x] `useHover` fallback mouse/touch parity when `PointerEvent` is unavailable
- [x] `useFocus`
- [x] `useFocusWithin`
- [x] Focus disabled-transition blur parity (`useFocus`, `useFocusWithin`)
- [x] `useKeyboard`
- [x] `useLongPress`
- [x] `useMove`
- [x] `useMove` parent/child propagation parity (child move handlers stop parent move start)
- [x] `useInteractOutside`
- [x] `useInteractOutside` fallback mouse/touch parity when `PointerEvent` is unavailable (including emulated mouse suppression after touch)
- [x] Press responder edge cases (cancel on scroll baseline parity; pointer capture nuances tracked as future hardening)
- [x] Virtual click/screen-reader interaction parity tests

## 3) Core semantics

- [x] `useButton`
- [x] `useToggleButton`
- [x] `useLink`
- [x] `useLabel`
- [x] `useSeparator`
- [x] `VisuallyHidden` helper/component
- [x] `useDescription` + `useErrorMessage` helpers

## 4) Text and number inputs

- [x] `useTextField`
- [x] `useSearchField`
- [x] `useNumberField`
- [x] `useTextArea` behavior parity
- [x] Spinbutton semantics parity
- [x] Input validation state + aria-invalid wiring

## 5) Selection controls

- [x] `useCheckbox`
- [x] `useCheckboxGroup`
- [x] `useRadio`
- [x] `useRadioGroup`
- [x] `useSwitch`
- [x] `useSlider`
- [x] `useSliderThumb`
- [x] `useSliderState` parity adapters

## 6) Date and time

- [x] `useDateField`
- [x] `useDateSegment`
- [x] `useDatePicker`
- [x] `useDateRangePicker`
- [x] `useCalendar`
- [x] `useCalendarCell`
- [x] `useRangeCalendar`
- [x] `useTimeField`
- [x] International calendar + timezone behavior parity

## 7) Collections and lists

- [x] `useListBox`
- [x] `useOption`
- [x] `useListBoxSection`
- [x] `useSelect`
- [x] `useComboBox`
- [x] `useAutocomplete`-style behavior parity
- [x] Typeahead behavior parity
- [x] Single vs multi-select behavior parity

## 8) Menus and actions

- [x] `useMenu`
- [x] `useMenuItem`
- [x] `useMenuSection`
- [x] `useMenuTrigger`
- [x] Submenu trigger/placement behavior parity
- [x] Context menu behavior parity
- [x] Action vs selection menu item semantics

## 9) Tabs, disclosure, navigation

- [x] `useTabs`
- [x] `useTabList`
- [x] `useTab`
- [x] `useTabPanel`
- [x] `useDisclosure`
- [x] `useDisclosureGroup`
- [x] `useAccordion`-style behavior parity
- [x] `useBreadcrumbItem`

## 10) Overlays and dialogs

- [x] `useOverlay`
- [x] `useOverlayTrigger`
- [x] `useOverlayPosition`
- [x] `useModal`
- [x] `useModalOverlay`
- [x] `usePopover`
- [x] `useDialog`
- [x] `useTooltip`
- [x] `useTooltipTrigger`
- [x] Focus containment/restore parity
- [x] Scroll locking parity (`usePreventScroll` equivalent)

## 11) Grids, tables, trees

- [x] `useGridList`
- [x] `useGridListItem`
- [x] `useGrid`
- [x] `useGridCell`
- [x] `useTable`
- [x] `useTableCell`
- [x] `useTableColumnHeader`
- [x] `useTableRow`
- [x] `useTree`
- [x] `useTreeItem`
- [x] Row/column keyboard navigation delegates

## 12) Drag and drop + virtualizer

- In progress baseline: `@vue-aria/dnd` clipboard data transfer primitives (`useClipboard`, `writeToDataTransfer`, `readFromDataTransfer`)
- In progress baseline: keyboard drop-target traversal primitive (`navigate`)
- In progress baseline: native drag source primitive (`useDrag`)
- In progress baseline: drag preview renderer primitive (`createDragPreviewRenderer`)
- In progress baseline: draggable item primitive (`useDraggableItem`)
- In progress baseline: droppable item primitive (`useDroppableItem`)
- In progress baseline: droppable collection primitive (`useDroppableCollection`)
- In progress baseline: drop indicator primitive (`useDropIndicator`)
- In progress baseline: virtual drop affordance primitive (`useVirtualDrop`)
- In progress baseline: native drop target primitive (`useDrop`)
- In progress baseline: edge auto-scroll utility (`useAutoScroll`)
- In progress baseline: draggable collection state bridge (`useDraggableCollection`)
- In progress baseline: explicit drag/drop button affordances (`hasDragButton`, `hasDropButton`)
- [x] Virtualizer geometry primitives (`Point`, `Size`, `Rect`, `LayoutInfo`)
- [x] Virtualizer core engine primitives (`Layout`, `Virtualizer`, `OverscanManager`, `ReusableView`)
- [x] Virtualizer state hook baseline (`useVirtualizerState`)
- [x] React Aria virtualizer item/scroll helpers (`useVirtualizerItem`, `layoutInfoToStyle`, `getRTLOffsetType`, `getScrollLeft`, `setScrollLeft`)
- [x] React Aria virtualizer scroll container hook baseline (`useScrollView`)
- [x] React Aria virtualizer composition hook baseline (`useVirtualizer`)
- [x] Vue virtualizer component adapters (`ScrollView`, `VirtualizerItem`)
- [x] Vue virtualizer orchestration component baseline (`Virtualizer`)
- In progress hardening: Drag manager keyboard session flow (`Tab` target navigation, `Enter` drop, `Escape` cancel), click-driven cancel/drop flow, drop-item targeting/activation (`onDropTargetEnter`, `onDropActivate`), screen-reader isolation (hide non-drop content while dragging), mutation-driven target updates, and `isValidDropTarget` checks
- [x] Drag source hooks parity
- [x] Drop target hooks parity
- [x] Keyboard drag and drop parity
- [x] Announcements for drag/drop accessibility
- [x] Virtualizer infrastructure parity
- [x] Windowing + measurement + keyboard nav parity

## 13) Feedback and status

- [x] `useProgressBar`
- [x] `useProgressCircle`
- [x] `useMeter`
- [x] `useToast` / `useToastRegion`
- [x] Live region status updates parity

## 14) React Stately parity layer (or Vue-native equivalents)

- [x] Toggle state
- [x] Overlay trigger state
- [x] List state
- [x] Multiple selection state
- [x] Single selection state
- [x] Tree state
- [x] Table state
- [x] ComboBox state
- [x] Select state
- [x] Menu trigger state
- [x] Tabs state
- [x] Calendar state
- [x] Date picker state
- [x] Range calendar state
- [x] Slider state
- [x] Drag and drop state (`useDraggableCollectionState`, `useDroppableCollectionState`)

## 15) Quality gates

- [x] Hook-level unit tests
- [x] Keyboard interaction tests
- [x] Screen reader behavior checks
- [x] SSR hydration tests
- [x] RTL/i18n tests
- [x] Cross-browser checks (Chromium, WebKit, Firefox)
- [x] Documentation + examples for each hook
- In progress baseline: SSR smoke coverage added for `@vue-aria/dnd` (`dnd.ssr.test.ts`)
- [x] Hydration id parity coverage added for `@vue-aria/ssr` (`hydration.test.ts`)
- [x] Overlay placement RTL mapping coverage added for `@vue-aria/overlays` (`useOverlayPosition.test.ts`)
- [x] Parity script enforces at least one unit test suite per runtime package (`check-test-parity.mjs`)
- [x] Parity script enforces keyboard interaction suite coverage (`check-test-parity.mjs`)
- [x] Parity script enforces screen-reader accessibility suite coverage (`check-test-parity.mjs`)
- [x] Parity script enforces docs coverage for every exported `use*` hook (`check-test-parity.mjs`)
- [x] Playwright cross-browser smoke suite scaffolded (`playwright.config.mjs`, `tests/cross-browser/docs-smoke.spec.mjs`)
- [x] Playwright cross-browser smoke suite passes in Chromium/Firefox/WebKit (`npm run test:cross-browser`, February 9, 2026)
- [x] Playwright cross-browser interaction demos validate hook-driven press + tabs keyboard behavior (`tests/cross-browser/interactive-demos.spec.mjs`, `docs/porting/cross-browser-demos.md`)
