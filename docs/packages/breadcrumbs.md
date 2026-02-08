# @vue-aria/breadcrumbs

Breadcrumb accessibility primitives.

## `useBreadcrumbItem`

Provides link/current-item semantics for breadcrumb items.

```ts
import { useBreadcrumbItem } from "@vue-aria/breadcrumbs";
```

### Behavior

- Uses link semantics for regular breadcrumb items.
- Marks current breadcrumb with `aria-current` and disables interaction.
- Supports heading element breadcrumbs without applying link role props.
