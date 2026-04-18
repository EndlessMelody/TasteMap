"""
Culture Service — Culinary Culture Guide powered by Groq LLM.

Identifies food by name or image, then generates a rich cultural story
personalized to the user's taste profile.
"""

import json
import logging
import os
import base64
import urllib.parse
from typing import Optional

import httpx
from src.core.config import settings

log = logging.getLogger(__name__)

GROQ_API_KEY: str = settings.GROQ_API_KEY
GROQ_MODEL: str = settings.GROQ_MODEL
GROQ_VISION_MODEL: str = settings.GROQ_VISION_MODEL
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def _groq_headers() -> dict:
    return {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }


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
    Use Groq vision model to identify a dish from an image.
    Returns {"food_name": str, "confidence": float, "food_name_local": str}
    """
    if not GROQ_API_KEY:
        return {"food_name": "Unknown", "confidence": 0.0}

    # Build image content for vision model
    image_content = []
    if image_url:
        image_content = [
            {"type": "text", "text": "Identify the Vietnamese/Asian dish in this image. Return JSON: {\"food_name\": \"English name\", \"food_name_local\": \"Vietnamese name\", \"confidence\": 0.0-1.0}"},
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
            {"type": "text", "text": "Identify the Vietnamese/Asian dish in this image. Return JSON: {\"food_name\": \"English name\", \"food_name_local\": \"Vietnamese name\", \"confidence\": 0.0-1.0}"},
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
            return {
                "food_name": parsed.get("food_name", "Unknown"),
                "food_name_local": parsed.get("food_name_local"),
                "confidence": float(parsed.get("confidence", 0.5)),
            }
    except Exception as exc:
        log.warning(f"[Culture] Vision identification failed: {exc}")
        return {"food_name": "Unknown", "confidence": 0.0}


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
    Generate a rich cultural story about a dish using Groq LLM.
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

    prompt = f"""You are an elite Culinary Historian and Gastronomy Expert specializing in Michelin-level dining analysis.
Your task is to provide a highly professional, factual, and authoritative cultural and culinary analysis of the dish: **{food_name}**
{local_name_line}
Target Output Language: English

{taste_context}
{rag_block}

CRITICAL RULES:
- Ground all facts strictly in the [FACTUAL KNOWLEDGE BASE ENTRY] provided.
- Maintain a highly sophisticated, academic, yet articulate tone (similar to a Michelin guide or an authoritative gastronomy review). Do NOT use conversational fluff, emojis in the text body, or colloquialisms.
- Keep each analytical section dense with expertise, concise (3-4 sentences maximum), but highly detailed. 
- Taste tags must be precise culinary terms (e.g., "umami-rich", "herbaceous", "astringent", "caramelized").
- **API OUTPUT RESTRAINT**: YOU MUST ONLY OUTPUT A RAW, VALID JSON OBJECT. DO NOT ADD ANY PREAMBLE, POSTSCRIPT, OR CONVERSATIONAL TEXT OUTSIDE THE JSON BLOCK.

Return a JSON object with this exact structure:
{{
  "food_name": "{food_name}",
  "food_name_local": "Vietnamese name here or null",
  "sections": [
    {{"title": "Origin Analysis", "content": "Professional analysis of its historical and geographical inception.", "icon": "🏛️"}},
    {{"title": "Cultural Significance", "content": "The sociopolitical or cultural weight this dish carries within the region.", "icon": "🎭"}},
    {{"title": "Gastronomic Etiquette", "content": "Authoritative etiquette, common pairings, and consumption environment.", "icon": "🥢"}},
    {{"title": "The Science of Flavor", "content": "Advanced flavor profile breakdown using precise culinary terminology.", "icon": "🔬"}}
  ],
  "taste_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "pairing_suggestions": ["expert pairing 1", "expert pairing 2", "expert pairing 3"],
  "when_to_eat": "Authoritative context on seasonal or daily timing",
  "fun_fact": "One obscure but historically verified piece of trivia"
}}"""

    body = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
        "max_tokens": 3000,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(GROQ_URL, headers=_groq_headers(), json=body)
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
            "sections": [
                {
                    "title": "Story Unavailable",
                    "content": f"We couldn't generate the cultural story for {food_name} right now. Please try again.",
                    "icon": "⚠️",
                }
            ],
            "taste_tags": [],
            "pairing_suggestions": [],
            "when_to_eat": None,
            "fun_fact": None,
        }
