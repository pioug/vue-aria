# Vue Aria / Vue Spectrum Roadmap

Last updated: 2026-02-13
Source of truth: `/Users/piou/Dev/vue-aria/PLAN.md`

## 1) Program Status
- Overall status: In progress
- Current phase: Foundation bootstrap + first package
- Current focus package: `@vue-aria/selection`
- Scope note: Ignore Spectrum S2 (next Spectrum version). Port only the current upstream Spectrum version unless explicitly requested otherwise.
- Blockers:
  - Storybook parity environment not scaffolded yet (VitePress scaffold is now in place)

## 2) Global Acceptance Gates
A package can be marked `Complete` only if all are true:
1. Public API parity implemented and exported.
2. Behavioral parity validated by migrated tests.
3. Visual parity validated against upstream docs/examples.
4. Accessibility parity validated.
5. Relevant upstream tests migrated and passing.
6. No remaining React runtime dependency in that package.
7. Package docs/examples ported.

Program completion gate:
- All consumable React hooks/components/public helpers/shared libraries are ported and complete.

## 3) Execution Queue
Status key: `Not started` | `In progress` | `Complete` | `Blocked`

### React Aria packages
- `@vue-aria/utils`: In progress
- `@vue-aria/i18n`: In progress
- `@vue-aria/ssr`: In progress
- `@vue-aria/interactions`: In progress
- `@vue-aria/focus`: In progress
- `@vue-aria/live-announcer`: Not started
- `@vue-aria/overlays`: Not started
- `@vue-aria/visually-hidden`: Not started
- `@vue-aria/label`: Not started
- `@vue-aria/button`: Not started
- `@vue-aria/toggle`: Not started
- `@vue-aria/checkbox`: Not started
- `@vue-aria/radio`: Not started
- `@vue-aria/switch`: Not started
- `@vue-aria/textfield`: Not started
- `@vue-aria/searchfield`: Not started
- `@vue-aria/numberfield`: Not started
- `@vue-aria/slider`: Not started
- `@vue-aria/link`: Not started
- `@vue-aria/menu`: Not started
- `@vue-aria/listbox`: Not started
- `@vue-aria/select`: Not started
- `@vue-aria/combobox`: Not started
- `@vue-aria/tabs`: Not started
- `@vue-aria/grid`: Not started
- `@vue-aria/table`: Not started
- `@vue-aria/tree`: Not started
- `@vue-aria/calendar`: Not started
- `@vue-aria/datepicker`: Not started
- `@vue-aria/breadcrumbs`: Not started
- `@vue-aria/dialog`: Not started
- `@vue-aria/tooltip`: Not started
- `@vue-aria/progress`: Not started
- `@vue-aria/meter`: Not started
- `@vue-aria/collections`: In progress
- `@vue-aria/selection`: In progress

### React Stately packages
- `@vue-aria/utils-state`: In progress
- `@vue-aria/toggle-state`: In progress
- `@vue-aria/list-state`: Not started
- `@vue-aria/tree-state`: Not started
- `@vue-aria/table-state`: Not started
- `@vue-aria/calendar-state`: Not started
- `@vue-aria/datepicker-state`: Not started
- `@vue-aria/overlays-state`: Not started
- `@vue-aria/combobox-state`: Not started
- `@vue-aria/selection-state`: In progress

### React Spectrum component packages
- `@vue-spectrum/provider`: Not started
- `@vue-spectrum/theme`: Not started
- `@vue-spectrum/button`: Not started
- `@vue-spectrum/checkbox`: Not started
- `@vue-spectrum/radio`: Not started
- `@vue-spectrum/switch`: Not started
- `@vue-spectrum/textfield`: Not started
- `@vue-spectrum/searchfield`: Not started
- `@vue-spectrum/numberfield`: Not started
- `@vue-spectrum/slider`: Not started
- `@vue-spectrum/link`: Not started
- `@vue-spectrum/menu`: Not started
- `@vue-spectrum/listbox`: Not started
- `@vue-spectrum/picker`: Not started
- `@vue-spectrum/combobox`: Not started
- `@vue-spectrum/tabs`: Not started
- `@vue-spectrum/table`: Not started
- `@vue-spectrum/tree`: Not started
- `@vue-spectrum/calendar`: Not started
- `@vue-spectrum/datepicker`: Not started
- `@vue-spectrum/breadcrumbs`: Not started
- `@vue-spectrum/dialog`: Not started
- `@vue-spectrum/tooltip`: Not started
- `@vue-spectrum/progress`: Not started
- `@vue-spectrum/meter`: Not started
- `@vue-spectrum/toast`: Not started

