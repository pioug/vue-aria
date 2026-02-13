# Vue Aria / Vue Spectrum Roadmap

Last updated: 2026-02-13
Source of truth: `/Users/piou/Dev/vue-aria/PLAN.md`

## 1) Program Status
- Overall status: In progress
- Current phase: Foundation bootstrap + first package
- Current focus package: `@vue-aria/utils`
- Scope note: Ignore Spectrum S2 (next Spectrum version). Port only the current upstream Spectrum version unless explicitly requested otherwise.
- Blockers:
  - Docs stack (VitePress/Storybook parity pages) not scaffolded yet

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
- `@vue-aria/i18n`: Not started
- `@vue-aria/ssr`: In progress
- `@vue-aria/interactions`: Not started
- `@vue-aria/focus`: Not started
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

### React Stately packages
- `@vue-aria/utils-state`: Not started
- `@vue-aria/toggle-state`: Not started
- `@vue-aria/list-state`: Not started
- `@vue-aria/tree-state`: Not started
- `@vue-aria/table-state`: Not started
- `@vue-aria/calendar-state`: Not started
- `@vue-aria/datepicker-state`: Not started
- `@vue-aria/overlays-state`: Not started
- `@vue-aria/combobox-state`: Not started
- `@vue-aria/selection-state`: Not started

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
- [ ] VitePress/Storybook pages ported
- [ ] Examples parity complete
- [ ] Base styles parity complete

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

## 6) Session Log
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
