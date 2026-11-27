import re
import urllib.parse
import json
import logging
import requests
from typing import Dict, Any, List, Optional, Tuple
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
    YouTubeTranscriptApiException
)

logger = logging.getLogger("tubesage.youtube")

class YouTubeService:
    @staticmethod
    def extract_video_id(url_or_id: str) -> Optional[str]:
        if not url_or_id:
            return None
        text = url_or_id.strip()

        # If it's already an 11-character video id
        if re.match(r'^[a-zA-Z0-9_-]{11}$', text):
            return text

        # Regex patterns for various YouTube URLs
        patterns = [
            r'(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})'
        ]

        for p in patterns:
            match = re.search(p, text)
            if match:
                return match.group(1)

        # Fallback to query parameter parsing
        try:
            parsed = urllib.parse.urlparse(text)
            qs = urllib.parse.parse_qs(parsed.query)
            if 'v' in qs and len(qs['v'][0]) == 11:
                return qs['v'][0]
        except Exception:
            pass

        return None

    @staticmethod
    def format_timestamp(seconds: float) -> str:
        s = int(seconds)
        hours = s // 3600
        minutes = (s % 3600) // 60
        secs = s % 60
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        return f"{minutes:02d}:{secs:02d}"

    @classmethod
    def get_video_info(cls, video_id: str) -> Dict[str, Any]:
        """Fetch video metadata using YouTube oEmbed or yt-dlp fallback"""
        url = f"https://www.youtube.com/watch?v={video_id}"
        title = f"YouTube Video ({video_id})"
        author = "YouTube Creator"
        thumbnail = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        duration = 0

        # Method 1: YouTube oEmbed API (extremely fast and lightweight)
        try:
            oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
            resp = requests.get(oembed_url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                title = data.get("title", title)
                author = data.get("author_name", author)
                if data.get("thumbnail_url"):
                    thumbnail = data.get("thumbnail_url")
        except Exception as e:
            logger.warning("oEmbed request failed: %s", e)

        # Method 2: Use yt-dlp to obtain accurate duration and high-res metadata
        try:
            import yt_dlp
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
                'extract_flat': True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if info:
                    if info.get('title'):
                        title = info['title']
                    if info.get('uploader') or info.get('channel'):
                        author = info.get('uploader') or info.get('channel')
                    if info.get('duration'):
                        duration = int(info['duration'])
                    if info.get('thumbnail'):
                        thumbnail = info['thumbnail']
        except Exception as e:
            logger.warning("yt-dlp metadata extraction failed: %s", e)

        return {
            "video_id": video_id,
            "url": url,
            "title": title,
            "channel": author,
            "duration": duration,
            "duration_formatted": cls.format_timestamp(duration) if duration else "--:--",
            "thumbnail": thumbnail,
            "embed_url": f"https://www.youtube.com/embed/{video_id}?autoplay=0"
        }

    @classmethod
    def get_transcript(cls, video_id: str, preferred_lang: str = "en") -> Tuple[List[Dict[str, Any]], str]:
        """
        Retrieves transcript segments and full raw text.
        Returns: (segments, full_text)
        Raises: ValueError with actionable description if captions are unavailable.
        """
        segments = []
        full_text_list = []

        # Attempt 1: Using youtube-transcript-api v1.x instance
        try:
            api = YouTubeTranscriptApi()
            transcript = None

            try:
                transcript_list = api.list(video_id)

                # 1. Try finding requested language
                if preferred_lang:
                    try:
                        transcript = transcript_list.find_transcript([preferred_lang])
                    except Exception:
                        pass

                # 2. Try finding English variants
                if not transcript:
                    try:
                        transcript = transcript_list.find_transcript(['en', 'en-US', 'en-GB'])
                    except Exception:
                        pass

                # 3. Try any manually created transcript
                if not transcript:
                    try:
                        manuals = list(transcript_list._manually_created_transcripts.values())
                        if manuals:
                            transcript = manuals[0]
                    except Exception:
                        pass

                # 4. Try any generated transcript
                if not transcript:
                    try:
                        generated = list(transcript_list._generated_transcripts.values())
                        if generated:
                            transcript = generated[0]
                    except Exception:
                        pass

                # 5. Fallback: if transcript found and user wants translation
                if transcript and preferred_lang and preferred_lang != "en":
                    try:
                        if hasattr(transcript, 'is_translatable') and transcript.is_translatable:
                            transcript = transcript.translate(preferred_lang)
                    except Exception:
                        pass

            except Exception as e:
                logger.info("api.list failed (%s), trying direct api.fetch...", e)
                try:
                    raw_data = api.fetch(video_id, languages=[preferred_lang, 'en', 'en-US'])
                    for item in raw_data:
                        t_text = getattr(item, 'text', '') if hasattr(item, 'text') else item.get('text', '')
                        t_start = getattr(item, 'start', 0.0) if hasattr(item, 'start') else item.get('start', 0.0)
                        t_dur = getattr(item, 'duration', 0.0) if hasattr(item, 'duration') else item.get('duration', 0.0)
                        clean = t_text.replace('\n', ' ').strip()
                        if clean:
                            segments.append({
                                "start": round(float(t_start), 2),
                                "duration": round(float(t_dur), 2),
                                "timestamp": cls.format_timestamp(float(t_start)),
                                "text": clean
                            })
                            full_text_list.append(clean)
                    if segments:
                        return segments, " ".join(full_text_list)
                except Exception as ex2:
                    logger.info("Direct api.fetch failed: %s", ex2)

            if transcript:
                raw_data = transcript.fetch()
                for item in raw_data:
                    t_text = getattr(item, 'text', '') if hasattr(item, 'text') else item.get('text', '')
                    t_start = getattr(item, 'start', 0.0) if hasattr(item, 'start') else item.get('start', 0.0)
                    t_dur = getattr(item, 'duration', 0.0) if hasattr(item, 'duration') else item.get('duration', 0.0)
                    clean = t_text.replace('\n', ' ').strip()
                    if clean:
                        segments.append({
                            "start": round(float(t_start), 2),
                            "duration": round(float(t_dur), 2),
                            "timestamp": cls.format_timestamp(float(t_start)),
                            "text": clean
                        })
                        full_text_list.append(clean)

                if segments:
                    full_text = " ".join(full_text_list)
                    logger.info("Successfully fetched %d transcript segments for %s via youtube-transcript-api", len(segments), video_id)
                    return segments, full_text

        except (TranscriptsDisabled, NoTranscriptFound) as e:
            logger.info("youtube-transcript-api reported no transcript: %s. Trying yt-dlp fallback...", e)
        except VideoUnavailable:
            raise ValueError("This YouTube video is private, removed, or unavailable.")
        except YouTubeTranscriptApiException as e:
            logger.warning("YouTube transcript API error (%s). Attempting yt-dlp fallback...", e)
        except Exception as e:
            logger.warning("youtube-transcript-api exception: %s. Attempting yt-dlp fallback...", e)

        # Attempt 2: Fallback to yt-dlp subtitle extraction
        try:
            import yt_dlp
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': ['en', preferred_lang, 'en-orig'],
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
                subtitles = info.get('subtitles') or info.get('automatic_captions') or {}

                selected_sub_url = None
                # Check for preferred language or english
                for lang_key in [preferred_lang, 'en', 'en-US', 'en-orig']:
                    if lang_key in subtitles:
                        formats = subtitles[lang_key]
                        # Look for json3 or vtt format
                        for fmt in formats:
                            if fmt.get('ext') in ['json3', 'vtt']:
                                selected_sub_url = fmt.get('url')
                                break
                        if selected_sub_url:
                            break

                # If still not found, pick first available language
                if not selected_sub_url and subtitles:
                    first_lang = next(iter(subtitles.values()))
                    if first_lang and len(first_lang) > 0:
                        selected_sub_url = first_lang[0].get('url')

                if selected_sub_url:
                    sub_resp = requests.get(selected_sub_url, timeout=10)
                    if sub_resp.status_code == 200:
                        content = sub_resp.text
                        # If JSON3 format
                        if "events" in content:
                            json_data = sub_resp.json()
                            events = json_data.get("events", [])
                            for ev in events:
                                seg_list = ev.get("segs", [])
                                seg_text = "".join([s.get("utf8", "") for s in seg_list]).strip()
                                t_start = ev.get("tStartMs", 0) / 1000.0
                                t_dur = ev.get("dDurationMs", 0) / 1000.0
                                if seg_text and seg_text != "\n":
                                    segments.append({
                                        "start": round(t_start, 2),
                                        "duration": round(t_dur, 2),
                                        "timestamp": cls.format_timestamp(t_start),
                                        "text": seg_text.replace('\n', ' ')
                                    })
                                    full_text_list.append(seg_text)
                        # If WebVTT format
                        elif "WEBVTT" in content:
                            vtt_lines = content.splitlines()
                            current_time = 0.0
                            for line in vtt_lines:
                                time_match = re.search(r'(\d{2}):(\d{2}):(\d{2})\.(\d{3}) -->', line) or re.search(r'(\d{2}):(\d{2})\.(\d{3}) -->', line)
                                if time_match:
                                    groups = time_match.groups()
                                    if len(groups) == 4:
                                        current_time = int(groups[0]) * 3600 + int(groups[1]) * 60 + int(groups[2]) + int(groups[3]) / 1000.0
                                    elif len(groups) == 3:
                                        current_time = int(groups[0]) * 60 + int(groups[1]) + int(groups[2]) / 1000.0
                                elif line.strip() and not line.startswith("WEBVTT") and not line.startswith("NOTE") and not "-->" in line:
                                    clean_line = re.sub(r'<[^>]+>', '', line).strip()
                                    if clean_line:
                                        segments.append({
                                            "start": round(current_time, 2),
                                            "duration": 3.0,
                                            "timestamp": cls.format_timestamp(current_time),
                                            "text": clean_line
                                        })
                                        full_text_list.append(clean_line)

                        if segments:
                            full_text = " ".join(full_text_list)
                            logger.info("Successfully fetched %d transcript segments via yt-dlp", len(segments))
                            return segments, full_text

        except Exception as e:
            logger.warning("yt-dlp subtitle download failed: %s", e)

        # If both methods exhausted and no transcripts found:
        raise ValueError(
            "No transcript or captions found for this video. "
            "TubeSage AI only works on videos with available captions (manual or auto-generated) "
            "to ensure 100% accurate, hallucination-free summaries."
        )

youtube_service = YouTubeService()
