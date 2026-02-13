import React from 'react';

interface TransitionProps {
  children?: React.ReactNode | ((state: string) => React.ReactNode);
  in?: boolean;
}

export function Transition(props: TransitionProps) {
  let {children, in: inProp = true} = props;
  if (typeof children === 'function') {
    return React.createElement(React.Fragment, null, children(inProp ? 'entered' : 'exited'));
  }

  return React.createElement(React.Fragment, null, children);
}

export function CSSTransition(props: TransitionProps) {
  return React.createElement(Transition, props);
}

export function TransitionGroup(props: {children?: React.ReactNode}) {
  return React.createElement(React.Fragment, null, props.children);
}
