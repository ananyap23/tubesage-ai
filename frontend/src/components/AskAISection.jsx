import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle, 
  Trash2,
  CornerDownLeft
} from 'lucide-react';
import { askQuestion, getChatHistory } from '../services/api';

const DEFAULT_SUGGESTIONS = [
  "What is the core takeaway or thesis?",
  "What practical steps or recommendations were mentioned?",
  "What was the most important example discussed?",
  "Can you explain the main conclusion?"
];

export default function AskAISection({ summaryId, videoTitle, onSeekTimestamp }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Load chat history when summaryId changes
  useEffect(() => {
    if (summaryId) {
      loadHistory();
    }
  }, [summaryId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const history = await getChatHistory(summaryId);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        setMessages([
          {
            role: 'assistant',
            content: `Hello! I'm your TubeSage AI assistant for **"${videoTitle || 'this video'}"**. Ask me anything about the content, arguments, examples, or specific timestamps mentioned in the transcript.`
          }
        ]);
      }
    } catch (err) {
      console.warn("Could not load chat history:", err);
    }
  };

  const handleSend = async (questionText = null) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    setInput('');
    setError('');

    // Append user message immediately
    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await askQuestion({
        summaryId,
        question: q
      });

      const botMsg = {
        role: 'assistant',
        content: res.answer,
        provider: res.provider
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Ask AI error:", err);
      setError(err.response?.data?.detail || "Failed to get an answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to parse text and render clickable timestamp chips (e.g. [02:45])
  const renderMessageContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[\d{1,2}:\d{2}(?::\d{2})?\])/g);

    return parts.map((part, i) => {
      const match = part.match(/\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/);
      if (match) {
        let seconds = 0;
        if (match[3]) {
          seconds = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
        } else {
          seconds = parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSeekTimestamp && onSeekTimestamp(seconds)}
            className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Click to jump to this video timestamp"
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col h-[600px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Ask AI About This Video</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Transcript Grounded
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Get factual, timestamp-cited answers based strictly on video transcript
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <div 
              key={index} 
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isUser 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-800 border border-slate-700 text-cyan-400'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                isUser 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-line">
                  {renderMessageContent(msg.content)}
                </div>

                {msg.provider && !isUser && (
                  <div className="mt-2 text-[10px] text-slate-500 font-medium">
                    Answered by {msg.provider}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Scanning video transcript and generating answer...</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      {messages.length <= 2 && (
        <div className="mb-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(suggestion)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors text-left cursor-pointer disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Field Form */}
      <div className="relative shrink-0">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 focus-within:border-cyan-500/50 rounded-2xl p-2 pl-4 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this video..."
            disabled={isLoading}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

    </div>
  );
}
