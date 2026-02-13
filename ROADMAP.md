# Vue Aria / Vue Spectrum Roadmap

Last updated: 2026-02-13
Source of truth: `/Users/piou/Dev/vue-aria/PLAN.md`

## 1) Program Status
- Overall status: In progress
- Current phase: Foundation bootstrap + first package
- Current focus package: `@vue-aria/numberfield`
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
- `@vue-aria/form`: In progress
- `@vue-aria/spinbutton`: In progress
- `@vue-aria/numberfield`: In progress
- `@vue-aria/slider`: Not started
- `@vue-aria/link`: In progress
- `@vue-aria/menu`: In progress
- `@vue-aria/listbox`: In progress
- `@vue-aria/select`: In progress
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
- `@vue-aria/form-state`: In progress
- `@vue-aria/numberfield-state`: In progress
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
- Ported test files: 21
- Passing test files: 21
- Test parity notes:
  - Added adapted upstream coverage for `domHelpers` and `mergeRefs`.
  - Added adapted upstream coverage for `runAfterTransition`.
  - Added adapted coverage for `useObjectRef`.
  - Added adapted upstream coverage for `shadowTreeWalker` traversal parity (non-shadow and root-shadow scenarios).
  - Added adapted upstream coverage for `useViewportSize` SSR behavior (`0x0` pre-hydration contract and SSR render safety).
  - Added adapted upstream coverage for `shadowTreeWalker` multi-shadow traversal (peer and nested shadow hosts).
  - Added adapted router/openLink parity coverage (`openLink.isOpening`, synthetic href mapping, and deprecated `getSyntheticLinkProps` behavior).
  - Added adapted animation parity coverage for `useEnterAnimation`/`useExitAnimation` (completion and interrupted-exit flows).
  - Added adapted `openLink` browser-branch coverage for:
    - Firefox keyboard-triggered `_blank` handling (ctrl/meta modifier synthesis)
    - WebKit keyboard event synthesis path (`keyIdentifier`) under non-test runtime mode
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
- `inertValue` is Vue-native simplified and needs explicit parity decision per API surface.
- `useId`/`mergeIds` behavior is currently simplified vs upstream reactive id reconciliation semantics and needs deeper parity hardening.
- `useSlotId` is currently a simplified Vue adaptation and needs parity hardening around deferred DOM-resolution timing.
- API name parity is complete, but behavior parity still needs deepening for complex hooks (`animation`, `drag`, viewport lifecycle timing, and advanced id reconciliation semantics).

### Next Actions
1. Build explicit upstream export-to-local mapping for `@react-aria/utils`.
2. Port missing upstream utilities (`mergeRefs`, `useId` semantics, shadow DOM helpers, etc.).
3. Convert upstream tests file-by-file with assertion parity notes.
4. Scaffold docs pages for `@vue-aria/utils` usage and parity notes.
5. Mark completion only after all package gates pass.

## 5a) Package Record: @vue-aria/ssr
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/ssr/src`
  - `references/react-spectrum/packages/@react-aria/ssr/test`
- Local package path: `packages/@vue-aria/ssr`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream APIs:
  - `SSRProvider`
  - `useSSRSafeId`
  - `useIsSSR`
  - `useId`
  - `useIdString`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/SSRProvider.ts`
  - `tsconfig.json` path alias
- Remaining:
  - Reconcile edge-case parity with upstream React 18/StrictMode-specific behavior where applicable in Vue.
  - Verify SSR hydration transition parity for `useIsSSR` in downstream integration contexts.

### Tests
- Total upstream test files: 2 (`SSRProvider.test.js`, `SSRProvider.ssr.test.js`)
- Ported test files: 2
- Passing test files: 2
- Test parity notes:
  - Added adapted tests for deterministic IDs in provider and nested-provider trees.
  - Added adapted tests for environment-dependent no-provider ID prefix behavior:
    - production mode uses random-prefix format
    - test mode uses deterministic `react-aria-<n>` format
  - Added adapted SSR render tests covering:
    - base provider rendering
    - nested provider rendering
    - deep nested provider rendering
  - Added adapted server-render state test for `useIsSSR` returning SSR state during server rendering.
- [x] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/ssr.md`)
- [ ] Examples parity complete

### Accessibility
- Not applicable as non-visual infrastructure package.

### Visual Parity
- Not applicable.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Verify `useIsSSR` hydration transition behavior in integration tests.
2. Expand docs examples with end-to-end Vue SSR + hydration usage.

## 5b) Package Record: @vue-aria/i18n
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/i18n/src`
  - `references/react-spectrum/packages/@react-aria/i18n/test`
- Local package path: `packages/@vue-aria/i18n`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [x] Public API checklist complete for current package surface

### Implementation
- [x] Ported upstream APIs:
  - `I18nProvider` / `useLocale`
  - `useDefaultLocale`
  - `useMessageFormatter`
  - `useLocalizedStringFormatter` / `useLocalizedStringDictionary`
  - `useDateFormatter`
  - `useNumberFormatter`
  - `useListFormatter`
  - `useCollator`
  - `useFilter`
  - `isRTL`
  - `getPackageLocalizationScript`
- [x] Aligned provider structure with upstream split behavior:
  - `I18nProviderWithLocale`
  - `I18nProviderWithDefaultLocale`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `tsconfig.json` path alias
- Remaining:
  - Validate hydration-transition semantics for locale hooks in downstream integration paths.
  - Deepen parity review for formatter caching and SSR/client transition timing.

### Tests
- Total upstream test files: 2 (`languagechange.test.js`, `server.test.js`)
- Ported test files: 3
- Passing test files: 3
- Test parity notes:
  - Ported/adapted upstream language-change listener coverage.
  - Added adapted language direction transition coverage (LTR <-> RTL updates).
  - Ported/adapted upstream server rendering utility coverage.
  - Added adapted formatter reactivity coverage for locale/provider updates.
- [x] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/i18n.md`)
- [ ] Examples parity complete

### Accessibility
- Not applicable as infrastructure package; behavior validated through downstream consumers.

### Visual Parity
- Not applicable.

### React Dependency Check
- [x] No React runtime dependency

### Next Actions
1. Expand docs examples with end-to-end provider and dictionary usage mirroring upstream docs.
2. Add integration checks for locale transition behavior in consumer packages.

## 6) Package Record: @vue-aria/selection
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/selection/src`
  - `references/react-spectrum/packages/@react-aria/selection/test`
- Local package path: `packages/@vue-aria/selection`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules for initial slice enumerated
- [x] Public API checklist complete for current upstream module surface

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
  - Deepen `useSelectableCollection` parity for virtualization/scroll lifecycle nuances.
  - Validate remaining pointer down/up integration details against downstream listbox/story harnesses.

### Tests
- Total upstream test files: 1
- Ported test files: 6
- Passing test files: 6
- Test parity notes:
  - Added adapted tests for keyboard delegate navigation/search behavior.
  - Added adapted tests for typeahead buffer, focus movement, and debounce reset.
  - Added adapted `useSelectableCollection` interaction coverage for:
    - Escape clear-selection behavior and disabled clear branch
    - Home/End range-extension behavior with ctrl+shift modifiers
    - focus-entry strategy selecting the last selected key when entering from a following element
    - Tab focus handoff to last tabbable item when tab navigation is disabled
    - blur leave behavior clearing collection focus state
    - scroll-container mousedown prevention behavior
    - PageUp/PageDown keyboard navigation behavior with selection updates
    - already-focused `onFocus` outside-target clearing behavior
    - focus-entry selecting `firstSelectedKey` when entering from a preceding element
    - `disallowSelectAll` guard behavior for ctrl/cmd + a
    - Alt+Tab keyboard-prevention behavior
    - ArrowLeft/ArrowRight wrap behavior in LTR with child-focus strategy propagation
    - link item keyboard navigation behavior for `linkBehavior: "selection"` and `linkBehavior: "override"`
    - autoFocus selected-key prioritization (`canSelectItem` filtering)
    - blur no-op when related target remains within collection
    - focus-entry direction behavior without mutating selection state
    - focused-item DOM focus + `scrollIntoView` behavior gated by interaction modality
    - virtual-focus mode preserving active element during collection focus handling
    - virtual first-focus strategy deferred across empty-to-loaded collection transitions
    - autoFocus retry behavior for initially empty collections resolving after data load
    - autoFocus-driven focused item scroll behavior independent of current interaction modality
    - Home/End delegate lookup context passing (`focusedKey`, ctrl-global flag)
  - Added adapted `useSelectableItem` interaction coverage for:
    - link behaviors (`selection`, `override`, `none`) with correct action vs selection outcomes
    - keyboard Enter/Space selection behavior and secondary action routing
    - disabled focused-item branches (`setFocusedKey(null)` and mousedown default prevention)
    - multi-item touch/virtual pointer toggle semantics in `selectionBehavior: "replace"`
    - virtual-focus focus handoff (`moveVirtualFocus`) for focused items
    - virtual-focus press handling that updates selection-manager focus state and prevents native mousedown focus transfer
    - `shouldSelectOnPressUp` behavior for click-phase selection
    - `allowsDifferentPressOrigin` behavior selecting on mouseup when press-up selection is enabled
    - collection metadata wiring (`data-key`, `data-collection`) and explicit `id` forwarding
    - native link-click prevention for actionable link items (router-controlled navigation)
    - open-link guard parity to avoid preventing default during active `openLink` dispatch cycles
    - `UNSTABLE_itemBehavior: "action"` branch forcing action-first behavior without selection mutations
    - collection-provided handler chaining (`onFocus`, `onMousedown`, `onMouseup`, `onClick`, `onDoubleClick`, `onKeydown`)
    - secondary-action double-click behavior gated by interaction pointer modality
    - touch long-press behavior for action+selection items switching selection behavior to `toggle`
    - drag-start suppression after touch interaction when long-press selection behavior is active
  - Remaining upstream `useSelectableCollection` pointer down/up integration harness details are tracked for full listbox/story parity migration.
- [ ] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/selection.md`)
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
1. Deepen `useSelectableCollection` virtualization/scroll lifecycle parity paths.
2. Port remaining press-responder lifecycle edge paths in `useSelectableItem` (pointer/keyboard integration details).
3. Migrate remaining upstream `useSelectableCollection` DOM interaction intent with expanded harness coverage.
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
- [x] Public API checklist complete (all current upstream module exports mapped)

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
  - No known runtime API gaps in current upstream module surface.
  - Continue validating behavior parity through downstream consumer integration.

### Tests
- Total upstream test files: 13
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
  - Added adapted `useScrollWheel` coverage not present as a dedicated upstream file, preserving API intent in Vue harnesses.
- [x] All relevant upstream tests migrated
- [x] Current migrated tests passing

### Docs
- [x] VitePress package page scaffolded (`docs/packages/focus.md`)
- [ ] Examples parity complete (expanded with containment and restore-event examples; full story parity pending)
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
1. Validate interaction-modality behavior across downstream Spectrum components under pointer/keyboard/virtual navigation paths.
2. Expand interactions docs examples toward upstream story parity depth.
3. Close package completion gates after downstream integration and docs parity checks are satisfied.

## 8) Package Record: @vue-aria/focus
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/focus/src`
  - `references/react-spectrum/packages/@react-aria/focus/test`
- Local package path: `packages/@vue-aria/focus`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules for initial prerequisite slice enumerated
- [x] Public API checklist complete (all current upstream module exports mapped)

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
  - Continue validating behavior parity details where Vue test adapters differ from upstream harness behavior.

