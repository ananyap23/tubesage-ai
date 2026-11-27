import React from 'react';
import { 
  Zap, 
  FileText, 
  Layers, 
  BookOpen, 
  Globe, 
  SlidersHorizontal,
  Check,
  Sparkles
} from 'lucide-react';

const SUMMARY_MODES_INFO = [
  {
    id: "quick",
    name: "Quick Summary",
    icon: Zap,
    badge: "5–7 Bullets",
    description: "High-impact key bullet points covering only the core thesis & critical takeaways.",
    idealFor: "Skimming in 60 seconds"
  },
  {
    id: "short",
    name: "Short Summary",
    icon: FileText,
    badge: "Concise",
    description: "A balanced narrative summary synthesizing all major topics and key principles.",
    idealFor: "2-3 minute comprehensive catchup"
  },
  {
    id: "detailed",
    name: "Detailed Summary",
    icon: Layers,
    badge: "In-Depth",
    description: "Detailed breakdowns of important topics, real-world examples, and step-by-step points.",
    idealFor: "Deep study & note-taking"
  },
  {
    id: "comprehensive",
    name: "Comprehensive Summary",
    icon: BookOpen,
    badge: "Mastery",
    description: "An exhaustive, structured briefing covering virtually all arguments, context, and case studies.",
    idealFor: "Full research & documentation"
  }
];

export default function SummaryOptions({
  selectedMode,
  onSelectMode,
  selectedLanguage,
  onSelectLanguage,
  languages = [],
  disabled = false
}) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-slate-900/70 rounded-3xl border border-slate-800/90 p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Summary Intelligence Settings
              </h2>
              <p className="text-xs text-slate-400">
                Tailor summary depth and choose your preferred output language
              </p>
            </div>
          </div>

          {/* Multilingual Notice */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-xs font-medium">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>AI Translates directly into selected language</span>
          </div>
        </div>

        {/* 1. Summary Length Selector */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>1. Select Summary Length</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {SUMMARY_MODES_INFO.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;

              return (
                <div
                  key={mode.id}
                  onClick={() => !disabled && onSelectMode(mode.id)}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-900/40 via-slate-900 to-slate-900 border-purple-500 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500/30'
                      : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Top line with Icon & Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-purple-400/20 text-purple-300 border border-purple-400/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {mode.badge}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold mb-1.5 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {mode.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>

                  {/* Ideal For Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">{mode.idealFor}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Language Selector */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>2. Preferred Output Language</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Independent of video audio language
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20 font-bold ring-1 ring-cyan-400/30'
                      : 'bg-slate-950/70 hover:bg-slate-800/70 border-slate-800 text-slate-300 hover:text-white'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base leading-none">{lang.flag || '🌐'}</span>
                    <span className="truncate">{lang.name}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