## 4) Recommended Port Order
1. Foundations: `utils`, `i18n`, `ssr`, `interactions`, `focus`, `collections`, `selection`.
2. Primitive form controls: `label`, `button`, `toggle`, `checkbox`, `radio`, `switch`, `textfield`.
3. Overlay/select stack: `overlays`, `listbox`, `menu`, `select`, `combobox`, `dialog`, `tooltip`.
4. Data/navigation: `tabs`, `grid`, `table`, `tree`, `breadcrumbs`.
5. Date/time stack: `calendar`, `calendar-state`, `datepicker`, `datepicker-state`.
6. Spectrum visual layer and docs parity.

## 5) Package Record: @vue-aria/utils
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/utils/src`
  - `references/react-spectrum/packages/@react-aria/utils/test`
- Local package path: `packages/@vue-aria/utils`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete (index export-name parity reached)

### Implementation
- [x] Initial utility/composable slice ported
- [x] Folder structure mirrors package boundary
- [x] Vue idioms applied where hooks were adapted
- [x] Added upstream-aligned pure utility tranche:
  - `chain`
  - `mergeRefs`
  - `domHelpers`
  - `shadowdom/DOMFunctions`
  - `shadowdom/ShadowTreeWalker`
  - `getScrollParents`
  - `focusWithoutScrolling`
  - `platform`
  - `constants`
  - `inertValue`
- [x] Added additional upstream utility parity slice:
  - `getOffset`
  - `isElementVisible`
  - `isFocusable` / `isTabbable`
  - `isVirtualClick` / `isVirtualPointerEvent`
  - `isCtrlKeyPressed` / `willOpenKeyboard`
  - `runAfterTransition`
  - `scrollIntoView` / `scrollIntoViewport`
  - `clamp` / `snapValueToStep`
  - router aliases: `RouterProvider`, `getSyntheticLinkProps`
- [x] Added hook/composable utility slice (Vue-adapted parity surface):
  - `useId` / `mergeIds` / `useSlotId`
  - `useLayoutEffect`
  - `useEffectEvent`
  - `useEvent`
  - `useUpdateEffect`
  - `useUpdateLayoutEffect`
  - `useDeepMemo`
  - `useFormReset`
  - `useGlobalListeners`
  - `useSyncRef`
  - `useObjectRef`
  - `useLabels`
- Remaining:
  - Port full upstream `@react-aria/utils` export surface
  - Reconcile naming/semantics gaps to upstream API

### Tests
- Total upstream test files: 7
- Ported test files: 18
- Passing test files: 18
- Test parity notes:
  - Added adapted upstream coverage for `domHelpers` and `mergeRefs`.
  - Added adapted upstream coverage for `runAfterTransition`.
  - Added adapted coverage for `useObjectRef`.
  - Remaining upstream files (`useViewportSize`, `useDrag1D`, `useEnterAnimation`/`useExitAnimation`, `openLink` API alignment, full `shadowTreeWalker` parity test migration) are still pending parity port/adaptation.
- [ ] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress page scaffolded for package parity notes and examples
- [ ] Examples parity complete
- [x] Base styles parity started (selection list base style mirrored)

### Accessibility
- [ ] Roles/attributes parity
- [ ] Keyboard interaction parity
- [ ] Focus behavior parity
- [ ] Screen reader/live region behavior parity

### Visual Parity
- [ ] Upstream example comparisons complete
- [ ] Variant/state comparisons complete
- [ ] Open visual deltas documented

### React Dependency Check
- [ ] No remaining React runtime dependency
- Remaining dependencies:
  - None in runtime deps for this slice; parity verification pending for full package

### Open Gaps
- Upstream reference now added as submodule, and index export-name parity is now reached for `@vue-aria/utils`.
- SSR/documentation scaffolding is baseline only and needs parity-level implementation.
- `mergeProps` still lacks upstream `id` dedupe integration (`mergeIds/useId` parity path pending).
- `inertValue` is Vue-native simplified and needs explicit parity decision per API surface.
- `useId`/`mergeIds` behavior is currently simplified vs upstream reactive id reconciliation semantics and needs deeper parity hardening.
- `useSlotId` is currently a simplified Vue adaptation and needs parity hardening around deferred DOM-resolution timing.
- API name parity is complete, but behavior parity still needs deepening for complex hooks (`animation`, `drag`, viewport lifecycle timing, and id merging semantics).

### Next Actions
1. Build explicit upstream export-to-local mapping for `@react-aria/utils`.
2. Port missing upstream utilities (`mergeRefs`, `useId` semantics, shadow DOM helpers, etc.).
3. Convert upstream tests file-by-file with assertion parity notes.
4. Scaffold docs pages for `@vue-aria/utils` usage and parity notes.
5. Mark completion only after all package gates pass.

## 6) Package Record: @vue-aria/selection
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/selection/src`
  - `references/react-spectrum/packages/@react-aria/selection/test`
