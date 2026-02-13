import React from 'react';

type ProviderValue = [React.Context<any>, any];

export const HeadingContext = React.createContext<{id?: string} | null>(null);

export function Provider(props: {values?: ProviderValue[]; children?: React.ReactNode}) {
  let {values = [], children} = props;
  return values.reduceRight<React.ReactNode>(
    (acc, [Context, value]) => React.createElement(Context.Provider, {value}, acc),
    children
  );
}

export const DropZone = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function DropZone(props, ref) {
  let {children, ...otherProps} = props;
  return React.createElement('div', {...otherProps, ref}, children);
});

export function DisclosureGroup(props: React.HTMLAttributes<HTMLDivElement> & {children?: React.ReactNode}) {
  let {children, ...otherProps} = props;
  return React.createElement('div', otherProps, children);
}

export function Disclosure(
  props: React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    className?: string | ((state: {isExpanded: boolean; isDisabled: boolean}) => string | undefined);
    isDisabled?: boolean;
  }
) {
  let {children, className, isDisabled, ...otherProps} = props;
  let resolvedClassName = typeof className === 'function'
    ? className({isExpanded: false, isDisabled: Boolean(isDisabled)})
    : className;

  return React.createElement('div', {...otherProps, className: resolvedClassName}, children);
}

export function DisclosurePanel(
  props: React.HTMLAttributes<HTMLDivElement> & {children?: React.ReactNode}
) {
  let {children, ...otherProps} = props;
  return React.createElement('div', {...otherProps, role: 'region'}, children);
}

export function Heading(
  props: React.HTMLAttributes<HTMLHeadingElement> & {children?: React.ReactNode; level?: number}
) {
  let {children, level = 3, ...otherProps} = props;
  let element = `h${level}` as keyof JSX.IntrinsicElements;
  return React.createElement(element, otherProps, children);
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
    className?: string | ((state: {isHovered: boolean; isFocusVisible: boolean; isPressed: boolean}) => string | undefined);
  }
) {
  let {children, className, ...otherProps} = props;
  let resolvedClassName = typeof className === 'function'
    ? className({isHovered: false, isFocusVisible: false, isPressed: false})
    : className;

  return React.createElement('button', {...otherProps, className: resolvedClassName, type: 'button'}, children);
}
