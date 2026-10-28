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
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) router.push('/');
    else setError(result.error);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col justify-center px-6 py-16 sm:px-12">
        <Link href="/" className="font-display absolute left-6 top-8 text-2xl text-[var(--teal-deep)] no-underline sm:left-12">
          TrueMeds
        </Link>
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-3xl text-[var(--ink)]">Sign in</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Access packaging analysis, composition, and alternatives.
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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
                className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--teal)]"
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
                className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--teal)] py-3 text-sm font-medium text-white hover:bg-[var(--teal-deep)] disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            No account?{' '}
            <Link href="/signup" className="font-medium text-[var(--teal-deep)]">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-[var(--slate)] text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(45,212,191,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(15,118,110,0.5), transparent 40%)',
          }}
        />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.22em] text-teal-200/80">Chemistry-aware</p>
          <h2 className="font-display mt-4 max-w-md text-4xl leading-tight">
            Authenticity, actives, and alternatives in one pass.
          </h2>
        </div>
        <p className="relative max-w-sm text-sm text-slate-300">
          Built for teams that care about molecular composition — not just a binary fake/real score.
        </p>
      </aside>
    </div>
  );
}
