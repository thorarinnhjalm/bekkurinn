import * as React from 'react';
import { cn } from '@/lib/utils';

export type ChipVariant = 'info' | 'success' | 'birthday' | 'pinned' | 'danger';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

const variantClasses: Record<ChipVariant, string> = {
  info: 'bg-surface-container-high text-on-surface',
  success: 'bg-primary-container/10 text-primary',
  birthday: 'bg-tertiary-fixed text-on-tertiary-fixed',
  pinned: 'bg-tertiary-fixed text-on-tertiary-fixed',
  danger: 'bg-error-container text-on-error-container',
};

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ variant = 'info', className, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  ),
);
Chip.displayName = 'Chip';
