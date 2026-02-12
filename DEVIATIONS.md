# Deviations

Track every divergence from upstream in this file.

## Template

- Package:
- Upstream reference:
- Difference:
- Reason:
- User impact:
- Removal plan:

## Active Deviations

- Package: `@vue-aria/utils`
- Upstream reference: `packages/@react-aria/utils` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package source/module surface is fully mirrored, including all current upstream utility modules, but several exports are Vue-first adaptations (especially render-timing hooks such as animation/effect/memo-related utilities) and do not yet mirror every React lifecycle edge case.
- Reason: Work is being done incrementally while keeping tests green and preserving dependency order.
- User impact: Upstream-named exports are available, but a subset of hook timing semantics may differ in edge cases until full behavioral parity work is finished.
- Removal plan: Add targeted behavior tests for newly adapted utilities and tighten lifecycle semantics to match upstream React behavior, then clear this deviation.

- Package: `@vue-aria/test-utils`
- Upstream reference: `packages/@react-aria/test-utils` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React testing utilities (`react`, `react-dom`, `@testing-library/react`) rather than Vue testing adapters.
- Reason: This package is used only for test harnessing and was ported incrementally to preserve dependency order while higher-priority runtime packages are being established.
- User impact: This package is not yet a Vue-native testing utility surface; consumers should treat it as transitional.
- Removal plan: Replace React-specific helpers with Vue Test Utils + Vue Testing Library equivalents and update peer dependencies accordingly.

- Package: `@vue-types/shared`
- Upstream reference: `packages/@react-types/shared` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Type declarations are currently mirrored from upstream and still include React-centric imports (for example `react` event/ref types).
- Reason: The package was ported as a structural baseline first to unlock dependency order; Vue-specific type mapping has not yet been completed.
- User impact: Consumers may need React type packages for complete type resolution in this package until Vue-native type aliases are introduced.
- Removal plan: Replace React-specific declarations with Vue-native equivalents and compatibility aliases, then remove this entry and set `hasDeviations` to `false`.

