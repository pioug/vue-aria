# Vue Aria / Vue Spectrum Roadmap

Last updated: 2026-02-13
Source of truth: `/Users/piou/Dev/vue-aria/PLAN.md`

## 1) Program Status
- Overall status: In progress
- Current phase: Foundation bootstrap + first package
- Current focus package: `@vue-aria/menu`
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
- `@vue-aria/live-announcer`: In progress
- `@vue-aria/overlays`: In progress
- `@vue-aria/visually-hidden`: In progress
- `@vue-aria/label`: In progress
- `@vue-aria/button`: In progress
- `@vue-aria/toggle`: In progress
- `@vue-aria/checkbox`: In progress
- `@vue-aria/radio`: In progress
- `@vue-aria/switch`: In progress
- `@vue-aria/textfield`: In progress
- `@vue-aria/searchfield`: In progress
- `@vue-aria/numberfield`: Not started
- `@vue-aria/slider`: Not started
- `@vue-aria/link`: In progress
- `@vue-aria/menu`: In progress
- `@vue-aria/listbox`: In progress
- `@vue-aria/select`: Not started
- `@vue-aria/combobox`: Not started
- `@vue-aria/tabs`: Not started
- `@vue-aria/grid`: Not started
- `@vue-aria/table`: Not started
- `@vue-aria/tree`: Not started
- `@vue-aria/calendar`: Not started
- `@vue-aria/datepicker`: Not started
- `@vue-aria/breadcrumbs`: In progress
- `@vue-aria/dialog`: In progress
- `@vue-aria/separator`: In progress
- `@vue-aria/disclosure`: In progress
- `@vue-aria/tooltip`: In progress
- `@vue-aria/progress`: In progress
- `@vue-aria/meter`: In progress
- `@vue-aria/collections`: In progress
- `@vue-aria/selection`: In progress

### React Stately packages
- `@vue-aria/utils-state`: In progress
- `@vue-aria/toggle-state`: In progress
- `@vue-aria/checkbox-state`: In progress
- `@vue-aria/radio-state`: In progress
- `@vue-aria/searchfield-state`: In progress
- `@vue-aria/overlays-state`: In progress
- `@vue-aria/tooltip-state`: In progress
- `@vue-aria/disclosure-state`: In progress
- `@vue-aria/list-state`: In progress
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
- [x] VitePress package page scaffolded (`docs/packages/interactions.md`)
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
  - `useMove`
  - `usePress`
  - `useLongPress`
  - `PressResponder` / `ClearPressResponder` context provider APIs
  - `PressResponderContext` + `usePress` context consumption/registration
  - `useFocusable`
  - `FocusableProvider` / `Focusable` / `FocusableContext`
  - `Pressable` component API
  - `textSelection` helpers (`disableTextSelection`, `restoreTextSelection`)
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Remaining:
  - Port remaining interaction helpers/context modules.
  - Migrate upstream interaction tests module-by-module.

### Tests
- Total upstream test files: Pending full inventory
- Ported test files: 14
- Passing test files: 14
- Test parity notes:
  - Added adapted tests for `focusSafely` behavior and modality getter/setter.
  - Added adapted tests for `useFocusVisible` infrastructure (listeners, visibility state, pointer/modality tracking, window setup/teardown).
  - Added adapted tests for `useKeyboard` event handling and propagation semantics.
  - Added adapted tests for `useFocus` immediate-target and disabled behaviors.
  - Added adapted tests for `useFocusWithin` target/child focus behavior and outside-focus blur handling.
  - Added adapted tests for `useInteractOutside` outside detection, left-button gating, start/end callback flow, and disabled behavior.
  - Added adapted tests for `useHover` callback flow, disabled behavior, and touch/emulated hover suppression.
  - Added adapted tests for `useScrollWheel` delta emission, ctrl+wheel suppression, and disabled behavior.
  - Added adapted tests for `useMove` keyboard and drag delta behavior, plus non-primary-button ignore behavior.
  - Added adapted tests for `usePress` pointer/mouse fallback flow, keyboard flow, disabled behavior, pointer-exit cancellation, and propagation semantics.
  - Added adapted tests for `useLongPress` timer threshold behavior, cancellation semantics, `usePress` composition, keyboard non-trigger behavior, and accessibility description handling.
  - Added adapted tests for `PressResponder` registration warning semantics and pressable-child registration path.
  - Added adapted tests for `useFocusable` tab order/default keyboard-focus wiring and `Pressable` focusability behavior.
  - Full upstream test migration pending with broader API coverage.
- [ ] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/focus.md`)
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
  - `useFocusRing`
  - `FocusRing`
  - `useHasTabbableChild`
  - focus package compatibility exports:
    - `isFocusable` re-export
    - `FocusableProvider`, `Focusable`, `useFocusable`, `focusSafely` passthrough re-exports
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Remaining:
  - Port `FocusScope` component behavior and focus containment logic.
  - Align tree walker behavior with full upstream radio/scope handling.
  - Migrate full upstream focus tests.

### Tests
- Total upstream test files: Pending full inventory
- Ported test files: 8
- Passing test files: 4
- Test parity notes:
  - Added adapted tests for virtual focus event dispatch/focus movement and focusable walker traversal.
  - Added adapted tests for `useFocusRing` focus/focus-visible state transitions and `within` handler path.
  - Added adapted tests for `useHasTabbableChild` initial tabbable detection and disabled behavior.
  - Added adapted tests for `FocusScope` API exports (`useFocusManager`, `isElementInChildOfActiveScope`).
  - Full upstream focus test migration remains pending.
- [ ] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/focus.md`)
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

