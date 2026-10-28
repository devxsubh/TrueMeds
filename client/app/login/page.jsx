'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace('/lab');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) router.replace('/lab');
    else setError(result.error);
  };

  return (
    <div className="grid min-h-screen ambient-lab lg:grid-cols-2">
      <div className="relative flex flex-col justify-center px-6 py-16 sm:px-12">
        <Link
          href="/"
          className="font-display absolute left-6 top-8 text-2xl font-semibold text-[var(--teal-deep)] no-underline sm:left-12"
        >
          TrueMeds
        </Link>
        <div className="mx-auto w-full max-w-md animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
            Welcome back
          </p>
          <h1 className="font-display mt-3 text-3xl text-[var(--ink)] sm:text-4xl">
            Sign in to the lab
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Continue packaging analysis, composition, and alternatives.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm text-[var(--slate)]">
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-[var(--slate)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--teal)] py-3 text-sm font-medium text-white transition hover:bg-[var(--teal-deep)] disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Enter lab'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            New here?{' '}
            <Link href="/signup" className="font-medium text-[var(--teal-deep)]">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-[var(--slate)] text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="pointer-events-none absolute inset-0 molecular-grid opacity-20" />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(45,212,191,0.3), transparent 45%), radial-gradient(circle at 80% 80%, rgba(15,118,110,0.45), transparent 40%)',
          }}
        />
        <div className="relative animate-fade-up">
          <p className="text-xs uppercase tracking-[0.22em] text-teal-200/80">AI-native lab</p>
          <h2 className="font-display mt-4 max-w-md text-4xl leading-tight">
            Chat with the pack. Read the molecules.
          </h2>
        </div>
        <p className="relative max-w-sm text-sm text-slate-300">
          Multimodal analysis with authenticity, actives, and alternatives — then keep asking.
        </p>
      </aside>
    </div>
  );
}
