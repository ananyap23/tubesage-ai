import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSkeleton({ step = 1 }) {
  const steps = [
    { title: "Verifying YouTube Video Link", desc: "Checking URL format & video availability" },
    { title: "Retrieving Video Captions", desc: "Extracting verified timed transcript segments" },
    { title: "Processing AI Language Modeling", desc: "Synthesizing arguments, core themes & takeaways" },
    { title: "Structuring Final Dashboard", desc: "Formatting chapters, concepts, and actionable insights" }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 animate-fade-in">
      
      {/* SaaS Progress Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-2xl shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>TubeSage AI is Generating Your Summary</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Step {step} of 4
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {steps[step - 1]?.title || "Processing..."}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Please wait a few moments...
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden mb-6 p-0.5 border border-slate-700/50">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-700 ease-out shadow-sm shadow-purple-500/50"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((s, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;

            return (
              <div 
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrent 
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 shadow-md' 
                    : isDone
                      ? 'bg-slate-950/40 border-slate-800 text-slate-300'
                      : 'bg-slate-950/20 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent ? 'bg-purple-500 text-white' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isDone ? '✓' : stepNum}
                  </span>
                  <span className="text-xs font-semibold truncate">{s.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate pl-7">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skeleton Dashboard Mockup */}
      <div className="space-y-6">
        
        {/* Skeleton Video Preview Card */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-96 aspect-video rounded-2xl skeleton-shimmer bg-slate-800/50 shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <div className="h-4 w-28 rounded-lg skeleton-shimmer bg-slate-800/50" />
            <div className="h-6 w-3/4 rounded-lg skeleton-shimmer bg-slate-800/50" />
            <div className="h-4 w-40 rounded-lg skeleton-shimmer bg-slate-800/50" />
            <div className="pt-4 flex gap-2">
              <div className="h-8 w-32 rounded-xl skeleton-shimmer bg-slate-800/50" />
              <div className="h-8 w-28 rounded-xl skeleton-shimmer bg-slate-800/50" />
            </div>
          </div>
        </div>

        {/* Skeleton Overview Box */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="h-4 w-36 rounded skeleton-shimmer bg-slate-800/50" />
          <div className="h-4 w-full rounded skeleton-shimmer bg-slate-800/50" />
          <div className="h-4 w-5/6 rounded skeleton-shimmer bg-slate-800/50" />
        </div>

        {/* Skeleton Takeaways Grid */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="h-5 w-44 rounded skeleton-shimmer bg-slate-800/50 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/40">
              <div className="w-6 h-6 rounded-lg skeleton-shimmer bg-slate-800/50 shrink-0" />
              <div className="h-4 w-full rounded skeleton-shimmer bg-slate-800/50" />
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