## 9) Package Record: @vue-aria/live-announcer
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/live-announcer/src`
- Local package path: `packages/@vue-aria/live-announcer`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream global announcer APIs:
  - `announce`
  - `clearAnnouncer`
  - `destroyAnnouncer`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/LiveAnnouncer.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: none
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted tests covering assertive/polite announcements, `aria-labelledby` payloads, clear behavior, and destroy behavior.
- [ ] All relevant upstream tests migrated
- Current note:
  - Upstream package has no dedicated tests in the reference tree; Vue port relies on adapted behavioral tests.
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/live-announcer.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Screen reader announcement timing parity validated cross-browser

### Visual Parity
- Not applicable for this non-visual utility package.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Validate announcer timing behavior against browser matrix expectations.
2. Expand integration tests when downstream packages consume live announcer.
3. Finalize docs examples with end-to-end component usage.

## 10) Package Record: @vue-aria/visually-hidden
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/visually-hidden/src`
  - `references/react-spectrum/packages/@react-aria/visually-hidden/test`
- Local package path: `packages/@vue-aria/visually-hidden`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream APIs:
  - `useVisuallyHidden`
  - `VisuallyHidden`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/VisuallyHidden.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: 1
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted tests for hidden styles by default and focus-reveal behavior when `isFocusable` is set.
- [x] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/visually-hidden.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Cross-browser style/focus reveal parity validation

### Visual Parity
- Not applicable for this utility package beyond hidden-style behavior.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Validate integration behavior in downstream component packages.
2. Expand docs with side-by-side Vue usage examples from upstream scenarios.

## 11) Package Record: @vue-aria/label
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/label/src`
  - `references/react-spectrum/packages/@react-aria/label/test`
- Local package path: `packages/@vue-aria/label`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream APIs:
  - `useLabel`
  - `useField`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useLabel.ts`
  - `src/useField.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: 2
- Ported test files: 2
- Passing test files: 2
- Test parity notes:
  - Added adapted `useLabel` tests for visible/aria labels, composed `aria-labelledby`, warning behavior, and non-label element type.
  - Added adapted `useField` tests for label props, description/error id behavior, and `aria-describedby` linkage when rendered.
- [x] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/label.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] End-to-end field labeling parity validation with downstream field components

### Visual Parity
- Not applicable for this utility package beyond ARIA wiring behavior.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Validate integration behavior in textfield/numberfield/searchfield ports.
2. Reconcile any upstream id/slot edge cases after downstream integration.

## 12) Package Record: @vue-aria/button
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/button/src`
  - `references/react-spectrum/packages/@react-aria/button/test`
- Local package path: `packages/@vue-aria/button`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules for initial slice enumerated
- [ ] Public API checklist complete (full package not yet ported)

### Implementation
- [x] Ported initial upstream APIs:
  - `useButton`
  - `useToggleButton`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useButton.ts`
  - `src/useToggleButton.ts`
  - `tsconfig.json` path alias
- Remaining:
  - Port `useToggleButtonGroup`.
  - Reconcile any behavior deltas once downstream button components are integrated.

### Tests
- Total upstream test files: 1
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted `useButton` tests for defaults, non-button element behavior, disabled behavior, rel passthrough, input handling, and aria-disabled passthrough.
- [x] All currently present upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/button.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate button semantics across downstream consumer components

### Visual Parity
- Not applicable for this utility package beyond interaction/state semantics.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Port `useToggleButtonGroup`.
2. Wire and validate consumers (`@vue-spectrum/button` and related controls).
3. Expand docs with full Vue component examples once consumers exist.

## 13) Package Record: @vue-aria/link
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/link/src`
  - `references/react-spectrum/packages/@react-aria/link/test`
- Local package path: `packages/@vue-aria/link`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [ ] Public API checklist complete (full package/deep integration pending)

### Implementation
- [x] Ported initial upstream API:
  - `useLink`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useLink.ts`
  - `tsconfig.json` path alias
- Remaining:
  - Validate/expand router integration semantics against upstream edge cases.

### Tests
- Total upstream test files: 1
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted `useLink` tests for defaults, custom element type behavior, and disabled behavior.
- [x] All currently present upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/link.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate link semantics and keyboard behavior in downstream component integrations

### Visual Parity
- Not applicable for this utility package beyond interaction semantics.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Harden router/client-navigation edge-case parity.
2. Integrate and validate within downstream link/menu/breadcrumb components.

## 14) Package Record: @vue-aria/toggle
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/toggle/src`
- Local package path: `packages/@vue-aria/toggle`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useToggle`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useToggle.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: none
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted tests for base return props, accessibility warning behavior, and change-driven selection updates.
- [ ] All relevant upstream tests migrated
- Current note:
  - Upstream package has no dedicated test directory in the reference tree.
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/toggle.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full behavior parity through downstream checkbox/switch consumers

### Visual Parity
- Not applicable for this utility package beyond interaction semantics.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Integrate with downstream checkbox/switch packages and validate behavior.
2. Expand tests as consumers are ported.

## 15) Package Record: @vue-aria/checkbox (+ @vue-aria/checkbox-state)
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/checkbox/src`
  - `references/react-spectrum/packages/@react-aria/checkbox/test/useCheckboxGroup.test.tsx`
  - `references/react-spectrum/packages/@react-stately/checkbox/src`
