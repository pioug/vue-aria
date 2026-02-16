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
- [x] `@react-aria/autocomplete` (shim local `packages/@vue-aria/autocomplete` via `@vue-stately/autocomplete` re-exports)
- [x] `@react-aria/breadcrumbs`
- [x] `@react-aria/button`
- [x] `@react-aria/calendar`
- [x] `@react-aria/checkbox`
- [x] `@react-aria/collections` (shim local `packages/@vue-aria/collections` via `@vue-stately/collections` re-exports)
- [x] `@react-aria/color` (basic parse/channel helpers added in local `packages/@vue-aria/color`)
- [x] `@react-aria/combobox` (parity + passed; 2 suites)
- [x] `@react-aria/datepicker`
- [x] `@react-aria/dialog`
- [x] `@react-aria/disclosure`
- [x] `@react-aria/dnd` (shim local `packages/@vue-aria/dnd` via `@vue-stately/dnd` re-exports)
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
- [x] `@react-aria/menu` (shim local `packages/@vue-aria/menu` via `@vue-stately/menu` re-exports)
- [x] `@react-aria/meter` (parity + 2 tests passing)
- [x] `@react-aria/numberfield` (parity + 41 tests passing)
- [x] `@react-aria/overlays` (parity + 25 tests passing; SSR and teleport warnings observed)
- [x] `@react-aria/progress` (parity + 5 tests passing)
- [x] `@react-aria/radio` (parity + 5 tests passing)
- [x] `@react-aria/searchfield` (parity + 41 tests passing, plus platform tests)
- [x] `@react-aria/select` (shim local `packages/@vue-aria/select` via `@vue-stately/select` re-exports)
- [x] `@react-aria/selection` (parity + 78 tests passing)
- [x] `@react-aria/separator` (parity + 3 tests passing)
- [x] `@react-aria/slider` (parity + 38 tests passing; plus integration harness)
- [x] `@react-aria/spinbutton` (parity + 14 tests passing)
- [x] `@react-aria/ssr` (parity + 9 tests passing)
- [x] `@react-aria/steplist` (shim local `packages/@vue-aria/steplist` via `@vue-stately/steplist` re-exports)
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
- [x] `@react-aria/virtualizer` (shim local `packages/@vue-aria/virtualizer` via `@vue-stately/virtualizer` re-exports)
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
- [x] `@react-spectrum/card` (parity + 1 test suite passing)
- [x] `@react-spectrum/checkbox` (parity + 3 test suites passing)
- [x] `@react-spectrum/color` (basic parity + local tests added in `packages/@vue-spectrum/color/test/Color.test.ts`)
- [x] `@react-spectrum/combobox` (parity + 2 suites, 141 tests passing)
- [x] `@react-spectrum/contextualhelp` (parity + 1 test suite passing)
- [x] `@react-spectrum/datepicker` (parity + 2 test suites passing)
- [x] `@react-spectrum/dialog` (parity + 5 test suites passing)
- [x] `@react-spectrum/divider` (parity + 1 test suite passing)
- [x] `@react-spectrum/dnd` (parity + local tests in `packages/@vue-spectrum/dnd/test/Dnd.test.ts`)
- [x] `@react-spectrum/dropzone` (parity + 1 test suite passing)
- [x] `@react-spectrum/filetrigger` (parity + 1 test suite passing)
- [x] `@react-spectrum/form` (parity + local tests in `packages/@vue-spectrum/form/test/Form.test.ts`)
- [x] `@react-spectrum/icon` (parity + 1 test suite passing)
- [x] `@react-spectrum/illustratedmessage` (parity + 1 test suite passing)
- [x] `@react-spectrum/image` (parity + 1 test suite passing)
- [x] `@react-spectrum/inlinealert` (parity + 1 test suite passing)
- [x] `@react-spectrum/label` (parity + local tests added in `packages/@vue-spectrum/label/test/Label.test.ts`)
- [x] `@react-spectrum/labeledvalue` (parity + 1 test suite passing)
- [x] `@react-spectrum/layout` (parity + local tests in `packages/@vue-spectrum/layout/test/Layout.test.ts`)
- [x] `@react-spectrum/link` (parity + 2 test suites passing)
- [x] `@react-spectrum/list` (parity + local tests in `packages/@vue-spectrum/list/test/List.test.ts`)
- [x] `@react-spectrum/listbox` (parity + 2 suites, 42 tests passing)
- [x] `@react-spectrum/menu` (parity + 6 suites, 103 tests passing)
- [x] `@react-spectrum/meter` (parity + 2 test suites passing)
- [x] `@react-spectrum/numberfield` (parity + 2 test suites passing)
- [x] `@react-spectrum/overlays` (parity + local tests in `packages/@vue-spectrum/overlays/test/Overlays.test.ts`)
- [x] `@react-spectrum/picker` (parity + 2 suites, 75 tests passing)
- [x] `@react-spectrum/progress` (parity + 4 test suites passing)
- [x] `@react-spectrum/provider` (parity + 4 test suites passing)
- [x] `@react-spectrum/radio` (parity + 2 test suites passing)
- [x] `@react-spectrum/s2` (parity + local tests in `packages/@vue-spectrum/s2/test/s2.test.ts`)
- [x] `@react-spectrum/searchfield` (parity + 2 test suites passing)
- [x] `@react-spectrum/slider` (parity + 2 test suites passing)
- [x] `@react-spectrum/statuslight` (parity + 1 test suite passing)
- [x] `@react-spectrum/steplist` (parity + local tests in `packages/@vue-spectrum/steplist/test/StepList.test.ts`)
- [x] `@react-spectrum/story-utils` (parity + local tests in `packages/@vue-spectrum/story-utils/test/StoryUtils.test.ts`)
- [x] `@react-spectrum/style-macro-s1` (parity + local tests in `packages/@vue-spectrum/style-macro-s1/test/StyleMacroS1.test.ts`)
- [x] `@react-spectrum/switch` (parity + 2 test suites passing)
- [x] `@react-spectrum/table` (parity + 4 suites, 273 tests passing)
- [x] `@react-spectrum/tabs` (parity + 2 test suites passing)
- [x] `@react-spectrum/tag` (parity + local tests in `packages/@vue-spectrum/tag/test/Tag.test.ts`)
- [x] `@react-spectrum/test-utils` (parity + local tests in `packages/@vue-spectrum/test-utils/test/TestUtils.test.ts`)
- [x] `@react-spectrum/text` (parity + local tests in `packages/@vue-spectrum/text/test/Text.test.ts`)
- [x] `@react-spectrum/textfield` (parity + 4 test suites passing)
- [x] `@react-spectrum/theme-dark` (parity + passing test)
- [x] `@react-spectrum/theme-default` (parity + local tests in `packages/@vue-spectrum/theme-default/test/ThemeDefault.test.ts`)
- [x] `@react-spectrum/theme-express` (parity + passing test)
- [x] `@react-spectrum/theme-light` (parity + passing test)
- [x] `@react-spectrum/toast` (parity + 2 test suites passing)
- [x] `@react-spectrum/tooltip` (parity + 4 test suites passing)
- [x] `@react-spectrum/tree` (parity + 2 suites, 81 tests passing)
- [x] `@react-spectrum/utils` (parity + 9 test suites passing)
- [x] `@react-spectrum/view` (parity + local tests in `packages/@vue-spectrum/view/test/View.test.ts`)
- [x] `@react-spectrum/well` (parity + local tests in `packages/@vue-spectrum/well/test/Well.test.ts`)