- Package: `@vue-types/actionbar`
- Upstream reference: `packages/@react-types/actionbar` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/actionbar declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/actiongroup`
- Upstream reference: `packages/@react-types/actiongroup` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactElement` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/actiongroup declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/badge`
- Upstream reference: `packages/@react-types/badge` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/badge declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/label`
- Upstream reference: `packages/@react-types/label` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode`, `ReactElement`, and DOM attribute types from React).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific label typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/label declarations are remapped to Vue-native node and attribute types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/well`
- Upstream reference: `packages/@react-types/well` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/well declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/statuslight`
- Upstream reference: `packages/@react-types/statuslight` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/statuslight declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/text`
- Upstream reference: `packages/@react-types/text` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/text declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/link`
- Upstream reference: `packages/@react-types/link` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/link declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/progress`
- Upstream reference: `packages/@react-types/progress` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/progress declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/provider`
- Upstream reference: `packages/@react-types/provider` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/provider declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/overlays`
- Upstream reference: `packages/@react-types/overlays` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode`, `ReactElement`, React DOM attribute/ref types, and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific overlay typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/overlays declarations are remapped to Vue-native node and attribute types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/view`
- Upstream reference: `packages/@react-types/view` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode`, `JSXElementConstructor`, and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/view declarations are remapped to Vue-native node/component types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/radio`
- Upstream reference: `packages/@react-types/radio` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode`, `ReactElement`, and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/radio declarations are remapped to Vue-native node/component types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/switch`
- Upstream reference: `packages/@react-types/switch` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/switch declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/slider`
- Upstream reference: `packages/@react-types/slider` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/slider declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/tabs`
- Upstream reference: `packages/@react-types/tabs` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer.
- User impact: Consumers may need React type packages for full type resolution until shared/tabs declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/form`
- Upstream reference: `packages/@react-types/form` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`FormEvent`, `FormHTMLAttributes`, `ReactElement`, and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific form typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/form declarations are remapped to Vue-native event and element types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/breadcrumbs`
- Upstream reference: `packages/@react-types/breadcrumbs` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode`, `ReactElement`, and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific breadcrumb typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/breadcrumb declarations are remapped to Vue-native node and element types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/layout`
- Upstream reference: `packages/@react-types/layout` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific layout typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/layout declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/illustratedmessage`
- Upstream reference: `packages/@react-types/illustratedmessage` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific illustrated message typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/illustratedmessage declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/contextualhelp`
- Upstream reference: `packages/@react-types/contextualhelp` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared/overlays types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific contextual help typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/overlays/contextualhelp declarations are remapped to Vue-native node and event types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and `@vue-types/overlays`, then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/buttongroup`
- Upstream reference: `packages/@react-types/buttongroup` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific button group typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/buttongroup declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/button`
- Upstream reference: `packages/@react-types/button` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ButtonHTMLAttributes`, `ElementType`, `JSXElementConstructor`, `ReactNode`, and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific button typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/button declarations are remapped to Vue-native node, element, and event types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/listbox`
- Upstream reference: `packages/@react-types/listbox` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific listbox typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/listbox declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/textfield`
- Upstream reference: `packages/@react-types/textfield` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactElement` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific textfield typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/textfield declarations are remapped to Vue-native node and element types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/tooltip`
- Upstream reference: `packages/@react-types/tooltip` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactElement`, `ReactNode`, and shared/overlays types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer, the transitional `@vue-types/overlays` typing layer, and upstream React-specific tooltip typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/overlays/tooltip declarations are remapped to Vue-native node and element types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and `@vue-types/overlays`, then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/dialog`
- Upstream reference: `packages/@react-types/dialog` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactElement`, `ReactNode`, and shared/overlays types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer, the transitional `@vue-types/overlays` typing layer, and upstream React-specific dialog typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/overlays/dialog declarations are remapped to Vue-native node and element types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and `@vue-types/overlays`, then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/menu`
- Upstream reference: `packages/@react-types/menu` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactElement` and shared/overlays types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer, the transitional `@vue-types/overlays` typing layer, and upstream React-specific menu typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/overlays/menu declarations are remapped to Vue-native element and event types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and `@vue-types/overlays`, then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/checkbox`
- Upstream reference: `packages/@react-types/checkbox` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode`, `ReactElement`, and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific checkbox typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/checkbox declarations are remapped to Vue-native node and element types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/calendar`
- Upstream reference: `packages/@react-types/calendar` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific calendar typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/calendar declarations are remapped to Vue-native node types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/table`
- Upstream reference: `packages/@react-types/table` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`JSX`, `ReactElement`, `ReactNode`, and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific table typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/table declarations are remapped to Vue-native node and element types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/autocomplete`
- Upstream reference: `packages/@react-types/autocomplete` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactElement` and shared types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer and upstream React-specific autocomplete typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/autocomplete declarations are remapped to Vue-native element types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and then update this package’s declarations to remove React-specific imports.

- Package: `@vue-types/color`
- Upstream reference: `packages/@react-types/color` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and shared/slider types that still reference React types).
- Reason: This package depends on the current transitional `@vue-types/shared` typing layer, the transitional `@vue-types/slider` typing layer, and upstream React-specific color typing contracts.
- User impact: Consumers may need React type packages for full type resolution until shared/slider/color declarations are remapped to Vue-native node and event types.
- Removal plan: Complete Vue-native type remapping in `@vue-types/shared` and `@vue-types/slider`, then update this package’s declarations to remove React-specific imports.

- Package: `@vue-spectrum/test-utils`
- Upstream reference: `packages/@react-spectrum/test-utils` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React testing utilities (`@testing-library/react`, `react`, `react-dom`) through peer dependencies and re-exported test helpers.
- Reason: This package was ported incrementally to preserve dependency order and keep testing utility surfaces aligned with upstream naming.
- User impact: This package is not yet Vue-native; consumers should treat it as transitional and expect React-centric testing dependencies.
- Removal plan: Replace React testing dependencies and re-exports with Vue Test Utils/Vue Testing Library equivalents, then clear this deviation.

- Package: `@vue-spectrum/story-utils`
- Upstream reference: `packages/@react-spectrum/story-utils` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still contains React-centric story helpers/components (`React.Component`, JSX, and React peer dependencies).
- Reason: This package was ported incrementally to preserve dependency order and keep story utility APIs aligned with upstream naming.
- User impact: Story utility helpers are not yet Vue-native; consumers should treat this package as transitional and expect React-centric story tooling dependencies.
- Removal plan: Replace React-specific story helpers with Vue-compatible Storybook utilities and remove React peer dependency requirements.

