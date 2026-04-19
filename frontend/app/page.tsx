"use client";

import { useMemo, useState } from "react";
import ModelComparison from "./components/ModelComparison";
import MLInsights from "./components/MLInsights";
import TransactionForm from "./components/TransactionForm";
import PredictionFlow from "./components/PredictionFlow";
import { predictFraud, type PredictionResult, type Transaction } from "@/lib/api";

const FEATURE_KEYS = [
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
  "V18",
  "V19",
  "V20",
  "V21",
  "V22",
  "V23",
  "V24",
  "V25",
  "V26",
  "V27",
  "V28",
] as const;

type FeatureKey = (typeof FEATURE_KEYS)[number];

const LEGIT_SAMPLE =
  "0,-1.3598071336738,-0.0727811733098497,2.53634673796914,1.37815522427443,-0.338320769942518,0.462387777762292,0.239598554061257,0.0986979012610507,0.363786969611213,0.0907941719789316,-0.551599533260813,-0.617800855762348,-0.991389847235408,-0.311169353699879,1.46817697209427,-0.470400525259478,0.207971241929242,0.0257905801985591,0.403992960255733,0.251412098239705,-0.018306777944153,0.277837575558899,-0.110473910188767,0.0669280749146731,0.128539358273528,-0.189114843888824,0.133558376740387,-0.0210530534538215,69.99,0";

const FRAUD_SAMPLE =
  "7610,0.725645739819857,2.30089443776603,-5.32997618300917,4.007682804682,-1.73041059025206,-1.73219256822244,-3.96859261813707,1.06372815344105,-0.486096552344833,-4.62498495406596,5.5887239146762,-7.14824263637845,1.68045074096412,-6.21025774661028,0.495282117814298,-3.5995402092184,-4.83032424210571,-0.649090120211694,2.2501232487881,0.504646226103286,0.589669127323198,0.109541319229913,0.601045276521079,-0.364700278220039,-1.84307769215194,0.351909298434892,0.594549978086464,0.0993722360416487,1,1";

function parseCsvRow(input: string): Transaction {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error("Paste a CSV row first.");
  }

  let row = lines[lines.length - 1];
  const maybeHeader = lines[0].toLowerCase();
  if (lines.length > 1 && maybeHeader.includes("time") && maybeHeader.includes("amount")) {
    row = lines[1];
  }

  const values = row.split(",").map((v) => Number(v.trim()));
  if (values.some((v) => Number.isNaN(v))) {
    throw new Error("Row has non-numeric values. Ensure the row is plain numeric CSV.");
  }

  if (values.length !== 30 && values.length !== 31) {
    throw new Error(
      "Expected 30 or 31 values. Use a row from creditcard.csv with Time,V1-V28,Amount[,Class]."
    );
  }

  const withoutClass = values.length === 31 ? values.slice(0, 30) : values;
  const time = withoutClass[0];
  const amount = withoutClass[29];
  const features = withoutClass.slice(1, 29);

  if (features.length !== 28) {
    throw new Error("Could not parse V1-V28 from the row.");
  }

  const txn = {
    Amount: amount,
    Time: time,
  } as Transaction;

  FEATURE_KEYS.forEach((key, idx) => {
    (txn as Record<FeatureKey, number>)[key] = features[idx];
  });

  return txn;
}

export default function Home() {
  const [rawInput, setRawInput] = useState("");
  const [parsedTransaction, setParsedTransaction] = useState<Transaction | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sampleInfo = useMemo(
    () => [
      { label: "Load Legit Sample", value: LEGIT_SAMPLE },
      { label: "Load Fraud Sample", value: FRAUD_SAMPLE },
    ],
    []
  );

  function handleParse() {
    try {
      const parsed = parseCsvRow(rawInput);
      setParsedTransaction(parsed);
      setResult(null);
      setErrorMessage("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse CSV row.";
      setParsedTransaction(null);
      setResult(null);
      setErrorMessage(message);
    }
  }

  async function handlePredict() {
    if (!parsedTransaction) {
      setErrorMessage("Parse a row first before running prediction.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await predictFraud(parsedTransaction);
      setResult(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Prediction request failed.";
      setErrorMessage(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 md:px-8">
      <main className="relative mx-auto max-w-6xl z-10">
        <header className="mb-8 group">
          <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[var(--background-secondary)]/80 via-[var(--background)]/60 to-[var(--background)]/40 p-8 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl" style={{ animation: "glow-border 3s ease-in-out infinite", pointerEvents: "none" }} />
            
            <div className="relative z-10">
              <p className="text-xs tracking-[0.3em] text-cyan-400/70 uppercase font-semibold">Advanced ML Detection System</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-white" style={{ animation: "blur-fade-in 0.8s ease-out" }}>
                Fraud Detection Console
              </h1>
              <p className="mt-4 max-w-3xl text-sm text-gray-400 md:text-base leading-relaxed">
                Leverage ensemble machine learning with real-time analysis. Paste a transaction row and analyze with 3 independent models—Isolation Forest, Logistic Regression, and Random Forest.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                {sampleInfo.map((sample, idx) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setRawInput(sample.value);
                      setParsedTransaction(null);
                      setResult(null);
                      setErrorMessage("");
                    }}
                    className={`relative rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-300 overflow-hidden group/btn ${
                      idx === 0 
                        ? "border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-300 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                        : "border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-600/5 text-orange-300 hover:border-orange-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    }`}
                    style={{ animation: `slideInDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 80}ms both` }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">{idx === 0 ? "✓" : "⚠"}</span>
                      {sample.label}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn:opacity-20" style={{ animation: "shimmer 2s infinite" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <TransactionForm
          rawInput={rawInput}
          onRawInputChange={setRawInput}
          onParse={handleParse}
          onPredict={handlePredict}
          isLoading={isLoading}
          errorMessage={errorMessage}
          parsedTransaction={parsedTransaction}
        />

        <PredictionFlow isLoading={isLoading} />

        {result ? <ModelComparison result={result} /> : null}
        <MLInsights />
      </main>
    </div>
  );
}
