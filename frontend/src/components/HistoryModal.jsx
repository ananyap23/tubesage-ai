import React, { useState, useEffect } from 'react';
import { 
  History, 
  X, 
  Trash2, 
  Search, 
  Play, 
  Clock, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { getHistory, deleteHistoryItem, getHistoryItem } from '../services/api';

export default function HistoryModal({ isOpen, onClose, onSelectSummary }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory(50);
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this summary from your history?")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteHistoryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleItemClick = async (item) => {
    try {
      const fullSummary = await getHistoryItem(item.id);
      onSelectSummary(fullSummary);
      onClose();
    } catch (err) {
      console.error("Failed to load full summary:", err);
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter(item => 
    (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.channel || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Summary History
              </h3>
              <p className="text-xs text-slate-400">
                Your past video summaries and generated insights
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search past video summaries by title or channel..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-xs">Loading summary history...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {search ? 'No summaries matching your search.' : 'No summaries saved in history yet. Generate one to see it here!'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-purple-500/30 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                {/* Thumbnail */}
                <div className="relative w-20 sm:w-24 aspect-video rounded-xl overflow-hidden shrink-0 border border-slate-800">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.channel}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                    <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {item.mode}
                    </span>
                    <span className="uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {item.language}
                    </span>
                    {item.created_at && (
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Delete summary"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