- Package: `@vue-stately/autocomplete`
- Upstream reference: `packages/@react-stately/autocomplete` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: State hook is structurally ported, but type surface remains React-centric (`ReactNode`) and internal state mechanics were adapted from React `useState` to Vue refs.
- Reason: The package was ported incrementally while preserving API shape and dependency order.
- User impact: Consumers may still need React types for full type resolution, and subtle state timing semantics may differ from upstream in edge cases.
- Removal plan: Replace remaining React-centric type references with Vue-native equivalents and add parity tests to verify Vue state timing behavior.

- Package: `@vue-stately/tooltip`
- Upstream reference: `packages/@react-stately/tooltip` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but tooltip warmup/cooldown lifecycle and timer handling were adapted from React hook semantics to Vue scope-disposal semantics.
- Reason: The package was ported incrementally while preserving API shape and global tooltip coordination behavior.
- User impact: Runtime behavior should be close, but edge cases around mount/unmount timing and delayed close sequencing may differ until dedicated parity tests are added.
- Removal plan: Port and run upstream tooltip state tests 1:1 against this implementation and refine timing/lifecycle behavior until parity is confirmed.

- Package: `@vue-aria/label`
- Upstream reference: `packages/@react-aria/label` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but type signatures remain React-centric (`ElementType` and `LabelHTMLAttributes` from `react`).
- Reason: The package was ported incrementally while preserving API/type parity with upstream and existing shared typing contracts.
- User impact: Consumers may still need React type packages for full type resolution in label helper types.
- Removal plan: Replace React-centric label type imports with Vue-native equivalents once shared type mapping is complete.

- Package: `@vue-aria/disclosure`
- Upstream reference: `packages/@react-aria/disclosure` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still relies on React/ReactDOM runtime semantics (`useEffect`/`useLayoutEffect`/`useRef` and `react-dom` `flushSync`).
- Reason: The package was ported incrementally to keep dependency order moving while preserving upstream source structure.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and possible behavioral differences until full composable conversion.
- Removal plan: Replace React hook and `flushSync` usage with Vue composables/lifecycle equivalents and port upstream disclosure tests to verify parity.

- Package: `@vue-stately/form`
- Upstream reference: `packages/@react-stately/form` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks/context (`createContext`, `useContext`, `useEffect`, `useMemo`, `useRef`, `useState`) in `useFormValidationState`.
- Reason: The package was ported incrementally to preserve dependency order and upstream validation behavior before full composable conversion.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential lifecycle timing differences until full migration.
- Removal plan: Replace React context/hooks with Vue provide/inject plus refs/computed/watch equivalents, then port upstream form state tests for behavioral parity.

- Package: `@vue-stately/radio`
- Upstream reference: `packages/@react-stately/radio` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useMemo`, `useState`) for radio group state management.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependency requirements and potential state-timing differences until full composable conversion.
- Removal plan: Replace React hooks with Vue refs/computed patterns in `useRadioGroupState` and add parity tests against upstream behavior.

- Package: `@vue-stately/numberfield`
- Upstream reference: `packages/@react-stately/numberfield` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useMemo`, `useState`) for number field state/format synchronization.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependency requirements and potential controlled/uncontrolled timing differences until full composable conversion.
- Removal plan: Replace React hooks with Vue refs/computed/watch equivalents in `useNumberFieldState` and add parity tests for stepping/formatting behavior.

- Package: `@vue-stately/checkbox`
- Upstream reference: `packages/@react-stately/checkbox` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useRef`, `useState`) for checkbox group selection/validation tracking.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependency requirements and potential state-lifecycle differences until full composable conversion.
- Removal plan: Replace React hooks with Vue refs/reactive state in `useCheckboxGroupState` and port upstream checkbox group tests for parity.

- Package: `@vue-aria/landmark`
- Upstream reference: `packages/@react-aria/landmark` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks/subscriptions (`useCallback`, `useEffect`, `useState`, `useSyncExternalStore`) for landmark registration and navigation state.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential lifecycle/event ordering differences until full composable conversion.
- Removal plan: Replace React hooks/subscription flow with Vue composables/watchers for landmark manager state and port upstream landmark tests to verify parity.

- Package: `@vue-aria/i18n`
- Upstream reference: `packages/@react-aria/i18n` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime primitives (`createContext`, `useContext`, JSX server/provider components) across locale and formatting hooks.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential provider/hydration behavior differences until full composable conversion.
- Removal plan: Replace React context/provider and hook usage with Vue provide/inject plus composables, and port upstream i18n tests for parity.

- Package: `@vue-aria/spinbutton`
- Upstream reference: `packages/@react-aria/spinbutton` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useEffect`, `useRef`, `useState`) and React-style effect event/global listener utilities.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential press/announcement timing differences until full composable conversion.
- Removal plan: Replace React hook/event handling with Vue composables and lifecycle primitives in `useSpinButton`, then port upstream spinbutton tests for parity.

