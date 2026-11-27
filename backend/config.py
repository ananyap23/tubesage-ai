import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory or project root
backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env")
load_dotenv(backend_dir.parent / ".env")

# Server Config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# AI Provider Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# MongoDB Config
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "tubesage_ai")

# SQLite fallback path
DATA_DIR = backend_dir / "data"
DATA_DIR.mkdir(exist_ok=True)
SQLITE_DB_PATH = DATA_DIR / "tubesage.db"

# Supported Summary Lengths
SUMMARY_MODES = {
    "quick": {
        "id": "quick",
        "name": "Quick Summary",
        "badge": "5-7 Bullets",
        "description": "5–7 high-impact bullet points covering only the most essential takeaways.",
        "points": "5-7 key bullets"
    },
    "short": {
        "id": "short",
        "name": "Short Summary",
        "badge": "Concise (2-3 min read)",
        "description": "A punchy, well-rounded summary covering all major concepts and themes.",
        "points": "2-3 concise paragraphs plus 3 key highlights"
    },
    "detailed": {
        "id": "detailed",
        "name": "Detailed Summary",
        "badge": "In-Depth (5-7 min read)",
        "description": "Detailed breakdown of all key topics, explanations, examples, and takeaways.",
        "points": "Comprehensive section-by-section breakdown with examples"
    },
    "comprehensive": {
        "id": "comprehensive",
        "name": "Comprehensive Summary",
        "badge": "Mastery (10+ min read)",
        "description": "An exhaustive, deep-dive architectural brief covering virtually everything in the video.",
        "points": "Full structured guide with timestamps, deep analysis, insights & action steps"
    }
}

# Multilingual Languages List
SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English", "native": "English", "flag": "🇺🇸"},
    {"code": "hi", "name": "Hindi", "native": "हिन्दी", "flag": "🇮🇳"},
    {"code": "es", "name": "Spanish", "native": "Español", "flag": "🇪🇸"},
    {"code": "fr", "name": "French", "native": "Français", "flag": "🇫🇷"},
    {"code": "de", "name": "German", "native": "Deutsch", "flag": "🇩🇪"},
    {"code": "ja", "name": "Japanese", "native": "日本語", "flag": "🇯🇵"},
    {"code": "zh", "name": "Chinese (Simplified)", "native": "简体中文", "flag": "🇨🇳"},
    {"code": "ar", "name": "Arabic", "native": "العربية", "flag": "🇸🇦"},
    {"code": "pt", "name": "Portuguese", "native": "Português", "flag": "🇧🇷"},
    {"code": "ru", "name": "Russian", "native": "Русский", "flag": "🇷🇺"},
    {"code": "it", "name": "Italian", "native": "Italiano", "flag": "🇮🇹"},
    {"code": "ko", "name": "Korean", "native": "한국어", "flag": "🇰🇷"},
    {"code": "bn", "name": "Bengali", "native": "বাংলা", "flag": "🇮🇳"},
    {"code": "ta", "name": "Tamil", "native": "தமிழ்", "flag": "🇮🇳"},
    {"code": "te", "name": "Telugu", "native": "తెలుగు", "flag": "🇮🇳"},
    {"code": "mr", "name": "Marathi", "native": "मराठी", "flag": "🇮🇳"},
    {"code": "tr", "name": "Turkish", "native": "Türkçe", "flag": "🇹🇷"},
    {"code": "nl", "name": "Dutch", "native": "Nederlands", "flag": "🇳🇱"}
]
