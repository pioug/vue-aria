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
