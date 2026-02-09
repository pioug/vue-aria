# @vue-spectrum/utils

Shared utility baseline for the Spectrum component migration.

## `classNames`

`classNames` wraps `clsx` and provides a stable utility entry point for Spectrum component packages.

```ts
import { classNames } from "@vue-spectrum/utils";

const classes = classNames("base", { selected: true });
```

## Notes

- This package will grow as additional `@react-spectrum/utils` behavior is ported.
