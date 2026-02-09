# Spectrum Cross-Browser Demos

This page hosts interactive Spectrum-layer demos used by Playwright cross-browser checks.

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Icon,
  Illustration,
  UIIcon,
  provideSpectrumProvider,
  useSpectrumProviderDOMProps,
} from "@vue-spectrum/vue-spectrum";

const colorScheme = ref<"light" | "dark">("light");
const scale = ref<"medium" | "large">("medium");

const theme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

provideSpectrumProvider({
  theme,
  colorScheme,
  scale,
  locale: "en-US",
});

const providerDOMProps = useSpectrumProviderDOMProps({
  UNSAFE_className: "spectrum-demo-provider",
  UNSAFE_style: {
    padding: "0.75rem",
    border: "1px solid #8892a0",
    borderRadius: "0.5rem",
  },
});

const uiScale = computed(() => (scale.value === "large" ? "L" : "M"));

const toggleScheme = (): void => {
  colorScheme.value = colorScheme.value === "light" ? "dark" : "light";
};

const toggleScale = (): void => {
  scale.value = scale.value === "medium" ? "large" : "medium";
};
</script>

## Provider Demo

<section data-testid="spectrum-provider-demo">
  <div v-bind="providerDOMProps" data-testid="spectrum-provider-root">
    <p>
      Color scheme:
      <strong data-testid="spectrum-scheme">{{ colorScheme }}</strong>
    </p>
    <p>
      Scale:
      <strong data-testid="spectrum-scale">{{ scale }}</strong>
    </p>

<div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
  <button data-testid="toggle-scheme" @click="toggleScheme">Toggle scheme</button>
  <button data-testid="toggle-scale" @click="toggleScale">Toggle scale</button>
</div>
  </div>
</section>

## Icon Demo

<section data-testid="spectrum-icon-demo" style="margin-top: 1rem;">
  <Icon ariaLabel="workflow icon" data-testid="spectrum-icon-labelled">
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" />
    </svg>
  </Icon>

  <Icon data-testid="spectrum-icon-hidden">
    <svg viewBox="0 0 100 100">
      <rect x="20" y="20" width="60" height="60" />
    </svg>
  </Icon>
</section>

## UI Icon Demo

<section data-testid="spectrum-ui-icon-demo" style="margin-top: 1rem;">
  <UIIcon data-testid="spectrum-ui-icon">
    <svg viewBox="0 0 100 100">
      <path d="M20 20 L80 80" />
    </svg>
  </UIIcon>

  <p>
    Expected UI icon scale:
    <strong data-testid="spectrum-ui-icon-scale">{{ uiScale }}</strong>
  </p>
</section>

## Illustration Demo

<section data-testid="spectrum-illustration-demo" style="margin-top: 1rem;">
  <Illustration ariaLabel="sample illustration" data-testid="spectrum-illustration-labelled">
    <svg viewBox="0 0 100 100">
      <polygon points="50,10 90,90 10,90" />
    </svg>
  </Illustration>

  <Illustration data-testid="spectrum-illustration-unlabelled">
    <svg viewBox="0 0 100 100">
      <polygon points="50,10 90,90 10,90" />
    </svg>
  </Illustration>
</section>
