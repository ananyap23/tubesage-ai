import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from config import GEMINI_API_KEY, OPENAI_API_KEY, SUMMARY_MODES, SUPPORTED_LANGUAGES

logger = logging.getLogger("tubesage.ai")

class AIService:
    def __init__(self):
        self.gemini_key = GEMINI_API_KEY
        self.openai_key = OPENAI_API_KEY

    def _get_language_name(self, lang_code: str) -> str:
        for lang in SUPPORTED_LANGUAGES:
            if lang["code"] == lang_code:
                return f"{lang['name']} ({lang['native']})"
        return "English"

    def _build_summary_prompt(
        self,
        video_title: str,
        channel: str,
        transcript_text: str,
        mode: str,
        language_code: str
    ) -> str:
        lang_name = self._get_language_name(language_code)
        mode_info = SUMMARY_MODES.get(mode, SUMMARY_MODES["short"])

        prompt = f"""
You are TubeSage AI, an elite, professional video intelligence and summarization system.
Your mission is to generate a pristine, structured, high-value summary of the following YouTube video.

Video Title: "{video_title}"
Channel / Author: "{channel}"
Target Summary Mode: {mode_info['name']} ({mode_info['badge']})
Target Output Language: {lang_name}

CRITICAL RULES:
1. STRICT LANGUAGE REQUIREMENT: You MUST write the ENTIRE output (all explanations, bullets, titles, conclusions) in {lang_name}. If the video was spoken in English and {lang_name} is requested (e.g. Hindi, Spanish, French, German, etc.), output 100% natural, fluent {lang_name}.
2. ACCURACY: Base your summary strictly on the factual content of the provided transcript. Do not fabricate or hallucinate.
3. STRUCTURE: Return a valid JSON object matching the exact schema below.

JSON OUTPUT SCHEMA:
{{
  "overview": "A 2-3 sentence high-level executive summary of the video's core premise and target audience.",
  "main_summary": "The primary narrative summary formatted appropriately for the '{mode}' mode.",
  "key_takeaways": [
    "High-impact bullet point 1",
    "High-impact bullet point 2",
    "High-impact bullet point 3"
  ],
  "important_concepts": [
    {{
      "concept": "Concept Name",
      "explanation": "Clear, informative explanation of this concept as discussed in the video."
    }}
  ],
  "important_examples": [
    "Specific case study, story, or practical demonstration mentioned in the video (omit or leave empty if not applicable)."
  ],
  "actionable_insights": [
    "Practical action step or recommendation the viewer can immediately implement."
  ],
  "conclusion": "Final wrapping thought, key moral, or takeaway message from the video.",
  "keywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4", "Keyword5", "Keyword6"],
  "timestamps": [
    {{
      "time": "00:00",
      "seconds": 0,
      "title": "Topic or Chapter Title",
      "summary": "Brief note on what happens here"
    }}
  ]
}}

SUMMARY MODE SPECIFICS:
- Quick Mode: Keep 'main_summary' brief (1 short paragraph), provide exactly 5 to 7 sharp 'key_takeaways', 2-3 important concepts, and top timestamps.
- Short Mode: Balanced 2-3 paragraph 'main_summary', 5 key takeaways, 3-4 concepts, 2-3 examples/insights.
- Detailed Mode: Thorough 'main_summary' (multiple detailed sections), 6-8 takeaways, 5+ concepts with in-depth explanations, all concrete examples, comprehensive actionable insights.
- Comprehensive Mode: Exhaustive deep-dive 'main_summary' detailing all subtleties, extensive concepts, case studies, step-by-step methodologies, full timestamp guide, and profound conclusion.

VIDEO TRANSCRIPT:
\"\"\"
{transcript_text[:40000]}
\"\"\"

Return ONLY the raw JSON object. Do not include markdown code block ticks (```json ... ```) or any preamble or postscript.
"""
        return prompt

    def generate_summary(
        self,
        video_title: str,
        channel: str,
        segments: List[Dict[str, Any]],
        full_text: str,
        mode: str = "short",
        language: str = "en",
        custom_gemini_key: Optional[str] = None,
        custom_openai_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates structured summary using Gemini, OpenAI, or smart native analyzer.
        """
        gemini_key = custom_gemini_key or self.gemini_key or os.getenv("GEMINI_API_KEY", "")
        openai_key = custom_openai_key or self.openai_key or os.getenv("OPENAI_API_KEY", "")

        prompt = self._build_summary_prompt(video_title, channel, full_text, mode, language)

        # 1. Attempt Gemini if key present
        if gemini_key:
            try:
                logger.info("Generating summary via Google Gemini API...")
                result = self._call_gemini(prompt, gemini_key)
                if result:
                    result["provider"] = "Google Gemini AI"
                    return result
            except Exception as e:
                logger.warning("Gemini generation failed: %s. Attempting next provider...", e)

        # 2. Attempt OpenAI if key present
        if openai_key:
            try:
                logger.info("Generating summary via OpenAI API...")
                result = self._call_openai(prompt, openai_key)
                if result:
                    result["provider"] = "OpenAI GPT"
                    return result
            except Exception as e:
                logger.warning("OpenAI generation failed: %s. Attempting next provider...", e)

        # 3. Smart Native NLP Extractive/Abstractive Summarizer Engine
        logger.info("Using Built-in Smart NLP Summarizer Engine...")
        result = self._native_smart_summarize(
            video_title=video_title,
            channel=channel,
            segments=segments,
            full_text=full_text,
            mode=mode,
            language=language
        )
        result["provider"] = "TubeSage Native Intelligence"
        return result

    def _call_gemini(self, prompt: str, api_key: str) -> Optional[Dict[str, Any]]:
        # Using Google Gemini REST API for maximum speed and compatibility
        models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "responseMimeType": "application/json"
                }
            }
            try:
                with httpx.Client(timeout=60.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            return self._clean_json(raw_text)
                    else:
                        logger.warning("Gemini %s responded with status %d: %s", model, resp.status_code, resp.text[:200])
            except Exception as e:
                logger.warning("Gemini request error on %s: %s", model, e)
        return None

    def _call_openai(self, prompt: str, api_key: str) -> Optional[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are TubeSage AI, a specialized video summarization API that outputs only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }
        try:
            with httpx.Client(timeout=60.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data["choices"][0]["message"]["content"]
                    return self._clean_json(raw_text)
                else:
                    logger.warning("OpenAI returned status %d: %s", resp.status_code, resp.text[:200])
        except Exception as e:
            logger.warning("OpenAI request error: %s", e)
        return None

    def _clean_json(self, raw: str) -> Dict[str, Any]:
        text = raw.strip()
        # Remove markdown code ticks if model still enclosed them
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        return json.loads(text)

    def _native_smart_summarize(
        self,
        video_title: str,
        channel: str,
        segments: List[Dict[str, Any]],
        full_text: str,
        mode: str,
        language: str
    ) -> Dict[str, Any]:
        """
        A robust, deterministic NLP summarizer that evaluates sentence salience,
        extracts key timestamps and concepts directly from transcript segments.
        Ensures the application works cleanly even before API keys are added.
        """
        import math
        from collections import Counter

        # Clean noise like [Music], [Applause]
        clean_full_text = re.sub(r'\[.*?\]', '', full_text).strip()

        # Build sentences from punctuation or by aggregating transcript segments
        raw_sentences = re.split(r'(?<=[.!?])\s+', clean_full_text)
        sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 25]

        # If transcript lacks punctuation, aggregate every 3-4 clean segments
        if len(sentences) < 10 and segments:
            grouped = []
            buf = []
            for seg in segments:
                txt = re.sub(r'\[.*?\]', '', seg.get('text', '')).strip()
                if txt:
                    buf.append(txt)
                    if len(buf) >= 3:
                        sentence_cand = " ".join(buf).capitalize()
                        grouped.append(sentence_cand)
                        buf = []
            if buf:
                grouped.append(" ".join(buf).capitalize())
            if len(grouped) > len(sentences):
                sentences = grouped

        if not sentences:
            sentences = [f"Discussion regarding {video_title} presented by {channel}."]

        # Token frequency for scoring
        words = re.findall(r'\b[a-zA-Z]{4,}\b', clean_full_text.lower())
        stopwords = {
            'this', 'that', 'with', 'from', 'have', 'were', 'which', 'their', 'there',
            'about', 'would', 'could', 'should', 'these', 'those', 'going', 'really',
            'people', 'thing', 'things', 'know', 'think', 'just', 'like', 'video',
            'today', 'right', 'here', 'when', 'what', 'then', 'some', 'more', 'also',
            'music', 'applause', 'want', 'come', 'make', 'well', 'much', 'very'
        }
        filtered_words = [w for w in words if w not in stopwords]
        word_counts = Counter(filtered_words)

        # Score sentences based on term density and position
        scored_sentences = []
        for idx, s in enumerate(sentences):
            s_words = re.findall(r'\b[a-zA-Z]{4,}\b', s.lower())
            score = sum(word_counts.get(w, 0) for w in s_words)
            if len(s_words) > 0:
                score = score / math.sqrt(len(s_words))
            # Boost early sentences and title match
            if idx < 5:
                score *= 1.3
            for title_word in re.findall(r'\b[a-zA-Z]{4,}\b', video_title.lower()):
                if title_word in s.lower():
                    score *= 1.4
            scored_sentences.append((score, idx, s))

        # Sort by score
        ranked_sentences = sorted(scored_sentences, key=lambda x: x[0], reverse=True)

        # Mode configurations
        if mode == "quick":
            target_takeaways = 6
            n_paras = 1
        elif mode == "short":
            target_takeaways = 5
            n_paras = 2
        elif mode == "detailed":
            target_takeaways = 7
            n_paras = 4
        else: # comprehensive
            target_takeaways = 9
            n_paras = 6

        # Pick takeaways
        num_to_pick = min(len(ranked_sentences), target_takeaways)
        top_takeaway_tuples = sorted(ranked_sentences[:num_to_pick], key=lambda x: x[1])
        key_takeaways = [t[2] for t in top_takeaway_tuples]

        # If still fewer than target, pad with remaining sentences
        remaining = [s[2] for s in ranked_sentences[num_to_pick:]]
        while len(key_takeaways) < target_takeaways and remaining:
            key_takeaways.append(remaining.pop(0))

        # Main summary paragraphs
        summary_sentences = sorted(ranked_sentences[num_to_pick:num_to_pick + (n_paras * 3)], key=lambda x: x[1])
        summary_paras = []
        chunk_size = 3
        for i in range(0, len(summary_sentences), chunk_size):
            chunk = " ".join([s[2] for s in summary_sentences[i:i + chunk_size]])
            if chunk:
                summary_paras.append(chunk)

        if not summary_paras:
            summary_paras = [" ".join(key_takeaways[:3])]

        main_summary = "\n\n".join(summary_paras)

        # Top keywords
        top_keywords = [w.capitalize() for w, _ in word_counts.most_common(12)]
        if not top_keywords:
            top_keywords = ["Overview", "Insights", "Key Concepts", "Analysis"]

        # Extract timestamps across segments
        clean_segments = [s for s in segments if not re.match(r'^\[.*?\]$', s.get('text', '').strip())]
        if not clean_segments:
            clean_segments = segments

        timestamps = []
        if clean_segments:
            step = max(1, len(clean_segments) // 7)
            for i in range(0, len(clean_segments), step):
                seg = clean_segments[i]
                txt = seg.get('text', '').strip()
                if txt:
                    short_title = txt if len(txt) <= 45 else txt[:45] + "..."
                    timestamps.append({
                        "time": seg.get("timestamp", "00:00"),
                        "seconds": int(seg.get("start", 0)),
                        "title": f"Key Moment: {short_title}",
                        "summary": txt
                    })

        # Important Concepts extraction
        concepts = []
        for kw in top_keywords[:5]:
            matching_s = next((s for s in sentences if kw.lower() in s.lower()), None)
            if matching_s:
                concepts.append({
                    "concept": kw,
                    "explanation": matching_s
                })

        kw_display = ', '.join(top_keywords[:3]) if top_keywords else 'the subject matter'
        overview = f"In this video, '{video_title}' by {channel}, key concepts, techniques, and core principles surrounding {kw_display} are broken down for practical understanding."

        conclusion = f"To conclude, '{video_title}' offers a focused look into {kw_display}. Applying these principles will help viewers retain the core methodologies and achieve optimal outcomes."

        result = {
            "overview": overview,
            "main_summary": main_summary,
            "key_takeaways": key_takeaways,
            "important_concepts": concepts,
            "important_examples": [
                f"Practical illustration explaining '{top_keywords[0]}' as demonstrated in the video walkthrough.",
                f"Key scenario detailing how {channel} applies the core strategies in everyday practice."
            ],
            "actionable_insights": [
                f"Adopt the core principles of {top_keywords[0]} in your current workflow.",
                f"Refer to the key timestamps to re-examine critical demonstrations and explanations.",
                "Consistently review the main takeaways to reinforce understanding and practical mastery."
            ],
            "conclusion": conclusion,
            "keywords": top_keywords[:8],
            "timestamps": timestamps[:6]
        }
        return result

    def answer_question(
        self,
        video_title: str,
        question: str,
        segments: List[Dict[str, Any]],
        full_text: str,
        custom_gemini_key: Optional[str] = None,
        custom_openai_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Answers a user question grounded in the video's transcript.
        """
        gemini_key = custom_gemini_key or self.gemini_key or os.getenv("GEMINI_API_KEY", "")
        openai_key = custom_openai_key or self.openai_key or os.getenv("OPENAI_API_KEY", "")

        # Format transcript excerpts with timestamp indicators
        formatted_segments = []
        for s in segments[:150]:  # Up to first 150 segments
            formatted_segments.append(f"[{s.get('timestamp', '00:00')}] {s.get('text', '')}")
        context = "\n".join(formatted_segments)

        prompt = f"""
You are TubeSage AI assistant. Answer the user's question accurately using ONLY the video transcript below.
If the answer is discussed, explain it clearly and cite the approximate timestamp marker in your answer (e.g. "[03:45]").
If the video does not mention the topic, politely clarify that the video does not cover it.

Video Title: "{video_title}"
User Question: "{question}"

VIDEO TRANSCRIPT WITH TIMESTAMPS:
\"\"\"
{context[:35000]}
\"\"\"

Provide a well-structured, helpful, concise answer. Include timestamp citations where appropriate.
"""

        # 1. Gemini
        if gemini_key:
            try:
                models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
                for model in models_to_try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
                    payload = {"contents": [{"parts": [{"text": prompt}]}]}
                    with httpx.Client(timeout=30.0) as client:
                        resp = client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            ans = data["candidates"][0]["content"]["parts"][0]["text"]
                            return {"answer": ans, "provider": "Google Gemini"}
            except Exception as e:
                logger.warning("Gemini Q&A error: %s", e)

        # 2. OpenAI
        if openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {openai_key}"}
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You are TubeSage AI assistant."},
                        {"role": "user", "content": prompt}
                    ]
                }
                with httpx.Client(timeout=30.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        ans = data["choices"][0]["message"]["content"]
                        return {"answer": ans, "provider": "OpenAI"}
            except Exception as e:
                logger.warning("OpenAI Q&A error: %s", e)

        # 3. Native keyword-based search & answer
        q_words = [w.lower() for w in re.findall(r'\b[a-zA-Z]{3,}\b', question) if w.lower() not in {'what', 'when', 'where', 'which', 'video', 'does', 'about'}]
        matched_segments = []
        for seg in segments:
            seg_text = seg.get("text", "").lower()
            match_count = sum(1 for w in q_words if w in seg_text)
            if match_count > 0:
                matched_segments.append((match_count, seg))

        matched_segments.sort(key=lambda x: x[0], reverse=True)
        if matched_segments:
            best = matched_segments[:3]
            citations = [f"[{b[1].get('timestamp', '00:00')}] \"{b[1].get('text')}\"" for b in best]
            ans = f"Based on the video transcript, relevant discussion occurs at:\n\n" + "\n\n".join(citations) + f"\n\nAdd your Gemini or OpenAI API key in Settings for full natural conversational answers!"
            return {"answer": ans, "provider": "TubeSage Native Search"}
        else:
            return {
                "answer": f"I couldn't find a direct mention of that topic in the video transcript. Try asking about the main concepts highlighted in the summary, or add an API key for deeper semantic reasoning.",
                "provider": "TubeSage Native Search"
            }

ai_service = AIService()
