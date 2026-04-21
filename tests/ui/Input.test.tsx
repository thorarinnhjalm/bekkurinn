import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders a text input with surface-container-high fill and no border', () => {
    render(<Input placeholder="Nafn" />);
    const el = screen.getByPlaceholderText('Nafn');
    expect(el.tagName).toBe('INPUT');
    expect(el.className).toMatch(/bg-surface-container-high/);
    expect(el.className).toMatch(/border-0/);
  });

  it('shows error styling when invalid is true', () => {
    render(<Input invalid placeholder="x" />);
    expect(screen.getByPlaceholderText('x').className).toMatch(/ring-error/);
  });
});
