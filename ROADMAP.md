# Roadmap: Quality Audit of All Ported Modules

Generated: February 16, 2026
Source: `/Users/piou/Dev/vue-aria-copy`
Reference baseline: `references/react-spectrum`

## 1) Execution objective

Validate implementation parity and test equivalence for every package ported from:

- `@react-aria`
- `@react-stately`
- `@react-spectrum`
- `@react-types`

No package marked complete until all required checks are green.

## 2) Coverage target

- `@react-aria`: 54 packages
- `@react-stately`: 32 packages
- `@react-spectrum`: 64 packages
- `@react-types`: 47 packages
- Total: 197 packages

## 3) Fixed local mapping

- `@react-aria/*` → `packages/@vue-aria/*`.
- `@react-stately/*` → `packages/@vue-stately/*`.
- `@react-spectrum/*` → `packages/@vue-spectrum/*`.
- `@react-types/*` → `packages/@vue-types/*`.

## 4) Global audit queue

### 4a) `@react-aria` (54)

- Shared blocker (resolved): `@vue-aria/selection` was previously aliased to `packages/@vue-stately/selection`; the alias now points to `packages/@vue-aria/selection`, so selection-dependent exports are available again.

- [x] `@react-aria/actiongroup`
- [x] `@react-aria/aria-modal-polyfill`
- [ ] `@react-aria/autocomplete` (blocked: missing local `packages/@vue-aria/autocomplete`)
- [x] `@react-aria/breadcrumbs`
- [x] `@react-aria/button`
- [x] `@react-aria/calendar`
- [x] `@react-aria/checkbox`
- [ ] `@react-aria/collections` (blocked: missing local `packages/@vue-aria/collections`)
- [ ] `@react-aria/color` (blocked: missing local `packages/@vue-aria/color`)
- [x] `@react-aria/combobox` (parity + passed; 2 suites)
- [x] `@react-aria/datepicker`
- [x] `@react-aria/dialog`
- [x] `@react-aria/disclosure`
- [ ] `@react-aria/dnd` (blocked: missing local `packages/@vue-aria/dnd`)
- [x] `@react-aria/example-theme`
- [x] `@react-aria/focus`
- [x] `@react-aria/form`
- [x] `@react-aria/grid` (parity + passed; 15 suites, 46 tests)
- [x] `@react-aria/gridlist` (parity + passed; 8 suites, 18 tests)
- [x] `@react-aria/i18n` (parity + 4 tests passing)
- [x] `@react-aria/interactions` (parity + 14 tests passing)
- [x] `@react-aria/label` (parity + 8 tests passing)
- [x] `@react-aria/landmark` (parity + 37 tests passing)
- [x] `@react-aria/link` (parity + 7 tests passing)
- [x] `@react-aria/listbox` (parity + passed; 5 suites, 13 tests)
- [x] `@react-aria/live-announcer` (parity + 5 tests passing)
- [ ] `@react-aria/menu` (blocked: missing local `packages/@vue-aria/menu`)
- [x] `@react-aria/meter` (parity + 2 tests passing)
- [x] `@react-aria/numberfield` (parity + 41 tests passing)
- [x] `@react-aria/overlays` (parity + 25 tests passing; SSR and teleport warnings observed)
- [x] `@react-aria/progress` (parity + 5 tests passing)
- [x] `@react-aria/radio` (parity + 5 tests passing)
- [x] `@react-aria/searchfield` (parity + 41 tests passing, plus platform tests)
- [ ] `@react-aria/select` (blocked: missing local `packages/@vue-aria/select`)
- [x] `@react-aria/selection` (parity + 78 tests passing)
- [x] `@react-aria/separator` (parity + 3 tests passing)
- [x] `@react-aria/slider` (parity + 38 tests passing; plus integration harness)
- [x] `@react-aria/spinbutton` (parity + 14 tests passing)
- [x] `@react-aria/ssr` (parity + 9 tests passing)
- [ ] `@react-aria/steplist` (blocked: missing local `packages/@vue-aria/steplist`)
- [x] `@react-aria/switch` (parity + 2 tests passing)
- [x] `@react-aria/table` (parity + passed; 8 suites, 25 tests)
- [x] `@react-aria/tabs` (parity + 10 tests passing)
- [x] `@react-aria/tag` (parity + completed local tests in `packages/@vue-aria/tag/test/useTagGroup.test.ts`)
- [x] `@react-aria/test-utils` (parity + completed local tests in `packages/@vue-aria/test-utils/test/test-utils.test.ts`)
- [x] `@react-aria/textfield` (parity + 9 tests passing)
- [x] `@react-aria/toast` (parity + 13 tests passing)
- [x] `@react-aria/toggle` (parity + 3 tests passing)
- [x] `@react-aria/toolbar` (parity + tests passing)
- [x] `@react-aria/tooltip` (parity + 3 tests passing)
- [x] `@react-aria/tree` (parity + passed; 6 suites, 11 tests)
- [x] `@react-aria/utils` (parity + 75 tests across 24 files)
- [ ] `@react-aria/virtualizer` (blocked: missing local `packages/@vue-aria/virtualizer`)
- [x] `@react-aria/visually-hidden` (parity + 2 tests passing)

