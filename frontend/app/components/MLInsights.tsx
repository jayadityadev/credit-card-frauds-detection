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
    <section className="mt-10 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_12px_45px_rgba(23,29,42,0.1)] backdrop-blur-sm">
      <p className="text-xs tracking-[0.2em] text-slate-600 uppercase">ML Insights</p>
      <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">What The Notebooks Established</h2>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {DATA_FACTS.map((fact) => (
          <div key={fact.label} className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-xs tracking-[0.08em] text-slate-600 uppercase">{fact.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{fact.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Model</th>
              <th className="px-3 py-2 text-left font-semibold">Precision</th>
              <th className="px-3 py-2 text-left font-semibold">Recall</th>
              <th className="px-3 py-2 text-left font-semibold">F1</th>
              <th className="px-3 py-2 text-left font-semibold">PR-AUC</th>
              <th className="px-3 py-2 text-left font-semibold">ROC-AUC</th>
            </tr>
          </thead>
          <tbody>
            {MODEL_METRICS.map((row) => (
              <tr key={row.model} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{row.model}</td>
                <td className="px-3 py-2">{row.precision}</td>
                <td className="px-3 py-2">{row.recall}</td>
                <td className="px-3 py-2">{row.f1}</td>
                <td className="px-3 py-2">{row.prAuc}</td>
                <td className="px-3 py-2">{row.rocAuc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 space-y-2 text-sm text-slate-800">
        {INSIGHTS.map((item) => (
          <li key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            {item}
          </li>
        ))}
      </ul>

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
