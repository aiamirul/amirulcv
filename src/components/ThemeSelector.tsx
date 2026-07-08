/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Palette, Copy, Check, RotateCcw } from 'lucide-react';

export type ThemePresetVal = 'dark' | 'light' | 'nord' | 'neo_tokyo' | 'earthy_warm';

export interface ThemeOption {
  value: ThemePresetVal;
  name: string;
  description: string;
  bgHex: string;
  accentHex: string;
  textHex: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'dark',
    name: 'Classic Dark',
    description: 'Sophisticated deep blue-slate with indigo accents.',
    bgHex: '#090e1a',
    accentHex: '#6366f1',
    textHex: '#f8fafc',
  },
  {
    value: 'light',
    name: 'Modern Light',
    description: 'Clean, crisp workspace with corporate blue accents.',
    bgHex: '#f8fafc',
    accentHex: '#2563eb',
    textHex: '#0f172a',
  },
  {
    value: 'nord',
    name: 'Nord Ice',
    description: 'Comforting arctic grey-blue and frost mint shades.',
    bgHex: '#2e3440',
    accentHex: '#88c0d0',
    textHex: '#eceff4',
  },
  {
    value: 'neo_tokyo',
    name: 'Neo Tokyo',
    description: 'Vibrant tech cyberpunk dark mode with neon pink.',
    bgHex: '#0b0518',
    accentHex: '#ec4899',
    textHex: '#fcfaff',
  },
  {
    value: 'earthy_warm',
    name: 'Earthy Warm',
    description: 'Calming, readable warm cream with olive green.',
    bgHex: '#faf8f5',
    accentHex: '#3f6212',
    textHex: '#2c251e',
  },
];

interface ThemeSelectorProps {
  currentTheme: ThemePresetVal;
  onThemeChange: (theme: ThemePresetVal) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const [copiedTheme, setCopiedTheme] = React.useState<string | null>(null);

  const handleCopyLink = (themeVal: ThemePresetVal) => {
    // Construct URL with ?theme=themeVal
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?theme=${themeVal}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedTheme(themeVal);
      setTimeout(() => setCopiedTheme(null), 2000);
    });
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-6 shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-[var(--accent-primary)] animate-pulse" />
        <h3 className="text-lg font-bold tracking-tight">Dynamic Aesthetic Templates</h3>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
        Choose a design aesthetic for this portfolio. Recruiters visiting via a custom template link will automatically view the portfolio in that theme.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = currentTheme === theme.value;
          const shareUrl = `?theme=${theme.value}`;

          return (
            <div
              key={theme.value}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)] ring-opacity-15 bg-[var(--bg-tertiary)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{theme.name}</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-black/10"
                      style={{ backgroundColor: theme.bgHex }}
                      title="Background"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-black/10"
                      style={{ backgroundColor: theme.accentHex }}
                      title="Accent"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 md:line-clamp-none h-8 leading-snug">
                  {theme.description}
                </p>
              </div>

              <div className="mt-4 flex gap-1.5 items-center w-full">
                <button
                  type="button"
                  onClick={() => onThemeChange(theme.value)}
                  className="flex-1 text-center py-1.5 px-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none"
                >
                  Activate
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink(theme.value)}
                  className="p-2 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)] cursor-pointer"
                  title="Copy share link with this theme"
                >
                  {copiedTheme === theme.value ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-3 w-full">
        <span className="leading-normal">* Theme parameter can be appended to any URL share as <code className="font-mono bg-[var(--bg-tertiary)] px-1 py-0.5 rounded">?theme=neo_tokyo</code></span>
        <button
          onClick={() => {
            // Remove GET parameter safely
            const baseUrl = window.location.origin + window.location.pathname;
            window.location.href = baseUrl;
          }}
          className="flex items-center gap-1 hover:text-[var(--accent-primary)] transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3 h-3" /> Clear URL Params
        </button>
      </div>
    </div>
  );
};
