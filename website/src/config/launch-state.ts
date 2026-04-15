export type LaunchState = 'waitlist' | 'live';

export const LAUNCH_STATE: LaunchState = 'waitlist';

export type LaunchCopy = {
  ctaLabel: string;
  ctaAction: 'waitlist' | 'install';
  ctaHelper: string;
  footerMicro: string;
};

const COPY: Record<LaunchState, LaunchCopy> = {
  waitlist: {
    ctaLabel: 'Auf die Warteliste',
    ctaAction: 'waitlist',
    ctaHelper: 'Eine einzige E-Mail — am Start-Tag. Sonst nichts.',
    footerMicro: 'Ronki startet bald. Du erfährst es als eine:r der Ersten, wenn du auf die Warteliste wartest.',
  },
  live: {
    ctaLabel: 'Kostenlos testen',
    ctaAction: 'install',
    ctaHelper: 'Direkt im Browser. Kein App Store nötig.',
    footerMicro: 'Ronki läuft direkt im Browser — installierbar auf Handy und Tablet.',
  },
};

export function getLaunchCopy(state: LaunchState = LAUNCH_STATE): LaunchCopy {
  return COPY[state];
}