- Package: `@vue-stately/slider`
- Upstream reference: `packages/@react-stately/slider` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useMemo`, `useRef`, `useState`) for slider thumb/value state management.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential controlled-state behavior differences until full composable conversion.
- Removal plan: Replace React hook state flow in `useSliderState` with Vue refs/computed/watch and port upstream slider tests for parity.

- Package: `@vue-stately/collections`
- Upstream reference: `packages/@react-stately/collections` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/types (`ReactElement`, `ReactNode`, `React.Children`, `React.Fragment`, `useMemo`) for collection construction and item/section helpers.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and possible collection-node behavior differences until full composable conversion.
- Removal plan: Replace React element traversal and memo usage with Vue vnode traversal/composable equivalents and port upstream collection behavior tests for parity.

- Package: `@vue-stately/selection`
- Upstream reference: `packages/@react-stately/selection` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks/types (`useEffect`, `useMemo`, `useRef`, `useState`, React-driven selection state flow) in selection state management.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and possible focus/selection timing differences until full composable conversion.
- Removal plan: Replace React hook-based state flow with Vue refs/computed/watch in selection state and manager helpers, then port upstream selection tests for parity.

- Package: `@vue-stately/tree`
- Upstream reference: `packages/@react-stately/tree` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useEffect`, `useMemo`) in tree state composition.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential focus/expand synchronization differences until full composable conversion.
- Removal plan: Replace React hook-based tree state composition with Vue refs/computed/watch equivalents and port upstream tree state tests for parity.

- Package: `@vue-stately/grid`
- Upstream reference: `packages/@react-stately/grid` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useEffect`, `useMemo`, `useRef`) for grid state and focus recovery behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and possible row/cell focus timing differences until full composable conversion.
- Removal plan: Replace React hook-based grid state composition with Vue refs/computed/watch equivalents and port upstream grid state tests for parity.

- Package: `@vue-stately/list`
- Upstream reference: `packages/@react-stately/list` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useEffect`, `useMemo`, `useRef`) for list state, filtering, and focused-key recovery behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential focus/selection synchronization differences until full composable conversion.
- Removal plan: Replace React hook-based list state composition with Vue refs/computed/watch equivalents and port upstream list state tests for parity.

- Package: `@vue-stately/tabs`
- Upstream reference: `packages/@react-stately/tabs` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useEffect`, `useRef`) for tab selection/focus synchronization behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential selected/focused tab synchronization differences until full composable conversion.
- Removal plan: Replace React effect/ref tab synchronization with Vue refs/watch equivalents and port upstream tab list state tests for parity.

- Package: `@vue-stately/steplist`
- Upstream reference: `packages/@react-stately/steplist` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useEffect`, `useMemo`) for step progression and focus/selection synchronization.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential step completion timing differences until full composable conversion.
- Removal plan: Replace React hook-based step list synchronization with Vue refs/computed/watch equivalents and port upstream step list tests for parity.

- Package: `@vue-stately/select`
- Upstream reference: `packages/@react-stately/select` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useMemo`, `useState`) for select value/focus strategy/state synchronization.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential selection/overlay timing differences until full composable conversion.
- Removal plan: Replace React hook-based select state synchronization with Vue refs/computed/watch equivalents and port upstream select state tests for parity.

- Package: `@vue-stately/dnd`
- Upstream reference: `packages/@react-stately/dnd` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useRef`, `useState`) for draggable/droppable collection state handling.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential drag/drop state timing differences until full composable conversion.
- Removal plan: Replace React hook-based drag/drop state management with Vue refs/computed/watch equivalents and port upstream dnd state tests for parity.

- Package: `@vue-stately/combobox`
- Upstream reference: `packages/@react-stately/combobox` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useEffect`, `useMemo`, `useRef`, `useState`) for combobox filtering, input synchronization, and overlay open/close state behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential input/selection synchronization timing differences until full composable conversion.
- Removal plan: Replace React hook-based combobox state composition with Vue refs/computed/watch/lifecycle equivalents and port upstream combobox state tests for parity.

- Package: `@vue-stately/calendar`
- Upstream reference: `packages/@react-stately/calendar` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useMemo`, `useRef`, `useState`) for calendar/range-calendar focus, visible-range, and selection state synchronization.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential date-focus/visible-range timing differences until full composable conversion.
- Removal plan: Replace React hook-based calendar state composition with Vue refs/computed/watch/lifecycle equivalents and port upstream calendar state tests for parity.