### Tests
- Total upstream test files: 2 (`FocusScope.test.js`, `FocusScopeOwnerDocument.test.js`)
- Ported test files: 7
- Passing test files: 7
- Test parity notes:
  - Added adapted tests for virtual focus event dispatch/focus movement and focusable walker traversal.
  - Added adapted tests for `useFocusRing` focus/focus-visible state transitions and `within` handler path.
  - Added adapted tests for `useHasTabbableChild` initial tabbable detection and disabled behavior.
  - Added adapted tests for `FocusScope` API exports (`useFocusManager`, `isElementInChildOfActiveScope`).
  - Added adapted behavior tests for `FocusScope`:
    - `autoFocus` first-focusable behavior
    - `autoFocus` first-tabbable behavior (non-tabbable focusable nodes skipped)
    - `autoFocus` no-op when focus is already inside the scope
    - `restoreFocus` restoration to previously focused node on unmount
    - `restoreFocus` behavior when child focus changes during mount
    - `useFocusManager` next/previous traversal with wrap
    - `useFocusManager` `focusLast` traversal behavior
    - `useFocusManager` accept-filter traversal behavior
    - baseline containment wrap behavior on Tab/Shift+Tab when `contain` is enabled
    - containment traversal through nested descendants
    - containment traversal through tabbable `contenteditable` descendants
    - containment skipping hidden/non-tabbable descendants
    - active-scope enforcement across multiple contained scopes
    - nested-scope containment lock (active child scope owns tab loop)
    - modifier-key containment no-op behavior (`Alt+Tab` does not wrap focus)
    - restore-focus cancellation via `react-aria-focus-scope-restore`
    - nested restore-focus event propagation isolation
    - containment traversal skips non-selected radios in same group
    - teleported child-scope containment behavior (`contain` and non-`contain`)
    - nested non-containing child-scope traversal behavior
    - nested contained-scope unmount restoration behavior
    - DOM-order navigation behavior for scope child of `document.body`
    - shadow-root containment traversal (single and nested shadow roots)
    - shadow-root restore-focus behavior with outer restore scope
    - cleanup/timer leak guard behavior
    - restore-focus outside-active-element skip behavior
    - contained removal fallback to first focusable element behavior
    - restore-tab boundary handoff behavior relative to previously focused node (forward/reverse)
    - restore-tab non-interception behavior when `restoreFocus` is disabled
    - dynamic-children restore-focus stability behavior
    - iframe-like null-`relatedTarget` blur transition behavior
    - node-to-restore tracking when an intermediate restore target is removed in another subtree
    - sibling contained-scope traversal isolation and active-scope lock behavior
    - contained-scope restoration to last focused element across blur/focusout/outside-focus transitions
  - Added adapted focus-manager parity tests for `FocusScope`:
    - forward/backward traversal with and without wrap
    - tabbable-only traversal behavior
    - `from` container traversal semantics (forward and backward)
    - accept-filter traversal skipping behavior
- Upstream `FocusScope` + `FocusScopeOwnerDocument` assertions are adapted; continue validating downstream integration paths.
- [x] All relevant upstream tests migrated
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
1. Validate `FocusScope` behavior through downstream consumers (`@vue-aria/overlays`, `@vue-aria/select`, and dialog/popover flows).
2. Reconcile any remaining implementation gaps discovered during downstream integration.
3. Expand docs/example parity for focus package APIs (`FocusScope`, `useFocusManager`, `useFocusRing`, `FocusRing`).
4. Keep `docs/packages/focus.md` notes synchronized as downstream parity work lands.

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
- [x] All relevant upstream tests migrated
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
- [x] Public API checklist complete (all current upstream module exports mapped)

### Implementation
- [x] Ported upstream APIs:
  - `useButton`
  - `useToggleButton`
  - `useToggleButtonGroup`
  - `useToggleButtonGroupItem`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useButton.ts`
  - `src/useToggleButton.ts`
  - `src/useToggleButtonGroup.ts`
  - `tsconfig.json` path alias
- Remaining:
  - Reconcile any behavior deltas once downstream button components are integrated.

### Tests
- Total upstream test files: 1
- Ported test files: 2
- Passing test files: 2
- Test parity notes:
  - Added adapted `useButton` tests for defaults, non-button element behavior, disabled behavior, rel passthrough, input handling, and aria-disabled passthrough.
  - Added adapted tests for `useToggleButtonGroup` and `useToggleButtonGroupItem` parity:
    - `radiogroup` role mapping for single selection mode
    - arrow-key and tab focus management semantics for toolbar mode
    - single-selection radio semantics (`role="radio"`, `aria-checked`, no `aria-pressed`)
    - disabled inheritance from group state
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
1. Wire and validate consumers (`@vue-spectrum/button` and related controls).
2. Reconcile any integration deltas in press/focus semantics once consumers land.
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
- [x] Public API checklist complete (all current upstream module exports mapped)

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
- Ported test files: 2
- Passing test files: 2
- Test parity notes:
  - Added adapted `useLink` tests for defaults, custom element type behavior, and disabled behavior.
  - Added adapted router-integration coverage for:
    - client navigation routing through non-native routers on link click
    - default-prevented click guard behavior (no client navigation dispatch)
    - modified-key guard behavior (no client navigation dispatch when meta key is pressed)
    - cross-origin guard behavior (no client navigation dispatch for external origins)
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
1. Integrate and validate within downstream link/menu/breadcrumb components.

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
- [x] All relevant upstream tests migrated
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
- [x] Shared validation parity update:
  - `useCheckboxGroupState` now routes validation through `@vue-aria/form-state/useFormValidationState`.
  - Built-in required/item invalid state now emits `ValidityState` details compatible with shared form-state filtering/commit semantics.

### Tests
- Total upstream test files: 1 (`@react-aria/checkbox`) + state package behavior from source
- Ported test files: 3
- Passing test files: 3
- Test parity notes:
  - Adapted upstream checkbox group behavior checks for Vue composable usage.
  - Added checkbox-state tests for controlled selection and required-validation reactivity.
  - Added checkbox-state native validation commit-queue coverage (`validationBehavior='native'` + `updateValidation`/`commitValidation` flow).
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
1. Port remaining checkbox-edge assertions as downstream consumers are introduced.
2. Validate server-error context parity once checkbox-state exposes upstream-equivalent error-key wiring.

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
- [x] Shared validation parity update:
  - `useRadioGroupState` now routes validation through `@vue-aria/form-state/useFormValidationState`.
  - Built-in required state now emits `ValidityState` details compatible with shared form-state filtering/commit semantics.

### Tests
- Total upstream test files: none in `@react-aria/radio` reference package
- Ported test files: 2
- Passing test files: 2
- Test parity notes:
  - Added adapted parity tests for group role/ARIA wiring, selection state updates, tab index semantics, and keyboard arrow navigation.
  - Added radio-state tests for controlled selection, disabled/read-only guards, and required validation behavior.
  - Added radio-state native validation commit-queue coverage (`validationBehavior='native'` + `updateValidation`/`commitValidation` flow).
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
2. Validate server-error context parity once radio-state exposes upstream-equivalent error-key wiring.

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
- [x] Locale dictionary parity:
  - wired full upstream `@react-aria/searchfield/intl` bundle via `src/intlMessages.ts`

### Tests
- Total upstream test files: 1 (`useSearchField.test.js`)
- Ported test files: 2 (aria + stately)
- Passing test files: 2
- Test parity notes:
  - Added adapted tests for search input props, enter submit behavior, escape clear behavior, and clear-button semantics.
  - Added searchfield-state tests for controlled/uncontrolled value semantics and numeric coercion.
  - Added adapted locale-provider integration coverage for translated clear-search button labels (`fr-FR`).
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
2. Expand docs/examples toward full upstream searchfield story parity (clear-button variants and field compositions).

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
- [x] Locale dictionary parity:
  - wired full upstream `@react-aria/breadcrumbs/intl` bundle via `src/intlMessages.ts`

### Tests
- Total upstream test files: 2
- Ported test files: 2
- Passing test files: 2
- Test parity notes:
  - Added adapted coverage for breadcrumbs nav labeling and item states (current/disabled/span/link semantics).
  - Added adapted locale-provider integration coverage for translated default breadcrumbs nav labels (`fr-FR`).
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
2. Expand docs/examples toward full upstream breadcrumb story parity (disabled/current-link variations).

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
- [x] All relevant upstream tests migrated

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
  - Temporary `@ts-nocheck` debt for copied overlay internals has been removed (`calculatePosition`, `usePreventScroll`, and `ariaHideOutside` are now typed).

### Tests
- Total upstream test files: 11
- Ported test files: 11
- Passing test files: 11 (validated 2026-02-13)
- Test parity notes:
  - Current adapted coverage includes outside-dismiss behavior, scroll-lock behavior, `ariaHideOutside` hide/restore behavior, overlay-trigger semantics/compatibility behavior, `DismissButton`/`useModal`/`useModalOverlay`/`usePopover` behavior, core `calculatePosition` math/flip/arrow boundary behavior, and `useOverlayPosition` baseline positioning and close-on-scroll behavior.
- [x] All relevant upstream tests migrated

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
1. Validate overlays behavior in downstream Spectrum consumers (dialog/popover/menu/select stacks).
2. Reconcile any integration deltas in cross-browser viewport/scroll positioning paths.

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
  - Added adapted option integration coverage for pointer-press selection delegation and Enter-key action delegation in replace-selection behavior.
- [x] All relevant upstream tests migrated

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
  - `useMenuTrigger`
  - `useSubmenuTrigger`
  - `menuData`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable modules
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - `useSafelyMouseToSubmenu` now tracks interaction-modality transitions and includes jsdom-compatible pointerover fallback dispatch; remaining parity is focused on deeper submenu trigger integration cases.
  - `useMenuTrigger` long-press path now uses localized string formatter wiring with full upstream locale dictionary coverage from `@react-aria/menu/intl`.

### Tests
- Total upstream test files: no dedicated package-local unit test folder
- Ported test files: 5 (adapted)
- Passing test files: 5 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for menu role wiring, Escape key handling with virtual-focus exception, accessibility label warning behavior, section heading/group semantics, menu item role derivation by selection mode, close/action behavior, keyboard-triggered item activation close semantics (Enter/Space behavior by selection mode), menu trigger keyboard/menu-prop wiring semantics, menu trigger touch-press open behavior with disabled short-circuit, submenu trigger open/close interactions, submenu ArrowLeft close/focus behavior (LTR) and hover-delay cancellation behavior, safe-mouse hook lifecycle/reset behavior, safe-mouse touch/pen pointer-move ignore behavior, additional close/disabled/default-prevented keyboard-path semantics, submenu focusin/press-path behavior, menu-trigger open/closed aria-controls/expanded semantics, non-touch onPressStart open behavior with disabled short-circuit, and virtualized menu item `aria-posinset`/`aria-setsize` metadata across full item sets.
  - Added safe-mouse timeout fallback coverage for stalled movement paths:
    - pointer-events reset on interaction-modality changes (`pointer` -> `keyboard`)
    - delayed pointerover redispatch when safe-triangle movement stalls
  - Added menu-trigger long-press contract coverage:
    - localized long-press accessibility description wiring
    - `useLongPress` callback wiring for `onLongPressStart` (`close`) and `onLongPress` (`open("first")`)
    - disabled-state propagation to `useLongPress` options
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/menu.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full keyboard/press/hover parity details for `useMenuItem` against upstream edge cases
- [ ] Validate full safe-pointer movement and submenu hover retention behavior in downstream submenu integrations

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Deepen `useMenuItem` / `useMenuTrigger` / `useSubmenuTrigger` parity tests for long-press behavior in downstream integration harnesses (Spectrum-level `MenuTrigger` paths).
2. Validate safe-pointer retention and submenu auto-close behavior against downstream Spectrum submenu implementations/stories.

## 31) Package Record: @vue-aria/select
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/select/src`
  - `references/react-spectrum/packages/@react-aria/select/docs`
- Local package path:
  - `packages/@vue-aria/select`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [ ] Public API checklist complete for full package surface

### Implementation
- [x] Ported upstream API slice:
  - `useSelect`
  - `useHiddenSelect`
  - `HiddenSelect`
  - `selectData`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - composable/modules
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Uses adapter-based select state typing; `@vue-aria/form/useFormValidation` is now integrated for hidden-select validation wiring, and hidden-input fallback now consumes `selectData` defaults for `name`/`form`/`isDisabled`; remaining parity is focused on additional edge-case flows.

