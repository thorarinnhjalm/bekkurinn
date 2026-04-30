import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders the primary variant with gradient classes by default', () => {
    render(<Button>Stofna bekk</Button>);
    const btn = screen.getByRole('button', { name: 'Stofna bekk' });
    expect(btn.className).toMatch(/bg-linear/);
    expect(btn.className).toMatch(/text-on-primary/);
  });

  it('renders the secondary variant with container fill', () => {
    render(<Button variant="secondary">Hætta við</Button>);
    const btn = screen.getByRole('button', { name: 'Hætta við' });
    expect(btn.className).toMatch(/bg-secondary-container/);
    expect(btn.className).toMatch(/text-on-secondary-container/);
  });

  it('renders the tertiary variant as text-only', () => {
    render(<Button variant="tertiary">Meira</Button>);
    const btn = screen.getByRole('button', { name: 'Meira' });
    expect(btn.className).toMatch(/text-primary/);
    expect(btn.className).not.toMatch(/bg-linear/);
  });

  it('forwards custom className', () => {
    render(<Button className="extra-class">x</Button>);
    expect(screen.getByRole('button').className).toMatch(/extra-class/);
  });

  it('supports asChild for Link wrapping via data attribute', () => {
    render(<Button data-testid="a" type="button">Go</Button>);
    expect(screen.getByTestId('a').tagName).toBe('BUTTON');
  });
});
