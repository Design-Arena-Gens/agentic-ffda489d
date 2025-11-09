"use client";
import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select {...rest} className={clsx('select', className)}>
      {children}
    </select>
  );
}