- Local package path: `packages/@vue-aria/selection`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules for initial slice enumerated
- [ ] Public API checklist complete (full package not yet ported)

### Implementation
- [x] Initial collection navigation/typeahead slice ported:
  - `DOMLayoutDelegate`
  - `ListKeyboardDelegate`
  - `useTypeSelect`
  - `utils.getItemElement`
  - `useSelectableCollection`
  - `useSelectableList`
  - `useSelectableItem`
  - `utils.isNonContiguousSelectionModifier`
  - `utils.useCollectionId`
  - `utils.getCollectionId`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Remaining:
  - Deepen `useSelectableCollection` and `useSelectableItem` parity for full press/long-press semantics and virtualization lifecycle nuances.
  - Reconcile API/type parity against full upstream `index.ts` surface

### Tests
- Total upstream test files: 1
- Ported test files: 6
- Passing test files: 6
- Test parity notes:
  - Added adapted tests for keyboard delegate navigation/search behavior.
  - Added adapted tests for typeahead buffer, focus movement, and debounce reset.
  - Upstream `useSelectableCollection` test file remains pending until those modules are ported.
- [ ] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [ ] VitePress/Storybook pages ported
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Keyboard interaction parity fully validated
- [ ] Focus behavior parity fully validated
- [ ] Screen reader semantics parity validated for selectable collection hooks

### Visual Parity
- [ ] Upstream example comparisons complete
- [ ] Variant/state comparisons complete
- [ ] Open visual deltas documented

### React Dependency Check
- [x] No React runtime dependency in current slice
- Remaining dependencies:
  - None in current runtime slice; full package parity pending.

### Next Actions
1. Deepen `useSelectableItem` parity for press/long-press behavior and modality-specific edge cases.
2. Deepen `useSelectableCollection` virtualization/scroll lifecycle parity paths.
3. Migrate more upstream `useSelectableCollection` test intent into Vue harness with expanded DOM interaction coverage.
4. Expand docs from parity notes to runnable Vue examples for each upstream story variant.
5. Mark completion only after all package gates pass.