- Local package path:
  - `packages/@vue-aria/checkbox`
  - `packages/@vue-aria/checkbox-state`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist created for initial package slice

### Implementation
- [x] Ported upstream API surface:
  - `useCheckbox`
  - `useCheckboxGroup`
  - `useCheckboxGroupItem`
  - `useCheckboxGroupState`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path aliases

### Tests
- Total upstream test files: 1 (`@react-aria/checkbox`) + state package behavior from source
- Ported test files: 3
- Passing test files: 3
- Test parity notes:
  - Adapted upstream checkbox group behavior checks for Vue composable usage.
  - Added checkbox-state tests for controlled selection and required-validation reactivity.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/checkbox.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate group/item validation parity against upcoming form package ports

### Visual Parity
- Not applicable for hook/state packages beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Deepen validation semantics after `@vue-aria/form` and related state ports land.
2. Port remaining checkbox-edge assertions as downstream consumers are introduced.

## 16) Package Record: @vue-aria/radio (+ @vue-aria/radio-state)
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/radio/src`
  - `references/react-spectrum/packages/@react-stately/radio/src`
- Local package path:
  - `packages/@vue-aria/radio`
  - `packages/@vue-aria/radio-state`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist created for initial package slice

### Implementation
- [x] Ported upstream API surface:
  - `useRadio`
  - `useRadioGroup`
  - `useRadioGroupState`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path aliases

### Tests
- Total upstream test files: none in `@react-aria/radio` reference package
- Ported test files: 2
- Passing test files: 2
- Test parity notes:
  - Added adapted parity tests for group role/ARIA wiring, selection state updates, tab index semantics, and keyboard arrow navigation.
  - Added radio-state tests for controlled selection, disabled/read-only guards, and required validation behavior.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/radio.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full keyboard/focus behavior in downstream Spectrum radio components

### Visual Parity
- Not applicable for hook/state packages beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Port downstream Spectrum radio components for visual/interaction parity.
2. Deepen validation semantics after form package ports.

## 17) Package Record: @vue-aria/switch
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/switch/src`
- Local package path:
  - `packages/@vue-aria/switch`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useSwitch`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useSwitch.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: none in `@react-aria/switch` reference package
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted tests for switch role, checked-state mapping, and disabled/read-only passthrough behavior from `useToggle`.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/switch.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full behavior parity in downstream Spectrum switch components

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Port downstream Spectrum switch component implementations.
2. Expand switch behavior coverage as consumers are integrated.

## 18) Package Record: @vue-aria/textfield
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/textfield/src`
  - `references/react-spectrum/packages/@react-aria/textfield/test/useTextField.test.js`
- Local package path:
  - `packages/@vue-aria/textfield`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useTextField`
  - `useFormattedTextField`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useTextField.ts`
  - `src/useFormattedTextField.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: 1 (`useTextField.test.js`)
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Adapted upstream assertions for default props, type/disabled/required/readonly/validation/autocapitalize behavior, onChange payload semantics, and textarea type/pattern omissions.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/textfield.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate behavior parity against downstream Spectrum textfield/searchfield components

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Port downstream Spectrum textfield/searchfield components.
2. Deepen form validation semantics as form package ports land.

## 19) Package Record: @vue-aria/searchfield (+ @vue-aria/searchfield-state)
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/searchfield/src`
  - `references/react-spectrum/packages/@react-aria/searchfield/test/useSearchField.test.js`
  - `references/react-spectrum/packages/@react-stately/searchfield/src`
- Local package path:
  - `packages/@vue-aria/searchfield`
  - `packages/@vue-aria/searchfield-state`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useSearchField`
  - `useSearchFieldState`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path aliases

### Tests
- Total upstream test files: 1 (`useSearchField.test.js`)
- Ported test files: 2 (aria + stately)
- Passing test files: 2
- Test parity notes:
  - Added adapted tests for search input props, enter submit behavior, escape clear behavior, and clear-button semantics.
  - Added searchfield-state tests for controlled/uncontrolled value semantics and numeric coercion.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/searchfield.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate searchfield behavior parity within downstream Spectrum search components

### Visual Parity
- Not applicable for hook/state package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Port downstream Spectrum searchfield components.
2. Expand locale dictionary coverage for clear-label parity.

## 20) Package Record: @vue-aria/progress
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/progress/src`
  - `references/react-spectrum/packages/@react-aria/progress/test/useProgressBar.test.js`
