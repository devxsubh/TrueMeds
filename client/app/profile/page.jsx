'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, errorMessage } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await userAPI.getProfile();
        setUser(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
        });
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const updated = await userAPI.updateProfile({
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email,
      });
      setUser(updated);
      updateUser(updated);
      setEditing(false);
      setSuccess('Profile updated');
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-display text-3xl text-[var(--ink)]">Profile</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Account details for TrueMeds.</p>

        {loading ? (
          <p className="mt-10 text-[var(--muted)]">Loading…</p>
        ) : (
          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {success}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-[var(--slate)]">First name</label>
                  <input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--teal)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[var(--slate)]">Last name</label>
                  <input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--teal)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[var(--slate)]">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--teal)]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[var(--teal)] px-4 py-2 text-sm text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[var(--muted)]">Username</p>
                  <p className="mt-0.5 font-medium">{user?.username}</p>
                </div>
                <div>
                  <p className="text-[var(--muted)]">Name</p>
                  <p className="mt-0.5 font-medium">
                    {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--muted)]">Email</p>
                  <p className="mt-0.5 font-medium">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-2 rounded-lg bg-[var(--slate)] px-4 py-2 text-sm text-white"
                >
                  Edit profile
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
