import os
import logging
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import (
    HOST,
    PORT,
    DEBUG,
    SUMMARY_MODES,
    SUPPORTED_LANGUAGES,
    GEMINI_API_KEY,
    OPENAI_API_KEY
)
from database import db
from youtube_service import youtube_service
from ai_service import ai_service

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("tubesage.api")

app = FastAPI(
    title="TubeSage AI API",
    description="Smart YouTube Video Summarization & Multilingual Intelligence Engine",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class VideoInfoRequest(BaseModel):
    url: str = Field(..., description="YouTube video URL or video ID")

class SummarizeRequest(BaseModel):
    url: str = Field(..., description="YouTube video URL or video ID")
    mode: str = Field("short", description="Summary mode: quick, short, detailed, comprehensive")
    language: str = Field("en", description="Output language code: en, hi, es, fr, de, ja, zh, etc.")
    force_regenerate: bool = Field(False, description="Whether to bypass cache and regenerate")

class AskQuestionRequest(BaseModel):
    summary_id: str = Field(..., description="ID of the generated summary")
    question: str = Field(..., description="User question about the video")

# Endpoints
@app.get("/api/health")
def get_health():
    db_status = db.get_status()
    return {
        "status": "healthy",
        "service": "TubeSage AI",
        "database": db_status,
        "ai_keys_configured": {
            "gemini": bool(GEMINI_API_KEY),
            "openai": bool(OPENAI_API_KEY)
        }
    }

@app.get("/api/languages")
def get_languages():
    return {"languages": SUPPORTED_LANGUAGES}

@app.get("/api/modes")
def get_modes():
    return {"modes": list(SUMMARY_MODES.values())}

@app.post("/api/video-info")
def fetch_video_info(req: VideoInfoRequest):
    video_id = youtube_service.extract_video_id(req.url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link."
        )

    info = youtube_service.get_video_info(video_id)
    return info

@app.post("/api/summarize")
def generate_summary(
    req: SummarizeRequest,
    x_gemini_api_key: Optional[str] = Header(None),
    x_openai_api_key: Optional[str] = Header(None)
):
    video_id = youtube_service.extract_video_id(req.url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please check the link and try again."
        )

    if req.mode not in SUMMARY_MODES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid summary mode '{req.mode}'. Choose from: {list(SUMMARY_MODES.keys())}"
        )

    # Check cache first if not force_regenerate
    if not req.force_regenerate:
        cached = db.get_summary_by_video_and_settings(video_id, req.mode, req.language)
        if cached:
            logger.info("Returning cached summary for %s (mode=%s, lang=%s)", video_id, req.mode, req.language)
            return cached

    # 1. Fetch metadata
    info = youtube_service.get_video_info(video_id)

    # 2. Fetch transcript
    try:
        segments, full_text = youtube_service.get_transcript(video_id, preferred_lang=req.language)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error("Transcript retrieval error: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract transcript: {str(e)}"
        )

    # 3. Generate structured AI summary
    try:
        ai_result = ai_service.generate_summary(
            video_title=info["title"],
            channel=info["channel"],
            segments=segments,
            full_text=full_text,
            mode=req.mode,
            language=req.language,
            custom_gemini_key=x_gemini_api_key,
            custom_openai_key=x_openai_api_key
        )
    except Exception as e:
        logger.error("AI summarization failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"AI Summarization encountered an error: {str(e)}"
        )

    # Calculate duration from segments if not set
    duration = info.get("duration", 0)
    duration_formatted = info.get("duration_formatted", "--:--")
    if (not duration or duration == 0) and segments:
        last_seg = segments[-1]
        calc_duration = int(last_seg.get("start", 0) + last_seg.get("duration", 0))
        if calc_duration > 0:
            duration = calc_duration
            duration_formatted = youtube_service.format_timestamp(duration)

    # 4. Construct complete response payload
    summary_record = {
        "video_id": video_id,
        "url": info["url"],
        "title": info["title"],
        "channel": info["channel"],
        "duration": duration,
        "duration_formatted": duration_formatted,
        "thumbnail": info["thumbnail"],
        "embed_url": info["embed_url"],
        "mode": req.mode,
        "language": req.language,
        "overview": ai_result.get("overview", ""),
        "main_summary": ai_result.get("main_summary", ""),
        "key_takeaways": ai_result.get("key_takeaways", []),
        "important_concepts": ai_result.get("important_concepts", []),
        "important_examples": ai_result.get("important_examples", []),
        "actionable_insights": ai_result.get("actionable_insights", []),
        "conclusion": ai_result.get("conclusion", ""),
        "keywords": ai_result.get("keywords", []),
        "timestamps": ai_result.get("timestamps", []),
        "provider": ai_result.get("provider", "TubeSage AI"),
        "transcript_segment_count": len(segments),
        "transcript_segments": segments[:100], # Keep top segments for frontend display
        "raw_transcript_preview": full_text[:2000]
    }

    # 5. Save to database
    record_id = db.save_summary(summary_record)
    summary_record["id"] = record_id

    return summary_record

@app.post("/api/ask")
def ask_question(
    req: AskQuestionRequest,
    x_gemini_api_key: Optional[str] = Header(None),
    x_openai_api_key: Optional[str] = Header(None)
):
    summary = db.get_summary(req.summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found.")

    video_id = summary.get("video_id")
    title = summary.get("title", "Video")

    # Fetch segments
    try:
        segments, full_text = youtube_service.get_transcript(video_id, preferred_lang=summary.get("language", "en"))
    except Exception:
        # Fallback to stored segments if transcript fetch fails
        segments = summary.get("transcript_segments", [])
        full_text = summary.get("raw_transcript_preview", "")

    # Save user message
    db.save_chat_message(req.summary_id, video_id, "user", req.question)

    # Answer question
    answer_res = ai_service.answer_question(
        video_title=title,
        question=req.question,
        segments=segments,
        full_text=full_text,
        custom_gemini_key=x_gemini_api_key,
        custom_openai_key=x_openai_api_key
    )

    # Save assistant message
    db.save_chat_message(req.summary_id, video_id, "assistant", answer_res["answer"])

    return {
        "answer": answer_res["answer"],
        "provider": answer_res.get("provider", "TubeSage AI"),
        "summary_id": req.summary_id
    }

@app.get("/api/chat-history/{summary_id}")
def get_chat_history(summary_id: str):
    history = db.get_chat_history(summary_id)
    return {"history": history}

@app.get("/api/history")
def list_history(limit: int = Query(30, ge=1, le=100)):
    items = db.list_summaries(limit=limit)
    return {"items": items}

@app.get("/api/history/{summary_id}")
def get_history_item(summary_id: str):
    item = db.get_summary(summary_id)
    if not item:
        raise HTTPException(status_code=404, detail="Summary not found.")
    return item

@app.delete("/api/history/{summary_id}")
def delete_history_item(summary_id: str):
    success = db.delete_summary(summary_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found or already deleted.")
    return {"success": True, "id": summary_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=HOST, port=PORT, reload=DEBUG)
