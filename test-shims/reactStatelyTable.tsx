import React from 'react';

type NodeProps = {
  children?: React.ReactNode
};

export function Column({children}: NodeProps) {
  return React.createElement(React.Fragment, null, children);
}

export function TableHeader({children}: NodeProps) {
  return React.createElement(React.Fragment, null, children);
}

export function TableBody({children}: NodeProps) {
  return React.createElement(React.Fragment, null, children);
}

export function Section({children}: NodeProps) {
  return React.createElement(React.Fragment, null, children);
}

export function Row({children}: NodeProps) {
  return React.createElement(React.Fragment, null, children);
}

export function Cell({children}: NodeProps) {
  return React.createElement(React.Fragment, null, children);
}