### Tests
- Total upstream test files: no dedicated package-local unit test folder
- Ported test files: 3 (adapted)
- Passing test files: 3 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for trigger/menu/hidden-select prop wiring, hidden-select single and multiple change handling, select arrow-key key selection behavior, focus/blur lifecycle callback behavior, and hidden-input fallback behavior for large collections/native validation.
  - Added parity coverage for hidden-select native-required behavior across multi-value hidden input fallback (only first native text input marked required).
  - Added parity coverage for no-op arrow-key selection behavior in multiple-selection mode and `currentTarget`-based hidden-select change handling.
  - Added adapted `HiddenSelect` render-path coverage for no-selected-key behavior across small/large collections and for initial `FormData` value consistency when collection items are initially empty.
  - Added adapted `useSelect` interaction coverage for label-click trigger focus and keyboard-modality setting (and disabled short-circuit path).
  - Added adapted hidden-input fallback parity coverage for native invalid-event handling (commit + trigger-focus path) when collection size exceeds native select threshold.
  - Added adapted keyboard parity coverage for no-selection arrow-key paths, asserting first-key fallback and default scroll prevention semantics.
  - Added adapted `HiddenSelect` behavioral parity coverage for small-collection native select change handling (autofill path) and container dataset attributes (`data-a11y-ignore` and `data-react-aria-prevent-focus`).
  - Added adapted `useSelect` focus lifecycle guard-path coverage for already-focused focus no-op and open-menu blur no-op branches.
  - Added adapted typeahead parity coverage for single-selection character-key selection behavior and multiple-selection typeahead suppression.
  - Added adapted `useHiddenSelect` input-event parity coverage ensuring `onInput` mirrors change-driven state updates.
  - Added adapted typeahead guard coverage ensuring an initial Space key does not trigger selection when no search string is active.
  - Added adapted `HiddenSelect` selectData-fallback parity coverage for `name` propagation in large-collection hidden-input rendering and empty-collection initial form submission behavior.
  - Added adapted `HiddenSelect` selectData-fallback coverage for `isDisabled` propagation when component `isDisabled` prop is omitted.
  - Added adapted `useHiddenSelect` form-reset integration coverage ensuring parent `form.reset()` restores `state.defaultValue`.
  - Added adapted `useHiddenSelect` native invalid guard coverage:
    - no focus transfer when an earlier form field is first-invalid
    - no focus transfer when invalid event is already default-prevented
    - first-invalid ordering re-evaluation after earlier field validity changes
  - Added adapted `useSelect` keyboard/focus parity coverage for:
    - arrow-key no-op selection path when delegate has no first key available (with preserved default prevention)
    - menu blur propagation when `relatedTarget` is `null`
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/select.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full hidden native select/input behavior against upstream browser/autofill/form integration semantics

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Port remaining hidden select parity behaviors around browser form validation integration (`@react-aria/form` path), including dynamic form mutation ordering scenarios.
2. Deepen `useSelect` behavior parity (focus/blur lifecycle edge cases and expanded keyboard/typeahead interactions).

## 32) Package Record: @vue-aria/form
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/form/src`
- Local package path:
  - `packages/@vue-aria/form`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [ ] Public API checklist complete for full package surface

### Implementation
- [x] Ported upstream API slice:
  - `useFormValidation`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Current hook now covers native validity wiring plus invalid/change/reset scheduling branches, first-invalid focus ordering, and keyboard-modality side effects; remaining parity is focused on deeper select integration flows.

### Tests
- Total upstream test files: no dedicated package-local unit test folder
- Ported test files: 1 (adapted)
- Passing test files: 1 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for native custom validity wiring, invalid-event commit behavior, form reset listener behavior, and programmatic reset ignore path.
  - Added adapted coverage for change-event commit behavior, invalid-event short-circuit when display state is already invalid, and native validity snapshot propagation when realtime validation is valid.
  - Added adapted focus-order behavior coverage for first-invalid-only focus and custom `focus` callback invocation.
  - Added adapted integration coverage through `@vue-aria/select/useHiddenSelect` for native invalid-event trigger focus and hidden-select focus forwarding.
  - Added adapted branch coverage for fallback native custom-validity messaging (`"Invalid value."`), disabled-input native validity sync short-circuit, and modality no-op when invalid events are already default-prevented.
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/form.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate browser-native invalid-focus behavior across form contexts and grouped inputs

### Visual Parity
- Not applicable for hook package.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Continue expanding native invalid integration coverage across additional form consumers.
2. Add broader consumer-path integration tests where hidden/native controls mediate invalid focus.

## 33) Package Record: @vue-aria/spinbutton
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/spinbutton/src`
  - `references/react-spectrum/packages/@react-aria/spinbutton/test/useSpinButton.test.js`
- Local package path:
  - `packages/@vue-aria/spinbutton`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [ ] Public API checklist complete for full package surface

### Implementation
- [x] Ported upstream API slice:
  - `useSpinButton`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useSpinButton.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Locale dictionary wiring now imports full upstream `@react-aria/spinbutton` intl bundle; remaining parity is focused on interaction timing edge cases.

### Tests
- Total upstream test files: 1 (`useSpinButton.test.js`)
- Ported test files: 1 (adapted)
- Passing test files: 1 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for spinbutton aria attributes, keyboard increment/decrement/page/home/end handlers, page-key fallback behavior, and minus-sign text normalization.
  - Added adapted touch press flow coverage for no-op press-end without press-up and increment-on-touch press-up + press-end sequence.
  - Added adapted live-announcer parity coverage for focused value/text updates (including minus-sign normalized text announcements) and blur no-op behavior.
  - Added adapted touch repetition edge coverage for pointer-cancel stop behavior and repeat-stop behavior after press up.
  - Added adapted locale-provider integration coverage for localized `Empty` aria text (`fr-FR` -> `Vide`).
- [x] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/spinbutton.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full long-press/touch repetition and live-announcement timing behavior parity against upstream edge cases

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Integrate spinbutton package into `@vue-aria/numberfield` consumer parity and verify end-to-end interaction timing semantics.
2. Expand docs/examples toward full upstream spinbutton story parity (value states and interaction timing guidance).

## 34) Package Record: @vue-aria/numberfield
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-aria/numberfield/src`
  - `references/react-spectrum/packages/@react-aria/numberfield/test/useNumberField.test.ts`
- Local package path:
  - `packages/@vue-aria/numberfield`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [ ] Public API checklist complete for full package surface

### Implementation
- [x] Ported upstream API slice:
  - `useNumberField`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useNumberField.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Hook state typing and form validation-state wiring are now aligned to `@vue-aria/numberfield-state` + `@vue-aria/form-state`; form reset wiring now uses a reactive value-ref adapter for native reset parity.
  - Locale dictionary wiring now imports full upstream `@react-aria/numberfield` intl bundle (instead of en-US-only seeded strings).
  - Remaining parity is focused on additional interaction edge cases.

### Tests
- Total upstream test files: 1 (`useNumberField.test.ts`)
- Ported test files: 1 (adapted)
- Passing test files: 1 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for default input props, placeholder forwarding, merged input event handlers, stepper mouse press-start focus transfer, and wheel increment/decrement behavior when focus is within the field group.
  - Added integration coverage validating `@vue-aria/numberfield-state` interoperability with stepper press handlers.
  - Expanded integration coverage for touch stepper interactions:
    - no-op increment path for touch `onPressStart` + `onPressEnd` without `onPressUp`
    - single increment path for touch `onPressStart` + `onPressUp` + `onPressEnd`
    - pointer-cancel path coverage ensuring touch repeat timers are canceled without increment side effects
    - repeat-threshold timing behavior (no increment before threshold, increment after threshold)
    - mouse press-up repeat-stop behavior through integrated stepper handlers
  - Added adapted native validation behavior coverage for required semantics (`required` + no `aria-required`) when `validationBehavior='native'`.
  - Added adapted iOS-specific behavior coverage for `aria-roledescription` suppression.
  - Added adapted platform input-mode parity coverage for iPhone and Android branches, including negative-number and decimal/fraction-digit combinations.
  - Added adapted default-platform input-mode parity coverage (non-iPhone/non-Android paths) for negative, decimal-capable, and integer-only branches.
  - Added adapted native form reset parity coverage to ensure parent `form.reset()` restores `defaultNumberValue` via `setNumberValue`.
  - Expanded adapted native validation integration coverage for invalid/change/reset event handling:
    - commit-validation on native `invalid` and `change` events
    - validation reset on parent `form.reset()`
    - first-invalid native focus branch assertion via required input invalidation
    - first-invalid ordering guard when an earlier form field is invalid
    - default-prevented invalid-event guard that skips native focus transfer
    - focus transfer behavior when earlier siblings are disabled or non-validatable
    - mixed custom-validity + first-invalid ordering scenarios (custom-invalid numberfield with and without earlier invalid siblings)
    - dynamic first-invalid re-evaluation after earlier field validity changes
  - Added adapted blur commit/announce timing coverage: announce only when commit normalizes the rendered input value.
  - Added adapted blur merge-path coverage ensuring user-provided `onBlur` callbacks are preserved while commit/announce logic still runs.
  - Added adapted interaction parity coverage for stepper press-start focus heuristics (touch targets vs focused input) and Enter key commit handling while respecting IME composition state.
  - Added adapted keydown propagation parity coverage for non-Enter keys (`continuePropagation` passthrough path).
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/numberfield.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- [ ] Validate full stepper-button press/touch focus heuristics and native invalid branch behavior

### Visual Parity
- Not applicable for hook package beyond downstream consumer validation.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Port remaining numberfield interaction parity for commit/announce timing in controlled-value rerender edge cases.
2. Expand native-invalid integration parity for dynamic multi-field form mutations (insert/remove/reorder first-invalid elements).

## 35) Package Record: @vue-aria/numberfield-state
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-stately/numberfield/src`
- Local package path:
  - `packages/@vue-aria/numberfield-state`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [ ] Public API checklist complete for full package surface

### Implementation
- [x] Ported upstream API slice:
  - `useNumberFieldState`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useNumberFieldState.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Locale-aware parsing/validation is wired through `@internationalized/number/NumberParser` and validation internals now route through `@vue-aria/form-state`; remaining work is edge-case test expansion.

### Tests
- Total upstream test files: no dedicated package-local unit test folder in upstream stately package
- Ported test files: 1 (adapted)
- Passing test files: 1 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for default formatting, step increment/decrement math, and clamped commit behavior.
  - Added adapted coverage for live synchronization of `canIncrement`/`canDecrement` and `numberValue` after state transitions.
  - Added adapted coverage for locale-aware separator parsing (`fr-FR`), partial sign validation under bounds, and default percent step behavior (`0.01`).
  - Added adapted native validation commit-queue coverage (`validationBehavior='native'` updates display state on `commitValidation`).
  - Added adapted parser edge-case coverage for decimal shorthand (`.5`/`-.5`), accounting-currency negatives (`($1.50)`), and unknown-currency rejection fallback behavior.
  - Added adapted locale-numbering-system/parser coverage for Swiss currency grouping separators (`de-CH`) and Arabic-Indic digit parsing (`ar-EG`).
  - Added adapted parser parity coverage for:
    - Unicode minus parsing/partial validation in locales that use U+2212 (`fi-FI`)
    - `signDisplay: "always"` plus-sign partial validation behavior
    - non-default numbering-system parsing in `en-US` using Arabic numerals/decimal separator
  - Added adapted parser parity coverage for unit-style and percent-style formatted parsing (`style: "unit"` with `unit: "inch"` and percent decimal precision).
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/numberfield-state.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- Not directly applicable for stately state package; validated through hook consumers.

### Visual Parity
- Not applicable for state package.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Validate remaining server-error form-context parity paths through consuming packages.
2. Expand parser edge-case coverage against additional upstream NumberParser fixtures (scientific notation, compact notation, and additional numbering-system variations).
## 36) Package Record: @vue-aria/form-state
- Upstream source path(s):
  - `references/react-spectrum/packages/@react-stately/form/src`
- Local package path:
  - `packages/@vue-aria/form-state`
- Status: In progress
- Owner: Codex

### Scope
- [x] Upstream modules enumerated
- [ ] Public API checklist complete for full package surface

### Implementation
- [x] Ported upstream API slice:
  - `useFormValidationState`
  - `FormValidationContext`
  - `privateValidationStateProp`
  - `VALID_VALIDITY_STATE`
  - `DEFAULT_VALIDATION_RESULT`
  - `mergeValidation`
- [x] Package scaffolding created and wired:
  - `package.json`
  - `src/index.ts`
  - `src/useFormValidationState.ts`
  - `tsconfig.json` path alias
  - `vitest.config.ts` alias
- Open adaptation note:
  - Injection-based server-error context support is wired, with fallback behavior when called outside a component setup context.

### Tests
- Total upstream test files: no dedicated package-local unit test folder in upstream stately package
- Ported test files: 1 (adapted)
- Passing test files: 1 (validated 2026-02-13)
- Test parity notes:
  - Added adapted coverage for aria realtime update behavior, native commit-queue behavior, controlled invalid-state precedence, and `mergeValidation` result semantics.
  - Added adapted component-context coverage for `FormValidationContext` server-error injection:
    - server-error display when provider payload includes matching field names
    - server-error clearing after `commitValidation`
    - redisplay when provider payload changes to a new server error object
