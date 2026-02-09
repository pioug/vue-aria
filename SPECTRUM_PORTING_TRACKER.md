# React Spectrum -> Vue Spectrum Port Tracker

This is the master checklist for parity with React Spectrum UI components in Vue.

## Progress Snapshot

- Completed packages: `1 / 64`
- Remaining packages: `63`
- Current stage: phase-1 foundation migration

## Upstream Source of Truth

- Repo submodule: `references/react-spectrum`
- Spectrum package roots: `references/react-spectrum/packages/@react-spectrum/*`
- Component behavior dependencies: `references/react-spectrum/packages/@react-aria/*` and `references/react-spectrum/packages/@react-stately/*`

## Completion Rules (Per Package)

1. Port runtime behavior in `packages/@vue-spectrum/<pkg>/src` with APIs and semantics aligned to upstream intent.
2. Port test scenarios from upstream into `packages/@vue-spectrum/<pkg>/test` and adapt for Vue.
3. Add docs page in `docs/spectrum/<pkg>.md` with usage, accessibility notes, and parity caveats.
4. Add/verify exports in umbrella entry (`@vue-spectrum/vue-spectrum`).
5. Mark package complete only after `npm run check`, `npm run test`, `npm run test:cross-browser`, and docs build pass.

## Program Setup (Not Counted In 64 Packages)

- [x] Create workspace scope `packages/@vue-spectrum/*` and monorepo TS references.
- [x] Add umbrella package `packages/@vue-spectrum/vue-spectrum`.
- [x] Add parity gate script `scripts/check-spectrum-parity.mjs` (tests + docs + exports coverage).
- [x] Add npm script `test:spectrum-parity` and wire into CI.
- [x] Add shared Spectrum docs section (`docs/spectrum/*`) and overview page.
- [x] Add cross-browser component harness pages for Spectrum components.
- [x] Define visual/theming baseline (tokens, scales, color schemes).
- [x] Add package scaffolding generator for one-package-per-upstream parity.

## Foundation, Theme, and Infrastructure

- In progress baseline: `@react-spectrum/provider`, `@react-spectrum/icon`, `@react-spectrum/utils`
- [ ] `@react-spectrum/provider` -> `@vue-spectrum/provider`
- [ ] `@react-spectrum/utils` -> `@vue-spectrum/utils`
- [ ] `@react-spectrum/icon` -> `@vue-spectrum/icon`
- [x] `@react-spectrum/form` -> `@vue-spectrum/form`
- [ ] `@react-spectrum/label` -> `@vue-spectrum/label`
- [ ] `@react-spectrum/layout` -> `@vue-spectrum/layout`
- [ ] `@react-spectrum/text` -> `@vue-spectrum/text`
- [ ] `@react-spectrum/view` -> `@vue-spectrum/view`
- [ ] `@react-spectrum/theme-default` -> `@vue-spectrum/theme-default`
- [ ] `@react-spectrum/theme-light` -> `@vue-spectrum/theme-light`
- [ ] `@react-spectrum/theme-dark` -> `@vue-spectrum/theme-dark`
- [ ] `@react-spectrum/theme-express` -> `@vue-spectrum/theme-express`
- [ ] `@react-spectrum/style-macro-s1` -> `@vue-spectrum/style-macro-s1`
- [ ] `@react-spectrum/test-utils` -> `@vue-spectrum/test-utils`
- [ ] `@react-spectrum/story-utils` -> `@vue-spectrum/story-utils` (internal)
- [ ] `@react-spectrum/s2` -> `@vue-spectrum/s2`

## Actions and Navigation

- [ ] `@react-spectrum/button` -> `@vue-spectrum/button`
- [ ] `@react-spectrum/actionbar` -> `@vue-spectrum/actionbar`
- [ ] `@react-spectrum/actiongroup` -> `@vue-spectrum/actiongroup`
- [ ] `@react-spectrum/buttongroup` -> `@vue-spectrum/buttongroup`
- [ ] `@react-spectrum/link` -> `@vue-spectrum/link`
- [ ] `@react-spectrum/breadcrumbs` -> `@vue-spectrum/breadcrumbs`
- [ ] `@react-spectrum/tabs` -> `@vue-spectrum/tabs`
- [ ] `@react-spectrum/accordion` -> `@vue-spectrum/accordion`
- [ ] `@react-spectrum/steplist` -> `@vue-spectrum/steplist`
- [ ] `@react-spectrum/tag` -> `@vue-spectrum/tag`
- [ ] `@react-spectrum/menu` -> `@vue-spectrum/menu`
- [ ] `@react-spectrum/picker` -> `@vue-spectrum/picker`