- Local package path:
  - `packages/@vue-aria/progress`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useProgressBar`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useProgressBar.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: 1 (`useProgressBar.test.js`)
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted upstream coverage for defaults, labeling, determinate/indeterminate values, and custom value labels.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/progress.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate downstream Spectrum progress component behavior

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Port downstream Spectrum progress component implementations.
2. Expand to meter package parity.

## 21) Package Record: @vue-aria/meter
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/meter/src`
- Local package path:
  - `packages/@vue-aria/meter`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useMeter`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useMeter.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: none in `@react-aria/meter` reference package
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted coverage for meter role fallback token and aria value forwarding from progress semantics.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/meter.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate downstream Spectrum meter component behavior

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Port downstream Spectrum meter component implementations.
2. Continue queue progression to overlay/navigation packages.

## 22) Package Record: @vue-aria/dialog
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/dialog/src`
  - `references/react-spectrum/packages/@react-aria/dialog/test/useDialog.test.js`
- Local package path:
  - `packages/@vue-aria/dialog`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useDialog`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useDialog.ts`
  - `tsconfig.json` path alias
- Open adaptation note:
  - `useOverlayFocusContain` integration is deferred until `@vue-aria/overlays` parity slice.

### Tests
- Total upstream test files: 1 (`useDialog.test.js`)
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted tests for default/alertdialog roles and mount-focus behavior.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/dialog.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Wire overlay focus containment parity once overlays package is ported

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Integrate `useOverlayFocusContain` when `@vue-aria/overlays` is ported.
2. Validate dialog behavior in downstream Spectrum overlay/dialog components.

## 23) Package Record: @vue-aria/breadcrumbs
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/breadcrumbs/src`
  - `references/react-spectrum/packages/@react-aria/breadcrumbs/test/useBreadcrumbs.test.js`
  - `references/react-spectrum/packages/@react-aria/breadcrumbs/test/useBreadcrumbItem.test.js`
- Local package path:
  - `packages/@vue-aria/breadcrumbs`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useBreadcrumbs`
  - `useBreadcrumbItem`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: 2
- Ported test files: 2
- Passing test files: 2
- Test parity notes:
  - Added adapted coverage for breadcrumbs nav labeling and item states (current/disabled/span/link semantics).
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/breadcrumbs.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate behavior in downstream Spectrum breadcrumb components

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Port downstream Spectrum breadcrumb components.
2. Expand locale dictionary coverage for breadcrumbs labels.

## 24) Package Record: @vue-aria/separator
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/separator/src`
- Local package path:
  - `packages/@vue-aria/separator`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useSeparator`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useSeparator.ts`
  - `tsconfig.json` path alias

### Tests
- Total upstream test files: none in `@react-aria/separator` reference package
- Ported test files: 1
- Passing test files: 1
- Test parity notes:
  - Added adapted coverage for default role semantics, vertical orientation aria mapping, and `hr` role omission behavior.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/separator.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate downstream Spectrum separator component behavior

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Port downstream Spectrum separator components.
2. Continue queue progression to tooltip/overlay stack.

## 25) Package Record: @vue-aria/tooltip (+ @vue-aria/tooltip-state + @vue-aria/overlays-state)
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/tooltip/src`
  - `references/react-spectrum/packages/@react-aria/tooltip/test/useTooltip.test.js`
  - `references/react-spectrum/packages/@react-stately/tooltip/src`
  - `references/react-spectrum/packages/@react-stately/overlays/src/useOverlayTriggerState.ts`
- Local package path:
  - `packages/@vue-aria/tooltip`
  - `packages/@vue-aria/tooltip-state`
  - `packages/@vue-aria/overlays-state`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useTooltip`
  - `useTooltipTrigger`
  - `useTooltipTriggerState`
  - `useOverlayTriggerState`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path aliases

### Tests
- Total upstream test files: 1 in `@react-aria/tooltip` + no dedicated stately files in this reference path
- Ported test files: 3
- Passing test files: 3
- Test parity notes:
  - Added adapted tests for tooltip role/hover behavior, trigger described-by wiring, tooltip-state open/close delay handling, and overlays-state open/close/toggle behavior.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/tooltip.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate tooltip trigger interactions in downstream Spectrum tooltip/popover integrations

### Visual Parity
- Not applicable for hook/state package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Port downstream Spectrum tooltip components.
2. Validate warmup/cooldown semantics against integration scenarios.

## 26) Package Record: @vue-aria/disclosure (+ @vue-aria/disclosure-state)
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/disclosure/src`
  - `references/react-spectrum/packages/@react-aria/disclosure/test/useDisclosure.test.ts`
  - `references/react-spectrum/packages/@react-stately/disclosure/src`
- Local package path:
  - `packages/@vue-aria/disclosure`
  - `packages/@vue-aria/disclosure-state`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useDisclosure`
  - `useDisclosureState`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path aliases
- Open adaptation note:
  - `flushSync`/animation behavior is adapted to Vue lifecycle primitives and simplified style transitions.

### Tests
- Total upstream test files: 1 in `@react-aria/disclosure` + no dedicated `useDisclosureState` test file in reference path
- Ported test files: 2
- Passing test files: 2 (validated 2026-02-13)
- Test parity notes:
  - Added adapted tests for expanded/collapsed aria mapping, press semantics, disabled behavior, id wiring, and `beforematch` handling.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/disclosure.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate disclosure behavior in downstream Spectrum accordion/disclosure integrations

### Visual Parity
- Not applicable for hook/state package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Port downstream Spectrum disclosure/accordion components.
2. Revisit transition animation parity for panel open/close behavior.

## 27) Package Record: @vue-aria/overlays
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/overlays/src`
  - `references/react-spectrum/packages/@react-aria/overlays/test`
