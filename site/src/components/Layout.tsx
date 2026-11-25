import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'aicl-theme';

/** Read the persisted theme; `null` means "the user did not choose yet". */
export function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    // localStorage can be unavailable (private mode, disabled storage, SSR).
    return null;
  }
}

/** Persist the theme choice; failures are silently ignored. */
export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

/** The theme the operating system asks for. */
export function preferredTheme(): Theme {
  try {
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch {
    /* ignore */
  }
  return 'light';
}

/**
 * Theme state of the site.
 *
 * When the user has not chosen a theme explicitly, the site follows
 * `prefers-color-scheme` (the CSS owns that fallback, the hook only reports
 * the effective theme for the toggle button).
 */
export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? preferredTheme());

  useEffect(() => {
    const root = document.documentElement;
    const stored = readStoredTheme();
    if (stored) {
      root.setAttribute('data-theme', stored);
    } else {
      root.removeAttribute('data-theme');
    }
    setThemeState(stored ?? preferredTheme());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  return { theme, setTheme, toggleTheme };
}

export interface LayoutProps {
  children: ReactNode;
}

/** The shell of the site: header, main area and footer. */
export function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="site">
      <a className="site__skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-header__brand" to="/">
            <span className="site-header__logo" aria-hidden="true">
              ◧
            </span>
            <span className="site-header__title">AI Component Library</span>
          </Link>
          <nav className="site-header__nav" aria-label="Main">
            <Link className="site-header__link" to="/">
              Catalog
            </Link>
          </nav>
          <button
            type="button"
            className="site-header__theme"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
            <span className="site-header__theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>
      <main className="site-main" id="main">
        {children}
      </main>
      <footer className="site-footer">
        <p>
          AI Component Library — showcase site. Every preview renders the real component
          from the library sources.
        </p>
      </footer>
    </div>
  );
}
