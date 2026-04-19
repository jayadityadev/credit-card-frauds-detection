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

const verdictStyles: Record<Verdict, { border: string; bg: string; glow: string; text: string; icon: string }> = {
  fraud: {
    border: "border-red-500/30",
    bg: "from-red-500/10 to-red-600/5",
    glow: "glow-border-danger",
    text: "text-red-300",
    icon: "🚨",
  },
  legit: {
    border: "border-emerald-500/30",
    bg: "from-emerald-500/10 to-emerald-600/5",
    glow: "glow-border-success",
    text: "text-emerald-300",
    icon: "✓",
  },
  uncertain: {
    border: "border-amber-500/30",
    bg: "from-amber-500/10 to-amber-600/5",
    glow: "glow-border-warning",
    text: "text-amber-300",
    icon: "⚠",
  },
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
  const styles = verdictStyles[verdict];

  return (
    <article
      className={`relative rounded-xl border backdrop-blur-md transition-all duration-300 hover:shadow-2xl overflow-hidden group cursor-pointer ${styles.border}`}
      style={{
        background: `linear-gradient(135deg, var(--background-secondary)/80, rgba(0,0,0,0.2))`,
        animation: `bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 120}ms both`,
      }}
    >
      <div className="absolute inset-0" style={{ animation: `${styles.glow} 3s ease-in-out infinite`, pointerEvents: "none" }} />
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs tracking-widest text-gray-500 uppercase font-semibold">{title}</p>
          <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{styles.icon}</span>
        </div>

        <p
          className={`text-4xl font-black bg-gradient-to-r ${styles.bg} bg-clip-text text-transparent`}
          style={{
            animation: `flip-in 0.6s ease-out ${index * 120 + 200}ms both`,
            WebkitBackgroundClip: "text",
          }}
        >
          {verdict.toUpperCase()}
        </p>

        {subtitle ? (
          <p
            className="mt-3 text-sm text-gray-400 leading-relaxed"
            style={{
              animation: `slideInDown 0.6s ease-out ${index * 120 + 250}ms both`,
            }}
          >
            {subtitle}
          </p>
        ) : null}

        {metricLabel && metricValue !== undefined ? (
          <div
            className={`mt-6 rounded-lg border ${styles.border} bg-gradient-to-br ${styles.bg} p-4 overflow-hidden relative group/metric`}
            style={{
              animation: `slideInUp 0.6s ease-out ${index * 120 + 300}ms both`,
            }}
          >
            <p className="text-xs tracking-widest text-gray-500 uppercase font-semibold">{metricLabel}</p>
            <p
              className={`text-3xl font-mono font-bold mt-2 ${styles.text}`}
              style={{
                animation: `cyber-flicker 2s ease-in-out ${index * 120 + 400}ms infinite`,
              }}
            >
              {formatMetric(metricValue, metricAsPercent)}
            </p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 group-hover/metric:scale-150 transition-transform duration-500" />
          </div>
        ) : null}
      </div>
    </article>
  );
}
