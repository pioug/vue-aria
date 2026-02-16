let tableNestedRowsEnabled = false;
let shadowDOMEnabled = false;

export function enableTableNestedRows(): void {
  tableNestedRowsEnabled = true;
}

export function disableTableNestedRows(): void {
  tableNestedRowsEnabled = false;
}

export function tableNestedRows(): boolean {
  return tableNestedRowsEnabled;
}

export function enableShadowDOM(): void {
  shadowDOMEnabled = true;
}

export function disableShadowDOM(): void {
  shadowDOMEnabled = false;
}

export function shadowDOM(): boolean {
  return shadowDOMEnabled;
}
