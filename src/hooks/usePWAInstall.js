import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [androidPrompt, setAndroidPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone
    ) {
      setIsInstalled(true);
      return;
    }
    const handler = (e) => {
      e.preventDefault();
      setAndroidPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!androidPrompt) return false;
    androidPrompt.prompt();
    const { outcome } = await androidPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setAndroidPrompt(null);
    return outcome === 'accepted';
  };

  // iOS Safari (not already in standalone)
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !window.navigator.standalone;

  return { androidPrompt, isIOS, isInstalled, promptInstall };
}
