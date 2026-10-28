'use client';

import { useEffect, useRef, useState } from 'react';
import { analyzeAPI, errorMessage } from '@/services/api';

const labelStyles = {
  authentic: { bg: '#ecfdf5', fg: '#047857', border: '#a7f3d0' },
  suspicious: { bg: '#fffbeb', fg: '#b45309', border: '#fcd34d' },
  counterfeit: { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca' },
  unknown: { bg: '#f8fafc', fg: '#475569', border: '#cbd5e1' },
};

function AuthenticityBadge({ authenticity }) {
  const style = labelStyles[authenticity?.label] || labelStyles.unknown;
  const pct = Math.round((authenticity?.confidence || 0) * 100);
  return (
    <div
      className="inline-flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3"
      style={{ background: style.bg, borderColor: style.border, color: style.fg }}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.16em]">
        {authenticity?.label || 'unknown'}
      </span>
      <span className="text-sm opacity-80">{pct}% confidence</span>
    </div>
  );
}

export default function AnalyzePanel() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setAnalysisId(null);
    setMessages([]);
    setError(null);
    setInput('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const onSelect = (selected) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    setError(null);
    setResult(null);
    setAnalysisId(null);
    setMessages([]);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const runAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeAPI.analyze(file);
      setAnalysisId(data.analysis_id);
      setResult(data.result);
      setMessages([
        {
          role: 'system',
          text: 'Analysis ready. Ask about composition, packaging signals, or alternatives.',
        },
      ]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || !analysisId || chatLoading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatLoading(true);
    try {
      const data = await analyzeAPI.chat(analysisId, message);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Could not reply: ${errorMessage(err)}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onSelect(e.dataTransfer.files?.[0]);
            }}
            className={`relative overflow-hidden rounded-2xl border border-dashed transition ${
              dragging
                ? 'border-[var(--teal)] bg-[var(--teal-soft)]/40'
                : 'border-[var(--line)] bg-white/70'
            }`}
          >
            {preview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Medicine packaging preview" className="max-h-[360px] w-full object-contain" />
                <button
                  type="button"
                  onClick={reset}
                  className="absolute right-3 top-3 rounded-md bg-white/90 px-3 py-1.5 text-xs text-[var(--ink)] shadow-sm"
                >
                  Clear
                </button>
              </div>
            ) : (
              <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                <span className="font-display text-xl text-[var(--teal-deep)]">Drop packaging photo</span>
                <span className="max-w-xs text-sm text-[var(--muted)]">
                  Blister packs, cartons, or labels — we extract composition, authenticity signals, and alternatives.
                </span>
                <span className="mt-2 rounded-md bg-[var(--teal)] px-4 py-2 text-sm text-white">
                  Choose image
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onSelect(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={!file || loading}
            onClick={runAnalyze}
            className="w-full rounded-lg bg-[var(--teal)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--teal-deep)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Analyzing packaging…' : 'Analyze medicine'}
          </button>
        </div>

        <div className="space-y-4">
          {!result ? (
            <div className="flex min-h-[280px] flex-col justify-center rounded-2xl border border-[var(--line)] bg-white/60 px-6 py-10">
              <p className="font-display text-2xl text-[var(--slate)]">What you get</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <li>Authenticity signals from packaging print quality, codes, and layout</li>
                <li>Chemical / active composition with strengths when readable</li>
                <li>Alternatives with the same or related actives</li>
                <li>Follow-up Q&A grounded in the uploaded image</li>
              </ul>
              <p className="mt-6 text-xs text-[var(--muted)]">
                Informational only — not medical advice or a substitute for regulatory QC.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-[fadeUp_0.45s_ease]">
              <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_1px_0_rgba(15,28,26,0.04)]">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Identified</p>
                <h2 className="font-display mt-1 text-2xl text-[var(--ink)]">
                  {result.medicine_name || 'Unrecognized product'}
                </h2>
                <div className="mt-4">
                  <AuthenticityBadge authenticity={result.authenticity} />
                </div>
                {result.authenticity?.signals?.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted)]">
                    {result.authenticity.signals.map((s) => (
                      <li key={s}>· {s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                <h3 className="font-display text-lg text-[var(--slate)]">Composition</h3>
                {result.composition?.length ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wider text-[var(--muted)]">
                          <th className="py-2 pr-4 font-medium">Ingredient</th>
                          <th className="py-2 font-medium">Strength</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.composition.map((row) => (
                          <tr key={`${row.ingredient}-${row.strength}`} className="border-b border-[var(--line)]/70">
                            <td className="py-2.5 pr-4 text-[var(--ink)]">{row.ingredient}</td>
                            <td className="py-2.5 text-[var(--muted)]">{row.strength || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[var(--muted)]">No composition extracted from the image.</p>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                <h3 className="font-display text-lg text-[var(--slate)]">Alternatives</h3>
                {result.alternatives?.length ? (
                  <ul className="mt-3 space-y-3">
                    {result.alternatives.map((alt) => (
                      <li key={alt.name} className="border-b border-[var(--line)]/70 pb-3 last:border-0 last:pb-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-medium text-[var(--ink)]">{alt.name}</span>
                          {alt.same_actives && (
                            <span className="rounded bg-[var(--teal-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--teal-deep)]">
                              Same actives
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[var(--muted)]">{alt.reason}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[var(--muted)]">No alternatives suggested.</p>
                )}
              </div>

              {result.packaging_notes?.length > 0 && (
                <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-5">
                  <h3 className="font-display text-lg text-[var(--slate)]">Packaging notes</h3>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                    {result.packaging_notes.map((n) => (
                      <li key={n}>· {n}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-[var(--muted)]">{result.disclaimer}</p>
            </div>
          )}
        </div>
      </section>

      {analysisId && (
        <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h3 className="font-display text-lg text-[var(--slate)]">Ask about this analysis</h3>
            <p className="text-sm text-[var(--muted)]">Grounded in your uploaded packaging image.</p>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-[var(--teal)] text-white'
                    : m.role === 'system'
                      ? 'bg-[var(--bg)] text-[var(--muted)]'
                      : 'bg-[var(--bg)] text-[var(--ink)]'
                }`}
              >
                {m.text}
              </div>
            ))}
            {chatLoading && <p className="text-sm text-[var(--muted)]">Thinking…</p>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChat} className="flex gap-2 border-t border-[var(--line)] p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. What actives match this pack?"
              className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--teal)]"
            />
            <button
              type="submit"
              disabled={chatLoading || !input.trim()}
              className="rounded-lg bg-[var(--slate)] px-4 py-2.5 text-sm text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>
      )}

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
