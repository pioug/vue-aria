# Roadmap

The full tracker lives in `/PORTING_TRACKER.md`.

## Snapshot

- Tracked items completed: `39 / 133` (about `29.3%`)
- Tracked items remaining: `94`
- Current parity focus: selection controls after text/number control baseline completion

## Done So Far

- Foundation primitives: `mergeProps`, `useId`
- Focus and interactions: `useFocusVisible`, `useFocusRing`, `usePress`, `useKeyboard`, `useFocus`, `useFocusWithin`, `useHover`, `useLongPress`, `useMove`, `useInteractOutside`
- Core semantics: `useButton`, `useToggleButton`, `useLink`, `useLabel`, `useField`, `useSeparator`
- Accessibility utility/component: `useVisuallyHidden`, `VisuallyHidden`, `useDescription`, `useErrorMessage`
- Form controls: `useTextField`, `useSearchField`, `useNumberField`, `useSpinButton`
- Selection controls: `useCheckbox`, `useCheckboxGroup`, `useCheckboxGroupItem`, `useRadio`, `useRadioGroup`, `useSwitch`, `useSlider`, `useSliderThumb`, `useSliderState`

## What Is Left (By Area)

- Foundation: `7` remaining
- Interactions: `0` remaining
- Core semantics: `0` remaining
- Text/number inputs: `0` remaining
- Selection controls: `0` remaining
- Date/time: `9` remaining
- Collections/lists: `8` remaining
- Menus/actions: `7` remaining
- Tabs/disclosure/navigation: `8` remaining
- Overlays/dialogs: `11` remaining
- Grids/tables/trees: `11` remaining
- Drag/drop + virtualizer: `6` remaining
- Feedback/status: `5` remaining
- Stately parity layer: `14` remaining
- Quality gates: `7` remaining

## Critical Path To Parity

### Phase 1: Finish Interaction Baseline (Completed)

- Long press, move, and interact-outside hooks are ported with parity tests.
- Press edge-case baseline parity is in place (touch scroll cancel + virtual click tests).

### Phase 2: Form Controls (Text/Number Completed)

- Text and number baseline complete: `useTextField`, `useSearchField`, `useNumberField`, `useSpinButton`, textarea behavior parity, validation wiring parity.
- Selection controls complete baseline: `useCheckbox`, `useCheckboxGroup`, `useCheckboxGroupItem`, `useRadio`, `useRadioGroup`, `useSwitch`, `useSlider`, `useSliderThumb`, `useSliderState`.
- Next major area: date/time hooks (`useDateField`, `useDateSegment`, picker/calendar hooks)

### Phase 3: Overlay + Navigation Systems

- `useSelect`, `useComboBox`, `useListBox`, `useOption`, `useListBoxSection`
- `useMenu`, `useMenuItem`, `useMenuSection`, `useMenuTrigger`
- `useTabs`, `useTabList`, `useTab`, `useTabPanel`, `useDisclosure`, `useDisclosureGroup`
- Overlay stack: `useOverlay`, `useOverlayTrigger`, `usePopover`, `useDialog`, `useTooltip`

### Phase 4: Data + Advanced Interaction

- Table/grid/tree hooks (`useGrid`, `useTable`, `useTree` families)
- DnD and keyboard DnD parity
- Virtualizer infrastructure parity

### Phase 5: State + Hardening

- React Stately parity layer (or equivalent Vue state packages)
- SSR hydration and id consistency tests
- RTL/i18n and screen-reader validation passes
- Cross-browser validation (Chromium/WebKit/Firefox)

## Immediate Next Milestone

1. Start date/time hooks with `useDateField` and `useDateSegment`.
2. Continue with picker/calendar hooks once segment behavior is stable.
3. Revisit shared i18n/date infrastructure gaps as date/time work expands.
