type Verdict = "fraud" | "legit" | "uncertain";

interface ResultCardProps {
  title: string;
  verdict: Verdict;
  subtitle?: string;
  metricLabel?: string;
  metricValue?: number;
  metricAsPercent?: boolean;
}

const verdictStyles: Record<Verdict, string> = {
  fraud: "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger-ink)]",
  legit: "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success-ink)]",
  uncertain:
    "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning-ink)]",
};

function formatMetric(value: number, metricAsPercent: boolean) {
  if (metricAsPercent) return `${(value * 100).toFixed(2)}%`;
  return value.toFixed(6);
}

export default function ResultCard({
  title,
  verdict,
  subtitle,
  metricLabel,
  metricValue,
  metricAsPercent = false,
}: ResultCardProps) {
  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${verdictStyles[verdict]}`}
    >
      <h3 className="text-sm font-semibold tracking-[0.08em] uppercase">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{verdict.toUpperCase()}</p>
      {subtitle ? <p className="mt-2 text-sm opacity-85">{subtitle}</p> : null}
      {metricLabel && metricValue !== undefined ? (
        <div className="mt-4 rounded-xl bg-white/60 p-3 text-sm">
          <p className="opacity-80">{metricLabel}</p>
          <p className="text-lg font-semibold">
            {formatMetric(metricValue, metricAsPercent)}
          </p>
        </div>
      ) : null}
    </article>
  );
}
