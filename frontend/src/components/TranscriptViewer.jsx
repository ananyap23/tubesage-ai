import React, { useState } from 'react';
import { FileText, Search, Play, Copy, Check } from 'lucide-react';

export default function TranscriptViewer({ segments = [], onSeekTimestamp, rawText }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredSegments = segments.filter(seg => 
    seg.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyTranscript = () => {
    const full = rawText || segments.map(s => `[${s.timestamp}] ${s.text}`).join('\n');
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col h-[600px]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Verified Video Transcript
            </h3>
            <p className="text-xs text-slate-400">
              {segments.length} synchronized caption segments extracted from video
            </p>
          </div>
        </div>

        {/* Search Bar & Copy */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter transcript..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 w-44"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            title="Copy entire transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Segments Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {filteredSegments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No matching transcript segments found.
          </div>
        ) : (
          filteredSegments.map((seg, idx) => (
            <div
              key={idx}
              onClick={() => onSeekTimestamp && onSeekTimestamp(seg.start)}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/40 hover:border-purple-500/30 transition-all cursor-pointer group"
            >
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-purple-300 group-hover:bg-purple-600 group-hover:text-white text-[11px] font-mono font-bold shrink-0 transition-colors"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>{seg.timestamp}</span>
              </button>
              <p className="text-xs sm:text-sm text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                {seg.text}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
