import React from 'react';
import { Sparkles, History, Key, Video, Sun, Moon } from 'lucide-react';

export default function Navbar({ 
  onOpenHistory, 
  onOpenApiKey, 
  historyCount, 
  onNavigate,
  isDarkMode,
  onToggleTheme 
}) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/25 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                TubeSage
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              AI Video Intelligence
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
          <button 
            onClick={() => onNavigate('home')} 
            className="px-4 py-1.5 text-xs font-semibold text-slate-200 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('features')} 
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => onNavigate('about')} 
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            About
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group cursor-pointer"
            title="View Summary History"
          >
            <History className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* API Keys / AI Config Button */}
          <button
            type="button"
            onClick={onOpenApiKey}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group cursor-pointer"
            title="Configure AI API Keys"
          >
            <Key className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

      </div>
    </header>
  );
}
