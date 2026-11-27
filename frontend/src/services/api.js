import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject API keys stored in localStorage
api.interceptors.request.use((config) => {
  const geminiKey = localStorage.getItem('tubesage_gemini_key');
  const openaiKey = localStorage.getItem('tubesage_openai_key');

  if (geminiKey) {
    config.headers['x-gemini-api-key'] = geminiKey;
  }
  if (openaiKey) {
    config.headers['x-openai-api-key'] = openaiKey;
  }

  return config;
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getLanguages = async () => {
  const res = await api.get('/languages');
  return res.data.languages;
};

export const getModes = async () => {
  const res = await api.get('/modes');
  return res.data.modes;
};

export const getVideoInfo = async (url) => {
  const res = await api.post('/video-info', { url });
  return res.data;
};

export const generateSummary = async ({ url, mode, language, forceRegenerate = false }) => {
  const res = await api.post('/summarize', {
    url,
    mode,
    language,
    force_regenerate: forceRegenerate,
  });
  return res.data;
};

export const askQuestion = async ({ summaryId, question }) => {
  const res = await api.post('/ask', {
    summary_id: summaryId,
    question,
  });
  return res.data;
};

export const getChatHistory = async (summaryId) => {
  const res = await api.get(`/chat-history/${summaryId}`);
  return res.data.history;
};

export const getHistory = async (limit = 30) => {
  const res = await api.get(`/history?limit=${limit}`);
  return res.data.items;
};

export const getHistoryItem = async (summaryId) => {
  const res = await api.get(`/history/${summaryId}`);
  return res.data;
};

export const deleteHistoryItem = async (summaryId) => {
  const res = await api.delete(`/history/${summaryId}`);
  return res.data;
};

export default api;