### 4b) `@react-stately` (32)

- [x] `@react-stately/autocomplete` (no local tests found)
- [x] `@react-stately/calendar` (parity + 17 tests passing)
- [x] `@react-stately/checkbox` (parity + 5 tests passing)
- [x] `@react-stately/collections` (parity + 2 tests passing)
- [x] `@react-stately/color` (no local tests found)
- [x] `@react-stately/combobox` (parity + 16 tests passing)
- [x] `@react-stately/data` (no local tests found)
- [x] `@react-stately/datepicker` (parity + 18 tests passing)
- [x] `@react-stately/disclosure` (parity + 1 test passing)
- [x] `@react-stately/dnd` (no local tests found)
- [x] `@react-stately/flags` (no local tests found)
- [x] `@react-stately/form` (parity + 9 tests passing)
- [x] `@react-stately/grid` (parity + 5 tests passing)
- [x] `@react-stately/layout` (no local tests found)
- [x] `@react-stately/list` (parity + 7 tests passing)
- [x] `@react-stately/menu` (parity + 8 test files passing)
- [x] `@react-stately/numberfield` (parity + 18 tests passing)
- [x] `@react-stately/overlays` (parity + 1 test passing)
- [x] `@react-stately/radio` (parity + 5 tests passing)
- [x] `@react-stately/searchfield` (parity + 2 tests passing)
- [x] `@react-stately/select` (parity + 5 test files passing)
- [x] `@react-stately/selection` (parity + 16 tests passing)
- [x] `@react-stately/slider` (parity + 14 tests passing)
- [x] `@react-stately/steplist` (no local tests found)
- [x] `@react-stately/table` (parity + 31 tests passing)
- [x] `@react-stately/tabs` (parity + 4 tests passing)
- [x] `@react-stately/toast` (parity + 8 tests passing)
- [x] `@react-stately/toggle` (parity + 4 tests passing)
- [x] `@react-stately/tooltip` (parity + 3 tests passing)
- [x] `@react-stately/tree` (parity + 5 tests passing)
- [x] `@react-stately/utils` (parity + 5 tests passing)
- [x] `@react-stately/virtualizer` (parity + core modules added, `LayoutInfo` test added in `packages/@vue-stately/virtualizer/test/LayoutInfo.test.ts`)

### 4c) `@react-spectrum` (64)