- Local package path:
  - `packages/@vue-aria/overlays`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useOverlay`
  - `useOverlayTrigger`
  - `useOverlayPosition`
  - `usePreventScroll`
  - `useModal`
  - `useModalOverlay`
  - `usePopover`
  - `ariaHideOutside`
  - `Overlay`
  - `DismissButton`
  - `UNSAFE_PortalProvider`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable/component modules
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Large upstream framework-agnostic internals (`calculatePosition`, `usePreventScroll`, `ariaHideOutside`) are ported with temporary `@ts-nocheck` to prioritize behavioral progress under strict TS constraints.

### Tests
- Total upstream test files: 11
- Ported test files: 11
- Passing test files: 11 (validated 2026-02-13)
- Test parity notes:
  - Current adapted coverage includes outside-dismiss behavior, scroll-lock behavior, `ariaHideOutside` hide/restore behavior, overlay-trigger semantics/compatibility behavior, `DismissButton`/`useModal`/`useModalOverlay`/`usePopover` behavior, core `calculatePosition` math/flip/arrow boundary behavior, and `useOverlayPosition` baseline positioning and close-on-scroll behavior.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/overlays.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full modal/popover stack against downstream Spectrum components

### Visual Parity
- Not applicable for hook/state package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Port remaining upstream overlay tests (`useModal`, `useModalOverlay`, `useOverlayPosition`, `usePopover`, `DismissButton`, SSR).
2. Remove temporary `@ts-nocheck` by tightening copied internal typings.

## 28) Package Record: @vue-aria/listbox
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/listbox/src`
  - `references/react-spectrum/packages/@react-aria/listbox/docs`
- Local package path:
  - `packages/@vue-aria/listbox`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `useListBox`
  - `useOption`
  - `useListBoxSection`
  - `getItemId`
  - `listData`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Upstream package has no dedicated unit-test folder; adapted tests were added for hook intent/behavior parity.

### Tests
- Total upstream test files: 0 dedicated unit tests in package
- Ported test files: 5 (adapted)
- Passing test files: 5 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for listbox role/multiselect props, option aria metadata/id wiring (including virtualized metadata), section group/heading semantics, item id utility derivation, Safari VoiceOver aria mapping behavior, and hover-focus interaction gating.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/listbox.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate listbox keyboard and selection interactions against downstream Spectrum listbox/select components

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Validate listbox/list-state behavior in downstream Spectrum listbox/select integrations.
2. Expand docs toward upstream example parity depth (states, sections, disabled and action-link variants).

## 29) Package Record: @vue-aria/list-state
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-stately/list/src`
  - `references/react-spectrum/packages/@react-stately/list/docs`
- Local package path:
  - `packages/@vue-aria/list-state`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream API:
  - `ListCollection`
  - `useListState`
  - `UNSTABLE_useFilteredListState`
  - `useSingleSelectListState`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - state modules
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Collection-building hooks from upstream stately collections are not fully mirrored yet; plain-item `items` support with `getKey`/`getTextValue` extractors is now supported, but JSX/children-driven collection construction parity remains.

### Tests
- Total upstream test files: 0 dedicated unit tests in package path
- Ported test files: 3 (adapted)
- Passing test files: 3 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for key traversal/indexing in `ListCollection` (including `at(index)`), baseline `useListState` selection manager wiring, plain-item collection building with extractor functions, and `useSingleSelectListState` selected-key/item behavior.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/list-state.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate list-state behavior through downstream listbox/select widgets

### Visual Parity
- Not applicable for state package.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Add full collection-builder parity to support upstream children-driven collection construction (beyond current plain-item extractor support).
2. Expand list-state docs parity with sectioned collections and filtering walkthroughs.

## 30) Package Record: @vue-aria/menu
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/menu/src`
  - `references/react-spectrum/packages/@react-aria/menu/docs`
- Local package path:
  - `packages/@vue-aria/menu`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [ ] Public API checklist complete for full package surface

### Implementation
- [x] Ported upstream API slice:
  - `useMenu`
  - `useMenuItem`
  - `useMenuSection`
  - `menuData`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - `useMenuTrigger`, `useSubmenuTrigger`, and submenu movement safety hooks are still pending.

### Tests
- Total upstream test files: no dedicated package-local unit test folder
- Ported test files: 3 (adapted)
- Passing test files: 3 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for menu role wiring, Escape key handling with virtual-focus exception, accessibility label warning behavior, section heading/group semantics, menu item role derivation by selection mode, and close/action behavior.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/menu.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full keyboard/press/hover parity details for `useMenuItem` against upstream edge cases
- [ ] Validate submenu keyboard and hover behavior once trigger/submenu hooks are ported

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Port `useMenuTrigger` and `useSubmenuTrigger` stacks, including submenu movement safety behavior.
2. Deepen `useMenuItem` parity tests for keyboard-triggered click paths, trigger-item behavior, and virtualized aria metadata.

