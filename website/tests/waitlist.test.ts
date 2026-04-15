import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidEmail, submitWaitlistEmail } from '../src/lib/waitlist';

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../src/lib/supabase';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('marc@example.com')).toBe(true);
    expect(isValidEmail('first.last+tag@sub.example.co.uk')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@no-local.com')).toBe(false);
    expect(isValidEmail('no-at-sign.com')).toBe(false);
    expect(isValidEmail('trailing@')).toBe(false);
  });
});

describe('submitWaitlistEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid email without touching Supabase', async () => {
    const result = await submitWaitlistEmail('not-email');
    expect(result).toEqual({ ok: false, reason: 'invalid' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns ok on successful insert', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitWaitlistEmail('marc@example.com');

    expect(result).toEqual({ ok: true });
    expect(supabase.from).toHaveBeenCalledWith('waitlist');
    expect(insert).toHaveBeenCalledWith({ email: 'marc@example.com', locale: 'de' });
  });

  it('returns duplicate on unique-violation error', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitWaitlistEmail('marc@example.com');

    expect(result).toEqual({ ok: false, reason: 'duplicate' });
  });

  it('returns error on generic failure', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { code: '42501', message: 'permission denied' },
    });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitWaitlistEmail('marc@example.com');

    expect(result).toEqual({ ok: false, reason: 'error' });
  });

  it('normalizes email to lowercase and trims whitespace', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert });

    await submitWaitlistEmail('  Marc@Example.COM  ');

    expect(insert).toHaveBeenCalledWith({ email: 'marc@example.com', locale: 'de' });
  });
});
