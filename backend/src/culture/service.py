"""
Culture Service — Culinary Culture Guide powered by an OpenAI-compatible LLM API.

Identifies food by name or image, then generates a rich cultural story
personalized to the user's taste profile.
"""

import json
import logging
import re
import unicodedata
import urllib.parse
from typing import Optional

import httpx
from src.core.config import settings

log = logging.getLogger(__name__)

GROQ_API_KEY: str = settings.GROQ_API_KEY
CULTURE_TEXT_MODEL: str = settings.CULTURE_TEXT_MODEL
GROQ_VISION_MODEL: str = settings.GROQ_VISION_MODEL
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

BANNED_QUERY_TERMS = {
    "weed",
    "marijuana",
    "cannabis",
    "ganja",
    "pot",
    "hash",
    "hashish",
    "joint",
    "blunt",
    "cigarette",
    "cigarettes",
    "cirgarette",
    "tobacco",
    "nicotine",
    "vape",
    "vaping",
    "smoking",
    "thuoc la",
    "thuocla",
    "can sa",
    "cansa",
}

if settings.CULTURE_BANNED_TERMS_EXTRA:
    for raw_term in settings.CULTURE_BANNED_TERMS_EXTRA.split(","):
        term = raw_term.strip().lower()
        if term:
            BANNED_QUERY_TERMS.add(term)

VISION_IDENTIFY_INSTRUCTION = (
    "Identify the main food dish in this image. "
    "If the image shows tobacco, cigarette, vape, cannabis/weed, or non-food items, "
    "set is_banned=true for tobacco/cigarette/vape/cannabis/weed, otherwise false. "
    "If item is banned or non-food, return food_name=Unknown with confidence=0.0. "
    "Return strict JSON only: "
    '{"food_name": "English name", "food_name_local": "Vietnamese name or null", '
    '"confidence": 0.0-1.0, "is_banned": false}'
)


def _groq_headers() -> dict:
    return {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }


def _normalize_policy_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text.lower())
    no_diacritics = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    cleaned = re.sub(r"[^a-z0-9\s]", " ", no_diacritics)
    return re.sub(r"\s+", " ", cleaned).strip()


def contains_banned_content(*texts: Optional[str]) -> tuple[bool, Optional[str]]:
    """
    Check whether any provided text contains blocked topics (weed/cigarette/tobacco).
    Returns (is_blocked, matched_term).
    """
    for raw_text in texts:
        if not raw_text:
            continue

        normalized = _normalize_policy_text(raw_text)
        if not normalized:
            continue

        for term in BANNED_QUERY_TERMS:
            if re.search(rf"\\b{re.escape(term)}\\b", normalized):
                return True, term

    return False, None


async def _fetch_wikipedia_context(food_name: str, language: str = "vi") -> str:
    """
    RAG Retrieval: Fetch the factual summary of the food dish from Wikipedia.
    """
    lang_code = "vi" if language == "vi" else "en"
    search_query = urllib.parse.quote(food_name)
    url = f"https://{lang_code}.wikipedia.org/api/rest_v1/page/summary/{search_query}"
    
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("extract", "")
            
            # Fallback to English if Vietnamese fails
            if language == "vi":
                url_en = f"https://en.wikipedia.org/api/rest_v1/page/summary/{search_query}"
                resp_en = await client.get(url_en)
                if resp_en.status_code == 200:
                    data = resp_en.json()
                    return data.get("extract", "")
    except Exception as exc:
        log.warning(f"[Culture] RAG Wikipedia fetch failed for {food_name}: {exc}")
    
    return ""


