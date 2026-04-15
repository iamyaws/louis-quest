import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

describe('App smoke test', () => {
  it('renders homepage at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/ronki trägt die routine/i);
  });

  it('renders 404 for unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/hier ist ronki nicht zu hause/i)).toBeInTheDocument();
  });
});
