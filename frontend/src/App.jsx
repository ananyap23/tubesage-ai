import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroInput from './components/HeroInput';
import SummaryOptions from './components/SummaryOptions';
import VideoPreview from './components/VideoPreview';
import SummaryDisplay from './components/SummaryDisplay';
import TimestampsList from './components/TimestampsList';
import AskAISection from './components/AskAISection';
import TranscriptViewer from './components/TranscriptViewer';
import HistoryModal from './components/HistoryModal';
import ApiKeyModal from './components/ApiKeyModal';
import LoadingSkeleton from './components/LoadingSkeleton';
import Toast from './components/Toast';
import Footer from './components/Footer';

import { 
  getLanguages, 
  generateSummary, 
  getHistory, 
  getVideoInfo 
} from './services/api';

import { 
  Sparkles, 
  FileText, 
  Clock, 
  MessageSquare, 
  FileCode, 
  Layers, 
  Zap, 
  Globe, 
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [selectedMode, setSelectedMode] = useState('short');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languages, setLanguages] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'timestamps' | 'ask' | 'transcript'
  const [seekSeconds, setSeekSeconds] = useState(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('tubesage_theme');
    return saved !== 'light';
  });

  // Sync theme with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('tubesage_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('tubesage_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Load languages and initial history count on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const langs = await getLanguages();
      setLanguages(langs || []);
    } catch (err) {
      console.warn("Could not fetch languages, using defaults:", err);
      setLanguages([
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "hi", name: "Hindi", flag: "🇮🇳" },
        { code: "es", name: "Spanish", flag: "🇪🇸" },
        { code: "fr", name: "French", flag: "🇫🇷" },
        { code: "de", name: "German", flag: "🇩🇪" },
        { code: "ja", name: "Japanese", flag: "🇯🇵" },
        { code: "zh", name: "Chinese", flag: "🇨🇳" },
        { code: "ar", name: "Arabic", flag: "🇸🇦" },
        { code: "pt", name: "Portuguese", flag: "🇧🇷" },
      ]);
    }

    try {
      const historyItems = await getHistory(50);
      setHistoryCount(historyItems?.length || 0);
    } catch (err) {
      console.warn("Could not fetch history count:", err);
    }
  };

  const handleGenerateSummary = async (forceRegenerate = false) => {
    if (!url.trim()) {
      setError("Please enter or paste a valid YouTube video URL.");
      return;
    }

    setError('');
    setIsLoading(true);
    setLoadingStep(1);

    // Multi-stage loader steps
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 2600);

    try {
      const res = await generateSummary({
        url: url.trim(),
        mode: selectedMode,
        language: selectedLanguage,
        forceRegenerate
      });

      setLoadingStep(4);
      setSummary(res);
      setActiveTab('summary');
      setHistoryCount(prev => prev + 1);

      showToast(
        forceRegenerate 
          ? "Summary regenerated successfully!" 
          : "Summary generated successfully!",
        "success"
      );

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);

    } catch (err) {
      console.error("Summary generation error:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to generate summary. Please check your YouTube link.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStep(1);
    }
  };

  const handleSeekTimestamp = (seconds) => {
    setSeekSeconds(seconds);
    document.getElementById('video-preview-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectFromHistory = (selectedItem) => {
    setSummary(selectedItem);
    setUrl(selectedItem.url || '');
    if (selectedItem.mode) setSelectedMode(selectedItem.mode);
    if (selectedItem.language) setSelectedLanguage(selectedItem.language);
    setActiveTab('summary');
    showToast(`Loaded summary for: ${selectedItem.title}`, "info");
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNavigate = (view) => {
    if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'features') {
      document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (view === 'about') {
      document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white transition-colors duration-300">
      
      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Top Navbar */}
      <Navbar 
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        historyCount={historyCount}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1">
        {/* Hero & URL Input */}
        <HeroInput 
          url={url}
          setUrl={setUrl}
          onSubmit={() => handleGenerateSummary(false)}
          isLoading={isLoading}
          error={error}
          onClearError={() => setError('')}
        />

        {/* Summary Settings: Length & Language */}
        <SummaryOptions 
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          languages={languages}
          disabled={isLoading}
        />

        {/* Loading Skeletons State */}
        {isLoading && (
          <LoadingSkeleton step={loadingStep} />
        )}

        {/* Results Section */}
        {summary && !isLoading && (
          <section id="results-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
            
            <div id="video-preview-anchor">
              <VideoPreview 
                summary={summary}
                currentTimestampSeconds={seekSeconds}
                onResetTimestamp={() => setSeekSeconds(null)}
              />
            </div>

            {/* Navigation Tabs for Results */}
            <div className="flex flex-wrap items-center gap-2 mb-6 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-lg">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Executive Summary</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('timestamps')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'timestamps'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Key Timestamps ({summary.timestamps?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ask')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'ask'
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-cyan-300" />
                <span>Ask AI About This Video</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transcript')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'transcript'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Captions & Transcript</span>
              </button>
            </div>

            {/* Tab Panels */}
            {activeTab === 'summary' && (
              <SummaryDisplay 
                summary={summary}
                onRegenerate={() => handleGenerateSummary(true)}
                isRegenerating={isLoading}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'timestamps' && (
              <TimestampsList 
                timestamps={summary.timestamps || []}
                onSeekTimestamp={handleSeekTimestamp}
                videoUrl={summary.url}
              />
            )}

            {activeTab === 'ask' && (
              <AskAISection 
                summaryId={summary.id}
                videoTitle={summary.title}
                onSeekTimestamp={handleSeekTimestamp}
              />
            )}

            {activeTab === 'transcript' && (
              <TranscriptViewer 
                segments={summary.transcript_segments || []}
                onSeekTimestamp={handleSeekTimestamp}
                rawText={summary.raw_transcript_preview}
              />
            )}

          </section>
        )}

        {/* Feature Highlights Section */}
        <section id="features-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Engineered for Maximum Retention
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              TubeSage AI extracts signal from noise, giving you mastery of 1-hour lectures, podcasts, or tutorials in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                4 Adaptive Summary Tiers
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                From 5-bullet ultra-fast overviews to exhaustive academic research breakdowns, choose the exact depth you need.
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Independent Multilingual Output
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Watch in English, synthesize in Hindi, Spanish, French, or Japanese. TubeSage AI translates concepts naturally into your preferred native tongue.
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Interactive Transcript Q&A
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Have follow-up questions? Ask AI directly. Receive grounded responses citing exact timestamps without having to re-watch the video.
              </p>
            </div>

          </div>
        </section>

        {/* About Section */}
        <section id="about-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-purple-950/20 via-slate-900/80 to-cyan-950/20 border border-slate-800 shadow-2xl">
            <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-4">
              How TubeSage AI Guarantees 100% Accuracy
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              Unlike generic tools that guess from video titles or descriptions, TubeSage AI extracts true closed-captions and time-synchronized transcripts. If a video lacks captions, TubeSage AI honestly informs you rather than hallucinating summary points.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-purple-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Zero Hallucination
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Timestamp Grounded
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Native & LLM Support
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSummary={handleSelectFromHistory}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}
