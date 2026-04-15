import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaitlistCTA } from '../src/components/WaitlistCTA';

vi.mock('../src/lib/waitlist', () => ({
  submitWaitlistEmail: vi.fn(),
  isValidEmail: (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
}));

import { submitWaitlistEmail } from '../src/lib/waitlist';

describe('WaitlistCTA — waitlist state', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders waitlist copy when state is waitlist', () => {
    render(<WaitlistCTA launchState="waitlist" />);
    expect(screen.getByRole('button', { name: /auf die warteliste/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  it('shows success message after valid submission', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /auf die warteliste/i }));

    expect(await screen.findByText(/danke/i)).toBeInTheDocument();
  });

  it('shows duplicate message when email already exists', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: false, reason: 'duplicate' });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /auf die warteliste/i }));

    expect(await screen.findByText(/bist du schon/i)).toBeInTheDocument();
  });

  it('shows invalid-email inline error without calling API', async () => {
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'not-email');
    await user.click(screen.getByRole('button', { name: /auf die warteliste/i }));

    expect(await screen.findByText(/bitte gib eine gültige/i)).toBeInTheDocument();
    expect(submitWaitlistEmail).not.toHaveBeenCalled();
  });

  it('shows generic error on server failure', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: false, reason: 'error' });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /auf die warteliste/i }));

    expect(await screen.findByText(/etwas ist schiefgegangen/i)).toBeInTheDocument();
  });
});

describe('WaitlistCTA — live state', () => {
  it('renders a link to install instead of a form when live', () => {
    render(<WaitlistCTA launchState="live" />);
    expect(screen.getByRole('link', { name: /kostenlos testen/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/e-mail/i)).not.toBeInTheDocument();
  });
});
