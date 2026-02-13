let shadowDOMEnabled = false;

export function enableShadowDOM(): void {
  shadowDOMEnabled = true;
}

export function disableShadowDOM(): void {
  shadowDOMEnabled = false;
}

export function shadowDOM(): boolean {
  return shadowDOMEnabled;
}
