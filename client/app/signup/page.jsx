'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace('/lab');
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name || undefined,
    };
    const result = await signup(payload);
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
            Get started
          </p>
          <h1 className="font-display mt-3 text-3xl text-[var(--ink)] sm:text-4xl">
            Create your lab account
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Analyze packaging in a chat-native workspace.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="first_name" className="mb-1.5 block text-sm text-[var(--slate)]">
                First name
              </label>
              <input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm text-[var(--slate)]">
                Username
              </label>
              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--slate)]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-[var(--slate)]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 outline-none focus:border-[var(--teal)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--teal)] py-3 text-sm font-medium text-white transition hover:bg-[var(--teal-deep)] disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Open lab'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[var(--teal-deep)]">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-[var(--teal-deep)] text-white lg:flex lg:flex-col lg:justify-end lg:p-14">
        <div className="pointer-events-none absolute inset-0 molecular-grid opacity-25" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(15,23,42,0.35), transparent 50%), radial-gradient(circle at 70% 20%, rgba(204,251,241,0.25), transparent 40%)',
          }}
        />
        <div className="relative animate-fade-up">
          <h2 className="font-display text-3xl leading-snug sm:text-4xl">
            From pack photo to actives table — in one conversational pass.
          </h2>
        </div>
      </aside>
    </div>
  );
}
