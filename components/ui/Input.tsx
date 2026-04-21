import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, type = 'text', ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full px-4 py-3 rounded-lg bg-surface-container-high text-on-surface placeholder:text-on-surface-variant',
        'border-0 transition-shadow duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-0',
        invalid && 'ring-2 ring-error',
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';
