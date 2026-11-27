import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  FileDown, 
  RefreshCw, 
  Sparkles, 
  ListOrdered, 
  Lightbulb, 
  Target, 
  CheckCircle2, 
  BookMarked, 
  Quote, 
  Tag, 
  FileText
} from 'lucide-react';
import { copySummaryToClipboard, downloadSummaryAsTxt, downloadSummaryAsPdf } from '../utils/exportUtils';

export default function SummaryDisplay({ 
  summary, 
  onRegenerate, 
  isRegenerating = false,
  onShowToast
}) {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const handleCopy = async () => {
    await copySummaryToClipboard(summary);
    setCopied(true);
    if (onShowToast) {
      onShowToast("Summary copied to clipboard successfully!", "success");
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    downloadSummaryAsTxt(summary);
    if (onShowToast) {
      onShowToast("Plain text summary (.txt) downloaded!", "success");
    }
  };

  const handleDownloadPdf = () => {
    downloadSummaryAsPdf(summary);
    if (onShowToast) {
      onShowToast("Professional PDF report downloaded!", "success");
    }
  };

  return (
    <div className="w-full">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl mb-6 shadow-xl">
        
        {/* Left: Summary Title / Mode indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Smart Executive Summary</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize font-semibold">
                {summary.mode} Mode
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-semibold">
                {summary.language}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Synthesized from {summary.transcript_segment_count || '100+'} verified caption segments
            </p>
          </div>
        </div>

        {/* Right: Export & Regenerate Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
            title="Copy formatted summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download TXT */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
            title="Download plain text file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>TXT</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
            title="Download formatted PDF report"
          >
            <FileDown className="w-3.5 h-3.5 text-purple-400" />
            <span>Download PDF</span>
          </button>

          {/* Regenerate Button */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-200 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            title="Re-run summary with current settings"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="space-y-6">

        {/* 1. Video Overview Box */}
        {summary.overview && (
          <div className="relative rounded-3xl p-6 md:p-7 bg-gradient-to-r from-purple-950/30 via-slate-900/90 to-indigo-950/25 border border-purple-500/25 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <Quote className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                  Video Overview & Executive Summary
                </h4>
                <p className="text-sm md:text-base text-slate-100 leading-relaxed font-medium">
                  {summary.overview}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Main Narrative Summary */}
        {summary.main_summary && (
          <div className="rounded-3xl p-6 md:p-8 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Main Summary
              </h3>
            </div>
            
            <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
              {summary.main_summary}
            </div>
          </div>
        )}

        {/* 3. Key Takeaways */}
        {summary.key_takeaways && summary.key_takeaways.length > 0 && (
          <div className="rounded-3xl p-6 md:p-8 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <ListOrdered className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Key Takeaways
                </h3>
              </div>
              <span className="text-xs text-slate-300 font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                {summary.key_takeaways.length} Key Points
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {summary.key_takeaways.map((takeaway, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 transition-colors shadow-sm"
                >
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed font-medium flex-1">
                    {takeaway}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Important Concepts & Topics */}
        {summary.important_concepts && summary.important_concepts.length > 0 && (
          <div className="rounded-3xl p-6 md:p-8 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Lightbulb className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Important Concepts & Topics
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.important_concepts.map((conceptItem, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <h4 className="text-sm font-bold text-white">
                        {conceptItem.concept}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {conceptItem.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Important Examples & Case Studies */}
        {summary.important_examples && summary.important_examples.length > 0 && (
          <div className="rounded-3xl p-6 md:p-8 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <BookMarked className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Demonstrated Examples & Case Scenarios
              </h3>
            </div>

            <div className="space-y-3">
              {summary.important_examples.map((example, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 shadow-sm"
                >
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                    Example #{idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Actionable Insights */}
        {summary.actionable_insights && summary.actionable_insights.length > 0 && (
          <div className="rounded-3xl p-6 md:p-8 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Target className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Actionable Insights & Recommendations
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {summary.actionable_insights.map((insight, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-sm"
                >
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium mb-3">
                    {insight}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Action Item #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Conclusion */}
        {summary.conclusion && (
          <div className="rounded-3xl p-6 md:p-7 bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Conclusion & Final Takeaway
            </h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
              {summary.conclusion}
            </p>
          </div>
        )}

        {/* 8. Keywords Tags Cloud */}
        {summary.keywords && summary.keywords.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-2">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <span>Keywords:</span>
            </div>
            {summary.keywords.map((kw, idx) => (
              <span 
                key={idx}
                className="px-3.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-300 hover:border-purple-500/40 transition-colors shadow-sm"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
