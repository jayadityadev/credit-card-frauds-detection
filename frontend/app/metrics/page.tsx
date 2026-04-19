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
    <div className="relative min-h-screen overflow-hidden px-4 py-10 md:px-8 bg-[var(--background)]">
      <main className="relative mx-auto max-w-7xl z-10">
        <header className="mb-10 group">
          <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[var(--background-secondary)]/80 via-[var(--background)]/60 to-[var(--background)]/40 p-8 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl" style={{ animation: "glow-border 3s ease-in-out infinite", pointerEvents: "none" }} />
            
            <div className="relative z-10">
              <p className="text-xs tracking-widest text-cyan-400/70 uppercase font-semibold" style={{ animation: "blur-fade-in 0.8s ease-out" }}>Analysis & Visualization</p>
              <h1 className="mt-3 text-5xl font-bold tracking-tight text-white" style={{ animation: "blur-fade-in 0.8s ease-out 0.1s both" }}>
                Model Metrics & Plot Analysis
              </h1>
              <p className="mt-4 max-w-3xl text-base text-gray-400 leading-relaxed" style={{ animation: "blur-fade-in 0.8s ease-out 0.2s both" }}>
                Comprehensive visualizations and interpretations from the training pipeline. Each plot presents critical insights into model behavior, feature importance, and performance characteristics.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4" style={{ animation: "blur-fade-in 0.8s ease-out 0.3s both" }}>
                <Link
                  href="/"
                  className="relative rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 px-6 py-3 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2 group/btn overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="h-4 w-4 group-hover/btn:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Console
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn:opacity-20" style={{ animation: "shimmer 2s infinite" }} />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-8">
          {PLOTS.map((plot, idx) => (
            <article
              key={plot.src}
              className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[var(--background-secondary)]/80 via-[var(--background)]/60 to-[var(--background)]/40 p-6 md:p-8 backdrop-blur-xl overflow-hidden group"
              style={{ animation: `blur-fade-in 0.8s ease-out ${0.4 + idx * 0.1}s both` }}
            >
              <div className="absolute inset-0 rounded-2xl" style={{ animation: "glow-border 3s ease-in-out infinite", pointerEvents: "none" }} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                        {idx + 1}
                      </div>
                      <h2 className="text-2xl font-bold text-white">{plot.title}</h2>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-cyan-500/20 bg-[var(--background-secondary)]/50 p-5 mb-6 backdrop-blur">
                  <p className="flex items-start gap-3 text-gray-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold text-lg mt-0.5">→</span>
                    <span>
                      <span className="font-semibold text-cyan-300">Key Insight: </span>
                      {plot.inference}
                    </span>
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-cyan-500/20 bg-[var(--background-secondary)]/30 backdrop-blur p-4">
                  <Image
                    src={plot.src}
                    alt={plot.title}
                    width={1600}
                    height={1000}
                    className="h-auto w-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
                    priority={plot.src === "/ml/class_distribution.png"}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-16 text-center" style={{ animation: "blur-fade-in 0.8s ease-out 1.5s both" }}>
          <p className="text-gray-500 text-sm">
            All visualizations generated from training notebook pipeline • Metrics computed on test set
          </p>
        </footer>
      </main>
    </div>
  );
}
