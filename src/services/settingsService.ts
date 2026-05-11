import { Accent } from '../types';

const ACCENT_KEY = 'eduspeak_accent';

export function getPreferredAccent(): Accent {
  const saved = localStorage.getItem(ACCENT_KEY);
  if (saved === 'en-US' || saved === 'en-GB') {
    return saved as Accent;
  }
  return 'en-GB'; // Default to UK English for Nigerian context
}

export function setPreferredAccent(accent: Accent) {
  localStorage.setItem(ACCENT_KEY, accent);
  // Trigger a custom event so components can react without a full refresh if needed
  window.dispatchEvent(new Event('accentChange'));
}