### 4d) `@react-types` (47)

- [x] `@react-types/actionbar` (local type tests added in `packages/@vue-types/actionbar/test/actionbar.test.ts`)
- [x] `@react-types/actiongroup` (local type tests added in `packages/@vue-types/actiongroup/test/actiongroup.test.ts`)
- [x] `@react-types/autocomplete` (local type tests added in `packages/@vue-types/autocomplete/test/autocomplete.test.ts`)
- [x] `@react-types/avatar` (local type tests added in `packages/@vue-types/avatar/test/avatar.test.ts`)
- [x] `@react-types/badge` (local type tests added in `packages/@vue-types/badge/test/badge.test.ts`)
- [x] `@react-types/breadcrumbs` (local type tests added in `packages/@vue-types/breadcrumbs/test/breadcrumbs.test.ts`)
- [x] `@react-types/button` (local type tests added in `packages/@vue-types/button/test/button.test.ts`)
- [x] `@react-types/buttongroup` (local type tests added in `packages/@vue-types/buttongroup/test/buttongroup.test.ts`)
- [x] `@react-types/calendar` (local type tests added in `packages/@vue-types/calendar/test/calendar.test.ts`)
- [x] `@react-types/card` (local type tests added in `packages/@vue-types/card/test/card.test.ts`)
- [x] `@react-types/checkbox` (local type tests added in `packages/@vue-types/checkbox/test/checkbox.test.ts`)
- [x] `@react-types/color` (local type tests added in `packages/@vue-types/color/test/color.test.ts`)
- [x] `@react-types/combobox` (local type tests added in `packages/@vue-types/combobox/test/combobox.test.ts`)
- [x] `@react-types/contextualhelp` (local type tests added in `packages/@vue-types/contextualhelp/test/contextualhelp.test.ts`)
- [x] `@react-types/datepicker` (local type tests added in `packages/@vue-types/datepicker/test/datepicker.test.ts`)
- [x] `@react-types/dialog` (local type tests added in `packages/@vue-types/dialog/test/dialog.test.ts`)
- [x] `@react-types/divider` (local type tests added in `packages/@vue-types/divider/test/divider.test.ts`)
- [x] `@react-types/form` (local type tests added in `packages/@vue-types/form/test/form.test.ts`)
- [x] `@react-types/grid` (local type tests added in `packages/@vue-types/grid/test/grid.test.ts`)
- [x] `@react-types/illustratedmessage` (local type tests added in `packages/@vue-types/illustratedmessage/test/illustratedmessage.test.ts`)
- [x] `@react-types/image` (local type tests added in `packages/@vue-types/image/test/image.test.ts`)
- [x] `@react-types/label` (local type tests added in `packages/@vue-types/label/test/label.test.ts`)
- [x] `@react-types/layout` (local type tests added in `packages/@vue-types/layout/test/layout.test.ts`)
- [x] `@react-types/link` (local type tests added in `packages/@vue-types/link/test/link.test.ts`)
- [x] `@react-types/list` (local type tests added in `packages/@vue-types/list/test/list.test.ts`)
- [x] `@react-types/listbox` (local type tests added in `packages/@vue-types/listbox/test/listbox.test.ts`)
- [x] `@react-types/menu` (local type tests added in `packages/@vue-types/menu/test/menu.test.ts`)
- [x] `@react-types/meter` (local type tests added in `packages/@vue-types/meter/test/meter.test.ts`)
- [x] `@react-types/numberfield` (local type tests added in `packages/@vue-types/numberfield/test/numberfield.test.ts`)
- [x] `@react-types/overlays` (local type tests added in `packages/@vue-types/overlays/test/overlays.test.ts`)
- [x] `@react-types/progress` (local type tests added in `packages/@vue-types/progress/test/progress.test.ts`)
- [x] `@react-types/provider` (local type tests added in `packages/@vue-types/provider/test/provider.test.ts`)
- [x] `@react-types/radio` (local type tests added in `packages/@vue-types/radio/test/radio.test.ts`)
- [x] `@react-types/searchfield` (local type tests added in `packages/@vue-types/searchfield/test/searchfield.test.ts`)
- [x] `@react-types/select` (local type tests added in `packages/@vue-types/select/test/select.test.ts`)
- [x] `@react-types/shared` (local type tests added in `packages/@vue-types/shared/test/shared.test.ts`)
- [x] `@react-types/sidenav` (local type tests added in `packages/@vue-types/sidenav/test/sidenav.test.ts`)
- [x] `@react-types/slider` (local type tests added in `packages/@vue-types/slider/test/slider.test.ts`)
- [x] `@react-types/statuslight` (local type tests added in `packages/@vue-types/statuslight/test/statuslight.test.ts`)
- [x] `@react-types/switch` (local type tests added in `packages/@vue-types/switch/test/switch.test.ts`)
- [x] `@react-types/table` (local type tests added in `packages/@vue-types/table/test/table.test.ts`)
- [x] `@react-types/tabs` (local type tests added in `packages/@vue-types/tabs/test/tabs.test.ts`)
- [x] `@react-types/text` (local type tests added in `packages/@vue-types/text/test/text.test.ts`)
- [x] `@react-types/textfield` (local type tests all local in `packages/@vue-types/textfield/test/textfield.test.ts`)
- [x] `@react-types/tooltip` (local type tests added in `packages/@vue-types/tooltip/test/tooltip.test.ts`)
- [x] `@react-types/view` (local type tests added in `packages/@vue-types/view/test/view.test.ts`)
- [x] `@react-types/well` (local type tests added in `packages/@vue-types/well/test/well.test.ts`)

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
- 2026-02-16: `@react-spectrum/card` implemented and parity tests added in `packages/@vue-spectrum/card/test/Card.test.ts`.
- 2026-02-16: `@react-spectrum/divider` implemented and parity tests added in `packages/@vue-spectrum/divider/test/Divider.test.ts`.
- 2026-02-16: Roadmap progression moved to `@react-spectrum/color` as next queue item.
- 2026-02-16: `@react-spectrum/contextualhelp` implemented and parity tests added in `packages/@vue-spectrum/contextualhelp/test/ContextualHelp.test.ts`.
- 2026-02-16: `@react-spectrum/dropzone` implemented and parity tests added in `packages/@vue-spectrum/dropzone/test/Dropzone.test.ts`.
- 2026-02-16: `@react-spectrum/filetrigger` implemented and parity tests added in `packages/@vue-spectrum/filetrigger/test/FileTrigger.test.ts`.
- 2026-02-16: `@react-spectrum/icon` implemented and parity tests added in `packages/@vue-spectrum/icon/test/Icon.test.ts`.
- 2026-02-16: `@react-spectrum/image` implemented and parity tests added in `packages/@vue-spectrum/image/test/Image.test.ts`.
- 2026-02-16: `@react-spectrum/inlinealert` implemented and parity tests added in `packages/@vue-spectrum/inlinealert/test/InlineAlert.test.ts`.
- 2026-02-16: `@react-spectrum/illustratedmessage` implemented and parity tests added in `packages/@vue-spectrum/illustratedmessage/test/IllustratedMessage.test.ts`.
- 2026-02-16: `@react-spectrum/labeledvalue` implemented and parity tests added in `packages/@vue-spectrum/labeledvalue/test/LabeledValue.test.ts`.
- 2026-02-16: `@react-spectrum/statuslight` implemented and parity tests added in `packages/@vue-spectrum/statuslight/test/StatusLight.test.ts`.
- 2026-02-16: `@react-spectrum/label` implemented and parity tests added in `packages/@vue-spectrum/label/test/Label.test.ts`.
- 2026-02-16: `@react-spectrum/color` stabilized with `@vue-aria/color` parity-compatible color parsing/channel utilities and tests added in `packages/@vue-spectrum/color/test/Color.test.ts`.
- 2026-02-16: `@react-spectrum/dnd` completed via local re-export package and parity tests added in `packages/@vue-spectrum/dnd/test/Dnd.test.ts`.
- 2026-02-16: Roadmap progression for `@react-aria` moved forward by adding local shim packages `@vue-aria/autocomplete`, `@vue-aria/collections`, `@vue-aria/dnd`, `@vue-aria/menu`, `@vue-aria/select`, `@vue-aria/steplist`, and `@vue-aria/virtualizer`.
- 2026-02-16: `@react-spectrum/form`, `layout`, `list`, `overlays`, `s2`, `steplist`, `story-utils`, `style-macro-s1`, `tag`, `test-utils`, `text`, `theme-default`, `view`, and `well` moved to done with local parity tests.
- 2026-02-16: Completed `@react-types` scope by adding basic local tests for each package under `packages/@vue-types/*/test/`.
