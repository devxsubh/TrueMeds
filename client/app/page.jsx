'use client';

import { useAuth } from '@/contexts/AuthContext';
import AnalyzePanel from '@/components/AnalyzePanel';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HomePage() {
  const { user } = useAuth();
  const name = user?.first_name || user?.username;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
            Packaging intelligence
          </p>
          <h1 className="font-display mt-3 text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
            TrueMeds
          </h1>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            {name ? `Welcome back, ${name}. ` : ''}
            Upload a medicine pack to read authenticity signals, chemical composition, and related
            alternatives — built for chemistry-aware workflows.
          </p>
        </header>
        <AnalyzePanel />
      </main>
    </ProtectedRoute>
  );
}