## Inputs and Selection

- [ ] `@react-spectrum/checkbox` -> `@vue-spectrum/checkbox`
- [ ] `@react-spectrum/radio` -> `@vue-spectrum/radio`
- [ ] `@react-spectrum/switch` -> `@vue-spectrum/switch`
- [ ] `@react-spectrum/slider` -> `@vue-spectrum/slider`
- [ ] `@react-spectrum/textfield` -> `@vue-spectrum/textfield`
- [ ] `@react-spectrum/searchfield` -> `@vue-spectrum/searchfield`
- [ ] `@react-spectrum/numberfield` -> `@vue-spectrum/numberfield`
- [ ] `@react-spectrum/combobox` -> `@vue-spectrum/combobox`
- [ ] `@react-spectrum/autocomplete` -> `@vue-spectrum/autocomplete`
- [ ] `@react-spectrum/color` -> `@vue-spectrum/color`
- [ ] `@react-spectrum/datepicker` -> `@vue-spectrum/datepicker`
- [ ] `@react-spectrum/calendar` -> `@vue-spectrum/calendar`
- [ ] `@react-spectrum/filetrigger` -> `@vue-spectrum/filetrigger`

## Lists, Tables, and Trees

- [ ] `@react-spectrum/list` -> `@vue-spectrum/list`
- [ ] `@react-spectrum/listbox` -> `@vue-spectrum/listbox`
- [ ] `@react-spectrum/table` -> `@vue-spectrum/table`
- [ ] `@react-spectrum/tree` -> `@vue-spectrum/tree`

## Overlays and Messaging

- [ ] `@react-spectrum/overlays` -> `@vue-spectrum/overlays`
- [ ] `@react-spectrum/dialog` -> `@vue-spectrum/dialog`
- [ ] `@react-spectrum/tooltip` -> `@vue-spectrum/tooltip`
- [ ] `@react-spectrum/contextualhelp` -> `@vue-spectrum/contextualhelp`
- [ ] `@react-spectrum/toast` -> `@vue-spectrum/toast`
- [ ] `@react-spectrum/inlinealert` -> `@vue-spectrum/inlinealert`
- [ ] `@react-spectrum/illustratedmessage` -> `@vue-spectrum/illustratedmessage`

## Drag and Drop

- [ ] `@react-spectrum/dnd` -> `@vue-spectrum/dnd`
- [ ] `@react-spectrum/dropzone` -> `@vue-spectrum/dropzone`

## Display and Status

- [ ] `@react-spectrum/avatar` -> `@vue-spectrum/avatar`
- [ ] `@react-spectrum/badge` -> `@vue-spectrum/badge`
- [ ] `@react-spectrum/card` -> `@vue-spectrum/card`
- [ ] `@react-spectrum/divider` -> `@vue-spectrum/divider`
- [ ] `@react-spectrum/image` -> `@vue-spectrum/image`
- [ ] `@react-spectrum/labeledvalue` -> `@vue-spectrum/labeledvalue`
- [ ] `@react-spectrum/meter` -> `@vue-spectrum/meter`
- [ ] `@react-spectrum/progress` -> `@vue-spectrum/progress`
- [ ] `@react-spectrum/statuslight` -> `@vue-spectrum/statuslight`
- [ ] `@react-spectrum/well` -> `@vue-spectrum/well`

## Initial Dependency Baseline To Confirm During Setup

- [ ] Keep and reuse existing: `@internationalized/date`, `@internationalized/number`, `clsx`.
- [ ] Add icon dependencies for component parity: `@spectrum-icons/ui`, `@spectrum-icons/workflow`.
- [ ] Evaluate theme/token source strategy (`@adobe/spectrum-css-temp` parity vs Vue-native token pipeline).
- [ ] Add only package-specific dependencies when first required by a ported package.
