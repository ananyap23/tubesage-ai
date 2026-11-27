import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Clipboard, 
  X, 
  Loader2, 
  AlertCircle, 
  Zap,
  Globe
} from 'lucide-react';

const YouTubeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SAMPLE_VIDEOS = [
  {
    label: "Mindfulness & Breathing",
    url: "https://www.youtube.com/watch?v=inpok4MKVLM",
    tag: "Health"
  },
  {
    label: "Steve Jobs Stanford Speech",
    url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
    tag: "Keynote"
  },
  {
    label: "Veritasium - Math & Physics",
    url: "https://www.youtube.com/watch?v=oxbO_m09s_Q",
    tag: "Science"
  }
];

export default function HeroInput({ 
  url, 
  setUrl, 
  onSubmit, 
  isLoading, 
  error, 
  onClearError 
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        if (error) onClearError();
      }
    } catch (err) {
      console.warn("Clipboard access error:", err);
    }
  };

  const handleClear = () => {
    setUrl('');
    if (error) onClearError();
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    if (error) onClearError();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading && url.trim()) {
      onSubmit();
    }
  };

  return (
    <section className="relative pt-12 pb-14 md:pt-18 md:pb-18 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/15 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-sm shadow-purple-500/10">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Next-Gen Video Intelligence</span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          <span className="text-slate-400">Multi-Tier & Multilingual</span>
        </div>

        {/* Hero Heading as requested */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
          Stop Watching. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Start Understanding.
          </span>
        </h1>

        {/* Hero Subtitle as requested */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal mb-10 leading-relaxed">
          Transform lengthy YouTube videos into intelligent summaries in seconds.
        </p>

        {/* Large Prominent URL Input Bar */}
        <div className="max-w-3xl mx-auto relative mb-6">
          <div 
            className={`relative rounded-3xl p-1.5 transition-all duration-300 bg-gradient-to-r ${
              isFocused 
                ? 'from-purple-500 via-indigo-500 to-cyan-400 shadow-2xl shadow-purple-500/25 ring-2 ring-purple-500/20' 
                : 'from-slate-800/80 via-slate-800 to-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 rounded-[22px] p-2 pl-5 shadow-inner">
              
              {/* YouTube Icon */}
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <YouTubeIcon className="w-5 h-5" />
              </div>

              {/* URL Input */}
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) onClearError();
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Paste any YouTube video link (e.g., https://www.youtube.com/watch?v=...)"
                disabled={isLoading}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none py-2.5 px-1 disabled:opacity-50"
              />

              {/* Action Buttons inside Input */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end">
                {url && !isLoading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-2.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {!url && (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>
                )}

                {/* Primary Submit Button */}
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isLoading || !url.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-indigo-600/30 group cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Summarizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Summary</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Sample Video Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-500">Quick Samples:</span>
          {SAMPLE_VIDEOS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSampleClick(sample.url)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>{sample.label}</span>
              <span className="text-[10px] text-slate-400 px-1.5 py-0.2 bg-slate-800/80 rounded font-medium">
                {sample.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3 text-left shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-200">Unable to generate summary</p>
              <p className="mt-1 text-red-300/90 leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={onClearError}
              className="text-red-400 hover:text-red-200 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
