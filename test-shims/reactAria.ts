import React from 'react';

export function FocusScope(props: {children?: React.ReactNode}) {
  return React.createElement(React.Fragment, null, props.children);
}

export function VisuallyHidden(props: {children?: React.ReactNode}) {
  return React.createElement(React.Fragment, null, props.children);
}

export function useButton() {
  return {buttonProps: {}};
}

export function useHover() {
  return {hoverProps: {}, isHovered: false};
}

export function useFocusRing() {
  return {focusProps: {}, isFocusVisible: false};
}

export function useFocusVisible() {
  return {isFocusVisible: false};
}

export function useKeyboard() {
  return {keyboardProps: {}};
}

export function useLabel() {
  return {labelProps: {}, fieldProps: {}};
}

export function useModalOverlay() {
  return {modalProps: {}, underlayProps: {}};
}

export function useOverlayTrigger() {
  return {triggerProps: {}, overlayProps: {}};
}

export function useObjectRef<T>(ref: T): T {
  return ref;
}

export function useLocalizedStringFormatter() {
  return {format: (value: string) => value};
}

export function useLocale() {
  return {locale: 'en-US', direction: 'ltr'};
}

export function useId() {
  return 'mock-id';
}

export function mergeProps(...args: Record<string, unknown>[]) {
  return Object.assign({}, ...args);
}
