# @vue-spectrum/link - Link

`Link` allows navigation to another location inline or as standalone text.

## Example

```vue
<script setup lang="ts">
import { Link } from "@vue-spectrum/link";
</script>

<template>
  <Link href="https://www.imdb.com/title/tt6348138/" target="_blank">
    The missing link.
  </Link>
</template>
```

## Content

`Link` accepts slot content as children.

- With `href`, it renders as an anchor (`<a>`).
- Without `href`, it renders as a JavaScript-handled link (`<span role="link">`) and should use `onPress`.

```vue
<Link href="https://adobe.com" target="_blank">Adobe.com</Link>
```

### JavaScript handled links

```vue
<Link :onPress="() => alert('Pressed link')">Adobe</Link>
```

## Client side routing

`Link` supports router integration through `Provider` and router props (`navigate`, `useHref`). See provider/routing docs for setup.

## Internationalization

Pass localized link text in slot content.

## Accessibility

When no `href` is provided, `Link` exposes role `"link"` for assistive technology.

```vue
<Link :onPress="(e) => alert(`clicked \"${(e.target as HTMLElement).textContent}\" Link`)">
  I forgot my password
</Link>
```

## Visual options

### Primary

```vue
<p>Would you like to <Link variant="primary">learn more</Link> about this component?</p>
```

### Secondary

```vue
<p>Would you like to <Link variant="secondary">learn more</Link> about this component?</p>
```

### Over background

```vue
<p style="background: #1f7a3f; padding: 12px">
  <Link variant="overBackground">Learn more here!</Link>
</p>
```

### Quiet

```vue
<p>Would you like to <Link isQuiet>learn more</Link> about this component?</p>
```

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
