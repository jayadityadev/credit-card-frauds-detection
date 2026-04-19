import Link from "next/link";

const DATA_FACTS = [
  { label: "Total transactions", value: "284,807" },
  { label: "Fraud transactions", value: "492 (0.172%)" },
  { label: "Features used", value: "30 (V1-V28, Amount_scaled, Time_scaled)" },
  { label: "Test set", value: "56,962 rows (98 fraud)" },
];

const MODEL_METRICS = [
  {
    model: "Isolation Forest",
    precision: "0.24",
    recall: "0.31",
    f1: "0.27",
    prAuc: "0.15",
    rocAuc: "0.95",
  },
  {
    model: "Logistic Regression",
    precision: "0.19",
    recall: "0.89",
    f1: "0.31",
    prAuc: "0.72",
    rocAuc: "0.97",
  },
  {
    model: "Random Forest",
    precision: "0.95",
    recall: "0.76",
    f1: "0.84",
    prAuc: "0.86",
    rocAuc: "0.97",
  },
  {
    model: "Adaptive Consensus",
    precision: "-",
    recall: "-",
    f1: "0.85",
    prAuc: "-",
    rocAuc: "-",
  },
];

const INSIGHTS = [
  "Class imbalance is extreme, so F1 and PR-AUC matter more than accuracy.",
  "V14, V10, V4, V17, and V12 show strongest fraud separation and importance.",
  "Isolation Forest is exposed as anomaly score only; final decision is deterministic LR/RF consensus.",
  "Consensus uses threshold-aware confidence margins to resolve LR/RF disagreement.",
];

export default function MLInsights() {
  return (
    <section className="mt-14 space-y-8">
      <div style={{ animation: "blur-fade-in 0.8s ease-out" }}>
        <p className="text-xs tracking-widest text-cyan-400/70 uppercase font-semibold">Dataset Overview</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Training Data & Statistics</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {DATA_FACTS.map((fact, idx) => (
          <div
            key={fact.label}
            className="relative rounded-lg border border-cyan-500/20 bg-gradient-to-br from-[var(--background-secondary)]/80 via-[var(--background)]/60 to-[var(--background)]/40 p-5 backdrop-blur-xl overflow-hidden group"
            style={{ animation: `bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 100}ms both` }}
          >
            <div className="absolute inset-0 rounded-lg" style={{ animation: "glow-border 3s ease-in-out infinite", pointerEvents: "none" }} />
            <div className="relative z-10">
              <p className="text-xs tracking-widest text-gray-500 uppercase font-semibold">{fact.label}</p>
              <p className="mt-3 text-2xl font-bold text-cyan-300">{fact.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative rounded-lg border border-cyan-500/20 bg-gradient-to-br from-[var(--background-secondary)]/80 via-[var(--background)]/60 to-[var(--background)]/40 p-6 backdrop-blur-xl overflow-hidden" style={{ animation: "blur-fade-in 0.8s ease-out 0.2s both" }}>
        <div className="absolute inset-0 rounded-lg" style={{ animation: "glow-border 3s ease-in-out infinite", pointerEvents: "none" }} />
        
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-6">Model Performance Metrics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="px-4 py-3 text-left font-semibold text-cyan-300">Model</th>
                  <th className="px-4 py-3 text-left font-semibold text-cyan-300">Precision</th>
                  <th className="px-4 py-3 text-left font-semibold text-cyan-300">Recall</th>
                  <th className="px-4 py-3 text-left font-semibold text-cyan-300">F1 Score</th>
                  <th className="px-4 py-3 text-left font-semibold text-cyan-300">PR-AUC</th>
                  <th className="px-4 py-3 text-left font-semibold text-cyan-300">ROC-AUC</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_METRICS.map((row, idx) => (
                  <tr
                    key={row.model}
                    className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors duration-300"
                    style={{ animation: `slideInDown 0.5s ease-out ${idx * 60}ms both` }}
                  >
                    <td className="px-4 py-3 font-semibold text-white">{row.model}</td>
                    <td className="px-4 py-3 text-gray-300">{row.precision}</td>
                    <td className="px-4 py-3 text-gray-300">{row.recall}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-300">{row.f1}</td>
                    <td className="px-4 py-3 text-gray-300">{row.prAuc}</td>
                    <td className="px-4 py-3 font-semibold text-cyan-300">{row.rocAuc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-4" style={{ animation: "blur-fade-in 0.8s ease-out 0.3s both" }}>Key Insights</h3>
        <ul className="space-y-3">
          {INSIGHTS.map((item, idx) => (
            <li
              key={item}
              className="relative rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-purple-600/5 px-5 py-4 text-gray-300 backdrop-blur-xl flex items-start gap-3 group overflow-hidden"
              style={{ animation: `slideInDown 0.5s ease-out ${idx * 80}ms both` }}
            >
              <div className="absolute inset-0 rounded-lg" style={{ animation: "glow-border 3s ease-in-out infinite", pointerEvents: "none" }} />
              <span className="relative z-10 text-purple-400 font-bold text-lg mt-0.5">→</span>
              <p className="relative z-10 leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-700">
          Full-size EDA and evaluation plots are available on the dedicated metrics page,
          along with interpretation notes for each plot.
        </p>
        <Link
          href="/metrics"
          className="mt-3 inline-flex items-center rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Open Full Metrics Dashboard
        </Link>
      </div>
    </section>
  );
}