## 7) Package Record: @vue-aria/interactions
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/interactions/src`
  - `references/react-spectrum/packages/@react-aria/interactions/test`
- Local package path: `packages/@vue-aria/interactions`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules for initial prerequisite slice enumerated
- [ ] Public API checklist complete (full package not yet ported)

### Implementation
- [x] Initial prerequisite slice ported:
  - `focusSafely`
  - `getInteractionModality`
  - `setInteractionModality`
  - `isFocusVisible`
  - `getPointerType`
  - `addWindowFocusTracking`
  - `useInteractionModality`
  - `useFocusVisible`
  - `useFocusVisibleListener`
  - `createEventHandler`
  - `useKeyboard`
  - `useFocus`
  - `useFocusWithin`
  - `useInteractOutside`
  - `useHover`
  - `useScrollWheel`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Remaining:
  - Port `usePress`, `useLongPress`, `useMove`, `useHover`, `useFocus`, `useFocusWithin`, `useKeyboard`, `useInteractOutside`, and related helpers/context.
  - Migrate upstream interaction tests module-by-module.

### Tests
- Total upstream test files: Pending full inventory
- Ported test files: 8
- Passing test files: 8
- Test parity notes:
  - Added adapted tests for `focusSafely` behavior and modality getter/setter.
  - Added adapted tests for `useFocusVisible` infrastructure (listeners, visibility state, pointer/modality tracking, window setup/teardown).
  - Added adapted tests for `useKeyboard` event handling and propagation semantics.
  - Added adapted tests for `useFocus` immediate-target and disabled behaviors.
  - Added adapted tests for `useFocusWithin` target/child focus behavior and outside-focus blur handling.
  - Added adapted tests for `useInteractOutside` outside detection, left-button gating, start/end callback flow, and disabled behavior.
  - Added adapted tests for `useHover` callback flow, disabled behavior, and touch/emulated hover suppression.
  - Added adapted tests for `useScrollWheel` delta emission, ctrl+wheel suppression, and disabled behavior.
  - Full upstream test migration pending with broader API coverage.
- [ ] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [ ] VitePress/Storybook pages ported
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Modality and focus-visible parity validated
- [ ] Pointer/keyboard/virtual interaction parity validated

### Visual Parity
- [ ] Upstream example comparisons complete
- [ ] Variant/state comparisons complete
- [ ] Open visual deltas documented

### React Dependency Check
- [x] No React runtime dependency in current slice
- Remaining dependencies:
  - None in current runtime slice; full package parity pending.

### Next Actions
1. Port `usePress` and `useLongPress` with Vue event adaptation.
2. Port `useMove`, `useHover`, `useFocus`, `useFocusWithin`, `useKeyboard`, and `useInteractOutside`.
3. Port/migrate upstream interaction tests incrementally after each module.
4. Wire downstream consumers (`@vue-aria/selection`) once required interaction primitives are available.

## 8) Package Record: @vue-aria/focus
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/focus/src`
  - `references/react-spectrum/packages/@react-aria/focus/test`
- Local package path: `packages/@vue-aria/focus`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules for initial prerequisite slice enumerated
- [ ] Public API checklist complete (full package not yet ported)

### Implementation
- [x] Initial prerequisite slice ported:
  - `virtualFocus` APIs:
    - `moveVirtualFocus`
    - `dispatchVirtualBlur`
    - `dispatchVirtualFocus`
    - `getVirtuallyFocusedElement`
  - `FocusScope` utility APIs:
    - `getFocusableTreeWalker`
    - `createFocusManager`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Remaining:
  - Port `FocusScope` component behavior and focus containment logic.
  - Port `FocusRing`, `useFocusRing`, `useHasTabbableChild`.
  - Align tree walker behavior with full upstream radio/scope handling.
  - Migrate full upstream focus tests.

### Tests
- Total upstream test files: Pending full inventory
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted tests for virtual focus event dispatch/focus movement and focusable walker traversal.
  - Full upstream focus test migration remains pending.
- [ ] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [ ] VitePress/Storybook pages ported
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Focus containment parity validated
- [ ] Virtual focus parity validated across components

### Visual Parity
- [ ] Upstream example comparisons complete
- [ ] Variant/state comparisons complete
- [ ] Open visual deltas documented

### React Dependency Check
- [x] No React runtime dependency in current slice
- Remaining dependencies:
  - None in current runtime slice; full package parity pending.

### Next Actions
1. Port `FocusScope` component and focus containment stack behavior.
2. Port `useFocusRing` + `FocusRing`.
3. Port upstream focus tests incrementally with Vue test adapters.
4. Integrate focus package with `@vue-aria/selection` selectable hooks.

## 9) Session Log
### 2026-02-13
- Initialized roadmap from scratch.
- Added global completion gates and queue.
- Added reusable package parity template.
- Added upstream reference submodule: `references/react-spectrum` pinned to `c8d64314e5b9039fc6cb985f0dd666e1c6187b37`.
- Bootstrapped monorepo toolchain (`package.json`, `tsconfig.json`, `vitest.config.ts`).
- Started first package implementation: `@vue-aria/utils`.
- Added foundational packages needed by current utils slice: `@vue-aria/types`, `@vue-aria/ssr`.
- Validation: `npm run check` passed, `npm test` passed (10 files, 33 tests).
- Added `@vue-aria/flags` and shadow DOM utility infrastructure.
- Ported additional upstream utility modules and expanded utils exports.
- Validation: `npm run check` passed, `npm test` passed (14 files, 41 tests).
- Ported another utility tranche (offset/visibility/focusability/virtual-event/keyboard/transition/scroll/math helpers) and router parity aliases.
- Validation: `npm run check` passed, `npm test` passed (16 files, 45 tests).
- Ported hook/composable utility tranche with upstream API names adapted to Vue lifecycle semantics.
- Validation: `npm run check` passed, `npm test` passed (18 files, 49 tests).
- Added final missing upstream index exports (`useDrag1D`, `useEnterAnimation`, `useExitAnimation`, `useViewportSize`) with Vue adaptations.
- Validation: `npm run check` passed, `npm test` passed (20 files, 51 tests).
- Ported `@vue-aria/ssr` provider/composables slice:
  - `SSRProvider`
  - `useSSRSafeId`
  - `useIsSSR`
  - `useId`
