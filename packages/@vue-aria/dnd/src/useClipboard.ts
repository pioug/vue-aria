export interface ClipboardProps {
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
}

export interface ClipboardResult {
  clipboardProps: ClipboardProps;
}

export function useClipboard(options: ClipboardProps): ClipboardResult {
  return {clipboardProps: options};
}
