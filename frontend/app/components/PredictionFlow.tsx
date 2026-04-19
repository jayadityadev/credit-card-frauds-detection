"use client";

import { useEffect, useState } from "react";

interface PredictionFlowProps {
  isLoading: boolean;
}

export default function PredictionFlow({ isLoading }: PredictionFlowProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setActiveStep(0);
      return;
    }

    const steps = [
      { delay: 200, label: "Loading Data" },
      { delay: 800, label: "Feature Engineering" },
      { delay: 1400, label: "Model Processing" },
      { delay: 2000, label: "Consensus" },
    ];

    const timers = steps.map((step, idx) =>
      setTimeout(() => setActiveStep(idx + 1), step.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  if (!isLoading) return null;

  const steps = [
    { icon: "📥", label: "Loading", description: "Parsing input data" },
    { icon: "⚙", label: "Engineering", description: "Processing features" },
    { icon: "🤖", label: "Models", description: "Running predictions" },
    { icon: "✓", label: "Consensus", description: "Final verdict" },
  ];

  return (
    <div className="mt-10" style={{ animation: "blur-fade-in 0.8s ease-out 0.1s both" }}>
      <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[var(--background-secondary)]/80 via-[var(--background)]/60 to-[var(--background)]/40 p-8 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 rounded-2xl" style={{ animation: "glow-border 3s ease-in-out infinite", pointerEvents: "none" }} />
        
        <div className="relative z-10">
          <p className="text-xs tracking-widest text-cyan-400/70 uppercase font-semibold">Processing Pipeline</p>
          <h3 className="mt-1 text-xl font-bold text-white">Real-Time Prediction Flow</h3>

          <div className="mt-8 flex items-center justify-between gap-2 md:gap-4">
            {steps.map((step, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;
              const isPending = idx > activeStep;

              return (
                <div key={step.label} className="flex flex-1 flex-col items-center relative">
                  <div className="relative w-full flex justify-center">
                    <div
                      className="relative h-16 w-16 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-500 overflow-hidden"
                      style={{
                        borderColor: isCompleted
                          ? "rgb(16, 185, 129)"
                          : isActive
                            ? "rgb(6, 182, 212)"
                            : "rgba(139, 92, 246, 0.2)",
                        backgroundColor: isCompleted
                          ? "rgba(16, 185, 129, 0.1)"
                          : isActive
                            ? "rgba(6, 182, 212, 0.1)"
                            : "rgba(139, 92, 246, 0.05)",
                        animation: isActive ? "pulse-glow 1.5s ease-in-out infinite" : "none",
                      }}
                    >
                      {isCompleted && (
                        <svg
                          className="h-8 w-8 text-emerald-400"
                          style={{ animation: "bounce-in 0.5s ease-out" }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {isActive && (
                        <div
                          className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent"
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      )}
                      {isPending && <span>{step.icon}</span>}
                    </div>

                    {idx < steps.length - 1 && (
                      <div
                        className="absolute top-8 h-1 transition-all duration-500"
                        style={{
                          width: "calc(100% + 32px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: isCompleted
                            ? "rgb(16, 185, 129)"
                            : isActive
                              ? "rgb(6, 182, 212)"
                              : "rgba(139, 92, 246, 0.2)",
                        }}
                      />
                    )}
                  </div>

                  <p
                    className="mt-4 text-sm font-semibold text-white text-center"
                    style={{
                      color: isActive ? "rgb(34, 211, 238)" : isCompleted ? "rgb(16, 185, 129)" : "rgb(156, 163, 175)",
                    }}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 text-center">{step.description}</p>
                </div>
              );
            })}
          </div>

          <div
            className="mt-8 rounded-lg border border-cyan-500/20 bg-[var(--background-secondary)]/50 p-5 text-sm text-cyan-300 overflow-hidden relative"
            style={{ animation: "blur-fade-in 0.6s ease-out 0.3s both" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <p className="font-semibold flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
              {activeStep === 0 && "Initializing prediction pipeline..."}
              {activeStep === 1 && "Parsing and validating input features..."}
              {activeStep === 2 && "Running 3 ensemble models simultaneously..."}
              {activeStep === 3 && "Computing consensus from all models..."}
              {activeStep >= 4 && "Prediction complete! ✓"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
