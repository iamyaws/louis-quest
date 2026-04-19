import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import CompanionVariantMigration from './CompanionVariantMigration';
import { LanguageProvider } from '../i18n/LanguageContext';

// Minimal TaskContext stub so the component's useTask() hook resolves.
vi.mock('../context/TaskContext', () => ({
  useTask: () => ({
    actions: { patchState: vi.fn() },
    state: null,
    computed: {},
  }),
}));

describe('CompanionVariantMigration', () => {
  it('renders the prompt view without crashing', () => {
    // renderToString catches top-level render errors cheaply — we don't need
    // a full testing-library setup for a smoke test.
    const html = renderToString(
      <LanguageProvider>
        <CompanionVariantMigration />
      </LanguageProvider>
    );
    expect(html).toBeTruthy();
    // The prompt copy should appear in the initial render.
    expect(html).toMatch(/Ronki/);
  });

  it('exports a default function component', () => {
    expect(typeof CompanionVariantMigration).toBe('function');
  });
});
