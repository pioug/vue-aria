# @vue-spectrum/image

Vue port of `@react-spectrum/image`.

<script setup lang="ts">
import { Image, Flex } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="row" gap="size-150" class="spectrum-preview-panel">
    <Image
      src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80"
      alt="Mountain landscape"
      object-fit="cover"
      style="width: 180px; height: 120px; border-radius: 8px;"
    />
    <Image
      src="https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=600&q=80"
      alt="Forest lake"
      object-fit="cover"
      style="width: 180px; height: 120px; border-radius: 8px;"
    />
  </Flex>
</div>

## Exports

- `Image`

## Example

```ts
import { h } from "vue";
import { Image } from "@vue-spectrum/image";

const preview = h(Image, {
  src: "https://example.com/photo.jpg",
  alt: "Project screenshot",
  objectFit: "cover",
});
```

## Notes

- Supports `onError`, `onLoad`, and `crossOrigin` image attributes.
- Emits an accessibility warning in development if `alt` is omitted.
