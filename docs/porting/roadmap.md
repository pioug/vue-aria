# Roadmap

The full tracker lives in `/PORTING_TRACKER.md`.

## Snapshot

- Tracked items completed: `139 / 144` (about `96.5%`)
- Tracked items remaining: `5`
- Current parity focus: quality gates

## Done So Far

- Foundation primitives: `mergeProps`, `useId`, `provideSSR`, `useIsSSR`, `filterDOMProps`, `provideI18n`, `useLocale`, `announce`, `provideRouter`, `useRouter`
- Shared utility baseline: `useLoadMore`
- Shared utility baseline: `useLoadMoreSentinel`, `isScrollable`, `getScrollParent`
- Focus and interactions: `useFocusVisible`, `useFocusRing`, `usePress`, `useKeyboard`, `useFocus`, `useFocusWithin`, `useHover`, `useLongPress`, `useMove`, `useInteractOutside`
- Core semantics: `useButton`, `useToggleButton`, `useLink`, `useLabel`, `useField`, `useSeparator`
- Accessibility utility/component: `useVisuallyHidden`, `VisuallyHidden`, `useDescription`, `useErrorMessage`
- Form controls: `useTextField`, `useSearchField`, `useNumberField`, `useSpinButton`
- Selection controls: `useCheckbox`, `useCheckboxGroup`, `useCheckboxGroupItem`, `useRadio`, `useRadioGroup`, `useSwitch`, `useSlider`, `useSliderThumb`, `useSliderState`
- Date/time: `useDateField`, `useDateSegment`
- Date/time pickers: `useDatePickerGroup`, `useDatePicker`, `useDateRangePicker`, `useTimeField`
- Calendar: `useCalendarBase`, `useCalendar`, `useCalendarCell`, `useRangeCalendar`
- Navigation: `useBreadcrumbItem`
- Disclosure: `useDisclosure`, `useDisclosureState`
- Disclosure groups: `useDisclosureGroupState`
- Accordion item behavior: `useAccordionItem`
- Collections foundation: `buildCollection`
- Menu stack: `useMenuTriggerState`, `useSubmenuTriggerState`, `useMenuTrigger`, `useMenu`, `useMenuItem`, `useMenuSection`, `useSubmenuTrigger`
- Overlay primitives: `useOverlayTriggerState`, `useOverlayTrigger`, `useOverlay`, `useOverlayPosition`, `useModal`, `useModalOverlay`, `useOverlayFocusContain`, `usePreventScroll`, `usePopover`
- Stately primitives: `useToggleState`, `useListState`, `useSingleSelectListState`, `useMultipleSelectionState`, `useComboBoxState`, `useCalendarState`, `useRangeCalendarState`, `useDatePickerState`, `useTreeState`, `useTableState`
- Drag/drop stately primitives: `useDraggableCollectionState`, `useDroppableCollectionState`
- Toast state primitive: `useToastState`
- Dialog: `useDialog`
- Tooltip: `useTooltip`, `useTooltipTrigger`
- Tabs: `useTabs`, `useTabListState`, `useTabList`, `useTab`, `useTabPanel`
- Listbox: `useListBoxState`, `useListBox`, `useOption`, `useListBoxSection`
- Gridlist ARIA: `useGridList`, `useGridListItem`
- Grid ARIA: `useGrid`, `useGridCell`
- Tree ARIA: `useTree`, `useTreeItem`
- Table ARIA: `useTable`, `useTableRow`, `useTableCell`, `useTableColumnHeader`
- Selection primitives: `useListKeyboardDelegate`, `useGridKeyboardDelegate`, `useTypeSelect`
- Select: `useSelectState`, `useSelect`
- ComboBox: `useComboBoxState`, `useComboBox`
- Feedback/status: `useProgressBar`, `useProgressCircle`, `useMeter`, `useToast`, `useToastRegion`
- Drag/drop clipboard + keyboard target baseline: `useClipboard`, `useDrag`, `createDragPreviewRenderer`, `useDrop`, `useDropIndicator`, `useDroppableCollection`, `useDroppableItem`, `useVirtualDrop`, `useAutoScroll`, `useDraggableCollection`, `useDraggableItem`, `writeToDataTransfer`, `readFromDataTransfer`, `DragTypes`, `navigate`, `ListDropTargetDelegate` (with `hasDragButton`/`hasDropButton` affordances)
- Drag/drop manager hardening baseline: keyboard session flow (`Tab` navigation, `Enter` drop, `Escape` cancel), click-driven cancel/drop flow, drop-item targeting/activation (`onDropTargetEnter`, `onDropActivate`), screen-reader isolation for non-drop content while dragging, mutation-driven target updates, and `isValidDropTarget` utility
- Drag/drop parity hardening: modality-aware drag/drop descriptions, modality-specific start/cancel/complete announcements, global drop-effect + allowed-operation synchronization, and standalone `useDrop` keyboard-target registration for managed dragging
- Drag/drop SSR baseline: server-render smoke test for `useDrag` + `useDrop`
- SSR hydration parity baseline: deterministic nested `useId` generation across server render + client hydration in `@vue-aria/ssr`
- RTL/i18n parity hardening: `useOverlayPosition` now verifies `start` placement mapping for LTR vs RTL locale providers
- Hook-level test gate hardening: parity script now fails if any runtime package lacks a unit-test suite
- Virtualizer geometry primitives baseline: `Point`, `Size`, `Rect`, `LayoutInfo`
- Virtualizer core engine primitives baseline: `Layout`, `Virtualizer`, `OverscanManager`, `ReusableView`
- Virtualizer state baseline: `useVirtualizerState`
- Virtualizer state hardening: `Virtualizer` coverage for point hit-testing, persisted-key ancestry, clamped offsets, and item-size invalidation
- React Aria virtualizer item/scroll helpers baseline: `useVirtualizerItem`, `layoutInfoToStyle`, `getRTLOffsetType`, `getScrollLeft`, `setScrollLeft`
- React Aria virtualizer scroll container baseline: `useScrollView`
- Virtualizer scroll infrastructure hardening: immediate ref-attach measurement and border-box resize observation parity in `useScrollView`
- React Aria virtualizer composition baseline: `useVirtualizer`
- Vue virtualizer component adapters baseline: `ScrollView`, `VirtualizerItem`
- Vue virtualizer orchestration component baseline: `Virtualizer`

