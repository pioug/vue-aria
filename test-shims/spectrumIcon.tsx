import React from 'react';

interface SpectrumIconProps extends React.SVGProps<SVGSVGElement> {
  UNSAFE_className?: string
}

export default function SpectrumIcon(props: SpectrumIconProps) {
  let {UNSAFE_className, ...otherProps} = props;
  return (
    <svg
      {...otherProps}
      className={UNSAFE_className} />
  );
}
