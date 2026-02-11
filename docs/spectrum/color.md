# @vue-spectrum/color

Vue port baseline of `@react-spectrum/color`.

<script setup lang="ts">
import { ref } from "vue";
import {
  ColorArea,
  ColorEditor,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatchPicker,
  ColorWheel,
} from "@vue-spectrum/vue-spectrum";

const fieldColor = ref("#AABBCC");
const areaColor = ref("#FF0000");
const wheelColor = ref("#FF0000");
const pickerColor = ref("#FF0000");
const swatchColor = ref("#00FF00");
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px;">
    <ColorField
      label="Color field"
      defaultValue="#abc"
      :onChange="(value) => (fieldColor = value ?? '#000000')" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      color field -> {{ fieldColor }}
    </p>

    <ColorSlider
      label="Hue"
      channel="hue"
      :defaultValue="180" />

    <ColorArea
      :value="areaColor"
      :onChange="(value) => (areaColor = value)"
      aria-label="Color area" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      color area -> {{ areaColor }}
    </p>

    <ColorWheel
      :value="wheelColor"
      :onChange="(value) => (wheelColor = value)"
      aria-label="Color wheel" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      color wheel -> {{ wheelColor }}
    </p>

    <ColorSwatchPicker
      :items="[
        { key: 'red', color: '#f00', label: 'Red' },
        { key: 'green', color: '#0f0', label: 'Green' },
        { key: 'blue', color: '#00f', label: 'Blue' }
      ]"
      defaultSelectedKey="green"
      :onChange="(value) => (swatchColor = value)" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      swatch picker -> {{ swatchColor }}
    </p>

    <ColorPicker
      label="Fill"
      :value="pickerColor"
      :onChange="(value) => (pickerColor = value)" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      color picker -> {{ pickerColor }}
    </p>

    <ColorEditor :value="pickerColor" />
  </div>
</div>

## Exports

- `ColorArea`
- `ColorWheel`
- `ColorSlider`
- `ColorField`
- `ColorSwatch`
- `ColorPicker`
- `ColorEditor`
- `ColorSwatchPicker`
- `ColorThumb`
- `parseColor`
- `getColorChannels`

## Example

```ts
import { h } from "vue";
import { ColorPicker } from "@vue-spectrum/color";

const component = h(ColorPicker, {
  label: "Fill",
  defaultValue: "#ff0000",
  onChange: (color) => {
    console.log("next color", color);
  },
});
```

## Notes

- Baseline includes all top-level React Spectrum color package component names with Vue-native implementations.
- Current behavior focuses on core color selection/edit flows using hex values and simple slider/area interactions.
- Baseline test coverage is split into upstream-style per-component files (`ColorArea`, `ColorField`, `ColorPicker`, `ColorSlider`, `ColorSwatchPicker`, `ColorWheel`) plus shared color utility/SSR checks.
- Advanced parity still pending: full `@react-aria/color` interaction model, richer color-space editing, and full Spectrum visual/theming fidelity.
