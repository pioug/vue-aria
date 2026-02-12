# @vue-spectrum/inlinealert

Vue port of `@react-spectrum/inlinealert`.

<script setup lang="ts">
import { Content, Header, InlineAlert } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <InlineAlert>
    <Header>Payment Information</Header>
    <Content>
      Enter your billing address, shipping address, and payment method to complete your purchase.
    </Content>
  </InlineAlert>
</div>

## Exports

- `InlineAlert`

## Example

```vue
<script setup lang="ts">
import { Content, Header } from "@vue-spectrum/view";
import { InlineAlert } from "@vue-spectrum/inlinealert";
</script>

<template>
  <InlineAlert>
    <Header>Payment Information</Header>
    <Content>
      Enter your billing address, shipping address, and payment method to
      complete your purchase.
    </Content>
  </InlineAlert>
</template>
```

## Content

Inline alerts contain a title and body. Non-neutral variants also render an icon.

## Accessibility

`InlineAlert` renders with `role="alert"`, so it should be used for information that requires immediate user attention.

## Internationalization

The title and content should be localized by the app. Variant icon labels are localized from the active provider locale.

## Variants

### Info

```vue
<template>
  <InlineAlert variant="info">
    <Header>Accepted Payment Methods</Header>
    <Content>
      Only major credit cards are accepted for payment.
    </Content>
  </InlineAlert>
</template>
```

### Positive

```vue
<template>
  <InlineAlert variant="positive">
    <Header>Purchase completed</Header>
    <Content>
      You will receive a confirmation email shortly.
    </Content>
  </InlineAlert>
</template>
```

### Notice

```vue
<template>
  <InlineAlert variant="notice">
    <Header>Update payment information</Header>
    <Content>
      The saved card has expired. Update payment details to continue.
    </Content>
  </InlineAlert>
</template>
```

### Negative

```vue
<template>
  <InlineAlert variant="negative">
    <Header>Unable to process payment</Header>
    <Content>
      There was an error processing your payment. Please verify details and try again.
    </Content>
  </InlineAlert>
</template>
```

## Notes

- Includes upstream-equivalent alert semantics, variant classes, localized variant icon labels, and `autoFocus` behavior.
- Style parity is actively being tuned to match upstream visual structure more closely.
