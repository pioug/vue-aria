export function useMenuTriggerState() {
  return {
    isOpen: false,
    open: () => {},
    close: () => {},
    toggle: () => {}
  };
}

export function useOverlayTriggerState() {
  return {
    isOpen: false,
    open: () => {},
    close: () => {},
    toggle: () => {}
  };
}

export function useListData() {
  return {items: []};
}

export function useTreeData() {
  return {items: []};
}

export function useAsyncList() {
  return {items: []};
}