## 31) Session Log
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
- Ported `@vue-aria/interactions` move utility core slice:
  - `useMove`
  - `textSelection` helpers
- Added adapted tests for keyboard-move semantics, drag delta events, and right-click ignore behavior.
- Validation: `npm run check` passed, `npm test` passed (47 files, 130 tests).
- Ported `@vue-aria/interactions/usePress` with upstream-aligned API surface and pointer/keyboard/mouse fallback behavior.
- Added adapted `usePress` tests from upstream intent and wired interactions exports.
- Validation: `npm run check` passed, `npm test` passed (48 files, 135 tests).
- Ported `@vue-aria/interactions/useLongPress` with `usePress` composition, threshold handling, context-menu suppression, and accessibility description wiring.
- Added adapted `useLongPress` tests from upstream intent and exported public long-press types/APIs.
- Validation: `npm run check` passed, `npm test` passed (49 files, 142 tests).
- Ported `@vue-aria/interactions` press responder context layer (`PressResponder`, `ClearPressResponder`, `PressResponderContext`) and wired `usePress` context merge behavior.
- Added adapted `PressResponder` tests for registration warning and pressable-child detection behavior.
- Validation: `npm run check` passed, `npm test` passed (50 files, 144 tests).
- Ported `@vue-aria/interactions` focusable/pressable surface (`useFocusable`, `FocusableProvider`, `Focusable`, `FocusableContext`, `Pressable`) with Vue slot/cloneVNode adaptation.
- Added adapted tests for `useFocusable` and `Pressable` baseline parity paths.
- Validation: `npm run check` passed, `npm test` passed (52 files, 148 tests).
- Added VitePress docs page for `@vue-aria/interactions` and wired docs nav/sidebar entry.
- Ported `@vue-aria/focus` `useFocusRing` and `FocusRing` with Vue-adapted behavior and merged focus props.
- Added focus package compatibility exports to match upstream index expectations.
- Validation: `npm run check` passed, `npm test` passed (53 files, 150 tests).
- Ported `@vue-aria/focus/useHasTabbableChild` with sync tabbable detection and mutation-observer parity hook-up.
- Added adapted tests for `useHasTabbableChild` behavior.
- Validation: `npm run check` passed, `npm test` passed (54 files, 152 tests).
- Added `FocusScope` component API exports (`FocusScope`, `useFocusManager`, `isElementInChildOfActiveScope`) with a Vue container-based adaptation on top of current focus-manager utilities.
- Added adapted `FocusScope` API tests and revalidated focus package slice.
- Validation: `npm run check` passed, `npm test` passed (55 files, 154 tests).
- Added VitePress docs page for `@vue-aria/focus` and wired docs navigation entries.
- Started `@vue-aria/live-announcer` package:
  - `announce`
  - `clearAnnouncer`
  - `destroyAnnouncer`
  - package scaffolding and tsconfig alias wiring
- Added adapted live announcer tests for assertive/polite messages, labelled payloads, clear behavior, and destroy behavior.
- Added VitePress docs page for `@vue-aria/live-announcer` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (56 files, 159 tests).
- Started `@vue-aria/visually-hidden` package:
  - `useVisuallyHidden`
  - `VisuallyHidden`
  - package scaffolding and tsconfig alias wiring
- Added adapted visually-hidden tests from upstream intent for hidden and focus-reveal behavior.
- Updated `useFocusWithin` to include bubbling `focusin/focusout` handlers for Vue DOM parity in child-focus flows.
- Added VitePress docs page for `@vue-aria/visually-hidden` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (57 files, 161 tests).
- Started `@vue-aria/label` package:
  - `useLabel`
  - `useField`
  - package scaffolding and tsconfig alias wiring
- Added adapted `@react-aria/label` test coverage for label/field behavior, warning semantics, and described-by wiring.
- Added VitePress docs page for `@vue-aria/label` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (59 files, 169 tests).
- Started `@vue-aria/button` package:
  - `useButton`
  - `useToggleButton`
  - package scaffolding and tsconfig alias wiring
- Added adapted `useButton` upstream test coverage and resolved scope warnings by running hooks in Vue effect scopes.
- Added VitePress docs page for `@vue-aria/button` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (60 files, 175 tests).
- Started `@vue-aria/link` package:
  - `useLink`
  - package scaffolding and tsconfig alias wiring
- Added adapted `@react-aria/link` test coverage for default/custom/disabled link behavior.
- Added VitePress docs page for `@vue-aria/link` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (61 files, 178 tests).
- Started `@vue-aria/toggle` package:
  - `useToggle`
  - package scaffolding and tsconfig alias wiring
- Added adapted toggle tests for base props, a11y warning behavior, and selection updates from change events.
- Added VitePress docs page for `@vue-aria/toggle` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (62 files, 181 tests).
- Started checkbox package slice:
  - `@vue-aria/checkbox-state/useCheckboxGroupState`
  - `@vue-aria/checkbox/useCheckbox`
  - `@vue-aria/checkbox/useCheckboxGroup`
  - `@vue-aria/checkbox/useCheckboxGroupItem`
