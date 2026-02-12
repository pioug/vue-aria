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
