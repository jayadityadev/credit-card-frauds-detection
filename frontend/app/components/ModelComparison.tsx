import type { PredictionResult } from "@/lib/api";
import ResultCard from "./ResultCard";

interface ModelComparisonProps {
  result: PredictionResult;
}

function isoVerdictFromScore(score: number): "fraud" | "legit" {
  return score > 0 ? "fraud" : "legit";
}

export default function ModelComparison({ result }: ModelComparisonProps) {
  const isoVerdict = isoVerdictFromScore(result.isolation_forest_anomaly_score);

  return (
    <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ResultCard
        title="Consensus"
        verdict={result.consensus}
        subtitle="Deterministic LR/RF consensus with confidence-margin tie-break"
      />
      <ResultCard
        title="Isolation Forest"
        verdict={isoVerdict}
        subtitle="Based on anomaly score sign. Higher positive values indicate greater anomaly."
        metricLabel="Anomaly score"
        metricValue={result.isolation_forest_anomaly_score}
      />
      <ResultCard
        title="Logistic Regression"
        verdict={result.logistic_regression}
        metricLabel="Fraud probability"
        metricValue={result.lr_fraud_probability}
        metricAsPercent
      />
      <ResultCard
        title="Random Forest"
        verdict={result.random_forest}
        metricLabel="Fraud probability"
        metricValue={result.rf_fraud_probability}
        metricAsPercent
      />
    </section>
  );
}
