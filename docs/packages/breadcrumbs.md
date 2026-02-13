# @vue-aria/breadcrumbs

`@vue-aria/breadcrumbs` ports breadcrumbs accessibility hooks from upstream `@react-aria/breadcrumbs`.

## Implemented modules

- `useBreadcrumbs`
- `useBreadcrumbItem`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useBreadcrumbs, useBreadcrumbItem } from "@vue-aria/breadcrumbs";

const { navProps } = useBreadcrumbs({});
const first = useBreadcrumbItem({ href: "/docs", children: "Docs" });
const current = useBreadcrumbItem({ isCurrent: true, children: "Buttons", elementType: "span" });
</script>

<template>
  <nav v-bind="navProps">
    <a v-bind="first.itemProps">Docs</a>
    <span>/</span>
    <span v-bind="current.itemProps">Buttons</span>
  </nav>
</template>
```

## Localized labels

```vue
<script setup lang="ts">
import { I18nProvider } from "@vue-aria/i18n";
import { useBreadcrumbs } from "@vue-aria/breadcrumbs";

const { navProps } = useBreadcrumbs({});
</script>

<template>
  <I18nProvider locale="fr-FR">
    <nav v-bind="navProps">
      <a href="/docs">Docs</a>
    </nav>
  </I18nProvider>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
