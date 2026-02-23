import React from 'react';
import cn from 'classnames';
import './Loader.css';

export type LoaderProps = {
    size?: 's' | 'm' | 'l';
    accent?: boolean;
    className?: string;
};

const Loader: React.FC<LoaderProps> = ({
  size = 'l',
  accent = false,
  className,
}) => {
  return (
    <div
      data-testid="loader"
      className={cn('loader', className, {
        'loader--s': size === 's',
        'loader--m': size === 'm',
        'loader--l': size === 'l',
        'loader--accent': accent,
      })}
    />
  );
};

export default Loader;