## What Is Left (By Area)

- Foundation: `0` remaining
- Interactions: `0` remaining
- Core semantics: `0` remaining
- Text/number inputs: `0` remaining
- Selection controls: `0` remaining
- Date/time: `0` remaining
- Collections/lists: `0` remaining
- Menus/actions: `0` remaining
- Tabs/disclosure/navigation: `0` remaining
- Overlays/dialogs: `0` remaining
- Grids/tables/trees: `0` remaining
- Drag/drop + virtualizer: `0` remaining
- Feedback/status: `0` remaining
- Stately parity layer: `0` remaining
- Quality gates: `4` remaining

## Critical Path To Parity

### Phase 1: Finish Interaction Baseline (Completed)

- Long press, move, and interact-outside hooks are ported with parity tests.
- Press edge-case baseline parity is in place (touch scroll cancel + virtual click tests).

### Phase 2: Form Controls (Text/Number Completed)

- Text and number baseline complete: `useTextField`, `useSearchField`, `useNumberField`, `useSpinButton`, textarea behavior parity, validation wiring parity.
- Selection controls complete baseline: `useCheckbox`, `useCheckboxGroup`, `useCheckboxGroupItem`, `useRadio`, `useRadioGroup`, `useSwitch`, `useSlider`, `useSliderThumb`, `useSliderState`.
- Date/time baseline is in place across field, picker, and calendar hooks: `useDateField`, `useDateSegment`, `useDatePickerGroup`, `useDatePicker`, `useDateRangePicker`, `useTimeField`, `useCalendarBase`, `useCalendar`, `useCalendarCell`, `useRangeCalendar`.
- Date/time parity hardening complete: international calendar and timezone behavior.

### Phase 3: Data + Advanced Interaction

- Drag/drop clipboard + keyboard target baselines in place (`@vue-aria/dnd` `useClipboard`, `useDrag`, `useDrop`, `useVirtualDrop`, `useAutoScroll`, `useDraggableCollection`, `navigate`)
- Drag manager keyboard baseline in place (`Tab` target cycling, `Enter` drop, `Escape` cancel) plus click-driven cancel/drop flow, drop-item targeting/activation (`onDropTargetEnter`, `onDropActivate`), screen-reader isolation for non-drop content while dragging, and mutation-driven target updates
- Table/grid/tree hooks completed
- DnD and keyboard DnD parity
- Virtualizer infrastructure parity

### Phase 4: State + Hardening

- React Stately parity layer (or equivalent Vue state packages)
- SSR hydration and id consistency tests (baseline complete)
- RTL/i18n validation passes (baseline complete)
- Screen-reader validation passes
- Cross-browser validation (Chromium/WebKit/Firefox)

## Immediate Next Milestone

1. Continue quality-gate hardening (keyboard/screen reader/cross-browser).
2. Expand documentation/examples coverage for remaining hooks/packages.
3. Keep parity checks aligned with any newly added migration tests.