- Package: `@vue-stately/data`
- Upstream reference: `packages/@react-stately/data` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useEffect`, `useReducer`, `useRef`, `useMemo`, `useState`) for async list loading, list filtering, and tree data mutation state handling.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential async update/selection timing differences until full composable conversion.
- Removal plan: Replace React hook-based data state composition with Vue refs/computed/watch/lifecycle equivalents and port upstream data state tests for parity.

- Package: `@vue-stately/color`
- Upstream reference: `packages/@react-stately/color` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useMemo`, `useState`) for color parsing/format/channel synchronization and composed color field/slider state behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential color-field synchronization timing differences until full composable conversion.
- Removal plan: Replace React hook-based color state composition with Vue refs/computed/watch equivalents and port upstream color state tests for parity.

- Package: `@vue-stately/virtualizer`
- Upstream reference: `packages/@react-stately/virtualizer` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useMemo`, `useRef`, `useState`, `useLayoutEffect`) for visible-rect synchronization and scrolling state updates.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential visible-view update timing differences until full composable conversion.
- Removal plan: Replace React hook-based virtualizer state composition with Vue refs/computed/watch/lifecycle equivalents and port upstream virtualizer tests for parity.

- Package: `@vue-types/card`
- Upstream reference: `packages/@react-types/card` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and layout typing tied to React virtualizer contracts).
- Reason: This package depends on transitional shared/provider typing layers and upstream React-specific card type contracts.
- User impact: Consumers may still need React type packages for full type resolution in card view typing surfaces.
- Removal plan: Replace React-centric declaration types with Vue-native node/component typing aliases after shared/provider type remapping is complete.

- Package: `@vue-types/sidenav`
- Upstream reference: `packages/@react-types/sidenav` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Structural port is complete, but declarations remain React-centric (`ReactNode` and `HTMLAttributes` imported from `react`).
- Reason: This package depends on transitional shared typing layers and upstream React-specific side navigation type contracts.
- User impact: Consumers may still need React type packages for full type resolution in side navigation typing surfaces.
- Removal plan: Replace React-centric declaration types with Vue-native node/attribute typing aliases after shared type remapping is complete.

- Package: `@vue-spectrum/utils`
- Upstream reference: `packages/@react-spectrum/utils` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/context semantics across slot, breakpoint, DOM-ref, and wrapped-element helpers (`useContext`, `useMemo`, `useRef`, `forwardRef`, `cloneElement`, JSX rendering contracts).
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential slot/context/ref behavior differences until full composable conversion.
- Removal plan: Replace React runtime/context patterns with Vue provide/inject, refs, and render-function equivalents, then port upstream utility tests for parity.

- Package: `@vue-spectrum/divider`
- Upstream reference: `packages/@react-spectrum/divider` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime rendering/ref semantics (`React.forwardRef`, JSX element typing) in the divider component implementation.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential ref/render behavior differences until full component conversion.
- Removal plan: Replace React forwardRef/JSX rendering with Vue component + template-ref equivalents and port upstream divider tests for parity.

- Package: `@vue-spectrum/well`
- Upstream reference: `packages/@react-spectrum/well` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime rendering/ref semantics (`forwardRef`, JSX rendering) in the well component implementation.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential ref/render behavior differences until full component conversion.
- Removal plan: Replace React forwardRef/JSX rendering with Vue component + template-ref equivalents and port upstream well tests for parity.

- Package: `@vue-stately/table`
- Upstream reference: `packages/@react-stately/table` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks/types (`useCallback`, `useMemo`, `useState`, `ReactElement`, `JSX`) across table state composition and collection builders.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential table selection/sort/focus timing differences until full composable conversion.
- Removal plan: Replace React hook/type usage with Vue refs/computed/watch and Vue-native vnode typing, then port upstream table state tests for parity.

- Package: `@vue-stately/datepicker`
- Upstream reference: `packages/@react-stately/datepicker` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useCallback`, `useMemo`, `useState`) for date/time field segment state, picker overlay synchronization, and range validation state management.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential date segment/validation timing differences until full composable conversion.
- Removal plan: Replace React hook-based datepicker state composition with Vue refs/computed/watch/lifecycle equivalents and port upstream datepicker state tests for parity.

