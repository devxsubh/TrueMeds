'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const displayName = user?.first_name || user?.username || 'Account';
  const onLab = pathname?.startsWith('/lab');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)]/70 glass-nav">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link href={isAuthenticated ? '/lab' : '/'} className="group flex items-baseline gap-2 no-underline">
          <span className="font-display text-2xl font-semibold tracking-tight text-[var(--teal-deep)] transition-colors group-hover:text-[var(--teal)]">
            TrueMeds
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] sm:inline">
            Lab
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/lab"
                className={`rounded-lg px-3 py-2 text-sm no-underline transition ${
                  onLab
                    ? 'bg-white text-[var(--teal-deep)] shadow-sm'
                    : 'text-[var(--slate)] hover:bg-white/60'
                }`}
              >
                Lab
              </Link>
              <Link
                href="/profile"
                className={`rounded-lg px-3 py-2 text-sm no-underline transition ${
                  pathname === '/profile'
                    ? 'bg-white text-[var(--teal-deep)] shadow-sm'
                    : 'text-[var(--slate)] hover:bg-white/60'
                }`}
              >
                {displayName}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--teal)] hover:text-[var(--teal)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm text-[var(--slate)] no-underline transition hover:bg-white/60"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[var(--teal)] px-3.5 py-2 text-sm font-medium text-white no-underline transition hover:bg-[var(--teal-deep)]"
              >
                Open lab
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
