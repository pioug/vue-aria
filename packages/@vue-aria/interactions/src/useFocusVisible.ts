export type Modality = "keyboard" | "pointer" | "virtual";

let currentModality: Modality | null = null;

export function getInteractionModality(): Modality | null {
  return currentModality;
}

export function setInteractionModality(modality: Modality): void {
  currentModality = modality;
}
