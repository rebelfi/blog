import { HTMLProps } from 'react';
import { twMerge } from 'tailwind-merge';

export const Container = ({ className, ...props }: HTMLProps<HTMLDivElement>) => {
  return (
    <div
      className={twMerge('mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12', className)}
      {...props}
    />
  );
};
