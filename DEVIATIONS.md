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
