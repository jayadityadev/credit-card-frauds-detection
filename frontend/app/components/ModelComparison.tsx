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

  const cards = [
    {
      title: "Consensus",
      verdict: result.consensus,
      subtitle: "Deterministic LR/RF consensus with confidence-margin tie-break",
    },
    {
      title: "Isolation Forest",
      verdict: isoVerdict,
      subtitle: "Based on anomaly score sign. Higher positive values indicate greater anomaly.",
      metricLabel: "Anomaly score",
      metricValue: result.isolation_forest_anomaly_score,
    },
    {
      title: "Logistic Regression",
      verdict: result.logistic_regression,
      metricLabel: "Fraud probability",
      metricValue: result.lr_fraud_probability,
      metricAsPercent: true,
    },
    {
      title: "Random Forest",
      verdict: result.random_forest,
      metricLabel: "Fraud probability",
      metricValue: result.rf_fraud_probability,
      metricAsPercent: true,
    },
  ];

  return (
    <section className="mt-12">
      <div className="mb-8" style={{ animation: "blur-fade-in 0.8s ease-out" }}>
        <h2 className="text-3xl font-bold text-white mb-2">Ensemble Prediction Results</h2>
        <p className="text-gray-400">Real-time analysis from three independent machine learning models</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <ResultCard
            key={card.title}
            index={idx}
            title={card.title}
            verdict={card.verdict as "fraud" | "legit" | "uncertain"}
            subtitle={card.subtitle}
            metricLabel={card.metricLabel}
            metricValue={card.metricValue}
            metricAsPercent={card.metricAsPercent}
          />
        ))}
      </div>
    </section>
  );
}