- [ ] All relevant upstream tests migrated

### Docs
- [x] VitePress package page scaffolded (`docs/packages/form-state.md`)
- [ ] Examples parity complete
- [ ] Base styles parity complete

### Accessibility
- Not directly applicable for stately state package; validated through hook consumers.

### Visual Parity
- Not applicable for state package.

### React Dependency Check
- [x] No React runtime dependency in current slice

### Next Actions
1. Validate server error context parity in additional consumer integration scenarios.
2. Reuse this state package in additional control-state ports (`checkbox-state`, `radio-state`, and future form controls).

## 37) Session Log
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
- Expanded `@vue-aria/menu` with `useMenuTrigger`:
  - implemented trigger keyboard handling for ArrowUp/ArrowDown and guarded Enter/Space semantics
  - implemented press vs long-press trigger path wiring with overlay trigger semantics
  - wired menu trigger ids and overlay close/autofocus propagation
- Added adapted `useMenuTrigger` tests for keyboard gating, focus-strategy toggle behavior, and trigger/menu prop wiring.
- Validation: `npm run check` passed, `npm test` passed (105 files, 308 tests).
- Expanded `@vue-aria/menu` with `useSubmenuTrigger`:
  - implemented submenu trigger keyboard/press/hover open-close behavior and submenu/popover prop wiring
  - added initial `useSafelyMouseToSubmenu` hook for API surface alignment
- Added adapted `useSubmenuTrigger` tests for ArrowRight opening, delayed hover opening, outside interaction close gating, and Escape close behavior.
- Validation: `npm run check` passed, `npm test` passed (106 files, 311 tests).
- Expanded `@vue-aria/menu/useSafelyMouseToSubmenu` with core pointer-movement logic:
  - submenu-trajectory angle heuristics
  - pointer-event suppression/reset flow
  - resize-driven submenu bounds updates and cleanup lifecycle behavior
- Added adapted safe-mouse hook tests for pointer lifecycle/reset behavior.
- Validation: `npm run check` passed, `npm test` passed (107 files, 313 tests).
- Expanded menu interaction test parity with additional adapted cases:
  - `useMenuItem` close override + virtualized `aria-posinset`/`aria-setsize` metadata behavior
  - `useMenuTrigger` disabled/default-prevented key-path behavior
- Validation: `npm run check` passed, `npm test` passed (107 files, 315 tests).
- Expanded `useSubmenuTrigger` tests for:
  - focusin-driven close behavior when focus moves to sibling items in parent menu
  - keyboard/virtual press-start and touch/mouse press opening paths
- Validation: `npm run check` passed, `npm test` passed (107 files, 317 tests).
- Started `@vue-aria/select` package:
  - `useSelect`
  - `useHiddenSelect`
  - `HiddenSelect`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted select tests for trigger/menu/hidden-select prop wiring and hidden select single/multiple change handling.
- Added VitePress docs page for `@vue-aria/select` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (109 files, 320 tests).
- Expanded `@vue-aria/select` parity with:
  - hidden-input fallback behavior for large collections
  - native validation hidden text-input path in `HiddenSelect`
  - arrow-key selection behavior coverage in `useSelect`
- Added adapted `HiddenSelect` component tests and additional select behavior tests.
- Validation: `npm run check` passed, `npm test` passed (110 files, 323 tests).
- Started `@vue-aria/form` package:
  - `useFormValidation`
  - package scaffolding and tsconfig/vitest alias wiring
- Integrated `@vue-aria/form/useFormValidation` into `@vue-aria/select/useHiddenSelect`.
- Added adapted form tests for native custom-validity updates and invalid-event commit behavior.
- Added VitePress docs page for `@vue-aria/form` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (111 files, 325 tests).
- Expanded `@vue-aria/select` behavior tests for trigger focus/blur lifecycle callback semantics.
- Validation: `npm run check` passed, `npm test` passed (111 files, 326 tests).
- Hardened `@vue-aria/select` parity:
  - normalized trigger keyboard handler prop casing to upstream (`onKeyDown`/`onKeyUp`)
  - fixed hidden-select change handling to read `event.currentTarget` fallback
  - fixed hidden-input fallback native-required behavior so only first input is required in multi-value mode
- Expanded select/form test parity:
  - `HiddenSelect` now has adapted coverage for first-input-required semantics in multi-value native validation fallback
  - `useFormValidation` now has adapted coverage for form `reset` listener behavior and ignored programmatic resets
- Validation: `npm run check` passed, `npm test` passed (111 files, 331 tests).
- Expanded `@vue-aria/select` and `@vue-aria/form` docs toward upstream parity:
  - added API/features/anatomy/usage sections
  - expanded Vue-idiomatic examples and integration notes
- Validation: `npm run check` passed, `npm test` passed (111 files, 331 tests).
- Expanded select behavior parity coverage:
  - added explicit test for no arrow-key selection mutation in multiple mode
  - added hidden-select change test that exercises `event.currentTarget` fallback handling
- Validation: `npm run check` passed, `npm test` passed (111 files, 333 tests).
- Started `@vue-aria/spinbutton` package:
  - `useSpinButton`
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted spinbutton tests for aria attributes, keyboard handlers, fallback behavior, and minus-sign normalization.
- Added VitePress docs page for `@vue-aria/spinbutton` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (112 files, 338 tests).
- Started `@vue-aria/numberfield` package:
  - `useNumberField` (initial slice)
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted numberfield tests for default props, placeholder forwarding, and merged input event handlers.
- Added VitePress docs page for `@vue-aria/numberfield` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (113 files, 341 tests).
- Hardened `@vue-aria/numberfield` interaction parity:
  - added stepper mouse press-start focus transfer behavior
  - added wheel increment/decrement handling gated by focus-within state
- Expanded adapted numberfield coverage for the above interaction paths.
- Validation: `npm run check` passed, `npm test` passed (113 files, 343 tests).
- Started `@vue-aria/numberfield-state` package:
  - `useNumberFieldState` (initial slice)
  - package scaffolding and tsconfig/vitest alias wiring
- Added adapted numberfield-state tests for initialization/formatting, step math, and clamped commit behavior.
- Added VitePress docs page for `@vue-aria/numberfield-state` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (114 files, 346 tests).
- Added `@vue-aria/numberfield` integration test coverage using `@vue-aria/numberfield-state`.
- Validation: `npm run check` passed, `npm test` passed (115 files, 347 tests).
- Expanded `@vue-aria/spinbutton` touch parity coverage with adapted tests for touch press-up/press-end sequencing behavior.
- Validation: `npm run check` passed, `npm test` passed (115 files, 349 tests).
- Hardened `@vue-aria/numberfield-state` live state behavior:
  - switched key outputs (`inputValue`, `numberValue`, `canIncrement`, `canDecrement`) to getter-backed synchronized state
  - aligned setter behavior to immediately keep text representation in sync
- Added adapted state test coverage for synchronized increment/decrement boundary transitions.
- Validation: `npm run check` passed, `npm test` passed (115 files, 350 tests).
- Replaced fallback `@vue-aria/numberfield-state` parsing/validation with `@internationalized/number/NumberParser` parity path:
  - locale-aware parse/partial-validation behavior now routed through parser APIs
  - numbering-system-aware formatter construction added
- Added adapted locale parsing/partial-validation coverage (`fr-FR` separator parsing and partial input checks).
- Fixed local i18n ambient types to include `NumberParser` in `@internationalized/number` declarations.
- Validation: `npm run check` passed, `npm test` passed (115 files, 351 tests).
- Aligned `@vue-aria/numberfield` public state typing with `@vue-aria/numberfield-state` exports and updated docs example to use `useNumberFieldState`.
- Validation: `npm run check` passed, `npm test` passed (115 files, 351 tests).
- Expanded `@vue-aria/numberfield-state` test parity:
  - min/max sign validation edge behavior
  - percent-format default step increment behavior
- Validation: `npm run check` passed, `npm test` passed (115 files, 353 tests).
- Expanded `@vue-aria/spinbutton` parity tests with repeated press cadence/stop behavior edge cases.
- Validation: `npm run check` passed, `npm test` passed (115 files, 355 tests).
- Started `@vue-aria/form-state` package:
  - `useFormValidationState`
  - `FormValidationContext`
  - `privateValidationStateProp`
  - validation result constants + `mergeValidation`
  - package scaffolding and tsconfig/vitest alias wiring
- Integrated `@vue-aria/form-state/useFormValidationState` into `@vue-aria/numberfield-state/useNumberFieldState`.
- Integrated `@vue-aria/form/useFormValidation` + `privateValidationStateProp` wiring into `@vue-aria/numberfield/useNumberField`.
- Added adapted tests for form-state commit behavior and numberfield-state native validation commit queue.
- Added VitePress docs page for `@vue-aria/form-state` and wired docs navigation entries.
- Validation: `npm run check` passed, `npm test` passed (116 files, 360 tests).
- Expanded `@vue-aria/spinbutton` touch parity coverage:
  - touch decrement press-up/press-end sequence
  - pointer-cancel touch spin cancellation
- Expanded `@vue-aria/numberfield` native-validation parity coverage:
  - invalid-event commit behavior integration with `useFormValidation`
- Validation: `npm run check` passed, `npm test` passed (116 files, 363 tests).
- Expanded `@vue-aria/numberfield-state` parser parity coverage with adapted tests for:
  - decimal shorthand parsing (`.5` and `-.5`)
  - accounting currency negative parsing (`($1.50)`)
  - unknown currency rejection fallback (restore formatted controlled value)
- Validation: `npm run check` passed, `npm test` passed (116 files, 366 tests).
- Hardened `@vue-aria/form-state` injection fallback:
  - switched non-setup detection from `hasInjectionContext()` to `getCurrentInstance()` for consistent runtime behavior in composable + component contexts.
- Validation: `npm run check` passed, `npm test` passed (116 files, 366 tests).
- Expanded `@vue-aria/numberfield` parity with adapted iOS branch coverage:
  - `aria-roledescription` is omitted when `isIOS()` is true.
- Validation: `npm run check` passed, `npm test` passed (117 files, 367 tests).
- Expanded `@vue-aria/numberfield` parity with adapted blur announce behavior coverage:
  - announces normalized value after blur commit when text changes
  - does not announce when blur commit leaves text unchanged
- Validation: `npm run check` passed, `npm test` passed (117 files, 369 tests).
- Expanded `@vue-aria/form-state` test parity with adapted `mergeValidation` coverage:
  - deduplicated error accumulation
  - merged `ValidityState` flags and final `valid` resolution
- Validation: `npm run check` passed, `npm test` passed (117 files, 370 tests).
- Reused `@vue-aria/form-state/useFormValidationState` in:
  - `@vue-aria/checkbox-state/useCheckboxGroupState`
  - `@vue-aria/radio-state/useRadioGroupState`
- Updated checkbox validation result typing alignment (`validationDetails: null` parity with shared validation result contract).
- Validation: `npm run check` passed, `npm test` passed (117 files, 370 tests).
- Expanded `@vue-aria/numberfield` interaction parity coverage with adapted tests for:
  - touch press-start focus target behavior
  - already-focused-input no-op focus transfer behavior
  - Enter key commit/validation behavior with IME composing guard
- Validation: `npm run check` passed, `npm test` passed (117 files, 374 tests).
- Expanded `@vue-aria/numberfield-state` parser parity coverage with adapted locale-numbering-system cases:
  - Swiss grouping apostrophe parsing in CHF currency format
  - Arabic-Indic digit parsing in `ar-EG`
- Validation: `npm run check` passed, `npm test` passed (117 files, 376 tests).
- Hardened shared validation parity in `checkbox-state` and `radio-state`:
  - built-in validation now emits `ValidityState` details compatible with `@vue-aria/form-state` native commit queue semantics.
- Expanded state-package parity tests:
  - `@vue-aria/checkbox-state` native validation commit-queue behavior
  - `@vue-aria/radio-state` native validation commit-queue behavior
- Validation: `npm run check` passed, `npm test` passed (117 files, 378 tests).
- Expanded `@vue-aria/form` hook parity tests with adapted coverage for:
  - change-event commit behavior
  - invalid-event commit short-circuit when already invalid
  - native validity snapshot update path when realtime validation is valid
