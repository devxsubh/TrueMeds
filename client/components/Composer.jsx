'use client';

import { useRef } from 'react';

export default function Composer({
  input,
  setInput,
  onSend,
  onAttach,
  pendingPreview,
  onClearPending,
  disabled,
  analyzing,
  placeholder = 'Ask about this pack, or attach an image…',
}) {
  const fileRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    onSend();
  };

  return (
    <form
      onSubmit={submit}
      className="border-t border-[var(--line)] bg-[var(--composer)] px-3 py-3 backdrop-blur-md sm:px-4"
    >
      {pendingPreview && (
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-[var(--teal-soft)]/50 px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingPreview} alt="" className="h-12 w-12 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--teal-deep)]">Packaging attached</p>
            <p className="text-xs text-[var(--muted)]">Send to analyze, or add a question</p>
          </div>
          <button
            type="button"
            onClick={onClearPending}
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-[var(--line)] bg-white p-2 shadow-sm focus-within:border-[var(--teal)]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || analyzing}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--slate)] transition hover:bg-[var(--bg)] disabled:opacity-40"
          aria-label="Attach image"
          title="Attach packaging image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onAttach(f);
            e.target.value = '';
          }}
        />
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || analyzing}
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-[var(--muted)]"
        />
        <button
          type="submit"
          disabled={disabled || analyzing || (!input.trim() && !pendingPreview)}
          className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-[var(--teal)] px-4 text-sm font-medium text-white transition hover:bg-[var(--teal-deep)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {analyzing ? 'Working…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
