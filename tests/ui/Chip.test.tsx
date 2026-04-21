import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chip } from '@/components/ui/Chip';

describe('Chip', () => {
  it('renders the birthday variant in tertiary-fixed amber', () => {
    render(<Chip variant="birthday">Afmæli</Chip>);
    expect(screen.getByText('Afmæli').className).toMatch(/bg-tertiary-fixed/);
    expect(screen.getByText('Afmæli').className).toMatch(/text-on-tertiary-fixed/);
  });

  it('renders the success variant on primary-container tint', () => {
    render(<Chip variant="success">Samþykkt</Chip>);
    expect(screen.getByText('Samþykkt').className).toMatch(/bg-primary-container\/10/);
    expect(screen.getByText('Samþykkt').className).toMatch(/text-primary/);
  });

  it('renders the danger variant with error tokens', () => {
    render(<Chip variant="danger">Villa</Chip>);
    expect(screen.getByText('Villa').className).toMatch(/bg-error-container/);
    expect(screen.getByText('Villa').className).toMatch(/text-on-error-container/);
  });
});