- Validation: `npm run check` passed, `npm test` passed (117 files, 381 tests).
- Expanded `@vue-aria/form` focus-order parity coverage with adapted tests for:
  - first-invalid-only focus behavior in multi-input forms
  - custom `focus` callback invocation on invalid
- Validation: `npm run check` passed, `npm test` passed (117 files, 383 tests).
- Expanded `@vue-aria/select/useHiddenSelect` integration parity with adapted tests for:
  - trigger focus on native invalid events via `useFormValidation`
  - hidden-select `onFocus` forwarding to trigger element
- Validation: `npm run check` passed, `npm test` passed (117 files, 385 tests).
- Expanded `@vue-aria/form` modality parity with adapted tests for:
  - setting interaction modality to keyboard when first invalid input receives focus
  - avoiding modality mutation for non-first invalid inputs
- Validation: `npm run check` passed, `npm test` passed (118 files, 387 tests).
- Expanded `@vue-aria/select/HiddenSelect` parity with adapted tests for:
  - no-selected-key render behavior across small and large collection code paths
  - initial `FormData` consistency when collection is initially empty
- Validation: `npm run check` passed, `npm test` passed (118 files, 390 tests).
- Expanded `@vue-aria/select/useSelect` interaction parity with adapted tests for:
  - label click focusing trigger and setting keyboard interaction modality
  - disabled label click short-circuit (no focus/modality mutation)
- Validation: `npm run check` passed, `npm test` passed (118 files, 392 tests).
- Expanded `@vue-aria/select/HiddenSelect` native invalid fallback parity with adapted integration coverage for:
  - hidden text-input required path (`collection.size > 300`) committing validation and focusing trigger on invalid
- Validation: `npm run check` passed, `npm test` passed (118 files, 393 tests).
- Expanded `@vue-aria/select/useSelect` keyboard parity with adapted tests for:
  - no-selected-key arrow navigation falling back to delegate first key
  - ArrowLeft/ArrowRight default prevention behavior
- Validation: `npm run check` passed, `npm test` passed (118 files, 394 tests).
- Expanded `@vue-aria/menu/useMenuTrigger` parity with adapted tests for:
  - open/closed trigger aria-controls and aria-expanded semantics
  - non-touch `onPressStart` open behavior and disabled short-circuit
- Validation: `npm run check` passed, `npm test` passed (118 files, 397 tests).
- Expanded `@vue-aria/menu/useMenuItem` virtualized parity with adapted tests for:
  - 1-based `aria-posinset` values across all menu items
  - stable full-set `aria-setsize` values across all menu items
- Validation: `npm run check` passed, `npm test` passed (118 files, 398 tests).
- Expanded `@vue-aria/select/HiddenSelect` parity with adapted tests for:
  - small-collection select change path updating state value (autofill behavior)
  - hidden-container dataset invariants (`data-a11y-ignore` and `data-react-aria-prevent-focus`)
- Validation: `npm run check` passed, `npm test` passed (118 files, 401 tests).
- Expanded `@vue-aria/select/useSelect` focus/blur parity with adapted tests for:
  - skipping focus callback propagation when select state is already focused
  - skipping blur callback propagation while menu is open
- Validation: `npm run check` passed, `npm test` passed (118 files, 403 tests).
- Expanded `@vue-aria/menu/useSafelyMouseToSubmenu` edge coverage with adapted tests for:
  - ignoring touch and pen pointer-move events in safe-pointer tracking
- Validation: `npm run check` passed, `npm test` passed (118 files, 404 tests).
- Expanded `@vue-aria/menu/useMenuItem` keyboard activation parity with adapted tests for:
  - Enter activation closing behavior in `selectionMode: none`
  - Space activation no-close behavior in `selectionMode: multiple`
- Validation: `npm run check` passed, `npm test` passed (118 files, 406 tests).
- Expanded `@vue-aria/menu/useSubmenuTrigger` keyboard/hover parity with adapted tests for:
  - ArrowLeft submenu close and trigger focus restoration in LTR flows
  - delayed hover open cancellation when hover leaves before configured delay
- Validation: `npm run check` passed, `npm test` passed (118 files, 408 tests).
- Expanded `@vue-aria/select/useSelect` typeahead parity with adapted tests for:
  - character-key selection updates in single-selection mode
  - typeahead suppression in multiple-selection mode
- Fixed `useSelect` typeahead handler wiring parity (`onKeydownCapture` -> trigger `onKeyDown` mapping) to match `useTypeSelect` output casing.
- Validation: `npm run check` passed, `npm test` passed (118 files, 410 tests).
- Expanded `@vue-aria/menu/useMenuTrigger` press parity with adapted tests for:
  - touch press opening behavior in enabled state
  - touch press disabled short-circuit behavior
- Validation: `npm run check` passed, `npm test` passed (118 files, 411 tests).
- Expanded `@vue-aria/select/useHiddenSelect` event parity with adapted tests for:
  - hidden select `onInput` value synchronization behavior
- Validation: `npm run check` passed, `npm test` passed (118 files, 412 tests).
- Expanded `@vue-aria/select/useSelect` typeahead guard parity with adapted tests for:
  - no-op selection behavior when the first typed typeahead character is Space
- Validation: `npm run check` passed, `npm test` passed (118 files, 413 tests).
- Expanded `@vue-aria/form` validation branch parity with adapted tests for:
  - fallback native custom-validity message when invalid with no errors
  - disabled-input short-circuit for native validity snapshot syncing
  - no-op modality mutation when invalid events are already default-prevented
- Validation: `npm run check` passed, `npm test` passed (118 files, 416 tests).
- Fixed `@vue-aria/select/HiddenSelect` fallback parity to use resolved hidden-select props (`selectData` defaults) in large-collection and empty-collection render paths.
- Expanded `@vue-aria/select/HiddenSelect` fallback parity tests for:
  - `name` fallback from `selectData` in large-collection hidden-input rendering
  - `name` fallback from `selectData` in empty-collection initial `FormData` value propagation
- Validation: `npm run check` passed, `npm test` passed (118 files, 418 tests).
- Expanded `@vue-aria/menu/useSubmenuTrigger` keyboard propagation parity with adapted tests for:
  - `continuePropagation` behavior on `ArrowLeft` when submenu is closed in LTR flows
- Validation: `npm run check` passed, `npm test` passed (118 files, 419 tests).
- Fixed `@vue-aria/utils/mergeProps` id-dedupe parity by delegating merged `id` values to `mergeIds`.
- Expanded `@vue-aria/utils/mergeProps` parity tests with adapted upstream coverage for:
  - single-argument pass-through behavior
  - mixed-key/event merge ordering behavior
  - id dedupe semantics via `idsUpdaterMap`/`mergeIds`
  - non-special prop override behavior
  - merged ref fan-out behavior
- Validation: `npm run check` passed, `npm test` passed (118 files, 424 tests).
- Expanded `@vue-aria/utils/shadowTreeWalker` parity with adapted upstream tests for:
  - non-shadow traversal equivalence with native `TreeWalker`
  - filter-object callback parity in nested traversal
  - root-shadow traversal equivalence with native shadow-root walker
- Validation: `npm run check` passed, `npm test` passed (119 files, 427 tests).
- Expanded `@vue-aria/utils/useViewportSize` SSR parity with adapted tests for:
  - SSR render safety without browser globals
  - `0x0` server-side viewport contract prior to hydration
- Validation: `npm run check` passed, `npm test` passed (120 files, 429 tests).
- Expanded `@vue-aria/utils/shadowTreeWalker` parity with adapted upstream multi-shadow scenarios for:
  - traversal across peer shadow hosts
  - traversal across nested shadow hosts
- Validation: `npm run check` passed, `npm test` passed (120 files, 431 tests).
- Improved `@vue-aria/utils/router` open-link parity:
  - added `openLink.isOpening` + optional `setOpening` behavior
  - aligned synthetic-link attribute extraction for empty-string data attributes
  - separated deprecated `getSyntheticLinkProps` from router-aware `useSyntheticLinkProps`
- Expanded router parity tests for:
  - mapped synthetic href behavior via `useSyntheticLinkProps`
  - deprecated unmapped href behavior via `getSyntheticLinkProps`
  - `openLink.isOpening` semantics during and after dispatch
- Validation: `npm run check` passed, `npm test` passed (120 files, 435 tests).
- Expanded `@vue-aria/utils/animation` parity with adapted tests for:
  - `useEnterAnimation` staying active until animation promises resolve
  - `useExitAnimation` exit lifecycle completion and interrupted-close recovery
