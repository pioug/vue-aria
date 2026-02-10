# Spectrum Component Layer

This section tracks the Vue port of React Spectrum UI component packages.

## Scope

- Upstream source: `references/react-spectrum/packages/@react-spectrum/*`
- Local target scope: `packages/@vue-spectrum/*`
- Current stage: phase-1 foundation migration plus initial display/action packages (`@vue-spectrum/icon`, `@vue-spectrum/form`, `@vue-spectrum/label`, `@vue-spectrum/text`, `@vue-spectrum/view`, `@vue-spectrum/layout`, `@vue-spectrum/link`, `@vue-spectrum/breadcrumbs`, `@vue-spectrum/buttongroup`, `@vue-spectrum/accordion`, `@vue-spectrum/divider`, `@vue-spectrum/well`, `@vue-spectrum/statuslight`, `@vue-spectrum/badge`, `@vue-spectrum/avatar`, `@vue-spectrum/image`, `@vue-spectrum/progress`, `@vue-spectrum/meter`, `@vue-spectrum/labeledvalue`, `@vue-spectrum/checkbox`, `@vue-spectrum/radio`, and `@vue-spectrum/switch` complete) with active controls baseline work (`@vue-spectrum/button`, `@vue-spectrum/slider`).

## Current Baseline

- `@vue-spectrum/provider`: provider context primitives and media query helpers
- `@vue-spectrum/icon`: icon wrapper component primitives (`Icon`, `UIIcon`, `Illustration`)
- `@vue-spectrum/utils`: shared class-name utility baseline
- `@vue-spectrum/form`: form wrapper and form context primitives (`Form`, `useFormProps`, `useFormValidationErrors`)
- `@vue-spectrum/label`: field/label/help text primitives (`Field`, `Label`, `HelpText`)
- `@vue-spectrum/text`: typography primitives (`Text`, `Heading`, `Keyboard`)
- `@vue-spectrum/view`: semantic container primitives (`View`, `Content`, `Header`, `Footer`)
- `@vue-spectrum/layout`: grid/flex layout primitives (`Grid`, `Flex`, helper functions)
- `@vue-spectrum/button` (in progress): button primitives (`Button`, `ActionButton`, `ClearButton`, `FieldButton`, `LogicButton`, `ToggleButton`) with pending-state and expanded press lifecycle behavior
- `@vue-spectrum/buttongroup`: button-group primitive (`ButtonGroup`) with overflow-to-vertical behavior and disabled-context propagation
- `@vue-spectrum/accordion`: disclosure-group primitives (`Accordion`, `Disclosure`, `DisclosureTitle`, `DisclosurePanel`) with keyboard, controlled/uncontrolled expansion, and SSR parity coverage
- `@vue-spectrum/checkbox`: checkbox primitives (`Checkbox`, `CheckboxGroup`) with standalone/group state handling and validation semantics
- `@vue-spectrum/radio`: radio primitives (`Radio`, `RadioGroup`) with controlled/uncontrolled behavior, orientation, and group validation semantics
- `@vue-spectrum/switch`: switch field primitive (`Switch`) with controlled/uncontrolled behavior, read-only/disabled support, and ARIA labeling parity
- `@vue-spectrum/slider` (in progress): slider primitives (`Slider`, `RangeSlider`) with controlled/uncontrolled value handling, output label behavior, and baseline interaction coverage
- `@vue-spectrum/tabs` (in progress): tabs primitives (`Tabs`, `TabList`, `TabPanels`) with keyboard navigation and controlled/uncontrolled selection behavior
- `@vue-spectrum/textfield` (in progress): text input primitives (`TextField`, `TextArea`) with label/help/error semantics and controlled/uncontrolled value behavior
- `@vue-spectrum/link`: navigation link primitive (`Link`)
- `@vue-spectrum/breadcrumbs`: breadcrumb primitives (`Breadcrumbs`, `BreadcrumbItem`) with overflow/menu collapsing and link/action semantics
- `@vue-spectrum/divider`: divider primitive (`Divider`)
- `@vue-spectrum/well`: content well primitive (`Well`)
- `@vue-spectrum/statuslight`: status indicator primitive (`StatusLight`)
- `@vue-spectrum/badge`: metadata badge primitive (`Badge`)
- `@vue-spectrum/avatar`: avatar primitive (`Avatar`)
- `@vue-spectrum/image`: image primitive (`Image`)
- `@vue-spectrum/progress`: progress primitives (`ProgressBar`, `ProgressCircle`)
- `@vue-spectrum/meter`: meter primitive (`Meter`)
- `@vue-spectrum/labeledvalue`: labeled read-only value primitive (`LabeledValue`)
- `@vue-spectrum/card` (in progress): card primitives (`Card`, `CardView`, `GridLayout`, `GalleryLayout`, `WaterfallLayout`) with baseline keyboard and selection-state support
- `@vue-spectrum/vue-spectrum`: umbrella export package for the component layer

## Rules For Marking A Package Complete

1. Runtime behavior ported from upstream package intent.
2. Upstream-equivalent tests ported and passing.
3. Package docs page added under `docs/spectrum/`.
4. Package exported via `@vue-spectrum/vue-spectrum`.
5. Parity and repo checks pass:

```bash
npm run check
npm run test
npm run test:spectrum-parity
npm run test:cross-browser
```

## Tracker

- Checklist: `/SPECTRUM_PORTING_TRACKER.md`
- Strategy and phases: `/docs/porting/spectrum-roadmap.md`
- Cross-browser demos: `/docs/spectrum/cross-browser-demos.md`
- Theming baseline: `/docs/spectrum/theming-baseline.md`

## Scaffolding Helper

Create new package/docs/test stubs with:

```bash
npm run scaffold:spectrum-package -- <package-name>
```
