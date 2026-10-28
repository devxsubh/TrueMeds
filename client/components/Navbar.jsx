'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const displayName = user?.first_name || user?.username || 'Account';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)]/80 bg-[rgba(244,247,246,0.85)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2 no-underline">
          <span className="font-display text-2xl font-semibold tracking-tight text-[var(--teal-deep)] transition-colors group-hover:text-[var(--teal)]">
            TrueMeds
          </span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-[var(--muted)] sm:inline">
            Lab
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm text-[var(--slate)] no-underline transition hover:bg-white/70"
              >
                Analyze
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-3 py-2 text-sm text-[var(--slate)] no-underline transition hover:bg-white/70"
              >
                {displayName}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--teal)] hover:text-[var(--teal)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm text-[var(--slate)] no-underline transition hover:bg-white/70"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[var(--teal)] px-3 py-2 text-sm text-white no-underline transition hover:bg-[var(--teal-deep)]"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