- Validation: `npm run check` passed, `npm test` passed (121 files, 438 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` parity with adapted tests for:
  - Escape clear-selection behavior and non-clearing `escapeKeyBehavior: "none"` branch
  - Home/End ctrl+shift range-extension behavior in multiple selection mode
  - focus entry from following elements selecting `lastSelectedKey`
- Validation: `npm run check` passed, `npm test` passed (121 files, 442 tests).
- Hardened `@vue-aria/utils/router` open-link browser parity:
  - added upstream-aligned Firefox keyboard `_blank` modifier synthesis (`ctrl`/`meta` promotion)
  - implemented upstream WebKit keyboard event synthesis branch (`keyIdentifier`) for non-test runtime parity
- Expanded router parity tests for:
  - Firefox keyboard `_blank` behavior on non-Mac (ctrl modifier)
  - Firefox keyboard `_blank` behavior on Mac (meta modifier)
- Validation: `npm run check` passed, `npm test` passed (121 files, 444 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` branch parity with adapted tests for:
  - Tab fallback focus handoff to last tabbable item when tab navigation is disabled
  - blur leave behavior clearing collection focus state
  - scroll-container mousedown default-prevention behavior
- Validation: `npm run check` passed, `npm test` passed (121 files, 447 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` keyboard/focus parity with adapted tests for:
  - PageUp/PageDown navigation updates with select-on-focus behavior
  - already-focused `onFocus` outside-target clearing path
- Validation: `npm run check` passed, `npm test` passed (121 files, 449 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` interaction parity with adapted tests for:
  - `disallowSelectAll` ctrl/cmd+A guard behavior
  - Alt+Tab prevent-default path
  - ArrowLeft/ArrowRight wrap behavior with child-focus strategy in LTR
  - link keyboard navigation semantics for `linkBehavior: "selection"` and `linkBehavior: "override"`
- Validation: `npm run check` passed, `npm test` passed (121 files, 454 tests).
- Expanded `@vue-aria/selection/useSelectableItem` parity with adapted tests for:
  - link behavior branches (`selection`, `override`, `none`) and action/selection outcomes
  - keyboard Enter/Space and double-click action-selection semantics
  - disabled focused-item cleanup and mousedown-prevention branches
- Validation: `npm run check` passed, `npm test` passed (121 files, 460 tests).
- Expanded `@vue-aria/utils/router` parity with adapted WebKit branch coverage for:
  - keyboard event synthesis path (`keyIdentifier`) outside test mode
- Validation: `npm run check` passed, `npm test` passed (121 files, 461 tests).
- Expanded `@vue-aria/focus/FocusScope` parity with adapted behavior tests for:
  - `autoFocus` first-focusable behavior
  - `restoreFocus` unmount restoration behavior
  - `useFocusManager` wrap traversal and accept-filter behavior
- Implemented baseline `FocusScope contain` wrapping behavior for Tab/Shift+Tab focus cycling.
- Expanded `@vue-aria/focus/FocusScope` behavior tests for:
  - `contain` keyboard wrap behavior
- Expanded `@vue-aria/focus/FocusScope` behavior tests for:
  - containment no-op when modifier keys are pressed (`Alt+Tab` path)
- Validation: `npm run check` passed, `npm test` passed (122 files, 467 tests).
- Improved `@vue-aria/focus/FocusScope` containment behavior:
  - track active scope on `focusin` and preserve single-scope active semantics for API parity
  - enforce contained focus against outside `focusin` targets in the active scope's owner document
  - align keyboard containment active-element checks to owner-document context
  - keep `autoFocus` from stealing focus when an element is already focused within scope
- Expanded `@vue-aria/focus/FocusScope` behavior tests for:
  - `useFocusManager.focusLast` traversal
  - nested-descendant containment traversal
  - non-tabbable descendant skipping in containment traversal
  - active-scope enforcement when another contained scope receives focus
  - `autoFocus` no-op when focus is already inside the scope
- Validation: `npm run check` passed, `npm test` passed (122 files, 472 tests).
- Improved `@vue-aria/focus/FocusScope` autofocus and restoration parity:
  - `autoFocus` now targets the first tabbable element in scope
  - previous focused element capture now occurs before child mount-time focus changes
- Expanded `@vue-aria/focus/FocusScope` behavior tests for:
  - first-tabbable autofocus behavior
  - restore-focus behavior when a child is focused during scope mount
  - containment traversal through tabbable `contenteditable` nodes
- Validation: `npm run check` passed, `npm test` passed (122 files, 475 tests).
- Expanded `@vue-aria/focus` focus-manager parity with adapted upstream behavior tests for:
  - forward/backward traversal with and without wrap
  - tabbable-only traversal filtering
  - `from`-based traversal from container/group elements
  - accept-filter traversal skipping semantics
- Validation: `npm run check` passed, `npm test` passed (123 files, 483 tests).
- Improved `@vue-aria/focus/FocusScope` nested containment parity:
  - active-scope tracking now preserves child-scope ownership when focus is inside nested scopes
  - containment key handling now executes only for the current active scope
- Expanded `@vue-aria/focus/FocusScope` behavior tests for:
  - nested-scope containment lock (child scope tab cycling remains isolated)
- Validation: `npm run check` passed, `npm test` passed (123 files, 484 tests).
- Expanded `@vue-aria/focus` focus-manager parity tests for:
  - backward `from` traversal semantics, including no-wrap no-op branch
- Validation: `npm run check` passed, `npm test` passed (123 files, 485 tests).
- Improved `@vue-aria/focus/FocusScope` restore-focus parity:
  - dispatches cancelable `react-aria-focus-scope-restore` events before restoring focus
  - supports restore-focus cancellation via `preventDefault()`
  - prevents nested scope restore events from bubbling past ancestor focus scopes
- Expanded `@vue-aria/focus/FocusScope` behavior tests for:
  - restore-focus cancellation custom event behavior
  - nested scope restore-event propagation isolation
- Validation: `npm run check` passed, `npm test` passed (123 files, 487 tests).
- Improved `@vue-aria/focus/getFocusableTreeWalker` tabbable-radio parity:
  - skips non-selected radios in same-name groups for tabbable traversal
  - supports both form-owned groups and same-document non-form groups
- Expanded `@vue-aria/focus/FocusScope` containment tests for:
  - tab traversal skipping non-selected radios in the same group
- Validation: `npm run check` passed, `npm test` passed (123 files, 488 tests).
- Expanded `@vue-aria/focus` docs parity in `docs/packages/focus.md` with:
  - containment usage example
  - restore-event cancellation usage example
  - updated parity notes for nested scope, restore-event, and radio traversal behavior
- Validation: `npm run check` passed, `npm test` passed (123 files, 488 tests).
- Improved `@vue-aria/ssr` parity for no-provider id behavior:
  - aligned `useSSRSafeId` test-mode prefix behavior (`react-aria-<n>`)
  - preserved random-prefix behavior outside providers in production mode
- Expanded adapted `@vue-aria/ssr/SSRProvider` tests for:
  - deterministic nested-provider id shape parity
  - no-provider test/prod prefix-branch behavior
- Added dedicated `@vue-aria/ssr` package record to roadmap tracking.
- Validation: `npm run check` passed, `npm test` passed (123 files, 490 tests).
- Added adapted `@vue-aria/ssr/SSRProvider.ssr` test coverage for:
  - render-without-errors baseline
  - nested provider SSR render paths
  - deep nested provider SSR render paths
- Updated SSR package record test parity status to full upstream test-file coverage.
- Validation: `npm run check` passed, `npm test` passed (124 files, 493 tests).
- Added `@vue-aria/ssr` docs parity baseline:
  - new `docs/packages/ssr.md` package page
  - docs nav/sidebar/index wiring for `@vue-aria/ssr`
- Validation: `npm run check` passed, `npm test` passed (124 files, 493 tests).
- Expanded adapted `@vue-aria/ssr` coverage for:
  - `useIsSSR` server-render state behavior
- Validation: `npm run check` passed, `npm test` passed (124 files, 494 tests).
- Added `@vue-aria/i18n` roadmap package record with upstream/module/test parity breakdown.
- Added `@vue-aria/i18n` docs parity baseline:
  - new `docs/packages/i18n.md` page
  - docs nav/sidebar/index wiring for `@vue-aria/i18n`
- Validation: `npm run check` passed, `npm test` passed (124 files, 494 tests).
- Improved `@vue-aria/i18n` parity:
  - aligned `I18nProvider` structure to upstream split-provider behavior
  - expanded languagechange coverage for RTL/LTR direction transitions
- Validation: `npm run check` passed, `npm test` passed (124 files, 495 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` parity tests for:
  - focus-entry `firstSelectedKey` branch when entering from preceding elements
  - autoFocus selected-key prioritization with `canSelectItem` filtering
  - blur no-op path when focus remains within the collection
- Validation: `npm run check` passed, `npm test` passed (124 files, 498 tests).
- Expanded `@vue-aria/focus/FocusScope` owner-document parity with adapted upstream `FocusScopeOwnerDocument` tests for:
  - focus containment traversal inside iframe-owned documents
  - restore-focus behavior back to previously focused elements outside iframe scopes
- Improved owner-document compatibility for focusability/focus movement guards:
  - cross-window element/input checks now support both global and owner-window constructors
  - `isElementVisible` now falls back to style/attribute traversal in jsdom when `checkVisibility` misreports iframe-owned elements
- Validation: `npm run check` passed, `npm test` passed (125 files, 500 tests).
- Expanded adapted upstream `@vue-aria/focus/FocusScopeOwnerDocument` coverage for:
  - internal focus-shift stability when focus moves between iframe scope elements
  - `autoFocus` first-tabbable behavior in iframe-owned scopes
  - `autoFocus` no-op behavior when focus is already inside iframe-owned scope
  - `useFocusManager.focusNext` forward traversal and wrap traversal inside iframe-owned scopes
- Updated focus docs parity note to mark owner-document/iframe focus behavior as implemented.
- Validation: `npm run check` passed, `npm test` passed (125 files, 505 tests).
- Expanded `@vue-aria/focus/FocusScope` containment regression parity with adapted upstream coverage for:
  - single-radio form traversal path (`form.elements.namedItem()` returning an element instead of `RadioNodeList`)
  - non-crashing tab progression from button -> single radio -> following button within a containing focus scope
- Validation: `npm run check` passed, `npm test` passed (125 files, 506 tests).
- Expanded `@vue-aria/focus/FocusScopeOwnerDocument` containment parity assertions for reverse-tab cycling:
  - added full Shift+Tab traversal checks across iframe-owned scope boundaries (`input3 -> input2 -> input1`)
- Validation: `npm run check` passed, `npm test` passed (125 files, 506 tests).
- Expanded `@vue-aria/focus/FocusScope` radio containment parity with adapted backward traversal coverage for unchecked groups:
  - validates Shift+Tab order through radios and intervening controls in an unchecked same-name radio group (`button3 -> curly -> button2 -> moe -> larry -> button1`)
- Validation: `npm run check` passed, `npm test` passed (125 files, 507 tests).
- Expanded `@vue-aria/focus/FocusScope` outside-form radio-group parity with adapted containment tests for:
  - forward traversal through checked same-name groups while skipping non-selected radios (`button1 -> huey -> button2 -> larry -> button3 -> button4`)
  - backward traversal through checked same-name groups while skipping non-selected radios (`button4 -> button3 -> larry -> button2 -> huey -> button1`)
- Validation: `npm run check` passed, `npm test` passed (125 files, 509 tests).
- Expanded `@vue-aria/focus` focus-manager parity coverage for forward filtered traversal:
  - added `focusNext({wrap: true, accept})` branch coverage to mirror backward filtered-wrap behavior
- Validation: `npm run check` passed, `npm test` passed (125 files, 510 tests).
- Expanded `@vue-aria/focus/FocusScope` containment restore behavior with adapted coverage for:
  - restoring focus back to the last focused in-scope element when focus attempts to move outside the active contained scope
- Validation: `npm run check` passed, `npm test` passed (125 files, 511 tests).
- Expanded `@vue-aria/focus/FocusScope` containment fallback parity with adapted coverage for:
  - focusing the first tabbable element when focus leaves an active contained scope before any explicit in-scope focus tracking is recorded
- Validation: `npm run check` passed, `npm test` passed (125 files, 512 tests).
- Expanded `@vue-aria/focus/FocusScope` portal containment parity with adapted upstream coverage for:
  - allowing focus transfer from a containing parent scope into a teleported child scope without `contain`
  - locking focus inside a teleported child scope when the child scope uses `contain`
- Improved `@vue-aria/focus/FocusScope` logical-scope containment behavior:
  - tracks logical scope parent relationships across Teleport boundaries
  - permits descendant teleported scope focus targets during parent-scope containment enforcement
  - avoids nested-scope eager activation during mount-time initialization
- Validation: `npm run check` passed, `npm test` passed (125 files, 514 tests).
- Expanded `@vue-aria/focus/FocusScope` nested non-containing child-scope parity with adapted upstream coverage for:
  - preserving parent-scope tab traversal through nested child scopes that do not use `contain`
  - preserving parent-scope tab traversal through nested child scopes that use `restoreFocus` without `contain`
- Validation: `npm run check` passed, `npm test` passed (125 files, 516 tests).
- Expanded `@vue-aria/focus/FocusScope` nested contained-unmount parity with adapted upstream coverage for:
  - restoring active containment to the correct remaining nested scope as deeper contained children unmount
- Improved active-scope transition logic:
  - ancestor scopes can no longer reclaim active-scope state while a descendant contained scope is active
  - descendant scopes (including teleported descendants) retain focus ownership until focus moves within allowed hierarchy
- Validation: `npm run check` passed, `npm test` passed (125 files, 517 tests).
- Expanded `@vue-aria/focus/FocusScope` DOM-order navigation parity for non-containing scopes with adapted upstream coverage for:
  - moving focus from an in-scope element to the next/previous sibling controls in document order when tabbing forward/backward
- Validation: `npm run check` passed, `npm test` passed (125 files, 518 tests).
- Expanded `@vue-aria/focus/FocusScope` shadow DOM parity with adapted upstream coverage for:
  - containing focus traversal inside a shadow-root mounted scope
- Improved shadow-root containment key handling:
  - containment now checks `getActiveElement(ownerDocument)` so shadow-root active descendants are recognized instead of the shadow host element
- Validation: `npm run check` passed, `npm test` passed (125 files, 519 tests).
- Expanded `@vue-aria/focus/FocusScope` nested shadow-root parity with adapted upstream coverage for:
  - maintaining contained focus traversal inside a nested shadow-root mounted scope
- Validation: `npm run check` passed, `npm test` passed (125 files, 520 tests).
- Expanded `@vue-aria/focus/FocusScope` shadow restore-focus parity with adapted upstream coverage for:
  - preserving focus on an external element when a shadow-root restore-focus scope unmounts while an outer restore-focus scope is present
- Validation: `npm run check` passed, `npm test` passed (125 files, 521 tests).
- Expanded `@vue-aria/focus/FocusScope` shadow mixed-control containment parity with adapted upstream coverage for:
  - cycling contained Tab traversal across mixed focusable controls (`input`, `input`, `button`) inside a shadow-root scope
- Validation: `npm run check` passed, `npm test` passed (125 files, 522 tests).
- Expanded `@vue-aria/focus/FocusScope` cleanup parity with adapted timer/raf leak guard coverage for:
  - no pending timer work after contained focus/blur lifecycle and unmount
- Validation: `npm run check` passed, `npm test` passed (125 files, 523 tests).
- Expanded `@vue-aria/focus/FocusScope` restore-focus parity for outside-active unmount paths with adapted upstream coverage for:
  - skipping restoration when scope unmounts while focus is already outside the scope
- Improved restore-focus unmount behavior:
  - restore now short-circuits when current active element is outside the scope (except `document.body` fallback cases)
- Validation: `npm run check` passed, `npm test` passed (125 files, 524 tests).
- Expanded `@vue-aria/focus/FocusScope` containment removal parity with adapted upstream coverage for:
  - restoring focus to the first focusable in-scope element when focused descendants are removed from a contained scope
- Improved containment blur-recovery behavior:
  - added delayed focusout recovery for contain scopes so focus loss-to-body during node removal is coerced back inside scope
  - containment fallback now tries first tabbable, then first focusable, matching upstream fallback order
- Validation: `npm run check` passed, `npm test` passed (125 files, 525 tests).
- Expanded `@vue-aria/focus/FocusScope` restore-tab navigation parity with adapted upstream coverage for:
  - moving focus to the element after the previously focused node when tabbing forward out of a restore-focus scope
  - moving focus to the element before the previously focused node when shift-tabbing out of a restore-focus scope
- Improved restore-tab handling:
  - added restore-scope boundary tab key management for non-containing scopes
  - added ancestor-containment gating so nested restore scopes do not escape when an ancestor `contain` scope is active
- Validation: `npm run check` passed, `npm test` passed (125 files, 527 tests).
- Expanded `@vue-aria/focus/FocusScope` restore-focus dynamic-children parity with adapted upstream coverage for:
  - restoring to the previously focused external element after scope children update and focus changes before unmount
- Validation: `npm run check` passed, `npm test` passed (125 files, 528 tests).
- Expanded `@vue-aria/focus/FocusScope` restore-tab guard parity with adapted upstream coverage for:
  - ensuring tab boundary navigation is not intercepted when `restoreFocus` is disabled
- Validation: `npm run check` passed, `npm test` passed (125 files, 529 tests).
- Expanded `@vue-aria/focus/FocusScope` trigger-anchored restore-tab parity with adapted upstream coverage for:
  - moving focus to the element after a trigger when tabbing forward out of a restore-focus scope
  - moving focus to the element before a trigger when shift-tabbing out of a restore-focus scope
- Validation: `npm run check` passed, `npm test` passed (125 files, 531 tests).
- Expanded `@vue-aria/focus/FocusScope` iframe-like blur transition parity with adapted upstream coverage for:
  - preserving the newly focused target when blur `relatedTarget` is null during contained focus transitions
- Validation: `npm run check` passed, `npm test` passed (125 files, 532 tests).
- Expanded `@vue-aria/focus/FocusScope` node-to-restore edge-case parity with adapted upstream coverage for:
  - tracking restoration targets across scope handoff when the intermediate node-to-restore is removed in another subtree
- Improved restore-focus handoff behavior:
  - contain-scope unmount restoration now defers to allow replacement-scope autofocus to settle before fallback restoration
  - body-active mount snapshots now fall back to the last active scope's focused node to preserve restore-target chains
  - disconnected restore-target resolution now reuses prior scope restore mappings
- Validation: `npm run check` passed, `npm test` passed (125 files, 533 tests).
- Expanded `@vue-aria/focus/FocusScope` multi-scope and blur/focusout parity with adapted upstream coverage for:
  - sibling contained-scope traversal isolation with active-scope lock maintained during forward/reverse tab cycling
  - restoration to last focused in-scope element across blur-driven browser re-entry and explicit focusout transitions
- Validation: `npm run check` passed, `npm test` passed (125 files, 536 tests).
- Updated `@vue-aria/focus` tracker parity milestone:
  - completed adaptation coverage for upstream `FocusScope.test.js` + `FocusScopeOwnerDocument.test.js` assertions
  - moved focus package next actions toward downstream integration validation and docs/example parity
- Expanded `@vue-aria/button` API parity with adapted upstream coverage for:
  - `useToggleButtonGroup` group semantics (`toolbar`/`radiogroup` role mapping and keyboard focus traversal)
  - `useToggleButtonGroupItem` selection semantics and disabled inheritance
- Validation: `npm run check` passed, `npm test` passed (126 files, 540 tests).
- Improved `@vue-aria/overlays` typing parity:
  - removed temporary `@ts-nocheck` from `usePreventScroll.ts`
  - tightened restore/style typings while preserving existing behavior paths
- Validation: `npm run check` passed, `npm test` passed (126 files, 540 tests).
- Improved `@vue-aria/overlays` typing parity:
  - removed temporary `@ts-nocheck` from `ariaHideOutside.ts`
  - tightened iterator typing for live announcer/top-layer detection and mutation handling
- Validation: `npm run check` passed, `npm test` passed (126 files, 540 tests).
- Improved `@vue-aria/overlays` typing parity:
  - removed temporary `@ts-nocheck` from `calculatePosition.ts`
  - added typed cache/map/index access patterns for placement/axis math without changing positioning behavior
- Validation: `npm run check` passed, `npm test` passed (126 files, 540 tests).
- Refreshed tracker parity status for packages with no dedicated upstream test directories:
  - marked `@vue-aria/live-announcer`, `@vue-aria/toggle`, and `@vue-aria/listbox` test migration checks complete based on adapted coverage
  - marked `@vue-aria/disclosure` test migration check complete after validating adapted hook/state coverage
- Updated `@vue-aria/link` scope tracker:
  - marked public API checklist complete for currently exported upstream module surface
- Expanded `@vue-aria/selection` upstream-intent interaction parity:
  - added multi-item touch/virtual pointer toggle semantics for replace-mode selection (`useSelectableItem`)
  - added focus-entry assertions confirming first/last selected targeting does not mutate selection state (`useSelectableCollection`)
- Expanded `@vue-aria/selection` focus lifecycle parity:
  - added focused-item DOM focus + `scrollIntoView` behavior checks for keyboard modality
  - added non-keyboard modality guard coverage for focus scroll behavior
  - added virtual-focus coverage ensuring active element is preserved during collection focus handling
- Expanded `@vue-aria/selection-state` manager coverage:
  - added modality-aware `select` behavior checks (`touch`/`virtual` toggle vs mouse replace in replace-mode)
  - added link/disabled metadata branch coverage for `isLink`, `getItemProps`, `isDisabled`, and `canSelectItem`
  - added derived-manager state/options continuity coverage for `withCollection`
  - added selection-behavior setter coverage, toggle-select-all coverage, selection-equality checks, and single-mode select toggle coverage
- Expanded `@vue-aria/selection/useSelectableItem` virtual-focus behavior parity:
  - wired focused virtual-item path to `moveVirtualFocus`
  - added virtual-focus click path updates for collection focus + focused key tracking
  - added virtual-focus mousedown default prevention to avoid native DOM focus transfer
- Expanded `@vue-aria/selection-state/useMultipleSelectionState` coverage:
  - added duplicate-selection-event behavior when `allowDuplicateSelectionEvents` is enabled
  - added selection normalization coverage for controlled/default/all selection inputs
  - added disabled-key set exposure coverage
- Expanded `@vue-aria/selection/useSelectableItem` press-phase parity:
  - implemented default mouse-down selection path with click dedupe for replace-mode selectable rows
  - implemented `shouldSelectOnPressUp` click-phase selection semantics
  - implemented `allowsDifferentPressOrigin` mouse-up selection path when press-up selection is enabled
- Expanded `@vue-aria/selection/useSelectableItem` metadata parity:
  - wired `data-key` and collection-scoped `data-collection` attributes to item props
  - wired explicit item `id` forwarding support
- Expanded `@vue-aria/selection/useSelectableItem` action/link parity:
  - added native link-click prevention to keep navigation under router/open-link control
  - added `openLink.isOpening` guard parity for link-click default prevention behavior
  - added `UNSTABLE_itemBehavior: "action"` branch coverage ensuring action-only click behavior without selection mutation
- Expanded `@vue-aria/selection/useSelectableItem` event wiring parity:
  - chained collection-provided event handlers with local item interaction handlers
  - added pointer-modality gate for secondary-action double-click behavior
- Expanded `@vue-aria/selection/useSelectableItem` touch parity:
  - added touch long-press timer behavior that toggles selection and switches manager selection behavior to `toggle`
  - added long-press cancellation behavior when touch ends before threshold
  - added drag-start suppression coverage for touch-initiated long-press selection flows
- Expanded `@vue-aria/selection-state` manager type parity:
  - added `setSelectionBehavior` to `MultipleSelectionManager` contract to match runtime manager capabilities
- Expanded `@vue-aria/selection` docs parity:
  - documented press-timing option usage (`shouldSelectOnPressUp`, `allowsDifferentPressOrigin`)
  - documented virtual-focus interaction behavior for selectable items
  - documented touch long-press toggle-selection behavior and touch drag suppression notes
- Expanded docs package coverage:
  - added VitePress page for `@vue-aria/selection-state` with state and manager usage examples
  - wired `@vue-aria/selection-state` into docs index and VitePress nav/sidebar
- Validation: `npm run check` passed, `npm test` passed (126 files, 571 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` focus/scroll lifecycle parity:
  - added select-on-focus behavior for focus-entry key targeting when entering the collection with no focused key
  - preserved no-op selection mutation behavior when focus-entry lands on an already-selected key
  - added scroll position snapshot/restore behavior when re-entering with an existing focused key
  - added Shift+Tab root-focus handoff behavior when tab navigation is disabled
  - added Home/End shift-key guard behavior when no key is currently focused
  - added focus-scope restore interception behavior to keep manager focus state aligned
- Expanded `@vue-aria/selection/useSelectableCollection` coverage:
  - added adapted tests for focus-entry selection/non-mutation branches
  - added adapted tests for scroll restore on focused-key re-entry
  - added adapted tests for Shift+Tab, Home/End shift guards, and focus-scope restore handling
- Validation: `npm run check` passed, `npm test` passed (126 files, 577 tests).
- Expanded `@vue-aria/selection/useSelectableItem` press lifecycle parity:
  - migrated item interaction flow to `usePress` and `useLongPress` semantics with upstream-aligned pointer/keyboard action-vs-selection branching
  - aligned `shouldSelectOnPressUp` + `allowsDifferentPressOrigin` behavior to press-phase callbacks (`onPress`, `onPressUp`)
  - aligned virtual-focus press behavior using `preventFocusOnPress` and press-phase focused-key updates
  - aligned long-press behavior to `useLongPress` (`touch` toggles selection + `setSelectionBehavior("toggle")`) and drag suppression after touch press-start
  - aligned item `isPressed` state to press responder state instead of static false
- Expanded `@vue-aria/selection` and downstream listbox harness coverage:
  - updated `useSelectableItem` adapted tests to run within effect scopes and to exercise press responder event sequencing
  - added pointer-event test harness helpers for touch/virtual interaction branches in jsdom
  - adapted `@vue-aria/listbox/useOption` hover-pointer tests to provide full event contracts expected by press handlers
- Validation: `npm run check` passed, `npm test` passed (126 files, 577 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` focus lifecycle parity:
  - added focused-key change lifecycle handling to scroll newly focused items into view when modality is keyboard
  - added fallback collection-root refocus when focusedKey transitions from a concrete key to `null` while collection focus state remains active
- Expanded `@vue-aria/selection/useSelectableCollection` reactive lifecycle coverage:
  - added adapted tests for focused-key-change scroll behavior
  - added adapted tests for focused-key-null collection-root focus fallback behavior
- Validation: `npm run check` passed, `npm test` passed (126 files, 579 tests).
- Refreshed `@vue-aria/interactions` package record parity metadata:
  - completed upstream test inventory (`13` upstream files) with mapped/adapted Vue test coverage
  - marked relevant upstream test migration gate complete and updated next actions to downstream integration/docs parity focus
- Expanded `@vue-aria/listbox/useOption` integration parity coverage:
  - added pointer-press delegation test asserting option props route selection updates through `useSelectableItem` in replace-selection mode
  - added Enter-key action delegation test asserting option props route keyboard action behavior for actionable items
- Validation: `npm run check` passed, `npm test` passed (126 files, 581 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` virtual-focus lifecycle parity:
  - added deferred `focusStrategy: "first"` behavior for virtual-focus collections when no focusable key exists yet
  - added empty-state fallback path that moves virtual focus to the collection and re-dispatches virtual focus to the previous active element
  - added collection-update retry path that resolves the first focusable key when data becomes available
- Expanded `@vue-aria/selection/useSelectableCollection` virtual-focus coverage:
  - added adapted test for empty-to-loaded virtual first-focus transitions and deferred focused-key updates
- Validation: `npm run check` passed, `npm test` passed (126 files, 582 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` autoFocus lifecycle parity:
  - added autoFocus retry behavior when collection size is initially `0`, preserving pending autoFocus until items become available
  - added collection-update autoFocus resolution to focus the configured strategy key after load
- Expanded `@vue-aria/selection/useSelectableCollection` autoFocus coverage:
  - added adapted test for empty-to-loaded autoFocus transitions with deferred focused-key assignment
- Validation: `npm run check` passed, `npm test` passed (126 files, 583 tests).
- Expanded `@vue-aria/selection/useSelectableCollection` post-autofocus scroll parity:
  - added `didAutoFocus` lifecycle tracking so focused item scrolling runs after autoFocus resolution even when modality is pointer/virtual
- Expanded `@vue-aria/selection/useSelectableCollection` autoFocus scroll coverage:
  - added adapted test asserting auto-focused item scroll behavior when interaction modality is pointer
- Validation: `npm run check` passed, `npm test` passed (126 files, 584 tests).
- Expanded `@vue-aria/selection` keyboard-delegate API parity:
  - updated keyboard delegate signatures to accept optional context parameters for first/last-key lookup
  - wired `useSelectableCollection` Home/End and wrap lookup paths to pass focused-key and ctrl-global context
- Expanded `@vue-aria/selection/useSelectableCollection` keyboard delegate coverage:
  - added adapted tests asserting Home/End delegate calls receive focused-key and ctrl context
- Validation: `npm run check` passed, `npm test` passed (126 files, 586 tests).
- Hardened `@vue-aria/menu/useSafelyMouseToSubmenu` edge-case parity:
  - added modality-change tracking so safe-triangle pointer-event suppression resets correctly when interaction modality changes
  - added submenu timeout auto-close fallback redispatch using pointerover with jsdom-safe event fallback when `PointerEvent` is unavailable
- Expanded `@vue-aria/menu/useSafelyMouseToSubmenu` coverage:
  - added adapted tests for pointer-event suppression reset on modality transitions
  - added adapted timeout fallback tests asserting delayed pointerover redispatch when pointer movement toward submenu stalls
- Validation: `npm run check` passed, `npm test` passed (126 files, 588 tests).
- Expanded `@vue-aria/menu/useMenuTrigger` long-press parity:
  - switched long-press accessibility description wiring to `useLocalizedStringFormatter` (`longPressMessage`) instead of hardcoded inline hook options
  - added adapted long-press contract coverage for `useLongPress` option wiring (`onLongPressStart` closes, `onLongPress` opens first item) and disabled propagation
- Validation: `npm run check` passed, `npm test` passed (126 files, 590 tests).
- Expanded `@vue-aria/spinbutton` announcement/touch interaction parity:
  - made `ariaTextValue` reactive via computed/watch to align focused live-announcer behavior with upstream value/text updates
  - added adapted live-announcer tests for focused value change announcements, textValue announcements, and blur no-op behavior
  - added adapted touch interaction coverage for pointer-cancel stopping behavior and repeat stop after press-up lifecycle
- Validation: `npm run check` passed, `npm test` passed (126 files, 592 tests).
- Expanded `@vue-aria/numberfield` keyboard propagation parity:
  - aligned non-Enter key handling to call `continuePropagation` from the chained keydown handler
  - added adapted test coverage asserting non-Enter keydown paths propagate while Enter paths retain commit/validation behavior
- Validation: `npm run check` passed, `npm test` passed (126 files, 593 tests).
- Expanded `@vue-aria/form-state` server-error context parity coverage:
  - added adapted provider-based `FormValidationContext` tests for initial server-error display, clear-on-commit behavior, and redisplay when server payload changes
- Validation: `npm run check` passed, `npm test` passed (126 files, 594 tests).
- Expanded `@vue-aria/select/HiddenSelect` fallback parity:
  - fixed optional `isDisabled` prop handling in `HiddenSelect` so omitted boolean props no longer override `selectData` disabled fallback
  - added adapted regression coverage asserting selectData-driven disabled propagation when component `isDisabled` is not passed
- Validation: `npm run check` passed, `npm test` passed (126 files, 595 tests).
- Expanded `@vue-aria/link` router integration parity:
  - added adapted tests validating non-native router client-navigation dispatch on click
  - added adapted default-prevented click guard coverage to ensure router navigation is skipped when the event is already handled
- Validation: `npm run check` passed, `npm test` passed (127 files, 597 tests).
- Expanded `@vue-aria/link` router guard parity:
  - added adapted tests for modified-key click suppression and cross-origin click suppression
- Validation: `npm run check` passed, `npm test` passed (127 files, 599 tests).
- Expanded `@vue-aria/numberfield-state` parser parity coverage:
  - added adapted tests for Unicode-minus parsing (`fi-FI`), `signDisplay: "always"` plus-partial validation, and Arabic numbering-system parsing in `en-US`
- Validation: `npm run check` passed, `npm test` passed (127 files, 602 tests).
- Expanded `@vue-aria/numberfield` input-mode parity coverage:
  - added adapted platform-mocked tests for iPhone and Android inputMode branching
  - covered negative-value, decimal-capable, and `maximumFractionDigits: 0` matrix paths
- Expanded `@vue-aria/numberfield-state` parser parity coverage:
  - added adapted tests for unit-style parsing (`23.5 in`) and percent-style parsing with decimal precision (`10.5%`)
- Validation: `npm run check` passed, `npm test` passed (129 files, 610 tests).
- Hardened `@vue-aria/numberfield` native form-reset parity:
  - fixed `useFormReset` wiring in `useNumberField` to use value-ref semantics so form listeners attach correctly
  - reused the same value-ref adapter for `useFormValidation` wiring
- Expanded `@vue-aria/numberfield` native form-reset coverage:
  - added adapted test asserting parent `form.reset()` restores `defaultNumberValue` via `state.setNumberValue`
- Validation: `npm run check` passed, `npm test` passed (129 files, 611 tests).
- Expanded `@vue-aria/numberfield` input-mode matrix parity:
  - added adapted default-platform (`!isIPhone && !isAndroid`) branch tests to cover numeric mode behavior across negative, decimal-capable, and integer-only paths
- Validation: `npm run check` passed, `npm test` passed (130 files, 614 tests).
- Expanded `@vue-aria/numberfield` native validation integration parity:
  - added adapted tests for native `invalid` focus/commit-validation behavior on required fields
  - added adapted tests for native `change` commit-validation behavior
  - added adapted tests for native reset-validation behavior on parent `form.reset()`
- Validation: `npm run check` passed, `npm test` passed (130 files, 616 tests).
- Expanded `@vue-aria/numberfield` touch-stepper integration parity:
  - added adapted integration tests for touch press sequencing through `useNumberField` + `useNumberFieldState`
  - covered no-op touch end without `onPressUp` and single-increment path with `onPressUp` before `onPressEnd`
- Validation: `npm run check` passed, `npm test` passed (130 files, 618 tests).
- Expanded `@vue-aria/numberfield` first-invalid native focus parity:
  - added adapted multi-field form coverage for first-invalid ordering guard behavior
  - added adapted default-prevented invalid-event guard coverage to ensure focus is not forcibly moved
- Validation: `npm run check` passed, `npm test` passed (130 files, 620 tests).
- Expanded `@vue-aria/numberfield` locale dictionary parity:
  - replaced inline en-US-only strings with generated upstream intl bundle from `@react-aria/numberfield/intl`
  - wired `useNumberField` to consume the full locale set via `intlMessages.ts`
- Validation: `npm run check` passed, `npm test` passed (130 files, 620 tests).
- Expanded `@vue-aria/spinbutton` locale dictionary parity:
  - replaced inline en-US-only strings with generated upstream intl bundle from `@react-aria/spinbutton/intl`
  - wired `useSpinButton` to consume the full locale set via `intlMessages.ts`
- Validation: `npm run check` passed, `npm test` passed (130 files, 620 tests).
- Expanded `@vue-aria/menu` locale dictionary parity:
  - replaced inline en-US long-press message strings with generated upstream intl bundle from `@react-aria/menu/intl`
  - updated `useMenuTrigger` long-press accessibility description expectation to upstream message text
- Validation: `npm run check` passed, `npm test` passed (130 files, 620 tests).
- Expanded `@vue-aria/searchfield` and `@vue-aria/breadcrumbs` locale dictionary parity:
  - replaced inline en-US-only labels with generated upstream intl bundles from `@react-aria/searchfield/intl` and `@react-aria/breadcrumbs/intl`
  - wired both hooks to consume package-local `intlMessages.ts` locale maps
- Validation: `npm run check` passed, `npm test` passed (130 files, 620 tests).
- Expanded locale-provider integration parity for localized labels:
  - added adapted `@vue-aria/searchfield` test coverage for translated clear-search labels under `I18nProvider` (`fr-FR`)
  - added adapted `@vue-aria/breadcrumbs` test coverage for translated default nav labels under `I18nProvider` (`fr-FR`)
- Validation: `npm run check` passed, `npm test` passed (130 files, 622 tests).
- Expanded `@vue-aria/spinbutton` locale-provider integration parity:
  - added adapted test coverage for localized `Empty` spinbutton `aria-valuetext` under `I18nProvider` (`fr-FR`)
- Validation: `npm run check` passed, `npm test` passed (130 files, 623 tests).
- Expanded localized docs parity for touched hook packages:
  - added locale-provider usage examples to `docs/packages/searchfield.md`, `docs/packages/breadcrumbs.md`, and `docs/packages/spinbutton.md`
  - synchronized roadmap next actions to target broader story/example parity beyond localized-label baselines
- Validation: `npm run check` passed, `npm test` passed (130 files, 623 tests).
- Expanded `@vue-aria/numberfield` touch-cancel integration parity:
  - added adapted integration coverage for `pointercancel` during touch press sequences to ensure no unintended increment commits
- Validation: `npm run check` passed, `npm test` passed (130 files, 624 tests).
- Expanded `@vue-aria/numberfield` native-invalid sibling-order parity:
  - added adapted coverage ensuring required numberfield focus behavior remains correct when earlier form siblings are disabled or non-validatable
- Validation: `npm run check` passed, `npm test` passed (130 files, 625 tests).
- Expanded `@vue-aria/numberfield` repeat-stop integration parity:
  - added adapted coverage ensuring mouse `onPressUp` halts additional increment repeats in integrated stepper flows
- Validation: `npm run check` passed, `npm test` passed (130 files, 626 tests).
- Expanded `@vue-aria/numberfield` touch repeat-threshold integration parity:
  - added adapted coverage for no-increment-before-threshold and increment-after-threshold touch timer behavior
- Validation: `npm run check` passed, `npm test` passed (130 files, 628 tests).
- Expanded `@vue-aria/numberfield` blur commit/announce merge-path parity:
  - added adapted coverage ensuring user `onBlur` handlers run alongside commit normalization and live announcement behavior
- Validation: `npm run check` passed, `npm test` passed (130 files, 629 tests).
- Expanded `@vue-aria/numberfield` mixed custom-validity first-invalid parity:
  - added adapted coverage for custom-invalid numberfield focus behavior with and without earlier invalid siblings in native validation mode
- Validation: `npm run check` passed, `npm test` passed (130 files, 631 tests).
- Expanded `@vue-aria/numberfield` dynamic first-invalid mutation parity:
  - added adapted coverage for re-evaluating first-invalid ordering after earlier field validity changes within the same form
- Validation: `npm run check` passed, `npm test` passed (130 files, 632 tests).
- Expanded `@vue-aria/select/useHiddenSelect` form-reset integration parity:
  - added adapted coverage ensuring hidden-select wiring restores `defaultValue` on parent `form.reset()` events
- Validation: `npm run check` passed, `npm test` passed (130 files, 633 tests).
- Expanded `@vue-aria/select/useHiddenSelect` native invalid guard parity:
  - added adapted first-invalid ordering and default-prevented invalid-event guard coverage for trigger-focus behavior
- Validation: `npm run check` passed, `npm test` passed (130 files, 635 tests).
- Expanded `@vue-aria/select/useSelect` keyboard/focus edge parity:
  - added adapted coverage for no-first-key arrow handling and null-relatedTarget menu blur propagation
- Validation: `npm run check` passed, `npm test` passed (130 files, 637 tests).
- Expanded `@vue-aria/select/useHiddenSelect` dynamic first-invalid mutation parity:
  - added adapted coverage for re-evaluating first-invalid ordering after earlier field validity changes in native validation mode
- Validation: `npm run check` passed, `npm test` passed (130 files, 638 tests).
