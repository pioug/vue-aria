# @vue-aria/breadcrumbs

Breadcrumb accessibility primitives.

## `useBreadcrumbs`

Provides navigation-level ARIA semantics for breadcrumb containers.

```ts
import { useBreadcrumbs } from "@vue-aria/breadcrumbs";
```

### Behavior

- Returns `navProps` with a localized default `aria-label` ("Breadcrumbs").
- Preserves custom `aria-label` and other supported DOM attributes.

## `useBreadcrumbItem`

Provides link/current-item semantics for breadcrumb items.

```ts
import { useBreadcrumbItem, useBreadcrumbs } from "@vue-aria/breadcrumbs";
```

### Behavior

- Uses link semantics for regular breadcrumb items.
- Marks current breadcrumb with `aria-current` and disables interaction.
- Supports heading element breadcrumbs without applying link role props.
