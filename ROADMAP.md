# Vue Aria / Vue Spectrum Roadmap

Last updated: 2026-02-13
Source of truth: `/Users/piou/Dev/vue-aria/PLAN.md`

## 1) Program Status
- Overall status: Not started
- Current phase: Bootstrap from scratch
- Current focus package: TBD
- Scope note: Ignore Spectrum S2 (next Spectrum version). Port only the current upstream Spectrum version unless explicitly requested otherwise.
- Blockers:
  - Upstream source code import pending into `/Users/piou/Dev/vue-aria/upstream`
  - Initial monorepo scaffolding pending

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
- `@vue-aria/utils`: Not started
- `@vue-aria/i18n`: Not started
- `@vue-aria/ssr`: Not started
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

## 5) Package Record Template
Copy this section for each package and keep it up to date.

## Package: <package-name>
- Upstream source path(s):
- Local package path:
- Status: Not started
- Owner: Codex

### Scope
- [ ] Upstream modules enumerated
- [ ] Public API checklist complete

### Implementation
- [ ] Core composables/components/helpers ported
- [ ] Folder structure mirrors upstream
- [ ] Vue idioms applied (`v-model`, slots, emits, provide/inject, refs)

### Tests
- Total upstream test files: 0
- Ported test files: 0
- Passing test files: 0
- Test parity notes:
  - None
- [ ] All relevant tests migrated
- [ ] All migrated tests passing

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
  - None

### Open Gaps
- None

### Next Actions
1. Enumerate upstream API and tests.
2. Port implementation.
3. Port tests and make them pass.
4. Port docs/examples/styles.
5. Mark completion only after all gates pass.

## 6) Session Log
### 2026-02-13
- Initialized roadmap from scratch.
- Added global completion gates and queue.
- Added reusable package parity template.
- Next step: import upstream source tree and scaffold initial monorepo packages.
