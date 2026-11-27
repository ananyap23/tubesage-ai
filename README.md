# TubeSage AI – Smart YouTube Video Summarizer 🧠📹

[![Version](https://img.shields.io/badge/version-1.0.0-purple.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)

**TubeSage AI** is an intelligent, full-stack YouTube video summarization and conversational intelligence web application. It transforms long YouTube videos into structured, high-yield insights, chronological chapters, and multilingual summaries in seconds.

---

## 🌟 Key Features

### 1. 🎯 Precision YouTube Processing
- Paste any YouTube URL (`youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, or `/embed/`).
- Validates URLs and retrieves video metadata (title, creator, duration, high-resolution thumbnail).
- Extracts closed-captions and time-synchronized transcripts directly from YouTube.
- **Zero Hallucination Guarantee:** If a video has no accessible captions/subtitles, TubeSage AI honestly informs the user rather than fabricating information.

### 2. ⚡ 4 Adaptive Summary Length Modes
| Mode | Badge | Description | Target Use Case |
| :--- | :--- | :--- | :--- |
| **Quick Summary** | `5–7 Bullets` | High-impact bullet points covering only the core thesis & essential metrics. | Skimming in under 60 seconds |
| **Short Summary** | `Concise` | Balanced 2–3 paragraph narrative synthesizing all major topics & highlights. | 2–3 minute catchup |
| **Detailed Summary** | `In-Depth` | Thorough section-by-section breakdown of topics, principles, and real-world examples. | Deep study & notes |
| **Comprehensive Summary** | `Mastery` | Exhaustive architectural briefing covering all arguments, nuances, and methodologies. | Complete research & documentation |

### 3. 🌐 Multilingual Intelligence (Independent of Audio Language)
- Summarize into **18+ languages** regardless of the video's original audio:
  - English, Hindi (हिन्दी), Spanish (Español), French (Français), German (Deutsch), Japanese (日本語), Chinese (中文), Arabic (العربية), Portuguese (Português), Russian (Русский), Italian (Italiano), Korean (한국어), Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), Turkish (Türkçe), Dutch (Nederlands).
- Natural, fluent phrasing in the selected target language.

### 4. 📊 Structured Results Dashboard
- **Executive Video Overview:** High-level summary of the video's core premise.
- **Main Summary:** Fluid narrative tailored to the chosen summary length.
- **Key Takeaways:** High-impact numbered bullet points with highlight badges.
- **Important Concepts:** Grid of core principles with clear explanations.
- **Demonstrated Examples:** Practical scenarios and case studies from the video.
- **Actionable Insights:** Concrete recommendations viewers can immediately apply.
- **Conclusion:** Wrapping moral or takeaway message.
- **Important Keywords Cloud:** Extracted topic tags.

### 5. 🤖 Interactive "Ask AI About This Video"
- Grounded Q&A chat interface based strictly on the video transcript.
- Answers cite relevant approximate timestamps (e.g. `[02:45]`).
- Pre-made query suggestions for instant one-click analysis.

### 6. ⏱️ Key Timestamps & Embedded Player Seeking
- Automatically extracts chronological video chapters and critical moments.
- **Click-to-Seek Integration:** Clicking any timestamp seeks the embedded player to that exact second.

### 7. 💾 Export, Copy & Persistent History
- **Copy Summary:** Formatted clipboard copy with instant feedback.
- **Download TXT:** Clean plain-text file download.
- **Download PDF:** Professionally formatted A4 PDF report with custom typography, banners, and page numbering.
- **Summary History:** Automatically stored in MongoDB (with seamless fallback to local SQLite database if MongoDB is not running).
- **Search & Restore:** Instant search through past video summaries with 1-click restoration.

### 8. 🛡️ Dual-Engine Architecture
- **Ready Out-of-the-Box:** Includes a built-in deterministic NLP extractive/abstractive summarizer engine that works immediately without requiring an API key.
- **LLM Upgrade:** Plug in a **Google Gemini** or **OpenAI** API key in the UI Settings modal or `.env` to unlock deep generative reasoning and conversational chat.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 19
  - Vite 8
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - Lucide React icons
  - jsPDF for styled PDF report generation
  - Axios for HTTP communication

- **Backend:**
  - Python 3.13 / FastAPI
  - Uvicorn ASGI Server
  - YouTube Transcript API & yt-dlp subtitle extractors
  - PyMongo & SQLite3 hybrid persistence
  - Google Gemini API (`google-genai` & REST) & OpenAI API
  - Pydantic v2 validation

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher) & npm
- Python (v3.10 or higher)
- *(Optional)* MongoDB (TubeSage AI falls back to SQLite automatically if MongoDB is not running)
- *(Optional)* Google Gemini or OpenAI API Key

---

### Step 1: Clone or Navigate to the Project

```bash
cd "c:\Users\Ananya Pandey\Desktop\clipmind AI"
```

---

### Step 2: Set Up Backend

```bash
cd backend

# Install Python dependencies
python -m pip install -r requirements.txt

# (Optional) Copy environment template and configure keys
cp .env.example .env
```

#### Running the Backend:
```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will start at `http://localhost:8000`. You can inspect the interactive OpenAPI documentation at `http://localhost:8000/docs`.

---

### Step 3: Set Up Frontend

Open a new terminal window:

```bash
cd frontend

# Install node dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## ⚙️ Environment Variables Configuration

Create a file named `.env` inside the `backend/` directory (or use `.env.example` as a template):

```ini
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# AI Provider Keys (Optional: Can also be configured directly in the frontend UI)
# Get a free Gemini key at: https://aistudio.google.com/
GEMINI_API_KEY=
# Get an OpenAI key at: https://platform.openai.com/
OPENAI_API_KEY=

# MongoDB Configuration
# Defaults to localhost; if unavailable, SQLite is used automatically at backend/data/tubesage.db
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=tubesage_ai
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, database status & AI provider status |
| `GET` | `/api/languages` | Supported multilingual output languages |
| `GET` | `/api/modes` | Available summary length modes (quick, short, detailed, comprehensive) |
| `POST` | `/api/video-info` | Fetch YouTube video metadata and thumbnail |
| `POST` | `/api/summarize` | Generate structured summary with length & language settings |
| `POST` | `/api/ask` | Ask AI a question grounded in the video's transcript |
| `GET` | `/api/chat-history/{id}` | Retrieve Q&A conversation history for a summary |
| `GET` | `/api/history` | List recent summaries from database |
| `GET` | `/api/history/{id}` | Retrieve full summary record |
| `DELETE` | `/api/history/{id}` | Delete a summary from database |

---

## 🧪 Testing Summary Example

You can test with any caption-enabled YouTube video:
- Mindfulness & Wellness: `https://www.youtube.com/watch?v=inpok4MKVLM`
- Steve Jobs Stanford Commencement: `https://www.youtube.com/watch?v=UF8uR6Z6KLc`
- Veritasium Science & Math: `https://www.youtube.com/watch?v=oxbO_m09s_Q`

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
