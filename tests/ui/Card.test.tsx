import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children inside a surface-container-lowest box with ambient shadow', () => {
    render(<Card data-testid="c">Hello</Card>);
    const el = screen.getByTestId('c');
    expect(el.className).toMatch(/bg-surface-container-lowest/);
    expect(el.className).toMatch(/shadow-ambient/);
    expect(el.className).toMatch(/rounded-/);
    expect(el.textContent).toBe('Hello');
  });

  it('renders the elevated tone variant on surface-container', () => {
    render(<Card tone="elevated" data-testid="c">x</Card>);
    expect(screen.getByTestId('c').className).toMatch(/bg-surface-container\b/);
  });
});
