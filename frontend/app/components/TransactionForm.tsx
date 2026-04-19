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
    <section className="group">
      <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[var(--background-secondary)]/80 via-[var(--background)]/60 to-[var(--background)]/40 p-8 backdrop-blur-xl overflow-hidden" style={{ animation: "blur-fade-in 0.8s ease-out 0.2s both" }}>
        <div className="absolute inset-0 rounded-2xl" style={{ animation: "glow-border 3s ease-in-out infinite", pointerEvents: "none" }} />
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white">Transaction Input</h2>
          <p className="mt-2 text-sm text-gray-400">
            Paste a CSV row from creditcard.csv (31 values: Time, V1-V28, Amount, Class | or 30 without Class)
          </p>

          <div className="relative mt-6">
            <textarea
              value={rawInput}
              onChange={(e) => onRawInputChange(e.target.value)}
              placeholder="0,-1.359807,-0.072781,2.536347,1.378155,...,149.62,0"
              className="h-40 w-full resize-y rounded-xl border border-cyan-500/20 bg-[var(--background-secondary)]/60 p-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-400/50 focus:bg-[var(--background-secondary)]/80"
            />
            {rawInput && !isParsingAnimating && (
              <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-cyan-400" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
            )}
            {isParsingAnimating && (
              <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ animation: "glow-border 1.2s ease-in-out" }} />
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleParse}
              disabled={isParsingAnimating}
              className="relative rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 px-6 py-3 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`transition-opacity duration-200 ${isParsingAnimating ? "opacity-0" : "opacity-100"}`}>
                Parse Row
              </span>
              {isParsingAnimating && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-5 w-5 animate-spin text-cyan-400" viewBox="0 0 24 24" fill="none">
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
              className="relative rounded-lg border border-purple-500/40 bg-gradient-to-r from-purple-500/20 to-purple-600/10 px-6 py-3 text-sm font-semibold text-purple-300 transition-all duration-300 hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}>
                Run Prediction
              </span>
              {isLoading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-5 w-5 animate-spin text-purple-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </span>
              )}
            </button>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" style={{ animation: "slideInUp 0.4s ease-out" }}>
              {errorMessage}
            </div>
          ) : null}

          {quickPreview ? (
            <div className="mt-8">
              <p className="text-xs tracking-widest text-gray-500 uppercase mb-4">Parsed Features Preview</p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {quickPreview.map(([key, value], idx) => (
                  <div
                    key={key}
                    className="rounded-lg border border-cyan-500/20 bg-[var(--background-secondary)]/50 backdrop-blur p-3"
                    style={{
                      animation: isParsingAnimating ? `bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 70}ms both` : "none",
                    }}
                  >
                    <p className="text-xs tracking-widest text-cyan-400/70 uppercase font-semibold">{key}</p>
                    <p className="mt-2 text-lg font-mono font-bold text-cyan-300">{value.toFixed(4)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
