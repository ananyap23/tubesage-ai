import React from 'react';
import { Clock, Play, ExternalLink, Sparkles } from 'lucide-react';

export default function TimestampsList({ timestamps = [], onSeekTimestamp, videoUrl }) {
  if (!timestamps || timestamps.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
        <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm">No specific chapter timestamps detected for this video.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Key Timestamps & Video Chapters
            </h3>
            <p className="text-xs text-slate-400">
              Click any timestamp to jump directly to that point in the video
            </p>
          </div>
        </div>
        <span className="text-xs text-purple-300 font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
          {timestamps.length} Chapters
        </span>
      </div>

      <div className="space-y-3">
        {timestamps.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSeekTimestamp(item.seconds)}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-start sm:items-center gap-3">
              {/* Clickable Timestamp Chip */}
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-all text-xs font-mono font-bold shrink-0 shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{item.time}</span>
              </button>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h4>
                {item.summary && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {item.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Seek indicator */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 group-hover:text-purple-400 self-end sm:self-auto transition-colors">
              <span>Jump to chapter</span>
              <Play className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
