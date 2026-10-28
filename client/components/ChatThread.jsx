'use client';

import { useEffect, useRef } from 'react';

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-[var(--line)]">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

export default function ChatThread({ messages, chatLoading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-1 py-2 sm:px-2">
      {messages.map((m, i) => (
        <div
          key={`${m.role}-${i}`}
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
        >
          {m.role === 'user' ? (
            <div className="max-w-[85%] space-y-2">
              {m.imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.imagePreview}
                  alt="Uploaded packaging"
                  className="ml-auto max-h-48 rounded-xl object-cover ring-1 ring-white/30"
                />
              )}
              {m.text && (
                <div className="rounded-2xl rounded-br-md bg-[var(--slate)] px-4 py-2.5 text-sm leading-relaxed text-white">
                  {m.text}
                </div>
              )}
            </div>
          ) : m.role === 'system' ? (
            <div className="max-w-[90%] text-sm text-[var(--muted)]">{m.text}</div>
          ) : (
            <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-[var(--ink)] shadow-sm ring-1 ring-[var(--line)]">
              {m.text}
            </div>
          )}
        </div>
      ))}
      {chatLoading && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