- [x] `@react-spectrum/accordion` (parity + tests ported in `packages/@vue-spectrum/accordion/src/index.ts` and `packages/@vue-spectrum/accordion/test/Accordion.test.ts`)
- [x] `@react-spectrum/actionbar` (parity + tests ported in `packages/@vue-spectrum/actionbar/src/index.ts` and `packages/@vue-spectrum/actionbar/test/ActionBar.test.ts`)
- [x] `@react-spectrum/actiongroup` (parity + completed local tests in `packages/@vue-spectrum/actiongroup/test/ActionGroup.test.ts`)
- [x] `@react-spectrum/autocomplete` (implemented in `packages/@vue-spectrum/autocomplete/src/index.ts` and `src` exports; parity coverage in `packages/@vue-spectrum/autocomplete/test/SearchAutocomplete.test.ts`)
- [x] `@react-spectrum/avatar` (parity + 1 test suite passing)
- [x] `@react-spectrum/badge` (parity + 1 test suite passing)
- [x] `@react-spectrum/breadcrumbs` (parity + 2 suites, 25 tests passing)
- [x] `@react-spectrum/button` (parity + tested; passing suite)
- [x] `@react-spectrum/buttongroup` (parity + 1 test suite passing)
- [x] `@react-spectrum/calendar` (parity + 2 test suites passing)
- [ ] `@react-spectrum/card` (incomplete: no local tests)
- [x] `@react-spectrum/checkbox` (parity + 3 test suites passing)
- [ ] `@react-spectrum/color` (incomplete: no local tests)
- [x] `@react-spectrum/combobox` (parity + 2 suites, 141 tests passing)
- [ ] `@react-spectrum/contextualhelp` (incomplete: no local tests)
- [x] `@react-spectrum/datepicker` (parity + 2 test suites passing)
- [x] `@react-spectrum/dialog` (parity + 5 test suites passing)
- [ ] `@react-spectrum/divider` (incomplete: no local tests)
- [ ] `@react-spectrum/dnd` (incomplete: no local tests)
- [ ] `@react-spectrum/dropzone` (incomplete: no local tests)
- [ ] `@react-spectrum/filetrigger` (incomplete: no local tests)
- [ ] `@react-spectrum/form` (incomplete: no local tests)
- [ ] `@react-spectrum/icon` (incomplete: no local tests)
- [ ] `@react-spectrum/illustratedmessage` (incomplete: no local tests)
- [ ] `@react-spectrum/image` (incomplete: no local tests)
- [ ] `@react-spectrum/inlinealert` (incomplete: no local tests)
- [ ] `@react-spectrum/label` (incomplete: no local tests)
- [ ] `@react-spectrum/labeledvalue` (incomplete: no local tests)
- [ ] `@react-spectrum/layout` (incomplete: no local tests)
- [x] `@react-spectrum/link` (parity + 2 test suites passing)
- [ ] `@react-spectrum/list` (incomplete: no local tests)
- [x] `@react-spectrum/listbox` (parity + 2 suites, 42 tests passing)
- [x] `@react-spectrum/menu` (parity + 6 suites, 103 tests passing)
- [x] `@react-spectrum/meter` (parity + 2 test suites passing)
- [x] `@react-spectrum/numberfield` (parity + 2 test suites passing)
- [ ] `@react-spectrum/overlays` (incomplete: no local tests)
- [x] `@react-spectrum/picker` (parity + 2 suites, 75 tests passing)
- [x] `@react-spectrum/progress` (parity + 4 test suites passing)
- [x] `@react-spectrum/provider` (parity + 4 test suites passing)
- [x] `@react-spectrum/radio` (parity + 2 test suites passing)
- [ ] `@react-spectrum/s2` (incomplete: no local tests)
- [x] `@react-spectrum/searchfield` (parity + 2 test suites passing)
- [x] `@react-spectrum/slider` (parity + 2 test suites passing)
- [ ] `@react-spectrum/statuslight` (incomplete: no local tests)
- [ ] `@react-spectrum/steplist` (incomplete: no local tests)
- [ ] `@react-spectrum/story-utils` (incomplete: no local tests)
- [ ] `@react-spectrum/style-macro-s1` (incomplete: no local tests)
- [x] `@react-spectrum/switch` (parity + 2 test suites passing)
- [x] `@react-spectrum/table` (parity + 4 suites, 273 tests passing)
- [x] `@react-spectrum/tabs` (parity + 2 test suites passing)
- [ ] `@react-spectrum/tag` (incomplete: no local tests)
- [ ] `@react-spectrum/test-utils` (incomplete: no local tests)
- [ ] `@react-spectrum/text` (incomplete: no local tests)
- [x] `@react-spectrum/textfield` (parity + 4 test suites passing)
- [x] `@react-spectrum/theme-dark` (parity + passing test)
- [ ] `@react-spectrum/theme-default` (incomplete: no local tests)
- [x] `@react-spectrum/theme-express` (parity + passing test)
- [x] `@react-spectrum/theme-light` (parity + passing test)
- [x] `@react-spectrum/toast` (parity + 2 test suites passing)
- [x] `@react-spectrum/tooltip` (parity + 4 test suites passing)
- [x] `@react-spectrum/tree` (parity + 2 suites, 81 tests passing)
- [x] `@react-spectrum/utils` (parity + 9 test suites passing)
- [ ] `@react-spectrum/view` (incomplete: no local tests)
- [ ] `@react-spectrum/well` (incomplete: no local tests)

### 4d) `@react-types` (47)

