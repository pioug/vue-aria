let previousUserSelect: string | null = null;

export function disableTextSelection(): void {
  if (typeof document === "undefined") {
    return;
  }

  if (previousUserSelect == null) {
    previousUserSelect = document.documentElement.style.webkitUserSelect;
  }

  document.documentElement.style.webkitUserSelect = "none";
}

export function restoreTextSelection(): void {
  if (typeof document === "undefined") {
    return;
  }

  if (previousUserSelect != null) {
    document.documentElement.style.webkitUserSelect = previousUserSelect;
    previousUserSelect = null;
  }
}
