import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * ToolErrorBoundary — scoped error boundary for lazy-loaded tools + games.
 *
 * React 18 error boundaries MUST be class components. We wrap a tiny
 * functional fallback so we can still pull translations through the
 * useTranslation hook.
 *
 * Unlike the top-level ErrorBoundary (which takes the whole app to a
 * "😿 something went wrong" fallback and requires reload), this boundary
 * is kid-friendly and recoverable: if Louis opens a tool that crashes
 * or fails to load its chunk, he sees a warm "Huch, etwas ist
 * durcheinander" card with a "Zurück zur Basis" button that drops him
 * back at the Hub. The rest of the app keeps working.
 *
 * Props:
 *   - toolName: string  — used only for console logging so we can trace
 *                          which chunk broke across deploys.
 *   - onBack:   fn      — called when the user taps "Zurück zur Basis".
 *                          Typically `() => setView('hub')` from App.jsx.
 *   - children: node    — the lazy tool/game component.
 */

function ToolErrorFallback({ onBack }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center min-h-dvh px-6 text-center"
      style={{
        // Warm amber/cream backdrop so the fallback feels like a cozy
        // pause rather than an alarming crash. Matches the Lagerfeuer
        // palette we use in the Hub.
        background: 'linear-gradient(180deg, #fff7e6 0%, #ffe3b8 100%)',
      }}
    >
      <div className="text-5xl mb-4" aria-hidden="true">🫖</div>
      <h2 className="font-headline text-xl font-bold mb-2" style={{ color: '#8a4a12' }}>
        {t('tool.error.title')}
      </h2>
      <p className="font-body text-base mb-6 max-w-xs" style={{ color: '#6b4a23' }}>
        {t('tool.error.body')}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="font-label font-bold px-8 py-3 rounded-full"
        style={{
          // Teal button on amber card — matches the Hub "Lagerfeuer"
          // accent palette so the CTA feels familiar.
          background: 'linear-gradient(135deg, #2aa198 0%, #38c1b5 100%)',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(42, 161, 152, 0.35)',
          minHeight: 48,
        }}
      >
        {t('tool.error.back')}
      </button>
    </div>
  );
}

export default class ToolErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Console-only by design: we don't want to surface a toast/alert to
    // Louis, but developers should see what blew up.
    // eslint-disable-next-line no-console
    console.error(
      `[ToolErrorBoundary] tool="${this.props.toolName || 'unknown'}" crashed:`,
      error,
      info,
    );
  }

  handleBack = () => {
    this.setState({ hasError: false });
    if (typeof this.props.onBack === 'function') {
      this.props.onBack();
    }
  };

  render() {
    if (this.state.hasError) {
      return <ToolErrorFallback onBack={this.handleBack} />;
    }
    return this.props.children;
  }
}
