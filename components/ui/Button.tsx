import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full shadow-ambient hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-secondary-container text-on-secondary-container rounded-full hover:opacity-90',
  tertiary:
    'text-primary hover:text-primary-container underline-offset-4 hover:underline',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-4 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, type, ...rest }, ref) => (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
