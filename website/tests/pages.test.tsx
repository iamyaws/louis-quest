import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) })) },
}));

import Home from '../src/pages/Home';
import HowItWorks from '../src/pages/HowItWorks';
import Science from '../src/pages/Science';
import Impressum from '../src/pages/Impressum';
import Datenschutz from '../src/pages/Datenschutz';

function renderIn(route: string, Component: React.ComponentType) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Component />
    </MemoryRouter>,
  );
}

describe('Pages render without throwing', () => {
  it('renders Home', () => {
    renderIn('/', Home);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/ronki trägt die routine/i);
  });

  it('renders HowItWorks', () => {
    renderIn('/wie-es-funktioniert', HowItWorks);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/wie ronki arbeitet/i);
  });

  it('renders Science with external source links', () => {
    renderIn('/wissenschaft', Science);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/wissenschaft/i);
    const aapLink = screen.getByRole('link', { name: /AAP/i });
    expect(aapLink).toHaveAttribute('target', '_blank');
    expect(aapLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders Impressum', () => {
    renderIn('/impressum', Impressum);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/impressum/i);
  });

  it('renders Datenschutz', () => {
    renderIn('/datenschutz', Datenschutz);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/datenschutz/i);
    expect(screen.getAllByText(/keine tracking-cookies/i).length).toBeGreaterThan(0);
  });
});

describe('Semantic structure', () => {
  it('each page has exactly one h1', () => {
    for (const [Component, route] of [
      [Home, '/'],
      [HowItWorks, '/wie-es-funktioniert'],
      [Science, '/wissenschaft'],
      [Impressum, '/impressum'],
      [Datenschutz, '/datenschutz'],
    ] as const) {
      const { container, unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <Component />
        </MemoryRouter>,
      );
      const h1s = container.querySelectorAll('h1');
      expect(h1s.length, `${route} should have exactly one h1`).toBe(1);
      unmount();
    }
  });
});
