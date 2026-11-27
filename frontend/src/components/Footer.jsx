import React from 'react';
import { Video, Heart, Sparkles, Globe, Cpu, ShieldCheck } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-24 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Col 1: Brand & Mission */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-lg font-extrabold text-white">
              TubeSage <span className="text-purple-400">AI</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-4">
            TubeSage AI is an intelligent YouTube video summarization and conversational platform. Turn long videos into actionable knowledge, timestamped key chapters, and multilingual takeaways in seconds.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Multi-tier Summarization</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>18+ Languages</span>
            </span>
          </div>
        </div>

        {/* Col 2: Core Capabilities */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
            Capabilities
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>Quick 5-7 Bullet Extraction</li>
            <li>In-Depth Detailed Analysis</li>
            <li>Interactive YouTube Player Seeking</li>
            <li>Transcript Grounded Q&A</li>
            <li>Export to PDF & TXT</li>
          </ul>
        </div>

        {/* Col 3: Architecture & Privacy */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
            Architecture
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>React 19 & Vite 8</li>
            <li>FastAPI & Python 3.13</li>
            <li>MongoDB & SQLite Hybrid</li>
            <li>Google Gemini AI & OpenAI</li>
            <li>Verified Subtitle Parser</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} TubeSage AI. Built with precision for modern creators, learners, and researchers.
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side API Key Storage</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
