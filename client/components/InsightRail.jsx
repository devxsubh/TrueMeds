'use client';

import { useState } from 'react';

const labelMeta = {
  authentic: { label: 'Authentic', color: 'var(--ok)', soft: '#ecfdf5' },
  suspicious: { label: 'Suspicious', color: 'var(--warn)', soft: '#fffbeb' },
  counterfeit: { label: 'Counterfeit', color: 'var(--danger)', soft: '#fef2f2' },
  unknown: { label: 'Unknown', color: 'var(--muted)', soft: '#f1f5f9' },
};

const TABS = [
  { id: 'authenticity', label: 'Authenticity' },
  { id: 'composition', label: 'Composition' },
  { id: 'alternatives', label: 'Alternatives' },
];

export default function InsightRail({ result, reveal }) {
  const [tab, setTab] = useState('authenticity');

  if (!result) {
    return (
      <aside className="flex h-full flex-col border-[var(--line)] bg-[var(--rail)] lg:border-l">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Insights
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">Results appear after you analyze a pack.</p>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-3 px-5 py-8 text-sm text-[var(--muted)]">
          <p>Authenticity signals</p>
          <p>Active composition</p>
          <p>Related alternatives</p>
        </div>
      </aside>
    );
  }

  const auth = result.authenticity || {};
  const meta = labelMeta[auth.label] || labelMeta.unknown;
  const pct = Math.round((auth.confidence || 0) * 100);

  return (
    <aside className="flex h-full flex-col border-[var(--line)] bg-[var(--rail)] lg:border-l">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Insights
        </p>
        <h2 className="font-display mt-1 text-xl text-[var(--ink)]">
          {result.medicine_name || 'Unrecognized product'}
        </h2>
      </div>

      <div className="flex gap-1 border-b border-[var(--line)] px-3 pt-2 lg:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-t-lg px-2 py-2 text-xs font-medium transition ${
              tab === t.id
                ? 'bg-white text-[var(--teal-deep)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <section
          className={`space-y-3 ${reveal ? 'animate-rail-in' : ''} ${
            tab !== 'authenticity' ? 'hidden lg:block' : ''
          }`}
          style={{ animationDelay: '0ms' }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Authenticity
          </h3>
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: meta.soft, color: meta.color }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide">{meta.label}</span>
              <span className="text-sm opacity-80">{pct}%</span>
            </div>
          </div>
          {auth.signals?.length > 0 && (
            <ul className="space-y-1.5 text-sm text-[var(--muted)]">
              {auth.signals.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          )}
        </section>

        <section
          className={`space-y-3 ${reveal ? 'animate-rail-in' : ''} ${
            tab !== 'composition' ? 'hidden lg:block' : ''
          }`}
          style={{ animationDelay: '80ms' }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Composition
          </h3>
          {result.composition?.length ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-1.5 pr-2 font-medium">Ingredient</th>
                  <th className="py-1.5 font-medium">Strength</th>
                </tr>
              </thead>
              <tbody>
                {result.composition.map((row) => (
                  <tr key={`${row.ingredient}-${row.strength}`} className="border-b border-[var(--line)]/60">
                    <td className="py-2 pr-2 text-[var(--ink)]">{row.ingredient}</td>
                    <td className="py-2 text-[var(--muted)]">{row.strength || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-[var(--muted)]">No composition extracted.</p>
          )}
        </section>

        <section
          className={`space-y-3 ${reveal ? 'animate-rail-in' : ''} ${
            tab !== 'alternatives' ? 'hidden lg:block' : ''
          }`}
          style={{ animationDelay: '160ms' }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Alternatives
          </h3>
          {result.alternatives?.length ? (
            <ul className="space-y-3">
              {result.alternatives.map((alt) => (
                <li key={alt.name} className="border-b border-[var(--line)]/60 pb-3 last:border-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium text-[var(--ink)]">{alt.name}</span>
                    {alt.same_actives && (
                      <span className="rounded bg-[var(--teal-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--teal-deep)]">
                        Same actives
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{alt.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">No alternatives suggested.</p>
          )}
        </section>

        {result.packaging_notes?.length > 0 && (
          <section className={`space-y-2 ${reveal ? 'animate-rail-in' : ''}`} style={{ animationDelay: '220ms' }}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Packaging notes
            </h3>
            <ul className="space-y-1 text-sm text-[var(--muted)]">
              {result.packaging_notes.map((n) => (
                <li key={n}>· {n}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="pt-2 text-[11px] leading-relaxed text-[var(--muted)]">{result.disclaimer}</p>
      </div>
    </aside>
  );
}