- Added adapted checkbox/checkbox-state tests covering defaults, name/label wiring, disabled/readonly handling, and required-group validation reactivity.
- Added VitePress docs page for `@vue-aria/checkbox` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (65 files, 195 tests).
- Started radio package slice:
  - `@vue-aria/radio-state/useRadioGroupState`
  - `@vue-aria/radio/useRadio`
  - `@vue-aria/radio/useRadioGroup`
- Added adapted radio/radio-state tests for selection updates, tab-index behavior, arrow-key group navigation, and required/read-only/disabled semantics.
- Added VitePress docs page for `@vue-aria/radio` and wired docs navigation entries.
- Hardened `useLocale` fallback for composable usage outside component setup to avoid inject warnings in parity tests.
- Validation: `npm run check` passed, `npm test` passed (67 files, 203 tests).
- Started `@vue-aria/switch` package:
  - `useSwitch`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted switch tests for role/checked semantics and disabled/read-only passthrough behavior.
- Added VitePress docs page for `@vue-aria/switch` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (68 files, 205 tests).
- Started `@vue-aria/textfield` package:
  - `useTextField`
  - `useFormattedTextField`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted upstream `useTextField` test coverage for prop mapping, change behavior, and textarea-specific attribute omission semantics.
- Added VitePress docs page for `@vue-aria/textfield` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (69 files, 214 tests).
- Started `@vue-aria/searchfield` and `@vue-aria/searchfield-state` packages:
  - `useSearchField`
  - `useSearchFieldState`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted searchfield tests for submit/clear keyboard behavior, clear-button semantics, and searchfield-state value management.
- Added VitePress docs page for `@vue-aria/searchfield` and wired docs navigation entries.
- Hardened `createEventHandler` to preserve native event fields (e.g. keyboard `key`) while retaining `continuePropagation` semantics for interaction parity.
- Validation: `npm run check` passed, `npm test` passed (71 files, 221 tests).
- Started `@vue-aria/progress` package:
  - `useProgressBar`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted upstream progress tests for defaults, labeling, determinate/indeterminate behavior, and custom value labels.
- Added VitePress docs page for `@vue-aria/progress` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (72 files, 226 tests).
- Started `@vue-aria/meter` package:
  - `useMeter`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted meter tests for role fallback and aria value forwarding behavior.
- Added VitePress docs page for `@vue-aria/meter` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (73 files, 228 tests).
- Started `@vue-aria/dialog` package:
  - `useDialog`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted dialog tests for role behavior and focus management semantics.
- Added VitePress docs page for `@vue-aria/dialog` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (74 files, 232 tests).
- Started `@vue-aria/breadcrumbs` package:
  - `useBreadcrumbs`
  - `useBreadcrumbItem`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted breadcrumbs tests for nav label defaults/overrides and item current/disabled/link semantics.
- Added VitePress docs page for `@vue-aria/breadcrumbs` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (76 files, 238 tests).
- Started `@vue-aria/separator` package:
  - `useSeparator`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted separator tests for orientation and role behavior.
- Added VitePress docs page for `@vue-aria/separator` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (77 files, 241 tests).
- Started tooltip state/trigger stack:
  - `@vue-aria/overlays-state/useOverlayTriggerState`
  - `@vue-aria/tooltip-state/useTooltipTriggerState`
  - `@vue-aria/tooltip/useTooltip`
  - `@vue-aria/tooltip/useTooltipTrigger`
- Added adapted tests for tooltip role/trigger semantics and stately delay behavior.
- Added VitePress docs page for `@vue-aria/tooltip` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (80 files, 248 tests).
- Started disclosure state/trigger stack:
  - `@vue-aria/disclosure-state/useDisclosureState`
  - `@vue-aria/disclosure/useDisclosure`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted tests for disclosure aria attributes, press semantics, id wiring, and beforematch behavior.
- Added VitePress docs page for `@vue-aria/disclosure` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (82 files, 256 tests).
- Started `@vue-aria/overlays` package:
  - `useOverlay`, `useOverlayTrigger`, `useOverlayPosition`, `usePreventScroll`
  - `useModal`, `useModalOverlay`, `usePopover`
  - `ariaHideOutside`, `Overlay`, `DismissButton`, `UNSAFE_PortalProvider`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted overlays tests for outside-dismiss behavior, scroll-lock behavior, `ariaHideOutside`, and trigger close-on-scroll compatibility.
- Added VitePress docs page for `@vue-aria/overlays` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (86 files, 262 tests).
- Expanded overlays test parity with adapted upstream-style tests for:
  - `DismissButton` aria labeling behavior
  - `useModal` provider aria-hidden behavior while modal is open
  - `usePopover` scroll behavior (does not close on scroll)
