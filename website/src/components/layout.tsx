import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useTheme } from './theme-provider';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Docs', href: '/getting-started' },
  { name: 'Guide', href: '/guide' },
  { name: 'Middlewares', href: '/middlewares' },
  { name: 'Adapters', href: '/adapters' },
  { name: 'API', href: '/api' },
  { name: 'Examples', href: '/examples' },
];

function Logo() {
  return (
    <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(var(--gradient-start))" />
          <stop offset="100%" stopColor="rgb(var(--gradient-end))" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="8" fill="url(#logoGradient)" />
      <g opacity="0.95">
        <rect x="8" y="10" width="5" height="5" rx="1" fill="white" />
        <rect x="15.5" y="14.5" width="5" height="5" rx="1" fill="white" />
        <rect x="23" y="19" width="5" height="5" rx="1" fill="white" />
      </g>
      <path d="M11 13L15.5 17" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M18.5 17.5L23 21.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={clsx(
        'relative p-2.5 rounded-xl transition-all duration-300',
        'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--border))]',
        'border border-transparent hover:border-[rgb(var(--primary)/0.3)]',
        'hover:shadow-lg hover:shadow-[rgb(var(--primary)/0.1)]'
      )}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {/* Sun */}
        <svg
          className={clsx(
            'absolute inset-0 w-5 h-5 transition-all duration-300',
            resolvedTheme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {/* Moon */}
        <svg
          className={clsx(
            'absolute inset-0 w-5 h-5 transition-all duration-300',
            resolvedTheme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>
    </button>
  );
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 lg:hidden transition-all duration-300',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          'fixed top-0 right-0 bottom-0 w-80 max-w-[calc(100vw-3rem)]',
          'bg-[rgb(var(--card))] shadow-2xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-bold text-lg">OpenMiddleware</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-2">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                location.pathname === item.href
                  ? 'bg-gradient-to-r from-[rgb(var(--primary)/0.2)] to-[rgb(var(--accent)/0.1)] text-[rgb(var(--primary))] font-medium border border-[rgb(var(--primary)/0.3)]'
                  : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="number-badge text-xs">{index + 1}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[rgb(var(--border))]">
          <a
            href="https://github.com/openmiddleware/openmiddleware"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[rgb(var(--muted))] hover:bg-[rgb(var(--border))] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="font-medium">View on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className={clsx(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'glass-strong shadow-lg shadow-[rgb(var(--primary)/0.05)]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 py-4 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <Logo />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">OpenMiddleware</span>
                <span className="text-xs text-[rgb(var(--muted-foreground))] hidden sm:block">Universal Middleware</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === item.href
                      ? 'text-[rgb(var(--primary))]'
                      : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]'
                  )}
                >
                  {item.name}
                  {location.pathname === item.href && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 bg-gradient-to-r from-[rgb(var(--gradient-start))] to-[rgb(var(--gradient-end))] rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* GitHub */}
              <a
                href="https://github.com/openmiddleware/openmiddleware"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200',
                  'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--border))]',
                  'border border-transparent hover:border-[rgb(var(--primary)/0.3)]',
                  'text-sm font-medium'
                )}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
                <span className="px-1.5 py-0.5 rounded-md bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-xs font-semibold">Star</span>
              </a>

              <ThemeToggle />

              {/* Mobile menu button */}
              <button
                className={clsx(
                  'lg:hidden p-2.5 rounded-xl transition-all duration-200',
                  'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--border))]',
                  mobileMenuOpen && 'bg-[rgb(var(--primary)/0.1)]'
                )}
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 page-transition">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative mt-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-bg opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Top border gradient */}
        <div className="section-divider" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <Logo />
                <span className="font-bold text-xl">OpenMiddleware</span>
              </Link>
              <p className="text-[rgb(var(--muted-foreground))] max-w-sm mb-6">
                Universal, type-safe middleware framework for JavaScript runtimes. Write once, use everywhere.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/openmiddleware/openmiddleware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[rgb(var(--muted))] hover:bg-[rgb(var(--border))] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a
                  href="https://www.npmjs.com/package/@openmiddleware/chain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[rgb(var(--muted))] hover:bg-[rgb(var(--border))] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Documentation */}
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-3">
                {navigation.slice(0, 3).map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors link-hover"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                {navigation.slice(3).map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors link-hover"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="https://github.com/openmiddleware/openmiddleware/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors link-hover"
                  >
                    MIT License
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-16 pt-8 border-t border-[rgb(var(--border))]">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
                <span>Made with</span>
                <svg className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>by</span>
                <a
                  href="https://github.com/ersinkoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold gradient-text hover:opacity-80 transition-opacity"
                >
                  Ersin KOC
                </a>
              </div>
              <div className="text-sm text-[rgb(var(--muted-foreground))]">
                &copy; {new Date().getFullYear()} OpenMiddleware. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
