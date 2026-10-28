'use client';

const STEPS = [
  'Reading packaging',
  'Extracting actives',
  'Scoring authenticity',
  'Finding alternatives',
];

export default function AnalysisStatus({ active = true, stepIndex = 0 }) {
  if (!active) return null;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3">
      <div className="mb-2 h-1 overflow-hidden rounded-full bg-[var(--teal-soft)]">
        <div className="h-full w-1/2 animate-shimmer rounded-full" />
      </div>
      <ul className="space-y-1.5">
        {STEPS.map((label, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li
              key={label}
              className={`flex items-center gap-2 text-sm ${
                current
                  ? 'animate-pulse-soft font-medium text-[var(--teal-deep)]'
                  : done
                    ? 'text-[var(--ink)]'
                    : 'text-[var(--muted)]/60'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  current || done ? 'bg-[var(--teal)]' : 'bg-[var(--line)]'
                }`}
              />
              {label}
              {current ? '…' : done ? '' : ''}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
