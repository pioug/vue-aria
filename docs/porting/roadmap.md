# Roadmap

The full tracker lives in `/PORTING_TRACKER.md`.

## Snapshot

- Tracked items completed: `20 / 133` (about `15.0%`)
- Tracked items remaining: `113`
- Current parity focus: foundational interactions + core semantics

## Done So Far

- Foundation primitives: `mergeProps`, `useId`
- Focus and interactions: `useFocusVisible`, `useFocusRing`, `usePress`, `useKeyboard`, `useFocus`, `useFocusWithin`, `useHover`, `useLongPress`, `useMove`, `useInteractOutside`
- Core semantics: `useButton`, `useLink`, `useLabel`, `useField`, `useSeparator`
- Accessibility utility/component: `useVisuallyHidden`, `VisuallyHidden`, `useDescription`

## What Is Left (By Area)

- Foundation: `7` remaining
- Interactions: `2` remaining
- Core semantics: `2` remaining
- Text/number inputs: `6` remaining
- Selection controls: `8` remaining
- Date/time: `9` remaining
- Collections/lists: `8` remaining
- Menus/actions: `7` remaining
- Tabs/disclosure/navigation: `8` remaining
- Overlays/dialogs: `11` remaining
- Grids/tables/trees: `11` remaining
- Drag/drop + virtualizer: `6` remaining
- Feedback/status: `5` remaining
- Stately parity layer: `15` remaining
- Quality gates: `7` remaining

## Critical Path To Parity

### Phase 1: Finish Interaction Baseline

- `useErrorMessage` helper and final field-description/error wiring cleanup
- Press edge-case parity (cancel on scroll/pointer-capture nuances)
- Virtual click/screen-reader parity tests

### Phase 2: Form Controls

- Text inputs: `useTextField`, `useSearchField`, `useNumberField`, `useTextArea`, spinbutton semantics
- Selection controls: `useCheckbox`, `useCheckboxGroup`, `useRadio`, `useRadioGroup`, `useSwitch`, `useSlider`, `useSliderThumb`

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

1. Complete Phase 1 (`useErrorMessage` + interaction edge-case parity).
2. Ship corresponding parity tests in the same commits.
3. Only then start Phase 2 form-control migration.