async def identify_food_from_image(
    image_url: Optional[str] = None,
    image_base64: Optional[str] = None,
    language: str = "vi",
) -> dict:
    """
    Use the configured vision model to identify a dish from an image.
    Returns {
        "food_name": str,
        "confidence": float,
        "food_name_local": str,
        "is_banned": bool,
    }
    """
    if not GROQ_API_KEY:
        return {"food_name": "Unknown", "confidence": 0.0, "is_banned": False}

    # Build image content for vision model
    image_content = []
    if image_url:
        image_content = [
            {"type": "text", "text": VISION_IDENTIFY_INSTRUCTION},
            {"type": "image_url", "image_url": {"url": image_url}},
        ]
    elif image_base64:
        media_type = "image/jpeg"
        if image_base64.startswith("data:"):
            # Extract media type from data URI
            prefix, data = image_base64.split(",", 1)
            if "png" in prefix:
                media_type = "image/png"
            elif "webp" in prefix:
                media_type = "image/webp"
            image_base64_clean = data
        else:
            image_base64_clean = image_base64

        image_content = [
            {"type": "text", "text": VISION_IDENTIFY_INSTRUCTION},
            {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{image_base64_clean}"}},
        ]

    body = {
        "model": GROQ_VISION_MODEL,
        "messages": [{"role": "user", "content": image_content}],
        "temperature": 0.2,
        "max_tokens": 256,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(GROQ_URL, headers=_groq_headers(), json=body)
            resp.raise_for_status()
            result = resp.json()
            raw = result["choices"][0]["message"]["content"].strip()
            parsed = json.loads(raw)
            is_banned_raw = parsed.get("is_banned", False)
            is_banned = (
                is_banned_raw.strip().lower() in {"1", "true", "yes"}
                if isinstance(is_banned_raw, str)
                else bool(is_banned_raw)
            )
            return {
                "food_name": parsed.get("food_name", "Unknown"),
                "food_name_local": parsed.get("food_name_local"),
                "confidence": float(parsed.get("confidence", 0.5)),
                "is_banned": is_banned,
            }
    except Exception as exc:
        log.warning(f"[Culture] Vision identification failed: {exc}")
        return {"food_name": "Unknown", "confidence": 0.0, "is_banned": False}


def parse_food_vector(vector: list | None) -> dict:
    """
    Extract meaningful traits from the user's food vector (15 dimensions).
    Maps index -> trait name and returns only significant preferences.
    """
    if vector is None or len(vector) != 15:
        return {}

    traits = {
        0: "Spicy food",
        1: "Sweet flavors",
        2: "Salty/Savory flavors",
        3: "Street food style",
        4: "Luxury dining experiences",
        5: "Chill & relaxing vibes",
        6: "Crowded/lively places",
        7: "Romantic atmospheres",
        8: "Family-friendly environments",
        9: "Late-night dining",
    }
    
    preferences = {}
    for i, trait_name in traits.items():
        try:
            score = float(vector[i])
        except (TypeError, ValueError):
            continue
            
        if score >= 0.7:
            preferences[f"Strong preference for {trait_name}"] = score
        elif score <= 0.3:
            preferences[f"Dislikes {trait_name}"] = score
            
    if not preferences and all(0.4 <= float(v) <= 0.6 for v in vector):
        return {"Balanced and versatile tastes": 0.5}

    return preferences

async def generate_culture_story(
    food_name: str,
    food_name_local: Optional[str] = None,
    language: str = "vi",
    user_taste_profile: Optional[dict] = None,
) -> dict:
    """
    Generate a rich cultural story about a dish using the configured text model.
    Personalized based on the user's taste profile if available.
    """

    lang_label = "Vietnamese" if language == "vi" else "English"
    local_name_line = f"Vietnamese name: {food_name_local}" if food_name_local else ""

    taste_context = ""
    if user_taste_profile:
        # If user has a neutral/balanced taste, handle specifically
        if "Balanced and versatile tastes" in user_taste_profile:
            taste_context = """
The user has a balanced, adaptable taste profile.
Personalize the story by emphasizing the harmonious balance of flavors in this dish, and suggest ways they could explore both bold and subtle variations of it!
"""
        else:
            top_traits = sorted(
                user_taste_profile.items(), key=lambda x: x[1], reverse=True
            )[:5]
            traits_str = ", ".join(f"{k} (Score: {v:.1f})" for k, v in top_traits)
            taste_context = f"""
[USER PREFERENCE CONTEXT]
The user requesting this analysis has these primary taste preferences: {traits_str}
Personalize your analysis:
- In "The Science of Flavor", analyze the dish's ingredients explicitly highlighting connections to their preferences.
- In "How Locals Eat It", suggest consumption environments that match their preferred dining vibe.
"""

    # ── RAG RETRIEVAL ──
    rag_context = await _fetch_wikipedia_context(food_name, language)
    rag_block = ""
    if rag_context:
        rag_block = f"""
[FACTUAL KNOWLEDGE BASE ENTRY]
The following is an authoritative encyclopedia excerpt regarding the subject:
"{rag_context}"
Use this context strictly to ensure absolute historical and culinary accuracy in your response. Do not hallucinate history.
"""

    prompt = f"""You are an elite Culinary Historian and Gastronomy Expert specializing in Vietnamese and world cuisine.
Your task is to provide a rich, engaging cultural analysis of the dish: **{food_name}**
{local_name_line}
Target Output Language: English for field names, but content should feel warm and authentic

{taste_context}
{rag_block}

CRITICAL RULES:
- Ground all facts strictly in the [FACTUAL KNOWLEDGE BASE ENTRY] provided.
- Write in a warm, storytelling tone - NOT formal or academic. Like a knowledgeable local friend sharing secrets.
- Generate 4 to 6 insights about this food. Each insight must have a catchy title and detailed "nội dung" (content).
- The insights can cover: origin story, cultural significance, how locals eat it, flavor science, best places to try, preparation secrets, seasonal variations, or any fascinating angle.
- Tags should be evocative descriptors like "🌿 Fresh Herbs", "🔥 Street Food Classic", "☕ Breakfast Essential" - mix emojis with culinary terms.
- **API OUTPUT RESTRAINT**: YOU MUST ONLY OUTPUT A RAW, VALID JSON OBJECT. DO NOT ADD ANY PREAMBLE, POSTSCRIPT, OR CONVERSATIONAL TEXT OUTSIDE THE JSON BLOCK.

Return a JSON object with this exact structure:
{{
  "food_name": "{food_name}",
  "food_name_local": "Vietnamese name here or null",
  "insights": [
    {{
      "title": "Catchy insight title",
      "nội_dung": "Detailed, warm content about this aspect of the dish. Write like you're telling a story to a curious friend. 2-3 sentences."
    }},
    {{
      "title": "Another angle",
      "nội_dung": "More fascinating details..."
    }}
  ],
  "tags": ["🏷️ Descriptive tag 1", "🏷️ Tag 2", "🏷️ Tag 3", "🏷️ Tag 4"],
  "pairing_suggestions": ["pairing 1", "pairing 2", "pairing 3"],
  "when_to_eat": "When people typically enjoy this dish",
  "fun_fact": "One surprising or little-known fact"
}}

IMPORTANT: Generate between 4 and 6 insights. Each must have both "title" and "nội_dung" fields."""

    body = {
        "model": CULTURE_TEXT_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
        "max_tokens": 3000,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(GROQ_URL, headers=_groq_headers(), json=body)
            if not resp.is_success:
                log.error(
                    f"[Culture] Groq returned {resp.status_code} "
                    f"model={CULTURE_TEXT_MODEL} body={resp.text[:400]}"
                )
            resp.raise_for_status()
            result = resp.json()
            raw = result["choices"][0]["message"]["content"].strip()

            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            return json.loads(raw)
    except Exception as exc:
        log.error(f"[Culture] Story generation failed: {exc}")
        # Return a minimal fallback
        return {
            "food_name": food_name,
            "food_name_local": food_name_local,
            "insights": [
                {
                    "title": "Story Unavailable",
                    "nội_dung": f"We couldn't generate the cultural story for {food_name} right now. Please try again.",
                }
            ],
            "tags": [],
            "pairing_suggestions": [],
            "when_to_eat": None,
            "fun_fact": None,
        }
