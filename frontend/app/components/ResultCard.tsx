type Verdict = "fraud" | "legit" | "uncertain";

interface ResultCardProps {
  title: string;
  verdict: Verdict;
  subtitle?: string;
  metricLabel?: string;
  metricValue?: number;
  metricAsPercent?: boolean;
  index?: number;
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
  index = 0,
}: ResultCardProps) {
  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${verdictStyles[verdict]}`}
      style={{
        animation: `scale-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 100}ms both`,
      }}
    >
      <h3 className="text-sm font-semibold tracking-[0.08em] uppercase">{title}</h3>
      <p
        className="mt-2 text-2xl font-bold"
        style={{
          animation: `slideInDown 0.6s ease-out ${index * 100 + 200}ms both`,
        }}
      >
        {verdict.toUpperCase()}
      </p>
      {subtitle ? (
        <p
          className="mt-2 text-sm opacity-85"
          style={{
            animation: `slideInDown 0.6s ease-out ${index * 100 + 250}ms both`,
          }}
        >
          {subtitle}
        </p>
      ) : null}
      {metricLabel && metricValue !== undefined ? (
        <div
          className="mt-4 rounded-xl bg-white/60 p-3 text-sm overflow-hidden relative"
          style={{
            animation: `slideInUp 0.6s ease-out ${index * 100 + 300}ms both`,
          }}
        >
          <p className="opacity-80">{metricLabel}</p>
          <p
            className="text-lg font-semibold mt-1"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              backgroundSize: "200% 100%",
              backgroundPosition: "200% 0",
              animation: `shimmer 2s infinite ${index * 100 + 400}ms`,
              WebkitBackgroundClip: "text",
            }}
          >
            {formatMetric(metricValue, metricAsPercent)}
          </p>
        </div>
      ) : null}
    </article>
  );
}
