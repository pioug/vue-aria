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
