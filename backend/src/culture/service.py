"""
Culture Service — Culinary Culture Guide powered by Groq LLM.

Identifies food by name or image, then generates a rich cultural story
personalized to the user's taste profile.
"""

import json
import logging
import os
import base64
from typing import Optional

import httpx

log = logging.getLogger(__name__)

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_VISION_MODEL: str = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def _groq_headers() -> dict:
    return {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }


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
        top_traits = sorted(
            user_taste_profile.items(), key=lambda x: x[1], reverse=True
        )[:5]
        traits_str = ", ".join(f"{k} ({v:.1f})" for k, v in top_traits)
        taste_context = f"""
The user's taste profile (top traits): {traits_str}
Personalize the story: connect the dish to what this user already enjoys. 
For example, if they love spicy food, emphasize the spice elements. If they prefer chill_vibe, mention the atmosphere.
"""

    prompt = f"""You are a culinary culture expert specializing in Vietnamese and Asian food.
Generate a rich, engaging cultural story about the dish: **{food_name}**
{local_name_line}
Language: Write the response in {lang_label}.

{taste_context}

Return a JSON object with this exact structure:
{{
  "food_name": "{food_name}",
  "food_name_local": "Vietnamese name here or null",
  "sections": [
    {{"title": "Origin Story", "content": "2-3 sentences about where this dish originated, its historical context", "icon": "🏛️"}},
    {{"title": "Cultural Significance", "content": "2-3 sentences about what this dish means to the culture, when/why it's eaten", "icon": "🎭"}},
    {{"title": "How Locals Eat It", "content": "2-3 sentences about proper way to eat, common pairings, etiquette", "icon": "🥢"}},
    {{"title": "The Science of Flavor", "content": "2-3 sentences about the flavor profile, key ingredients, what makes it unique", "icon": "🔬"}}
  ],
  "taste_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "pairing_suggestions": ["suggested drink or side dish 1", "suggested 2", "suggested 3"],
  "when_to_eat": "When locals typically eat this (time of day, season, occasion)",
  "fun_fact": "One surprising or interesting fact about this dish"
}}

Rules:
- Be accurate but engaging, like a knowledgeable local friend telling a story
- Keep each section concise (2-3 sentences) but rich in detail
- If the dish is not Vietnamese/Asian, still provide cultural context
- taste_tags should be flavor descriptors (spicy, sour, umami, etc.)
- Only return valid JSON, no markdown fences"""

    body = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 1024,
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
