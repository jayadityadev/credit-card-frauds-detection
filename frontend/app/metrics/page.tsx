import Image from "next/image";
import Link from "next/link";

const PLOTS = [
  {
    title: "Class Distribution",
    src: "/ml/class_distribution.png",
    inference:
      "The fraud class is extremely rare (~0.17%), so accuracy alone is misleading. Precision, recall, F1, and PR-AUC are the meaningful metrics.",
  },
  {
    title: "Amount Boxplot",
    src: "/ml/amount_boxplot.png",
    inference:
      "Amount has heavy outliers and asymmetric spread across classes. This supports RobustScaler over StandardScaler.",
  },
  {
    title: "Correlation Heatmap",
    src: "/ml/correlation_heatmap.png",
    inference:
      "Features like V14, V4, V12, V10, and V17 show strong association with fraud and help guide interpretation.",
  },
  {
    title: "KDE Feature Overlays",
    src: "/ml/kde_features.png",
    inference:
      "Fraud vs legit distributions separate clearly for V14, V17, V12, and V10, while Amount overlaps more than expected.",
  },
  {
    title: "Confusion Matrices",
    src: "/ml/confusion_matrices.png",
    inference:
      "Random Forest offers the best precision-recall tradeoff among single classifiers; Logistic Regression captures more fraud but increases false positives.",
  },
  {
    title: "ROC and PR Curves",
    src: "/ml/roc_pr_curves.png",
    inference:
      "ROC is high for multiple models, but PR separates quality better under imbalance. Random Forest leads on PR-AUC.",
  },
  {
    title: "Random Forest Feature Importance",
    src: "/ml/feature_importance.png",
    inference:
      "V14 dominates feature importance, followed by V10, V4, V17, and V12, aligning with EDA findings.",
  },
] as const;

export default function MetricsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(15,148,136,0.14),transparent_30%),radial-gradient(circle_at_90%_12%,rgba(227,113,50,0.16),transparent_28%)]" />
      <main className="relative mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_12px_45px_rgba(23,29,42,0.1)] backdrop-blur-sm">
          <p className="text-xs tracking-[0.2em] text-slate-600 uppercase">Phase 7 Metrics View</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
            Full ML Metrics and Plot Interpretations
          </h1>
          <p className="mt-3 text-sm text-slate-700 md:text-base">
            This page presents notebook-generated visuals in presentation-friendly size.
            Each plot includes the key takeaway to mention during demo or viva.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Back to Prediction Console
          </Link>
        </header>

        <section className="space-y-6">
          {PLOTS.map((plot) => (
            <article
              key={plot.src}
              className="rounded-3xl border border-black/10 bg-white/80 p-4 shadow-[0_10px_35px_rgba(23,29,42,0.08)] backdrop-blur-sm md:p-6"
            >
              <h2 className="text-xl font-bold text-[var(--ink)]">{plot.title}</h2>
              <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 md:text-base">
                <span className="font-semibold">What to infer: </span>
                {plot.inference}
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <Image
                  src={plot.src}
                  alt={plot.title}
                  width={1600}
                  height={1000}
                  className="h-auto w-full object-contain"
                  priority={plot.src === "/ml/class_distribution.png"}
                />
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