- Validation: `npm run check` passed, `npm test` passed (89 files, 267 tests).
- Added adapted `useModalOverlay` outside-interaction tests for `shouldCloseOnInteractOutside` true/false behavior.
- Validation: `npm run check` passed, `npm test` passed (90 files, 269 tests).
- Expanded `useOverlayTrigger` test coverage for `aria-haspopup` semantics and open-state `aria-expanded`/`aria-controls` wiring.
- Validation: `npm run check` passed, `npm test` passed (90 files, 271 tests).
- Expanded `usePreventScroll` test coverage with a disabled-path case.
- Validation: `npm run check` passed, `npm test` passed (90 files, 272 tests).
- Added adapted `calculatePosition` parity tests for baseline placement math, flip behavior, and arrow boundary constraints.
- Validation: `npm run check` passed, `npm test` passed (91 files, 276 tests).
- Added adapted `useOverlayPosition` tests for baseline computed placement/style output and close-on-scroll behavior when `onClose` is provided.
- Validation: `npm run check` passed, `npm test` passed (92 files, 278 tests).
- Expanded overlays tests with:
  - `useOverlay` top-most-overlay dismissal behavior
  - `useModal` error behavior outside provider
- Validation: `npm run check` passed, `npm test` passed (92 files, 280 tests).
- Added `useModal.ssr` adapted test coverage for `OverlayContainer`/`OverlayProvider` server rendering path.
- Validation: `npm run check` passed, `npm test` passed (93 files, 281 tests).
- Started `@vue-aria/listbox` package:
  - `useListBox`, `useOption`, `useListBoxSection`
  - `getItemId`, `listData`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted listbox tests for listbox role/multiselect behavior, option virtualized aria metadata/id wiring, and section semantics.
- Added VitePress docs page for `@vue-aria/listbox` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (96 files, 284 tests).
- Started `@vue-aria/list-state` package:
  - `ListCollection`, `useListState`, `UNSTABLE_useFilteredListState`, `useSingleSelectListState`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted list-state tests for collection traversal/indexing, list-state selection manager wiring, and single-select selected-key/item behavior.
- Added VitePress docs page for `@vue-aria/list-state` and wired docs navigation entries.
- Updated `@vue-aria/listbox` types to consume `@vue-aria/list-state` `ListState` typing.
- Validation: `npm run check` passed, `npm test` passed (99 files, 287 tests).
- Expanded `@vue-aria/listbox/useListBox` tests for upstream linkBehavior derivation rules:
  - `selectionBehavior='replace'` defaults `linkBehavior` to `action`
  - `selectionBehavior='toggle'` + `linkBehavior='action'` coerces to `override`
- Validation: `npm run check` passed, `npm test` passed (99 files, 289 tests).
- Expanded `@vue-aria/list-state` tests with:
  - `UNSTABLE_useFilteredListState` collection filtering behavior
  - duplicate same-key `onSelectionChange` callback semantics in `useSingleSelectListState`
- Validation: `npm run check` passed, `npm test` passed (99 files, 291 tests).
- Added `@vue-aria/listbox` utility parity tests for:
  - `getItemId` unknown-list error semantics
  - key normalization behavior in generated option ids
- Validation: `npm run check` passed, `npm test` passed (100 files, 293 tests).
- Added adapted Safari/macOS VoiceOver branch coverage for `@vue-aria/listbox/useOption` ensuring aria label slot mappings are omitted under WebKit/macOS conditions.
- Validation: `npm run check` passed, `npm test` passed (101 files, 294 tests).
- Added `@vue-aria/list-state/ListCollection.at(index)` API parity and adapted test coverage.
- Added adapted `@vue-aria/listbox/useOption` hover-focus parity coverage:
  - focuses option on hover when `shouldFocusOnHover` is enabled and modality is pointer
  - does not force focus on hover when focus is keyboard-visible
  - keeps hover-focus behavior disabled when `shouldFocusOnHover` is false
- Validation: `npm run check` passed, `npm test` passed (101 files, 297 tests).
- Expanded `@vue-aria/list-state` collection-building adaptation:
  - `useListState` now accepts plain-item `items` in addition to prebuilt `Node` collections
  - added `getKey` and `getTextValue` extractors for key/text parity mapping
  - preserved existing `collection` override behavior
- Added adapted tests for plain-item list-state and single-select state construction with extractors.
- Validation: `npm run check` passed, `npm test` passed (101 files, 299 tests).
- Updated docs examples so `@vue-aria/listbox` and `@vue-aria/list-state` are demonstrated together using state constructors and plain-item extractor support.
- Validation: `npm run check` passed, `npm test` passed (101 files, 299 tests).
- Started `@vue-aria/menu` package:
  - `useMenu`
  - `useMenuSection`
  - `menuData`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted menu tests for role/escape-key semantics, accessibility warning behavior, and section heading/group semantics.
- Added VitePress docs page for `@vue-aria/menu` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (103 files, 303 tests).
- Expanded `@vue-aria/menu` with `useMenuItem`:
  - implemented menu item role derivation for `menuitem` / `menuitemradio` / `menuitemcheckbox`
  - implemented local/shared action dispatch and default close-on-select behavior
  - wired press/hover/keyboard/focus props via existing interaction hooks
- Added adapted `useMenuItem` tests for role derivation and action/close semantics.
- Validation: `npm run check` passed, `npm test` passed (104 files, 305 tests).
