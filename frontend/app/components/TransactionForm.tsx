"use client";

import type { Transaction } from "@/lib/api";
import { useMemo, useState } from "react";

interface TransactionFormProps {
  rawInput: string;
  isLoading: boolean;
  errorMessage: string;
  onRawInputChange: (value: string) => void;
  onParse: () => void;
  onPredict: () => void;
  parsedTransaction: Transaction | null;
}

export default function TransactionForm({
  rawInput,
  isLoading,
  errorMessage,
  onRawInputChange,
  onParse,
  onPredict,
  parsedTransaction,
}: TransactionFormProps) {
  const [isParsingAnimating, setIsParsingAnimating] = useState(false);

  const quickPreview = useMemo(() => {
    if (!parsedTransaction) return null;
    return [
      ["Time", parsedTransaction.Time],
      ["Amount", parsedTransaction.Amount],
      ["V14", parsedTransaction.V14],
      ["V17", parsedTransaction.V17],
      ["V12", parsedTransaction.V12],
      ["V10", parsedTransaction.V10],
    ] as const;
  }, [parsedTransaction]);

  const handleParse = () => {
    setIsParsingAnimating(true);
    onParse();
    setTimeout(() => setIsParsingAnimating(false), 1200);
  };

  return (
    <section className="rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_10px_40px_rgba(23,29,42,0.08)] backdrop-blur-sm">
      <h2 className="text-xl font-semibold">Paste Transaction Row</h2>
      <p className="mt-2 text-sm text-slate-700">
        Paste a raw CSV row from creditcard.csv. Supported formats: 31 values
        (Time, V1-V28, Amount, Class) or 30 values (without Class).
      </p>

      <div className="relative mt-4">
        <textarea
          value={rawInput}
          onChange={(e) => onRawInputChange(e.target.value)}
          placeholder="Example: 0,-1.359807,-0.072781,2.536347,1.378155,...,149.62,0"
          className="h-36 w-full resize-y rounded-2xl border border-slate-300 bg-white p-3 text-sm outline-none transition focus:border-teal-600"
        />
        {rawInput && !isParsingAnimating && (
          <div className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-teal-600" />
        )}
        {isParsingAnimating && (
          <div className="absolute inset-0 rounded-2xl border-2 border-teal-500 animate-pulse" style={{ animation: "pulse-glow 1.2s ease-in-out" }} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleParse}
          disabled={isParsingAnimating}
          className="relative rounded-full border border-teal-700 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-700 hover:text-white disabled:opacity-60"
        >
          <span className={isParsingAnimating ? "opacity-0" : "opacity-100"}>Parse Row</span>
          {isParsingAnimating && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
          )}
        </button>
        <button
          type="button"
          disabled={!parsedTransaction || isLoading}
          onClick={onPredict}
          className="relative rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={isLoading ? "opacity-0" : "opacity-100"}>Run Prediction</span>
          {isLoading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
          )}
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger-ink)] animate-slideInUp" style={{ animation: "slideInUp 0.4s ease-out" }}>
          {errorMessage}
        </p>
      ) : null}

      {quickPreview ? (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          {quickPreview.map(([key, value], idx) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-white p-3"
              style={{
                animation: isParsingAnimating ? `slideInUp 0.4s ease-out ${idx * 50}ms both` : "none",
              }}
            >
              <p className="text-xs tracking-[0.08em] text-slate-600 uppercase">{key}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{value.toFixed(6)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