- Added SSR provider tests and validated nested-provider id uniqueness.
- Validation: `npm run check` passed, `npm test` passed (21 files, 53 tests).
- Started `@vue-aria/i18n` package slice with:
  - locale context/provider
  - default locale + languagechange handling
  - formatter/filter hooks
  - RTL utility and server localization script serialization
- Added adapted i18n tests (`languagechange`, `server`) and integrated dependencies.
- Validation: `npm run check` passed, `npm test` passed (23 files, 56 tests).
- Hardened i18n formatter reactivity:
  - Locale-aware live formatter proxies for message/string/list/date/number/collator hooks.
  - Added regression test ensuring formatted output updates on `languagechange`.
- Validation: `npm run check` passed, `npm test` passed (24 files, 57 tests).
- Started `@vue-aria/collections` foundational slice:
  - Ported upstream `BaseCollection`/node model core
  - Added Vue `useCachedChildren` adaptation
  - Added initial hideable/collection-builder compatibility layer (provisional APIs for downstream integration)
  - Added base collection tests
- Validation: `npm run check` passed, `npm test` passed (25 files, 59 tests).
- Started `@vue-aria/toggle-state` slice from upstream `@react-stately/toggle`:
  - `useToggleState`
  - `useToggleGroupState`
  - Vue-controlled-state helper aligned to controlled/uncontrolled behavior
- Added toggle-state tests for single/multiple selection and read-only handling.
- Validation: `npm run check` passed, `npm test` passed (27 files, 63 tests).
- Started `@vue-aria/utils-state` slice from upstream `@react-stately/utils`:
  - `useControlledState`
  - `clamp`, `snapValueToStep`, `toFixedNumber`, `roundToStepPrecision`
- Rewired `@vue-aria/toggle-state` to use `@vue-aria/utils-state` for package boundary parity.
- Added utils-state tests for controlled/uncontrolled behavior and number helpers.
- Validation: `npm run check` passed, `npm test` passed (29 files, 68 tests).
- Started `@vue-aria/selection-state` slice from upstream `@react-stately/selection`:
  - `Selection`
  - `useMultipleSelectionState`
  - `SelectionManager`
  - local collection traversal/order helpers for standalone behavior parity
- Added selection-state tests for focus/selection state semantics and manager operations.
- Validation: `npm run check` passed, `npm test` passed (31 files, 72 tests).
- Started `@vue-aria/selection` slice from upstream `@react-aria/selection`:
  - `DOMLayoutDelegate`
  - `ListKeyboardDelegate`
  - `useTypeSelect`
  - `utils.getItemElement`
- Added adapted tests for keyboard delegate navigation/search and typeahead debounce behavior.
- Validation: `npm run check` passed, `npm test` passed (33 files, 78 tests).
- Started `@vue-aria/interactions` prerequisite slice from upstream `@react-aria/interactions`:
  - `focusSafely`
  - `getInteractionModality`
  - `setInteractionModality`
- Added adapted tests for focus safety (virtual/non-virtual) and modality state.
- Validation: `npm run check` passed, `npm test` passed (34 files, 81 tests).
- Started `@vue-aria/focus` prerequisite slice from upstream `@react-aria/focus`:
  - `moveVirtualFocus`
  - `dispatchVirtualBlur`
  - `dispatchVirtualFocus`
  - `getVirtuallyFocusedElement`
  - `getFocusableTreeWalker`
  - `createFocusManager`