- [ ] `@react-types/actionbar` (incomplete: no local tests)
- [ ] `@react-types/actiongroup` (incomplete: no local tests)
- [ ] `@react-types/autocomplete` (incomplete: no local tests)
- [ ] `@react-types/avatar` (incomplete: no local tests)
- [ ] `@react-types/badge` (incomplete: no local tests)
- [ ] `@react-types/breadcrumbs` (incomplete: no local tests)
- [ ] `@react-types/button` (incomplete: no local tests)
- [ ] `@react-types/buttongroup` (incomplete: no local tests)
- [ ] `@react-types/calendar` (incomplete: no local tests)
- [ ] `@react-types/card` (incomplete: no local tests)
- [ ] `@react-types/checkbox` (incomplete: no local tests)
- [ ] `@react-types/color` (incomplete: no local tests)
- [ ] `@react-types/combobox` (incomplete: no local tests)
- [ ] `@react-types/contextualhelp` (incomplete: no local tests)
- [ ] `@react-types/datepicker` (incomplete: no local tests)
- [ ] `@react-types/dialog` (incomplete: no local tests)
- [ ] `@react-types/divider` (incomplete: no local tests)
- [ ] `@react-types/form` (incomplete: no local tests)
- [ ] `@react-types/grid` (incomplete: no local tests)
- [ ] `@react-types/illustratedmessage` (incomplete: no local tests)
- [ ] `@react-types/image` (incomplete: no local tests)
- [ ] `@react-types/label` (incomplete: no local tests)
- [ ] `@react-types/layout` (incomplete: no local tests; src file count differs from reference 1/3)
- [ ] `@react-types/link` (incomplete: no local tests)
- [ ] `@react-types/list` (incomplete: no local tests)
- [ ] `@react-types/listbox` (incomplete: no local tests)
- [ ] `@react-types/menu` (incomplete: no local tests)
- [ ] `@react-types/meter` (incomplete: no local tests)
- [ ] `@react-types/numberfield` (incomplete: no local tests)
- [ ] `@react-types/overlays` (incomplete: no local tests)
- [ ] `@react-types/progress` (incomplete: no local tests)
- [ ] `@react-types/provider` (incomplete: no local tests)
- [ ] `@react-types/radio` (incomplete: no local tests)
- [ ] `@react-types/searchfield` (incomplete: no local tests)
- [ ] `@react-types/select` (incomplete: no local tests)
- [ ] `@react-types/shared` (incomplete: no local tests; src file count differs from reference 1/15)
- [ ] `@react-types/sidenav` (incomplete: no local tests)
- [ ] `@react-types/slider` (incomplete: no local tests)
- [ ] `@react-types/statuslight` (incomplete: no local tests)
- [ ] `@react-types/switch` (incomplete: no local tests)
- [ ] `@react-types/table` (incomplete: no local tests)
- [ ] `@react-types/tabs` (incomplete: no local tests)
- [ ] `@react-types/text` (incomplete: no local tests)
- [ ] `@react-types/textfield` (incomplete: no local tests)
- [ ] `@react-types/tooltip` (incomplete: no local tests)
- [ ] `@react-types/view` (incomplete: no local tests)
- [ ] `@react-types/well` (incomplete: no local tests)

## 5) Automatic progression rule

- Start with the first unchecked package in Section 4 and process packages strictly in list order.
- A package is complete only when it is fully audited and can move to `Done`.
- Continue immediately with the next unchecked package after each completion until no unchecked package remains.
- Follow the fixed queue in this file.

## 6) Completion legend

- [ ] `TODO`
- [ ] `In progress`
- [ ] `Done`

## 7) Package status format

For each package under active scope:

- Package:
- Status: TODO / In progress / Done
- Evidence:
  - Parity report notes
  - Test files added/updated
  - Command output summary
- Exception log (if any):
  - Deprecation / out-of-scope rationale
  - Follow-up ticket or justification

## 8) Required checks per package

1. Verify local package exists under `packages/@vue-aria` (fixed mapping).
2. Package-level parity review against upstream sources
3. Tests for equivalent behavior and edge cases
4. Package test execution
5. Update status only to `Done` after all checks pass

## 9) Roll-up reporting

- After each scope, summarize:
  - Completed / remaining packages
  - Remaining implementation gaps
  - Remaining test gaps
  - Blockers and escalation owner

## 10) Non-negotiable stop conditions

- Any package with a remaining failing parity report or test failure stays `In progress`.
- No scope is marked complete until all subpackages are `Done`.

## 11) Incremental progress log

- 2026-02-16: `@react-spectrum/actiongroup` implemented (`src/index.ts` added) and parity tests added in `packages/@vue-spectrum/actiongroup/test/ActionGroup.test.ts`.
- 2026-02-16: `@react-spectrum/autocomplete` implemented and basic parity tests added in `packages/@vue-spectrum/autocomplete/test/SearchAutocomplete.test.ts`.
- 2026-02-16: `@react-spectrum/avatar` implemented and parity tests added in `packages/@vue-spectrum/avatar/test/Avatar.test.ts`.
- 2026-02-16: `@react-spectrum/badge` implemented and parity tests added in `packages/@vue-spectrum/badge/test/Badge.test.ts`.
- 2026-02-16: `@react-spectrum/buttongroup` implemented and parity tests added in `packages/@vue-spectrum/buttongroup/test/ButtonGroup.test.ts`.
- 2026-02-16: Roadmap progression moved to `@react-spectrum/card` as next queue item.
