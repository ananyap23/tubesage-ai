import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  ExternalLink, 
  Clock, 
  User, 
  Tv, 
  Sparkles, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export default function VideoPreview({ summary, currentTimestampSeconds, onResetTimestamp }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const iframeRef = useRef(null);

  // If a timestamp is clicked elsewhere, automatically show player and seek
  useEffect(() => {
    if (currentTimestampSeconds !== null && currentTimestampSeconds !== undefined) {
      setShowPlayer(true);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Send postMessage to YouTube iframe API to seek
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [currentTimestampSeconds, true]
          }),
          '*'
        );
      }
    }
  }, [currentTimestampSeconds]);

  if (!summary) return null;

  const embedUrlWithApi = `${summary.embed_url}&enablejsapi=1&origin=${window.location.origin}`;

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-3xl p-5 md:p-6 backdrop-blur-xl shadow-xl mb-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Side: Thumbnail / Embedded Player */}
        <div className="w-full lg:w-96 shrink-0">
          {!showPlayer ? (
            <div 
              onClick={() => setShowPlayer(true)}
              className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-slate-800 shadow-lg"
            >
              <img 
                src={summary.thumbnail} 
                alt={summary.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                <div className="w-13 h-13 rounded-2xl bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/40 group-hover:scale-110 group-hover:bg-purple-500 transition-all duration-300">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/90 text-slate-200 text-xs font-bold border border-slate-800/80">
                {summary.duration_formatted}
              </div>
            </div>
          ) : (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
              <iframe
                ref={iframeRef}
                src={embedUrlWithApi}
                title={summary.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Right Side: Video Details & Controls */}
        <div className="flex-1 flex flex-col justify-between h-full">
          <div>
            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{summary.provider || 'TubeSage AI'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duration: {summary.duration_formatted}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium capitalize">
                Mode: {summary.mode}
              </span>
            </div>

            {/* Video Title */}
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug mb-2">
              {summary.title}
            </h2>

            {/* Author / Channel */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-300">{summary.channel}</span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowPlayer(!showPlayer)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              <Tv className="w-4 h-4 text-purple-400" />
              <span>{showPlayer ? 'Hide Video Player' : 'Watch Inside TubeSage'}</span>
              {showPlayer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <a
              href={summary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <span>Open on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
