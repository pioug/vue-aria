import type { DOMProps, StyleProps } from "@vue-types/shared";

export interface ImageProps {
  src: string;
  alt?: string;
  objectFit?: unknown;
  onError?: (event: Event) => void;
  onLoad?: (event: Event) => void;
  crossOrigin?: "anonymous" | "use-credentials";
}

export interface SpectrumImageProps extends ImageProps, DOMProps, StyleProps {
  slot?: string;
}
