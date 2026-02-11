# @vue-spectrum/test-utils

Vue baseline port of `@react-spectrum/test-utils`.

## Purpose

Shared testing helpers for Spectrum component tests.

## Exports

- `simulateMobile(width?: number)`
- `simulateDesktop(width?: number)`

## Example

```ts
import { afterEach, beforeEach, vi } from "vitest";
import { simulateMobile } from "@vue-spectrum/test-utils";

beforeEach(() => {
  (globalThis as { vi?: typeof vi }).vi = vi;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (globalThis as { vi?: typeof vi }).vi;
});

simulateMobile();
```

## Notes

- Upstream re-exports from `@react-aria/test-utils`; that layer remains pending in the Vue migration.
- This baseline keeps upstream-style screen-width helpers and adds runtime support for either global `jest` or global `vi` spy APIs.
