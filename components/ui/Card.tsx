import * as React from 'react';
import { cn } from '@/lib/utils';

export type CardTone = 'default' | 'elevated' | 'subtle';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

const toneClasses: Record<CardTone, string> = {
  default: 'bg-surface-container-lowest shadow-ambient',
  elevated: 'bg-surface-container shadow-ambient',
  subtle: 'bg-surface-container-low',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ tone = 'default', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-3xl p-6 transition-transform duration-200', toneClasses[tone], className)}
      {...rest}
    />
  ),
);
Card.displayName = 'Card';
