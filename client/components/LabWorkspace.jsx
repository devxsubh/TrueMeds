'use client';

import { useEffect, useRef, useState } from 'react';
import { analyzeAPI, errorMessage } from '@/services/api';
import AnalysisStatus from '@/components/AnalysisStatus';
import ChatThread from '@/components/ChatThread';
import Composer from '@/components/Composer';
import InsightRail from '@/components/InsightRail';

const SUGGESTIONS = [
  'Explain the authenticity signals',
  'Summarize the active composition',
  'Compare same-actives alternatives',
  'What looks off on this pack?',
];

const WELCOME = {
  role: 'assistant',
  text: 'Attach a medicine pack photo to start. I’ll read authenticity signals, chemical composition, and alternatives — then you can ask follow-ups.',
};

export default function LabWorkspace() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [result, setResult] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusStep, setStatusStep] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState(null);
  const statusTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (statusTimer.current) clearInterval(statusTimer.current);
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
  };

  const resetSession = () => {
    clearPending();
    setMessages([WELCOME]);
    setInput('');
    setAnalysisId(null);
    setResult(null);
    setReveal(false);
    setAnalyzing(false);
    setStatusStep(0);
    setChatLoading(false);
    setError(null);
    if (statusTimer.current) clearInterval(statusTimer.current);
  };

  const onAttach = (file) => {
    if (!file?.type?.startsWith('image/')) {
      setError('Please attach an image (JPG, PNG, WEBP).');
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setError(null);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const startStatusCycle = () => {
    setStatusStep(0);
    if (statusTimer.current) clearInterval(statusTimer.current);
    statusTimer.current = setInterval(() => {
      setStatusStep((s) => (s < 3 ? s + 1 : s));
    }, 900);
  };

  const stopStatusCycle = () => {
    if (statusTimer.current) clearInterval(statusTimer.current);
    setStatusStep(3);
  };

  const runAnalyze = async (file, note) => {
    setAnalyzing(true);
    setError(null);
    setReveal(false);
    startStatusCycle();

    const preview = URL.createObjectURL(file);
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: note || 'Analyze this packaging',
        imagePreview: preview,
      },
    ]);

    try {
      const data = await analyzeAPI.analyze(file);
      stopStatusCycle();
      setAnalysisId(data.analysis_id);
      setResult(data.result);
      setReveal(true);
      const name = data.result?.medicine_name || 'this pack';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Analysis ready for ${name}. Authenticity: ${data.result?.authenticity?.label || 'unknown'} (${Math.round((data.result?.authenticity?.confidence || 0) * 100)}%). Check the insights rail for composition and alternatives — or ask me anything about the pack.`,
        },
      ]);
    } catch (err) {
      stopStatusCycle();
      const msg = errorMessage(err);
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `I couldn’t finish the analysis: ${msg}` },
      ]);
    } finally {
      setAnalyzing(false);
      clearPending();
    }
  };

  const sendChat = async (text) => {
    const message = text.trim();
    if (!message || !analysisId || chatLoading) return;
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatLoading(true);
    setError(null);
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

  const handleSend = async () => {
    const note = input.trim();
    if (analyzing || chatLoading) return;

    if (pendingFile) {
      setInput('');
      await runAnalyze(pendingFile, note);
      return;
    }

    if (!note) return;
    setInput('');

    if (!analysisId) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: note },
        {
          role: 'assistant',
          text: 'Attach a packaging image first — I need the photo to analyze authenticity, composition, and alternatives.',
        },
      ]);
      return;
    }

    await sendChat(note);
  };

  const medicineLabel = result?.medicine_name || (analysisId ? 'Current analysis' : 'New session');

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[560px] flex-col ambient-lab">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-white/50 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--teal)]">
            Lab session
          </p>
          <p className="truncate font-display text-lg text-[var(--ink)]">{medicineLabel}</p>
        </div>
        <button
          type="button"
          onClick={resetSession}
          className="shrink-0 rounded-xl border border-[var(--line)] bg-white px-3.5 py-2 text-sm text-[var(--slate)] transition hover:border-[var(--teal)] hover:text-[var(--teal-deep)]"
        >
          New analysis
        </button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
            <ChatThread messages={messages} chatLoading={chatLoading} />
            {analyzing && (
              <div className="mt-4 max-w-md">
                <AnalysisStatus active stepIndex={statusStep} />
              </div>
            )}
            {error && !analyzing && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}
            {analysisId && !analyzing && (
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={chatLoading}
                    onClick={() => sendChat(s)}
                    className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 text-xs text-[var(--slate)] transition hover:border-[var(--teal)] hover:text-[var(--teal-deep)] disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Composer
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onAttach={onAttach}
            pendingPreview={pendingPreview}
            onClearPending={clearPending}
            analyzing={analyzing}
            disabled={chatLoading}
            placeholder={
              analysisId
                ? 'Ask a follow-up about this pack…'
                : 'Attach a pack photo to analyze, or type a note…'
            }
          />
        </div>

        <div className="min-h-[280px] border-t border-[var(--line)] lg:min-h-0 lg:border-t-0">
          <InsightRail result={result} reveal={reveal} />
        </div>
      </div>
    </div>
  );
}
