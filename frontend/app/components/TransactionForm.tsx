"use client";

import type { Transaction } from "@/lib/api";
import { useMemo } from "react";

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

  return (
    <section className="rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_10px_40px_rgba(23,29,42,0.08)] backdrop-blur-sm">
      <h2 className="text-xl font-semibold">Paste Transaction Row</h2>
      <p className="mt-2 text-sm text-slate-700">
        Paste a raw CSV row from creditcard.csv. Supported formats: 31 values
        (Time, V1-V28, Amount, Class) or 30 values (without Class).
      </p>

      <textarea
        value={rawInput}
        onChange={(e) => onRawInputChange(e.target.value)}
        placeholder="Example: 0,-1.359807,-0.072781,2.536347,1.378155,...,149.62,0"
        className="mt-4 h-36 w-full resize-y rounded-2xl border border-slate-300 bg-white p-3 text-sm outline-none transition focus:border-teal-600"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onParse}
          className="rounded-full border border-teal-700 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-700 hover:text-white"
        >
          Parse Row
        </button>
        <button
          type="button"
          disabled={!parsedTransaction || isLoading}
          onClick={onPredict}
          className="rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Predicting..." : "Run Prediction"}
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger-ink)]">
          {errorMessage}
        </p>
      ) : null}

      {quickPreview ? (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          {quickPreview.map(([key, value]) => (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs tracking-[0.08em] text-slate-600 uppercase">{key}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{value.toFixed(6)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
