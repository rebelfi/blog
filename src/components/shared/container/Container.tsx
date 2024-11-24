import { HTMLProps } from 'react';
import { twMerge } from 'tailwind-merge';

export const Container = ({ className, ...props }: HTMLProps<HTMLDivElement>) => {
  return <div className={twMerge('mx-auto px-16', className)} {...props} />;
};
