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
    <div className="mt-6 rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_10px_40px_rgba(23,29,42,0.08)] backdrop-blur-sm">
      <h3 className="text-sm font-semibold tracking-[0.08em] text-slate-600 uppercase">
        Prediction Pipeline
      </h3>

      <div className="mt-6 flex items-center justify-between gap-2 md:gap-4">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex flex-1 flex-col items-center">
            <div
              className={`relative h-12 w-12 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-300 ${
                idx < activeStep
                  ? "border-teal-600 bg-teal-50 text-teal-700 scale-110"
                  : idx === activeStep
                    ? "border-teal-600 bg-teal-100 text-teal-700 animate-pulse"
                    : "border-slate-300 bg-white text-slate-400"
              }`}
            >
              {idx < activeStep && (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {idx === activeStep && (
                <div className="h-5 w-5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
              )}
              {idx > activeStep && <span>{step.icon}</span>}
            </div>

            <p className="mt-2 text-xs font-medium text-slate-700">{step.label}</p>
            <p className="text-xs text-slate-500">{step.description}</p>

            {idx < steps.length - 1 && (
              <div
                className="absolute h-1 flex-1 bg-slate-200 transition-all duration-300"
                style={{
                  width: "calc(100% + 16px)",
                  left: "50%",
                  top: "24px",
                  backgroundColor: idx < activeStep ? "rgb(13, 148, 136)" : "rgb(203, 213, 225)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        <p className="font-medium">
          {activeStep === 0 && "Initializing prediction pipeline..."}
          {activeStep === 1 && "Parsing and validating input features..."}
          {activeStep === 2 && "Running Isolation Forest, Logistic Regression, and Random Forest models..."}
          {activeStep === 3 && "Computing consensus from all three models..."}
          {activeStep >= 4 && "Prediction complete!"}
        </p>
      </div>
    </div>
  );
}
