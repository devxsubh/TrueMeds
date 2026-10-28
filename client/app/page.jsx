'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/lab');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center ambient-lab text-[var(--muted)]">
        Opening lab…
      </div>
    );
  }

  return (
    <div className="ambient-lab min-h-screen">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="font-display text-2xl font-semibold tracking-tight text-[var(--teal-deep)]">
            TrueMeds
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm text-[var(--slate)] no-underline transition hover:bg-white/50"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[var(--teal)] px-3.5 py-2 text-sm font-medium text-white no-underline transition hover:bg-[var(--teal-deep)]"
            >
              Open lab
            </Link>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-4 pb-20 pt-24 sm:px-6">
        <div className="pointer-events-none absolute inset-0 molecular-grid opacity-60" />
        <div
          className="pointer-events-none absolute -right-24 top-24 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(15,118,110,0.35), transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-10 h-[280px] w-[280px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(21,32,43,0.25), transparent 70%)',
          }}
        />

        <div className="relative mx-auto w-full max-w-3xl">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">
            TrueMeds
          </p>
          <h1 className="font-display animate-fade-up-delay mt-5 text-5xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
            Packaging intelligence for chemistry-aware teams.
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg text-[var(--muted)] sm:text-xl">
            Drop a medicine pack. Get authenticity signals, active composition, and alternatives —
            then keep asking.
          </p>
          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-[var(--slate)] px-6 py-3.5 text-sm font-medium text-white no-underline transition hover:bg-[var(--ink)]"
            >
              Open lab
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-[var(--line)] bg-white/70 px-6 py-3.5 text-sm font-medium text-[var(--ink)] no-underline backdrop-blur transition hover:border-[var(--teal)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)]/80 bg-white/40 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            One pass. Three answers.
          </h2>
          <p className="mt-3 max-w-lg text-[var(--muted)]">
            Built for workflows that care about molecules — not just a binary fake-or-real score.
          </p>
          <dl className="mt-12 space-y-8">
            <div className="border-t border-[var(--line)] pt-6">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                Authenticity
              </dt>
              <dd className="mt-2 text-lg text-[var(--slate)]">
                Packaging signals from print quality, codes, and layout integrity.
              </dd>
            </div>
            <div className="border-t border-[var(--line)] pt-6">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                Composition
              </dt>
              <dd className="mt-2 text-lg text-[var(--slate)]">
                Active ingredients and strengths pulled from the pack when readable.
              </dd>
            </div>
            <div className="border-t border-[var(--line)] pt-6">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                Alternatives
              </dt>
              <dd className="mt-2 text-lg text-[var(--slate)]">
                Related options with the same or similar actives, ready for follow-up chat.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