- Package: `@vue-aria/interactions`
- Upstream reference: `packages/@react-aria/interactions` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/context/event semantics (`useContext`, `useEffect`, `useMemo`, `useRef`, `useState`, `forwardRef`, `flushSync`, React synthetic event types) across focus/hover/press/move interaction hooks.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential interaction event/focus timing differences until full composable conversion.
- Removal plan: Replace React runtime/context/event handling with Vue composables/lifecycle and Vue-native event/ref patterns, then port and run upstream interaction tests for parity.

- Package: `@vue-aria/visually-hidden`
- Upstream reference: `packages/@react-aria/visually-hidden` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks/JSX types (`useMemo`, `useState`, `ReactNode`, JSX element constructors) in the visually hidden helper/component.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and possible rendering/ref behavior differences until full component conversion.
- Removal plan: Replace React hook/JSX usage with Vue composables/render-function patterns and port upstream visually-hidden tests for parity.

- Package: `@vue-aria/form`
- Upstream reference: `packages/@react-aria/form` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useEffect`, `useRef`) and React-derived event scheduling assumptions in form validation wiring.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential form reset/validation timing differences until full composable conversion.
- Removal plan: Replace React hook/event scheduling assumptions with Vue lifecycle/watch patterns and port upstream form validation tests for parity.

- Package: `@vue-aria/toggle`
- Upstream reference: `packages/@react-aria/toggle` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React event/attribute types (`ChangeEventHandler`, `InputHTMLAttributes`, `LabelHTMLAttributes`) and React runtime semantics through interaction hooks.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and possible toggle interaction timing differences until full composable conversion.
- Removal plan: Replace React-specific event/attribute types and runtime assumptions with Vue-native equivalents and port upstream toggle interaction tests for parity.

- Package: `@vue-aria/link`
- Upstream reference: `packages/@react-aria/link` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React event typing (`React.MouseEvent`) and React runtime semantics through focus/press hooks.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and possible press/navigation event timing differences until full composable conversion.
- Removal plan: Replace React event typing/runtime assumptions with Vue-native event patterns and port upstream link behavior tests for parity.

- Package: `@vue-aria/switch`
- Upstream reference: `packages/@react-aria/switch` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React attribute typing (`InputHTMLAttributes`, `LabelHTMLAttributes`) and React runtime semantics inherited through toggle interactions.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and possible switch interaction timing differences until full composable conversion.
- Removal plan: Replace React-specific attribute types/runtime assumptions with Vue-native equivalents and port upstream switch behavior tests for parity.

- Package: `@vue-aria/tooltip`
- Upstream reference: `packages/@react-aria/tooltip` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks (`useEffect`, `useRef`) and interaction hook semantics for tooltip trigger state wiring.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential tooltip open/close timing differences until full composable conversion.
- Removal plan: Replace React hook-based trigger wiring with Vue lifecycle/ref patterns and port upstream tooltip behavior tests for parity.

- Package: `@vue-aria/virtualizer`
- Upstream reference: `packages/@react-aria/virtualizer` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime rendering/hook semantics (`forwardRef`, `useCallback`, `useEffect`, `useRef`, `useState`, `flushSync`, JSX) across scroll view and virtualizer item wrappers.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime dependencies and potential scroll/measurement timing differences until full component conversion.
- Removal plan: Replace React rendering/hook flows with Vue component/composable equivalents and port upstream virtualizer behavior tests for parity.

- Package: `@vue-aria/breadcrumbs`
- Upstream reference: `packages/@react-aria/breadcrumbs` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React-derived type/runtime semantics via linked dependencies (`@vue-aria/link` and shared type contracts) for breadcrumb item interaction behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet fully Vue-native; consumers should expect inherited React runtime/type dependencies and possible breadcrumb interaction timing differences until full composable conversion.
- Removal plan: Replace inherited React runtime/type assumptions in dependent interaction layers with Vue-native composables/types and port upstream breadcrumb tests for parity.

- Package: `@vue-aria/checkbox`
- Upstream reference: `packages/@react-aria/checkbox` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime hooks/types (`useEffect`, `useMemo`, `useRef`, React input/label attribute types) across checkbox and checkbox-group interaction/validation wiring.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential checkbox validation/interaction timing differences until full composable conversion.
- Removal plan: Replace React hook/type usage with Vue composables/reactivity equivalents and port upstream checkbox behavior tests for parity.

- Package: `@vue-aria/focus`
- Upstream reference: `packages/@react-aria/focus` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/context/rendering semantics (`createContext`, `useContext`, `useEffect`, `useMemo`, `useRef`, JSX/cloneElement patterns) across focus scope management and focus ring utilities.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential focus containment/restore timing differences until full composable/component conversion.
- Removal plan: Replace React context/hook/rendering flows with Vue provide/inject/composables/components and port upstream focus scope/ring tests for parity.

- Package: `@vue-aria/actiongroup`
- Upstream reference: `packages/@react-aria/actiongroup` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event semantics (`useState`, React keyboard event handler types) and inherited React-based focus/interaction utilities.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential action-group keyboard/focus timing differences until full composable conversion.
- Removal plan: Replace React state/event assumptions with Vue composables/event typing and port upstream actiongroup behavior tests for parity.

- Package: `@vue-aria/toolbar`
- Upstream reference: `packages/@react-aria/toolbar` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event semantics (`useRef`, `useState`, React focus/keyboard handler types) and inherited React-based focus management utilities.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential toolbar focus restoration/navigation timing differences until full composable conversion.
- Removal plan: Replace React state/ref/event assumptions with Vue composables/event typing and port upstream toolbar behavior tests for parity.

- Package: `@vue-aria/button`
- Upstream reference: `packages/@react-aria/button` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React element/attribute/ref typing (`ElementType`, React HTML attribute types, `RefObject`) and inherited React-based interaction/toolbar semantics.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential button/toggle interaction timing differences until full composable conversion.
- Removal plan: Replace React element/attribute/ref typing and inherited interaction assumptions with Vue-native equivalents and port upstream button/toggle behavior tests for parity.

- Package: `@vue-aria/radio`
- Upstream reference: `packages/@react-aria/radio` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React input/label attribute typing and memoized handler semantics (`useMemo`) together with inherited React-based focus/interaction utilities.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential radio group keyboard/focus timing differences until full composable conversion.
- Removal plan: Replace React attribute/memoization assumptions and inherited interaction semantics with Vue-native composables/types and port upstream radio behavior tests for parity.

- Package: `@vue-aria/textfield`
- Upstream reference: `packages/@react-aria/textfield` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/type semantics (`React.version`, React change/input handler types, `useState`/`useEffect`/`useRef`) across textfield value formatting and validation wiring.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential text input formatting/validation timing differences until full composable conversion.
- Removal plan: Replace React runtime/type/event assumptions with Vue-native composables/event typing and port upstream textfield behavior tests for parity.

- Package: `@vue-aria/collections`
- Upstream reference: `packages/@react-aria/collections` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/context/rendering semantics (`createContext`, `forwardRef`, `createPortal`, `useSyncExternalStore` fallback, JSX element typing) for collection document building and hidden subtree rendering.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential collection document synchronization timing differences until full conversion.
- Removal plan: Replace React context/portal/store wiring with Vue provide/inject/teleport/reactivity equivalents and port upstream collection builder behavior tests for parity.

- Package: `@vue-aria/slider`
- Upstream reference: `packages/@react-aria/slider` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event typing semantics (`useRef`, `useEffect`, React pointer/mouse/touch/change event types, React label/output attribute types) across slider track and thumb interactions.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential slider drag/focus timing differences until full composable conversion.
- Removal plan: Replace React hook/event/attribute assumptions with Vue-native composables/event typing and port upstream slider behavior tests for parity.

- Package: `@vue-aria/searchfield`
- Upstream reference: `packages/@react-aria/searchfield` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React input/label attribute typing and inherited React-based textfield/runtime semantics for clear/submit keyboard interactions.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential searchfield key handling timing differences until full composable conversion.
- Removal plan: Replace React attribute/runtime assumptions with Vue-native composables/event typing and port upstream searchfield behavior tests for parity.

- Package: `@vue-aria/numberfield`
- Upstream reference: `packages/@react-aria/numberfield` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event/rendering semantics (`useState`, `useMemo`, `useCallback`, React clipboard/input handler types, `flushSync` from `react-dom`) across numberfield formatting, announcements, and spinbutton interaction handling.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential numberfield commit/announcement timing differences until full composable conversion.
- Removal plan: Replace React hook/event/flush semantics with Vue-native composables/reactivity/DOM update patterns and port upstream numberfield behavior tests for parity.

- Package: `@vue-aria/selection`
- Upstream reference: `packages/@react-aria/selection` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event semantics (`useEffect`, `useMemo`, `useRef`, React keyboard/focus event types) across selectable collection and item interaction handling.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential selection focus/keyboard timing differences until full composable conversion.
- Removal plan: Replace React hook/event assumptions with Vue-native composables/event typing and port upstream selectable collection tests for parity.

- Package: `@vue-aria/listbox`
- Upstream reference: `packages/@react-aria/listbox` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React-derived typing (`ReactNode`) and inherited React-based selection/interaction runtime semantics from dependencies.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential listbox option focus/selection timing differences until full composable conversion.
- Removal plan: Replace React-derived typing and inherited interaction assumptions with Vue-native equivalents and port upstream listbox behavior tests for parity.

- Package: `@vue-aria/tabs`
- Upstream reference: `packages/@react-aria/tabs` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime semantics (`useMemo`) and inherited React-based focus/selection interaction layers.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential tab focus/activation timing differences until full composable conversion.
- Removal plan: Replace React memoization/runtime assumptions and inherited interaction flows with Vue-native composables/reactivity and port upstream tabs behavior tests for parity.

- Package: `@vue-aria/steplist`
- Upstream reference: `packages/@react-aria/steplist` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React HTML attribute typing and inherited React-based selection interaction semantics.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential step list selection timing differences until full composable conversion.
- Removal plan: Replace React-derived typing/runtime assumptions with Vue-native equivalents and port upstream steplist behavior tests for parity.

- Package: `@vue-aria/toast`
- Upstream reference: `packages/@react-aria/toast` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime semantics (`useState`, `useEffect`, `useCallback`, `useRef`) across toast timeout/focus-region behavior, plus inherited React-based interaction patterns.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential toast dismissal/focus timing differences until full composable conversion.
- Removal plan: Replace React hook-based toast region/item behavior with Vue-native composables/reactivity and port upstream toast behavior tests for parity.

- Package: `@vue-aria/grid`
- Upstream reference: `packages/@react-aria/grid` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event semantics (`useMemo`, `useCallback`, `useRef`, React focus/keyboard event typing) across grid navigation, selection announcement, and cell focus behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential grid navigation/selection timing differences until full composable conversion.
- Removal plan: Replace React hook/event assumptions with Vue-native composables/event typing and port upstream grid behavior tests for parity.

- Package: `@vue-aria/gridlist`
- Upstream reference: `packages/@react-aria/gridlist` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event typing semantics (`useRef`, React keyboard/HTML attribute types) plus inherited React-based grid/selection interaction layers.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential gridlist focus/selection timing differences until full composable conversion.
- Removal plan: Replace React runtime/type assumptions and inherited interaction flows with Vue-native composables/event typing and port upstream gridlist behavior tests for parity.

- Package: `@vue-aria/tree`
- Upstream reference: `packages/@react-aria/tree` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on inherited React-based runtime/type semantics through transitional dependencies (`@vue-aria/gridlist`, `@vue-aria/selection`).
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet fully Vue-native; consumers should expect inherited React runtime/type dependencies and potential tree item focus/selection timing differences until full conversion.
- Removal plan: Complete Vue-native conversions of dependent gridlist/selection interaction layers and port upstream tree behavior tests for parity.

- Package: `@vue-aria/tag`
- Upstream reference: `packages/@react-aria/tag` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event semantics (`useState`, `useEffect`, `useRef`, React keyboard/node typing) together with inherited React-based gridlist/selection interaction behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential tag interaction/focus timing differences until full composable conversion.
- Removal plan: Replace React hook/event assumptions and inherited interaction flows with Vue-native composables/event typing and port upstream tag behavior tests for parity.

- Package: `@vue-aria/calendar`
- Upstream reference: `packages/@react-aria/calendar` at baseline `1a2b8f860ef2cee6aa579aa6b5e7032ca3be1cb1`
- Difference: Package is currently a structural mirror and still depends on React runtime/event semantics (`useState`, `useEffect`, `useMemo`, `useRef`, React keyboard/focus typing) across calendar grid/cell/range interaction behavior.
- Reason: The package was ported incrementally to preserve API/dependency parity with upstream while unblocking dependent packages.
- User impact: This package is transitional and not yet Vue-native; consumers should expect React runtime/type dependencies and potential calendar navigation/range-selection timing differences until full composable conversion.
- Removal plan: Replace React hook/event assumptions with Vue-native composables/event typing and port upstream calendar behavior tests for parity.