- Added adapted tests for virtual focus behavior and focusable tree walker traversal.
- Validation: `npm run check` passed, `npm test` passed (35 files, 85 tests).
- Expanded `@vue-aria/selection` shared utils parity slice:
  - `isNonContiguousSelectionModifier`
  - `useCollectionId`
  - `getCollectionId`
  - Hardened `getItemElement` selector escaping fallback for non-browser test runtimes
- Added adapted utility tests for collection scoping, collection id mapping, and modifier semantics.
- Validation: `npm run check` passed, `npm test` passed (36 files, 89 tests).
- Ported core collection hooks in `@vue-aria/selection`:
  - `useSelectableCollection`
  - `useSelectableList`
- Added adapted tests for keyboard navigation/select-all/focus behaviors and list hook wiring.
- Validation: `npm run check` passed, `npm test` passed (38 files, 93 tests).
- Ported initial `useSelectableItem` behavior slice in `@vue-aria/selection`:
  - selection toggling/replacement semantics
  - primary/secondary action wiring
  - focus/tab index behavior and keyboard activation
- Added adapted tests for click/ctrl-click selection and action-only behavior.
- Validation: `npm run check` passed, `npm test` passed (39 files, 96 tests).
- Expanded `@vue-aria/selection` behavioral parity:
  - `useSelectableCollection`:
    - `autoFocus` initialization logic
    - virtual focus event handling (`FOCUS_EVENT`, `CLEAR_FOCUS_EVENT`)
  - `useSelectableItem`:
    - touch/virtual pointer toggle semantics in replace mode
- Added adapted tests for auto-focus fallback, virtual focus event behavior, and touch/virtual toggle interactions.
- Validation: `npm run check` passed, `npm test` passed (39 files, 99 tests).
- Added upstream-aligned keyboard interaction coverage for `useSelectableCollection`:
  - `Ctrl+Arrow` navigation moves focus without replacing selection
  - `Shift+Arrow` navigation extends selection in multiple mode
- Validation: `npm run check` passed, `npm test` passed (39 files, 101 tests).
- Scaffolded VitePress documentation:
  - `docs/.vitepress/config.mts`
  - `docs/index.md`
  - `docs/packages/selection.md`
  - `docs/styles/selection.css`
- Ported initial `@react-aria/selection` story-aligned docs content and base list style references.
- Validation: `npm run check` passed, `npm test` passed, `npm run docs:build` passed.
- Expanded `@vue-aria/interactions` focus-visible infrastructure:
  - global focus/modality listener setup and teardown
  - window tracking via `addWindowFocusTracking`
  - `isFocusVisible`, `getPointerType`, `useInteractionModality`, `useFocusVisible`, `useFocusVisibleListener`
- Added adapted tests for modality/pointer state, listener lifecycle, and window tracking behavior.
- Validation: `npm run check` passed, `npm test` passed (40 files, 106 tests).
- Ported `@vue-aria/interactions` keyboard utility slice:
  - `createEventHandler`
  - `useKeyboard`
- Added adapted tests for disabled handling and default/continued event propagation semantics.
- Validation: `npm run check` passed, `npm test` passed (41 files, 110 tests).
- Ported `@vue-aria/interactions` focus utility slice:
  - `useFocus`
- Added adapted tests for immediate-target focus handling, child-focus ignores, and disabled state behavior.
- Validation: `npm run check` passed, `npm test` passed (42 files, 113 tests).
- Ported `@vue-aria/interactions` focus-within utility slice:
  - `useFocusWithin`
- Added adapted tests for target/child focus handling and outside-focus blur transitions.
- Validation: `npm run check` passed, `npm test` passed (43 files, 116 tests).
- Ported `@vue-aria/interactions` outside-interaction utility slice:
  - `useInteractOutside`
- Added adapted tests for outside pointer/mouse semantics, disabled behavior, and `onInteractOutsideStart` ordering.
- Validation: `npm run check` passed, `npm test` passed (44 files, 121 tests).
- Ported `@vue-aria/interactions` hover utility slice:
  - `useHover`
- Added adapted tests for hover start/end/change callbacks, disabled handling, and touch suppression behavior.
- Validation: `npm run check` passed, `npm test` passed (45 files, 124 tests).
- Ported `@vue-aria/interactions` scroll-wheel utility slice:
  - `useScrollWheel`
- Added adapted tests for wheel delta callbacks, ctrl+wheel bypass, and disabled behavior.
- Validation: `npm run check` passed, `npm test` passed (46 files, 127 tests).
